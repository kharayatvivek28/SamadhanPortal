import { useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Lock, Eye, EyeOff } from "lucide-react";

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch(`/api/auth/reset-password/${token}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to reset password");
      }

      setSuccess(true);
      toast.success("Password reset successfully. You can now login.");
      setTimeout(() => navigate("/login"), 3000);
    } catch (err: any) {
      setError(err.message || "Invalid or expired token");
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full border rounded-md px-3 py-2 text-sm bg-background text-foreground focus:ring-2 focus:ring-ring focus:outline-none pl-9";
  const btnClass = "w-full bg-primary text-primary-foreground py-2.5 rounded-md text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50";

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <div className="flex-1 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-sm bg-card border rounded-lg shadow-sm p-6"
        >
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-foreground">New Password</h2>
            <p className="text-muted-foreground text-sm mt-1">Create a new password for your account</p>
          </div>

          {success ? (
            <div className="text-center py-4">
              <div className="bg-green-100 text-green-700 p-3 rounded-md mb-4 text-sm font-medium">
                Password updated successfully!
              </div>
              <p className="text-sm text-muted-foreground">Redirecting to login...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">
                  {error}
                </div>
              )}

              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="New password"
                  className={inputClass}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>

              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Confirm new password"
                  className={inputClass}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>

              <button type="submit" className={btnClass} disabled={loading}>
                {loading ? "Resetting..." : "Reset Password"}
              </button>

              <div className="text-center pt-2">
                <Link to="/login" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Cancel
                </Link>
              </div>
            </form>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default ResetPassword;
