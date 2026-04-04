import { useState, useEffect } from "react";
import { getAuthHeaders } from "@/context/AuthContext";
import { useTranslation } from "react-i18next";
import StatsCard from "@/components/analytics/StatsCard";
import ComplaintCard from "@/components/complaint/ComplaintCard";
import { FileText, CheckCircle2, Clock } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import StaggerContainer from "@/components/motion/StaggerContainer";
import SkeletonCard from "@/components/ui/skeleton-card";
import PageTransition from "@/components/motion/PageTransition";
import ForceChangePassword from "@/components/employee/ForceChangePassword";
import ForceCompleteProfile from "@/components/employee/ForceCompleteProfile";

const EmployeeDashboard = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [complaints, setComplaints] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAssigned = async () => {
      try {
        const res = await fetch("/api/employee/assigned", { headers: getAuthHeaders() });
        if (res.ok) setComplaints(await res.json());
      } catch (err) {
        console.error("Failed to fetch assigned complaints:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAssigned();
  }, []);

  const assigned = complaints.filter(c => c.status !== "Resolved");

  return (
    <PageTransition>
      {/* Onboarding Popups */}
      <ForceChangePassword isOpen={!!user?.isFirstLogin} />
      <ForceCompleteProfile 
        isOpen={!user?.isFirstLogin && !user?.profileCompleted} 
        onCompleted={() => {}}
      />

      <h1 className="text-2xl font-bold text-foreground mb-1">{t("userDashboard.welcome", "Welcome")} {user?.name}</h1>
      <p className="text-muted-foreground text-sm mb-6">{t("employeeDashboard.subtitle", "Employee Dashboard — Manage assigned complaints")}</p>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-8">
          {Array.from({ length: 3 }).map((_, i) => (
            <SkeletonCard key={i} variant="stats" />
          ))}
        </div>
      ) : (
        <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-8">
          <StatsCard title={t("common.assigned", "Assigned")} value={assigned.length} icon={FileText} />
          <StatsCard title={t("common.inProgress", "In Progress")} value={assigned.filter(c => c.status === "In Progress").length} icon={Clock} />
          <StatsCard title={t("common.resolved", "Resolved")} value={complaints.filter(c => c.status === "Resolved").length} icon={CheckCircle2} />
        </StaggerContainer>
      )}

      <h2 className="text-lg font-semibold text-foreground mb-4">{t("employeeDashboard.assignedComplaints", "Assigned Complaints")}</h2>

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <SkeletonCard key={i} variant="complaint" />
          ))}
        </div>
      ) : assigned.length === 0 ? (
        <div className="text-center py-10 text-muted-foreground">{t("employeeDashboard.noComplaints", "No active complaints assigned to you.")}</div>
      ) : (
        <StaggerContainer className="space-y-4">
          {assigned.map((c) => (
            <ComplaintCard key={c._id} complaint={c} linkPrefix="/employee" />
          ))}
        </StaggerContainer>
      )}
    </PageTransition>
  );
};

export default EmployeeDashboard;
