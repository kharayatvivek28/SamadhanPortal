import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { getAuthHeaders } from "@/context/AuthContext";
import StatusTimeline from "@/components/complaint/StatusTimeline";
import ProgressTracker from "@/components/complaint/ProgressTracker";
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
  const { id } = useParams();
  const [complaint, setComplaint] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchComplaint = async () => {
      try {
        const res = await fetch(`/api/complaints/${id}`, { headers: getAuthHeaders() });
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

  if (loading) {
    return <div className="text-center py-20 text-muted-foreground">Loading complaint details...</div>;
  }

  if (!complaint) {
    return <div className="text-center py-20 text-muted-foreground">Complaint not found.</div>;
  }

  const departmentName =
    typeof complaint.department === "object" && complaint.department
      ? complaint.department.name
      : complaint.department || "Unassigned";
  const officerName =
    typeof complaint.assignedOfficer === "object" && complaint.assignedOfficer
      ? complaint.assignedOfficer.name
      : complaint.assignedOfficer || "Unassigned";
  const priority = complaint.priority || "Medium";
  const displayId = complaint.complaintId || complaint.id || complaint._id;
  const filedDate = complaint.createdAt
    ? new Date(complaint.createdAt).toLocaleDateString()
    : "";
  const lastUpdated = complaint.updatedAt
    ? new Date(complaint.updatedAt).toLocaleDateString()
    : "";
  const trackerStatus = statusToTracker[complaint.status] || complaint.status;

  // Convert history entries to timeline format
  const timeline = history.map((h: any) => ({
    step: h.statusChangedTo || "Remark",
    timestamp: new Date(h.timestamp).toLocaleString(),
    updatedBy: h.updatedBy?.name || "System",
    remarks: h.message,
    completed: true,
  }));

  return (
    <div className="max-w-3xl">
      <div className="flex flex-wrap items-start justify-between gap-2 mb-6">
        <div>
          <p className="text-sm font-mono text-muted-foreground">{displayId}</p>
          <h1 className="text-2xl font-bold text-foreground mt-1">{complaint.title}</h1>
        </div>
        <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${priorityColor[priority] || "bg-muted text-muted-foreground"}`}>
          {priority.toUpperCase()} PRIORITY
        </span>
      </div>

      <div className="bg-card rounded-lg border shadow-sm p-6 mb-6">
        <h2 className="font-semibold text-card-foreground mb-2">Description</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">{complaint.description}</p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4 pt-4 border-t">
          <div className="flex items-center gap-2 text-sm">
            <Building2 className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Department</p>
              <p className="font-medium text-card-foreground">{departmentName}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <User className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Officer</p>
              <p className="font-medium text-card-foreground">{officerName}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Filed</p>
              <p className="font-medium text-card-foreground">{filedDate}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Last Updated</p>
              <p className="font-medium text-card-foreground">{lastUpdated}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-card rounded-lg border shadow-sm p-6 mb-6">
        <h2 className="font-semibold text-card-foreground mb-4">Progress</h2>
        <ProgressTracker status={trackerStatus} />
      </div>

      {timeline.length > 0 && (
        <div className="bg-card rounded-lg border shadow-sm p-6">
          <h2 className="font-semibold text-card-foreground mb-4">Timeline</h2>
          <StatusTimeline timeline={timeline} />
        </div>
      )}
    </div>
  );
};

export default ComplaintDetails;
