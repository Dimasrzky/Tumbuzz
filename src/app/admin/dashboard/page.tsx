"use client";

import { useState } from "react";
import {
  Users, ShoppingBag, TrendingUp, Banknote,
  ArrowUpRight, ArrowDownRight, Calendar,
  CheckCircle2, Clock, Package,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ── Mock Data ─────────────────────────────────────────────────────────────
const STATS = [
  {
    label: "Total Pendapatan",
    value: "Rp 12.450.000",
    change: "+18.2%",
    trend: "up",
    icon: Banknote,
    color: "text-[#c8e6c9]",
    bg: "bg-[#c8e6c9]/10",
  },
  {
    label: "Order Hari Ini",
    value: "48",
    change: "+12.5%",
    trend: "up",
    icon: ShoppingBag,
    color: "text-blue-400",
    bg: "bg-blue-400/10",
  },
  {
    label: "Pengguna Aktif",
    value: "234",
    change: "+5.1%",
    trend: "up",
    icon: Users,
    color: "text-violet-400",
    bg: "bg-violet-400/10",
  },
  {
    label: "Produk Terjual",
    value: "1.284",
    change: "-3.2%",
    trend: "down",
    icon: Package,
    color: "text-amber-400",
    bg: "bg-amber-400/10",
  },
];

const CHART_DATA = [
  { day: "Sen", orders: 24, revenue: 840000 },
  { day: "Sel", orders: 38, revenue: 1320000 },
  { day: "Rab", orders: 31, revenue: 1050000 },
  { day: "Kam", orders: 45, revenue: 1580000 },
  { day: "Jum", orders: 52, revenue: 1890000 },
  { day: "Sab", orders: 61, revenue: 2100000 },
  { day: "Min", orders: 48, revenue: 1670000 },
];

const RECENT_ORDERS = [
  { id: "TBZ-048", user: "Budi Santoso", items: 4, total: 245000, status: "selesai", time: "10 menit lalu" },
  { id: "TBZ-047", user: "Siti Rahayu", items: 2, total: 85000, status: "proses", time: "25 menit lalu" },
  { id: "TBZ-046", user: "Ahmad Fauzi", items: 7, total: 412000, status: "selesai", time: "1 jam lalu" },
  { id: "TBZ-045", user: "Dewi Lestari", items: 3, total: 167000, status: "selesai", time: "2 jam lalu" },
  { id: "TBZ-044", user: "Rizki Pratama", items: 1, total: 32000, status: "dibatalkan", time: "3 jam lalu" },
];

const STATUS_CONFIG = {
  selesai: { label: "Selesai", className: "bg-[#c8e6c9]/10 text-[#c8e6c9] border-[#c8e6c9]/20", dot: "bg-[#c8e6c9]" },
  proses: { label: "Diproses", className: "bg-amber-400/10 text-amber-400 border-amber-400/20", dot: "bg-amber-400" },
  dibatalkan: { label: "Dibatalkan", className: "bg-red-400/10 text-red-400 border-red-400/20", dot: "bg-red-400" },
};

const TOP_PRODUCTS = [
  { name: "Indomie Goreng", sold: 482, revenue: 1687000 },
  { name: "Beras Pandan 5kg", sold: 124, revenue: 10540000 },
  { name: "Telur Ayam 1kg", sold: 210, revenue: 5880000 },
  { name: "Minyak Goreng 2L", sold: 98, revenue: 3136000 },
  { name: "Susu UHT Ultra 1L", sold: 145, revenue: 2682500 },
];

export default function AdminDashboardPage() {
  const [chartMetric, setChartMetric] = useState<"orders" | "revenue">("orders");

  const maxVal = Math.max(...CHART_DATA.map((d) => d[chartMetric]));

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1
            className="text-2xl font-bold text-white"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Dashboard
          </h1>
          <p className="text-xs text-white/30 mt-0.5 flex items-center gap-1.5">
            <Calendar size={11} />
            Senin, 9 Maret 2025
          </p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#c8e6c9]/10 border border-[#c8e6c9]/15">
          <div className="w-1.5 h-1.5 rounded-full bg-[#c8e6c9] animate-pulse" />
          <span className="text-xs font-semibold text-[#c8e6c9]">Live</span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {STATS.map((stat) => (
          <div
            key={stat.label}
            className="bg-[#0f0f0f] border border-white/6 rounded-2xl p-5 hover:border-white/12 transition-all"
          >
            <div className="flex items-start justify-between mb-4">
              <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center", stat.bg)}>
                <stat.icon size={16} className={stat.color} />
              </div>
              <div className={cn(
                "flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full",
                stat.trend === "up"
                  ? "bg-[#c8e6c9]/8 text-[#c8e6c9]"
                  : "bg-red-400/8 text-red-400"
              )}>
                {stat.trend === "up"
                  ? <ArrowUpRight size={11} />
                  : <ArrowDownRight size={11} />}
                {stat.change}
              </div>
            </div>
            <p className="text-xl font-bold text-white mb-1">{stat.value}</p>
            <p className="text-xs text-white/30">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Chart + Recent Orders */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">

        {/* Bar Chart */}
        <div className="xl:col-span-2 bg-[#0f0f0f] border border-white/6 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-sm font-bold text-white">Aktivitas Mingguan</h2>
              <p className="text-[11px] text-white/30 mt-0.5">7 hari terakhir</p>
            </div>
            <div className="flex gap-1.5">
              {(["orders", "revenue"] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => setChartMetric(m)}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-xs font-semibold transition-all",
                    chartMetric === m
                      ? "bg-[#c8e6c9]/15 text-[#c8e6c9] border border-[#c8e6c9]/20"
                      : "text-white/30 hover:text-white/60"
                  )}
                >
                  {m === "orders" ? "Order" : "Revenue"}
                </button>
              ))}
            </div>
          </div>

          {/* Bars */}
          <div className="flex items-end justify-between gap-2 h-40">
            {CHART_DATA.map((d) => {
              const height = (d[chartMetric] / maxVal) * 100;
              return (
                <div key={d.day} className="flex-1 flex flex-col items-center gap-2">
                  <div className="w-full flex items-end" style={{ height: "120px" }}>
                    <div
                      className="w-full rounded-t-lg bg-gradient-to-t from-[#2d6a2d] to-[#c8e6c9]/60 hover:to-[#c8e6c9] transition-all duration-300 cursor-pointer group relative"
                      style={{ height: `${height}%`, minHeight: "4px" }}
                    >
                      {/* Tooltip */}
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 hidden group-hover:block bg-[#1a1a1a] border border-white/10 rounded-lg px-2 py-1 whitespace-nowrap z-10">
                        <p className="text-[10px] font-bold text-white">
                          {chartMetric === "orders"
                            ? `${d.orders} order`
                            : `Rp ${(d.revenue / 1000000).toFixed(1)}jt`}
                        </p>
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] text-white/30 font-medium">{d.day}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-[#0f0f0f] border border-white/6 rounded-2xl p-5">
          <div className="mb-5">
            <h2 className="text-sm font-bold text-white">Produk Terlaris</h2>
            <p className="text-[11px] text-white/30 mt-0.5">Minggu ini</p>
          </div>
          <div className="space-y-3">
            {TOP_PRODUCTS.map((p, i) => {
              const maxSold = TOP_PRODUCTS[0].sold;
              const pct = (p.sold / maxSold) * 100;
              return (
                <div key={p.name}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-white/20 w-4">{i + 1}</span>
                      <span className="text-xs font-medium text-white/70">{p.name}</span>
                    </div>
                    <span className="text-[11px] font-bold text-[#c8e6c9]">{p.sold}×</span>
                  </div>
                  <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#2d6a2d] to-[#c8e6c9]/60 rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-[#0f0f0f] border border-white/6 rounded-2xl p-5">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-sm font-bold text-white">Order Terbaru</h2>
            <p className="text-[11px] text-white/30 mt-0.5">Hari ini</p>
          </div>
          <button className="text-xs text-[#c8e6c9]/60 hover:text-[#c8e6c9] transition-colors flex items-center gap-1">
            Lihat semua <TrendingUp size={11} />
          </button>
        </div>

        <div className="space-y-2">
          {RECENT_ORDERS.map((order) => {
            const status = STATUS_CONFIG[order.status as keyof typeof STATUS_CONFIG];
            return (
              <div
                key={order.id}
                className="flex items-center gap-4 p-3.5 rounded-xl bg-white/3 border border-white/5 hover:border-white/10 transition-all"
              >
                {/* Icon */}
                <div className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center shrink-0">
                  {order.status === "selesai"
                    ? <CheckCircle2 size={15} className="text-[#c8e6c9]" />
                    : order.status === "proses"
                    ? <Clock size={15} className="text-amber-400" />
                    : <Package size={15} className="text-red-400" />}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white/80">{order.user}</span>
                    <span className="text-[10px] text-white/25 font-mono">#{order.id}</span>
                  </div>
                  <p className="text-[11px] text-white/30 mt-0.5">
                    {order.items} item · {order.time}
                  </p>
                </div>

                {/* Status & Total */}
                <div className="flex flex-col items-end gap-1.5 shrink-0">
                  <span className="text-xs font-bold text-white/80">
                    Rp {order.total.toLocaleString("id-ID")}
                  </span>
                  <span className={cn(
                    "text-[10px] font-semibold px-2 py-0.5 rounded-full border flex items-center gap-1",
                    status.className
                  )}>
                    <span className={cn("w-1 h-1 rounded-full", status.dot)} />
                    {status.label}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}