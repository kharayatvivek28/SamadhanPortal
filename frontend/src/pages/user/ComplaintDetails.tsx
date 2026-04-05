import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { getAuthHeaders, useAuth } from "@/context/AuthContext";
import { apiFetch } from "@/lib/api";
import StatusTimeline from "@/components/complaint/StatusTimeline";
import ProgressTracker from "@/components/complaint/ProgressTracker";
import SLACountdown from "@/components/complaint/SLACountdown";
import EscalationBadge from "@/components/complaint/EscalationBadge";
import FeedbackForm from "@/components/complaint/FeedbackForm";
import CommentsThread from "@/components/complaint/CommentsThread";
import RevokeComplaintModal from "@/components/complaint/RevokeComplaintModal";
import PageTransition from "@/components/motion/PageTransition";
import { Calendar, User, Building2 } from "lucide-react";

const priorityColor: Record<string, string> = {
  Low: "bg-status-pending/20 text-muted-foreground",
  Medium: "bg-status-progress/20 text-foreground",
  High: "bg-destructive/10 text-destructive",
  low: "bg-status-pending/20 text-muted-foreground",
  medium: "bg-status-progress/20 text-foreground",
  high: "bg-destructive/10 text-destructive",
};

const statusToTracker: Record<string, string> = {
  Pending: "submitted",
  Assigned: "assigned_dept",
  "In Progress": "in_progress",
  Resolved: "resolved",
};

