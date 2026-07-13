"use client"

import type { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

export type NavItem = {
  id: string
  label: string
  icon: LucideIcon
}

export function Sidebar({
  title,
  subtitle,
  items,
  active,
  onSelect,
  badge,
}: {
  title: string
  subtitle: string
  items: NavItem[]
  active: string
  onSelect: (id: string) => void
  badge?: Record<string, number>
}) {
  return (
    <aside className="hidden w-64 shrink-0 border-r border-amber-600/20 dark:border-emerald-600/20 bg-[#F4EFEA] dark:bg-gray-900 lg:flex lg:flex-col">
      <div className="border-b border-sidebar-border px-6 py-5 flex items-center gap-3">
        <img
          src="/logo.jpg"
          alt="Kén Logo"
          className="h-10 w-auto object-contain rounded-lg shrink-0"
          onError={(e) => {
            e.currentTarget.src = "/logo.png"
          }}
        />
        <div className="leading-none min-w-0">
          <p className="text-sm font-extrabold text-gray-900 dark:text-white truncate">{title}</p>
          <p className="mt-1.5 text-[11px] text-gray-600 dark:text-gray-400 font-semibold truncate">{subtitle}</p>
        </div>
      </div>
      <nav className="flex-1 space-y-1.5 p-3">
        {items.map((item) => {
          const Icon = item.icon
          const isActive = active === item.id
          const count = badge?.[item.id]
          return (
            <button
              key={item.id}
              onClick={() => onSelect(item.id)}
              className={cn(
                "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 border cursor-pointer",
                isActive
                  ? "bg-amber-600 text-white border-amber-600 dark:bg-emerald-600 dark:text-white dark:border-emerald-600"
                  : "bg-white border-amber-600 text-gray-900 hover:bg-amber-600 active:bg-amber-700 hover:text-white active:text-white dark:bg-gray-800 dark:border-emerald-600 dark:text-gray-100 dark:hover:bg-emerald-600 dark:active:bg-emerald-700 dark:hover:text-white"
              )}
            >
              <Icon className="h-[18px] w-[18px]" />
              <span className="flex-1 text-left">{item.label}</span>
              {count ? (
                <span
                  className={cn(
                    "rounded-full px-1.5 py-0.5 text-[10px] font-bold",
                    isActive
                      ? "bg-sidebar-primary-foreground/20 text-sidebar-primary-foreground"
                      : "bg-primary text-primary-foreground",
                  )}
                >
                  {count}
                </span>
              ) : null}
            </button>
          )
        })}
      </nav>
      <div className="border-t border-amber-600/20 dark:border-emerald-600/20 p-3 bg-white/20 dark:bg-gray-850/30">
        <div className="flex items-center gap-2 rounded-xl bg-white border border-amber-600/20 dark:bg-gray-800 dark:border-emerald-600/20 px-3 py-2">
          <div className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <p className="text-xs font-bold text-gray-900 dark:text-white">
            Hệ thống ổn định · 99.9%
          </p>
        </div>
      </div>
    </aside>
  )
}

export function MobileTabBar({
  items,
  active,
  onSelect,
}: {
  items: NavItem[]
  active: string
  onSelect: (id: string) => void
}) {
  return (
    <nav className="flex items-stretch border-t border-amber-600/20 dark:border-emerald-600/20 bg-[#F4EFEA] dark:bg-gray-900 p-2 gap-1.5 shrink-0 z-30">
      {items.map((item) => {
        const Icon = item.icon
        const isActive = active === item.id
        return (
          <button
            key={item.id}
            onClick={() => onSelect(item.id)}
            className={cn(
              "flex flex-1 flex-col items-center gap-1.5 py-2 rounded-xl text-[10px] font-bold transition-all duration-200 border cursor-pointer",
              isActive
                ? "bg-amber-600 text-white border-amber-600 dark:bg-emerald-600 dark:text-white dark:border-emerald-600"
                : "bg-white border-amber-600 text-gray-900 hover:bg-amber-600 active:bg-amber-700 hover:text-white active:text-white dark:bg-gray-800 dark:border-emerald-600 dark:text-gray-100 dark:hover:bg-emerald-600 dark:active:bg-emerald-700 dark:hover:text-white"
            )}
          >
            <Icon className="h-4 w-4" />
            <span>{item.label}</span>
          </button>
        )
      })}
    </nav>
  )
}
