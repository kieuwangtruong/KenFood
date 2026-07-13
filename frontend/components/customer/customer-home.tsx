"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Search, MapPin, Clock, Bike, ChevronRight, Plus } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { QualityBadgePill, StarRating } from "@/components/shell/badges"
import {
  CATEGORIES,
  DRIVERS,
  FOOD_ITEMS,
  HANOI_WARDS,
  formatVND,
} from "@/lib/data"
import { getProducts } from "@/src/api/kenServices"
import { cn } from "@/lib/utils"

const BANNERS = [
  {
    id: 1,
    title: "Freeship 0đ",
    subtitle: "Giao nhanh 15 phút, miễn phí vận chuyển cho mọi đơn hàng từ 100k",
    image: "https://images.unsplash.com/photo-1526367790999-015078648c7e?q=80&w=1000",
    badge: "FREESHIP",
    color: "from-emerald-950/90 to-black/30",
  },
  {
    id: 2,
    title: "Flash Sale 50%",
    subtitle: "Đại tiệc ẩm thực giờ vàng, giảm nửa giá từ 11h - 13h",
    image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?q=80&w=1000",
    badge: "GIẢM SÂU",
    color: "from-orange-950/95 to-black/30",
  },
  {
    id: 3,
    title: "Kén Special Offers",
    subtitle: "Hương vị ẩm thực truyền thống Việt Nam tuyển chọn đặc biệt",
    image: "https://images.unsplash.com/photo-1596797038530-2c107229654b?q=80&w=1000",
    badge: "ĐỘC QUYỀN",
    color: "from-red-950/90 to-black/30",
  },
]