const ComplaintDetails = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const { user } = useAuth();
  const [complaint, setComplaint] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Feedback state
  const [existingFeedback, setExistingFeedback] = useState<any>(null);
  const [feedbackChecked, setFeedbackChecked] = useState(false);

  useEffect(() => {
    const fetchComplaint = async () => {
      try {
        const res = await apiFetch(`/api/complaints/${id}`, { headers: getAuthHeaders() });
        if (res.ok) {
          const data = await res.json();
          setComplaint(data.complaint);
          setHistory(data.history || []);
        }
      } catch (err) {
        console.error("Failed to fetch complaint:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchComplaint();
  }, [id]);

  // Check if user already submitted feedback for this complaint
  useEffect(() => {
    if (!id || !user || user.role !== "user") return;

    const checkFeedback = async () => {
      try {
        const res = await apiFetch(`/api/feedback/check/${id}`, { headers: getAuthHeaders() });
        if (res.ok) {
          const data = await res.json();
          if (data.hasFeedback) {
            setExistingFeedback(data.feedback);
          }
        }
      } catch (err) {
        console.error("Failed to check feedback:", err);
      } finally {
        setFeedbackChecked(true);
      }
    };
    checkFeedback();
  }, [id, user]);

  if (loading) {
    return <div className="text-center py-20 text-muted-foreground">{t("complaintDetails.loading", "Loading complaint details...")}</div>;
  }

  if (!complaint) {
    return <div className="text-center py-20 text-muted-foreground">{t("complaintDetails.notFound", "Complaint not found.")}</div>;
  }

  const departmentName =
    typeof complaint.department === "object" && complaint.department
      ? complaint.department.name
      : complaint.department || t("common.unassigned", "Unassigned");
  const officerName =
    typeof complaint.assignedOfficer === "object" && complaint.assignedOfficer
      ? complaint.assignedOfficer.name
      : complaint.assignedOfficer || t("common.unassigned", "Unassigned");
  const priority = complaint.priority || "Medium";
  const displayId = complaint.complaintId || complaint.id || complaint._id;
  const filedDate = complaint.createdAt
    ? new Date(complaint.createdAt).toLocaleDateString()
    : "";
  const lastUpdated = complaint.updatedAt
    ? new Date(complaint.updatedAt).toLocaleDateString()
    : "";
  const trackerStatus = statusToTracker[complaint.status] || complaint.status;

  // Calculate SLA deadline (7 days from creation for demo)
  const slaDeadline = complaint.slaDeadline || (complaint.createdAt
    ? new Date(new Date(complaint.createdAt).getTime() + 7 * 24 * 60 * 60 * 1000).toISOString()
    : undefined);

  const escalationLevel = complaint.escalationLevel || 0;

  const timeline = history.map((h: any) => ({
    step: h.statusChangedTo || t("complaintDetails.remark", "Remark"),
    timestamp: new Date(h.timestamp).toLocaleString(),
    updatedBy: h.updatedBy?.name || t("common.system", "System"),
    remarks: h.message,
    completed: true,
  }));

  return (
    <PageTransition>
      <div className="max-w-3xl">
        <div className="flex flex-wrap items-start justify-between gap-2 mb-4">
          <div>
            <p className="text-sm font-mono text-muted-foreground">{displayId}</p>
            <h1 className="text-2xl font-bold text-foreground mt-1">{complaint.title}</h1>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${priorityColor[priority] || "bg-muted text-muted-foreground"}`}>
              {priority.toUpperCase()} {t("complaint.priority", "PRIORITY").toUpperCase()}
            </span>
            <EscalationBadge level={escalationLevel} />
            {user?.role === "user" && complaint.status !== "Resolved" && complaint.status !== "Revoked" && (
              <RevokeComplaintModal complaintId={displayId} onRevoked={() => setComplaint({ ...complaint, status: "Revoked" })} />
            )}
            {complaint.status === "Revoked" && (
               <span className="text-xs px-2.5 py-1 rounded-full font-medium bg-destructive/10 text-destructive border border-destructive/20">
                 {t("complaintDetails.revoked", "REVOKED")}
               </span>
            )}
          </div>
        </div>

        {/* SLA Countdown */}
        {complaint.status !== "Resolved" && complaint.status !== "Revoked" && slaDeadline && (
          <div className="mb-6">
            <SLACountdown deadline={slaDeadline} />
          </div>
        )}

        {/* Revoked Status Banner */}
        {complaint.status === "Revoked" && (
          <div className="bg-destructive/5 border border-destructive/20 rounded-lg p-4 mb-6 flex items-start gap-3">
             <div className="mt-0.5">
               <span className="flex h-2 w-2 rounded-full bg-destructive"></span>
             </div>
             <div>
               <h3 className="font-semibold text-destructive/90 text-sm mb-1">{t("complaintDetails.complaintRevoked", "Complaint Revoked")}</h3>
               <p className="text-xs text-muted-foreground">{complaint.revokeReason || t("complaintDetails.noReason", "No reason provided")}</p>
             </div>
          </div>
        )}

        <div className="bg-card rounded-lg border shadow-sm p-6 mb-6">
          <h2 className="font-semibold text-card-foreground mb-2">{t("complaintDetails.description", "Description")}</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">{complaint.description}</p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4 pt-4 border-t">
            <div className="flex items-center gap-2 text-sm">
              <Building2 className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">{t("complaintDetails.department", "Department")}</p>
                <p className="font-medium text-card-foreground">{departmentName}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <User className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">{t("complaintDetails.officer", "Officer")}</p>
                <p className="font-medium text-card-foreground">{officerName}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">{t("complaintDetails.filed", "Filed")}</p>
                <p className="font-medium text-card-foreground">{filedDate}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">{t("complaintDetails.lastUpdated", "Last Updated")}</p>
                <p className="font-medium text-card-foreground">{lastUpdated}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-lg border shadow-sm p-6 mb-6">
          <h2 className="font-semibold text-card-foreground mb-4">{t("complaintDetails.progress", "Progress")}</h2>
          <ProgressTracker status={trackerStatus} />
        </div>

        {timeline.length > 0 && (
          <div className="bg-card rounded-lg border shadow-sm p-6 mb-6">
            <h2 className="font-semibold text-card-foreground mb-4">{t("complaintDetails.timeline", "Timeline")}</h2>
            <StatusTimeline timeline={timeline} />
          </div>
        )}

        {/* Feedback for resolved complaints */}
        {complaint.status === "Resolved" && user?.role === "user" && feedbackChecked && (
          <div className="bg-card rounded-lg border shadow-sm p-6">
            <h2 className="font-semibold text-card-foreground mb-4">
              {existingFeedback ? t("complaintDetails.yourFeedback", "Your Feedback") : t("complaintDetails.rateExperience", "Rate Your Experience")}
            </h2>
            <FeedbackForm
              complaintId={displayId}
              existingFeedback={existingFeedback}
            />
          </div>
        )}

        {/* Complaint Chat/Comments */}
        <CommentsThread 
          complaintDbId={complaint._id} 
          complaintStatus={complaint.status}
          assignedOfficerId={
            typeof complaint.assignedOfficer === "object" && complaint.assignedOfficer 
              ? complaint.assignedOfficer._id 
              : complaint.assignedOfficer
          }
        />
      </div>
    </PageTransition>
  );
};

export default ComplaintDetails;
