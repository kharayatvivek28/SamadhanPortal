import { useState } from "react";
import { Outlet } from "react-router-dom";
import DashboardSidebar from "./DashboardSidebar";
import { Menu } from "lucide-react";

const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      <DashboardSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-auto min-w-0">
        <button
          className="lg:hidden mb-4 flex items-center gap-2 text-sm font-medium bg-muted hover:bg-muted/80 text-foreground px-3 py-2 rounded-md transition-colors"
          onClick={() => setSidebarOpen(true)}
        >
          <Menu className="h-4 w-4" /> Menu
        </button>
        <Outlet />
      </main>
    </div>
  );
};

export default DashboardLayout;
