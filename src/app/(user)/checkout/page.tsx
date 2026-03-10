"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ShoppingBag, ArrowLeft, Truck, Store, Tag, CreditCard,
  PackageOpen, MapPin, CheckCircle2, Landmark, Smartphone, Banknote, QrCode, Wallet,
} from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { useAuth } from "@/components/providers";
import { createOrder, getWalletBalance, topUpWallet } from "@/lib/supabase/queries";
import { toast } from "sonner";
import type { CartItem } from "@/components/user/cart-panel";

export default function CheckoutPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [items, setItems] = useState<CartItem[]>([]);
  const [cartLoaded, setCartLoaded] = useState(false);
  const [deliveryMethod, setDeliveryMethod] = useState<"delivery" | "pickup">("delivery");
  const [address, setAddress] = useState("");
  const [voucher, setVoucher] = useState("");
  const [voucherApplied, setVoucherApplied] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"debit" | "bank" | "ewallet" | "cash" | "qris" | "tumbuzz" | "">("");
  const [paymentSub, setPaymentSub] = useState("");
  const [walletBalance, setWalletBalance] = useState<number>(0);
  const [placing, setPlacing] = useState(false);
  const [imgErrors, setImgErrors] = useState<Set<string>>(new Set());

  useEffect(() => {
    try {
      const saved = localStorage.getItem("checkout_cart");
      if (saved) setItems(JSON.parse(saved));
    } catch {
      // ignore
    }
    setCartLoaded(true);
  }, []);

  useEffect(() => {
    if (user?.id) getWalletBalance(user.id).then(setWalletBalance);
  }, [user?.id]);

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

  const handleApplyVoucher = () => {
    if (voucher.toLowerCase() === "tumbuzz10") {
      setVoucherApplied(true);
      toast.success("Voucher berhasil diterapkan!");
    } else {
      toast.error("Kode voucher tidak valid");
    }
  };

  const handlePlaceOrder = async () => {
    if (!user) return;
    if (deliveryMethod === "delivery" && !address.trim()) {
      toast.error("Masukkan alamat pengiriman terlebih dahulu");
      return;
    }
    if (!paymentMethod) {
      toast.error("Pilih metode pembayaran terlebih dahulu");
      return;
    }
    if ((paymentMethod === "ewallet" || paymentMethod === "bank") && !paymentSub) {
      toast.error(`Pilih ${paymentMethod === "ewallet" ? "e-wallet" : "bank"} terlebih dahulu`);
      return;
    }

    if (paymentMethod === "tumbuzz" && walletBalance < total) {
      toast.error("Saldo Tumbuzz Wallet tidak mencukupi");
      return;
    }

    setPlacing(true);
    try {
      const orderItems = items.map((item) => {
        const price = item.product.discount
          ? item.product.price - (item.product.price * item.product.discount) / 100
          : item.product.price;
        return { product_id: item.product.id, quantity: item.quantity, unit_price: price };
      });

      if (paymentMethod === "tumbuzz") {
        await topUpWallet(user.id, -total);
      }

      await createOrder(
        user.id,
        orderItems,
        total,
        discount,
        voucherApplied ? voucher.toUpperCase() : undefined
      );

      localStorage.removeItem("checkout_cart");
      toast.success("Pesanan berhasil dibuat!");
      router.push("/history");
    } catch (err) {
      console.error(err);
      toast.error("Gagal membuat pesanan. Coba lagi.");
    } finally {
      setPlacing(false);
    }
  };

  // Loading auth
  if (authLoading || !cartLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-brand border-t-transparent animate-spin" />
      </div>
    );
  }

  // Keranjang kosong
  if (items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-6">
        <div className="w-16 h-16 rounded-2xl bg-foreground/[0.04] border border-border flex items-center justify-center">
          <PackageOpen size={28} className="text-foreground/20" />
        </div>
        <div className="text-center">
          <h2
            className="text-xl font-bold text-foreground"
            style={{ fontFamily: "var(--font-playfair), serif" }}
          >
            Keranjang Kosong
          </h2>
          <p className="text-sm text-foreground/30 mt-2">
            Tambahkan produk ke keranjang terlebih dahulu
          </p>
        </div>
        <Button
          onClick={() => router.push("/")}
          className="mt-2 rounded-xl bg-brand hover:bg-brand/80 text-brand-fg"
        >
          Kembali Belanja
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-6 py-8">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => router.back()}
            className="w-9 h-9 rounded-xl bg-foreground/[0.05] border border-border flex items-center justify-center hover:bg-foreground/10 transition-colors"
          >
            <ArrowLeft size={16} className="text-foreground/60" />
          </button>
          <div>
            <h1
              className="text-2xl font-bold text-foreground"
              style={{ fontFamily: "var(--font-playfair), serif" }}
            >
              Checkout
            </h1>
            <p className="text-sm text-foreground/30 mt-0.5">{totalItems} item</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6">

          {/* Kolom Kiri */}
          <div className="space-y-4">

            {/* Produk Dipesan */}
            <div className="bg-card border border-border rounded-2xl p-5">
              <h2 className="text-xs font-bold text-foreground/40 uppercase tracking-wider mb-4 flex items-center gap-2">
                <ShoppingBag size={13} />
                Produk Dipesan
              </h2>
              <div className="space-y-3">
                {items.map((item) => {
                  const price = item.product.discount
                    ? item.product.price - (item.product.price * item.product.discount) / 100
                    : item.product.price;
                  return (
                    <div key={item.product.id} className="flex items-center gap-3">
                      <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-muted shrink-0">
                        <Image
                          src={
                            imgErrors.has(item.product.id)
                              ? `https://placehold.co/100x100/1e1e1e/666.png?text=${encodeURIComponent(item.product.name.charAt(0))}`
                              : item.product.image
                          }
                          alt={item.product.name}
                          fill
                          sizes="48px"
                          className="object-cover"
                          onError={() =>
                            setImgErrors((prev) => new Set(prev).add(item.product.id))
                          }
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-foreground/80 truncate">
                          {item.product.name}
                        </p>
                        <p className="text-xs text-foreground/40 mt-0.5">
                          {item.quantity} × Rp {price.toLocaleString("id-ID")}
                        </p>
                      </div>
                      <p className="text-sm font-bold text-brand shrink-0">
                        Rp {(price * item.quantity).toLocaleString("id-ID")}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Metode Pengiriman */}
            <div className="bg-card border border-border rounded-2xl p-5">
              <h2 className="text-xs font-bold text-foreground/40 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Truck size={13} />
                Metode Pengiriman
              </h2>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setDeliveryMethod("delivery")}
                  className={cn(
                    "flex items-center gap-3 rounded-xl border p-3.5 transition-all duration-200 text-left",
                    deliveryMethod === "delivery"
                      ? "bg-brand/10 border-brand/30 text-brand"
                      : "bg-foreground/[0.03] border-border text-foreground/50 hover:border-foreground/20 hover:text-foreground/70"
                  )}
                >
                  <Truck size={18} className="shrink-0" />
                  <div>
                    <p className="text-sm font-semibold leading-tight">Diantar</p>
                    <p className="text-xs opacity-70 mt-0.5">Rp 5.000</p>
                  </div>
                </button>
                <button
                  onClick={() => setDeliveryMethod("pickup")}
                  className={cn(
                    "flex items-center gap-3 rounded-xl border p-3.5 transition-all duration-200 text-left",
                    deliveryMethod === "pickup"
                      ? "bg-brand/10 border-brand/30 text-brand"
                      : "bg-foreground/[0.03] border-border text-foreground/50 hover:border-foreground/20 hover:text-foreground/70"
                  )}
                >
                  <Store size={18} className="shrink-0" />
                  <div>
                    <p className="text-sm font-semibold leading-tight">Ambil Sendiri</p>
                    <p className="text-xs opacity-70 mt-0.5">Gratis</p>
                  </div>
                </button>
              </div>

              <div className="mt-4 space-y-4">
                {deliveryMethod === "delivery" && (
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-foreground/40 flex items-center gap-1.5">
                      <MapPin size={11} />
                      Alamat Pengiriman
                    </p>
                    <textarea
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Masukkan alamat lengkap..."
                      rows={3}
                      className="w-full bg-foreground/[0.04] border border-border rounded-xl px-3 py-2.5 text-sm text-foreground placeholder:text-foreground/25 resize-none focus:outline-none focus:border-brand/30 transition-colors"
                    />
                  </div>
                )}

                {/* Metode Pembayaran */}
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-foreground/40 flex items-center gap-1.5">
                    <CreditCard size={11} />
                    Metode Pembayaran
                  </p>

                  {/* Tumbuzz Wallet — full width */}
                  {(() => {
                    const isSelected = paymentMethod === "tumbuzz";
                    const insufficient = walletBalance < total;
                    return (
                      <button
                        onClick={() => { if (!insufficient) { setPaymentMethod("tumbuzz"); setPaymentSub(""); } }}
                        disabled={insufficient}
                        className={cn(
                          "w-full flex items-center gap-3 rounded-xl border p-3.5 transition-all duration-200 text-left",
                          isSelected
                            ? "bg-brand border-brand text-brand-fg"
                            : insufficient
                              ? "bg-foreground/[0.02] border-border text-foreground/25 cursor-not-allowed"
                              : "bg-foreground/[0.03] border-border text-foreground/60 hover:border-brand/30 hover:text-foreground/80"
                        )}
                      >
                        <div className={cn(
                          "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                          isSelected ? "bg-brand-fg/20" : "bg-foreground/[0.06]"
                        )}>
                          <Wallet size={15} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold leading-tight">BuzzWallet</p>
                          <p className={cn("text-[11px] mt-0.5 font-semibold", isSelected ? "text-brand-fg/70" : insufficient ? "text-red-400/60" : "text-foreground/40")}>
                            {insufficient
                              ? `Saldo kurang · Rp ${walletBalance.toLocaleString("id-ID")}`
                              : `Saldo: Rp ${walletBalance.toLocaleString("id-ID")}`}
                          </p>
                        </div>
                        {isSelected && (
                          <CheckCircle2 size={16} className="text-brand-fg shrink-0" />
                        )}
                      </button>
                    );
                  })()}

                  <div className="grid grid-cols-2 gap-2">
                    {([
                      { value: "qris",    label: "QRIS",          desc: "Scan QR Code",    icon: QrCode,    subs: [] },
                      { value: "ewallet", label: "E-Wallet",       desc: "GoPay, OVO, Dana", icon: Smartphone, subs: ["GoPay", "OVO", "Dana"] },
                      { value: "bank",    label: "Transfer Bank",  desc: "BCA, Mandiri, BNI", icon: Landmark,  subs: ["BCA", "Mandiri", "BNI"] },
                      { value: "debit",   label: "Kartu Debit",    desc: "Visa / Mastercard", icon: CreditCard, subs: [] },
                      { value: "cash",    label: "Bayar di Tempat", desc: "COD",             icon: Banknote,  subs: [] },
                    ] as const).map(({ value, label, desc, icon: Icon, subs }) => {
                      const isSelected = paymentMethod === value;
                      return (
                        <div
                          key={value}
                          className={cn(
                            "rounded-xl border transition-all duration-200 overflow-hidden",
                            isSelected
                              ? "bg-brand/10 border-brand/30 text-brand"
                              : "bg-foreground/[0.03] border-border text-foreground/50"
                          )}
                        >
                          <button
                            onClick={() => { setPaymentMethod(value); setPaymentSub(""); }}
                            className="flex items-center gap-2.5 p-3 w-full text-left hover:opacity-80 transition-opacity"
                          >
                            <div className={cn(
                              "w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-all",
                              isSelected ? "bg-brand/20" : "bg-foreground/[0.06]"
                            )}>
                              <Icon size={13} />
                            </div>
                            <div>
                              <p className="text-xs font-semibold leading-tight">{label}</p>
                              <p className="text-[10px] opacity-60 mt-0.5">{desc}</p>
                            </div>
                          </button>

                          {/* Sub-opsi melebar ke bawah */}
                          {isSelected && subs.length > 0 && (
                            <div className="px-2.5 pb-2.5 pt-0">
                              <div className="h-px bg-brand/15 mb-2" />
                              <div className="flex gap-1.5">
                                {subs.map((sub) => (
                                  <button
                                    key={sub}
                                    onClick={() => setPaymentSub(sub)}
                                    className={cn(
                                      "flex-1 py-1.5 rounded-lg border text-[11px] font-semibold transition-all duration-200",
                                      paymentSub === sub
                                        ? "bg-brand/20 border-brand/40 text-brand"
                                        : "bg-foreground/[0.04] border-brand/15 text-brand/50 hover:text-brand/80 hover:border-brand/30"
                                    )}
                                  >
                                    {sub}
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Kolom Kanan */}
          <div className="space-y-4">

            {/* Voucher */}
            <div className="bg-card border border-border rounded-2xl p-5">
              <h2 className="text-xs font-bold text-foreground/40 uppercase tracking-wider mb-3 flex items-center gap-2">
                <Tag size={13} />
                Kode Voucher
              </h2>
              <div className="flex gap-2">
                <Input
                  placeholder="Masukkan kode..."
                  value={voucher}
                  onChange={(e) => setVoucher(e.target.value)}
                  disabled={voucherApplied}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !voucherApplied && voucher) handleApplyVoucher();
                  }}
                  className="h-9 bg-foreground/[0.04] border-border text-foreground placeholder:text-foreground/25 text-xs rounded-xl focus:border-brand/30 focus:ring-0"
                />
                <Button
                  onClick={handleApplyVoucher}
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
                <p className="text-[11px] text-brand/70 mt-2 flex items-center gap-1">
                  <CheckCircle2 size={11} />
                  Diskon 10% berhasil diterapkan
                </p>
              )}
            </div>

            {/* Ringkasan Pembayaran */}
            <div className="bg-card border border-border rounded-2xl p-5">
              <h2 className="text-xs font-bold text-foreground/40 uppercase tracking-wider mb-4 flex items-center gap-2">
                <CreditCard size={13} />
                Ringkasan Pembayaran
              </h2>
              <div className="space-y-2.5">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-foreground/40">Subtotal</span>
                  <span className="text-xs font-semibold text-foreground/70">
                    Rp {subtotal.toLocaleString("id-ID")}
                  </span>
                </div>
                {voucherApplied && (
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-brand/70">Diskon voucher</span>
                    <span className="text-xs font-semibold text-brand">
                      -Rp {discount.toLocaleString("id-ID")}
                    </span>
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
              <Separator className="my-3" />
              <div className="flex justify-between items-center">
                <span className="text-sm font-bold text-foreground">Total</span>
                <span className="text-lg font-bold text-brand">
                  Rp {total.toLocaleString("id-ID")}
                </span>
              </div>

              <Button
                onClick={handlePlaceOrder}
                disabled={placing}
                className="w-full h-11 mt-4 rounded-xl bg-brand hover:bg-brand/80 text-brand-fg font-bold text-sm shadow-lg shadow-brand/15 transition-all"
              >
                {placing ? "Memproses..." : "Buat Pesanan"}
              </Button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
