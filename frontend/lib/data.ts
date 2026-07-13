// Shared mock data for the Kén food logistics platform
// "Pydantic-ready" shaped objects so forms map cleanly onto a backend later.

export type Role = "customer" | "admin" | "driver" | "merchant"

export const HANOI_WARDS = [
  "Cầu Giấy",
  "Đống Đa",
  "Ba Đình",
  "Hoàn Kiếm",
  "Hai Bà Trưng",
  "Thanh Xuân",
  "Tây Hồ",
  "Hà Đông",
  "Long Biên",
  "Nam Từ Liêm",
] as const

export type QualityBadge = "Sạch" | "Đạt chuẩn HACCP" | "Bếp 5 sao" | "Hữu cơ"

export type FoodItem = {
  id: string
  name: string
  merchant: string
  ward: string
  price: number
  rating: number
  reviews: number
  category: string
  image: string
  badges: QualityBadge[]
  status: "approved" | "pending" | "rejected"
  prepTime: number
}

export const CATEGORIES = [
  { id: "pho", name: "Phở & Bún", icon: "🍜" },
  { id: "com", name: "Cơm phần", icon: "🍚" },
  { id: "banh", name: "Bánh mì", icon: "🥖" },
  { id: "chay", name: "Đồ chay", icon: "🥗" },
  { id: "lau", name: "Lẩu & Nướng", icon: "🍲" },
  { id: "drink", name: "Đồ uống", icon: "🧋" },
]

export const FOOD_ITEMS: FoodItem[] = [
  {
    id: "f1",
    name: "Phở bò tái lăn đặc biệt",
    merchant: "Phở Thìn Lò Đúc",
    ward: "Hai Bà Trưng",
    price: 75000,
    rating: 4.9,
    reviews: 1284,
    category: "pho",
    image: "/vietnamese-pho-beef-noodle-soup-premium-bowl.png",
    badges: ["Bếp 5 sao", "Đạt chuẩn HACCP"],
    status: "approved",
    prepTime: 12,
  },
  {
    id: "f2",
    name: "Bún chả Hà Nội than hoa",
    merchant: "Bún Chả Hương Liên",
    ward: "Hoàn Kiếm",
    price: 65000,
    rating: 4.8,
    reviews: 932,
    category: "pho",
    image: "/vietnamese-bun-cha-grilled-pork-noodles.png",
    badges: ["Sạch", "Đạt chuẩn HACCP"],
    status: "approved",
    prepTime: 15,
  },
  {
    id: "f3",
    name: "Cơm tấm sườn bì chả",
    merchant: "Cơm Tấm Sài Gòn",
    ward: "Cầu Giấy",
    price: 55000,
    rating: 4.7,
    reviews: 612,
    category: "com",
    image: "/vietnamese-com-tam-broken-rice-pork-chop.png",
    badges: ["Sạch"],
    status: "approved",
    prepTime: 10,
  },
  {
    id: "f4",
    name: "Bánh mì pate trứng ốp",
    merchant: "Bánh Mì 25",
    ward: "Hoàn Kiếm",
    price: 35000,
    rating: 4.6,
    reviews: 445,
    category: "banh",
    image: "/vietnamese-banh-mi-sandwich-pate-egg.png",
    badges: ["Sạch"],
    status: "approved",
    prepTime: 6,
  },
  {
    id: "f5",
    name: "Buddha bowl chay hữu cơ",
    merchant: "An Nhiên Vegan",
    ward: "Tây Hồ",
    price: 89000,
    rating: 4.9,
    reviews: 287,
    category: "chay",
    image: "/vegan-buddha-bowl-organic-vietnamese.png",
    badges: ["Hữu cơ", "Bếp 5 sao"],
    status: "approved",
    prepTime: 14,
  },
  {
    id: "f6",
    name: "Lẩu riêu cua bắp bò",
    merchant: "Lẩu Phan",
    ward: "Đống Đa",
    price: 320000,
    rating: 4.5,
    reviews: 198,
    category: "lau",
    image: "/vietnamese-crab-hotpot-beef-lau.png",
    badges: ["Đạt chuẩn HACCP"],
    status: "pending",
    prepTime: 20,
  },
  {
    id: "f7",
    name: "Trà sữa trân châu hoàng kim",
    merchant: "Phúc Long Coffee & Tea",
    ward: "Thanh Xuân",
    price: 45000,
    rating: 4.4,
    reviews: 1023,
    category: "drink",
    image: "/golden-bubble-milk-tea-premium.png",
    badges: ["Sạch"],
    status: "pending",
    prepTime: 5,
  },
  {
    id: "f8",
    name: "Bún bò Huế chuẩn vị",
    merchant: "Bún Bò O Xuân",
    ward: "Ba Đình",
    price: 70000,
    rating: 4.8,
    reviews: 524,
    category: "pho",
    image: "/vietnamese-bun-bo-hue-spicy-noodle-soup.png",
    badges: ["Bếp 5 sao", "Sạch"],
    status: "approved",
    prepTime: 13,
  },
]

