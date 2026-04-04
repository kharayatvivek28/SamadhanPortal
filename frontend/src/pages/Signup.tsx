import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/context/AuthContext";
import { GoogleLogin } from "@react-oauth/google";
import Navbar from "@/components/layout/Navbar";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, Mail, ArrowLeft, Loader2 } from "lucide-react";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";

const Signup = () => {
  const { t } = useTranslation();
  const { signup, googleLogin } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState<1 | 2>(1);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // ─── Step 1: Send OTP ───
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      setError("Please fill all fields");
      return;
    }
    setError(""); 
    setLoading(true);
    try {
      const res = await fetch("/api/auth/send-register-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.message || "Failed to send OTP");
      
      setStep(2); // Move to OTP input step
    } catch (err: any) {
      setError(err.message || "Failed to initiate sign up");
    } finally {
      setLoading(false);
    }
  };

  // ─── Step 2: Verify OTP and Signup ───
  const handleVerifyOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (otp.length !== 6) return;

    setError(""); 
    setLoading(true);
    try {
      await signup(name, email, password, "user", otp);
      navigate("/user/dashboard");
    } catch (err: any) {
      setError(err.message || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  // ─── Google Signup ───
  const handleGoogleSuccess = async (credentialResponse: any) => {
    setError(""); setLoading(true);
    try {
      await googleLogin(credentialResponse.credential);
      navigate("/user/dashboard");
    } catch (err: any) {
      setError(err.message || "Google sign-up failed");
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full border rounded-md px-3 py-2 text-sm bg-background text-foreground focus:ring-2 focus:ring-ring focus:outline-none";
  const btnClass = "w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground py-2.5 rounded-md text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50";

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1 flex items-center justify-center p-4 bg-muted">
        <div className="bg-card rounded-lg border shadow-sm p-8 w-full max-w-md overflow-hidden relative">
          
          <div className="text-center mb-6">
            <img src="/logo.png" alt="Samadhan Portal" className="h-12 w-12 mx-auto mb-2" />
            <h1 className="text-2xl font-bold text-card-foreground">
              {step === 1 ? t("signup.title") : "Verify Your Email"}
            </h1>
            <p className="text-sm text-muted-foreground">
              {step === 1 ? t("signup.subtitle") : `We sent a 6-digit code to ${email}`}
            </p>
          </div>

          {error && (
            <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md mb-4">{error}</div>
          )}

          <AnimatePresence mode="wait">
            {step === 1 ? (
              <motion.form
                key="step1"
                onSubmit={handleSendOtp}
                className="space-y-4"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <div>
                  <label className="block text-sm font-medium text-card-foreground mb-1">{t("signup.fullName")}</label>
                  <input required className={inputClass} value={name} onChange={(e) => setName(e.target.value)} placeholder={t("signup.fullNamePlaceholder")} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-card-foreground mb-1">{t("signup.email")}</label>
                  <input required type="email" className={inputClass} value={email} onChange={(e) => setEmail(e.target.value)} placeholder={t("signup.emailPlaceholder", "Your email address")} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-card-foreground mb-1">{t("signup.password")}</label>
                  <div className="relative">
                    <input required type={showPassword ? "text" : "password"} minLength={6} className={inputClass + " pr-10"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder={t("signup.passwordPlaceholder", "Create a password")} />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <button type="submit" disabled={loading} className={btnClass}>
                  {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                  {loading ? "Sending OTP..." : "Continue"}
                </button>

                {/* Divider */}
                <div className="flex items-center gap-3 my-5">
                  <div className="flex-1 h-px bg-border" />
                  <span className="text-xs text-muted-foreground">{t("signup.orSignUpWith")}</span>
                  <div className="flex-1 h-px bg-border" />
                </div>

                {/* Google */}
                <div className="flex justify-center">
                  <GoogleLogin
                    onSuccess={handleGoogleSuccess}
                    onError={() => setError("Google sign-up failed")}
                    theme="outline"
                    shape="pill"
                    text="signup_with"
                    width="320"
                  />
                </div>
              </motion.form>

            ) : (
              
              <motion.form
                key="step2"
                onSubmit={handleVerifyOtp}
                className="space-y-6 flex flex-col items-center"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
              >
                <div className="p-4 bg-primary/10 rounded-full mb-2 text-primary">
                  <Mail className="h-8 w-8" />
                </div>
                
                <InputOTP 
                  maxLength={6} 
                  value={otp} 
                  onChange={setOtp}
                  onComplete={() => handleVerifyOtp()}
                  disabled={loading}
                  autoFocus
                >
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>

                <div className="w-full space-y-3 mt-4">
                  <button type="submit" disabled={loading || otp.length !== 6} className={btnClass}>
                    {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                    {loading ? "Verifying..." : "Verify & Complete Signup"}
                  </button>
                  <button type="button" onClick={() => setStep(1)} className="w-full text-sm text-muted-foreground flex justify-center items-center gap-2 hover:text-foreground">
                    <ArrowLeft className="h-4 w-4" /> Go back and edit details
                  </button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>

          {step === 1 && (
            <div className="mt-5 text-center">
              <p className="text-sm text-muted-foreground">
                {t("signup.hasAccount")} <Link to="/login" className="text-primary font-medium hover:underline">{t("signup.loginLink")}</Link>
              </p>
              <p className="text-xs text-muted-foreground mt-6 border-t pt-4">
                * {t("signup.adminNote")}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Signup;
