import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import ProtectedRoute from "@/routes/ProtectedRoute";
import DashboardLayout from "@/components/layout/DashboardLayout";
import Navbar from "@/components/layout/Navbar";

import Home from "@/pages/Home";
import Login from "@/pages/Login";
import Signup from "@/pages/Signup";
import NotFound from "@/pages/NotFound";

import UserDashboard from "@/pages/user/UserDashboard";
import MyComplaints from "@/pages/user/MyComplaints";
import FileComplaint from "@/pages/user/FileComplaint";
import ComplaintDetails from "@/pages/user/ComplaintDetails";

import EmployeeDashboard from "@/pages/employee/EmployeeDashboard";
import AssignedComplaints from "@/pages/employee/AssignedComplaints";

import AdminDashboard from "@/pages/admin/AdminDashboard";
import AllComplaints from "@/pages/admin/AllComplaints";
import ManageDepartments from "@/pages/admin/ManageDepartments";
import ManageEmployees from "@/pages/admin/ManageEmployees";

const queryClient = new QueryClient();

const DashboardWrapper = ({ children, roles }: { children: React.ReactNode; roles: ("user" | "employee" | "admin")[] }) => (
  <ProtectedRoute allowedRoles={roles}>
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <DashboardLayout />
    </div>
  </ProtectedRoute>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />

            {/* User routes */}
            <Route path="/user" element={<ProtectedRoute allowedRoles={["user"]}><div className="min-h-screen flex flex-col"><Navbar /><DashboardLayout /></div></ProtectedRoute>}>
              <Route path="dashboard" element={<UserDashboard />} />
              <Route path="my-complaints" element={<MyComplaints />} />
              <Route path="file-complaint" element={<FileComplaint />} />
              <Route path="complaint/:id" element={<ComplaintDetails />} />
            </Route>

            {/* Employee routes */}
            <Route path="/employee" element={<ProtectedRoute allowedRoles={["employee"]}><div className="min-h-screen flex flex-col"><Navbar /><DashboardLayout /></div></ProtectedRoute>}>
              <Route path="dashboard" element={<EmployeeDashboard />} />
              <Route path="assigned" element={<AssignedComplaints />} />
              <Route path="complaint/:id" element={<ComplaintDetails />} />
            </Route>

            {/* Admin routes */}
            <Route path="/admin" element={<ProtectedRoute allowedRoles={["admin"]}><div className="min-h-screen flex flex-col"><Navbar /><DashboardLayout /></div></ProtectedRoute>}>
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="complaints" element={<AllComplaints />} />
              <Route path="departments" element={<ManageDepartments />} />
              <Route path="employees" element={<ManageEmployees />} />
              <Route path="complaint/:id" element={<ComplaintDetails />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
