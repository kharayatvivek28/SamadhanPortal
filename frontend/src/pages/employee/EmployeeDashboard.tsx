import { useState, useEffect } from "react";
import { getAuthHeaders } from "@/context/AuthContext";
import StatsCard from "@/components/analytics/StatsCard";
import ComplaintCard from "@/components/complaint/ComplaintCard";
import { FileText, CheckCircle2, Clock } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const EmployeeDashboard = () => {
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
    <div>
      <h1 className="text-2xl font-bold text-foreground mb-1">Welcome, {user?.name}</h1>
      <p className="text-muted-foreground text-sm mb-6">Employee Dashboard — Manage assigned complaints</p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <StatsCard title="Assigned" value={assigned.length} icon={FileText} />
        <StatsCard title="In Progress" value={assigned.filter(c => c.status === "In Progress").length} icon={Clock} />
        <StatsCard title="Resolved" value={complaints.filter(c => c.status === "Resolved").length} icon={CheckCircle2} />
      </div>

      <h2 className="text-lg font-semibold text-foreground mb-4">Assigned Complaints</h2>

      {loading ? (
        <div className="text-center py-10 text-muted-foreground">Loading...</div>
      ) : assigned.length === 0 ? (
        <div className="text-center py-10 text-muted-foreground">No active complaints assigned to you.</div>
      ) : (
        <div className="space-y-4">
          {assigned.map((c) => (
            <ComplaintCard key={c._id} complaint={c} linkPrefix="/employee" />
          ))}
        </div>
      )}
    </div>
  );
};

export default EmployeeDashboard;
