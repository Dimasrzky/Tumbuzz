"use client";

import { useState, useEffect } from "react";
import { Wallet, Plus, Zap, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getWalletBalance, topUpWallet } from "@/lib/supabase/queries";
import { toast } from "sonner";

interface WalletCardProps {
  userId: string | null;
  onLoginClick: () => void;
  isLoggedIn: boolean;
}

const QUICK_AMOUNTS = [20000, 50000, 100000, 200000];

export function WalletCard({ userId, onLoginClick, isLoggedIn }: WalletCardProps) {
  const [balance, setBalance] = useState<number | null>(null);
  const [showTopUp, setShowTopUp] = useState(false);
  const [topUpAmount, setTopUpAmount] = useState("");
  const [loadingTopUp, setLoadingTopUp] = useState(false);

  useEffect(() => {
    if (!userId) return;
    getWalletBalance(userId).then(setBalance);
  }, [userId]);

  const handleTopUp = async () => {
    if (!userId) return;
    const amount = parseInt(topUpAmount.replace(/\D/g, ""), 10);
    if (!amount || amount < 1000) {
      toast.error("Minimal top up Rp 1.000");
      return;
    }
    setLoadingTopUp(true);
    try {
      await topUpWallet(userId, amount);
      const newBalance = await getWalletBalance(userId);
      setBalance(newBalance);
      setShowTopUp(false);
      setTopUpAmount("");
      toast.success(`Top up Rp ${amount.toLocaleString("id-ID")} berhasil!`);
    } catch {
      toast.error("Top up gagal. Coba lagi.");
    } finally {
      setLoadingTopUp(false);
    }
  };

  const formatInput = (val: string) => {
    const num = val.replace(/\D/g, "");
    return num ? parseInt(num).toLocaleString("id-ID") : "";
  };

  return (
    <div className="relative">
      {/* Wallet Card */}
      <div className="mx-6 mt-5 mb-1 rounded-2xl bg-brand overflow-hidden">
        <div className="relative p-5 flex items-center justify-between gap-4">
          {/* Decorative circles */}
          <div className="absolute -top-6 -right-6 w-32 h-32 rounded-full bg-brand-fg/5" />
          <div className="absolute -bottom-8 right-16 w-24 h-24 rounded-full bg-brand-fg/5" />

          {/* Left: info */}
          <div className="relative">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 rounded-lg bg-brand-fg/15 flex items-center justify-center">
                <Wallet size={14} className="text-brand-fg" />
              </div>
              <span className="text-[10px] font-bold text-brand-fg/60 uppercase tracking-widest">
                BuzzWallet
              </span>
            </div>
            {!isLoggedIn ? (
              <button
                onClick={onLoginClick}
                className="text-sm font-semibold text-brand-fg/80 hover:text-brand-fg underline underline-offset-2 transition-colors"
              >
                Masuk untuk lihat saldo
              </button>
            ) : balance === null ? (
              <div className="h-7 w-32 bg-brand-fg/10 rounded-lg animate-pulse" />
            ) : (
              <p className="text-2xl font-bold text-brand-fg tracking-tight">
                Rp {balance.toLocaleString("id-ID")}
              </p>
            )}
          </div>

          {/* Right: actions */}
          {isLoggedIn && (
            <div className="relative flex items-center gap-2 shrink-0">
              <button
                onClick={() => setShowTopUp(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-brand-fg/15 hover:bg-brand-fg/25 text-brand-fg text-xs font-semibold transition-all"
              >
                <Plus size={13} />
                Top Up
              </button>
              <button className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-brand-fg/25 hover:bg-brand-fg/10 text-brand-fg text-xs font-semibold transition-all">
                <Zap size={13} />
                Gunakan
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Top Up Modal (inline dropdown) */}
      {showTopUp && (
        <div className="absolute top-full left-6 right-6 mt-2 z-30 bg-card border border-border rounded-2xl p-4 shadow-2xl shadow-black/30">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-bold text-foreground">Top Up Saldo</p>
            <button
              onClick={() => { setShowTopUp(false); setTopUpAmount(""); }}
              className="w-6 h-6 rounded-lg bg-foreground/[0.06] flex items-center justify-center text-foreground/40 hover:text-foreground transition-colors"
            >
              <X size={12} />
            </button>
          </div>

          {/* Quick amounts */}
          <div className="grid grid-cols-4 gap-1.5 mb-3">
            {QUICK_AMOUNTS.map((amt) => (
              <button
                key={amt}
                onClick={() => setTopUpAmount(amt.toLocaleString("id-ID"))}
                className={cn(
                  "py-2 rounded-xl text-[11px] font-semibold border transition-all",
                  topUpAmount === amt.toLocaleString("id-ID")
                    ? "bg-brand/15 border-brand/30 text-brand"
                    : "bg-foreground/[0.04] border-border text-foreground/50 hover:border-foreground/20 hover:text-foreground/70"
                )}
              >
                {amt >= 1000 ? `${amt / 1000}rb` : amt}
              </button>
            ))}
          </div>

          {/* Custom input */}
          <div className="relative mb-3">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-foreground/40 font-semibold">Rp</span>
            <input
              type="text"
              inputMode="numeric"
              placeholder="Nominal lain..."
              value={topUpAmount}
              onChange={(e) => setTopUpAmount(formatInput(e.target.value))}
              className="w-full bg-foreground/[0.04] border border-border rounded-xl pl-9 pr-3 py-2.5 text-sm text-foreground placeholder:text-foreground/25 focus:outline-none focus:border-brand/30 transition-colors"
            />
          </div>

          <Button
            onClick={handleTopUp}
            disabled={loadingTopUp || !topUpAmount}
            className="w-full h-10 rounded-xl bg-brand hover:bg-brand/80 text-brand-fg font-bold text-sm"
          >
            {loadingTopUp ? "Memproses..." : "Konfirmasi Top Up"}
          </Button>
        </div>
      )}
    </div>
  );
}
