"use client"

import { Star, ShieldCheck, Leaf, Sparkles, BadgeCheck } from "lucide-react"
import type { QualityBadge } from "@/lib/data"
import { cn } from "@/lib/utils"

const BADGE_CONFIG: Record<
  QualityBadge,
  { icon: typeof Star; className: string }
> = {
  "Sạch": { icon: BadgeCheck, className: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  "Đạt chuẩn HACCP": { icon: ShieldCheck, className: "bg-sky-50 text-sky-700 border-sky-200" },
  "Bếp 5 sao": { icon: Sparkles, className: "bg-amber-50 text-amber-700 border-amber-200" },
  "Hữu cơ": { icon: Leaf, className: "bg-lime-50 text-lime-700 border-lime-200" },
}

export function QualityBadgePill({ badge }: { badge: QualityBadge }) {
  if (badge === "Bếp 5 sao") {
    return (
      <span
        className="inline-flex items-center gap-0.5 rounded-full border px-2 py-0.5 bg-amber-50 border-amber-200 dark:bg-amber-950/20 dark:border-amber-900/30"
      >
        {[...Array(5)].map((_, i) => (
          <Star key={i} className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400 shrink-0" />
        ))}
      </span>
    )
  }

  const config = BADGE_CONFIG[badge]
  const Icon = config.icon
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold",
        config.className,
      )}
    >
      <Icon className="h-3 w-3" />
      {badge}
    </span>
  )
}

export function StarRating({
  rating,
  size = 14,
  showValue = true,
}: {
  rating: number
  size?: number
  showValue?: boolean
}) {
  return (
    <span className="inline-flex items-center gap-1">
      <Star className="fill-primary text-primary" style={{ width: size, height: size }} />
      {showValue && (
        <span className="text-xs font-semibold text-foreground">
          {rating.toFixed(1)}
        </span>
      )}
    </span>
  )
}
