import { useState, useEffect } from "react";
import { getAuthHeaders } from "@/context/AuthContext";

const ManageEmployees = () => {
  const [employees, setEmployees] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", email: "", password: "", departmentId: "", role: "employee" });
  const [error, setError] = useState("");

  const fetchData = async () => {
    try {
      const headers = getAuthHeaders();
      const [eRes, dRes] = await Promise.all([
        fetch("/api/admin/users?role=employee", { headers }),
        fetch("/api/admin/departments", { headers }),
      ]);
      if (eRes.ok) setEmployees(await eRes.json());
      if (dRes.ok) setDepartments(await dRes.json());
    } catch (err) {
      console.error("Failed to fetch data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const resetForm = () => {
    setForm({ name: "", email: "", password: "", departmentId: "", role: "employee" });
    setEditingId(null);
    setShowForm(false);
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      const headers = getAuthHeaders();
      const isEditing = !!editingId;

      const body: any = {
        name: form.name,
        email: form.email,
        role: form.role,
        departmentId: form.departmentId || null,
      };
      if (!isEditing) body.password = form.password;

      const res = await fetch(
        isEditing ? `/api/admin/users/${editingId}` : "/api/admin/users",
        {
          method: isEditing ? "PUT" : "POST",
          headers,
          body: JSON.stringify(body),
        }
      );

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Operation failed");
      }

      resetForm();
      fetchData();
    } catch (err: any) {
      setError(err.message || "Failed to save employee");
    }
  };

  const handleEdit = (emp: any) => {
    setForm({
      name: emp.name,
      email: emp.email,
      password: "",
      departmentId: emp.department?._id || "",
      role: emp.role || "employee",
    });
    setEditingId(emp._id);
    setShowForm(true);
    setError("");
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete ${name}?`)) return;
    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        fetchData();
      } else {
        const data = await res.json();
        alert(data.message || "Failed to delete");
      }
    } catch (err) {
      console.error("Failed to delete user:", err);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground mb-1">Manage Employees</h1>
          <p className="text-muted-foreground text-sm">Create, edit, and manage employee accounts</p>
        </div>
        <button
          onClick={() => { if (showForm) resetForm(); else setShowForm(true); }}
          className="bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium hover:opacity-90 transition-opacity"
        >
          {showForm ? "Cancel" : "+ Add Employee"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-card rounded-lg border shadow-sm p-5 mb-6">
          <h3 className="font-semibold text-card-foreground mb-3">{editingId ? "Edit Employee" : "New Employee"}</h3>
          {error && <div className="bg-destructive/10 text-destructive text-sm p-2 rounded-md mb-3">{error}</div>}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Name</label>
              <input required className="w-full border rounded-md px-3 py-2 text-sm bg-background" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Full name" />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Email</label>
              <input required type="email" className="w-full border rounded-md px-3 py-2 text-sm bg-background" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="email@example.com" />
            </div>
            {!editingId && (
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Password</label>
                <input required type="password" className="w-full border rounded-md px-3 py-2 text-sm bg-background" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} placeholder="••••••••" />
              </div>
            )}
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Department</label>
              <select className="w-full border rounded-md px-3 py-2 text-sm bg-background" value={form.departmentId} onChange={e => setForm({ ...form, departmentId: e.target.value })}>
                <option value="">No Department</option>
                {departments.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
              </select>
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button type="submit" className="bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium hover:opacity-90">
              {editingId ? "Update" : "Create"} Employee
            </button>
            {editingId && (
              <button type="button" onClick={resetForm} className="border px-4 py-2 rounded-md text-sm font-medium hover:bg-muted">Cancel Edit</button>
            )}
          </div>
        </form>
      )}

      {loading ? (
        <div className="text-center py-10 text-muted-foreground">Loading employees...</div>
      ) : employees.length === 0 ? (
        <div className="text-center py-10 text-muted-foreground">No employees yet. Add your first employee above.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted">
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">#</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Name</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Email</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Department</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Active</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((e, i) => (
                <tr key={e._id} className="border-b hover:bg-muted/50 transition-colors">
                  <td className="py-3 px-4 font-mono text-xs">{i + 1}</td>
                  <td className="py-3 px-4 font-medium text-foreground">{e.name}</td>
                  <td className="py-3 px-4 text-muted-foreground">{e.email}</td>
                  <td className="py-3 px-4 text-muted-foreground">{e.department?.name || "Unassigned"}</td>
                  <td className="py-3 px-4 text-muted-foreground">{e.activeComplaints || 0}</td>
                  <td className="py-3 px-4">
                    <div className="flex gap-2">
                      <button onClick={() => handleEdit(e)} className="text-xs text-primary hover:underline font-medium">Edit</button>
                      <button onClick={() => handleDelete(e._id, e.name)} className="text-xs text-destructive hover:underline font-medium">Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ManageEmployees;
