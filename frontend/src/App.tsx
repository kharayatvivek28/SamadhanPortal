import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import { GoogleOAuthProvider } from "@react-oauth/google";
import ProtectedRoute from "@/routes/ProtectedRoute";
import DashboardLayout from "@/components/layout/DashboardLayout";
import Navbar from "@/components/layout/Navbar";
import React, { Suspense } from "react";
import SkeletonCard from "@/components/ui/skeleton-card";
// Animation: ScrollToTop for smooth auto-scroll on navigation + FAB for mobile
import ScrollToTop from "@/components/motion/ScrollToTop";
import FloatingActionButton from "@/components/motion/FloatingActionButton";
import Chatbot from "@/components/chatbot/Chatbot";

// Lazy loaded pages
const Home = React.lazy(() => import("@/pages/Home"));
const Login = React.lazy(() => import("@/pages/Login"));
const Signup = React.lazy(() => import("@/pages/Signup"));
const NotFound = React.lazy(() => import("@/pages/NotFound"));
const PublicVerify = React.lazy(() => import("@/pages/PublicVerify"));
const ForgotPassword = React.lazy(() => import("@/pages/ForgotPassword"));
const ResetPassword = React.lazy(() => import("@/pages/ResetPassword"));

const UserDashboard = React.lazy(() => import("@/pages/user/UserDashboard"));
const MyComplaints = React.lazy(() => import("@/pages/user/MyComplaints"));
const FileComplaint = React.lazy(() => import("@/pages/user/FileComplaint"));
const ComplaintDetails = React.lazy(() => import("@/pages/user/ComplaintDetails"));
const UserProfilePage = React.lazy(() => import("@/pages/user/UserProfilePage"));

const EmployeeDashboard = React.lazy(() => import("@/pages/employee/EmployeeDashboard"));
const AssignedComplaints = React.lazy(() => import("@/pages/employee/AssignedComplaints"));
const EmployeeProfilePage = React.lazy(() => import("@/pages/employee/EmployeeProfilePage"));

const AdminDashboard = React.lazy(() => import("@/pages/admin/AdminDashboard"));
const AllComplaints = React.lazy(() => import("@/pages/admin/AllComplaints"));
const ManageDepartments = React.lazy(() => import("@/pages/admin/ManageDepartments"));
const ManageEmployees = React.lazy(() => import("@/pages/admin/ManageEmployees"));
const EmployeeProfile = React.lazy(() => import("@/pages/admin/EmployeeProfile"));
const AdminAnalytics = React.lazy(() => import("@/pages/admin/AdminAnalytics"));
const ActivityLogPage = React.lazy(() => import("@/pages/admin/ActivityLogPage"));
const AdminRevokedComplaints = React.lazy(() => import("@/pages/admin/AdminRevokedComplaints"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
    },
  },
});

const PageLoader = () => (
  <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
    <div className="w-full max-w-md space-y-4 px-4">
      <SkeletonCard variant="stats" />
      <SkeletonCard variant="complaint" />
    </div>
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID || ""}>
        <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          {/* Animation: Auto-scroll to top on every route change */}
          <ScrollToTop />
          {/* Animation: Mobile FAB for quick complaint filing */}
          <FloatingActionButton />
          {/* AI Chatbot — floating widget available on all pages */}
          <Chatbot />
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/verify" element={<PublicVerify />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password/:token" element={<ResetPassword />} />

              {/* User routes */}
              <Route path="/user" element={<ProtectedRoute allowedRoles={["user"]}><div className="min-h-screen flex flex-col"><Navbar /><DashboardLayout /></div></ProtectedRoute>}>
                <Route path="dashboard" element={<UserDashboard />} />
                <Route path="my-complaints" element={<MyComplaints />} />
                <Route path="file-complaint" element={<FileComplaint />} />
                <Route path="profile" element={<UserProfilePage />} />
                <Route path="complaint/:id" element={<ComplaintDetails />} />
              </Route>

              {/* Employee routes */}
              <Route path="/employee" element={<ProtectedRoute allowedRoles={["employee"]}><div className="min-h-screen flex flex-col"><Navbar /><DashboardLayout /></div></ProtectedRoute>}>
                <Route path="dashboard" element={<EmployeeDashboard />} />
                <Route path="assigned" element={<AssignedComplaints />} />
                <Route path="profile" element={<EmployeeProfilePage />} />
                <Route path="complaint/:id" element={<ComplaintDetails />} />
              </Route>

              {/* Admin routes */}
              <Route path="/admin" element={<ProtectedRoute allowedRoles={["admin"]}><div className="min-h-screen flex flex-col"><Navbar /><DashboardLayout /></div></ProtectedRoute>}>
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="complaints" element={<AllComplaints />} />
                <Route path="departments" element={<ManageDepartments />} />
                <Route path="employees" element={<ManageEmployees />} />
                <Route path="employees/:id" element={<EmployeeProfile />} />
                <Route path="analytics" element={<AdminAnalytics />} />
                <Route path="activity-log" element={<ActivityLogPage />} />
                <Route path="revoked-complaints" element={<AdminRevokedComplaints />} />
                <Route path="complaint/:id" element={<ComplaintDetails />} />
              </Route>

              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
        </AuthProvider>
      </GoogleOAuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
