import { useState, useEffect } from "react";
import { getAuthHeaders } from "@/context/AuthContext";

const ManageDepartments = () => {
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newDept, setNewDept] = useState({ name: "", description: "" });
  const [showForm, setShowForm] = useState(false);

  const fetchDepartments = async () => {
    try {
      const res = await fetch("/api/admin/departments", { headers: getAuthHeaders() });
      if (res.ok) setDepartments(await res.json());
    } catch (err) {
      console.error("Failed to fetch departments:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDepartments(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/admin/departments", {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(newDept),
      });
      if (res.ok) {
        setNewDept({ name: "", description: "" });
        setShowForm(false);
        fetchDepartments();
      }
    } catch (err) {
      console.error("Failed to create department:", err);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground mb-1">Manage Departments</h1>
          <p className="text-muted-foreground text-sm">View and manage all departments</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium hover:opacity-90 transition-opacity"
        >
          {showForm ? "Cancel" : "+ Add Department"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="bg-card rounded-lg border shadow-sm p-4 mb-6 flex gap-3 items-end">
          <div className="flex-1">
            <label className="block text-xs font-medium text-muted-foreground mb-1">Name</label>
            <input required className="w-full border rounded-md px-3 py-2 text-sm bg-background" value={newDept.name} onChange={e => setNewDept({ ...newDept, name: e.target.value })} placeholder="Department name" />
          </div>
          <div className="flex-1">
            <label className="block text-xs font-medium text-muted-foreground mb-1">Description</label>
            <input className="w-full border rounded-md px-3 py-2 text-sm bg-background" value={newDept.description} onChange={e => setNewDept({ ...newDept, description: e.target.value })} placeholder="Description" />
          </div>
          <button type="submit" className="bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium hover:opacity-90">Create</button>
        </form>
      )}

      {loading ? (
        <div className="text-center py-10 text-muted-foreground">Loading departments...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted">
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">#</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Department</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Head</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Employees</th>
              </tr>
            </thead>
            <tbody>
              {departments.map((d, i) => (
                <tr key={d._id} className="border-b hover:bg-muted/50 transition-colors">
                  <td className="py-3 px-4 font-mono text-xs">{i + 1}</td>
                  <td className="py-3 px-4 font-medium text-foreground">{d.name}</td>
                  <td className="py-3 px-4 text-muted-foreground">{d.head?.name || "Not assigned"}</td>
                  <td className="py-3 px-4 text-muted-foreground">{d.employees?.length || 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ManageDepartments;
