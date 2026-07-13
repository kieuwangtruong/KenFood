"use client"

import { useState } from "react"
import { ScanFace, CheckCircle2, Loader2, MapPin, Clock, User, Trash2, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { HANOI_WARDS } from "@/lib/data"
import { cn } from "@/lib/utils"

export function DriverOnboarding({ onLogout }: { onLogout: () => void }) {
  const [scan, setScan] = useState<"idle" | "scanning" | "done">("done") // pre-scan to avoid repetitive flow for user
  const [name, setName] = useState("Nguyễn Văn Hùng")
  const [phone, setPhone] = useState("0912 345 678")
  const [email, setEmail] = useState("hung.nguyen@ken.vn")
  const [plate, setPlate] = useState("29-H1 234.56")
  const [ward, setWard] = useState("Cầu Giấy")
  const [shift, setShift] = useState("morning")
  const [avatar, setAvatar] = useState("https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150")
  const [addresses, setAddresses] = useState<string[]>(["Ngõ 165 Cầu Giấy, Quan Hoa, Hà Nội"])
  const [newAddress, setNewAddress] = useState("")
  const [errors, setErrors] = useState<{ name?: string; plate?: string }>({})
  const [saved, setSaved] = useState(false)

  const AVATARS = [
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
    "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150",
    "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150"
  ]

  const runScan = () => {
    setScan("scanning")
    setTimeout(() => setScan("done"), 2500)
  }

  const handleAddAddress = () => {
    if (newAddress.trim().length >= 10) {
      setAddresses([...addresses, newAddress.trim()])
      setNewAddress("")
    }
  }

  const handleDeleteAddress = (idx: number) => {
    setAddresses(addresses.filter((_, i) => i !== idx))
  }

  // Pydantic-style validation
  const PLATE_RE = /^\d{2}-[A-Z]\d\s?\d{3}\.\d{2}$/
  const save = () => {
    const next: typeof errors = {}
    if (name.trim().length < 3) next.name = "Họ tên phải có ít nhất 3 ký tự."
    if (!PLATE_RE.test(plate.trim())) next.plate = "Biển số không hợp lệ (vd: 29-H1 234.56)."
    setErrors(next)
    if (Object.keys(next).length === 0) {
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    }
  }

  return (
    <div className="pb-8">
      <div className="bg-[#F4EFEA] dark:bg-gray-900 border-b border-amber-600/20 dark:border-emerald-600/20 px-5 py-6 text-gray-900 dark:text-white">
        <h1 className="text-xl font-bold">Hồ sơ tài xế</h1>
        <p className="mt-0.5 text-xs text-gray-600 dark:text-gray-400 font-semibold">
          Xác thực diện mạo & đăng ký ca hoạt động
        </p>
      </div>

      {/* Avatar Simulation */}
      <section className="px-5 pt-5">
        <div className="flex flex-col items-center rounded-2xl border border-border bg-card p-5 shadow-sm">
          <Avatar className="h-20 w-20 border-2 border-primary">
            <AvatarImage src={avatar} />
            <AvatarFallback className="bg-primary/10 text-primary font-bold">NV</AvatarFallback>
          </Avatar>
          <div className="flex gap-2 mt-3">
            {AVATARS.map((av, index) => (
              <button
                key={index}
                onClick={() => setAvatar(av)}
                className={cn(
                  "h-9.5 w-9.5 rounded-full overflow-hidden border-2 transition-all",
                  avatar === av ? "border-primary scale-105" : "border-transparent opacity-60"
                )}
              >
                <img src={av} alt="av" className="object-cover h-full w-full" />
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Facial recognition */}
      <section className="px-5 pt-5">
        <div className="flex flex-col items-center rounded-2xl border border-border bg-card p-4 shadow-sm text-center">
          <div
            className={cn(
              "relative flex h-20 w-20 items-center justify-center rounded-full border-4 transition-colors",
              scan === "done"
                ? "border-emerald-500 bg-emerald-50"
                : scan === "scanning"
                  ? "border-primary bg-primary/10"
                  : "border-dashed border-border bg-muted",
            )}
          >
            {scan === "scanning" && (
              <span className="absolute inset-0 animate-ping rounded-full border-2 border-primary/40" />
            )}
            {scan === "done" ? (
              <CheckCircle2 className="h-10 w-10 text-emerald-500" />
            ) : scan === "scanning" ? (
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            ) : (
              <ScanFace className="h-10 w-10 text-muted-foreground" />
            )}
          </div>
          <p className="mt-2 text-xs font-bold text-foreground">
            {scan === "done"
              ? "Diện mạo đã được đối sánh"
              : scan === "scanning"
                ? "Đang quét khuôn mặt..."
                : "Quét nhận diện khuôn mặt"}
          </p>
          {scan !== "done" && (
            <Button onClick={runScan} disabled={scan === "scanning"} size="sm" className="mt-2 w-full text-xs">
              {scan === "scanning" ? "Đang quét..." : "Nhận diện sinh trắc học"}
            </Button>
          )}
        </div>
      </section>

      {/* Profile edit */}
      <section className="px-5 pt-5">
        <p className="mb-3 flex items-center gap-1.5 text-sm font-bold text-foreground">
          <User className="h-4 w-4 text-primary" /> Thông tin cá nhân & Liên lạc
        </p>
        <div className="space-y-3 rounded-2xl border border-border bg-card p-4 shadow-sm">
          <div>
            <Label className="text-xs">Họ và tên tài xế</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={cn("mt-1 rounded-xl", errors.name && "border-destructive")}
            />
            {errors.name && <p className="mt-1 text-xs text-destructive">{errors.name}</p>}
          </div>
          <div>
            <Label className="text-xs">Số điện thoại</Label>
            <Input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="mt-1 rounded-xl"
            />
          </div>
          <div>
            <Label className="text-xs">Email nội bộ</Label>
            <Input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 rounded-xl"
            />
          </div>
          <div>
            <Label className="text-xs">Biển số xe máy</Label>
            <Input
              value={plate}
              onChange={(e) => setPlate(e.target.value)}
              className={cn("mt-1 rounded-xl", errors.plate && "border-destructive")}
            />
            {errors.plate && <p className="mt-1 text-xs text-destructive">{errors.plate}</p>}
          </div>
        </div>
      </section>

      {/* Driver address book */}
      <section className="px-5 pt-5">
        <p className="mb-3 flex items-center gap-1.5 text-sm font-bold text-foreground">
          <MapPin className="h-4 w-4 text-primary" /> Địa chỉ tạm trú / Liên hệ khẩn cấp
        </p>
        <div className="space-y-3 rounded-2xl border border-border bg-card p-4 shadow-sm">
          <div className="space-y-2">
            {addresses.map((addr, idx) => (
              <div key={idx} className="flex gap-2 items-start bg-muted/40 p-2.5 rounded-xl border">
                <MapPin className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />
                <span className="text-xs flex-1 leading-relaxed text-foreground">{addr}</span>
                <button onClick={() => handleDeleteAddress(idx)} className="text-destructive p-0.5 hover:bg-destructive/10 rounded transition-colors shrink-0">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
          <div className="flex gap-2 pt-1">
            <Input
              value={newAddress}
              onChange={(e) => setNewAddress(e.target.value)}
              placeholder="Nhập địa chỉ tạm trú mới..."
              className="rounded-xl flex-1 text-xs"
            />
            <Button onClick={handleAddAddress} size="sm" className="rounded-xl shrink-0">Thêm</Button>
          </div>
        </div>
      </section>

      {/* Shift & location */}
      <section className="px-5 pt-5">
        <p className="mb-3 flex items-center gap-1.5 text-sm font-bold text-foreground">
          <Clock className="h-4 w-4 text-primary" /> Đăng ký ca & khu vực hoạt động
        </p>
        <div className="space-y-3 rounded-2xl border border-border bg-card p-4 shadow-sm">
          <div>
            <Label className="flex items-center gap-1 text-xs">
              <MapPin className="h-3.5 w-3.5" /> Quận/Huyện hoạt động chính
            </Label>
            <Select value={ward} onValueChange={(val) => setWard(val || "")}>
              <SelectTrigger className="mt-1 rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {HANOI_WARDS.map((w) => (
                  <SelectItem key={w} value={w}>
                    {w}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs">Ca đăng ký nhận đơn</Label>
            <Select value={shift} onValueChange={(val) => setShift(val || "")}>
              <SelectTrigger className="mt-1 rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="morning">Ca sáng (06:00 – 12:00)</SelectItem>
                <SelectItem value="afternoon">Ca chiều (12:00 – 18:00)</SelectItem>
                <SelectItem value="evening">Ca tối (18:00 – 00:00)</SelectItem>
                <SelectItem value="fulltime">Toàn thời gian</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </section>

      <div className="px-5 pt-6 space-y-3">
        <Button onClick={save} className="h-11 w-full font-bold bg-primary text-primary-foreground hover:bg-primary/95">
          {saved ? "Đã lưu hồ sơ!" : "Cập nhật hồ sơ & Đăng ký ca"}
        </Button>
        <Button
          variant="outline"
          onClick={onLogout}
          className="h-11 w-full font-bold border-destructive/30 text-destructive hover:bg-destructive/5 hover:text-destructive flex items-center justify-center gap-1.5"
        >
          <LogOut className="h-4 w-4" /> Đăng xuất tài xế
        </Button>
      </div>
    </div>
  )
}
