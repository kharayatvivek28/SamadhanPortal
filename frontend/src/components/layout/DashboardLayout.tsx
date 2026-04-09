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
        <div className="lg:hidden sticky top-16 z-30 bg-background/95 backdrop-blur aspect-auto py-2 -mx-4 px-4 md:-mx-6 md:px-6 mb-4 border-b border-border">
          <button
            className="flex items-center gap-2 text-sm font-medium bg-muted hover:bg-muted/80 text-foreground px-3 py-2 rounded-md transition-colors relative z-50"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-4 w-4 pointer-events-none" /> Menu
          </button>
        </div>
        <Outlet />
      </main>
    </div>
  );
};

export default DashboardLayout;
