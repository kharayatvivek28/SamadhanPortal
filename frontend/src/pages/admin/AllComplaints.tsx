import { useState, useEffect } from "react";
import { getAuthHeaders } from "@/context/AuthContext";

const statusLabel: Record<string, string> = {
  Pending: "Submitted",
  Assigned: "Dept. Assigned",
  "In Progress": "In Progress",
  Resolved: "Resolved",
};
const statusColor: Record<string, string> = {
  Pending: "bg-muted text-muted-foreground",
  Assigned: "bg-secondary text-secondary-foreground",
  "In Progress": "bg-status-progress/20 text-foreground",
  Resolved: "bg-status-resolved/20 text-foreground",
};

const AllComplaints = () => {
  const [complaints, setComplaints] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const headers = getAuthHeaders();
        const [cRes, dRes, eRes] = await Promise.all([
          fetch("/api/admin/complaints", { headers }),
          fetch("/api/admin/departments", { headers }),
          fetch("/api/admin/employees", { headers }),
        ]);
        if (cRes.ok) setComplaints(await cRes.json());
        if (dRes.ok) setDepartments(await dRes.json());
        if (eRes.ok) setEmployees(await eRes.json());
      } catch (err) {
        console.error("Failed to fetch data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleAssignDepartment = async (complaintId: string, departmentId: string) => {
    try {
      const res = await fetch(`/api/admin/assign-department/${complaintId}`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify({ departmentId }),
      });
      if (res.ok) {
        const updated = await res.json();
        setComplaints(complaints.map(c => c.complaintId === complaintId ? updated : c));
      }
    } catch (err) {
      console.error("Failed to assign department:", err);
    }
  };

  const handleAssignOfficer = async (complaintId: string, officerId: string) => {
    try {
      const res = await fetch(`/api/admin/assign-officer/${complaintId}`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify({ officerId }),
      });
      if (res.ok) {
        const updated = await res.json();
        setComplaints(complaints.map(c => c.complaintId === complaintId ? updated : c));
      }
    } catch (err) {
      console.error("Failed to assign officer:", err);
    }
  };

  if (loading) {
    return <div className="text-center py-10 text-muted-foreground">Loading complaints...</div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground mb-1">All Complaints</h1>
      <p className="text-muted-foreground text-sm mb-6">Manage and assign complaints</p>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted">
              <th className="text-left py-3 px-4 font-medium text-muted-foreground">ID</th>
              <th className="text-left py-3 px-4 font-medium text-muted-foreground">Title</th>
              <th className="text-left py-3 px-4 font-medium text-muted-foreground">Status</th>
              <th className="text-left py-3 px-4 font-medium text-muted-foreground">Department</th>
              <th className="text-left py-3 px-4 font-medium text-muted-foreground">Officer</th>
            </tr>
          </thead>
          <tbody>
            {complaints.map((c) => (
              <tr key={c._id} className="border-b hover:bg-muted/50 transition-colors">
                <td className="py-3 px-4 font-mono text-xs">{c.complaintId}</td>
                <td className="py-3 px-4 font-medium text-foreground">{c.title}</td>
                <td className="py-3 px-4">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${statusColor[c.status] || "bg-muted text-muted-foreground"}`}>
                    {statusLabel[c.status] || c.status}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <select
                    className="border rounded px-2 py-1 text-xs bg-background"
                    value={c.department?._id || ""}
                    onChange={(e) => handleAssignDepartment(c.complaintId, e.target.value)}
                  >
                    <option value="">Select Department</option>
                    {departments.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
                  </select>
                </td>
                <td className="py-3 px-4">
                  <select
                    className="border rounded px-2 py-1 text-xs bg-background"
                    value={c.assignedOfficer?._id || ""}
                    onChange={(e) => handleAssignOfficer(c.complaintId, e.target.value)}
                  >
                    <option value="">Select Officer</option>
                    {employees.map(emp => <option key={emp._id} value={emp._id}>{emp.name}</option>)}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AllComplaints;