export function CustomerHome({ onCheckout }: { onCheckout: (product?: any) => void }) {
  const [query, setQuery] = useState("")
  const [ward, setWard] = useState<string>("all")
  const [category, setCategory] = useState<string>("all")
  const [currentSlide, setCurrentSlide] = useState(0)
  const [products, setProducts] = useState<any[]>([])
  const [loadingProducts, setLoadingProducts] = useState(true)

  useEffect(() => {
    async function loadProducts() {
      try {
        setLoadingProducts(true)
        const data = await getProducts()
        setProducts(data || [])
      } catch (err) {
        console.warn("Failed to fetch products, falling back to mock data:", err)
        setProducts(FOOD_ITEMS.filter(f => f.status === "approved"))
      } finally {
        setLoadingProducts(false)
      }
    }
    loadProducts()
  }, [])

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % BANNERS.length)
    }, 3000)
    return () => clearInterval(timer)
  }, [])

  const itemsToFilter = products.length > 0 ? products : FOOD_ITEMS.filter(f => f.status === "approved")

  const filtered = itemsToFilter.filter((f) => {
    const matchQuery =
      query === "" ||
      f.name.toLowerCase().includes(query.toLowerCase()) ||
      (f.merchant_name || f.merchant || "").toLowerCase().includes(query.toLowerCase())
    const matchWard = ward === "all" || f.ward === ward
    const matchCat = category === "all" || f.category === category
    return matchQuery && matchWard && matchCat
  })

  const onlineDrivers = DRIVERS.filter((d) => d.status !== "offline")

  return (
    <div className="pb-6">
      {/* Responsive layout container */}
      <div className="grid grid-cols-1 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        
        {/* LEFT COLUMN: Categories & Lobby Hub (Desktop only) */}
        <div className="hidden lg:flex lg:flex-col lg:gap-5 lg:col-span-1">
          {/* Categories Card */}
          <div className="rounded-2xl border border-amber-600 bg-white dark:bg-gray-900 dark:border-emerald-600 p-4.5 shadow-sm space-y-3 shrink-0 text-gray-900 dark:text-gray-100">
            <h2 className="text-xs font-bold text-foreground dark:text-white uppercase tracking-wider">Danh mục cao cấp</h2>
            <div className="flex flex-col gap-1">
              <CategoryRow
                active={category === "all"}
                onClick={() => setCategory("all")}
                icon="🍽️"
                label="Tất cả"
              />
              {CATEGORIES.map((c) => (
                <CategoryRow
                  key={c.id}
                  active={category === c.id}
                  onClick={() => setCategory(c.id)}
                  icon={c.icon}
                  label={c.name}
                />
              ))}
            </div>
          </div>

          {/* Lobby Hub Card */}
          <div className="rounded-2xl border border-amber-600 bg-white dark:bg-gray-900 dark:border-emerald-600 p-4.5 shadow-sm space-y-3 shrink-0 text-gray-900 dark:text-gray-100">
            <div className="flex items-center justify-between border-b border-border dark:border-gray-800 pb-1.5">
              <h2 className="text-xs font-bold text-foreground dark:text-white uppercase tracking-wider">Lobby Hub</h2>
              <span className="flex items-center gap-1 text-[9px] font-bold text-emerald-600 dark:text-emerald-400">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
                Online
              </span>
            </div>
            <p className="text-[10px] text-muted-foreground dark:text-gray-400">{onlineDrivers.length} tài xế gần bạn</p>
            <div className="space-y-2 max-h-[180px] overflow-y-auto pr-1">
              {onlineDrivers.map((d) => (
                <div key={d.id} className="flex items-center gap-2 bg-muted/30 dark:bg-gray-850 p-2 rounded-xl border border-border/40 dark:border-gray-750">
                  <Avatar className="h-8 w-8 shrink-0">
                    <AvatarImage src={d.avatar || "/placeholder.svg"} />
                    <AvatarFallback>{d.name[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-bold text-foreground dark:text-white truncate">{d.name}</p>
                    <span className="text-[9px] text-muted-foreground dark:text-gray-400 block truncate">{d.distanceKm} km · {d.vehicle}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* MIDDLE COLUMN: Food list feed (Mobile & Desktop) */}
        <div className="lg:col-span-2 xl:col-span-3 space-y-5">
          {/* Promotional Auto-Sliding Banner Carousel */}
          <div className="relative overflow-hidden w-full h-44 sm:h-52 md:h-60 rounded-2xl shadow-sm bg-muted dark:bg-gray-800 border border-border dark:border-gray-800">
            <div
              className="flex h-full w-full transition-transform duration-500 ease-in-out"
              style={{ transform: `translate3d(-${currentSlide * 100}%, 0, 0)` }}
            >
              {BANNERS.map((slide) => (
                <div key={slide.id} className="relative w-full h-full shrink-0 overflow-hidden select-none">
                  <img
                    src={slide.image}
                    alt={slide.title}
                    className="absolute inset-0 w-full h-full object-cover object-center"
                  />
                  <div className={`absolute inset-0 bg-gradient-to-r ${slide.color} mix-blend-multiply`} />
                  <div className="absolute inset-0 bg-black/25 dark:bg-black/45" />
                  
                  {/* Banner content */}
                  <div className="absolute inset-y-0 left-0 flex flex-col justify-center px-6 sm:px-10 text-white max-w-[85%] sm:max-w-[70%] space-y-2">
                    <span className="self-start px-2 py-0.5 rounded-full bg-primary text-white text-[9px] font-bold tracking-wider uppercase">
                      {slide.badge}
                    </span>
                    <h3 className="text-lg sm:text-2xl font-black leading-tight tracking-tight drop-shadow">
                      {slide.title}
                    </h3>
                    <p className="text-[10px] sm:text-xs text-gray-200 font-semibold leading-relaxed drop-shadow">
                      {slide.subtitle}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Carousel navigation dots */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
              {BANNERS.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentSlide(idx)}
                  className={cn(
                    "h-1.5 rounded-full transition-all duration-300",
                    currentSlide === idx ? "w-5 bg-primary" : "w-1.5 bg-white/40 hover:bg-white"
                  )}
                  aria-label={`Đi tới banner ${idx + 1}`}
                />
              ))}
            </div>
          </div>

          {/* Search Header panel */}
          <div className="rounded-2xl border border-amber-600 lg:bg-white bg-white dark:bg-gray-900 dark:border-emerald-600 px-5 py-5 text-gray-900 dark:text-gray-100 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="flex items-center gap-1 text-xs text-secondary-foreground/60 lg:text-muted-foreground dark:text-gray-400">
                  <MapPin className="h-3.5 w-3.5 text-primary" /> Giao đến
                </p>
                <p className="text-sm font-semibold">Số 1 Đại Cồ Việt, Hà Nội</p>
              </div>
              <Avatar className="h-9 w-9 border-2 border-primary">
                <AvatarFallback className="bg-primary text-xs text-primary-foreground font-bold">
                  TT
                </AvatarFallback>
              </Avatar>
            </div>

            <div className="relative mt-4">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Tìm món, quán ăn..."
                className="h-10.5 rounded-xl border border-transparent dark:border-gray-700 bg-background dark:bg-gray-750 lg:bg-muted/30 lg:dark:bg-gray-850 pl-9 text-foreground dark:text-white"
              />
            </div>

            <div className="mt-3">
              <Select value={ward} onValueChange={(val) => setWard(val || "all")}>
                <SelectTrigger className="h-9 w-full rounded-xl border border-transparent dark:border-gray-700 bg-black/20 dark:bg-gray-750 text-secondary-foreground lg:text-foreground dark:text-white">
                  <SelectValue placeholder="Chọn phường/quận" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả phường/quận</SelectItem>
                  {HANOI_WARDS.map((w) => (
                    <SelectItem key={w} value={w}>
                      {w}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Categories Carousel (Mobile only) */}
          <section className="lg:hidden px-1">
            <h2 className="mb-2 text-xs font-bold text-foreground uppercase tracking-wider">Danh mục cao cấp</h2>
            <div className="flex gap-2 overflow-x-auto pb-1">
              <CategoryChip
                active={category === "all"}
                onClick={() => setCategory("all")}
                icon="🍽️"
                label="Tất cả"
              />
              {CATEGORIES.map((c) => (
                <CategoryChip
                  key={c.id}
                  active={category === c.id}
                  onClick={() => setCategory(c.id)}
                  icon={c.icon}
                  label={c.name}
                />
              ))}
            </div>
          </section>

          {/* Lobby Hub Cards (Mobile only) */}
          <section className="lg:hidden px-1">
            <div className="rounded-2xl border border-border dark:border-gray-800 bg-card dark:bg-gray-800 p-3.5 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-foreground dark:text-white uppercase tracking-wider">Lobby Hub gần bạn</p>
                <span className="flex items-center gap-1 rounded-full bg-emerald-50 dark:bg-emerald-950/30 px-2 py-0.5 text-[9px] font-bold text-emerald-700 dark:text-emerald-350">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
                  Hoạt động
                </span>
              </div>
              <div className="mt-2.5 flex gap-2.5 overflow-x-auto pb-1">
                {onlineDrivers.map((d) => (
                  <div key={d.id} className="flex w-24 shrink-0 flex-col items-center gap-1 rounded-xl bg-muted/40 dark:bg-gray-850 p-2 border border-transparent dark:border-gray-750">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={d.avatar || "/placeholder.svg"} />
                      <AvatarFallback>{d.name[0]}</AvatarFallback>
                    </Avatar>
                    <p className="line-clamp-1 text-center text-[9px] font-bold text-foreground dark:text-white">{d.name}</p>
                    <span className="text-[8px] text-muted-foreground dark:text-gray-400">{d.distanceKm} km</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Food Cards List - responsive layout */}
          <section className="px-1 space-y-3.5">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold text-foreground dark:text-white uppercase tracking-wider">Gợi ý hôm nay ({filtered.length})</h2>
            </div>
            
            {filtered.length === 0 ? (
              <p className="rounded-xl bg-muted dark:bg-gray-800 py-8 text-center text-xs text-muted-foreground dark:text-gray-400 font-semibold border border-transparent dark:border-gray-750">
                Không tìm thấy món phù hợp.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {filtered.map((f) => (
                  <div key={f.id} className="group/food-card flex gap-3 rounded-2xl border transition-all duration-200 p-3 shadow-sm bg-white border-amber-600 text-gray-900 hover:bg-amber-600 active:bg-amber-700 hover:text-white active:text-white dark:bg-gray-900 dark:border-emerald-600 dark:text-gray-100 dark:hover:bg-emerald-600 dark:active:bg-emerald-700 dark:hover:text-white">
                    <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-muted dark:bg-gray-750">
                      <Image
                        src={f.image_url || f.image || "/placeholder.svg"}
                        alt={f.name}
                        fill
                        className="object-cover"
                        sizes="80px"
                      />
                    </div>
                    <div className="flex min-w-0 flex-1 flex-col justify-between">
                      <div>
                        <p className="line-clamp-1 text-xs font-bold text-gray-900 dark:text-gray-100 group-hover/food-card:text-white dark:group-hover/food-card:text-white transition-colors">{f.name}</p>
                        <p className="line-clamp-1 text-[10px] text-muted-foreground dark:text-gray-400 group-hover/food-card:text-amber-100 dark:group-hover/food-card:text-emerald-100 mt-0.5">{f.merchant_name || f.merchant} · {f.ward}</p>
                        <div className="mt-1 flex flex-wrap gap-1">
                           {f.badges ? f.badges.map((b: string) => (
                             <QualityBadgePill key={b} badge={b as any} />
                           )) : (
                             <>
                               <QualityBadgePill badge="Sạch" />
                               <QualityBadgePill badge="Đạt chuẩn HACCP" />
                             </>
                           )}
                        </div>
                      </div>
                      <div className="flex items-center justify-between pt-1">
                        <p className="text-xs font-black text-amber-750 dark:text-emerald-400 group-hover/food-card:text-white dark:group-hover/food-card:text-white transition-colors">{formatVND(f.price)}</p>
                        <Button
                          size="xs"
                          onClick={() => onCheckout(f)}
                          className="h-7 px-2.5 rounded-lg text-xs font-bold"
                        >
                          + Mua
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* RIGHT COLUMN: Desktop Checkout Preview (Desktop only) */}
        <div className="hidden lg:block lg:col-span-1">
          <div className="rounded-2xl border border-border dark:border-gray-800 bg-card dark:bg-gray-800 p-5 shadow-sm space-y-4 sticky top-6">
            <h2 className="text-xs font-bold text-gray-900 dark:text-gray-100 uppercase tracking-wider border-b border-amber-600/30 dark:border-emerald-600/30 pb-2">
              Giỏ hàng thanh toán
            </h2>
            {/* Display Cart Items preview */}
            <div className="space-y-3.5 max-h-[300px] overflow-y-auto pr-1">
              <div className="flex items-center gap-2">
                <div className="h-10 w-10 relative overflow-hidden rounded bg-muted dark:bg-gray-750 shrink-0">
                  <Image src={(filtered[0] || FOOD_ITEMS[0]).image_url || (filtered[0] || FOOD_ITEMS[0]).image} alt="Phở" fill className="object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-bold text-foreground dark:text-white truncate">{(filtered[0] || FOOD_ITEMS[0]).name}</p>
                  <p className="text-[9px] text-muted-foreground dark:text-gray-400">{(filtered[0] || FOOD_ITEMS[0]).merchant_name || (filtered[0] || FOOD_ITEMS[0]).merchant}</p>
                </div>
                <span className="text-[11px] font-bold shrink-0">{formatVND((filtered[0] || FOOD_ITEMS[0]).price)}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-10 w-10 relative overflow-hidden rounded bg-muted dark:bg-gray-750 shrink-0">
                  <Image src={(filtered[1] || FOOD_ITEMS[3]).image_url || (filtered[1] || FOOD_ITEMS[3]).image} alt="Bánh mì" fill className="object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-bold text-foreground dark:text-white truncate">{(filtered[1] || FOOD_ITEMS[3]).name}</p>
                  <p className="text-[9px] text-muted-foreground dark:text-gray-400 font-medium">{(filtered[1] || FOOD_ITEMS[3]).merchant_name || (filtered[1] || FOOD_ITEMS[3]).merchant}</p>
                </div>
                <span className="text-[11px] font-bold shrink-0">{formatVND((filtered[1] || FOOD_ITEMS[3]).price)}</span>
              </div>
            </div>
            
            <div className="border-t border-border dark:border-gray-800 pt-3.5 space-y-2 text-xs">
              <div className="flex justify-between text-muted-foreground dark:text-gray-400">
                <span>Tạm tính</span>
                <span>{formatVND((filtered[0] || FOOD_ITEMS[0]).price + (filtered[1] || FOOD_ITEMS[3]).price)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground dark:text-gray-400">
                <span>Phí giao hàng</span>
                <span>{formatVND(18000)}</span>
              </div>
              <div className="border-t border-dashed border-border dark:border-gray-800 my-1" />
              <div className="flex justify-between text-sm font-black text-foreground dark:text-white">
                <span>Tổng đơn:</span>
                <span>{formatVND((filtered[0] || FOOD_ITEMS[0]).price + (filtered[1] || FOOD_ITEMS[3]).price + 18000)}</span>
              </div>
            </div>

            <Button onClick={() => onCheckout(filtered[0] || FOOD_ITEMS[0])} className="w-full h-10 font-bold rounded-xl text-xs bg-primary text-primary-foreground">
              Tiến hành thanh toán
            </Button>
          </div>
        </div>

      </div>
    </div>
  )
}

function CategoryRow({
  icon,
  label,
  active,
  onClick,
}: {
  icon: string
  label: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 w-full p-2.5 rounded-xl border text-left transition-all duration-200 cursor-pointer",
        active
          ? "bg-amber-600 text-white border-amber-600 dark:bg-emerald-600 dark:text-white dark:border-emerald-600"
          : "bg-white border-amber-600 text-gray-900 hover:bg-amber-600 active:bg-amber-700 hover:text-white active:text-white dark:bg-gray-900 dark:border-emerald-600 dark:text-gray-100 dark:hover:bg-emerald-600 dark:active:bg-emerald-700 dark:hover:text-white"
      )}
    >
      <span className="text-lg shrink-0">{icon}</span>
      <span className="text-[11px] truncate font-bold">{label}</span>
    </button>
  )
}

function CategoryChip({
  icon,
  label,
  active,
  onClick,
}: {
  icon: string
  label: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex shrink-0 flex-col items-center gap-1.5 rounded-2xl border px-4 py-2.5 transition-all duration-200 cursor-pointer",
        active
          ? "bg-amber-600 text-white border-amber-600 dark:bg-emerald-600 dark:text-white dark:border-emerald-600"
          : "bg-white border-amber-600 text-gray-900 hover:bg-amber-600 active:bg-amber-700 hover:text-white active:text-white dark:bg-gray-900 dark:border-emerald-600 dark:text-gray-100 dark:hover:bg-emerald-600 dark:active:bg-emerald-700 dark:hover:text-white"
      )}
    >
      <span className="text-xl">{icon}</span>
      <span className="whitespace-nowrap text-[11px] font-bold">
        {label}
      </span>
    </button>
  )
}
