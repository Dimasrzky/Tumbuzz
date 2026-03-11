import { NextResponse, NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import crypto from "crypto";

const supabaseAdmin = createAdminClient();

const statusMap: Record<string, string> = {
  capture: "proses",
  settlement: "proses",
  pending: "pending",
  deny: "dibatalkan",
  cancel: "dibatalkan",
  expire: "dibatalkan",
  failure: "dibatalkan",
};

function mapMidtransStatus(transactionStatus: string, fraudStatus: string): string {
  if (fraudStatus === "deny") return "dibatalkan";
  return statusMap[transactionStatus] || "pending";
}

function verifySignature(orderId: string, statusCode: string, grossAmount: string, serverKey: string): string {
  return crypto
    .createHash("sha512")
    .update(`${orderId}${statusCode}${grossAmount}${serverKey}`)
    .digest("hex");
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      order_id,
      transaction_status,
      fraud_status,
      status_code,
      gross_amount,
      signature_key,
      payment_type,
      transaction_time,
    }: {
      order_id: string;
      transaction_status: string;
      fraud_status: string;
      status_code: string;
      gross_amount: string;
      signature_key: string;
      payment_type: string;
      transaction_time: string;
    } = body;

    // 🔐 Verifikasi signature Midtrans
    const expectedSignature = verifySignature(
      order_id,
      status_code,
      gross_amount,
      process.env.MIDTRANS_SERVER_KEY!
    );

    if (signature_key !== expectedSignature) {
      console.error("❌ Invalid Midtrans signature");
      return NextResponse.json({ message: "Invalid signature" }, { status: 401 });
    }

    // Tentukan status sesuai schema orders
    const newStatus = mapMidtransStatus(transaction_status, fraud_status);

    // Cari order berdasarkan midtrans_order_id
    const { data: existingOrder, error: findError } = await supabaseAdmin
      .from("orders")
      .select("id, status")
      .eq("midtrans_order_id", order_id)
      .single();

    if (findError || !existingOrder) {
      console.error("❌ Order tidak ditemukan:", order_id);
      return NextResponse.json({ message: "Order not found" }, { status: 404 });
    }

    // Idempotent: jangan update jika status sudah final
    const finalStatuses = ["selesai", "dibatalkan"];
    if (finalStatuses.includes(existingOrder.status) && existingOrder.status !== "proses") {
      console.log(`⚠️ Order ${order_id} sudah final: ${existingOrder.status}`);
      return NextResponse.json({ message: "Already processed" }, { status: 200 });
    }

    // ⚡ Update order — ini yang trigger Supabase Realtime ke frontend!
    const updatePayload: Record<string, string> = {
      status: newStatus,
      payment_method: payment_type,
      updated_at: new Date().toISOString(),
    };

    if (newStatus === "proses") {
      updatePayload.paid_at = transaction_time;
    }

    const { error: updateError } = await supabaseAdmin
      .from("orders")
      .update(updatePayload)
      .eq("id", existingOrder.id);

    if (updateError) throw updateError;

    // Simpan log webhook (opsional — tidak gagalkan proses jika tabel belum ada)
    await supabaseAdmin.from("payment_logs").insert({
      midtrans_order_id: order_id,
      order_id: existingOrder.id,
      raw_payload: body,
    }).then(({ error }: { error: { message: string } | null }) => {
      if (error) console.warn("⚠️ payment_logs insert skipped:", error.message);
    });

    console.log(`✅ Order ${order_id} → ${newStatus}`);
    return NextResponse.json({ message: "OK" }, { status: 200 });

  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal server error";
    console.error("❌ Webhook error:", error);
    return NextResponse.json({ message }, { status: 500 });
  }
}
