import { cn, ratingTone } from "@/lib/utils";

const TONE_CLASSES: Record<"high" | "mid" | "low", string> = {
  high: "text-rating-high border-rating-high/30 bg-rating-high/10",
  mid: "text-rating-mid border-rating-mid/30 bg-rating-mid/10",
  low: "text-rating-low border-rating-low/30 bg-rating-low/10",
};

export function RatingBadge({
  rating,
  size = "sm",
  className,
}: {
  rating: number;
  size?: "sm" | "lg";
  className?: string;
}) {
  const hasRating = rating > 0;
  const tone = ratingTone(rating);

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-pill border font-semibold tabular-nums",
        size === "sm" ? "px-2 py-0.5 text-xs" : "px-3 py-1 text-sm",
        hasRating ? TONE_CLASSES[tone] : "text-paper-faint border-ink-600 bg-ink-700",
        className,
      )}
      aria-label={hasRating ? `Rating ${rating.toFixed(1)} out of 10` : "Not yet rated"}
    >
      <svg
        aria-hidden
        viewBox="0 0 24 24"
        className={size === "sm" ? "h-3 w-3" : "h-4 w-4"}
        fill="currentColor"
      >
        <path d="M12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
      </svg>
      {hasRating ? rating.toFixed(1) : "NR"}
    </span>
  );
}
