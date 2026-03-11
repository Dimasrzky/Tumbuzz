import { NextResponse } from "next/server";
import { coreApi } from "@/lib/midtrans";
import { createAdminClient } from "@/lib/supabase/admin";

const supabaseAdmin = createAdminClient();

type CartItem = { product_id: string; quantity: number };

// Buat parameter charge berdasarkan metode pembayaran yang dipilih user
function buildChargeParams(
  paymentMethod: string,
  paymentSub: string,
  midtransOrderId: string,
  totalAmount: number,
  customerDetails: { first_name: string; email: string; phone: string }
) {
  const base = {
    transaction_details: { order_id: midtransOrderId, gross_amount: totalAmount },
    customer_details: customerDetails,
  };

  if (paymentMethod === "qris") {
    return { ...base, payment_type: "qris" };
  }

  if (paymentMethod === "bank") {
    const bankMap: Record<string, string> = { BCA: "bca", BNI: "bni", BRI: "bri" };
    if (paymentSub === "Mandiri") {
      return {
        ...base,
        payment_type: "echannel",
        echannel: { bill_info1: "Pembayaran Tumbuzz", bill_info2: "Order" },
      };
    }
    return {
      ...base,
      payment_type: "bank_transfer",
      bank_transfer: { bank: bankMap[paymentSub] || "bca" },
    };
  }

  if (paymentMethod === "ewallet") {
    if (paymentSub === "GoPay") {
      return { ...base, payment_type: "gopay" };
    }
    if (paymentSub === "Dana") {
      return {
        ...base,
        payment_type: "dana",
        dana: { callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment/` },
      };
    }
    if (paymentSub === "OVO") {
      return {
        ...base,
        payment_type: "ovo",
        ovo: { phone_number: customerDetails.phone || "08000000000" },
      };
    }
    if (paymentSub === "ShopeePay") {
      return {
        ...base,
        payment_type: "shopeepay",
        shopeepay: { callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment/` },
      };
    }
  }

  return null;
}

