"use client";

import { usePathname } from "next/navigation";
import { AdminSidebar } from "@/components/admin/admin-sidebar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/admin/login";

  if (isLoginPage) {
    return <div className="min-h-screen bg-gray-50 dark:bg-[#080808]">{children}</div>;
  }

  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-[#080808]">
      <AdminSidebar />
      <main className="flex-1 ml-[260px] overflow-auto">
        {children}
      </main>
    </div>
  );
}
