import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import DashboardSidebar from "./DashboardSidebar";

const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const handleToggle = () => setSidebarOpen(true);
    window.addEventListener("toggle-mobile-sidebar", handleToggle);
    return () => window.removeEventListener("toggle-mobile-sidebar", handleToggle);
  }, []);

  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      <DashboardSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-auto min-w-0">
        <Outlet />
      </main>
    </div>
  );
};

export default DashboardLayout;
