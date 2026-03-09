"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export interface Product {
  id: string;
  name: string;
  price: number;
  unit: string;
  image_url: string;
  category: { name: string };
  stock: number;
  discount: number;
  badge: string | null;
  rating: number;
}

export function useProducts(categorySlug?: string) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError(null);

      let query = supabase
        .from("products")
        .select(`
          id, name, price, unit, image_url,
          stock, discount, badge, rating,
          category:categories(name)
        `)
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      // Filter by category jika ada
      if (categorySlug && categorySlug !== "semua") {
        query = query.eq("categories.slug", categorySlug);
      }

      const { data, error } = await query;

      if (error) {
        setError("Gagal memuat produk.");
      } else {
        setProducts(data as unknown as Product[]);
      }

      setLoading(false);
    };

    fetchProducts();
  }, [categorySlug]);

  return { products, loading, error };
}