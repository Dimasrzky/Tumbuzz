import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Order, OrderItem } from "@/app/types";

const supabase = createClient();

interface UsePaymentStatusReturn {
  order: Order | null;
  orderItems: OrderItem[];
  loading: boolean;
}

export function usePaymentStatus(orderId: string): UsePaymentStatusReturn {
  const [order, setOrder] = useState<Order | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!orderId) return;

    const fetchOrderWithItems = async () => {
      const { data: orderData, error: orderError } = await supabase
        .from("orders")
        .select(`
          id, status, total_amount, discount_amount,
          voucher_code, notes, payment_method, payment_token,
          midtrans_order_id, paid_at, created_at, updated_at
        `)
        .eq("id", orderId)
        .single();

      if (!orderError && orderData) {
        setOrder(orderData as Order);

        const { data: items } = await supabase
          .from("order_items")
          .select(`
            id, order_id, product_id, quantity, unit_price, subtotal,
            products ( id, name, unit, image_url )
          `)
          .eq("order_id", orderId);

        setOrderItems((items as unknown as OrderItem[]) || []);
      }

      setLoading(false);
    };

    fetchOrderWithItems();

    const channel = supabase
      .channel(`order-status-${orderId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "orders",
          filter: `id=eq.${orderId}`,
        },
        (payload) => {
          setOrder((prev) => ({ ...prev, ...payload.new } as Order));
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [orderId]);

  return { order, orderItems, loading };
}
