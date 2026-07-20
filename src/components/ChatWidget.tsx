"use client";

import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent, type ReactNode } from "react";
import Link from "next/link";
import type { ChatMessage, ChatResponse, RecommendationItem } from "@/lib/chat-types";
import { cn, truncate } from "@/lib/utils";
import { useScrollLock } from "@/lib/useScrollLock";
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

/** Small film-chat mark used for Reel's avatar throughout the widget. */
function ReelMark({ className }: { className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth={2}>
      <path d="M4 4h16v12H5.2L4 17.2z" strokeLinejoin="round" />
      <path d="M8 9h8M8 12h5" strokeLinecap="round" />
    </svg>
  );
}

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<DisplayMessage[]>([GREETING]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Window chrome: normal (floating), maximized (fills screen), minimized
  // (header only). Size applies to the "normal" floating state and is
  // adjustable via the top-left resize grip.
  const [panelState, setPanelState] = useState<"normal" | "maximized" | "minimized">("normal");
  const [size, setSize] = useState({ width: 384, height: 544 });
  const resizeRef = useRef<{ x: number; y: number; w: number; h: number } | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to the newest message.
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  // Lock the page behind the chat when it fills the screen (mobile especially).
  useScrollLock(open && panelState === "maximized");

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

  // Keep a live reference to `send` so the event listener can call the latest
  // version (with current messages) without re-subscribing.
  const sendRef = useRef(send);
  useEffect(() => {
    sendRef.current = send;
  });

  // Allow other components (e.g. the "Ask Reel" banner) to open the widget and
  // optionally send a starter prompt.
  useEffect(() => {
    const onOpen = (e: Event) => {
      setPanelState("normal");
      setOpen(true);
      const prompt = (e as CustomEvent<{ prompt?: string }>).detail?.prompt;
      if (prompt) {
        requestAnimationFrame(() => sendRef.current(prompt));
      }
    };
    window.addEventListener("cinequeue:open-chat", onOpen);
    return () => window.removeEventListener("cinequeue:open-chat", onOpen);
  }, []);

  // --- Resize (drag the top-left grip; panel is anchored bottom-right) ---
  const onResizeStart = (e: ReactPointerEvent) => {
    if (panelState !== "normal") return;
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    resizeRef.current = { x: e.clientX, y: e.clientY, w: size.width, h: size.height };
  };

  const onResizeMove = (e: ReactPointerEvent) => {
    const r = resizeRef.current;
    if (!r) return;
    const clamp = (n: number, lo: number, hi: number) => Math.min(Math.max(n, lo), hi);
    const maxW = Math.min(window.innerWidth - 24, 760);
    const maxH = window.innerHeight - 112;
    setSize({
      width: clamp(r.w + (r.x - e.clientX), 320, maxW),
      height: clamp(r.h + (r.y - e.clientY), 360, maxH),
    });
  };

  const onResizeEnd = (e: ReactPointerEvent) => {
    resizeRef.current = null;
    if (e.currentTarget.hasPointerCapture?.(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
  };

  const openWidget = () => {
    setPanelState("normal");
    setOpen(true);
  };

  return (
    <>
      {/* Launcher */}
      <div className="chat-launcher fixed bottom-5 right-5 z-50 flex items-center gap-3">
        {!open && (
          <span className="hidden animate-fade-in items-center gap-2 rounded-pill border border-ink-600 bg-ink-800/90 px-3.5 py-2 text-sm font-semibold text-paper shadow-lg backdrop-blur-sm sm:inline-flex">
            <span className="h-1.5 w-1.5 rounded-full bg-rating-high" />
            Ask Reel
          </span>
        )}

        <button
          type="button"
          onClick={() => (open ? setOpen(false) : openWidget())}
          aria-label={open ? "Close recommendation assistant" : "Open recommendation assistant"}
          aria-expanded={open}
          className={cn(
            "relative grid h-14 w-14 place-items-center rounded-pill shadow-2xl transition-all duration-200",
            "bg-marquee text-ink-900 hover:bg-marquee-hover hover:scale-105",
          )}
        >
          {/* Idle pulse ring */}
          {!open && (
            <span
              aria-hidden
              className="absolute inset-0 animate-ping rounded-pill bg-marquee/40"
              style={{ animationDuration: "2.5s" }}
            />
          )}

          <span className="relative">
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
          </span>
        </button>
      </div>

      {/* Panel */}
      {open && (
        <div
          role="dialog"
          aria-label="Recommendation assistant"
          style={
            panelState === "maximized"
              ? undefined
              : {
                  width: size.width,
                  height: panelState === "minimized" ? undefined : size.height,
                }
          }
          className={cn(
            "fixed z-50 flex flex-col overflow-hidden rounded-panel border border-ink-600 bg-ink-800 shadow-2xl",
            "max-h-[calc(100vh-2rem)] max-w-[calc(100vw-2.5rem)] animate-scale-in origin-bottom-right",
            panelState === "maximized" ? "inset-3 sm:inset-5" : "bottom-24 right-5",
          )}
        >
          {/* Resize grip (floating mode only) */}
          {panelState === "normal" && (
            <div
              onPointerDown={onResizeStart}
              onPointerMove={onResizeMove}
              onPointerUp={onResizeEnd}
              onPointerCancel={onResizeEnd}
              role="separator"
              aria-label="Resize chat window"
              className="absolute left-0 top-0 z-20 flex h-7 w-7 cursor-nwse-resize items-start justify-start p-1.5 text-paper-faint transition-colors hover:text-marquee"
              style={{ touchAction: "none" }}
            >
              <svg aria-hidden viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2}>
                <path d="M4 13L13 4M4 8l4-4M4 18L18 4" strokeLinecap="round" />
              </svg>
            </div>
          )}
          {/* Header */}
          <div
            className={cn(
              "relative flex items-center gap-3 border-b border-ink-600 bg-ink-900/70 py-3 pr-3",
              panelState === "normal" ? "pl-8" : "pl-4",
            )}
          >
            <div
              aria-hidden
              className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-marquee/60 to-transparent"
            />
            <span className="relative grid h-9 w-9 place-items-center rounded-pill bg-marquee/15 text-marquee ring-1 ring-marquee/25">
              <ReelMark className="h-5 w-5" />
              <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-rating-high ring-2 ring-ink-900" />
            </span>
            <div className="min-w-0">
              <p className="font-display text-sm font-bold text-paper">Reel</p>
              <p className="flex items-center gap-1 truncate text-xs text-rating-high">
                Online
                <span className="text-paper-faint">· Movie &amp; TV picks</span>
              </p>
            </div>
            <div className="ml-auto flex items-center gap-0.5">
              {panelState === "minimized" ? (
                <ControlButton label="Restore" onClick={() => setPanelState("normal")}>
                  <rect x="4" y="4" width="16" height="16" rx="2" />
                </ControlButton>
              ) : (
                <>
                  <ControlButton label="Minimize" onClick={() => setPanelState("minimized")}>
                    <path d="M6 12h12" strokeLinecap="round" />
                  </ControlButton>
                  <ControlButton
                    label={panelState === "maximized" ? "Restore" : "Maximize"}
                    onClick={() =>
                      setPanelState((s) => (s === "maximized" ? "normal" : "maximized"))
                    }
                  >
                    {panelState === "maximized" ? (
                      <>
                        <rect x="8" y="8" width="11" height="11" rx="1.5" />
                        <path d="M5 16V6a1 1 0 0 1 1-1h10" strokeLinecap="round" />
                      </>
                    ) : (
                      <rect x="4" y="4" width="16" height="16" rx="2" />
                    )}
                  </ControlButton>
                </>
              )}
              <ControlButton label="Close" onClick={() => setOpen(false)}>
                <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
              </ControlButton>
            </div>
          </div>

          {/* Body */}
          {panelState !== "minimized" && (
            <>
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
            className="border-t border-ink-600 bg-ink-900/70 p-3"
          >
            <div className="flex items-end gap-2">
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask for a recommendation…"
                aria-label="Message Reel"
                maxLength={1000}
                className="min-w-0 flex-1 rounded-pill border border-ink-600 bg-ink-800 px-4 py-2.5 text-sm text-paper placeholder:text-paper-faint transition-colors focus:border-marquee/60 focus:outline-none focus:ring-2 focus:ring-marquee/30"
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                aria-label="Send"
                className="grid h-10 w-10 shrink-0 place-items-center rounded-pill bg-marquee text-ink-900 transition-all hover:bg-marquee-hover hover:scale-105 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:scale-100"
              >
                <svg aria-hidden viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path d="M4 12l16-8-6 16-3-6-7-2Z" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
            <p className="mt-2 text-center text-[10px] text-paper-faint">
              Reel can make mistakes — double-check important details.
            </p>
          </form>
            </>
          )}
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
      <div className={cn("flex max-w-[90%] gap-2", isUser && "flex-row-reverse")}>
        {!isUser && (
          <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-pill bg-marquee/15 text-marquee ring-1 ring-marquee/20">
            <ReelMark className="h-4 w-4" />
          </span>
        )}
        <div
          className={cn(
            "px-3.5 py-2.5 text-sm leading-relaxed",
            isUser
              ? "rounded-[16px_16px_4px_16px] bg-marquee text-ink-900"
              : "rounded-[16px_16px_16px_4px] border border-ink-600 bg-ink-900/50 text-paper",
          )}
        >
          {message.content}
        </div>
      </div>

      {/* Recommendation cards */}
      {message.items && message.items.length > 0 && (
        <ul className="w-full space-y-2 pl-9">
          {message.items.map((item) => (
            <li key={`${item.mediaType}-${item.id}`}>
              <RecommendationCard item={item} />
            </li>
          ))}
        </ul>
      )}

      {/* First-run suggestion chips */}
      {showSuggestions && (
        <div className="flex flex-wrap gap-1.5 pl-9">
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
    <div className="flex items-start gap-2">
      <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-pill bg-marquee/15 text-marquee ring-1 ring-marquee/20">
        <ReelMark className="h-4 w-4" />
      </span>
      <div className="flex items-center gap-1.5 rounded-[16px_16px_16px_4px] border border-ink-600 bg-ink-900/50 px-3.5 py-3">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="h-1.5 w-1.5 animate-bounce rounded-pill bg-paper-faint"
            style={{ animationDelay: `${i * 0.15}s` }}
          />
        ))}
      </div>
    </div>
  );
}


function ControlButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className="rounded-pill p-1.5 text-paper-muted transition-colors hover:bg-ink-700 hover:text-paper"
    >
      <svg aria-hidden viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2}>
        {children}
      </svg>
    </button>
  );
}
