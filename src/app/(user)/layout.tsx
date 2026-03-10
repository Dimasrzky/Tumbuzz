"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { Sidebar } from "@/components/user/sidebar";
import { LoginModal } from "@/components/user/login-modal";
import { useAuth } from "@/components/providers";

// Komponen terpisah agar useSearchParams bisa di-wrap Suspense
function LoginRequiredWatcher({ onOpen }: { onOpen: () => void }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (searchParams.get("login") === "required") {
      onOpen();
      router.replace(pathname, { scroll: false });
    }
  }, [searchParams, router, pathname, onOpen]);

  return null;
}

export default function UserLayout({ children }: { children: React.ReactNode }) {
  const { user, login, logout } = useAuth();
  const [showLogin, setShowLogin] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const sidebarUser = user
    ? {
        name: user.user_metadata?.full_name ?? user.email ?? "Pengguna",
        email: user.email ?? "",
        avatar: user.user_metadata?.avatar_url,
      }
    : null;

  const handleGoogleLogin = async () => {
    await login();
    setShowLogin(false);
  };

  return (
    <div className="flex min-h-screen bg-background">
      {/* Pantau ?login=required tanpa blocking render */}
      <Suspense>
        <LoginRequiredWatcher onOpen={() => setShowLogin(true)} />
      </Suspense>

      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed((v) => !v)}
        user={sidebarUser}
        onLoginClick={() => setShowLogin(true)}
        onLogoutClick={logout}
      />

      <main
        className="flex-1 transition-[margin-left] duration-300 ease-in-out"
        style={{ marginLeft: sidebarCollapsed ? "64px" : "260px" }}
      >
        {children}
      </main>

      <LoginModal
        open={showLogin}
        onClose={() => setShowLogin(false)}
        onGoogleLogin={handleGoogleLogin}
      />
    </div>
  );
}
