import { useState, useEffect } from "react"
import { RefreshCw, AlertCircle, TrendingUp, DollarSign, ChefHat } from "lucide-react"
import { getMerchantBatchSummary } from "@/src/api/kenServices"
import { formatVND } from "@/lib/data"
import { cn } from "@/lib/utils"

export function MerchantBatchSummary() {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastCompiled, setLastCompiled] = useState<string>("")

  const loadBatchSummary = async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await getMerchantBatchSummary(1) // dummy merchant_id = 1
      if (res && res.items) {
        setData(res.items)
      } else if (Array.isArray(res)) {
        setData(res)
      } else {
        setData([])
      }
      setLastCompiled(new Date().toLocaleTimeString())
    } catch (err: any) {
      console.warn("Failed to fetch merchant batch summary, using mock fallback:", err)
      setError(err?.message || "Không thể kết nối Backend API")
      // Mock data for kitchen prep compilation
      setData([
        { food_name: "Phở Thìn Lò Đúc (Tái Lăn)", quantity: 24, raw_revenue: 1560000 },
        { food_name: "Phở Gà Ta Lâm Cô Chi", quantity: 15, raw_revenue: 900000 },
        { food_name: "Bánh Mì Kẹp Xá Xíu Hội An", quantity: 38, raw_revenue: 1330000 },
        { food_name: "Cơm Tấm Sườn Bì Chả Đặc Biệt", quantity: 18, raw_revenue: 1170000 }
      ])
      setLastCompiled("10:01 AM (Giờ cắt ca trưa)")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadBatchSummary()
  }, [])

  const totalQuantity = data.reduce((s, item) => s + (item.quantity || item.total_quantity || 0), 0)
  const totalRawRevenue = data.reduce((s, item) => s + (item.raw_revenue || item.revenue || 0), 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-amber-600/20 dark:border-emerald-600/20 pb-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-foreground dark:text-white">Báo cáo Gom món (10:01 AM)</h2>
          <p className="text-xs text-muted-foreground dark:text-gray-400 mt-1">
            Tổng hợp danh sách các món cần chuẩn bị hàng loạt cho ca giao trưa
          </p>
        </div>
        <button
          onClick={loadBatchSummary}
          className="flex items-center gap-1.5 text-xs text-primary border border-border bg-background dark:bg-gray-850 rounded-lg px-2.5 py-1.5 shadow-xs font-semibold cursor-pointer hover:bg-muted dark:hover:bg-gray-750 transition-colors"
        >
          <RefreshCw className={cn("h-3.5 w-3.5", loading && "animate-spin")} />
          Tải lại
        </button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-border bg-card p-4.5 shadow-sm flex items-center gap-4">
          <div className="h-10 w-10 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
            <ChefHat className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Tổng số phần ăn</p>
            <p className="text-xl font-black text-foreground">{totalQuantity} phần</p>
          </div>
        </div>
        <div className="rounded-2xl border border-border bg-card p-4.5 shadow-sm flex items-center gap-4">
          <div className="h-10 w-10 bg-emerald-500/10 rounded-xl flex items-center justify-center shrink-0">
            <DollarSign className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Doanh thu thô (Raw Revenue)</p>
            <p className="text-xl font-black text-emerald-600 dark:text-emerald-450">{formatVND(totalRawRevenue)}</p>
          </div>
        </div>
        <div className="rounded-2xl border border-border bg-card p-4.5 shadow-sm flex items-center gap-4">
          <div className="h-10 w-10 bg-amber-500/10 rounded-xl flex items-center justify-center shrink-0">
            <RefreshCw className="h-5 w-5 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Lần gom cuối</p>
            <p className="text-sm font-bold text-foreground">{lastCompiled}</p>
          </div>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-xl bg-amber-500/10 border border-amber-500/20 p-3.5 text-xs text-amber-650 dark:text-amber-400">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>Chú ý: Không kết nối được API Backend. Đang hiển thị dữ liệu mô phỏng gom món.</span>
        </div>
      )}

      {/* Summary Grid Panel */}
      <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="p-4 bg-muted/30 dark:bg-gray-800 border-b border-border">
          <h3 className="text-xs font-bold text-foreground dark:text-white uppercase tracking-wider">Danh sách chuẩn bị bếp</h3>
        </div>
        {loading ? (
          <div className="p-12 text-center text-sm text-muted-foreground flex justify-center items-center gap-2">
            <RefreshCw className="h-4 w-4 animate-spin text-primary" />
            Đang tổng hợp dữ liệu...
          </div>
        ) : data.length === 0 ? (
          <div className="p-12 text-center text-sm text-muted-foreground font-semibold">
            Không có món nào cần gom trong ca này.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/10 dark:bg-gray-850 text-xs font-bold text-muted-foreground dark:text-gray-400 uppercase">
                  <th className="p-4">Tên Món Ăn (Food Item Name)</th>
                  <th className="p-4 text-center">Số Lượng Gom (Total Quantity)</th>
                  <th className="p-4 text-right">Doanh Thu Thô (Raw Revenue)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {data.map((item, index) => (
                  <tr key={index} className="hover:bg-muted/5 dark:hover:bg-gray-850/50 transition-colors">
                    <td className="p-4 font-bold text-foreground dark:text-gray-200">{item.food_name || item.name}</td>
                    <td className="p-4 text-center font-black text-primary text-base">
                      {item.quantity || item.total_quantity}
                    </td>
                    <td className="p-4 text-right font-semibold text-foreground dark:text-gray-200">
                      {formatVND(item.raw_revenue || item.revenue)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
