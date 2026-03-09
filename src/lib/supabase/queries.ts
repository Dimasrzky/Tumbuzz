import { createClient } from "@/lib/supabase/client";

// ── Products ─────────────────────────────────────────────────────────────

export async function getProducts(filters?: {
  category?: string;
  search?: string;
}) {
  const supabase = createClient();

  let query = supabase
    .from("products")
    .select(`
      *,
      categories (
        id,
        name,
        slug
      )
    `)
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  if (filters?.search) {
    query = query.ilike("name", `%${filters.search}%`);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function getProductById(id: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("products")
    .select("*, categories(*)")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data;
}

// ── Admin: Products CRUD ──────────────────────────────────────────────────

export async function getAllProductsAdmin() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("products")
    .select("*, categories(name)")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}

export async function createProduct(product: {
  name: string;
  price: number;
  unit: string;
  category_id: number;
  stock: number;
  discount: number;
  image_url: string;
  description?: string;
  badge?: string;
}) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("products")
    .insert(product)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateProduct(
  id: string,
  updates: Partial<{
    name: string;
    price: number;
    unit: string;
    category_id: number;
    stock: number;
    discount: number;
    image_url: string;
    description: string;
    badge: string;
    is_active: boolean;
  }>
) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("products")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteProduct(id: string) {
  const supabase = createClient();
  const { error } = await supabase
    .from("products")
    .update({ is_active: false })
    .eq("id", id);

  if (error) throw error;
}

// ── Categories ────────────────────────────────────────────────────────────

export async function getCategories() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .order("name");

  if (error) throw error;
  return data;
}

// ── Orders ────────────────────────────────────────────────────────────────

export async function createOrder(
  userId: string,
  items: { product_id: string; quantity: number; unit_price: number }[],
  totalAmount: number,
  discountAmount: number = 0,
  voucherCode?: string
) {
  const supabase = createClient();

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      user_id: userId,
      total_amount: totalAmount,
      discount_amount: discountAmount,
      voucher_code: voucherCode || null,
      status: "proses",
    })
    .select()
    .single();

  if (orderError) throw orderError;

  const orderItems = items.map((item) => ({
    order_id: order.id,
    product_id: item.product_id,
    quantity: item.quantity,
    unit_price: item.unit_price,
  }));

  const { error: itemsError } = await supabase
    .from("order_items")
    .insert(orderItems);

  if (itemsError) throw itemsError;

  return order;
}

export async function getUserOrders(userId: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("orders")
    .select(`
      *,
      order_items (
        *,
        products (name, image_url, unit)
      )
    `)
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}

// ── Admin: Orders ─────────────────────────────────────────────────────────

export async function getAllOrdersAdmin() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("orders")
    .select(`
      *,
      profiles (full_name, email, avatar_url),
      order_items (
        *,
        products (name)
      )
    `)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}

export async function updateOrderStatus(
  orderId: string,
  status: "proses" | "selesai" | "dibatalkan"
) {
  const supabase = createClient();
  const { error } = await supabase
    .from("orders")
    .update({ status })
    .eq("id", orderId);

  if (error) throw error;
}

// ── Admin: Analytics ──────────────────────────────────────────────────────

export async function getDashboardStats() {
  const supabase = createClient();

  const [ordersRes, usersRes, productsRes] = await Promise.all([
    supabase
      .from("orders")
      .select("total_amount, status, created_at")
      .eq("status", "selesai"),
    supabase
      .from("profiles")
      .select("id", { count: "exact" })
      .eq("role", "user"),
    supabase
      .from("order_items")
      .select("quantity, unit_price"),
  ]);

  const totalRevenue =
    ordersRes.data?.reduce((acc, o) => acc + o.total_amount, 0) ?? 0;
  const totalOrders = ordersRes.data?.length ?? 0;
  const totalUsers = usersRes.count ?? 0;
  const totalSold =
    productsRes.data?.reduce((acc, i) => acc + i.quantity, 0) ?? 0;

  return { totalRevenue, totalOrders, totalUsers, totalSold };
}