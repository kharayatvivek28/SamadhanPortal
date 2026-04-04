import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type UserRole = "user" | "employee" | "admin";

interface User {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  isFirstLogin?: boolean;
  profileCompleted?: boolean;
  token: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<any>;
  signup: (name: string, email: string, password: string, role: UserRole, otp: string) => Promise<any>;
  googleLogin: (credential: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Load user from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem("samadhan_user");
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {
        localStorage.removeItem("samadhan_user");
      }
    }
    setLoading(false);
  }, []);

  const saveUser = (data: any) => {
    const userData: User = {
      _id: data._id,
      name: data.name,
      email: data.email || "",
      role: data.role,
      isFirstLogin: data.isFirstLogin,
      profileCompleted: data.profileCompleted,
      token: data.token,
    };
    setUser(userData);
    localStorage.setItem("samadhan_user", JSON.stringify(userData));
  };

  const login = async (email: string, password: string) => {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || "Login failed");
    }

    saveUser(data);
    return data;
  };

  const signup = async (name: string, email: string, password: string, role: UserRole, otp: string) => {
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password, role, otp }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || "Signup failed");
    }

    // Auto-login after registration (no OTP verification needed)
    saveUser(data);
    return data;
  };

  const googleLogin = async (credential: string) => {
    const res = await fetch("/api/auth/google", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ credential }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || "Google login failed");
    }

    saveUser(data);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("samadhan_user");
  };

  return (
    <AuthContext.Provider
      value={{ user, login, signup, googleLogin, logout, isAuthenticated: !!user, loading }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};

// Helper to get auth headers for API calls
export const getAuthHeaders = () => {
  const stored = localStorage.getItem("samadhan_user");
  if (!stored) return {};
  try {
    const user = JSON.parse(stored);
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${user.token}`,
    };
  } catch {
    return {};
  }
};
