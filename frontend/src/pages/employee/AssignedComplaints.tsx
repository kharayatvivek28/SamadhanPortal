import { useState, useEffect } from "react";
import { getAuthHeaders } from "@/context/AuthContext";

const statusOptions = ["Pending", "Assigned", "In Progress", "Resolved"];
const statusLabel: Record<string, string> = {
  Pending: "Submitted",
  Assigned: "Dept. Assigned",
  "In Progress": "In Progress",
  Resolved: "Resolved",
};

const AssignedComplaints = () => {
  const [complaints, setComplaints] = useState<any[]>([]);
  const [statuses, setStatuses] = useState<Record<string, string>>({});
  const [remarks, setRemarks] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);

  useEffect(() => {
    const fetchAssigned = async () => {
      try {
        const res = await fetch("/api/employee/assigned", { headers: getAuthHeaders() });
        if (res.ok) {
          const data = await res.json();
          setComplaints(data);
          setStatuses(Object.fromEntries(data.map((c: any) => [c.complaintId, c.status])));
        }
      } catch (err) {
        console.error("Failed to fetch assigned complaints:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAssigned();
  }, []);

  const handleSave = async (complaintId: string) => {
    setSaving(complaintId);
    try {
      const headers = getAuthHeaders();

      // Update status if changed
      const complaint = complaints.find(c => c.complaintId === complaintId);
      if (complaint && statuses[complaintId] !== complaint.status) {
        await fetch(`/api/employee/update-status/${complaintId}`, {
          method: "PUT",
          headers,
          body: JSON.stringify({
            status: statuses[complaintId],
            message: remarks[complaintId] || `Status updated to ${statuses[complaintId]}`,
          }),
        });
      } else if (remarks[complaintId]) {
        // Just add remark
        await fetch(`/api/employee/add-remark/${complaintId}`, {
          method: "POST",
          headers,
          body: JSON.stringify({ message: remarks[complaintId] }),
        });
      }

      // Refresh data
      const res = await fetch("/api/employee/assigned", { headers });
      if (res.ok) {
        const data = await res.json();
        setComplaints(data);
        setStatuses(Object.fromEntries(data.map((c: any) => [c.complaintId, c.status])));
        setRemarks({ ...remarks, [complaintId]: "" });
      }
    } catch (err) {
      console.error("Failed to update complaint:", err);
    } finally {
      setSaving(null);
    }
  };

  if (loading) {
    return <div className="text-center py-10 text-muted-foreground">Loading assigned complaints...</div>;
  }

  const active = complaints.filter(c => c.status !== "Resolved");

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground mb-1">Assigned Complaints</h1>
      <p className="text-muted-foreground text-sm mb-6">Update status and add remarks</p>

      {active.length === 0 ? (
        <div className="text-center py-10 text-muted-foreground">No active complaints assigned to you.</div>
      ) : (
        <div className="space-y-4">
          {active.map((c) => (
            <div key={c._id} className="bg-card rounded-lg border shadow-sm p-5">
              <div className="flex flex-wrap items-start justify-between gap-2 mb-3">
                <div>
                  <p className="text-xs font-mono text-muted-foreground">{c.complaintId}</p>
                  <h3 className="font-semibold text-card-foreground">{c.title}</h3>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-4">{c.description?.substring(0, 120)}...</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">Update Status</label>
                  <select
                    className="w-full border rounded-md px-3 py-2 text-sm bg-background text-foreground"
                    value={statuses[c.complaintId] || c.status}
                    onChange={(e) => setStatuses({ ...statuses, [c.complaintId]: e.target.value })}
                  >
                    {statusOptions.map(s => <option key={s} value={s}>{statusLabel[s] || s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">Add Remarks</label>
                  <input
                    className="w-full border rounded-md px-3 py-2 text-sm bg-background text-foreground"
                    placeholder="Enter remarks..."
                    value={remarks[c.complaintId] || ""}
                    onChange={(e) => setRemarks({ ...remarks, [c.complaintId]: e.target.value })}
                  />
                </div>
              </div>

              <button
                className="mt-3 bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
                onClick={() => handleSave(c.complaintId)}
                disabled={saving === c.complaintId}
              >
                {saving === c.complaintId ? "Saving..." : "Save Changes"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AssignedComplaints;
