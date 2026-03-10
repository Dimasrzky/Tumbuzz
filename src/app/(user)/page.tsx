"use client";

import { useState, useMemo, useEffect } from "react";
import { Search, SlidersHorizontal, ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ProductCard, type Product } from "@/components/user/product-card";
import { CartPanel, type CartItem } from "@/components/user/cart-panel";
import { LoginModal } from "@/components/user/login-modal";
import { cn } from "@/lib/utils";
import { useAuth } from "@/components/providers";
import { getProducts, getCategories } from "@/lib/supabase/queries";

const SORT_OPTIONS = [
  { label: "Terpopuler", value: "popular" },
  { label: "Harga Terendah", value: "price_asc" },
  { label: "Harga Tertinggi", value: "price_desc" },
  { label: "Terbaru", value: "newest" },
];

export default function DashboardPage() {
  const { user } = useAuth();
  const isLoggedIn = !!user;

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>(["Semua"]);
  const [loading, setLoading] = useState(true);

  const [cart, setCart] = useState<CartItem[]>([]);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("Semua");
  const [sortBy, setSortBy] = useState("popular");
  const [showSort, setShowSort] = useState(false);
  const [showLogin, setShowLogin] = useState(false);

  // ── Fetch dari DB ──────────────────────────────────────────────────────────
  useEffect(() => {
    async function load() {
      try {
        const [rawProducts, rawCategories] = await Promise.all([
          getProducts(),
          getCategories(),
        ]);

        const mapped: Product[] = (rawProducts ?? []).map((p) => ({
          id: String(p.id),
          name: p.name,
          price: p.price,
          unit: p.unit,
          image: p.image_url ?? "",
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          category: (p as any).categories?.name ?? "",
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          rating: (p as any).rating ?? 0,
          stock: p.stock,
          discount: p.discount || undefined,
          badge: p.badge || undefined,
        }));

        setProducts(mapped);
        setCategories([
          "Semua",
          ...(rawCategories ?? []).map((c) => c.name),
        ]);
      } catch (err) {
        console.error("Gagal memuat produk:", err);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  // ── Cart handlers ──────────────────────────────────────────────────────────
  const handleAddToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.product.id === product.id);
      if (existing) {
        return prev.map((i) =>
          i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const handleRemoveFromCart = (productId: string) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.product.id === productId);
      if (existing && existing.quantity > 1) {
        return prev.map((i) =>
          i.product.id === productId ? { ...i, quantity: i.quantity - 1 } : i
        );
      }
      return prev.filter((i) => i.product.id !== productId);
    });
  };

  const handleCheckout = () => {
    if (!isLoggedIn) return;
    // TODO: Navigate to checkout page
  };

  // ── Filter & sort (client-side) ────────────────────────────────────────────
  const filteredProducts = useMemo(() => {
    let result = products;

    if (activeCategory !== "Semua") {
      result = result.filter((p) => p.category === activeCategory);
    }

    if (search) {
      result = result.filter((p) =>
        p.name.toLowerCase().includes(search.toLowerCase())
      );
    }

    switch (sortBy) {
      case "price_asc":
        return [...result].sort((a, b) => a.price - b.price);
      case "price_desc":
        return [...result].sort((a, b) => b.price - a.price);
      case "popular":
        return [...result].sort((a, b) => b.rating - a.rating);
      default:
        return result;
    }
  }, [products, activeCategory, search, sortBy]);

  const getQuantity = (productId: string) =>
    cart.find((i) => i.product.id === productId)?.quantity ?? 0;

  return (
    <div className="flex h-screen overflow-hidden">
      {/* ── Main Content ── */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Top Bar */}
        <div className="shrink-0 border-b border-border bg-background">

          {/* Row 1: Title */}
          <div className="px-6 pt-6 pb-3 flex items-end justify-between">
            <div>
              <p className="text-[10px] font-semibold text-brand/50 uppercase tracking-[0.2em] mb-1">
                Belanja
              </p>
              <h1
                className="text-2xl font-bold text-foreground leading-none"
                style={{ fontFamily: "var(--font-playfair), serif" }}
              >
                Etalase
              </h1>
            </div>
            <p className="text-[11px] text-foreground/25 mb-0.5">
              {loading ? "Memuat..." : `${filteredProducts.length} produk`}
            </p>
          </div>

          {/* Row 2: Search + Sort */}
          <div className="px-6 pb-3.5 flex gap-2">
            <div className="relative flex-1">
              <Search
                size={13}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-foreground/25"
              />
              <Input
                placeholder="Cari nama produk..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-9 bg-foreground/[0.04] border-border text-foreground placeholder:text-foreground/25 text-xs rounded-xl focus:border-brand/25 focus:ring-0 w-full"
              />
            </div>
            <div className="relative shrink-0">
              <Button
                variant="ghost"
                onClick={() => setShowSort(!showSort)}
                className="h-9 px-3 bg-foreground/[0.04] border border-border text-foreground/45 hover:text-foreground/75 hover:bg-foreground/[0.07] rounded-xl text-xs gap-1.5"
              >
                <SlidersHorizontal size={12} />
                {SORT_OPTIONS.find((s) => s.value === sortBy)?.label}
                <ChevronDown size={11} className={cn("transition-transform duration-200", showSort && "rotate-180")} />
              </Button>
              {showSort && (
                <div className="absolute right-0 top-11 z-20 bg-popover border border-border rounded-xl overflow-hidden shadow-2xl min-w-[150px]">
                  {SORT_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => { setSortBy(opt.value); setShowSort(false); }}
                      className={cn(
                        "w-full text-left px-4 py-2.5 text-xs transition-colors",
                        sortBy === opt.value
                          ? "bg-brand/10 text-brand"
                          : "text-foreground/50 hover:bg-foreground/[0.04] hover:text-foreground/80"
                      )}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Row 3: Category Tabs */}
          <div className="pb-3.5">
            <div className="flex gap-1.5 overflow-x-auto scrollbar-none px-6">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={cn(
                    "shrink-0 px-3.5 py-1.5 rounded-full text-[11px] font-medium transition-all duration-200 whitespace-nowrap",
                    activeCategory === cat
                      ? "bg-brand/12 text-brand border border-brand/25"
                      : "text-foreground/35 border border-border hover:border-foreground/20 hover:text-foreground/60"
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* Product Grid */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          {loading ? (
            // ── Skeleton loading ──
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="bg-card border border-border rounded-2xl overflow-hidden">
                  <Skeleton className="h-44 w-full" />
                  <div className="p-4 space-y-2.5">
                    <Skeleton className="h-3 w-16" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-5 w-24 mt-1" />
                    <Skeleton className="h-9 w-full rounded-xl mt-2" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 gap-3">
              <p className="text-foreground/30 text-sm">Produk tidak ditemukan</p>
              <button
                onClick={() => { setSearch(""); setActiveCategory("Semua"); }}
                className="text-xs text-brand/60 hover:text-brand transition-colors"
              >
                Reset filter
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  quantity={getQuantity(product.id)}
                  onAdd={handleAddToCart}
                  onRemove={handleRemoveFromCart}
                />
              ))}
            </div>
          )}
        </div>

        {/* Mobile Cart Summary */}
        {cart.length > 0 && (
          <div className="lg:hidden shrink-0 px-4 py-3 bg-card border-t border-border">
            <Button
              onClick={handleCheckout}
              className="w-full h-12 rounded-xl bg-brand hover:bg-brand/80 text-brand-fg font-bold text-sm gap-2"
            >
              Lihat Keranjang
              <Badge className="bg-brand-fg text-brand text-xs px-2 rounded-full border-0">
                {cart.reduce((a, i) => a + i.quantity, 0)}
              </Badge>
            </Button>
          </div>
        )}
      </div>

      {/* ── Cart Panel (Desktop) ── */}
      <CartPanel
        items={cart}
        onRemoveItem={handleRemoveFromCart}
        onCheckout={handleCheckout}
        onLoginClick={() => setShowLogin(true)}
        isLoggedIn={isLoggedIn}
      />

      <LoginModal
        open={showLogin}
        onClose={() => setShowLogin(false)}
        onGoogleLogin={() => setShowLogin(false)}
      />
    </div>
  );
}
