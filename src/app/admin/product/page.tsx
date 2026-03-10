"use client";

import { useState, useEffect } from "react";
import {
  Plus, Search, Pencil, Trash2, X, Save,
  AlertCircle, Package, Loader2, ChevronDown, Upload, ImageIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

// ── Types ─────────────────────────────────────────────────────────────────
interface Product {
  id: string;
  name: string;
  price: number;
  unit: string;
  category: string;
  category_id: number;
  stock: number;
  discount: number;
  image: string;
}

interface Category {
  id: number;
  name: string;
  slug: string;
}

interface FormState {
  name: string;
  price: number;
  unit: string;
  category_id: number;
  stock: number;
  discount: number;
  image: string;
}

const EMPTY_FORM: FormState = {
  name: "", price: 0, unit: "", category_id: 0, stock: 0, discount: 0, image: "",
};

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [uploadingImage, setUploadingImage] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingImage(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const json = await res.json();
      if (json.url) updateForm("image", json.url);
      else console.error("Upload gagal:", json.error);
    } catch (err) {
      console.error("Upload error:", err);
    } finally {
      setUploadingImage(false);
    }
  };

  // ── Fetch data ──────────────────────────────────────────────────────────
  useEffect(() => {
    async function load() {
      try {
        const [rawProducts, rawCategories] = await Promise.all([
          fetch("/api/admin/products").then((r) => r.json()),
          fetch("/api/admin/categories").then((r) => r.json()),
        ]);

        setCategories(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (Array.isArray(rawCategories) ? rawCategories : []).map((c: any) => ({
            id: c.id as number,
            name: c.name,
            slug: c.slug ?? "",
          }))
        );

        setProducts(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (Array.isArray(rawProducts) ? rawProducts : []).map((p: any) => ({
            id: String(p.id),
            name: p.name,
            price: p.price,
            unit: p.unit,
            category: p.categories?.name ?? "",
            category_id: p.category_id as number,
            stock: p.stock,
            discount: p.discount ?? 0,
            image: p.image_url ?? "",
          }))
        );
      } catch (err) {
        console.error("Gagal memuat produk:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // ── Helpers ─────────────────────────────────────────────────────────────
  const filtered = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase())
  );

  const validateForm = (): boolean => {
    const e: Partial<Record<keyof FormState, string>> = {};
    if (!form.name.trim()) e.name = "Nama produk wajib diisi";
    if (form.price <= 0) e.price = "Harga harus lebih dari 0";
    if (!form.unit.trim()) e.unit = "Satuan wajib diisi";
    if (!form.category_id) e.category_id = "Kategori wajib dipilih";
    if (form.stock < 0) e.stock = "Stok tidak boleh negatif";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const updateForm = (field: keyof FormState, value: string | number) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  // ── CRUD ─────────────────────────────────────────────────────────────────
  const openCreate = () => {
    setEditingId(null);
    setForm({ ...EMPTY_FORM, category_id: categories[0]?.id ?? 0 });
    setErrors({});
    setShowModal(true);
  };

  const openEdit = (product: Product) => {
    setEditingId(product.id);
    setForm({
      name: product.name,
      price: product.price,
      unit: product.unit,
      category_id: product.category_id,
      stock: product.stock,
      discount: product.discount,
      image: product.image,
    });
    setErrors({});
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!validateForm()) return;
    setSaving(true);
    try {
      const payload = {
        name: form.name,
        price: form.price,
        unit: form.unit,
        category_id: form.category_id,
        stock: form.stock,
        discount: form.discount,
        image_url: form.image,
      };

      const categoryName = categories.find((c) => c.id === form.category_id)?.name ?? "";

      if (editingId) {
        await fetch("/api/admin/products", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: editingId, ...payload }),
        });
        setProducts((prev) =>
          prev.map((p) =>
            p.id === editingId
              ? { ...p, ...form, category: categoryName }
              : p
          )
        );
      } else {
        const res = await fetch("/api/admin/products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const created: any = await res.json();
        setProducts((prev) => [
          {
            id: String(created.id),
            name: created.name,
            price: created.price,
            unit: created.unit,
            category: categoryName,
            category_id: created.category_id as number,
            stock: created.stock,
            discount: created.discount ?? 0,
            image: created.image_url ?? "",
          },
          ...prev,
        ]);
      }
      setShowModal(false);
    } catch (err) {
      console.error("Gagal menyimpan produk:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    setSaving(true);
    try {
      await fetch("/api/admin/products", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      setProducts((prev) => prev.filter((p) => p.id !== id));
      setDeleteConfirm(null);
    } catch (err) {
      console.error("Gagal menghapus produk:", err);
    } finally {
      setSaving(false);
    }
  };

  const inputCls = "h-10 bg-black/[0.04] dark:bg-white/5 border-black/10 dark:border-white/10 text-gray-900 dark:text-white placeholder:text-gray-300 dark:placeholder:text-white/20 text-sm rounded-xl focus:ring-0";
  const labelCls = "text-xs font-semibold text-gray-400 dark:text-white/40 uppercase tracking-wider";

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white" style={{ fontFamily: "'Playfair Display', serif" }}>
            Kelola Produk
          </h1>
          <p className="text-xs text-gray-400 dark:text-white/30 mt-0.5">
            {loading ? "Memuat..." : `${products.length} produk terdaftar`}
          </p>
        </div>
        <Button
          onClick={openCreate}
          disabled={loading}
          className="h-10 px-4 rounded-xl bg-brand hover:bg-brand/90 text-brand-fg font-bold text-sm gap-2 shadow-lg shadow-brand/10"
        >
          <Plus size={15} />
          Tambah Produk
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300 dark:text-white/25" />
        <Input
          placeholder="Cari produk atau kategori..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 h-10 bg-black/[0.04] dark:bg-white/5 border-black/[0.08] dark:border-white/8 text-gray-900 dark:text-white placeholder:text-gray-300 dark:placeholder:text-white/20 text-sm rounded-xl focus:border-brand/30 focus:ring-0"
        />
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-[#0f0f0f] border border-black/[0.08] dark:border-white/6 rounded-2xl overflow-hidden">
        {/* Head */}
        <div className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_auto] gap-4 px-5 py-3 border-b border-black/[0.06] dark:border-white/5">
          {["Nama Produk", "Kategori", "Harga", "Stok", "Diskon", "Aksi"].map((h) => (
            <p key={h} className="text-[10px] font-bold text-gray-300 dark:text-white/25 uppercase tracking-wider">{h}</p>
          ))}
        </div>

        {/* Body */}
        {loading ? (
          <div className="space-y-0">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_auto] gap-4 px-5 py-4 border-b border-black/[0.04] dark:border-white/4 items-center">
                <div className="space-y-1.5">
                  <div className="h-3.5 w-48 bg-black/[0.05] dark:bg-white/5 rounded animate-pulse" />
                  <div className="h-2.5 w-12 bg-black/[0.05] dark:bg-white/5 rounded animate-pulse" />
                </div>
                <div className="h-5 w-16 bg-black/[0.05] dark:bg-white/5 rounded-lg animate-pulse" />
                <div className="h-3.5 w-24 bg-black/[0.05] dark:bg-white/5 rounded animate-pulse" />
                <div className="h-3.5 w-8 bg-black/[0.05] dark:bg-white/5 rounded animate-pulse" />
                <div className="h-5 w-10 bg-black/[0.05] dark:bg-white/5 rounded-lg animate-pulse" />
                <div className="flex gap-1.5">
                  <div className="w-8 h-8 bg-black/[0.05] dark:bg-white/5 rounded-lg animate-pulse" />
                  <div className="w-8 h-8 bg-black/[0.05] dark:bg-white/5 rounded-lg animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <Package size={28} className="text-gray-200 dark:text-white/15" />
            <p className="text-sm text-gray-300 dark:text-white/25">Tidak ada produk ditemukan</p>
          </div>
        ) : (
          filtered.map((product, i) => (
            <div
              key={product.id}
              className={cn(
                "grid grid-cols-[2fr_1fr_1fr_1fr_1fr_auto] gap-4 px-5 py-4 items-center hover:bg-black/[0.02] dark:hover:bg-white/2 transition-colors",
                i < filtered.length - 1 && "border-b border-black/[0.04] dark:border-white/4"
              )}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-lg overflow-hidden shrink-0 bg-black/[0.05] dark:bg-white/5 flex items-center justify-center">
                  {product.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                  ) : (
                    <ImageIcon size={14} className="text-gray-300 dark:text-white/20" />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-700 dark:text-white/80 leading-snug truncate">{product.name}</p>
                  <p className="text-[11px] text-gray-300 dark:text-white/25 mt-0.5">{product.unit}</p>
                </div>
              </div>
              <Badge className="bg-black/[0.06] dark:bg-white/6 text-gray-500 dark:text-white/50 border-black/10 dark:border-white/10 text-[10px] font-semibold rounded-lg w-fit border">
                {product.category}
              </Badge>
              <p className="text-sm font-semibold text-brand">
                Rp {product.price.toLocaleString("id-ID")}
              </p>
              <div className="flex items-center gap-1.5">
                <span className={cn("text-sm font-bold", product.stock <= 10 ? "text-amber-500 dark:text-amber-400" : "text-gray-500 dark:text-white/70")}>
                  {product.stock}
                </span>
                {product.stock <= 10 && <AlertCircle size={12} className="text-amber-500 dark:text-amber-400" />}
              </div>
              <div>
                {product.discount > 0 ? (
                  <Badge className="bg-red-400/10 text-red-500 dark:text-red-400 border-red-400/20 text-[10px] font-bold rounded-lg border">
                    -{product.discount}%
                  </Badge>
                ) : (
                  <span className="text-xs text-gray-200 dark:text-white/20">—</span>
                )}
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => openEdit(product)}
                  className="w-8 h-8 rounded-lg bg-black/[0.05] dark:bg-white/5 hover:bg-blue-400/10 text-gray-300 dark:text-white/30 hover:text-blue-500 dark:hover:text-blue-400 flex items-center justify-center transition-all"
                >
                  <Pencil size={13} />
                </button>
                <button
                  onClick={() => setDeleteConfirm(product.id)}
                  className="w-8 h-8 rounded-lg bg-black/[0.05] dark:bg-white/5 hover:bg-red-400/10 text-gray-300 dark:text-white/30 hover:text-red-500 dark:hover:text-red-400 flex items-center justify-center transition-all"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* ── Create / Edit Modal ── */}
      <Dialog open={showModal} onOpenChange={(o) => !saving && setShowModal(o)}>
        <DialogContent showCloseButton={false} className="bg-white dark:bg-[#0f0f0f] border border-black/[0.08] dark:border-white/8 rounded-2xl p-6 max-w-lg w-full shadow-2xl">
          <div className="flex items-center justify-between mb-6">
            <DialogTitle className="text-base font-bold text-gray-900 dark:text-white">
              {editingId ? "Edit Produk" : "Tambah Produk Baru"}
            </DialogTitle>
            <button
              onClick={() => !saving && setShowModal(false)}
              className="w-8 h-8 rounded-lg bg-black/[0.05] dark:bg-white/5 text-gray-300 dark:text-white/30 hover:text-gray-700 dark:hover:text-white flex items-center justify-center"
            >
              <X size={14} />
            </button>
          </div>

          <div className="space-y-4">
            {/* Name */}
            <div className="space-y-1.5">
              <Label className={labelCls}>Nama Produk</Label>
              <Input
                value={form.name}
                onChange={(e) => updateForm("name", e.target.value)}
                placeholder="contoh: Beras Premium 5kg"
                className={cn(inputCls, errors.name ? "border-red-400/40" : "focus:border-brand/40")}
              />
              {errors.name && <p className="text-xs text-red-400">{errors.name}</p>}
            </div>

            {/* Price + Unit */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className={labelCls}>Harga (Rp)</Label>
                <Input
                  type="number"
                  value={form.price || ""}
                  onChange={(e) => updateForm("price", Number(e.target.value))}
                  placeholder="85000"
                  className={cn(inputCls, errors.price ? "border-red-400/40" : "focus:border-brand/40")}
                />
                {errors.price && <p className="text-xs text-red-400">{errors.price}</p>}
              </div>
              <div className="space-y-1.5">
                <Label className={labelCls}>Satuan</Label>
                <Input
                  value={form.unit}
                  onChange={(e) => updateForm("unit", e.target.value)}
                  placeholder="kg / pcs / botol"
                  className={cn(inputCls, errors.unit ? "border-red-400/40" : "focus:border-brand/40")}
                />
                {errors.unit && <p className="text-xs text-red-400">{errors.unit}</p>}
              </div>
            </div>

            {/* Category + Stock */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className={labelCls}>Kategori</Label>
                <div className="relative">
                  <select
                    value={form.category_id}
                    onChange={(e) => updateForm("category_id", Number(e.target.value))}
                    className={cn(
                      "w-full h-10 bg-black/[0.04] dark:bg-white/5 border border-black/10 dark:border-white/10 text-gray-900 dark:text-white text-sm rounded-xl px-3 focus:outline-none appearance-none cursor-pointer",
                      errors.category_id ? "border-red-400/40" : "focus:border-brand/40"
                    )}
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                  <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 dark:text-white/30 pointer-events-none" />
                </div>
                {errors.category_id && <p className="text-xs text-red-400">{errors.category_id}</p>}
              </div>
              <div className="space-y-1.5">
                <Label className={labelCls}>Stok</Label>
                <Input
                  type="number"
                  value={form.stock || ""}
                  onChange={(e) => updateForm("stock", Number(e.target.value))}
                  placeholder="100"
                  className={cn(inputCls, errors.stock ? "border-red-400/40" : "focus:border-brand/40")}
                />
                {errors.stock && <p className="text-xs text-red-400">{errors.stock}</p>}
              </div>
            </div>

            {/* Discount + Image */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className={labelCls}>Diskon (%)</Label>
                <Input
                  type="number" min={0} max={100}
                  value={form.discount || ""}
                  onChange={(e) => updateForm("discount", Number(e.target.value))}
                  placeholder="0"
                  className={cn(inputCls, "focus:border-brand/40")}
                />
              </div>
              <div className="space-y-1.5">
                <Label className={labelCls}>Foto Produk</Label>
                <div className="relative">
                  {form.image ? (
                    <div className="relative w-full h-[74px] rounded-xl overflow-hidden border border-black/10 dark:border-white/10">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={form.image} alt="Preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => updateForm("image", "")}
                        className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition-colors"
                      >
                        <X size={10} />
                      </button>
                    </div>
                  ) : (
                    <label className={cn(
                      "flex flex-col items-center justify-center w-full h-[74px] rounded-xl border-2 border-dashed cursor-pointer transition-colors",
                      uploadingImage
                        ? "border-brand/30 bg-brand/5"
                        : "border-black/10 dark:border-white/10 hover:border-brand/40 bg-black/[0.02] dark:bg-white/3"
                    )}>
                      {uploadingImage ? (
                        <Loader2 size={16} className="animate-spin text-brand" />
                      ) : (
                        <>
                          <Upload size={15} className="text-gray-300 dark:text-white/30 mb-1" />
                          <span className="text-[11px] text-gray-300 dark:text-white/30">Klik untuk upload</span>
                        </>
                      )}
                      <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploadingImage} />
                    </label>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <Button
              onClick={() => !saving && setShowModal(false)}
              variant="ghost"
              className="flex-1 h-10 rounded-xl bg-black/[0.05] dark:bg-white/5 text-gray-500 dark:text-white/50 hover:bg-black/10 dark:hover:bg-white/8 hover:text-gray-700 dark:hover:text-white border border-black/[0.08] dark:border-white/8 text-sm"
            >
              Batal
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 h-10 rounded-xl bg-brand hover:bg-brand/90 text-brand-fg font-bold text-sm gap-2"
            >
              {saving ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <><Save size={13} />{editingId ? "Simpan" : "Tambahkan"}</>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Delete Confirm Modal ── */}
      <Dialog open={!!deleteConfirm} onOpenChange={(o) => !o && setDeleteConfirm(null)}>
        <DialogContent showCloseButton={false} className="bg-white dark:bg-[#0f0f0f] border border-black/[0.08] dark:border-white/8 rounded-2xl p-6 max-w-sm w-full shadow-2xl">
          <div className="flex flex-col items-center text-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/15 flex items-center justify-center">
              <Trash2 size={20} className="text-red-400" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-gray-900 dark:text-white">Hapus Produk?</DialogTitle>
              <DialogDescription className="text-xs text-gray-400 dark:text-white/40 mt-1.5">
                Produk akan dinonaktifkan dan tidak tampil di etalase.
              </DialogDescription>
            </div>
            <div className="flex gap-3 w-full mt-2">
              <Button
                onClick={() => setDeleteConfirm(null)}
                variant="ghost"
                className="flex-1 h-10 rounded-xl bg-black/[0.05] dark:bg-white/5 text-gray-500 dark:text-white/50 hover:bg-black/10 dark:hover:bg-white/8 border border-black/[0.08] dark:border-white/8 text-sm"
              >
                Batal
              </Button>
              <Button
                onClick={() => deleteConfirm && handleDelete(deleteConfirm)}
                disabled={saving}
                className="flex-1 h-10 rounded-xl bg-red-500/15 hover:bg-red-500/25 text-red-500 dark:text-red-400 border border-red-500/20 text-sm font-bold gap-2"
              >
                {saving ? <Loader2 size={13} className="animate-spin" /> : "Hapus"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
