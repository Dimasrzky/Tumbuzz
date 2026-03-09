"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ShoppingBag,
  History,
  LogIn,
  LogOut,
  X,
  Menu,
  Leaf,
  User,
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  user?: {
    name: string;
    email: string;
    avatar?: string;
  } | null;
  onLoginClick: () => void;
  onLogoutClick: () => void;
}

const navItems = [
  { label: "Etalase", href: "/", icon: ShoppingBag, description: "Belanja kebutuhan" },
  { label: "Riwayat", href: "/history", icon: History, description: "Histori pembelian" },
];

export function Sidebar({ collapsed, onToggle, user, onLoginClick, onLogoutClick }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();

  useEffect(() => setMounted(true), []);

  return (
    <>
      {/* Mobile Toggle */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed top-4 left-4 z-40 md:hidden flex items-center justify-center w-10 h-10 rounded-xl bg-card border border-border text-foreground/50 shadow-xl"
      >
        <Menu size={18} />
      </button>

      {/* Mobile Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm md:hidden" onClick={() => setIsOpen(false)} />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 h-full z-50 flex flex-col",
          "bg-card border-r border-border",
          "transition-[width] duration-300 ease-in-out",
          "md:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
          collapsed ? "w-[64px]" : "w-[260px]"
        )}
      >
        {/* Top accent line */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-brand/25 to-transparent" />

        {/* Brand */}
        <div
          className={cn(
            "flex items-center pt-6 pb-5 transition-all duration-300",
            collapsed ? "px-0 justify-center" : "px-5 justify-between"
          )}
        >
          {/* Logo — desktop: click to collapse */}
          <button
            onClick={onToggle}
            className={cn(
              "group/brand flex items-center gap-3 rounded-xl transition-all duration-200",
              "hidden md:flex",
              collapsed ? "justify-center p-1.5 hover:bg-foreground/[0.05]" : "hover:opacity-80"
            )}
          >
            <div className="relative w-9 h-9 shrink-0">
              <div className="w-full h-full rounded-xl bg-gradient-to-br from-brand to-[#66bb6a] flex items-center justify-center shadow-lg shadow-brand/15">
                <Leaf size={17} className="text-brand-fg transition-opacity duration-150 group-hover/brand:opacity-0" />
                <span className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/brand:opacity-100 transition-opacity duration-150">
                  {collapsed ? <ChevronRight size={14} className="text-brand-fg" /> : <ChevronLeft size={14} className="text-brand-fg" />}
                </span>
              </div>
            </div>
            {!collapsed && (
              <div className="leading-tight overflow-hidden text-left">
                <span className="block text-[18px] font-bold text-foreground tracking-tight whitespace-nowrap" style={{ fontFamily: "var(--font-playfair), serif" }}>
                  Tumbuzz
                </span>
                <span className="block text-[9.5px] font-semibold text-brand/50 tracking-[0.18em] uppercase">
                  Grocery Store
                </span>
              </div>
            )}
          </button>

          {/* Logo — mobile: static */}
          <div className={cn("md:hidden flex items-center gap-3", collapsed && "justify-center")}>
            <div className="w-9 h-9 shrink-0 rounded-xl bg-gradient-to-br from-brand to-[#66bb6a] flex items-center justify-center shadow-lg shadow-brand/15">
              <Leaf size={17} className="text-brand-fg" />
            </div>
            {!collapsed && (
              <div className="leading-tight overflow-hidden">
                <span className="block text-[18px] font-bold text-foreground tracking-tight whitespace-nowrap" style={{ fontFamily: "var(--font-playfair), serif" }}>
                  Tumbuzz
                </span>
                <span className="block text-[9.5px] font-semibold text-brand/50 tracking-[0.18em] uppercase">
                  Grocery Store
                </span>
              </div>
            )}
          </div>

          {/* Mobile close */}
          {!collapsed && (
            <button onClick={() => setIsOpen(false)} className="md:hidden w-7 h-7 rounded-lg bg-foreground/5 flex items-center justify-center text-foreground/35 hover:text-foreground hover:bg-foreground/10 transition-all">
              <X size={14} />
            </button>
          )}
        </div>

        {/* Divider */}
        <div className="mx-4 h-px bg-border mb-4" />

        {/* User Card */}
        <div className={cn("mb-5 transition-all duration-300", collapsed ? "px-2" : "px-4")}>
          {user ? (
            <div className={cn("flex items-center gap-3 rounded-xl bg-foreground/[0.04] border border-border transition-all", collapsed ? "p-2 justify-center" : "px-3 py-2.5")}>
              <Avatar className="w-9 h-9 shrink-0 border border-brand/20">
                <AvatarImage src={user.avatar} />
                <AvatarFallback className="bg-[#2d6a2d]/80 text-white text-xs font-semibold">
                  {user.name?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              {!collapsed && (
                <>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground/90 truncate leading-tight">{user.name}</p>
                    <p className="text-[11px] text-foreground/40 truncate">{user.email}</p>
                  </div>
                  <div className="w-1.5 h-1.5 rounded-full bg-[#81c784] shrink-0" />
                </>
              )}
            </div>
          ) : (
            <div className={cn("flex items-center gap-3 rounded-xl bg-foreground/[0.03] border border-border transition-all", collapsed ? "p-2 justify-center" : "px-3 py-2.5")}>
              <div className="w-8 h-8 rounded-lg bg-foreground/[0.05] flex items-center justify-center shrink-0">
                <User size={14} className="text-foreground/25" />
              </div>
              {!collapsed && (
                <div>
                  <p className="text-xs font-medium text-foreground/40 leading-tight">Tamu</p>
                  <p className="text-[10.5px] text-foreground/25">Belum masuk</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Nav label */}
        {!collapsed && (
          <p className="px-6 mb-2 text-[9.5px] font-semibold text-foreground/25 uppercase tracking-[0.2em]">Menu</p>
        )}

        {/* Navigation */}
        <nav className={cn("flex-1 space-y-0.5 transition-all duration-300", collapsed ? "px-2" : "px-3")}>
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <div key={item.href} className="relative group/nav">
                <Link
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    "relative flex items-center gap-3 rounded-xl transition-all duration-200",
                    collapsed ? "justify-center p-2.5" : "px-3 py-2.5",
                    isActive
                      ? "bg-brand/[0.10] text-brand"
                      : "text-foreground/45 hover:text-foreground/75 hover:bg-foreground/[0.04]"
                  )}
                >
                  {isActive && !collapsed && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-brand rounded-r-full" />
                  )}
                  {isActive && collapsed && (
                    <span className="absolute -right-0.5 top-1/2 -translate-y-1/2 w-1 h-4 bg-brand rounded-l-full" />
                  )}
                  <div
                    className={cn(
                      "flex items-center justify-center shrink-0 rounded-lg transition-all",
                      collapsed ? "w-9 h-9" : "w-8 h-8",
                      isActive
                        ? "bg-brand/15 text-brand"
                        : "bg-foreground/[0.05] text-foreground/35 group-hover/nav:bg-foreground/[0.08] group-hover/nav:text-foreground/60"
                    )}
                  >
                    <item.icon size={15} />
                  </div>
                  {!collapsed && (
                    <div>
                      <p className={cn("text-sm font-medium leading-tight", isActive ? "text-brand" : "")}>{item.label}</p>
                      <p className={cn("text-[11px] mt-0.5", isActive ? "text-brand/40" : "text-foreground/25")}>{item.description}</p>
                    </div>
                  )}
                </Link>

                {collapsed && (
                  <div className="pointer-events-none absolute left-full top-1/2 -translate-y-1/2 ml-3 z-50 opacity-0 group-hover/nav:opacity-100 transition-opacity duration-150">
                    <div className="bg-popover border border-border text-popover-foreground text-xs font-medium px-2.5 py-1.5 rounded-lg shadow-xl whitespace-nowrap">
                      {item.label}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Bottom */}
        <div className={cn("pb-6 pt-3 space-y-2", collapsed ? "px-2" : "px-4")}>
          <div className="h-px bg-border" />

          {/* Theme Toggle */}
          <div className="relative group/theme">
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className={cn(
                "w-full flex items-center rounded-xl h-10 text-foreground/40 hover:text-foreground/70 hover:bg-foreground/[0.04] transition-all duration-200",
                collapsed ? "justify-center px-0" : "gap-2.5 px-3"
              )}
            >
              {mounted && (theme === "dark" ? <Sun size={14} /> : <Moon size={14} />)}
              {!collapsed && (
                <span className="text-sm">{mounted ? (theme === "dark" ? "Mode Terang" : "Mode Gelap") : "Tema"}</span>
              )}
            </button>
            {collapsed && (
              <div className="pointer-events-none absolute left-full top-1/2 -translate-y-1/2 ml-3 z-50 opacity-0 group-hover/theme:opacity-100 transition-opacity duration-150">
                <div className="bg-popover border border-border text-popover-foreground text-xs font-medium px-2.5 py-1.5 rounded-lg shadow-xl whitespace-nowrap">
                  {mounted ? (theme === "dark" ? "Mode Terang" : "Mode Gelap") : "Tema"}
                </div>
              </div>
            )}
          </div>

          {/* Login / Logout */}
          {user ? (
            <div className="relative group/logout">
              <Button
                onClick={onLogoutClick}
                variant="ghost"
                className={cn(
                  "w-full text-red-500/60 hover:text-red-500 hover:bg-red-500/8 rounded-xl h-10 transition-all",
                  collapsed ? "justify-center px-0" : "justify-start gap-2.5 px-3 text-sm"
                )}
              >
                <LogOut size={14} />
                {!collapsed && "Keluar"}
              </Button>
              {collapsed && (
                <div className="pointer-events-none absolute left-full top-1/2 -translate-y-1/2 ml-3 z-50 opacity-0 group-hover/logout:opacity-100 transition-opacity duration-150">
                  <div className="bg-popover border border-border text-popover-foreground text-xs font-medium px-2.5 py-1.5 rounded-lg shadow-xl whitespace-nowrap">Keluar</div>
                </div>
              )}
            </div>
          ) : (
            <div className="relative group/login">
              <Button
                onClick={onLoginClick}
                className={cn(
                  "w-full bg-brand hover:bg-brand/80 text-brand-fg rounded-xl h-10 font-semibold text-sm transition-all duration-200 shadow-md shadow-brand/10",
                  collapsed ? "justify-center px-0 gap-0" : "gap-2"
                )}
              >
                <LogIn size={14} />
                {!collapsed && "Masuk dengan Google"}
              </Button>
              {collapsed && (
                <div className="pointer-events-none absolute left-full top-1/2 -translate-y-1/2 ml-3 z-50 opacity-0 group-hover/login:opacity-100 transition-opacity duration-150">
                  <div className="bg-popover border border-border text-popover-foreground text-xs font-medium px-2.5 py-1.5 rounded-lg shadow-xl whitespace-nowrap">Masuk dengan Google</div>
                </div>
              )}
            </div>
          )}

          {!collapsed && (
            <p className="text-[10px] text-foreground/20 text-center tracking-wide">v0.1.0 · Beta</p>
          )}
        </div>
      </aside>
    </>
  );
}
