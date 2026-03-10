"use client";

import { useState, useEffect } from "react";
import {
  Users, ShoppingBag, TrendingUp, Banknote,
  Calendar, CheckCircle2, Clock, Package,
} from "lucide-react";
import { cn } from "@/lib/utils";

type OrderStatus = "selesai" | "proses" | "dibatalkan";

interface RecentOrder {
  id: string;
  user: string;
  items: number;
  total: number;
  status: OrderStatus;
  time: string;
}

interface ChartDay {
  day: string;
  orders: number;
  revenue: number;
}

interface TopProduct {
  name: string;
  sold: number;
  revenue: number;
}

const STATUS_CONFIG: Record<OrderStatus, { label: string; className: string; dot: string }> = {
  selesai:    { label: "Selesai",    className: "bg-brand/10 text-brand border-brand/20",             dot: "bg-brand" },
  proses:     { label: "Diproses",   className: "bg-amber-400/10 text-amber-500 dark:text-amber-400 border-amber-400/20", dot: "bg-amber-400" },
  dibatalkan: { label: "Dibatalkan", className: "bg-red-400/10 text-red-500 dark:text-red-400 border-red-400/20",         dot: "bg-red-400" },
};

const DAYS = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

function formatRelativeTime(dateString: string): string {
  const diff = Date.now() - new Date(dateString).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Baru saja";
  if (mins < 60) return `${mins} menit lalu`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} jam lalu`;
  return `${Math.floor(hours / 24)} hari lalu`;
}

export default function AdminDashboardPage() {
  const [chartMetric, setChartMetric] = useState<"orders" | "revenue">("orders");
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalRevenue: 0, totalOrders: 0, totalUsers: 0, totalSold: 0 });
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [chartData, setChartData] = useState<ChartDay[]>([]);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);

  useEffect(() => {
    async function load() {
      try {
        const [statsRes, ordersRes] = await Promise.all([
          fetch("/api/admin/stats").then((r) => r.json()),
          fetch("/api/admin/orders").then((r) => r.json()),
        ]);

        const statsData = statsRes;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const allOrders: any[] = Array.isArray(ordersRes) ? ordersRes : [];

        setStats(statsData);

        const orders = allOrders ?? [];

        // Recent orders (5 terbaru)
        setRecentOrders(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          orders.slice(0, 5).map((o: any) => ({
            id: o.id.slice(0, 8).toUpperCase(),
            user: o.profiles?.full_name ?? o.profiles?.email ?? "Pengguna",
            items: o.order_items?.length ?? 0,
            total: o.total_amount,
            status: o.status as OrderStatus,
            time: formatRelativeTime(o.created_at),
          }))
        );

        // Chart data — 7 hari terakhir
        const now = new Date();
        const chartMap: Record<string, ChartDay> = {};
        for (let i = 6; i >= 0; i--) {
          const d = new Date(now);
          d.setDate(d.getDate() - i);
          const key = d.toDateString();
          chartMap[key] = { day: DAYS[d.getDay()], orders: 0, revenue: 0 };
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        orders.forEach((o: any) => {
          const key = new Date(o.created_at).toDateString();
          if (chartMap[key]) {
            chartMap[key].orders += 1;
            chartMap[key].revenue += o.total_amount;
          }
        });
        setChartData(Object.values(chartMap));

        // Top products dari order_items
        const productSales: Record<string, TopProduct> = {};
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        orders.forEach((o: any) => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          o.order_items?.forEach((item: any) => {
            const name: string = item.products?.name ?? "Unknown";
            const pid: string = item.product_id;
            if (!productSales[pid]) productSales[pid] = { name, sold: 0, revenue: 0 };
            productSales[pid].sold += item.quantity;
            productSales[pid].revenue += item.quantity * item.unit_price;
          });
        });
        setTopProducts(
          Object.values(productSales)
            .sort((a, b) => b.sold - a.sold)
            .slice(0, 5)
        );
      } catch (err) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const msg = (err as any)?.message ?? JSON.stringify(err);
        console.error("Gagal memuat dashboard:", msg);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const maxVal = chartData.length > 0 ? Math.max(...chartData.map((d) => d[chartMetric]), 1) : 1;

  const today = new Date().toLocaleDateString("id-ID", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });

  const STATS = [
    { label: "Total Pendapatan", value: `Rp ${stats.totalRevenue.toLocaleString("id-ID")}`, icon: Banknote,   color: "text-brand",       bg: "bg-brand/10" },
    { label: "Total Order",      value: stats.totalOrders.toLocaleString("id-ID"),           icon: ShoppingBag, color: "text-blue-500 dark:text-blue-400",    bg: "bg-blue-400/10" },
    { label: "Pengguna Aktif",   value: stats.totalUsers.toLocaleString("id-ID"),            icon: Users,       color: "text-violet-500 dark:text-violet-400", bg: "bg-violet-400/10" },
    { label: "Produk Terjual",   value: stats.totalSold.toLocaleString("id-ID"),             icon: Package,     color: "text-amber-500 dark:text-amber-400",   bg: "bg-amber-400/10" },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white" style={{ fontFamily: "'Playfair Display', serif" }}>
            Dashboard
          </h1>
          <p className="text-xs text-gray-400 dark:text-white/30 mt-0.5 flex items-center gap-1.5 capitalize">
            <Calendar size={11} />
            {today}
          </p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-brand/10 border border-brand/15">
          <div className="w-1.5 h-1.5 rounded-full bg-brand animate-pulse" />
          <span className="text-xs font-semibold text-brand">Live</span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {STATS.map((stat) => (
          <div
            key={stat.label}
            className="bg-white dark:bg-[#0f0f0f] border border-black/[0.08] dark:border-white/6 rounded-2xl p-5 hover:border-black/[0.12] dark:hover:border-white/12 transition-all"
          >
            <div className="flex items-start justify-between mb-4">
              <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center", stat.bg)}>
                <stat.icon size={16} className={stat.color} />
              </div>
            </div>
            {loading ? (
              <div className="h-7 w-24 bg-black/[0.06] dark:bg-white/5 rounded-lg animate-pulse mb-1" />
            ) : (
              <p className="text-xl font-bold text-gray-900 dark:text-white mb-1">{stat.value}</p>
            )}
            <p className="text-xs text-gray-400 dark:text-white/30">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Chart + Top Products */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">

        {/* Bar Chart */}
        <div className="xl:col-span-2 bg-white dark:bg-[#0f0f0f] border border-black/[0.08] dark:border-white/6 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-sm font-bold text-gray-900 dark:text-white">Aktivitas Mingguan</h2>
              <p className="text-[11px] text-gray-400 dark:text-white/30 mt-0.5">7 hari terakhir</p>
            </div>
            <div className="flex gap-1.5">
              {(["orders", "revenue"] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => setChartMetric(m)}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-xs font-semibold transition-all",
                    chartMetric === m
                      ? "bg-brand/15 text-brand border border-brand/20"
                      : "text-gray-400 dark:text-white/30 hover:text-gray-600 dark:hover:text-white/60"
                  )}
                >
                  {m === "orders" ? "Order" : "Revenue"}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-end justify-between gap-2 h-40">
            {loading
              ? Array.from({ length: 7 }).map((_, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-2">
                    <div className="w-full bg-black/[0.05] dark:bg-white/5 rounded-t-lg animate-pulse" style={{ height: `${30 + Math.random() * 60}%` }} />
                    <div className="h-2 w-6 bg-black/[0.05] dark:bg-white/5 rounded animate-pulse" />
                  </div>
                ))
              : chartData.map((d) => {
                  const height = (d[chartMetric] / maxVal) * 100;
                  return (
                    <div key={d.day} className="flex-1 flex flex-col items-center gap-2">
                      <div className="w-full flex items-end" style={{ height: "120px" }}>
                        <div
                          className="w-full rounded-t-lg bg-gradient-to-t from-[#2d6a2d] to-brand/60 hover:to-brand transition-all duration-300 cursor-pointer group relative"
                          style={{ height: `${Math.max(height, 2)}%` }}
                        >
                          <div className="absolute -top-8 left-1/2 -translate-x-1/2 hidden group-hover:block bg-gray-100 dark:bg-[#1a1a1a] border border-black/[0.08] dark:border-white/10 rounded-lg px-2 py-1 whitespace-nowrap z-10">
                            <p className="text-[10px] font-bold text-gray-900 dark:text-white">
                              {chartMetric === "orders"
                                ? `${d.orders} order`
                                : `Rp ${(d.revenue / 1000000).toFixed(1)}jt`}
                            </p>
                          </div>
                        </div>
                      </div>
                      <span className="text-[10px] text-gray-400 dark:text-white/30 font-medium">{d.day}</span>
                    </div>
                  );
                })}
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-white dark:bg-[#0f0f0f] border border-black/[0.08] dark:border-white/6 rounded-2xl p-5">
          <div className="mb-5">
            <h2 className="text-sm font-bold text-gray-900 dark:text-white">Produk Terlaris</h2>
            <p className="text-[11px] text-gray-400 dark:text-white/30 mt-0.5">Berdasarkan semua order</p>
          </div>
          {loading ? (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="space-y-1.5">
                  <div className="flex justify-between">
                    <div className="h-3 w-32 bg-black/[0.05] dark:bg-white/5 rounded animate-pulse" />
                    <div className="h-3 w-8 bg-black/[0.05] dark:bg-white/5 rounded animate-pulse" />
                  </div>
                  <div className="h-1.5 w-full bg-black/[0.05] dark:bg-white/5 rounded-full animate-pulse" />
                </div>
              ))}
            </div>
          ) : topProducts.length === 0 ? (
            <p className="text-xs text-gray-300 dark:text-white/20 text-center py-8">Belum ada data</p>
          ) : (
            <div className="space-y-3">
              {topProducts.map((p, i) => {
                const maxSold = topProducts[0].sold;
                const pct = (p.sold / maxSold) * 100;
                return (
                  <div key={p.name}>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-[10px] font-bold text-gray-300 dark:text-white/20 w-4 shrink-0">{i + 1}</span>
                        <span className="text-xs font-medium text-gray-500 dark:text-white/70 truncate">{p.name}</span>
                      </div>
                      <span className="text-[11px] font-bold text-brand shrink-0 ml-2">{p.sold}×</span>
                    </div>
                    <div className="h-1.5 bg-black/[0.05] dark:bg-white/5 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[#2d6a2d] to-brand/60 rounded-full transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white dark:bg-[#0f0f0f] border border-black/[0.08] dark:border-white/6 rounded-2xl p-5">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-sm font-bold text-gray-900 dark:text-white">Order Terbaru</h2>
            <p className="text-[11px] text-gray-400 dark:text-white/30 mt-0.5">5 order terakhir</p>
          </div>
          <button className="text-xs text-brand/60 hover:text-brand transition-colors flex items-center gap-1">
            Lihat semua <TrendingUp size={11} />
          </button>
        </div>

        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 p-3.5 rounded-xl bg-black/[0.03] dark:bg-white/3 border border-black/[0.06] dark:border-white/5">
                <div className="w-9 h-9 rounded-xl bg-black/[0.05] dark:bg-white/5 animate-pulse shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3 w-32 bg-black/[0.05] dark:bg-white/5 rounded animate-pulse" />
                  <div className="h-3 w-20 bg-black/[0.05] dark:bg-white/5 rounded animate-pulse" />
                </div>
                <div className="space-y-1.5 items-end flex flex-col">
                  <div className="h-3 w-20 bg-black/[0.05] dark:bg-white/5 rounded animate-pulse" />
                  <div className="h-4 w-14 bg-black/[0.05] dark:bg-white/5 rounded-full animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        ) : recentOrders.length === 0 ? (
          <p className="text-xs text-gray-300 dark:text-white/20 text-center py-8">Belum ada order</p>
        ) : (
          <div className="space-y-2">
            {recentOrders.map((order) => {
              const status = STATUS_CONFIG[order.status] ?? STATUS_CONFIG.proses;
              return (
                <div
                  key={order.id}
                  className="flex items-center gap-4 p-3.5 rounded-xl bg-black/[0.03] dark:bg-white/3 border border-black/[0.06] dark:border-white/5 hover:border-black/[0.10] dark:hover:border-white/10 transition-all"
                >
                  <div className="w-9 h-9 rounded-xl bg-black/[0.05] dark:bg-white/5 flex items-center justify-center shrink-0">
                    {order.status === "selesai"
                      ? <CheckCircle2 size={15} className="text-brand" />
                      : order.status === "proses"
                      ? <Clock size={15} className="text-amber-500 dark:text-amber-400" />
                      : <Package size={15} className="text-red-500 dark:text-red-400" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-gray-700 dark:text-white/80">{order.user}</span>
                      <span className="text-[10px] text-gray-300 dark:text-white/25 font-mono">#{order.id}</span>
                    </div>
                    <p className="text-[11px] text-gray-400 dark:text-white/30 mt-0.5">
                      {order.items} item · {order.time}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1.5 shrink-0">
                    <span className="text-xs font-bold text-gray-700 dark:text-white/80">
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
        )}
      </div>
    </div>
  );
}
