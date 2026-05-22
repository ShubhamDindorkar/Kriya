"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  Building2,
  Clock,
  GitCompare,
  Home,
  Plus,
  Scale,
  TrendingUp,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useSearchHistory } from "@/lib/hooks/useSearchHistory";
import { getObjectiveLabel } from "@/lib/research/types";
import { cn } from "@/lib/utils";

const MENU_ITEMS = [
  { href: "/", label: "Home", icon: Home },
  { href: "/?objective=vendor_assessment", label: "Vendor Assessment", icon: Building2 },
  { href: "/?objective=ma_research", label: "M&A Research", icon: GitCompare },
  { href: "/?objective=competitive_intelligence", label: "Competitive Intelligence", icon: TrendingUp },
  { href: "/?objective=risk_assessment", label: "Risk Assessment", icon: Scale },
] as const;

function MenuIcon({ open }: { open: boolean }) {
  return (
    <span className="relative block h-3.5 w-5" aria-hidden>
      <span
        className={cn(
          "absolute left-0 h-[2px] w-5 rounded-full bg-foreground transition-all duration-200",
          open ? "top-[6px] rotate-45" : "top-0",
        )}
      />
      <span
        className={cn(
          "absolute left-0 h-[2px] rounded-full bg-foreground transition-all duration-200",
          open ? "top-[6px] w-5 -rotate-45" : "bottom-0 w-4",
        )}
      />
    </span>
  );
}

function SidebarNav({
  onNavigate,
  className,
}: {
  onNavigate?: () => void;
  className?: string;
}) {
  const pathname = usePathname();
  const { sessions } = useSearchHistory();

  return (
    <nav className={cn("flex flex-col gap-1", className)}>
      <Link
        href="/"
        onClick={onNavigate}
        className="mb-2 flex items-center gap-3 rounded-xl bg-teal px-3 py-2.5 text-sm font-medium text-teal-foreground transition-colors hover:bg-teal/90"
      >
        <Plus className="size-4 shrink-0" />
        New research
      </Link>

      {MENU_ITEMS.map(({ href, label, icon: Icon }) => {
        const active = href === "/" && pathname === "/";

        return (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
              active
                ? "bg-accent text-teal"
                : "text-muted-foreground hover:bg-secondary hover:text-foreground",
            )}
          >
            <Icon className="size-4 shrink-0" />
            {label}
          </Link>
        );
      })}

      {sessions.length > 0 && (
        <div className="mt-4 border-t border-border pt-4">
          <p className="mb-2 flex items-center gap-2 px-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            <Clock className="size-3.5" />
            Recent
          </p>
          <div className="max-h-[240px] space-y-1 overflow-y-auto">
            {sessions.slice(0, 12).map((session) => (
              <Link
                key={session.id}
                href={`/search/${session.id}`}
                onClick={onNavigate}
                className="block rounded-xl px-3 py-2.5 transition-colors hover:bg-secondary"
              >
                <p className="line-clamp-2 text-sm font-medium text-foreground">
                  {session.query}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {getObjectiveLabel(
                    session.objective,
                    session.customObjective,
                  )}
                </p>
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}

export function SidebarMenu() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex size-10 items-center justify-center rounded-xl transition-colors hover:bg-secondary"
        aria-label="Open menu"
      >
        <MenuIcon open={false} />
      </button>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent
          side="left"
          showCloseButton={false}
          className="w-[min(300px,85vw)] border-border bg-canvas p-0 text-foreground shadow-xl"
        >
          <SheetHeader className="flex flex-row items-center justify-between border-b border-border px-5 py-4">
            <SheetTitle className="text-lg font-normal tracking-tight text-foreground">
              Kriyagni
            </SheetTitle>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="inline-flex size-9 items-center justify-center rounded-xl transition-colors hover:bg-secondary"
              aria-label="Close menu"
            >
              <MenuIcon open={true} />
            </button>
          </SheetHeader>
          <SidebarNav className="p-3" onNavigate={() => setOpen(false)} />
        </SheetContent>
      </Sheet>
    </>
  );
}
