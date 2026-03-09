"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  LogOut,
  Leaf,
  ChevronRight,
  Shield,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

const navItems = [
  {
    label: "Dashboard",
    href: "/admin/dashboard",
    icon: LayoutDashboard,
    description: "Analitik & overview",
  },
  {
    label: "Kelola Produk",
    href: "/admin/dashboard/products",
    icon: Package,
    description: "CRUD barang",
  },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    // TODO: Supabase signOut
    router.push("/admin/login");
  };

  return (
    <aside className="fixed left-0 top-0 h-full w-[260px] flex flex-col bg-[#080808] border-r border-white/5 z-30">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-6 py-6">
        <div className="w-8 h-8 rounded-lg bg-[#c8e6c9]/15 flex items-center justify-center">
          <Leaf size={15} className="text-[#c8e6c9]" />
        </div>
        <div>
          <span
            className="text-base font-bold text-white block leading-tight"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Tumbuzz
          </span>
          <span className="text-[10px] text-white/25 flex items-center gap-1">
            <Shield size={8} /> Admin Panel
          </span>
        </div>
      </div>

      <Separator className="bg-white/5 mx-4" />

      {/* Admin badge */}
      <div className="px-4 py-4">
        <div className="flex items-center gap-3 p-3 rounded-xl bg-white/4 border border-white/6">
          <div className="w-8 h-8 rounded-lg bg-[#c8e6c9]/15 flex items-center justify-center shrink-0">
            <Shield size={14} className="text-[#c8e6c9]" />
          </div>
          <div>
            <p className="text-xs font-semibold text-white/80">Super Admin</p>
            <p className="text-[10px] text-white/30">admin@tumbuzz.com</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-4 py-2 space-y-1">
        <p className="text-[10px] font-semibold text-white/20 uppercase tracking-widest px-3 mb-3">
          Menu
        </p>
        {navItems.map((item) => {
          const isActive =
            item.href === "/admin/dashboard"
              ? pathname === "/admin/dashboard"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group border",
                isActive
                  ? "bg-[#c8e6c9]/10 border-[#c8e6c9]/15"
                  : "hover:bg-white/4 border-transparent"
              )}
            >
              <div
                className={cn(
                  "w-8 h-8 rounded-lg flex items-center justify-center transition-all",
                  isActive
                    ? "bg-[#c8e6c9] text-[#1a3a1a]"
                    : "bg-white/6 text-white/40 group-hover:bg-white/10 group-hover:text-white/70"
                )}
              >
                <item.icon size={14} />
              </div>
              <div className="flex-1">
                <p className={cn("text-sm font-medium", isActive ? "text-[#c8e6c9]" : "text-white/60")}>
                  {item.label}
                </p>
                <p className="text-[11px] text-white/25">{item.description}</p>
              </div>
              {isActive && <ChevronRight size={13} className="text-[#c8e6c9]/50" />}
            </Link>
          );
        })}
      </nav>

      <Separator className="bg-white/5 mx-4" />

      {/* Logout */}
      <div className="px-4 py-5">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-red-400/60 hover:text-red-400 hover:bg-red-400/8 transition-all"
        >
          <div className="w-8 h-8 rounded-lg bg-red-500/8 flex items-center justify-center">
            <LogOut size={14} />
          </div>
          <span className="text-sm font-medium">Keluar</span>
        </button>
      </div>
    </aside>
  );
}