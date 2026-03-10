"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { useTheme } from "next-themes";
import {
  LayoutDashboard,
  Package,
  LogOut,
  Leaf,
  ChevronRight,
  Shield,
  Sun,
  Moon,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

const navItems = [
  {
    label: "Dashboard",
    href: "/admin/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Kelola Produk",
    href: "/admin/product",
    icon: Package,
  },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogout = () => {
    // TODO: Supabase signOut
    router.push("/admin/login");
  };

  return (
    <>
    <aside className="fixed left-0 top-0 h-full w-[260px] flex flex-col bg-gray-50 dark:bg-[#080808] border-r border-black/[0.08] dark:border-white/5 z-30">
      {/* Logo */}
      <div className="flex items-center justify-between px-6 py-6">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-brand/15 flex items-center justify-center">
            <Leaf size={15} className="text-brand" />
          </div>
          <div>
            <span
              className="text-base font-bold text-gray-900 dark:text-white block leading-tight"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Tumbuzz
            </span>
            <span className="text-[10px] text-gray-400 dark:text-white/25 flex items-center gap-1">
              <Shield size={8} /> Admin Panel
            </span>
          </div>
        </div>
        {/* Theme Toggle */}
        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="w-7 h-7 rounded-lg bg-black/[0.06] dark:bg-white/6 text-gray-400 dark:text-white/40 hover:text-gray-700 dark:hover:text-white/70 flex items-center justify-center transition-all"
        >
          {theme === "dark" ? <Sun size={13} /> : <Moon size={13} />}
        </button>
      </div>

      <Separator className="bg-black/[0.06] dark:bg-white/5 mx-4" />

      {/* Admin badge */}
      <div className="px-4 py-4">
        <div className="flex items-center gap-3 p-3 rounded-xl bg-black/[0.04] dark:bg-white/4 border border-black/[0.06] dark:border-white/6">
          <div className="w-8 h-8 rounded-lg bg-brand/15 flex items-center justify-center shrink-0">
            <Shield size={14} className="text-brand" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-700 dark:text-white/80">Super Admin</p>
            <p className="text-[10px] text-gray-400 dark:text-white/30">admin@tumbuzz.com</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-4 py-2 space-y-1">
        <p className="text-[10px] font-semibold text-gray-300 dark:text-white/20 uppercase tracking-widest px-3 mb-3">
          Menu
        </p>
        {navItems.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group border",
                isActive
                  ? "bg-brand/10 border-brand/15"
                  : "hover:bg-black/[0.04] dark:hover:bg-white/4 border-transparent"
              )}
            >
              <div
                className={cn(
                  "w-8 h-8 rounded-lg flex items-center justify-center transition-all",
                  isActive
                    ? "bg-brand text-brand-fg"
                    : "bg-black/[0.06] dark:bg-white/6 text-gray-400 dark:text-white/40 group-hover:bg-black/10 dark:group-hover:bg-white/10 group-hover:text-gray-600 dark:group-hover:text-white/70"
                )}
              >
                <item.icon size={14} />
              </div>
              <div className="flex-1">
                <p className={cn("text-sm font-medium", isActive ? "text-brand" : "text-gray-500 dark:text-white/60")}>
                  {item.label}
                </p>
              </div>
              {isActive && <ChevronRight size={13} className="text-brand/50" />}
            </Link>
          );
        })}
      </nav>

      <Separator className="bg-black/[0.06] dark:bg-white/5 mx-4" />

      {/* Logout */}
      <div className="px-4 py-5">
        <button
          onClick={() => setShowLogoutModal(true)}
          className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-red-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-500/8 transition-all"
        >
          <div className="w-8 h-8 rounded-lg bg-red-500/8 flex items-center justify-center">
            <LogOut size={14} />
          </div>
          <span className="text-sm font-medium">Keluar</span>
        </button>
      </div>
    </aside>

    {/* Logout Confirm Modal */}
    {showLogoutModal && (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div
          className="absolute inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm"
          onClick={() => setShowLogoutModal(false)}
        />
        <div className="relative bg-white dark:bg-[#0f0f0f] border border-black/[0.08] dark:border-white/8 rounded-2xl p-6 w-[320px] shadow-2xl flex flex-col items-center text-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/15 flex items-center justify-center">
            <LogOut size={20} className="text-red-400" />
          </div>
          <div>
            <h3 className="text-base font-bold text-gray-900 dark:text-white">Yakin ingin keluar?</h3>
            <p className="text-xs text-gray-400 dark:text-white/40 mt-1.5">
              Kamu akan keluar dari sesi admin saat ini.
            </p>
          </div>
          <div className="flex gap-3 w-full mt-1">
            <button
              onClick={() => setShowLogoutModal(false)}
              className="flex-1 h-10 rounded-xl bg-black/[0.05] dark:bg-white/5 border border-black/[0.08] dark:border-white/8 text-gray-500 dark:text-white/50 hover:bg-black/10 dark:hover:bg-white/8 hover:text-gray-700 dark:hover:text-white text-sm font-medium transition-all"
            >
              Batal
            </button>
            <button
              onClick={handleLogout}
              className="flex-1 h-10 rounded-xl bg-red-500/15 hover:bg-red-500/25 border border-red-500/20 text-red-500 dark:text-red-400 text-sm font-bold transition-all"
            >
              Keluar
            </button>
          </div>
        </div>
      </div>
    )}
    </>
  );
}
