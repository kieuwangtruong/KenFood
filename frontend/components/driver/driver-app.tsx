import { useState } from "react"
import { UserCheck, Activity, Map, MessageSquare, ArrowLeft } from "lucide-react"
import { PhoneFrame } from "@/components/shell/phone-frame"
import { MobileTabBar, type NavItem } from "@/components/shell/sidebar"
import { DriverOnboarding } from "./driver-onboarding"
import { DriverHub } from "./driver-hub"
import { DriverMaps } from "./driver-maps"
import { DeliveryCycleBar } from "./delivery-cycle-bar"
import { ChatComponent } from "@/components/chat-component"
import { useChat } from "@/lib/chat-context"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ThemeToggle } from "@/components/theme-toggle"

const NAV: NavItem[] = [
  { id: "duty", label: "Ca làm", icon: Activity },
  { id: "maps", label: "Bản đồ", icon: Map },
  { id: "chat", label: "Tin nhắn", icon: MessageSquare },
  { id: "onboarding", label: "Hồ sơ", icon: UserCheck },
]

export function DriverApp({
  onLogout,
  theme,
  toggleTheme,
}: {
  onLogout: () => void
  theme: "light" | "dark"
  toggleTheme: () => void
}) {
  const [tab, setTab] = useState("duty")
  const [activeChannelId, setActiveChannelId] = useState<string | null>(null)
  const { getChannelsForRole } = useChat()

  const channels = getChannelsForRole("driver")

  return (
    <div className="h-full w-full bg-[#F4EFEA] dark:bg-gray-900">
      <PhoneFrame
        header={
          <div className="flex items-center justify-between px-4 py-3 bg-[#F4EFEA] dark:bg-gray-900 border-b border-amber-600/30 dark:border-emerald-600/30">
            <div className="flex items-center gap-2 px-1">
              <img
                src="/logo.jpg"
                alt="Kén Logo"
                className="h-10 w-auto object-contain rounded-lg"
                onError={(e) => {
                  e.currentTarget.src = "/logo.png"
                }}
              />
              <span className="font-black text-gray-900 dark:text-white text-xs tracking-tight"><span className="text-secondary dark:text-amber-500 font-bold">Driver</span></span>
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
            </div>
          </div>
        }
        bottomBar={
          <>
            {/* Hide cycle bar when chatting or viewing profile for better screen real estate */}
            {(tab === "duty" || tab === "maps") && <DeliveryCycleBar />}
            <MobileTabBar items={NAV} active={tab} onSelect={(t) => {
              setTab(t)
            }} />
          </>
        }
      >
      {tab === "duty" && <DriverHub />}
      {tab === "maps" && <DriverMaps />}
      
      {tab === "chat" && (
        <div className="h-[calc(100vh-8.5rem)] flex flex-col bg-muted/10 dark:bg-gray-900/40">
          {activeChannelId ? (
            <div className="flex-1 flex flex-col min-h-0">
              <div className="bg-card dark:bg-gray-800 px-3 py-1.5 border-b border-border dark:border-gray-850 flex items-center shrink-0">
                <button
                  type="button"
                  onClick={() => setActiveChannelId(null)}
                  className="flex items-center gap-1 text-xs font-bold text-primary dark:text-emerald-450 hover:bg-muted dark:hover:bg-gray-700 p-1.5 rounded-lg transition-colors shrink-0 cursor-pointer"
                >
                  <ArrowLeft className="h-4 w-4" /> Hộp thư
                </button>
              </div>
              <div className="flex-1 min-h-0">
                {activeChannelId === "customer-driver" ? (
                  <ChatComponent
                    channelId="customer-driver"
                    currentRole="driver"
                    currentUserName="Nguyễn Văn Hùng"
                    partnerName="Đỗ Thu Trang"
                    partnerAvatar="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150"
                    partnerRole="customer"
                  />
                ) : (
                  <ChatComponent
                    channelId="driver-merchant"
                    currentRole="driver"
                    currentUserName="Nguyễn Văn Hùng"
                    partnerName="Phở Thìn Lò Đúc"
                    partnerAvatar="/store-placeholder.png"
                    partnerRole="merchant"
                  />
                )}
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col min-h-0 bg-background dark:bg-gray-900">
              <div className="bg-[#F4EFEA] dark:bg-gray-900 px-5 py-6 border-b border-amber-600/20 dark:border-emerald-600/20 text-gray-900 dark:text-white shrink-0">
                <h1 className="text-xl font-bold">Kênh đàm thoại</h1>
                <p className="mt-0.5 text-xs text-gray-600 dark:text-gray-400 font-semibold">
                  Điều phối đơn hàng với khách hàng & nhà hàng
                </p>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
                {channels.map((chan) => (
                  <button
                    key={chan.id}
                    onClick={() => setActiveChannelId(chan.id)}
                    className="w-full flex items-center gap-3 p-3.5 rounded-2xl border border-border dark:border-gray-800 bg-card dark:bg-gray-800 shadow-sm text-left hover:border-primary/30 dark:hover:border-primary/50 hover:bg-muted dark:hover:bg-gray-700 transition-all active:scale-[0.99] cursor-pointer"
                  >
                    <Avatar className="h-11 w-11 border dark:border-gray-700">
                      {chan.avatar && <AvatarImage src={chan.avatar} />}
                      <AvatarFallback className="font-bold bg-muted dark:bg-gray-700 text-xs text-foreground dark:text-white">
                        {chan.name.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-foreground dark:text-white truncate">{chan.name}</p>
                      <p className="text-[11px] text-muted-foreground dark:text-gray-400 truncate mt-0.5 font-medium">
                        {chan.lastMessage || "Chưa có cuộc trò chuyện"}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
      
      {tab === "onboarding" && <DriverOnboarding onLogout={onLogout} />}
    </PhoneFrame>
    </div>
  )
}
