import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { LogOut, Menu, X } from "lucide-react";
import { useState } from "react";

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
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

  return (
    <nav className="bg-primary text-primary-foreground shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2 font-bold text-lg">
            <img src="/logo.png" alt="Samadhan" className="h-8 w-8" />
            <span className="hidden sm:inline">Samadhan Portal</span>
            <span className="sm:hidden">Samadhan</span>
          </Link>

          {/* Desktop */}
          <div className="hidden md:flex items-center gap-6">
            <Link to="/" className="hover:text-hero-muted transition-colors text-sm font-medium">Home</Link>
            {isAuthenticated && (
              <Link to={getDashboardLink()} className="hover:text-hero-muted transition-colors text-sm font-medium">Dashboard</Link>
            )}
            {isAuthenticated ? (
              <div className="flex items-center gap-4">
                <span className="text-sm text-hero-muted">{user?.name} ({user?.role})</span>
                <button onClick={handleLogout} className="flex items-center gap-1 text-sm hover:text-hero-muted transition-colors">
                  <LogOut className="h-4 w-4" /> Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link to="/login" className="text-sm hover:text-hero-muted transition-colors">Login</Link>
                <Link to="/signup" className="bg-primary-foreground text-primary px-4 py-1.5 rounded text-sm font-medium hover:opacity-90 transition-opacity">Sign Up</Link>
              </div>
            )}
          </div>

          {/* Mobile toggle */}
          <button className="md:hidden" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden pb-4 space-y-2">
            <Link to="/" className="block py-2 text-sm hover:text-hero-muted" onClick={() => setMobileOpen(false)}>Home</Link>
            {isAuthenticated && (
              <Link to={getDashboardLink()} className="block py-2 text-sm hover:text-hero-muted" onClick={() => setMobileOpen(false)}>Dashboard</Link>
            )}
            {isAuthenticated ? (
              <button onClick={() => { handleLogout(); setMobileOpen(false); }} className="block py-2 text-sm hover:text-hero-muted">Logout</button>
            ) : (
              <>
                <Link to="/login" className="block py-2 text-sm hover:text-hero-muted" onClick={() => setMobileOpen(false)}>Login</Link>
                <Link to="/signup" className="block py-2 text-sm hover:text-hero-muted" onClick={() => setMobileOpen(false)}>Sign Up</Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
