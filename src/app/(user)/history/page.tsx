"use client";

import { useEffect, useState } from "react";
import { Package, Clock, CheckCircle2, XCircle, ChevronRight, ShoppingBag } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useAuth } from "@/components/providers";
import { getUserOrders } from "@/lib/supabase/queries";

type OrderStatus = "selesai" | "proses" | "dibatalkan";

interface Order {
  id: string;
  date: string;
  items: string[];
  total: number;
  status: OrderStatus;
}

const statusConfig: Record<OrderStatus, { label: string; icon: React.ElementType; className: string; dot: string }> = {
  selesai: {
    label: "Selesai",
    icon: CheckCircle2,
    className: "bg-brand/10 text-brand border-brand/20",
    dot: "bg-brand",
  },
  proses: {
    label: "Diproses",
    icon: Clock,
    className: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    dot: "bg-amber-400",
  },
  dibatalkan: {
    label: "Dibatalkan",
    icon: XCircle,
    className: "bg-red-500/10 text-red-400 border-red-500/20",
    dot: "bg-red-400",
  },
};

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function SkeletonList() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="bg-card border border-border rounded-2xl p-5">
          <div className="flex items-start gap-4">
            <Skeleton className="w-10 h-10 rounded-xl shrink-0" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-3 w-full" />
            </div>
            <Skeleton className="h-4 w-20 shrink-0" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function HistoryPage() {
  const { user, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) return;

    setLoading(true);
    getUserOrders(user.id)
      .then((data) => {
        const mapped: Order[] = (data ?? []).map((o) => ({
          id: o.id,
          date: formatDate(o.created_at),
          items: (o.order_items ?? []).map((item: { quantity: number; products?: { name: string } | null }) => {
            const name = item.products?.name ?? "Produk";
            return item.quantity > 1 ? `${name} ×${item.quantity}` : name;
          }),
          total: o.total_amount,
          status: o.status as OrderStatus,
        }));
        setOrders(mapped);
      })
      .catch((err) => console.error("Gagal memuat riwayat:", err))
      .finally(() => setLoading(false));
  }, [user]);

  // Tunggu auth siap dulu
  if (authLoading) {
    return (
      <div className="min-h-screen px-6 py-8">
        <div className="max-w-2xl mx-auto">
          <Skeleton className="h-7 w-48 mb-2" />
          <Skeleton className="h-4 w-20 mb-8" />
          <SkeletonList />
        </div>
      </div>
    );
  }

  // Belum login
  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4 px-6">
        <div className="w-16 h-16 rounded-2xl bg-foreground/[0.04] border border-border flex items-center justify-center">
          <ShoppingBag size={28} className="text-foreground/20" />
        </div>
        <div className="text-center">
          <h2
            className="text-xl font-bold text-foreground"
            style={{ fontFamily: "var(--font-playfair), serif" }}
          >
            Riwayat Pembelian
          </h2>
          <p className="text-sm text-foreground/30 mt-2">
            Login terlebih dahulu untuk melihat riwayat pembelian kamu
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-6 py-8">
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <h1
            className="text-2xl font-bold text-foreground"
            style={{ fontFamily: "var(--font-playfair), serif" }}
          >
            Riwayat Pembelian
          </h1>
          <p className="text-sm text-foreground/30 mt-1">
            {loading ? "Memuat..." : `${orders.length} transaksi`}
          </p>
        </div>

        {/* List */}
        {loading ? (
          <SkeletonList />
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Package size={32} className="text-foreground/20" />
            <p className="text-sm text-foreground/30">Belum ada transaksi</p>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((order) => {
              const status = statusConfig[order.status] ?? statusConfig.proses;
              return (
                <div
                  key={order.id}
                  className="bg-card border border-border rounded-2xl p-5 hover:border-foreground/20 transition-all cursor-pointer group"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-foreground/[0.05] border border-border flex items-center justify-center shrink-0 mt-0.5">
                        <Package size={16} className="text-foreground/40" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                          <span className="text-sm font-bold text-foreground/90">
                            #{order.id.slice(0, 8).toUpperCase()}
                          </span>
                          <Badge
                            className={cn(
                              "text-[10px] font-semibold px-2 py-0.5 rounded-full border flex items-center gap-1",
                              status.className
                            )}
                          >
                            <span className={cn("w-1.5 h-1.5 rounded-full", status.dot)} />
                            {status.label}
                          </Badge>
                        </div>
                        <p className="text-xs text-foreground/30 mb-2">{order.date}</p>
                        <p className="text-xs text-foreground/50 truncate">
                          {order.items.join(" · ")}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2 shrink-0">
                      <p className="text-sm font-bold text-brand">
                        Rp {order.total.toLocaleString("id-ID")}
                      </p>
                      <ChevronRight
                        size={14}
                        className="text-foreground/20 group-hover:text-foreground/50 transition-colors"
                      />
                    </div>
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
