"use client";

import { Package, Clock, CheckCircle2, XCircle, ChevronRight, ShoppingBag } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// Mock data — replace with Supabase query later
const MOCK_HISTORY = [
  {
    id: "TBZ-001",
    date: "8 Mar 2025",
    items: ["Beras Premium 5kg", "Minyak Goreng 2L", "Telur Ayam 1kg"],
    total: 145000,
    status: "selesai",
  },
  {
    id: "TBZ-002",
    date: "5 Mar 2025",
    items: ["Indomie Goreng ×10", "Teh Celup Sariwangi"],
    total: 46000,
    status: "selesai",
  },
  {
    id: "TBZ-003",
    date: "1 Mar 2025",
    items: ["Deterjen Rinso 1.8kg", "Sabun Dove ×3"],
    total: 70500,
    status: "dibatalkan",
  },
];

const statusConfig = {
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

export default function HistoryPage() {
  // TODO: Replace with Supabase auth check
  const isLoggedIn = false;

  if (!isLoggedIn) {
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
            {MOCK_HISTORY.length} transaksi
          </p>
        </div>

        {/* History List */}
        <div className="space-y-3">
          {MOCK_HISTORY.map((order) => {
            const status = statusConfig[order.status as keyof typeof statusConfig];

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
                        <span className="text-sm font-bold text-foreground/90">#{order.id}</span>
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
      </div>
    </div>
  );
}