import { useState } from "react";
import { Link } from "react-router-dom";
import { apiFetch } from "@/lib/api";
import Navbar from "@/components/layout/Navbar";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Mail, CheckCircle2 } from "lucide-react";

const ForgotPassword = () => {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    setError("");

    try {
      const res = await apiFetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Something went wrong");
      }

      setSuccess(true);
      toast.success("Password reset link sent to your email");
    } catch (err: any) {
      setError(err.message || "Failed to send reset email");
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
            <h2 className="text-2xl font-bold text-foreground">{t("forgotPassword.title")}</h2>
            <p className="text-muted-foreground text-sm mt-1">{t("forgotPassword.subtitle")}</p>
          </div>

          {success ? (
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-center py-4"
            >
              <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-3" />
              <p className="text-foreground font-medium mb-1">{t("forgotPassword.checkInbox")}</p>
              <p className="text-muted-foreground text-sm mb-6">
                {t("forgotPassword.sentTo")} <span className="font-semibold text-foreground">{email}</span>.
              </p>
              <Link to="/login" className={btnClass + " block"}>
                {t("forgotPassword.returnToLogin")}
              </Link>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">
                  {error}
                </div>
              )}

              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <input
                  type="email"
                  placeholder="name@example.com"
                  className={inputClass}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <button type="submit" className={btnClass} disabled={loading}>
                {loading ? t("forgotPassword.sendingLink") : t("forgotPassword.sendResetLink")}
              </button>

              <div className="text-center pt-2">
                <Link to="/login" className="text-sm text-primary hover:underline">
                  {t("forgotPassword.backToLogin")}
                </Link>
              </div>
            </form>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default ForgotPassword;
