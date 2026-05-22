import { cn } from "@/lib/utils";

interface TierBadgeProps {
  tier: number;
  className?: string;
}

const TIER_STYLES: Record<number, string> = {
  1: "bg-teal/15 text-teal border-teal/25",
  2: "bg-emerald-500/10 text-emerald-700 border-emerald-500/20",
  3: "bg-amber-500/10 text-amber-800 border-amber-500/20",
  4: "bg-secondary text-muted-foreground border-border",
};

export function TierBadge({ tier, className }: TierBadgeProps) {
  const style = TIER_STYLES[tier] ?? TIER_STYLES[4];

  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center rounded-md border px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
        style,
        className,
      )}
    >
      T{tier}
    </span>
  );
}
