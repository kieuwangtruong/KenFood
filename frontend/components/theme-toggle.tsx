"use client"

import { Sun, Moon } from "lucide-react"

interface ThemeToggleProps {
  theme: "light" | "dark"
  toggleTheme: () => void
}

export function ThemeToggle({ theme, toggleTheme }: ThemeToggleProps) {
  return (
    <button
      onClick={toggleTheme}
      className="flex h-9 w-9 items-center justify-center rounded-xl border border-border dark:border-gray-700 bg-card dark:bg-gray-800 text-foreground dark:text-white hover:bg-muted dark:hover:bg-gray-700 transition-all duration-200 shadow-sm shrink-0"
      aria-label="Chuyển chế độ sáng/tối"
    >
      {theme === "light" ? (
        <Moon className="h-4.5 w-4.5 text-slate-700 hover:scale-110 transition-transform" />
      ) : (
        <Sun className="h-4.5 w-4.5 text-amber-400 hover:scale-110 transition-transform animate-[spin_8s_linear_infinite]" />
      )}
    </button>
  )
}
