import { useState, useEffect } from "react";
import { getAuthHeaders } from "@/context/AuthContext";
import ComplaintCard from "@/components/complaint/ComplaintCard";

const MyComplaints = () => {
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

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground mb-1">My Complaints</h1>
      <p className="text-muted-foreground text-sm mb-6">View all complaints you have filed</p>

      {loading ? (
        <div className="text-center py-10 text-muted-foreground">Loading complaints...</div>
      ) : complaints.length === 0 ? (
        <div className="text-center py-10 text-muted-foreground">No complaints filed yet.</div>
      ) : (
        <div className="space-y-4">
          {complaints.map((c) => (
            <ComplaintCard key={c._id} complaint={c} linkPrefix="/user" />
          ))}
        </div>
      )}
    </div>
  );
};

export default MyComplaints;
