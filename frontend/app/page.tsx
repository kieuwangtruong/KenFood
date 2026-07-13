"use client"

import { useState, useEffect } from "react"
import { CustomerApp } from "@/components/customer/customer-app"
import { AdminApp } from "@/components/admin/admin-app"
import { DriverApp } from "@/components/driver/driver-app"
import { MerchantApp } from "@/components/merchant/merchant-app"
import { LoginScreen } from "@/components/login-screen"
import { ChatProvider } from "@/lib/chat-context"
import type { Role } from "@/lib/data"

export default function Page() {
  const [role, setRole] = useState<Role>("customer")
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [theme, setTheme] = useState<"light" | "dark">("light")

  // Initialize theme from localStorage or system preference
  useEffect(() => {
    const storedTheme = localStorage.getItem("theme")
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches
    if (storedTheme === "dark" || (!storedTheme && prefersDark)) {
      setTheme("dark")
      document.documentElement.classList.add("dark")
    } else {
      setTheme("light")
      document.documentElement.classList.remove("dark")
    }
  }, [])

  const toggleTheme = () => {
    if (theme === "light") {
      setTheme("dark")
      document.documentElement.classList.add("dark")
      localStorage.setItem("theme", "dark")
    } else {
      setTheme("light")
      document.documentElement.classList.remove("dark")
      localStorage.setItem("theme", "light")
    }
  }

  const handleLogin = (selectedRole: Role) => {
    setRole(selectedRole)
    setIsLoggedIn(true)
  }

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("ken_access_token")
    }
    setRole("customer")
    setIsLoggedIn(false)
  }

  return (
    <ChatProvider>
      <div className="h-screen w-screen flex flex-col overflow-hidden bg-background dark:bg-gray-900 text-foreground dark:text-white transition-colors duration-150">
        {!isLoggedIn ? (
          <div className="flex-1 overflow-y-auto">
            <LoginScreen onLogin={handleLogin} />
          </div>
        ) : (
          <div className="flex-1 flex flex-col min-h-0 relative">
            <div className="flex-1 min-h-0">
              {role === "customer" && (
                <CustomerApp onLogout={handleLogout} theme={theme} toggleTheme={toggleTheme} />
              )}
              {role === "admin" && (
                <AdminApp onLogout={handleLogout} theme={theme} toggleTheme={toggleTheme} />
              )}
              {role === "driver" && (
                <DriverApp onLogout={handleLogout} theme={theme} toggleTheme={toggleTheme} />
              )}
              {role === "merchant" && (
                <MerchantApp onLogout={handleLogout} theme={theme} toggleTheme={toggleTheme} />
              )}
            </div>
          </div>
        )}
      </div>
    </ChatProvider>
  )
}
