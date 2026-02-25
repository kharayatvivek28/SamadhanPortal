import { NavLink } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import {
  LayoutDashboard, FileText, FilePlus, Users, Building2, List, X,
} from "lucide-react";

interface Props {
  open: boolean;
  onClose: () => void;
}

const linkClass = (isActive: boolean) =>
  `flex items-center gap-3 px-4 py-2.5 rounded text-sm transition-colors ${
    isActive ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium" : "text-sidebar-foreground hover:bg-sidebar-accent/50"
  }`;

const DashboardSidebar = ({ open, onClose }: Props) => {
  const { user } = useAuth();
  if (!user) return null;

  const userLinks = [
    { to: "/user/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { to: "/user/file-complaint", label: "File Complaint", icon: FilePlus },
    { to: "/user/my-complaints", label: "My Complaints", icon: FileText },
  ];

  const employeeLinks = [
    { to: "/employee/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { to: "/employee/assigned", label: "Assigned Complaints", icon: FileText },
  ];

  const adminLinks = [
    { to: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { to: "/admin/complaints", label: "All Complaints", icon: List },
    { to: "/admin/departments", label: "Departments", icon: Building2 },
    { to: "/admin/employees", label: "Employees", icon: Users },
  ];

  const links = user.role === "admin" ? adminLinks : user.role === "employee" ? employeeLinks : userLinks;

  return (
    <>
      {/* Overlay on mobile */}
      {open && <div className="fixed inset-0 bg-black/40 z-40 lg:hidden" onClick={onClose} />}

      <aside className={`fixed lg:sticky top-16 left-0 z-40 h-[calc(100vh-4rem)] w-60 bg-sidebar flex flex-col transition-transform duration-200 ${open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}>
        <div className="flex items-center justify-between px-4 py-4 lg:hidden">
          <span className="text-sidebar-foreground font-semibold text-sm">Menu</span>
          <button onClick={onClose}><X className="h-5 w-5 text-sidebar-foreground" /></button>
        </div>
        <nav className="flex-1 px-3 py-2 space-y-1">
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} end className={({ isActive }) => linkClass(isActive)} onClick={onClose}>
              <l.icon className="h-4 w-4" />
              {l.label}
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  );
};

export default DashboardSidebar;