export type Driver = {
  id: string
  name: string
  avatar: string
  ward: string
  rating: number
  vehicle: string
  plate: string
  status: "online" | "delivering" | "offline"
  distanceKm: number
  trips: number
}

export const DRIVERS: Driver[] = [
  { id: "d1", name: "Nguyễn Văn Hùng", avatar: "/driver-portrait-man-1.png", ward: "Cầu Giấy", rating: 4.9, vehicle: "Honda Wave", plate: "29-H1 234.56", status: "online", distanceKm: 0.8, trips: 2841 },
  { id: "d2", name: "Trần Minh Tuấn", avatar: "/driver-portrait-man-2.png", ward: "Đống Đa", rating: 4.8, vehicle: "Yamaha Sirius", plate: "29-K2 678.90", status: "online", distanceKm: 1.4, trips: 1923 },
  { id: "d3", name: "Lê Thị Hoa", avatar: "/driver-portrait-woman-1.png", ward: "Ba Đình", rating: 5.0, vehicle: "Honda Vision", plate: "29-B3 111.22", status: "delivering", distanceKm: 2.1, trips: 3402 },
  { id: "d4", name: "Phạm Quốc Anh", avatar: "/driver-portrait-man-3.png", ward: "Hai Bà Trưng", rating: 4.7, vehicle: "Honda Wave", plate: "29-C4 555.66", status: "online", distanceKm: 0.5, trips: 998 },
]

export type OrderStatus = "Chờ xác nhận" | "Đang nấu" | "Đang giao" | "Đã nhận"
export const ORDER_STEPS: OrderStatus[] = ["Chờ xác nhận", "Đang nấu", "Đang giao", "Đã nhận"]

export type Order = {
  id: string
  items: { name: string; qty: number; price: number }[]
  merchant: string
  ward: string
  customer: string
  driver: string
  status: OrderStatus
  total: number
  createdAt: string
  eta: number
}

export const ORDERS: Order[] = [
  {
    id: "KEN-83920",
    items: [{ name: "Phở bò tái lăn đặc biệt", qty: 2, price: 75000 }],
    merchant: "Phở Thìn Lò Đúc",
    ward: "Hai Bà Trưng",
    customer: "Đỗ Thu Trang",
    driver: "Nguyễn Văn Hùng",
    status: "Đang giao",
    total: 165000,
    createdAt: "10:24",
    eta: 8,
  },
  {
    id: "KEN-83915",
    items: [
      { name: "Bún chả Hà Nội than hoa", qty: 1, price: 65000 },
      { name: "Trà sữa trân châu hoàng kim", qty: 2, price: 45000 },
    ],
    merchant: "Bún Chả Hương Liên",
    ward: "Hoàn Kiếm",
    customer: "Đỗ Thu Trang",
    driver: "Lê Thị Hoa",
    status: "Đang nấu",
    total: 155000,
    createdAt: "10:18",
    eta: 18,
  },
  {
    id: "KEN-83901",
    items: [{ name: "Cơm tấm sườn bì chả", qty: 1, price: 55000 }],
    merchant: "Cơm Tấm Sài Gòn",
    ward: "Cầu Giấy",
    customer: "Đỗ Thu Trang",
    driver: "—",
    status: "Đã nhận",
    total: 55000,
    createdAt: "Hôm qua",
    eta: 0,
  },
]

