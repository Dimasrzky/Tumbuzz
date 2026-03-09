"use client";

import { useState } from "react";
import Image from "next/image";
import { Plus, Minus, ShoppingCart, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface Product {
  id: string;
  name: string;
  price: number;
  unit: string;
  image: string;
  category: string;
  rating: number;
  stock: number;
  discount?: number;
  badge?: string;
}

interface ProductCardProps {
  product: Product;
  quantity: number;
  onAdd: (product: Product) => void;
  onRemove: (productId: string) => void;
}

export function ProductCard({ product, quantity, onAdd, onRemove }: ProductCardProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [imgSrc, setImgSrc] = useState(product.image);

  const discountedPrice = product.discount
    ? product.price - (product.price * product.discount) / 100
    : product.price;

  const handleAdd = () => {
    setIsAdding(true);
    onAdd(product);
    setTimeout(() => setIsAdding(false), 300);
  };

  return (
    <div
      className={cn(
        "group relative bg-card border border-border rounded-2xl overflow-hidden",
        "hover:border-brand/20 hover:shadow-xl hover:shadow-black/20",
        "transition-all duration-300 cursor-pointer"
      )}
    >
      {/* Badges */}
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5">
        {product.badge && (
          <Badge className="bg-brand text-brand-fg text-[10px] font-bold px-2 py-0.5 rounded-md border-0">
            {product.badge}
          </Badge>
        )}
        {product.discount && (
          <Badge className="bg-red-500/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-md border-0">
            -{product.discount}%
          </Badge>
        )}
      </div>

      {/* Image Container */}
      <div className="relative h-44 bg-muted overflow-hidden">
        <Image
          src={imgSrc}
          alt={product.name}
          fill
          sizes="(max-width: 768px) 50vw, 25vw"
          className="object-cover group-hover:scale-105 transition-transform duration-500"
          onError={() =>
            setImgSrc(`https://placehold.co/400x300/1e1e1e/666.png?text=${encodeURIComponent(product.name)}`)
          }
        />
        <div className="absolute inset-0 bg-gradient-to-t from-card/60 to-transparent" />
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Category & Rating */}
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-semibold text-foreground/30 uppercase tracking-wider">
            {product.category}
          </span>
          <div className="flex items-center gap-1">
            <Star size={10} className="text-amber-400 fill-amber-400" />
            <span className="text-[10px] text-foreground/40">{product.rating}</span>
          </div>
        </div>

        {/* Name */}
        <h3 className="text-sm font-semibold text-foreground/90 mb-3 leading-snug line-clamp-2 group-hover:text-foreground transition-colors">
          {product.name}
        </h3>

        {/* Price */}
        <div className="flex items-end gap-2 mb-4">
          <div>
            <p className="text-base font-bold text-brand">
              Rp {discountedPrice.toLocaleString("id-ID")}
            </p>
            <p className="text-[11px] text-foreground/30">/{product.unit}</p>
          </div>
          {product.discount && (
            <p className="text-xs text-foreground/25 line-through mb-0.5">
              Rp {product.price.toLocaleString("id-ID")}
            </p>
          )}
        </div>

        {/* Add to Cart */}
        {quantity === 0 ? (
          <Button
            onClick={handleAdd}
            className={cn(
              "w-full h-9 rounded-xl text-xs font-semibold gap-2 transition-all duration-200",
              "bg-foreground/[0.06] hover:bg-brand/15 text-foreground/60 hover:text-brand",
              "border border-border hover:border-brand/30",
              isAdding && "scale-95"
            )}
          >
            <ShoppingCart size={13} />
            Tambah
          </Button>
        ) : (
          <div className="flex items-center justify-between bg-brand/10 border border-brand/20 rounded-xl h-9 px-1">
            <button
              onClick={() => onRemove(product.id)}
              className="w-7 h-7 rounded-lg bg-foreground/[0.06] hover:bg-foreground/10 text-foreground/60 hover:text-foreground flex items-center justify-center transition-all"
            >
              <Minus size={12} />
            </button>
            <span className="text-sm font-bold text-brand">{quantity}</span>
            <button
              onClick={handleAdd}
              className="w-7 h-7 rounded-lg bg-brand/20 hover:bg-brand/30 text-brand flex items-center justify-center transition-all"
            >
              <Plus size={12} />
            </button>
          </div>
        )}
      </div>

      {/* Stock indicator */}
      {product.stock <= 10 && (
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-500/50 rounded-full" />
      )}
    </div>
  );
}
