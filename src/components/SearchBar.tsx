"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export function SearchBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const inputRef = useRef<HTMLInputElement>(null);
  const [value, setValue] = useState(searchParams.get("q") ?? "");

  // Keep the field in sync when navigating (e.g. clearing the query).
  useEffect(() => {
    setValue(searchParams.get("q") ?? "");
  }, [searchParams]);

  // Focus the search field with ⌘K / Ctrl+K, like the reference.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = value.trim();
    router.push(q ? `/?q=${encodeURIComponent(q)}` : "/");
    inputRef.current?.blur();
  };

  return (
    <form onSubmit={submit} role="search" className="w-full min-w-0 flex-1">
      <div className="group flex h-11 items-center gap-2 rounded-pill border border-ink-600 bg-ink-800/80 px-4 transition-colors focus-within:border-marquee/60">
        <svg
          aria-hidden
          viewBox="0 0 24 24"
          className="h-[18px] w-[18px] shrink-0 text-paper-faint"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
        >
          <circle cx="11" cy="11" r="7" />
          <path d="m21 21-4.3-4.3" strokeLinecap="round" />
        </svg>
        <input
          ref={inputRef}
          type="search"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Search movies"
          aria-label="Search movies"
          className="min-w-0 flex-1 bg-transparent text-sm text-paper placeholder:text-paper-faint focus:outline-none"
        />
        <kbd className="hidden shrink-0 select-none items-center gap-0.5 rounded-md border border-ink-600 bg-ink-700 px-1.5 py-0.5 font-body text-[11px] text-paper-faint sm:inline-flex">
          ⌘K
        </kbd>
      </div>
    </form>
  );
}