// Ekstrak detail pembayaran dari response Core API untuk disimpan di DB
function extractPaymentDetails(res: Record<string, unknown>, paymentMethod: string, paymentSub: string) {
  if (paymentMethod === "qris") {
    return {
      type: "qris",
      qrString: res.qr_string,
      qrImageUrl: res.qr_code_url || null,
      expiryTime: res.expiry_time,
    };
  }

  if (paymentMethod === "bank") {
    if (paymentSub === "Mandiri") {
      return {
        type: "echannel",
        bank: "mandiri",
        billerCode: res.biller_code,
        billKey: res.bill_key,
        expiryTime: res.expiry_time,
      };
    }
    const vaNumbers = res.va_numbers as Array<{ bank: string; va_number: string }> | undefined;
    return {
      type: "bank_transfer",
      bank: paymentSub.toLowerCase(),
      vaNumber: vaNumbers?.[0]?.va_number || res.permata_va_number || null,
      expiryTime: res.expiry_time,
    };
  }

  if (paymentMethod === "ewallet") {
    const actions = res.actions as Array<{ name: string; url: string }> | undefined;
    if (paymentSub === "GoPay") {
      return {
        type: "gopay",
        deeplinkUrl: actions?.find((a) => a.name === "deeplink-redirect")?.url || null,
        qrImageUrl: actions?.find((a) => a.name === "generate-qr-code")?.url || null,
        expiryTime: res.expiry_time,
      };
    }
    if (paymentSub === "Dana") {
      return {
        type: "dana",
        redirectUrl: actions?.find((a) => a.name === "redirect-url")?.url || actions?.[0]?.url || null,
        expiryTime: res.expiry_time,
      };
    }
    if (paymentSub === "OVO") {
      return { type: "ovo", expiryTime: res.expiry_time };
    }
    if (paymentSub === "ShopeePay") {
      const actions = res.actions as Array<{ name: string; url: string }> | undefined;
      return {
        type: "shopeepay",
        redirectUrl: actions?.find((a) => a.name === "deeplink-redirect")?.url || actions?.[0]?.url || null,
        expiryTime: res.expiry_time,
      };
    }
  }

  return { type: "unknown" };
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      userId,
      customerDetails,
      cartItems,
      voucherCode,
      discountAmount,
      notes,
      paymentMethod,
      paymentSub,
    }: {
      userId: string;
      customerDetails: { phone: string; address: string; city: string; postalCode: string };
      cartItems: CartItem[];
      voucherCode: string | null;
      discountAmount: number;
      notes: string;
      paymentMethod: string;
      paymentSub: string;
    } = body;

    // Validasi user
    const { data: profile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("id, full_name, email")
      .eq("id", userId)
      .single();

    if (profileError || !profile) {
      return NextResponse.json({ success: false, message: "User tidak ditemukan" }, { status: 404 });
    }

    // Validasi produk & stok
    const productIds = cartItems.map((item) => item.product_id);
    const { data: products, error: productError } = await supabaseAdmin
      .from("products")
      .select("id, name, price, stock, discount, unit, is_active")
      .in("id", productIds)
      .eq("is_active", true);

    if (productError) throw productError;

    const validatedItems: Array<{
      product_id: string; name: string; unit: string;
      quantity: number; unit_price: number; subtotal: number;
    }> = [];

    for (const cartItem of cartItems) {
      const product = products.find((p) => p.id === cartItem.product_id);
      if (!product) {
        return NextResponse.json({ success: false, message: "Produk tidak ditemukan atau tidak aktif" }, { status: 400 });
      }
      if (product.stock < cartItem.quantity) {
        return NextResponse.json({ success: false, message: `Stok ${product.name} tidak mencukupi` }, { status: 400 });
      }
      const unit_price = Math.floor(product.price * (1 - product.discount / 100));
      validatedItems.push({
        product_id: product.id,
        name: product.name,
        unit: product.unit,
        quantity: cartItem.quantity,
        unit_price,
        subtotal: unit_price * cartItem.quantity,
      });
    }

    const totalBeforeDiscount = validatedItems.reduce((sum, item) => sum + item.subtotal, 0);
    const finalDiscount = discountAmount || 0;
    const totalAmount = Math.max(0, totalBeforeDiscount - finalDiscount);

    const midtransOrderId = `TMBZ-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

    // Insert order ke DB
    const { data: order, error: orderError } = await supabaseAdmin
      .from("orders")
      .insert({
        user_id: userId,
        status: "pending",
        total_amount: totalAmount,
        discount_amount: finalDiscount,
        voucher_code: voucherCode || null,
        notes: notes || null,
        midtrans_order_id: midtransOrderId,
      })
      .select()
      .single();

    if (orderError) throw orderError;

    // Insert order_items
    const { error: itemsError } = await supabaseAdmin
      .from("order_items")
      .insert(validatedItems.map((item) => ({
        order_id: order.id,
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price: item.unit_price,
      })));

    if (itemsError) throw itemsError;

    // Buat parameter charge & panggil Core API
    const chargeParams = buildChargeParams(
      paymentMethod,
      paymentSub,
      midtransOrderId,
      totalAmount,
      {
        first_name: profile.full_name || "Customer",
        email: profile.email,
        phone: customerDetails.phone || "",
      }
    );

    if (!chargeParams) {
      return NextResponse.json({ success: false, message: "Metode pembayaran tidak didukung" }, { status: 400 });
    }

    const chargeResponse = await coreApi.charge(chargeParams) as Record<string, unknown>;
    const paymentDetails = extractPaymentDetails(chargeResponse, paymentMethod, paymentSub);

    // Simpan detail pembayaran di payment_token (sebagai JSON string)
    await supabaseAdmin
      .from("orders")
      .update({
        payment_token: JSON.stringify(paymentDetails),
        updated_at: new Date().toISOString(),
      })
      .eq("id", order.id);

    return NextResponse.json({
      success: true,
      orderId: order.id,
      paymentDetails,
    });

  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal server error";
    console.error("❌ Payment creation error:", error);
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
