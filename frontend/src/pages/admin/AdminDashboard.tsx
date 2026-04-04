import { useState, useEffect } from "react";
import { getAuthHeaders } from "@/context/AuthContext";
import { useTranslation } from "react-i18next";
import StatsCard from "@/components/analytics/StatsCard";
import ComplaintCard from "@/components/complaint/ComplaintCard";
import { FileText, CheckCircle2, Clock, Building2, ArchiveX } from "lucide-react";
import { Link } from "react-router-dom";
import StaggerContainer from "@/components/motion/StaggerContainer";
import SkeletonCard from "@/components/ui/skeleton-card";
import PageTransition from "@/components/motion/PageTransition";

const AdminDashboard = () => {
  const { t } = useTranslation();
  const [stats, setStats] = useState({ totalComplaints: 0, resolved: 0, inProgress: 0, pending: 0, revoked: 0, activeDepartments: 0 });
  const [complaints, setComplaints] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const headers = getAuthHeaders();
        const [statsRes, complaintsRes] = await Promise.all([
          fetch("/api/admin/stats", { headers }),
          fetch("/api/admin/complaints", { headers }),
        ]);
        if (statsRes.ok) setStats(await statsRes.json());
        if (complaintsRes.ok) setComplaints(await complaintsRes.json());
      } catch (err) {
        console.error("Failed to fetch admin data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <PageTransition>
      <h1 className="text-2xl font-bold text-foreground mb-1">{t("adminDashboard.title")}</h1>
      <p className="text-muted-foreground text-sm mb-6">{t("adminDashboard.subtitle")}</p>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4 mb-8">
          {Array.from({ length: 5 }).map((_, i) => (
            <SkeletonCard key={i} variant="stats" />
          ))}
        </div>
      ) : (
        <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4 mb-8">
          <StatsCard title={t("adminDashboard.totalActive")} value={stats.totalComplaints} icon={FileText} />
          <StatsCard title={t("adminDashboard.resolved")} value={stats.resolved} icon={CheckCircle2} />
          <StatsCard title={t("adminDashboard.inProgress")} value={stats.inProgress} icon={Clock} />
          <StatsCard title={t("adminDashboard.revoked")} value={stats.revoked} icon={ArchiveX} />
          <StatsCard title={t("adminDashboard.departments")} value={stats.activeDepartments} icon={Building2} />
        </StaggerContainer>
      )}

      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-foreground">{t("adminDashboard.recentComplaints")}</h2>
        <Link to="/admin/complaints" className="text-sm text-primary font-medium hover:underline">{t("adminDashboard.viewAll")}</Link>
      </div>

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <SkeletonCard key={i} variant="complaint" />
          ))}
        </div>
      ) : (
        <StaggerContainer className="space-y-4">
          {complaints.slice(0, 3).map((c) => (
            <ComplaintCard key={c._id} complaint={c} linkPrefix="/admin" />
          ))}
        </StaggerContainer>
      )}
    </PageTransition>
  );
};

export default AdminDashboard;
