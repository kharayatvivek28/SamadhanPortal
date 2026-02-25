import { Link } from "react-router-dom";
import ProgressTracker from "./ProgressTracker";
import { Calendar, User, Building2 } from "lucide-react";

const statusLabel: Record<string, string> = {
  Pending: "Submitted",
  Assigned: "Dept. Assigned",
  "In Progress": "In Progress",
  Resolved: "Resolved",
  // Fallback legacy mappings
  submitted: "Submitted",
  assigned_dept: "Dept. Assigned",
  assigned_officer: "Officer Assigned",
  in_progress: "In Progress",
  resolved: "Resolved",
};

const statusColor: Record<string, string> = {
  Pending: "bg-muted text-muted-foreground",
  Assigned: "bg-secondary text-secondary-foreground",
  "In Progress": "bg-status-progress/20 text-foreground",
  Resolved: "bg-status-resolved/20 text-foreground",
  submitted: "bg-muted text-muted-foreground",
  assigned_dept: "bg-secondary text-secondary-foreground",
  assigned_officer: "bg-secondary text-secondary-foreground",
  in_progress: "bg-status-progress/20 text-foreground",
  resolved: "bg-status-resolved/20 text-foreground",
};

// Map backend status to the tracker key
const statusToTracker: Record<string, string> = {
  Pending: "submitted",
  Assigned: "assigned_dept",
  "In Progress": "in_progress",
  Resolved: "resolved",
};

interface ComplaintData {
  _id?: string;
  id?: string;
  complaintId?: string;
  title: string;
  description?: string;
  department?: { _id: string; name: string } | string;
  assignedOfficer?: { _id: string; name: string; email?: string } | string;
  status: string;
  priority?: string;
  filedBy?: string;
  filedDate?: string;
  lastUpdated?: string;
  createdAt?: string;
  updatedAt?: string;
  timeline?: any[];
}

interface Props {
  complaint: ComplaintData;
  linkPrefix?: string;
}

const ComplaintCard = ({ complaint, linkPrefix = "/user" }: Props) => {
  const displayId = complaint.complaintId || complaint.id || complaint._id;
  const departmentName =
    typeof complaint.department === "object" && complaint.department
      ? complaint.department.name
      : complaint.department || "Unassigned";
  const officerName =
    typeof complaint.assignedOfficer === "object" && complaint.assignedOfficer
      ? complaint.assignedOfficer.name
      : complaint.assignedOfficer || "Unassigned";
  const lastUpdated = complaint.updatedAt
    ? new Date(complaint.updatedAt).toLocaleDateString()
    : complaint.lastUpdated || "";
  const trackerStatus = statusToTracker[complaint.status] || complaint.status;

  return (
    <Link to={`${linkPrefix}/complaint/${displayId}`} className="block">
      <div className="bg-card rounded-lg border shadow-sm hover:shadow-md transition-shadow p-5">
        <div className="flex flex-wrap items-start justify-between gap-2 mb-3">
          <div>
            <p className="text-xs font-mono text-muted-foreground">{displayId}</p>
            <h3 className="font-semibold text-card-foreground mt-0.5">{complaint.title}</h3>
          </div>
          <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusColor[complaint.status] || "bg-muted text-muted-foreground"}`}>
            {statusLabel[complaint.status] || complaint.status}
          </span>
        </div>

        <div className="flex flex-wrap gap-4 text-xs text-muted-foreground mb-4">
          <span className="flex items-center gap-1"><Building2 className="h-3 w-3" />{departmentName}</span>
          <span className="flex items-center gap-1"><User className="h-3 w-3" />{officerName}</span>
          <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{lastUpdated}</span>
        </div>

        <ProgressTracker status={trackerStatus} />
      </div>
    </Link>
  );
};

export default ComplaintCard;
