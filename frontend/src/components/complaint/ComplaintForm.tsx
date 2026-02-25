import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAuthHeaders } from "@/context/AuthContext";

interface DepartmentOption {
  _id: string;
  name: string;
}

const ComplaintForm = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ title: "", department: "", priority: "Medium", description: "" });
  const [departments, setDepartments] = useState<DepartmentOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const res = await fetch("/api/complaints/departments", { headers: getAuthHeaders() });
        if (res.ok) {
          const data = await res.json();
          setDepartments(data);
        }
      } catch {
        // If departments fail to load, they just won't show
      }
    };
    fetchDepartments();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/complaints", {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          title: form.title,
          description: form.description,
          priority: form.priority,
          department: form.department,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to submit complaint");
      }

      navigate("/user/my-complaints");
    } catch (err: any) {
      setError(err.message || "Failed to submit complaint");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-card rounded-lg border shadow-sm p-6 max-w-2xl space-y-5">
      {error && (
        <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">{error}</div>
      )}
      <div>
        <label className="block text-sm font-medium text-card-foreground mb-1">Complaint Title</label>
        <input
          required
          className="w-full border rounded-md px-3 py-2 text-sm bg-background text-foreground focus:ring-2 focus:ring-ring focus:outline-none"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          placeholder="Brief title of your complaint"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-card-foreground mb-1">Department</label>
          <select
            required
            className="w-full border rounded-md px-3 py-2 text-sm bg-background text-foreground focus:ring-2 focus:ring-ring focus:outline-none"
            value={form.department}
            onChange={(e) => setForm({ ...form, department: e.target.value })}
          >
            <option value="">Select Department</option>
            {departments.map((d) => (
              <option key={d._id} value={d.name}>{d.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-card-foreground mb-1">Priority</label>
          <select
            className="w-full border rounded-md px-3 py-2 text-sm bg-background text-foreground focus:ring-2 focus:ring-ring focus:outline-none"
            value={form.priority}
            onChange={(e) => setForm({ ...form, priority: e.target.value })}
          >
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-card-foreground mb-1">Description</label>
        <textarea
          required
          rows={5}
          className="w-full border rounded-md px-3 py-2 text-sm bg-background text-foreground focus:ring-2 focus:ring-ring focus:outline-none resize-none"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          placeholder="Provide detailed description of the issue"
        />
      </div>

      <button type="submit" disabled={loading} className="bg-primary text-primary-foreground px-6 py-2.5 rounded-md text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50">
        {loading ? "Submitting..." : "Submit Complaint"}
      </button>
    </form>
  );
};

export default ComplaintForm;
