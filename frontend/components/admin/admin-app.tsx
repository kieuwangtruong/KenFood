import { useState } from "react"
import { LayoutDashboard, Users, Map, BadgeCheck, User as UserIcon } from "lucide-react"
import { Sidebar, MobileTabBar, type NavItem } from "@/components/shell/sidebar"
import { AdminDashboard } from "./admin-dashboard"
import { AdminManagement } from "./admin-management"
import { AdminLogistics } from "./admin-logistics"
import { AdminVerification } from "./admin-verification"
import { AdminProfile } from "./admin-profile"
import { ThemeToggle } from "@/components/theme-toggle"

const NAV: NavItem[] = [
  { id: "dashboard", label: "Bảng điều khiển", icon: LayoutDashboard },
  { id: "management", label: "Quản lý", icon: Users },
  { id: "logistics", label: "Bản đồ vận hành", icon: Map },
  { id: "verification", label: "Kiểm duyệt", icon: BadgeCheck },
  { id: "profile", label: "Hồ sơ Admin", icon: UserIcon },
]

export function AdminApp({
  onLogout,
  theme,
  toggleTheme,
}: {
  onLogout: () => void
  theme: "light" | "dark"
  toggleTheme: () => void
}) {
  const [tab, setTab] = useState("dashboard")

  const tabTitles: Record<string, string> = {
    dashboard: "Bảng điều khiển",
    management: "Quản lý thành viên",
    logistics: "Bản đồ vận hành",
    verification: "Kiểm duyệt đối tác",
    profile: "Hồ sơ Admin",
  }

  return (
    <div className="flex h-full w-full bg-background dark:bg-gray-900 text-foreground dark:text-white overflow-hidden">
      <Sidebar
        title="Kén Super Admin"
        subtitle="Trung tâm điều hành"
        items={NAV}
        active={tab}
        onSelect={setTab}
        badge={{ verification: 2 }}
      />
      <div className="flex min-w-0 flex-1 flex-col h-full">
        {/* Top Header */}
        <header className="border-b border-amber-600/30 dark:border-emerald-600/30 bg-[#F4EFEA] dark:bg-gray-900 flex items-center justify-between px-6 py-4 shrink-0 shadow-sm z-20">
          <div>
            <h1 className="text-base font-bold text-gray-900 dark:text-white capitalize">
              {tabTitles[tab] || "Quản trị"}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 pb-20 sm:p-6 lg:pb-6 bg-background dark:bg-gray-900">
          {tab === "dashboard" && <AdminDashboard />}
          {tab === "management" && <AdminManagement />}
          {tab === "logistics" && <AdminLogistics />}
          {tab === "verification" && <AdminVerification />}
          {tab === "profile" && <AdminProfile onLogout={onLogout} />}
        </main>
        <div className="fixed inset-x-0 bottom-0 z-40 lg:hidden">
          <MobileTabBar items={NAV} active={tab} onSelect={setTab} />
        </div>
      </div>
    </div>
  )
}