export type Voucher = {
  id: string
  code: string
  store: string
  discount: string
  minOrder: number
  expires: string
  color: string
}

export const VOUCHERS: Voucher[] = [
  { id: "v1", code: "PHOTHIN30", store: "Phở Thìn Lò Đúc", discount: "Giảm 30K", minOrder: 100000, expires: "30/06", color: "amber" },
  { id: "v2", code: "FREESHIP0D", store: "Toàn sàn Kén", discount: "Freeship", minOrder: 50000, expires: "Hôm nay", color: "emerald" },
  { id: "v3", code: "VEGAN15", store: "An Nhiên Vegan", discount: "Giảm 15%", minOrder: 80000, expires: "15/07", color: "lime" },
  { id: "v4", code: "TEATIME20", store: "Phúc Long", discount: "Giảm 20K", minOrder: 70000, expires: "25/06", color: "rose" },
  { id: "v5", code: "LAUPHAN50", store: "Lẩu Phan", discount: "Giảm 50K", minOrder: 300000, expires: "01/07", color: "orange" },
  { id: "v6", code: "WELCOME25", store: "Toàn sàn Kén", discount: "Giảm 25K", minOrder: 0, expires: "Vô thời hạn", color: "sky" },
]

// Chart data
export const GMV_TREND = [
  { month: "T1", gmv: 820, orders: 12400 },
  { month: "T2", gmv: 932, orders: 13900 },
  { month: "T3", gmv: 1290, orders: 18200 },
  { month: "T4", gmv: 1450, orders: 20100 },
  { month: "T5", gmv: 1680, orders: 23400 },
  { month: "T6", gmv: 2010, orders: 27800 },
]

export const RATING_TREND = [
  { month: "T1", rating: 4.4 },
  { month: "T2", rating: 4.5 },
  { month: "T3", rating: 4.55 },
  { month: "T4", rating: 4.62 },
  { month: "T5", rating: 4.7 },
  { month: "T6", rating: 4.78 },
]

export const DISTRICT_HEAT = [
  { district: "Cầu Giấy", drivers: 42, orders: 318, intensity: 0.9 },
  { district: "Đống Đa", drivers: 38, orders: 287, intensity: 0.82 },
  { district: "Hai Bà Trưng", drivers: 31, orders: 241, intensity: 0.68 },
  { district: "Thanh Xuân", drivers: 27, orders: 198, intensity: 0.56 },
  { district: "Ba Đình", drivers: 24, orders: 176, intensity: 0.48 },
  { district: "Hoàn Kiếm", drivers: 19, orders: 152, intensity: 0.4 },
  { district: "Tây Hồ", drivers: 15, orders: 121, intensity: 0.32 },
  { district: "Hà Đông", drivers: 12, orders: 98, intensity: 0.25 },
  { district: "Long Biên", drivers: 9, orders: 74, intensity: 0.18 },
]

export const DRIVER_INCOME = [
  { day: "T2", income: 420 },
  { day: "T3", income: 510 },
  { day: "T4", income: 380 },
  { day: "T5", income: 640 },
  { day: "T6", income: 720 },
  { day: "T7", income: 890 },
  { day: "CN", income: 560 },
]

export function formatVND(n: number) {
  return new Intl.NumberFormat("vi-VN").format(n) + "₫"
}
