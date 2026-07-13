import { useState } from "react"
import { LayoutGrid, ClipboardList, BarChart3, LifeBuoy, MessageSquare, User as UserIcon, List } from "lucide-react"
import { Sidebar, MobileTabBar, type NavItem } from "@/components/shell/sidebar"
import { MerchantOrders } from "./merchant-orders"
import { MerchantMenu } from "./merchant-menu"
import { MerchantInsights } from "./merchant-insights"
import { MerchantSupport } from "./merchant-support"
import { MerchantProfile } from "./merchant-profile"
import { MerchantBatchSummary } from "./merchant-batch-summary"
import { ChatComponent } from "@/components/chat-component"
import { useChat } from "@/lib/chat-context"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ThemeToggle } from "@/components/theme-toggle"

const NAV: NavItem[] = [
  { id: "orders", label: "Đơn đang chờ", icon: ClipboardList },
  { id: "batch-summary", label: "Báo cáo Gom món (10:01 AM)", icon: List },
  { id: "menu", label: "Quản lý món", icon: LayoutGrid },
  { id: "chat", label: "Tin nhắn", icon: MessageSquare },
  { id: "insights", label: "Phân tích", icon: BarChart3 },
  { id: "profile", label: "Hồ sơ", icon: UserIcon },
  { id: "support", label: "Hỗ trợ Kén", icon: LifeBuoy },
]

export function MerchantApp({
  onLogout,
  theme,
  toggleTheme,
}: {
  onLogout: () => void
  theme: "light" | "dark"
  toggleTheme: () => void
}) {
  const [tab, setTab] = useState("orders")
  const { getChannelsForRole } = useChat()
  const [activeChannelId, setActiveChannelId] = useState<string>("customer-merchant")

  const channels = getChannelsForRole("merchant")
  const activeChan = channels.find((c) => c.id === activeChannelId) || channels[0]

  const tabTitles: Record<string, string> = {
    orders: "Đơn đang chờ",
    "batch-summary": "Báo cáo Gom món (10:01 AM)",
    menu: "Quản lý món",
    chat: "Tin nhắn đối tác",
    insights: "Phân tích doanh thu",
    profile: "Hồ sơ quán",
    support: "Hỗ trợ Kén",
  }

  return (
    <div className="flex h-full w-full bg-background dark:bg-gray-900 text-foreground dark:text-white overflow-hidden">
      <Sidebar
        title="Phở Thìn Lò Đúc"
        subtitle="Đối tác Kén · Hai Bà Trưng"
        items={NAV}
        active={tab}
        onSelect={setTab}
        badge={{ orders: 3 }}
      />
      <div className="flex min-w-0 flex-1 flex-col h-full">
        {/* Top Header */}
        <header className="border-b border-amber-600/30 dark:border-emerald-600/30 bg-[#F4EFEA] dark:bg-gray-900 flex items-center justify-between px-6 py-4 shrink-0 shadow-sm z-20">
          <div>
            <h1 className="text-base font-bold text-gray-900 dark:text-white capitalize">
              {tabTitles[tab] || "Đối tác"}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 pb-20 sm:p-6 lg:pb-6 bg-background dark:bg-gray-900">
          {tab === "orders" && <MerchantOrders />}
          {tab === "batch-summary" && <MerchantBatchSummary />}
          {tab === "menu" && <MerchantMenu />}
          
          {/* Chat Inbox Layout */}
          {tab === "chat" && (
            <div className="space-y-4 h-[calc(100vh-10rem)] lg:h-[calc(100vh-8rem)] flex flex-col">
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-foreground dark:text-white">Hộp thư đối tác</h1>
                <p className="text-sm text-muted-foreground dark:text-gray-400">Nhắn tin trực tiếp với khách hàng và shipper điều phối</p>
              </div>
              
              <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-3 border border-border dark:border-gray-800 rounded-2xl overflow-hidden bg-card dark:bg-gray-800 shadow-sm">
                {/* Inbox Left List */}
                <div className="lg:col-span-1 border-r border-border dark:border-gray-800 flex flex-col min-h-0 bg-muted/10 dark:bg-gray-900/30">
                  <div className="p-3 border-b border-border dark:border-gray-800 bg-card dark:bg-gray-850 shrink-0">
                    <p className="text-xs font-bold text-muted-foreground dark:text-gray-400 uppercase tracking-wider">Hội thoại đang hoạt động</p>
                  </div>
                  <div className="flex-1 overflow-y-auto p-2 space-y-1">
                    {channels.map((chan) => (
                      <button
                        key={chan.id}
                        onClick={() => setActiveChannelId(chan.id)}
                        className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all ${
                          activeChannelId === chan.id
                            ? "bg-primary text-primary-foreground shadow-sm"
                            : "hover:bg-muted/80 dark:hover:bg-gray-700 text-foreground dark:text-white"
                        }`}
                      >
                        <Avatar className="h-9 w-9 border dark:border-gray-700">
                          {chan.avatar && <AvatarImage src={chan.avatar} />}
                          <AvatarFallback className="font-bold text-xs bg-muted dark:bg-gray-800 text-foreground dark:text-white">
                            {chan.name.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold truncate">{chan.name}</p>
                          <p className={`text-[10px] truncate mt-0.5 ${
                            activeChannelId === chan.id ? "text-primary-foreground/75" : "text-muted-foreground dark:text-gray-450"
                          }`}>
                            {chan.lastMessage || "Chưa có tin nhắn"}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Inbox Right Chat Window */}
                <div className="lg:col-span-2 flex flex-col min-h-0 bg-background dark:bg-gray-900">
                  {activeChan ? (
                    activeChan.id === "customer-merchant" ? (
                      <ChatComponent
                        channelId="customer-merchant"
                        currentRole="merchant"
                        currentUserName="Phở Thìn Lò Đúc"
                        partnerName="Đỗ Thu Trang"
                        partnerAvatar="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150"
                        partnerRole="customer"
                      />
                    ) : (
                      <ChatComponent
                        channelId="driver-merchant"
                        currentRole="merchant"
                        currentUserName="Phở Thìn Lò Đúc"
                        partnerName="Nguyễn Văn Hùng"
                        partnerAvatar="/driver-portrait-man-1.png"
                        partnerRole="driver"
                      />
                    )
                  ) : (
                    <div className="flex-1 flex items-center justify-center text-sm text-muted-foreground dark:text-gray-400">
                      Chọn một hội thoại để bắt đầu
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {tab === "insights" && <MerchantInsights />}
          {tab === "profile" && <MerchantProfile onLogout={onLogout} />}
          {tab === "support" && <MerchantSupport />}
        </main>
        <div className="fixed inset-x-0 bottom-0 z-40 lg:hidden">
          <MobileTabBar items={NAV} active={tab} onSelect={setTab} />
        </div>
      </div>
    </div>
  )
}
