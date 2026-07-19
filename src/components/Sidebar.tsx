"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import { cn } from "@/lib/utils";
import { AppLogo } from "@/components/logo-variants";

const STORAGE_KEY = "cinequeue-sidebar-collapsed";

interface SidebarContextValue {
  collapsed: boolean;
  toggle: () => void;
}

const SidebarContext = createContext<SidebarContextValue | null>(null);

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === "true") setCollapsed(true);
    } catch {}
    setReady(true);
  }, []);

  const toggle = useCallback(() => {
    setCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(STORAGE_KEY, String(next));
      } catch {}
      return next;
    });
  }, []);

  return (
    <SidebarContext.Provider value={{ collapsed, toggle }}>
      {ready ? children : children}
    </SidebarContext.Provider>
  );
}

export function useSidebar(): SidebarContextValue {
  const ctx = useContext(SidebarContext);
  if (!ctx) throw new Error("useSidebar must be used inside <SidebarProvider>");
  return ctx;
}

/**
 * CineQueue "CQ" monogram.
 */
function IconHome() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      className="h-5 w-5 shrink-0"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 12h2v7a1 1 0 0 0 1 1h4v-5h4v5h4a1 1 0 0 0 1-1v-7h2l-9-8-9 8Z" />
    </svg>
  );
}

function IconTrending() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      className="h-5 w-5 shrink-0"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
      <polyline points="17 6 23 6 23 12" />
    </svg>
  );
}

function IconMovies() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      className="h-5 w-5 shrink-0"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="2" y="2" width="20" height="20" rx="2" />
      <path d="M2 8h20M2 16h20M8 2v20M16 2v20" />
    </svg>
  );
}

function IconTv() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      className="h-5 w-5 shrink-0"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="2" y="4" width="20" height="14" rx="2" />
      <path d="M8 22h8M12 18v4" />
    </svg>
  );
}

function IconBookmark() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      className="h-5 w-5 shrink-0"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6 3h12a1 1 0 0 1 1 1v17l-7-4-7 4V4a1 1 0 0 1 1-1Z" />
    </svg>
  );
}

export interface NavItem {
  label: string;
  href: string;
  icon: ReactNode;
  isActive: (pathname: string) => boolean;
}

export const NAV_ITEMS: NavItem[] = [
  {
    label: "Home",
    href: "/",
    icon: <IconHome />,
    isActive: (p) => p === "/",
  },
  {
    label: "Trending",
    href: "/movies",
    icon: <IconTrending />,
    isActive: () => false,
  },
  {
    label: "Movies",
    href: "/movies",
    icon: <IconMovies />,
    isActive: (p) => p.startsWith("/movies"),
  },
  {
    label: "TV",
    href: "/tv",
    icon: <IconTv />,
    isActive: (p) => p.startsWith("/tv"),
  },
  {
    label: "My List",
    href: "/my-list",
    icon: <IconBookmark />,
    isActive: (p) => p.startsWith("/my-list"),
  },
];

export function Sidebar() {
  const { collapsed, toggle } = useSidebar();
  const pathname = usePathname();

  return (
    <aside
      aria-label="Main navigation"
      className={cn(
        "fixed left-0 top-0 z-30 hidden h-full flex-col",
        "border-r border-ink-600/70 bg-ink-900",
        "transition-all duration-200 ease-in-out",
        "lg:flex",
      )}
      style={{ width: collapsed ? 64 : 240 }}
    >
      {/* Logo */}
      <div
        className={cn(
          "flex h-16 items-center",
          collapsed ? "justify-center px-0" : "px-4",
        )}
      >
        <Link
          href="/"
          aria-label="CineQueue home"
          className="flex items-center gap-2"
        >
          <AppLogo className="h-7 w-auto shrink-0" />
          {!collapsed && (
            <span className="flex items-baseline gap-0.5 font-display text-lg font-extrabold tracking-tight text-paper">
              CINE<span className="text-marquee">Q</span>
              <span className="ml-0.5 text-[12px] font-semibold uppercase tracking-widest text-paper-faint">
                tv
              </span>
            </span>
          )}
        </Link>
      </div>

      {/* Nav list */}
      <nav className="flex flex-col gap-1 px-2" aria-label="Primary">
        {NAV_ITEMS.map((item) => {
          const active = item.isActive(pathname);
          return (
            <Link
              key={item.label}
              href={item.href}
              aria-current={active ? "page" : undefined}
              title={collapsed ? item.label : undefined}
              className={cn(
                "group relative flex items-center gap-3 rounded-lg text-[13px] font-medium transition-all duration-200",
                collapsed ? "justify-center py-2.5" : "px-3 py-2.5",
                active
                  ? "bg-marquee-soft text-marquee"
                  : "text-paper-muted hover:bg-ink-800 hover:text-paper",
              )}
            >
              {active && (
                <span
                  aria-hidden
                  className="absolute left-0 top-1/2 h-[60%] w-[3px] -translate-y-1/2 rounded-r-full bg-marquee"
                />
              )}

              <span
                className={cn(
                  "flex shrink-0 items-center justify-center transition-colors duration-200",
                  active ? "text-marquee" : "text-paper-faint group-hover:text-paper-muted",
                )}
              >
                {item.icon}
              </span>

              {!collapsed && (
                <span className="truncate transition-opacity duration-150">
                  {item.label}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="flex-1" />

      {/* Bottom section */}
      <div className="border-t border-ink-600/70 px-3 py-3">
        {collapsed ? (
          <div className="flex justify-center">
            <button
              type="button"
              onClick={toggle}
              aria-label="Expand sidebar"
              className="grid h-8 w-8 place-items-center rounded-lg text-paper-faint transition-colors hover:bg-ink-800 hover:text-paper"
            >
              <svg
                aria-hidden
                viewBox="0 0 24 24"
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M9 18l6-6-6-6" />
              </svg>
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={toggle}
              aria-label="Collapse sidebar"
              className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-xs font-medium text-paper-faint transition-colors hover:bg-ink-800 hover:text-paper"
            >
              <svg
                aria-hidden
                viewBox="0 0 24 24"
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M15 18l-6-6 6-6" />
              </svg>
              Collapse
            </button>

            <span className="rounded bg-ink-700 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-paper-faint">
              v0.1.0
            </span>
          </div>
        )}
      </div>
    </aside>
  );
}

export function ContentArea({ children }: { children: ReactNode }) {
  const { collapsed } = useSidebar();

  return (
    <div
      className={cn(
        "flex min-h-screen flex-col transition-all duration-200 ease-in-out",
        collapsed ? "lg:ml-16" : "lg:ml-60",
      )}
    >
      {children}
    </div>
  );
}
