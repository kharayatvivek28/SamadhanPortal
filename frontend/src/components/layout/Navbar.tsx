import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useTranslation } from "react-i18next";
import { LogOut, Menu, X } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ThemeToggle from "@/components/ui/theme-toggle";
import NotificationBell from "@/components/layout/NotificationBell";
import LanguageSwitcher from "@/components/layout/LanguageSwitcher";

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const getDashboardLink = () => {
    if (!user) return "/";
    return `/${user.role}/dashboard`;
  };

  const getProfileLink = () => {
    if (!user) return "/";
    if (user.role === "admin") return `/${user.role}/dashboard`;
    return `/${user.role}/profile`;
  };

  return (
    <nav className="bg-primary text-primary-foreground shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2 font-bold text-lg">
            <img src="/logo.png" alt="Samadhan" className="h-12 w-auto" />
            <span className="hidden sm:inline">Samadhan Portal</span>
            <span className="sm:hidden">Samadhan</span>
          </Link>

          {/* Desktop */}
          <div className="hidden md:flex items-center gap-6">
            <Link to="/" className="hover:text-hero-muted transition-colors text-sm font-medium">{t("nav.home")}</Link>
            {isAuthenticated && (
              <Link to={getDashboardLink()} className="hover:text-hero-muted transition-colors text-sm font-medium">{t("nav.dashboard")}</Link>
            )}
            <LanguageSwitcher />
            <ThemeToggle />
            <NotificationBell />
            {isAuthenticated ? (
              <div className="flex items-center gap-4">
                <Link to={getProfileLink()} className="text-sm text-primary-foreground/80 hover:text-primary-foreground transition-colors" title={t("nav.myProfile")}>
                  {user?.name} ({user?.role})
                </Link>
                <motion.button
                  onClick={handleLogout}
                  className="flex items-center gap-1 text-sm hover:text-hero-muted transition-colors"
                  whileTap={{ scale: 0.95 }}
                >
                  <LogOut className="h-4 w-4" /> {t("nav.logout")}
                </motion.button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link to="/login" className="text-sm hover:text-hero-muted transition-colors">{t("nav.login")}</Link>
                <Link to="/signup" className="bg-primary-foreground text-primary px-4 py-1.5 rounded text-sm font-medium hover:opacity-90 transition-opacity">{t("nav.signup")}</Link>
              </div>
            )}
          </div>

          {/* Mobile toggle */}
          <div className="flex items-center gap-2 md:hidden">
            <LanguageSwitcher />
            <ThemeToggle />
            <NotificationBell />
            <motion.button
              onClick={() => setMobileOpen(!mobileOpen)}
              whileTap={{ scale: 0.9 }}
            >
              {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </motion.button>
          </div>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              className="md:hidden pb-4 space-y-2 overflow-hidden"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
            >
              <Link to="/" className="block py-2 text-sm hover:text-hero-muted" onClick={() => setMobileOpen(false)}>{t("nav.home")}</Link>
              {isAuthenticated && (
                <Link to={getDashboardLink()} className="block py-2 text-sm hover:text-primary-foreground/80" onClick={() => setMobileOpen(false)}>{t("nav.dashboard")}</Link>
              )}
              {isAuthenticated ? (
                <>
                  <Link to={getProfileLink()} className="block py-2 text-sm hover:text-primary-foreground/80" onClick={() => setMobileOpen(false)}>{t("nav.myProfile")}</Link>
                  <button onClick={() => { handleLogout(); setMobileOpen(false); }} className="block py-2 text-sm hover:text-primary-foreground/80 text-left w-full">{t("nav.logout")}</button>
                </>
              ) : (
                <>
                  <Link to="/login" className="block py-2 text-sm hover:text-hero-muted" onClick={() => setMobileOpen(false)}>{t("nav.login")}</Link>
                  <Link to="/signup" className="block py-2 text-sm hover:text-hero-muted" onClick={() => setMobileOpen(false)}>{t("nav.signup")}</Link>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
};

export default Navbar;
