"use client";

import { useState } from "react";
import { Sidebar } from "@/components/user/sidebar";
import { LoginModal } from "@/components/user/login-modal";

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [showLogin, setShowLogin] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // TODO: Replace with actual Supabase auth state
  const user = null;

  const handleGoogleLogin = async () => {
    // TODO: Implement Supabase Google OAuth
    // const supabase = createClient()
    // await supabase.auth.signInWithOAuth({ provider: 'google' })
    setShowLogin(false);
  };

  const handleLogout = async () => {
    // TODO: Implement logout
    // const supabase = createClient()
    // await supabase.auth.signOut()
  };

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed((v) => !v)}
        user={user}
        onLoginClick={() => setShowLogin(true)}
        onLogoutClick={handleLogout}
      />

      {/* Main Content */}
      <main
        className="flex-1 transition-[margin-left] duration-300 ease-in-out"
        style={{ marginLeft: sidebarCollapsed ? "64px" : "260px" }}
      >
        {children}
      </main>

      {/* Login Modal */}
      <LoginModal
        open={showLogin}
        onClose={() => setShowLogin(false)}
        onGoogleLogin={handleGoogleLogin}
      />
    </div>
  );
}