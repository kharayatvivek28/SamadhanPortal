import { useState, useEffect } from "react";
import { getAuthHeaders } from "@/context/AuthContext";
import StatsCard from "@/components/analytics/StatsCard";
import ComplaintCard from "@/components/complaint/ComplaintCard";
import { FileText, CheckCircle2, Clock, Building2 } from "lucide-react";
import { Link } from "react-router-dom";

const AdminDashboard = () => {
  const [stats, setStats] = useState({ totalComplaints: 0, resolved: 0, inProgress: 0, pending: 0, activeDepartments: 0 });
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
    <div>
      <h1 className="text-2xl font-bold text-foreground mb-1">Admin Dashboard</h1>
      <p className="text-muted-foreground text-sm mb-6">System overview and management</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatsCard title="Total Complaints" value={stats.totalComplaints} icon={FileText} />
        <StatsCard title="Resolved" value={stats.resolved} icon={CheckCircle2} />
        <StatsCard title="In Progress" value={stats.inProgress} icon={Clock} />
        <StatsCard title="Departments" value={stats.activeDepartments} icon={Building2} />
      </div>

      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-foreground">Recent Complaints</h2>
        <Link to="/admin/complaints" className="text-sm text-primary font-medium hover:underline">View All</Link>
      </div>

      {loading ? (
        <div className="text-center py-10 text-muted-foreground">Loading...</div>
      ) : (
        <div className="space-y-4">
          {complaints.slice(0, 3).map((c) => (
            <ComplaintCard key={c._id} complaint={c} linkPrefix="/admin" />
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
