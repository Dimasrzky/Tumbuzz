"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircle2, Clock, XCircle,
  ArrowLeft, Package, CreditCard, Copy, Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePaymentStatus } from "@/hooks/usePaymentStatus";
import { useState } from "react";
import Image from "next/image";
import QRCode from "react-qr-code";

// ─── Status Config ───────────────────────────────────────────────────────────

const STATUS_CONFIG = {
  pending: {
    icon: Clock,
    color: "text-yellow-500",
    bg: "bg-yellow-500/10",
    border: "border-yellow-500/20",
    title: "Menunggu Pembayaran",
    desc: "Selesaikan pembayaran sebelum waktu habis",
    realtime: true,
  },
  proses: {
    icon: Clock,
    color: "text-blue-500",
    bg: "bg-blue-500/10",
    border: "border-blue-500/20",
    title: "Menunggu Konfirmasi Admin",
    desc: "Pembayaran diterima, menunggu konfirmasi dari toko",
    realtime: true,
  },
  selesai: {
    icon: CheckCircle2,
    color: "text-green-500",
    bg: "bg-green-500/10",
    border: "border-green-500/20",
    title: "Pesanan Selesai",
    desc: "Terima kasih! Pesanan Anda telah selesai",
    realtime: false,
  },
  dibatalkan: {
    icon: XCircle,
    color: "text-red-500",
    bg: "bg-red-500/10",
    border: "border-red-500/20",
    title: "Pesanan Dibatalkan",
    desc: "Pembayaran gagal atau dibatalkan",
    realtime: false,
  },
} as const;

// ─── Copy Button ─────────────────────────────────────────────────────────────

function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-1 text-xs text-brand hover:text-brand/80 transition-colors"
    >
      {copied ? <Check size={12} /> : <Copy size={12} />}
      {copied ? "Tersalin" : "Salin"}
    </button>
  );
}

// ─── Payment Instructions ─────────────────────────────────────────────────────

type PaymentDetails =
  | { type: "qris"; qrImageUrl?: string; qrString?: string; expiryTime?: string }
  | { type: "bank_transfer"; bank: string; vaNumber: string; expiryTime?: string }
  | { type: "echannel"; billerCode: string; billKey: string; expiryTime?: string }
  | { type: "gopay"; qrImageUrl?: string; deeplinkUrl?: string; expiryTime?: string }
  | { type: "dana"; redirectUrl?: string; expiryTime?: string }
  | { type: "ovo"; expiryTime?: string }
  | { type: "shopeepay"; redirectUrl?: string | null; expiryTime?: string }
  | { type: "unknown" };

