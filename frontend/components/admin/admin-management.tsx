"use client"

import { useState } from "react"
import { Plus, Search, Pencil, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DRIVERS } from "@/lib/data"

type RowStatus = "active" | "pending" | "suspended"

const MERCHANTS = [
  { id: "m1", name: "Phở Thìn Lò Đúc", ward: "Hai Bà Trưng", items: 24, status: "active" as RowStatus },
  { id: "m2", name: "Bún Chả Hương Liên", ward: "Hoàn Kiếm", items: 18, status: "active" as RowStatus },
  { id: "m3", name: "Lẩu Phan", ward: "Đống Đa", items: 42, status: "pending" as RowStatus },
  { id: "m4", name: "An Nhiên Vegan", ward: "Tây Hồ", items: 31, status: "active" as RowStatus },
  { id: "m5", name: "Phúc Long", ward: "Thanh Xuân", items: 56, status: "suspended" as RowStatus },
]

const CUSTOMERS = [
  { id: "c1", name: "Đỗ Thu Trang", ward: "Hai Bà Trưng", orders: 142, status: "active" as RowStatus },
  { id: "c2", name: "Vũ Hoàng Nam", ward: "Cầu Giấy", orders: 88, status: "active" as RowStatus },
  { id: "c3", name: "Ngô Bảo Châu", ward: "Ba Đình", orders: 23, status: "active" as RowStatus },
  { id: "c4", name: "Lý Mai Anh", ward: "Đống Đa", orders: 5, status: "suspended" as RowStatus },
]

const STATUS_LABEL: Record<RowStatus, { label: string; cls: string }> = {
  active: { label: "Hoạt động", cls: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  pending: { label: "Chờ duyệt", cls: "bg-amber-50 text-amber-700 border-amber-200" },
  suspended: { label: "Tạm khóa", cls: "bg-rose-50 text-rose-700 border-rose-200" },
}

export function AdminManagement() {
  const [query, setQuery] = useState("")

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Quản lý người dùng</h1>
          <p className="text-sm text-muted-foreground">CRUD đối tác, tài xế và khách hàng</p>
        </div>
        <Button className="gap-1.5">
          <Plus className="h-4 w-4" /> Thêm mới
        </Button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Tìm theo tên..."
          className="rounded-xl pl-9"
        />
      </div>

      <Tabs defaultValue="merchants">
        <TabsList className="rounded-xl">
          <TabsTrigger value="merchants" className="rounded-lg">Đối tác</TabsTrigger>
          <TabsTrigger value="drivers" className="rounded-lg">Tài xế</TabsTrigger>
          <TabsTrigger value="customers" className="rounded-lg">Khách hàng</TabsTrigger>
        </TabsList>

        <TabsContent value="merchants" className="mt-4">
          <DataTable
            cols={["Cửa hàng", "Khu vực", "Món", "Trạng thái", ""]}
            rows={MERCHANTS.filter((m) => m.name.toLowerCase().includes(query.toLowerCase())).map((m) => ({
              id: m.id,
              cells: [m.name, m.ward, String(m.items), <StatusBadge key="s" status={m.status} />],
            }))}
          />
        </TabsContent>

        <TabsContent value="drivers" className="mt-4">
          <DataTable
            cols={["Tài xế", "Khu vực", "Chuyến", "Trạng thái", ""]}
            rows={DRIVERS.filter((d) => d.name.toLowerCase().includes(query.toLowerCase())).map((d) => ({
              id: d.id,
              cells: [
                <span key="n" className="flex items-center gap-2">
                  <Avatar className="h-7 w-7">
                    <AvatarImage src={d.avatar || "/placeholder.svg"} alt={d.name} />
                    <AvatarFallback>{d.name[0]}</AvatarFallback>
                  </Avatar>
                  {d.name}
                </span>,
                d.ward,
                String(d.trips),
                <StatusBadge key="s" status={d.status === "offline" ? "suspended" : "active"} />,
              ],
            }))}
          />
        </TabsContent>

        <TabsContent value="customers" className="mt-4">
          <DataTable
            cols={["Khách hàng", "Khu vực", "Đơn", "Trạng thái", ""]}
            rows={CUSTOMERS.filter((c) => c.name.toLowerCase().includes(query.toLowerCase())).map((c) => ({
              id: c.id,
              cells: [c.name, c.ward, String(c.orders), <StatusBadge key="s" status={c.status} />],
            }))}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}

function StatusBadge({ status }: { status: RowStatus }) {
  const s = STATUS_LABEL[status]
  return (
    <Badge variant="outline" className={s.cls}>
      {s.label}
    </Badge>
  )
}

function DataTable({
  cols,
  rows,
}: {
  cols: string[]
  rows: { id: string; cells: React.ReactNode[] }[]
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              {cols.map((c, i) => (
                <th key={i} className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-b border-border last:border-0 hover:bg-muted/30">
                {r.cells.map((cell, i) => (
                  <td key={i} className="px-4 py-3 font-medium text-foreground">
                    {cell}
                  </td>
                ))}
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="Sửa">
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" aria-label="Xóa">
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
