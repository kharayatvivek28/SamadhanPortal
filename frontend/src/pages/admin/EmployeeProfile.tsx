import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { getAuthHeaders } from "@/context/AuthContext";
import PageTransition from "@/components/motion/PageTransition";
import SkeletonCard from "@/components/ui/skeleton-card";
import { ArrowLeft, User, Phone, MapPin, Calendar, Briefcase, Mail, Building, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

const EmployeeProfile = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const [employee, setEmployee] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEmployee = async () => {
      try {
        const res = await fetch(`/api/admin/employees/${id}`, { headers: getAuthHeaders() });
        if (res.ok) {
          setEmployee(await res.json());
        } else {
          toast.error("Failed to fetch employee details");
          navigate("/admin/employees");
        }
      } catch (err) {
        toast.error("An error occurred");
        navigate("/admin/employees");
      } finally {
        setLoading(false);
      }
    };
    fetchEmployee();
  }, [id, navigate]);

  if (loading) {
    return (
      <PageTransition>
        <div className="mb-6"><SkeletonCard variant="stats" /></div>
        <SkeletonCard variant="complaint" />
      </PageTransition>
    );
  }

  if (!employee) return null;

  return (
    <PageTransition>
      <div className="flex items-center gap-4 mb-6">
        <button 
          onClick={() => navigate("/admin/employees")}
          className="p-2 border bg-background rounded-md hover:bg-muted transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-foreground mb-1">{t("manageEmployees.employeeDetails", "Employee Details")}</h1>
          <p className="text-muted-foreground text-sm">{t("accountSettings.subtitle", "Detailed information and demographics")}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column - ID Card Style */}
        <div className="md:col-span-1 bg-card border rounded-lg shadow-sm overflow-hidden flex flex-col">
          <div className="h-24 bg-primary/10 w-full relative">
            <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 rounded-full border-4 border-card bg-muted h-24 w-24 flex items-center justify-center overflow-hidden shadow-sm">
              {employee.photographUrl ? (
                <img src={employee.photographUrl} alt={employee.name} className="h-full w-full object-cover" />
              ) : (
                <User className="h-10 w-10 text-muted-foreground" />
              )}
            </div>
          </div>
          <div className="pt-16 pb-6 px-6 text-center flex-1">
            <h2 className="text-xl font-bold text-card-foreground">{employee.name}</h2>
            <p className="text-sm font-medium text-primary mt-1">{employee.department?.name || "Unassigned"}</p>
            
            <div className="mt-4 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-secondary text-secondary-foreground text-xs font-semibold">
              <Briefcase className="h-3.5 w-3.5" />
              {t("employeeProfile.activeComplaints", "Active Complaints:")} {employee.activeComplaints || 0}
            </div>

            <div className="mt-6 space-y-3 text-left">
              <div className="flex items-center gap-3 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="truncate">{employee.email}</span>
              </div>
              {employee.phone && (
                <div className="flex items-center gap-3 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{employee.phone}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Demographic Details */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-card border rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-bold border-b pb-3 mb-4 flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              {t("accountSettings.demographics", "Demographics")}
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-4">
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1">First Name</p>
                <p className="font-medium">{employee.firstName || "N/A"}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1">Last Name</p>
                <p className="font-medium">{employee.lastName || "N/A"}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1 flex items-center gap-1"><User className="h-3 w-3"/> {t("accountSettings.gender", "Gender")}</p>
                <p className="font-medium text-sm">{employee.gender || t("common.unknown", "N/A")}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1 flex items-center gap-1"><Calendar className="h-3 w-3"/> Date of Birth</p>
                <p className="font-medium text-sm">
                  {employee.dob ? new Date(employee.dob).toLocaleDateString() : "N/A"}
                </p>
              </div>
              <div className="sm:col-span-2">
                <p className="text-xs font-medium text-muted-foreground mb-1 flex items-center gap-1"><MapPin className="h-3 w-3"/> Address</p>
                <p className="font-medium text-sm">{employee.address || "N/A"}</p>
              </div>
            </div>
          </div>

          <div className="bg-card border rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-bold border-b pb-3 mb-4 flex items-center gap-2">
              <Building className="h-5 w-5 text-primary" />
              {t("accountSettings.accountStatus", "Account Status")}
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-md bg-muted/50 border">
                <div>
                  <p className="font-medium text-sm">Profile Setup</p>
                  <p className="text-xs text-muted-foreground">Has the employee completed their onboarding?</p>
                </div>
                <div className={`px-2.5 py-1 rounded-full text-xs font-medium flex items-center gap-1.5 ${employee.profileCompleted ? "bg-emerald-100 text-emerald-700 border-emerald-200" : "bg-orange-100 text-orange-700 border-orange-200"}`}>
                  {employee.profileCompleted ? <CheckCircle2 className="h-3 w-3" /> : null}
                  {employee.profileCompleted ? "Completed" : "Pending"}
                </div>
              </div>
              <div className="flex items-center justify-between p-3 rounded-md bg-muted/50 border">
                <div>
                  <p className="font-medium text-sm">Password Change</p>
                  <p className="text-xs text-muted-foreground">Has the employee changed their temporary password?</p>
                </div>
                <div className={`px-2.5 py-1 rounded-full text-xs font-medium flex items-center gap-1.5 ${!employee.isFirstLogin ? "bg-emerald-100 text-emerald-700 border-emerald-200" : "bg-orange-100 text-orange-700 border-orange-200"}`}>
                  {!employee.isFirstLogin ? <CheckCircle2 className="h-3 w-3" /> : null}
                  {!employee.isFirstLogin ? "Updated" : "Action Required"}
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </PageTransition>
  );
};

export default EmployeeProfile;
