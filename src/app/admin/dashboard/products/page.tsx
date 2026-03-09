"use client";

import { useState } from "react";
import {
  Plus, Search, Pencil, Trash2, X, Save,
  AlertCircle, Package, Loader2, ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

// ── Types ────────────────────────────────────────────────────────────────
interface Product {
  id: string;
  name: string;
  price: number;
  unit: string;
  category: string;
  stock: number;
  discount: number;
  image: string;
}

// ── Mock Data ─────────────────────────────────────────────────────────────
const INITIAL_PRODUCTS: Product[] = [
  { id: "1", name: "Beras Premium Pandan Wangi 5kg", price: 85000, unit: "karung", category: "Sembako", stock: 50, discount: 0, image: "" },
  { id: "2", name: "Minyak Goreng Tropical 2L", price: 32000, unit: "botol", category: "Sembako", stock: 120, discount: 10, image: "" },
  { id: "3", name: "Telur Ayam Negeri 1kg", price: 28000, unit: "kg", category: "Protein", stock: 80, discount: 0, image: "" },
  { id: "4", name: "Sabun Mandi Dove Original", price: 8500, unit: "pcs", category: "Kebersihan", stock: 200, discount: 15, image: "" },
  { id: "5", name: "Gula Pasir Putih 1kg", price: 15000, unit: "kg", category: "Sembako", stock: 90, discount: 0, image: "" },
  { id: "6", name: "Indomie Goreng Spesial", price: 3500, unit: "bungkus", category: "Makanan", stock: 500, discount: 0, image: "" },
];

const CATEGORIES = ["Sembako", "Protein", "Makanan", "Minuman", "Kebersihan", "Bumbu", "Rumah Tangga"];

const EMPTY_FORM: Omit<Product, "id"> = {
  name: "", price: 0, unit: "", category: "Sembako", stock: 0, discount: 0, image: "",
};

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Omit<Product, "id">>(EMPTY_FORM);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof Product, string>>>({});

  // ── Helpers ──────────────────────────────────────────────────────────
  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.category.toLowerCase().includes(search.toLowerCase())
  );

  const validateForm = () => {
    const e: Partial<Record<keyof Product, string>> = {};
    if (!form.name.trim()) e.name = "Nama produk wajib diisi";
    if (form.price <= 0) e.price = "Harga harus lebih dari 0";
    if (!form.unit.trim()) e.unit = "Satuan wajib diisi";
    if (form.stock < 0) e.stock = "Stok tidak boleh negatif";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // ── CRUD ─────────────────────────────────────────────────────────────
  const openCreate = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setErrors({});
    setShowModal(true);
  };

  const openEdit = (product: Product) => {
    setEditingId(product.id);
    const { id, ...rest } = product;
    setForm(rest);
    setErrors({});
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!validateForm()) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 600)); // simulate API

    if (editingId) {
      setProducts((prev) =>
        prev.map((p) => (p.id === editingId ? { ...form, id: editingId } : p))
      );
    } else {
      const newProduct: Product = {
        ...form,
        id: Date.now().toString(),
      };
      setProducts((prev) => [newProduct, ...prev]);
    }

    setLoading(false);
    setShowModal(false);
  };

  const handleDelete = async (id: string) => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 400));
    setProducts((prev) => prev.filter((p) => p.id !== id));
    setDeleteConfirm(null);
    setLoading(false);
  };

  const updateForm = (field: keyof typeof form, value: string | number) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1
            className="text-2xl font-bold text-white"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Kelola Produk
          </h1>
          <p className="text-xs text-white/30 mt-0.5">{products.length} produk terdaftar</p>
        </div>
        <Button
          onClick={openCreate}
          className="h-10 px-4 rounded-xl bg-[#c8e6c9] hover:bg-[#a5d6a7] text-[#1a3a1a] font-bold text-sm gap-2 shadow-lg shadow-[#c8e6c9]/10"
        >
          <Plus size={15} />
          Tambah Produk
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/25" />
        <Input
          placeholder="Cari produk atau kategori..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 h-10 bg-white/5 border-white/8 text-white placeholder:text-white/20 text-sm rounded-xl focus:border-[#c8e6c9]/30 focus:ring-0"
        />
      </div>

      {/* Table */}
      <div className="bg-[#0f0f0f] border border-white/6 rounded-2xl overflow-hidden">
        {/* Table Head */}
        <div className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_auto] gap-4 px-5 py-3 border-b border-white/5">
          {["Nama Produk", "Kategori", "Harga", "Stok", "Diskon", "Aksi"].map((h) => (
            <p key={h} className="text-[10px] font-bold text-white/25 uppercase tracking-wider">
              {h}
            </p>
          ))}
        </div>

        {/* Table Body */}
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <Package size={28} className="text-white/15" />
            <p className="text-sm text-white/25">Tidak ada produk ditemukan</p>
          </div>
        ) : (
          filtered.map((product, i) => (
            <div
              key={product.id}
              className={cn(
                "grid grid-cols-[2fr_1fr_1fr_1fr_1fr_auto] gap-4 px-5 py-4 items-center",
                "hover:bg-white/2 transition-colors",
                i < filtered.length - 1 && "border-b border-white/4"
              )}
            >
              <div>
                <p className="text-sm font-semibold text-white/80 leading-snug">{product.name}</p>
                <p className="text-[11px] text-white/25 mt-0.5">{product.unit}</p>
              </div>
              <Badge className="bg-white/6 text-white/50 border-white/10 text-[10px] font-semibold rounded-lg w-fit border">
                {product.category}
              </Badge>
              <p className="text-sm font-semibold text-[#c8e6c9]">
                Rp {product.price.toLocaleString("id-ID")}
              </p>
              <div className="flex items-center gap-1.5">
                <span className={cn(
                  "text-sm font-bold",
                  product.stock <= 10 ? "text-amber-400" : "text-white/70"
                )}>
                  {product.stock}
                </span>
                {product.stock <= 10 && (
                  <AlertCircle size={12} className="text-amber-400" />
                )}
              </div>
              <div>
                {product.discount > 0 ? (
                  <Badge className="bg-red-400/10 text-red-400 border-red-400/20 text-[10px] font-bold rounded-lg border">
                    -{product.discount}%
                  </Badge>
                ) : (
                  <span className="text-xs text-white/20">—</span>
                )}
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => openEdit(product)}
                  className="w-8 h-8 rounded-lg bg-white/5 hover:bg-blue-400/10 text-white/30 hover:text-blue-400 flex items-center justify-center transition-all"
                >
                  <Pencil size={13} />
                </button>
                <button
                  onClick={() => setDeleteConfirm(product.id)}
                  className="w-8 h-8 rounded-lg bg-white/5 hover:bg-red-400/10 text-white/30 hover:text-red-400 flex items-center justify-center transition-all"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* ── Create/Edit Modal ── */}
      <Dialog open={showModal} onOpenChange={(o) => !loading && setShowModal(o)}>
        <DialogContent className="bg-[#0f0f0f] border border-white/8 rounded-2xl p-6 max-w-lg w-full shadow-2xl">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-base font-bold text-white">
              {editingId ? "Edit Produk" : "Tambah Produk Baru"}
            </h2>
            <button
              onClick={() => !loading && setShowModal(false)}
              className="w-8 h-8 rounded-lg bg-white/5 text-white/30 hover:text-white flex items-center justify-center"
            >
              <X size={14} />
            </button>
          </div>

          <div className="space-y-4">
            {/* Name */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-white/40 uppercase tracking-wider">Nama Produk</Label>
              <Input
                value={form.name}
                onChange={(e) => updateForm("name", e.target.value)}
                placeholder="contoh: Beras Premium 5kg"
                className={cn(
                  "h-10 bg-white/5 border-white/10 text-white placeholder:text-white/20 text-sm rounded-xl focus:ring-0",
                  errors.name ? "border-red-400/40" : "focus:border-[#c8e6c9]/40"
                )}
              />
              {errors.name && <p className="text-xs text-red-400">{errors.name}</p>}
            </div>

            {/* Price + Unit */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-white/40 uppercase tracking-wider">Harga (Rp)</Label>
                <Input
                  type="number"
                  value={form.price || ""}
                  onChange={(e) => updateForm("price", Number(e.target.value))}
                  placeholder="85000"
                  className={cn(
                    "h-10 bg-white/5 border-white/10 text-white placeholder:text-white/20 text-sm rounded-xl focus:ring-0",
                    errors.price ? "border-red-400/40" : "focus:border-[#c8e6c9]/40"
                  )}
                />
                {errors.price && <p className="text-xs text-red-400">{errors.price}</p>}
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-white/40 uppercase tracking-wider">Satuan</Label>
                <Input
                  value={form.unit}
                  onChange={(e) => updateForm("unit", e.target.value)}
                  placeholder="kg / pcs / botol"
                  className={cn(
                    "h-10 bg-white/5 border-white/10 text-white placeholder:text-white/20 text-sm rounded-xl focus:ring-0",
                    errors.unit ? "border-red-400/40" : "focus:border-[#c8e6c9]/40"
                  )}
                />
                {errors.unit && <p className="text-xs text-red-400">{errors.unit}</p>}
              </div>
            </div>

            {/* Category + Stock */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-white/40 uppercase tracking-wider">Kategori</Label>
                <div className="relative">
                  <select
                    value={form.category}
                    onChange={(e) => updateForm("category", e.target.value)}
                    className="w-full h-10 bg-white/5 border border-white/10 text-white text-sm rounded-xl px-3 focus:outline-none focus:border-[#c8e6c9]/40 appearance-none cursor-pointer"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c} className="bg-[#1a1a1a]">{c}</option>
                    ))}
                  </select>
                  <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-white/40 uppercase tracking-wider">Stok</Label>
                <Input
                  type="number"
                  value={form.stock || ""}
                  onChange={(e) => updateForm("stock", Number(e.target.value))}
                  placeholder="100"
                  className={cn(
                    "h-10 bg-white/5 border-white/10 text-white placeholder:text-white/20 text-sm rounded-xl focus:ring-0",
                    errors.stock ? "border-red-400/40" : "focus:border-[#c8e6c9]/40"
                  )}
                />
                {errors.stock && <p className="text-xs text-red-400">{errors.stock}</p>}
              </div>
            </div>

            {/* Discount + Image */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-white/40 uppercase tracking-wider">Diskon (%)</Label>
                <Input
                  type="number"
                  min={0} max={100}
                  value={form.discount || ""}
                  onChange={(e) => updateForm("discount", Number(e.target.value))}
                  placeholder="0"
                  className="h-10 bg-white/5 border-white/10 text-white placeholder:text-white/20 text-sm rounded-xl focus:border-[#c8e6c9]/40 focus:ring-0"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-white/40 uppercase tracking-wider">URL Gambar</Label>
                <Input
                  value={form.image}
                  onChange={(e) => updateForm("image", e.target.value)}
                  placeholder="https://..."
                  className="h-10 bg-white/5 border-white/10 text-white placeholder:text-white/20 text-sm rounded-xl focus:border-[#c8e6c9]/40 focus:ring-0"
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 mt-6">
            <Button
              onClick={() => !loading && setShowModal(false)}
              variant="ghost"
              className="flex-1 h-10 rounded-xl bg-white/5 text-white/50 hover:bg-white/8 hover:text-white border border-white/8 text-sm"
            >
              Batal
            </Button>
            <Button
              onClick={handleSave}
              disabled={loading}
              className="flex-1 h-10 rounded-xl bg-[#c8e6c9] hover:bg-[#a5d6a7] text-[#1a3a1a] font-bold text-sm gap-2"
            >
              {loading ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <>
                  <Save size={13} />
                  {editingId ? "Simpan" : "Tambahkan"}
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Delete Confirm Modal ── */}
      <Dialog open={!!deleteConfirm} onOpenChange={(o) => !o && setDeleteConfirm(null)}>
        <DialogContent className="bg-[#0f0f0f] border border-white/8 rounded-2xl p-6 max-w-sm w-full shadow-2xl">
          <div className="flex flex-col items-center text-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/15 flex items-center justify-center">
              <Trash2 size={20} className="text-red-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Hapus Produk?</h3>
              <p className="text-xs text-white/40 mt-1.5">
                Produk akan dihapus permanen dan tidak dapat dikembalikan.
              </p>
            </div>
            <div className="flex gap-3 w-full mt-2">
              <Button
                onClick={() => setDeleteConfirm(null)}
                variant="ghost"
                className="flex-1 h-10 rounded-xl bg-white/5 text-white/50 hover:bg-white/8 border border-white/8 text-sm"
              >
                Batal
              </Button>
              <Button
                onClick={() => deleteConfirm && handleDelete(deleteConfirm)}
                disabled={loading}
                className="flex-1 h-10 rounded-xl bg-red-500/15 hover:bg-red-500/25 text-red-400 border border-red-500/20 text-sm font-bold gap-2"
              >
                {loading ? <Loader2 size={13} className="animate-spin" /> : "Hapus"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}