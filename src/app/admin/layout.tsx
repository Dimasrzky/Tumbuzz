import { AdminSidebar } from "@/components/admin/admin-sidebar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-[#080808]">
      <AdminSidebar />
      <main className="flex-1 ml-[260px] overflow-auto">
        {children}
      </main>
    </div>
  );
}