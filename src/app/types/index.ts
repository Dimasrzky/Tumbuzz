// types/index.ts — definisi struktur sesuai schema Supabase kamu
export type OrderStatus = "pending" | "proses" | "selesai" | "dibatalkan";

export interface Order {
  id: string;
  user_id: string;
  status: OrderStatus;
  total_amount: number;
  discount_amount: number;
  voucher_code: string | null;
  notes: string | null;
  payment_method: string | null;
  payment_token: string | null;
  payment_url: string | null;
  midtrans_order_id: string | null;
  paid_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
  products?: {
    id: string;
    name: string;
    unit: string;
    image_url: string | null;
  };
}

export interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  unit: string;
  image_url: string | null;
  category_id: number | null;
  stock: number;
  discount: number;
  badge: string | null;
  rating: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: string;
  full_name: string | null;
  email: string;
  avatar_url: string | null;
  role: "user" | "admin";
  created_at: string;
  updated_at: string;
}

export interface CartItem {
  product_id: string;
  quantity: number;
}

export interface CustomerDetails {
  phone: string;
  address: string;
  city: string;
  postalCode: string;
}