"use client";

import { useState, useMemo } from "react";
import { Search, SlidersHorizontal, ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProductCard, type Product } from "@/components/user/product-card";
import { CartPanel, type CartItem } from "@/components/user/cart-panel";
import { LoginModal } from "@/components/user/login-modal";
import { cn } from "@/lib/utils";

// ─── Mock Data (replace with Supabase fetch later) ───────────────────────────
const MOCK_PRODUCTS: Product[] = [
  { id: "1", name: "Beras Premium Pandan Wangi 5kg", price: 85000, unit: "karung", image: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&h=300&fit=crop", category: "Sembako", rating: 4.8, stock: 50, badge: "Terlaris" },
  { id: "2", name: "Minyak Goreng Tropical 2L", price: 32000, unit: "botol", image: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400&h=300&fit=crop", category: "Sembako", rating: 4.5, stock: 120, discount: 10 },
  { id: "3", name: "Telur Ayam Negeri 1kg", price: 28000, unit: "kg", image: "https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=400&h=300&fit=crop", category: "Protein", rating: 4.7, stock: 80, badge: "Segar" },
  { id: "4", name: "Sabun Mandi Dove Original", price: 8500, unit: "pcs", image: "https://images.unsplash.com/photo-1631390573753-f0eff9cbde6e?w=400&h=300&fit=crop", category: "Kebersihan", rating: 4.6, stock: 200, discount: 15 },
  { id: "5", name: "Gula Pasir Putih 1kg", price: 15000, unit: "kg", image: "https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?w=400&h=300&fit=crop", category: "Sembako", rating: 4.4, stock: 90 },
  { id: "6", name: "Deterjen Rinso Matic 1.8kg", price: 45000, unit: "pack", image: "https://images.unsplash.com/photo-1604335399105-a0c585fd81a1?w=400&h=300&fit=crop", category: "Rumah Tangga", rating: 4.7, stock: 60, discount: 5 },
  { id: "7", name: "Indomie Goreng Spesial", price: 3500, unit: "bungkus", image: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400&h=300&fit=crop", category: "Makanan", rating: 4.9, stock: 500, badge: "Favorit" },
  { id: "8", name: "Shampo Pantene 170ml", price: 22000, unit: "botol", image: "https://images.unsplash.com/photo-1526947425960-945c6e72858f?w=400&h=300&fit=crop", category: "Kebersihan", rating: 4.5, stock: 150 },
  { id: "9", name: "Teh Celup Sariwangi 25s", price: 11000, unit: "kotak", image: "https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=400&h=300&fit=crop", category: "Minuman", rating: 4.6, stock: 300 },
  { id: "10", name: "Susu UHT Ultra Milk 1L", price: 18500, unit: "liter", image: "https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400&h=300&fit=crop", category: "Minuman", rating: 4.8, stock: 75, discount: 8 },
  { id: "11", name: "Kecap Manis ABC 625ml", price: 19000, unit: "botol", image: "https://images.unsplash.com/photo-1562802378-063ec186a863?w=400&h=300&fit=crop", category: "Bumbu", rating: 4.7, stock: 100 },
  { id: "12", name: "Pel Lantai Super Mop", price: 55000, unit: "pcs", image: "https://images.unsplash.com/photo-1563453392212-326f5e854473?w=400&h=300&fit=crop", category: "Rumah Tangga", rating: 4.3, stock: 8, badge: "Hampir Habis" },
];

const CATEGORIES = ["Semua", "Sembako", "Protein", "Makanan", "Minuman", "Kebersihan", "Bumbu", "Rumah Tangga"];

const SORT_OPTIONS = [
  { label: "Terpopuler", value: "popular" },
  { label: "Harga Terendah", value: "price_asc" },
  { label: "Harga Tertinggi", value: "price_desc" },
  { label: "Terbaru", value: "newest" },
];

export default function DashboardPage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("Semua");
  const [sortBy, setSortBy] = useState("popular");
  const [showSort, setShowSort] = useState(false);
  const [showLogin, setShowLogin] = useState(false);

  // TODO: Replace with actual Supabase auth
  const isLoggedIn = false;

  // ── Cart handlers ────────────────────────────────────────────────────────
  const handleAddToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.product.id === product.id);
      if (existing) {
        return prev.map((i) =>
          i.product.id === product.id
            ? { ...i, quantity: i.quantity + 1 }
            : i
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
          i.product.id === productId
            ? { ...i, quantity: i.quantity - 1 }
            : i
        );
      }
      return prev.filter((i) => i.product.id !== productId);
    });
  };

  const handleCheckout = () => {
    if (!isLoggedIn) return;
    // TODO: Navigate to checkout page
  };

  // ── Filtered & sorted products ───────────────────────────────────────────
  const filteredProducts = useMemo(() => {
    let result = MOCK_PRODUCTS;

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
  }, [activeCategory, search, sortBy]);

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
              {filteredProducts.length} produk
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
              {CATEGORIES.map((cat) => (
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
          {filteredProducts.length === 0 ? (
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