import { NextRequest, NextResponse } from "next/server";
import type { ChatMessage } from "@/lib/chat-types";
import { recommendFromConversation } from "@/lib/recommend";

// Keep the payload small and bounded.
const MAX_MESSAGES = 20;
const MAX_CONTENT_LENGTH = 1000;

// Best-effort in-memory rate limit (per IP). Note: in serverless/multi-instance
// deployments this is per-instance only; swap for a shared store (e.g. Upstash)
// if you need strict global limits.
const RATE_LIMIT = 20; // requests
const RATE_WINDOW_MS = 60_000; // per minute
const hits = new Map<string, { count: number; resetAt: number }>();

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = hits.get(ip);
  if (!entry || now > entry.resetAt) {
    hits.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return false;
  }
  entry.count += 1;
  return entry.count > RATE_LIMIT;
}

function sanitizeMessages(input: unknown): ChatMessage[] | null {
  if (!Array.isArray(input)) return null;
  const messages: ChatMessage[] = [];
  for (const raw of input.slice(-MAX_MESSAGES)) {
    if (!raw || typeof raw !== "object") continue;
    const role = (raw as ChatMessage).role;
    const content = (raw as ChatMessage).content;
    if ((role !== "user" && role !== "assistant") || typeof content !== "string") continue;
    const trimmed = content.trim().slice(0, MAX_CONTENT_LENGTH);
    if (trimmed) messages.push({ role, content: trimmed });
  }
  return messages.length ? messages : null;
}

export async function POST(request: NextRequest) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown";

  if (rateLimited(ip)) {
    return NextResponse.json(
      { error: "Too many requests. Please slow down and try again shortly." },
      { status: 429 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const messages = sanitizeMessages((body as { messages?: unknown })?.messages);
  if (!messages) {
    return NextResponse.json(
      { error: "Provide a non-empty 'messages' array." },
      { status: 400 },
    );
  }

  // The last message must come from the user to respond to.
  if (messages[messages.length - 1].role !== "user") {
    return NextResponse.json(
      { error: "The last message must be from the user." },
      { status: 400 },
    );
  }

  try {
    const result = await recommendFromConversation(messages);
    return NextResponse.json(result);
  } catch {
    return NextResponse.json(
      { error: "Something went wrong generating recommendations." },
      { status: 500 },
    );
  }
}
