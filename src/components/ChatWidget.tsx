"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { ChatMessage, ChatResponse, RecommendationItem } from "@/lib/chat-types";
import { cn, truncate } from "@/lib/utils";
import { Poster } from "@/components/Poster";
import { RatingBadge } from "@/components/RatingBadge";

interface DisplayMessage extends ChatMessage {
  items?: RecommendationItem[];
}

const GREETING: DisplayMessage = {
  role: "assistant",
  content:
    "Hi! I'm Reel, your CineQueue guide. Tell me a mood, a favorite film, or a genre and I'll recommend something to watch.",
};

const SUGGESTIONS = [
  "Something like Inception",
  "Cozy feel-good comedies",
  "Best sci-fi series",
  "A thriller for tonight",
];

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<DisplayMessage[]>([GREETING]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to the newest message.
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  // Focus the input when the panel opens.
  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  // Close on Escape.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const send = async (text: string) => {
    const content = text.trim();
    if (!content || loading) return;

    setError(null);
    setInput("");

    const nextMessages: DisplayMessage[] = [...messages, { role: "user", content }];
    setMessages(nextMessages);
    setLoading(true);

    try {
      // Send only role/content (strip UI-only fields).
      const payload = nextMessages.map(({ role, content }) => ({ role, content }));
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: payload }),
      });

      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as { error?: string } | null;
        throw new Error(data?.error ?? `Request failed (${res.status})`);
      }

      const data = (await res.json()) as ChatResponse;
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.reply, items: data.items },
      ]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Launcher */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Close recommendation assistant" : "Open recommendation assistant"}
        aria-expanded={open}
        className={cn(
          "fixed bottom-5 right-5 z-50 grid h-14 w-14 place-items-center rounded-pill shadow-2xl transition-all duration-200",
          "bg-marquee text-ink-900 hover:bg-marquee-hover hover:scale-105",
          open && "rotate-90",
        )}
      >
        {open ? (
          <svg aria-hidden viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={2.5}>
            <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
          </svg>
        ) : (
          <svg aria-hidden viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={2}>
            <path d="M21 12a8 8 0 0 1-11.5 7.2L4 20l1-4.5A8 8 0 1 1 21 12Z" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M8.5 12h.01M12 12h.01M15.5 12h.01" strokeLinecap="round" />
          </svg>
        )}
      </button>

      {/* Panel */}
      {open && (
        <div
          role="dialog"
          aria-label="Recommendation assistant"
          className={cn(
            "fixed bottom-24 right-5 z-50 flex w-[min(92vw,24rem)] flex-col overflow-hidden",
            "h-[min(70vh,32rem)] rounded-panel border border-ink-600 bg-ink-800 shadow-2xl",
            "animate-scale-in origin-bottom-right",
          )}
        >
          {/* Header */}
          <div className="flex items-center gap-3 border-b border-ink-600 bg-ink-900/60 px-4 py-3">
            <span className="grid h-9 w-9 place-items-center rounded-pill bg-marquee/15 text-marquee">
              <svg aria-hidden viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2}>
                <path d="M4 4h16v12H5.2L4 17.2z" strokeLinejoin="round" />
                <path d="M8 9h8M8 12h5" strokeLinecap="round" />
              </svg>
            </span>
            <div className="min-w-0">
              <p className="font-display text-sm font-bold text-paper">Reel</p>
              <p className="truncate text-xs text-paper-faint">Movie &amp; TV recommendations</p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close"
              className="ml-auto rounded-pill p-1.5 text-paper-muted transition-colors hover:bg-ink-700 hover:text-paper"
            >
              <svg aria-hidden viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2}>
                <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
              </svg>
            </button>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto px-4 py-4">
            {messages.map((m, i) => (
              <MessageBubble key={i} message={m} onPick={send} showSuggestions={i === 0 && messages.length === 1} />
            ))}

            {loading && <TypingIndicator />}

            {error && (
              <p className="rounded-card border border-rating-low/40 bg-rating-low/10 px-3 py-2 text-xs text-rating-low" role="alert">
                {error}
              </p>
            )}
          </div>

          {/* Composer */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
            className="border-t border-ink-600 bg-ink-900/60 p-3"
          >
            <div className="flex items-end gap-2">
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask for a recommendation…"
                aria-label="Message Reel"
                maxLength={1000}
                className="min-w-0 flex-1 rounded-pill border border-ink-600 bg-ink-800 px-4 py-2.5 text-sm text-paper placeholder:text-paper-faint focus:border-marquee/60 focus:outline-none"
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                aria-label="Send"
                className="grid h-10 w-10 shrink-0 place-items-center rounded-pill bg-marquee text-ink-900 transition-colors hover:bg-marquee-hover disabled:cursor-not-allowed disabled:opacity-40"
              >
                <svg aria-hidden viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path d="M4 12l16-8-6 16-3-6-7-2Z" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}

