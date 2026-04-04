import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/context/AuthContext";
import { GoogleLogin } from "@react-oauth/google";
import Navbar from "@/components/layout/Navbar";
import { motion } from "framer-motion";
import { Eye, EyeOff } from "lucide-react";

const Login = () => {
  const { t } = useTranslation();
  const { login, googleLogin } = useAuth();
  const navigate = useNavigate();

  // Email form
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // ─── Email/password login ───
  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      await login(email, password);
      const stored = localStorage.getItem("samadhan_user");
      if (stored) {
        const u = JSON.parse(stored);
        navigate(`/${u.role}/dashboard`);
      }
    } catch (err: any) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  // ─── Google login ───
  const handleGoogleSuccess = async (credentialResponse: any) => {
    setError(""); setLoading(true);
    try {
      await googleLogin(credentialResponse.credential);
      const stored = localStorage.getItem("samadhan_user");
      if (stored) {
        const u = JSON.parse(stored);
        navigate(`/${u.role}/dashboard`);
      }
    } catch (err: any) {
      setError(err.message || "Google login failed");
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full border rounded-md px-3 py-2 text-sm bg-background text-foreground focus:ring-2 focus:ring-ring focus:outline-none";
  const btnClass = "w-full bg-primary text-primary-foreground py-2.5 rounded-md text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50";

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1 flex items-center justify-center p-4 bg-muted">
        <div className="bg-card rounded-lg border shadow-sm p-8 w-full max-w-md">
          <div className="text-center mb-6">
            <img src="/logo.png" alt="Samadhan Portal" className="h-12 w-12 mx-auto mb-2" />
            <h1 className="text-2xl font-bold text-card-foreground">{t("login.title")}</h1>
            <p className="text-sm text-muted-foreground">{t("login.subtitle")}</p>
          </div>

          {error && (
            <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md mb-4">{error}</div>
          )}

          <motion.form
            onSubmit={handleEmailLogin}
            className="space-y-4"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div>
              <label className="block text-sm font-medium text-card-foreground mb-1">{t("login.email")}</label>
              <input required type="email" className={inputClass} value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-card-foreground">{t("login.password")}</label>
                <Link to="/forgot-password" className="text-xs text-primary hover:underline">{t("login.forgotPassword")}</Link>
              </div>
              <div className="relative">
                <input required type={showPassword ? "text" : "password"} className={inputClass + " pr-10"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground hover:text-foreground"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading} className={btnClass}>
              {loading ? t("login.loggingIn") : t("login.loginBtn")}
            </button>
          </motion.form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-muted-foreground">{t("login.orContinueWith")}</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          {/* Google */}
          <div className="flex justify-center">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => setError("Google sign-in failed")}
              theme="outline"
              shape="pill"
              text="signin_with"
              width="320"
            />
          </div>

          <p className="text-center text-sm text-muted-foreground mt-5">
            {t("login.noAccount")} <Link to="/signup" className="text-primary font-medium hover:underline">{t("login.signupLink")}</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
