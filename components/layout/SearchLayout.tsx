"use client";

import Link from "next/link";
import { SidebarMenu } from "@/components/layout/SidebarMenu";
import { cn } from "@/lib/utils";

interface SearchLayoutProps {
  children: React.ReactNode;
  className?: string;
  headerActions?: React.ReactNode;
}

export function SearchLayout({
  children,
  className,
  headerActions,
}: SearchLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col bg-canvas">
      <header className="sticky top-0 z-30 flex shrink-0 items-center justify-between gap-3 border-b border-border/60 bg-canvas/95 px-4 py-3 backdrop-blur-sm md:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <SidebarMenu />
          <Link
            href="/"
            className="truncate text-sm font-normal tracking-tight text-foreground md:text-base"
          >
            Kriyagni
          </Link>
        </div>
        {headerActions ? (
          <div className="flex shrink-0 items-center gap-2">{headerActions}</div>
        ) : null}
      </header>
      <main className={cn("flex flex-1 flex-col", className)}>{children}</main>
    </div>
  );
}
