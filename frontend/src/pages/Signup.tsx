import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

import Navbar from "@/components/layout/Navbar";

const Signup = () => {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await signup(name, email, password, "user");
      navigate("/user/dashboard");
    } catch (err: any) {
      setError(err.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1 flex items-center justify-center p-4 bg-muted">
        <div className="bg-card rounded-lg border shadow-sm p-8 w-full max-w-md">
          <div className="text-center mb-6">
            <img src="/logo.png" alt="Samadhan Portal" className="h-12 w-12 mx-auto mb-2" />
            <h1 className="text-2xl font-bold text-card-foreground">Create Account</h1>
            <p className="text-sm text-muted-foreground">Register as a citizen to file and track complaints</p>
          </div>

          {error && (
            <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-card-foreground mb-1">Full Name</label>
              <input required className="w-full border rounded-md px-3 py-2 text-sm bg-background text-foreground focus:ring-2 focus:ring-ring focus:outline-none" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your full name" />
            </div>
            <div>
              <label className="block text-sm font-medium text-card-foreground mb-1">Email</label>
              <input required type="email" className="w-full border rounded-md px-3 py-2 text-sm bg-background text-foreground focus:ring-2 focus:ring-ring focus:outline-none" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
            </div>
            <div>
              <label className="block text-sm font-medium text-card-foreground mb-1">Password</label>
              <input required type="password" className="w-full border rounded-md px-3 py-2 text-sm bg-background text-foreground focus:ring-2 focus:ring-ring focus:outline-none" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
            </div>
            <button type="submit" disabled={loading} className="w-full bg-primary text-primary-foreground py-2.5 rounded-md text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50">
              {loading ? "Creating Account..." : "Sign Up as Citizen"}
            </button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-4">
            Already have an account? <Link to="/login" className="text-primary font-medium hover:underline">Login</Link>
          </p>

          <p className="text-center text-xs text-muted-foreground mt-2">
            Employee & Admin accounts are created by the system administrator.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
