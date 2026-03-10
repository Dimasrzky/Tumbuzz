import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  const supabase = createAdminClient();

  const [ordersRes, usersRes, productsRes] = await Promise.all([
    supabase
      .from("orders")
      .select("total_amount, status, created_at")
      .eq("status", "selesai"),
    supabase
      .from("profiles")
      .select("id", { count: "exact" })
      .eq("role", "user"),
    supabase.from("order_items").select("quantity, unit_price"),
  ]);

  if (ordersRes.error) {
    return NextResponse.json({ error: ordersRes.error.message }, { status: 500 });
  }

  const totalRevenue =
    ordersRes.data?.reduce((acc, o) => acc + o.total_amount, 0) ?? 0;
  const totalOrders = ordersRes.data?.length ?? 0;
  const totalUsers = usersRes.count ?? 0;
  const totalSold =
    productsRes.data?.reduce((acc, i) => acc + i.quantity, 0) ?? 0;

  return NextResponse.json({ totalRevenue, totalOrders, totalUsers, totalSold });
}
