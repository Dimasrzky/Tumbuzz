"use client";

import { ShoppingCart, Trash2, CreditCard, ChevronRight, PackageOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useState } from "react";
import Image from "next/image";
import type { Product } from "./product-card";

export interface CartItem {
  product: Product;
  quantity: number;
}

interface CartPanelProps {
  items: CartItem[];
  onRemoveItem: (productId: string) => void;
  onCheckout: () => void;
  onLoginClick: () => void;
  isLoggedIn: boolean;
}

export function CartPanel({ items, onRemoveItem, onCheckout, onLoginClick, isLoggedIn }: CartPanelProps) {
  const [imgErrors, setImgErrors] = useState<Set<string>>(new Set());

  const total = items.reduce((acc, item) => {
    const price = item.product.discount
      ? item.product.price - (item.product.price * item.product.discount) / 100
      : item.product.price;
    return acc + price * item.quantity;
  }, 0);

  const totalItems = items.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <div className="w-[320px] shrink-0 hidden lg:flex flex-col h-screen sticky top-0">
      <div className="flex flex-col h-full bg-card border-l border-border p-5 gap-4">

        {/* Header */}
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-foreground/[0.06] flex items-center justify-center">
              <ShoppingCart size={15} className="text-foreground/60" />
            </div>
            <h2 className="text-base font-bold text-foreground">Keranjang</h2>
          </div>
          {totalItems > 0 && (
            <Badge className="bg-brand/15 text-brand border border-brand/20 text-xs font-bold rounded-full px-2.5">
              {totalItems} item
            </Badge>
          )}
        </div>

        <Separator />

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1 scrollbar-thin">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 gap-3">
              <div className="w-14 h-14 rounded-2xl bg-foreground/[0.04] flex items-center justify-center">
                <PackageOpen size={24} className="text-foreground/20" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-foreground/30">Keranjang kosong</p>
                <p className="text-xs text-foreground/20 mt-0.5">Pilih produk untuk mulai belanja</p>
              </div>
            </div>
          ) : (
            items.map((item) => {
              const price = item.product.discount
                ? item.product.price - (item.product.price * item.product.discount) / 100
                : item.product.price;

              return (
                <div
                  key={item.product.id}
                  className="flex items-center gap-3 p-3 rounded-xl bg-foreground/[0.03] border border-border hover:border-foreground/20 transition-all group"
                >
                  <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-muted shrink-0">
                    <Image
                      src={imgErrors.has(item.product.id)
                        ? `https://placehold.co/100x100/1e1e1e/666.png?text=${encodeURIComponent(item.product.name.charAt(0))}`
                        : item.product.image}
                      alt={item.product.name}
                      fill
                      sizes="48px"
                      className="object-cover"
                      onError={() => setImgErrors(prev => new Set(prev).add(item.product.id))}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-foreground/80 truncate leading-snug">{item.product.name}</p>
                    <p className="text-[11px] text-foreground/40 mt-0.5">
                      {item.quantity} × Rp {price.toLocaleString("id-ID")}
                    </p>
                    <p className="text-xs font-bold text-brand mt-1">
                      Rp {(price * item.quantity).toLocaleString("id-ID")}
                    </p>
                  </div>
                  <button
                    onClick={() => onRemoveItem(item.product.id)}
                    className="opacity-0 group-hover:opacity-100 w-7 h-7 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400/60 hover:text-red-400 flex items-center justify-center transition-all shrink-0"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              );
            })
          )}
        </div>

        {items.length > 0 && (
          <>
            <Separator />

            {/* Ringkasan Pembayaran */}
            <div className="bg-foreground/[0.03] border border-border rounded-2xl p-4 space-y-3">
              <p className="text-xs font-bold text-foreground/50 uppercase tracking-wider flex items-center gap-1.5">
                <CreditCard size={11} />
                Ringkasan Pembayaran
              </p>
              <div className="flex justify-between items-center">
                <span className="text-xs text-foreground/40">Subtotal</span>
                <span className="text-xs font-semibold text-foreground/70">Rp {total.toLocaleString("id-ID")}</span>
              </div>
              <Separator />
              <div className="flex justify-between items-center">
                <span className="text-sm font-bold text-foreground">Total</span>
                <span className="text-base font-bold text-brand">Rp {total.toLocaleString("id-ID")}</span>
              </div>
            </div>

            {/* Checkout Button */}
            <Button
              onClick={isLoggedIn ? onCheckout : onLoginClick}
              className={cn(
                "w-full h-12 rounded-xl font-bold text-sm gap-2 transition-all duration-200",
                isLoggedIn
                  ? "bg-brand hover:bg-brand/80 text-brand-fg shadow-lg shadow-brand/15"
                  : "bg-brand/15 hover:bg-brand/25 text-brand border border-brand/30"
              )}
            >
              {isLoggedIn ? (
                <>Bayar Sekarang<ChevronRight size={16} /></>
              ) : (
                <>Masuk untuk Checkout<ChevronRight size={16} /></>
              )}
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
