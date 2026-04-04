import { NavLink } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useTranslation } from "react-i18next";
import {
  LayoutDashboard, FileText, FilePlus, Users, Building2, List, X, BarChart3, Activity, ArchiveX
} from "lucide-react";
// Animation: Added framer-motion for sidebar slide-in, overlay backdrop, and staggered nav links
import { motion, AnimatePresence } from "framer-motion";

interface Props {
  open: boolean;
  onClose: () => void;
}

const linkClass = (isActive: boolean) =>
  `flex items-center gap-3 px-4 py-2.5 rounded text-sm transition-colors ${
    isActive ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium" : "text-sidebar-foreground hover:bg-sidebar-accent/50"
  }`;

// Animation: Stagger variants for nav links
const navContainerVariants = {
  hidden: { opacity: 1 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05, delayChildren: 0.1 },
  },
};

const navItemVariants = {
  hidden: { opacity: 0, x: -12 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.25, ease: "easeOut" as const } },
};

const DashboardSidebar = ({ open, onClose }: Props) => {
  const { user } = useAuth();
  const { t } = useTranslation();
  if (!user) return null;

  const userLinks = [
    { to: "/user/dashboard", label: t("sidebar.dashboard"), icon: LayoutDashboard },
    { to: "/user/file-complaint", label: t("sidebar.fileComplaint"), icon: FilePlus },
    { to: "/user/my-complaints", label: t("sidebar.myComplaints"), icon: FileText },
    { to: "/user/profile", label: t("sidebar.myProfile"), icon: Users },
  ];

  const employeeLinks = [
    { to: "/employee/dashboard", label: t("sidebar.dashboard"), icon: LayoutDashboard },
    { to: "/employee/assigned", label: t("sidebar.assignedComplaints"), icon: FileText },
    { to: "/employee/profile", label: t("sidebar.myProfile"), icon: Users },
  ];

  const adminLinks = [
    { to: "/admin/dashboard", label: t("sidebar.dashboard"), icon: LayoutDashboard },
    { to: "/admin/complaints", label: t("sidebar.allComplaints"), icon: List },
    { to: "/admin/revoked-complaints", label: t("sidebar.revokedComplaints"), icon: ArchiveX },
    { to: "/admin/departments", label: t("sidebar.departments"), icon: Building2 },
    { to: "/admin/employees", label: t("sidebar.employees"), icon: Users },
    { to: "/admin/analytics", label: t("sidebar.analytics"), icon: BarChart3 },
    { to: "/admin/activity-log", label: t("sidebar.activityLog"), icon: Activity },
  ];

  const links = user.role === "admin" ? adminLinks : user.role === "employee" ? employeeLinks : userLinks;

  return (
    <>
      {/* Animation: Backdrop overlay with fade */}
      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 bg-black/40 z-40 lg:hidden"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          />
        )}
      </AnimatePresence>

      {/* Animation: Sidebar with smooth slide-in on mobile, static on desktop */}
      <motion.aside
        className={`fixed lg:sticky top-16 left-0 z-40 h-[calc(100vh-4rem)] w-60 bg-sidebar flex flex-col ${!open ? "-translate-x-full lg:translate-x-0" : ""}`}
        animate={open ? { x: 0 } : undefined}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        <div className="flex items-center justify-between px-4 py-4 lg:hidden">
          <span className="text-sidebar-foreground font-semibold text-sm">{t("sidebar.menu")}</span>
          <motion.button onClick={onClose} whileTap={{ scale: 0.9 }}>
            <X className="h-5 w-5 text-sidebar-foreground" />
          </motion.button>
        </div>
        {/* Animation: Staggered nav link entrance */}
        <motion.nav
          className="flex-1 px-3 py-2 space-y-1"
          variants={navContainerVariants}
          initial="hidden"
          animate="visible"
          key={user.role}
        >
          {links.map((l) => (
            <motion.div key={l.to} variants={navItemVariants}>
              <NavLink to={l.to} end className={({ isActive }) => linkClass(isActive)} onClick={onClose}>
                <l.icon className="h-4 w-4" />
                {l.label}
              </NavLink>
            </motion.div>
          ))}
        </motion.nav>
      </motion.aside>
    </>
  );
};

export default DashboardSidebar;