function PaymentInstructions({ details }: { details: PaymentDetails }) {
  const bankNames: Record<string, string> = {
    bca: "BCA", bni: "BNI", bri: "BRI", mandiri: "Mandiri", permata: "Permata",
  };

  if (details.type === "qris") {
    return (
      <div className="bg-card border border-border rounded-2xl p-5 mb-4">
        <h3 className="text-xs font-bold text-foreground/40 uppercase tracking-wider mb-4">
          Scan QRIS
        </h3>
        {(details.qrString || details.qrImageUrl) ? (
          <div className="flex justify-center mb-4">
            <div className="bg-white p-4 rounded-2xl border border-border">
              {details.qrString ? (
                <QRCode value={details.qrString} size={208} />
              ) : (
                <Image src={details.qrImageUrl!} alt="QRIS" width={208} height={208} className="object-contain" />
              )}
            </div>
          </div>
        ) : (
          <p className="text-sm text-foreground/50 text-center mb-4">
            QR Code tidak tersedia
          </p>
        )}
        {details.expiryTime && (
          <p className="text-xs text-center text-foreground/40">
            Berlaku hingga: {new Date(details.expiryTime).toLocaleString("id-ID")}
          </p>
        )}
        <div className="mt-3 rounded-xl bg-foreground/[0.03] border border-border p-3 space-y-1 text-xs text-foreground/50">
          <p>• Buka aplikasi GoPay / OVO / Dana / QRIS lainnya</p>
          <p>• Pilih Scan QR dan arahkan ke kode di atas</p>
          <p>• Konfirmasi pembayaran</p>
        </div>
      </div>
    );
  }

  if (details.type === "bank_transfer") {
    return (
      <div className="bg-card border border-border rounded-2xl p-5 mb-4">
        <h3 className="text-xs font-bold text-foreground/40 uppercase tracking-wider mb-4">
          Virtual Account {bankNames[details.bank] || details.bank.toUpperCase()}
        </h3>
        <div className="bg-foreground/[0.04] border border-border rounded-xl p-4 mb-4">
          <p className="text-xs text-foreground/40 mb-1">Nomor Virtual Account</p>
          <div className="flex items-center justify-between gap-3">
            <span className="text-2xl font-bold tracking-widest text-foreground font-mono">
              {details.vaNumber}
            </span>
            <CopyButton value={details.vaNumber} />
          </div>
        </div>
        {details.expiryTime && (
          <p className="text-xs text-foreground/40 mb-3">
            Berlaku hingga: {new Date(details.expiryTime).toLocaleString("id-ID")}
          </p>
        )}
        <div className="rounded-xl bg-foreground/[0.03] border border-border p-3 space-y-1 text-xs text-foreground/50">
          <p>• Buka aplikasi {bankNames[details.bank] || details.bank} / ATM / Internet Banking</p>
          <p>• Pilih Transfer → Virtual Account</p>
          <p>• Masukkan nomor VA di atas</p>
          <p>• Konfirmasi dan selesaikan pembayaran</p>
        </div>
      </div>
    );
  }

  if (details.type === "echannel") {
    return (
      <div className="bg-card border border-border rounded-2xl p-5 mb-4">
        <h3 className="text-xs font-bold text-foreground/40 uppercase tracking-wider mb-4">
          Mandiri Bill Payment
        </h3>
        <div className="space-y-3 mb-4">
          <div className="bg-foreground/[0.04] border border-border rounded-xl p-4">
            <p className="text-xs text-foreground/40 mb-1">Kode Perusahaan (Biller Code)</p>
            <div className="flex items-center justify-between">
              <span className="text-xl font-bold font-mono text-foreground">{details.billerCode}</span>
              <CopyButton value={details.billerCode} />
            </div>
          </div>
          <div className="bg-foreground/[0.04] border border-border rounded-xl p-4">
            <p className="text-xs text-foreground/40 mb-1">Kode Tagihan (Bill Key)</p>
            <div className="flex items-center justify-between">
              <span className="text-xl font-bold font-mono text-foreground">{details.billKey}</span>
              <CopyButton value={details.billKey} />
            </div>
          </div>
        </div>
        {details.expiryTime && (
          <p className="text-xs text-foreground/40 mb-3">
            Berlaku hingga: {new Date(details.expiryTime).toLocaleString("id-ID")}
          </p>
        )}
        <div className="rounded-xl bg-foreground/[0.03] border border-border p-3 space-y-1 text-xs text-foreground/50">
          <p>• Buka Mandiri Online / ATM Mandiri</p>
          <p>• Pilih Bayar → Multipayment</p>
          <p>• Masukkan Kode Perusahaan dan Kode Tagihan</p>
          <p>• Konfirmasi pembayaran</p>
        </div>
      </div>
    );
  }

  if (details.type === "gopay") {
    return (
      <div className="bg-card border border-border rounded-2xl p-5 mb-4">
        <h3 className="text-xs font-bold text-foreground/40 uppercase tracking-wider mb-4">
          GoPay
        </h3>
        {details.qrImageUrl && (
          <div className="flex justify-center mb-4">
            <div className="bg-white p-4 rounded-2xl border border-border">
              <Image src={details.qrImageUrl} alt="GoPay QR" width={208} height={208} className="object-contain" />
            </div>
          </div>
        )}
        {details.deeplinkUrl && (
          <a
            href={details.deeplinkUrl}
            className="block w-full text-center py-3 rounded-xl bg-[#00AED6] text-white font-bold text-sm mb-3 hover:opacity-90 transition-opacity"
          >
            Buka Aplikasi GoPay
          </a>
        )}
        {details.expiryTime && (
          <p className="text-xs text-center text-foreground/40">
            Berlaku hingga: {new Date(details.expiryTime).toLocaleString("id-ID")}
          </p>
        )}
      </div>
    );
  }

  if (details.type === "dana") {
    return (
      <div className="bg-card border border-border rounded-2xl p-5 mb-4">
        <h3 className="text-xs font-bold text-foreground/40 uppercase tracking-wider mb-4">DANA</h3>
        {details.redirectUrl && (
          <a
            href={details.redirectUrl}
            className="block w-full text-center py-3 rounded-xl bg-[#118EEA] text-white font-bold text-sm hover:opacity-90 transition-opacity"
          >
            Lanjutkan Pembayaran di DANA
          </a>
        )}
      </div>
    );
  }

  if (details.type === "ovo") {
    return (
      <div className="bg-card border border-border rounded-2xl p-5 mb-4">
        <h3 className="text-xs font-bold text-foreground/40 uppercase tracking-wider mb-4">OVO</h3>
        <p className="text-sm text-foreground/60 text-center py-4">
          Notifikasi pembayaran telah dikirim ke aplikasi OVO Anda.
          <br />Buka aplikasi OVO dan konfirmasi pembayaran.
        </p>
      </div>
    );
  }

  if (details.type === "shopeepay") {
    return (
      <div className="bg-card border border-border rounded-2xl p-5 mb-4">
        <h3 className="text-xs font-bold text-foreground/40 uppercase tracking-wider mb-4">ShopeePay</h3>
        {details.redirectUrl && (
          <a
            href={details.redirectUrl}
            className="block w-full text-center py-3 rounded-xl bg-[#EE4D2D] text-white font-bold text-sm mb-3 hover:opacity-90 transition-opacity"
          >
            Buka Aplikasi ShopeePay
          </a>
        )}
        {details.expiryTime && (
          <p className="text-xs text-center text-foreground/40 mb-3">
            Berlaku hingga: {new Date(details.expiryTime).toLocaleString("id-ID")}
          </p>
        )}
        <div className="rounded-xl bg-foreground/[0.03] border border-border p-3 space-y-1 text-xs text-foreground/50">
          <p>• Klik tombol di atas untuk membuka ShopeePay</p>
          <p>• Konfirmasi pembayaran di aplikasi Shopee</p>
        </div>
      </div>
    );
  }

  return null;
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function PaymentPage({ params }: { params: Promise<{ orderId: string }> }) {
  const { orderId } = use(params);
  const { order, orderItems, loading } = usePaymentStatus(orderId);
  const router = useRouter();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-brand border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-6">
        <p className="text-foreground/50">Pesanan tidak ditemukan</p>
        <Button onClick={() => router.push("/")} className="bg-brand text-brand-fg rounded-xl">
          Kembali ke Beranda
        </Button>
      </div>
    );
  }

  const config = STATUS_CONFIG[order.status as keyof typeof STATUS_CONFIG];
  const Icon = config.icon;

  // Parse payment details dari payment_token (JSON)
  let paymentDetails: PaymentDetails | null = null;
  if (order.payment_token) {
    try {
      paymentDetails = JSON.parse(order.payment_token) as PaymentDetails;
    } catch {
      paymentDetails = null;
    }
  }

  return (
    <div className="min-h-screen px-6 py-8">
      <div className="max-w-lg mx-auto">

        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => router.push("/history")}
            className="w-9 h-9 rounded-xl bg-foreground/[0.05] border border-border flex items-center justify-center hover:bg-foreground/10 transition-colors"
          >
            <ArrowLeft size={16} className="text-foreground/60" />
          </button>
          <div>
            <h1
              className="text-xl font-bold text-foreground"
              style={{ fontFamily: "var(--font-playfair), serif" }}
            >
              Status Pembayaran
            </h1>
            <p className="text-xs text-foreground/30 mt-0.5 font-mono">
              {order.midtrans_order_id || order.id}
            </p>
          </div>
        </div>

        {/* Status Card */}
        <div className={`rounded-2xl border p-6 mb-4 ${config.bg} ${config.border}`}>
          <div className="flex flex-col items-center text-center gap-3">
            <div className={`w-16 h-16 rounded-2xl border flex items-center justify-center ${config.bg} ${config.border}`}>
              <Icon size={32} className={config.color} />
            </div>
            <div>
              <h2 className={`text-lg font-bold ${config.color}`}>{config.title}</h2>
              <p className="text-sm text-foreground/50 mt-1">{config.desc}</p>
            </div>
          </div>
          {config.realtime && (
            <div className="mt-4 flex items-center justify-center gap-2 text-xs text-foreground/40">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              Memantau status secara real-time...
            </div>
          )}
        </div>

        {/* Payment Instructions — hanya tampil saat pending */}
        {order.status === "pending" && paymentDetails && paymentDetails.type !== "unknown" && (
          <PaymentInstructions details={paymentDetails} />
        )}

        {/* Order Info */}
        <div className="bg-card border border-border rounded-2xl p-5 mb-4">
          <h3 className="text-xs font-bold text-foreground/40 uppercase tracking-wider mb-3 flex items-center gap-2">
            <CreditCard size={12} />
            Ringkasan Pembayaran
          </h3>
          <div className="space-y-2.5">
            <div className="flex justify-between text-sm">
              <span className="text-foreground/40">Total Bayar</span>
              <span className="font-bold text-brand">
                Rp {order.total_amount.toLocaleString("id-ID")}
              </span>
            </div>
            {order.discount_amount > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-foreground/40">Diskon</span>
                <span className="text-green-500 font-semibold">
                  -Rp {order.discount_amount.toLocaleString("id-ID")}
                </span>
              </div>
            )}
            {order.payment_method && (
              <div className="flex justify-between text-sm">
                <span className="text-foreground/40">Metode Bayar</span>
                <span className="text-foreground/70 capitalize">{order.payment_method}</span>
              </div>
            )}
            {order.paid_at && (
              <div className="flex justify-between text-sm">
                <span className="text-foreground/40">Waktu Bayar</span>
                <span className="text-foreground/70 text-xs">
                  {new Date(order.paid_at).toLocaleString("id-ID")}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Order Items */}
        {orderItems.length > 0 && (
          <div className="bg-card border border-border rounded-2xl p-5 mb-6">
            <h3 className="text-xs font-bold text-foreground/40 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Package size={12} />
              Item Pesanan
            </h3>
            <div className="space-y-2">
              {orderItems.map((item) => (
                <div key={item.id} className="flex justify-between items-center">
                  <span className="text-sm text-foreground/70">
                    {item.products?.name}{" "}
                    <span className="text-foreground/40">({item.quantity} {item.products?.unit})</span>
                  </span>
                  <span className="text-sm font-semibold text-foreground/80">
                    Rp {item.subtotal.toLocaleString("id-ID")}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="space-y-3">
          <Button
            onClick={() => router.push("/history")}
            variant="outline"
            className="w-full h-11 rounded-xl border-border text-foreground/60 hover:text-foreground"
          >
            Lihat Riwayat Pesanan
          </Button>
          {order.status !== "pending" && (
            <Button
              onClick={() => router.push("/")}
              variant="ghost"
              className="w-full h-11 rounded-xl text-foreground/50 hover:text-foreground"
            >
              Kembali Belanja
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
