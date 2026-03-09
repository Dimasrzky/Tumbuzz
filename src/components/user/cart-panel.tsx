"use client";

import { ShoppingCart, Trash2, CreditCard, Tag, ChevronRight, PackageOpen, Truck, Store } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
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
  const [voucher, setVoucher] = useState("");
  const [voucherApplied, setVoucherApplied] = useState(false);
  const [imgErrors, setImgErrors] = useState<Set<string>>(new Set());
  const [deliveryMethod, setDeliveryMethod] = useState<"delivery" | "pickup">("delivery");

  const subtotal = items.reduce((acc, item) => {
    const price = item.product.discount
      ? item.product.price - (item.product.price * item.product.discount) / 100
      : item.product.price;
    return acc + price * item.quantity;
  }, 0);

  const shippingFee = deliveryMethod === "delivery" ? 5000 : 0;
  const discount = voucherApplied ? subtotal * 0.1 : 0;
  const total = subtotal - discount + shippingFee;
  const totalItems = items.reduce((acc, item) => acc + item.quantity, 0);

  const handleVoucher = () => {
    if (voucher.toLowerCase() === "tumbuzz10") setVoucherApplied(true);
  };

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

            {/* Delivery Method */}
            <div className="space-y-2">
              <p className="text-xs font-semibold text-foreground/40 flex items-center gap-1.5">
                <Truck size={11} />
                Metode
              </p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setDeliveryMethod("delivery")}
                  className={cn(
                    "flex items-center gap-2 rounded-xl border py-2 px-3 transition-all duration-200",
                    deliveryMethod === "delivery"
                      ? "bg-brand/10 border-brand/30 text-brand"
                      : "bg-foreground/[0.03] border-border text-foreground/40 hover:border-foreground/20 hover:text-foreground/60"
                  )}
                >
                  <Truck size={13} className="shrink-0" />
                  <div className="text-left">
                    <p className="text-[11px] font-semibold leading-tight">Diantar</p>
                  </div>
                </button>
                <button
                  onClick={() => setDeliveryMethod("pickup")}
                  className={cn(
                    "flex items-center gap-2 rounded-xl border py-2 px-3 transition-all duration-200",
                    deliveryMethod === "pickup"
                      ? "bg-brand/10 border-brand/30 text-brand"
                      : "bg-foreground/[0.03] border-border text-foreground/40 hover:border-foreground/20 hover:text-foreground/60"
                  )}
                >
                  <Store size={13} className="shrink-0" />
                  <p className="text-[11px] font-semibold">Ambil Sendiri</p>
                </button>
              </div>
            </div>

            <Separator />

            {/* Voucher */}
            <div className="space-y-2">
              <p className="text-xs font-semibold text-foreground/40 flex items-center gap-1.5">
                <Tag size={11} />
                Kode Voucher
              </p>
              <div className="flex gap-2">
                <Input
                  placeholder="Masukkan kode..."
                  value={voucher}
                  onChange={(e) => setVoucher(e.target.value)}
                  disabled={voucherApplied}
                  className="h-9 bg-foreground/[0.04] border-border text-foreground placeholder:text-foreground/25 text-xs rounded-xl focus:border-brand/30 focus:ring-0"
                />
                <Button
                  onClick={handleVoucher}
                  disabled={voucherApplied || !voucher}
                  className={cn(
                    "h-9 px-3 rounded-xl text-xs font-semibold shrink-0 transition-all",
                    voucherApplied
                      ? "bg-brand/15 text-brand border border-brand/20"
                      : "bg-foreground/[0.06] hover:bg-foreground/10 text-foreground/60 hover:text-foreground border border-border"
                  )}
                >
                  {voucherApplied ? "✓ Aktif" : "Pakai"}
                </Button>
              </div>
              {voucherApplied && (
                <p className="text-[11px] text-brand/70 flex items-center gap-1">
                  ✓ Diskon 10% berhasil diterapkan
                </p>
              )}
            </div>

            {/* Payment Summary */}
            <div className="bg-foreground/[0.03] border border-border rounded-2xl p-4 space-y-3">
              <p className="text-xs font-bold text-foreground/50 uppercase tracking-wider flex items-center gap-1.5">
                <CreditCard size={11} />
                Ringkasan Pembayaran
              </p>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-foreground/40">Subtotal</span>
                  <span className="text-xs font-semibold text-foreground/70">Rp {subtotal.toLocaleString("id-ID")}</span>
                </div>
                {voucherApplied && (
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-brand/70">Diskon voucher</span>
                    <span className="text-xs font-semibold text-brand">-Rp {discount.toLocaleString("id-ID")}</span>
                  </div>
                )}
                <div className="flex justify-between items-center">
                  <span className="text-xs text-foreground/40">
                    {deliveryMethod === "delivery" ? "Ongkos kirim" : "Ambil di toko"}
                  </span>
                  {deliveryMethod === "delivery" ? (
                    <span className="text-xs font-semibold text-foreground/60">Rp 5.000</span>
                  ) : (
                    <span className="text-xs font-semibold text-brand/70">Gratis</span>
                  )}
                </div>
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
