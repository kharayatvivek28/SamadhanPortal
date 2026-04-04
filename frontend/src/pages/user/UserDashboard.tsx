import { useState, useEffect } from "react";
import { getAuthHeaders } from "@/context/AuthContext";
import { useTranslation } from "react-i18next";
import StatsCard from "@/components/analytics/StatsCard";
import ComplaintCard from "@/components/complaint/ComplaintCard";
import { FileText, CheckCircle2, Clock, AlertTriangle, ArchiveX } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import StaggerContainer from "@/components/motion/StaggerContainer";
import SkeletonCard from "@/components/ui/skeleton-card";
import PageTransition from "@/components/motion/PageTransition";
import PendingFeedbackDialog from "@/components/complaint/PendingFeedbackDialog";

const UserDashboard = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [complaints, setComplaints] = useState<any[]>([]);
  const [pendingFeedback, setPendingFeedback] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);

  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        const headers = getAuthHeaders();
        const res = await fetch("/api/complaints/my", { headers });
        if (res.ok) {
          const data = await res.json();
          setComplaints(data);
        }

        // Check for pending feedbacks
        const feedbackRes = await fetch("/api/complaints/pending-feedback", { headers });
        if (feedbackRes.ok) {
          const feedbackData = await feedbackRes.json();
          if (feedbackData.length > 0) {
            setPendingFeedback(feedbackData);
            setShowFeedbackModal(true);
          }
        }
      } catch (err) {
        console.error("Failed to fetch complaints:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchComplaints();
  }, []);

  const recent = complaints.slice(0, 3);

  return (
    <PageTransition>
      {showFeedbackModal && pendingFeedback.length > 0 && (
        <PendingFeedbackDialog 
          complaints={pendingFeedback} 
          onOpenChange={setShowFeedbackModal} 
        />
      )}
      <h1 className="text-2xl font-bold text-foreground mb-1">{t("userDashboard.welcome")} {user?.name}</h1>
      <p className="text-muted-foreground text-sm mb-6">{t("userDashboard.subtitle")}</p>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4 mb-8">
          {Array.from({ length: 5 }).map((_, i) => (
            <SkeletonCard key={i} variant="stats" />
          ))}
        </div>
      ) : (
        <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4 mb-8">
          <StatsCard title={t("userDashboard.total")} value={complaints.length} icon={FileText} />
          <StatsCard title={t("userDashboard.resolved")} value={complaints.filter(c => c.status === "Resolved").length} icon={CheckCircle2} />
          <StatsCard title={t("userDashboard.inProgress")} value={complaints.filter(c => c.status === "In Progress").length} icon={Clock} />
          <StatsCard title={t("userDashboard.pending")} value={complaints.filter(c => !["Resolved", "In Progress", "Revoked"].includes(c.status)).length} icon={AlertTriangle} />
          <StatsCard title={t("userDashboard.revoked")} value={complaints.filter(c => c.status === "Revoked").length} icon={ArchiveX} />
        </StaggerContainer>
      )}

      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-foreground">{t("userDashboard.recentComplaints")}</h2>
        <Link to="/user/my-complaints" className="text-sm text-primary font-medium hover:underline">{t("userDashboard.viewAll")}</Link>
      </div>

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <SkeletonCard key={i} variant="complaint" />
          ))}
        </div>
      ) : recent.length === 0 ? (
        <div className="text-center py-10 text-muted-foreground">{t("userDashboard.noComplaints")} <Link to="/user/file-complaint" className="text-primary hover:underline">{t("userDashboard.fileFirst")}</Link></div>
      ) : (
        <StaggerContainer className="space-y-4">
          {recent.map((c) => (
            <ComplaintCard key={c._id} complaint={c} linkPrefix="/user" />
          ))}
        </StaggerContainer>
      )}
    </PageTransition>
  );
};

export default UserDashboard;
