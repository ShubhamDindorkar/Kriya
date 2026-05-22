import { cn } from "@/lib/utils";

interface GradientOrbProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

const CONTAINER_SIZE = {
  sm: "size-20",
  md: "size-32",
  lg: "size-40 md:size-44",
} as const;

export function GradientOrb({ className, size = "lg" }: GradientOrbProps) {
  return (
    <div
      className={cn(
        "mesh-orb relative isolate overflow-hidden rounded-full",
        CONTAINER_SIZE[size],
        className,
      )}
      aria-hidden
    >
      <div className="mesh-orb-colors absolute inset-0">
        <div className="mesh-orb-inner absolute -inset-[35%]">
          <div className="mesh-orb-blob mesh-orb-blob-a" />
          <div className="mesh-orb-blob mesh-orb-blob-b" />
          <div className="mesh-orb-blob mesh-orb-blob-c" />
          <div className="mesh-orb-blob mesh-orb-blob-d" />
          <div className="mesh-orb-blob mesh-orb-blob-e" />
        </div>
      </div>
      <div className="mesh-orb-glass absolute inset-0 rounded-full" />
    </div>
  );
}