function MessageBubble({
  message,
  onPick,
  showSuggestions,
}: {
  message: DisplayMessage;
  onPick: (text: string) => void;
  showSuggestions?: boolean;
}) {
  const isUser = message.role === "user";

  return (
    <div className={cn("flex flex-col gap-2", isUser ? "items-end" : "items-start")}>
      <div
        className={cn(
          "max-w-[85%] rounded-panel px-3.5 py-2.5 text-sm leading-relaxed",
          isUser
            ? "bg-marquee text-ink-900"
            : "border border-ink-600 bg-ink-900/50 text-paper",
        )}
      >
        {message.content}
      </div>

      {/* Recommendation cards */}
      {message.items && message.items.length > 0 && (
        <ul className="w-full space-y-2">
          {message.items.map((item) => (
            <li key={`${item.mediaType}-${item.id}`}>
              <RecommendationCard item={item} />
            </li>
          ))}
        </ul>
      )}

      {/* First-run suggestion chips */}
      {showSuggestions && (
        <div className="flex flex-wrap gap-1.5">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => onPick(s)}
              className="rounded-pill border border-ink-600 bg-ink-800/60 px-3 py-1 text-xs text-paper-muted transition-colors hover:border-marquee/50 hover:text-marquee"
            >
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function RecommendationCard({ item }: { item: RecommendationItem }) {
  return (
    <Link
      href={item.href}
      className="group relative flex gap-3 overflow-hidden rounded-card border border-ink-600 bg-ink-800/80 p-2 transition-all duration-200 hover:-translate-y-0.5 hover:border-marquee/50 hover:bg-ink-700 hover:shadow-[0_4px_12px_-4px_rgba(0,0,0,0.6)]"
    >
      <div className="relative h-[76px] w-[52px] shrink-0 overflow-hidden rounded bg-ink-700">
        <Poster src={item.posterUrl} alt={`${item.title} poster`} title={item.title} />
        <div className="absolute right-0.5 top-0.5">
          <RatingBadge rating={item.rating} />
        </div>
      </div>

      <div className="flex min-w-0 flex-1 flex-col justify-center gap-0.5">
        <div className="flex items-center gap-2">
          <p className="truncate font-display text-sm font-bold text-paper group-hover:text-marquee">
            {item.title}
          </p>
          <span className="shrink-0 rounded-pill border border-ink-600 px-1.5 py-0.5 text-[10px] uppercase text-paper-faint">
            {item.mediaType === "tv" ? "TV" : "Film"}
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs text-paper-faint">
          {item.releaseYear && <span className="tabular-nums">{item.releaseYear}</span>}
        </div>
        {item.reason && (
          <p className="line-clamp-2 text-xs text-paper-muted">{truncate(item.reason, 100)}</p>
        )}
      </div>

      <span className="absolute bottom-1.5 right-2 translate-x-1 text-marquee opacity-0 transition-all duration-200 group-hover:translate-x-0 group-hover:opacity-100">
        <svg aria-hidden viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2.5}>
          <path d="M5 12h14M13 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
    </Link>
  );
}

function TypingIndicator() {
  return (
    <div className="flex items-center gap-1.5 rounded-panel border border-ink-600 bg-ink-900/50 px-3.5 py-3 w-fit">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="h-1.5 w-1.5 animate-bounce rounded-pill bg-paper-faint"
          style={{ animationDelay: `${i * 0.15}s` }}
        />
      ))}
    </div>
  );
}
