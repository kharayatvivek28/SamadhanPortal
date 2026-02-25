import { useState, useEffect } from "react";
import { getAuthHeaders } from "@/context/AuthContext";
import StatsCard from "@/components/analytics/StatsCard";
import ComplaintCard from "@/components/complaint/ComplaintCard";
import { FileText, CheckCircle2, Clock, AlertTriangle } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

const UserDashboard = () => {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        const res = await fetch("/api/complaints/my", { headers: getAuthHeaders() });
        if (res.ok) {
          const data = await res.json();
          setComplaints(data);
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
    <div>
      <h1 className="text-2xl font-bold text-foreground mb-1">Welcome, {user?.name}</h1>
      <p className="text-muted-foreground text-sm mb-6">Citizen Dashboard — File and track your complaints</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatsCard title="Total Complaints" value={complaints.length} icon={FileText} />
        <StatsCard title="Resolved" value={complaints.filter(c => c.status === "Resolved").length} icon={CheckCircle2} />
        <StatsCard title="In Progress" value={complaints.filter(c => c.status === "In Progress").length} icon={Clock} />
        <StatsCard title="Pending" value={complaints.filter(c => !["Resolved", "In Progress"].includes(c.status)).length} icon={AlertTriangle} />
      </div>

      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-foreground">Recent Complaints</h2>
        <Link to="/user/my-complaints" className="text-sm text-primary font-medium hover:underline">View All</Link>
      </div>

      {loading ? (
        <div className="text-center py-10 text-muted-foreground">Loading...</div>
      ) : recent.length === 0 ? (
        <div className="text-center py-10 text-muted-foreground">No complaints yet. <Link to="/user/file-complaint" className="text-primary hover:underline">File your first complaint</Link></div>
      ) : (
        <div className="space-y-4">
          {recent.map((c) => (
            <ComplaintCard key={c._id} complaint={c} linkPrefix="/user" />
          ))}
        </div>
      )}
    </div>
  );
};

export default UserDashboard;
