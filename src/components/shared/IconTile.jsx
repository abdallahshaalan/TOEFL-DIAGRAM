import { cn } from "@/lib/cn";

const SIZES = {
  sm: { box: "h-9 w-9", icon: "h-4 w-4" },
  md: { box: "h-10 w-10", icon: "h-5 w-5" },
};

/**
 * Restrained brand icon container — accent wash + primary glyph.
 * Decorative only; parent must provide accessible name.
 */
export default function IconTile({ icon: Icon, size = "md", className, iconClassName }) {
  const s = SIZES[size] || SIZES.md;
  if (!Icon) return null;
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-lg bg-accent text-primary",
        s.box,
        className
      )}
      aria-hidden
    >
      <Icon className={cn(s.icon, iconClassName)} strokeWidth={1.75} />
    </span>
  );
}
