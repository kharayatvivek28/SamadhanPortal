import { useState, useEffect } from "react";
import { getAuthHeaders } from "@/context/AuthContext";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
// Animation: Added framer-motion for form toggle, table row stagger, and button interactions
import { motion, AnimatePresence } from "framer-motion";
import PageTransition from "@/components/motion/PageTransition";
import SkeletonCard from "@/components/ui/skeleton-card";
import { Eye, EyeOff } from "lucide-react";

const ManageEmployees = () => {
  const { t } = useTranslation();
  const [employees, setEmployees] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", email: "", password: "", departmentId: "", role: "employee" });
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

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

  const filteredEmployees = employees.filter((emp) => {
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch =
      emp.name?.toLowerCase().includes(searchLower) ||
      emp.email?.toLowerCase().includes(searchLower) ||
      emp.department?.name?.toLowerCase().includes(searchLower);
    const matchesDepartment =
      !departmentFilter ||
      (departmentFilter === "__unassigned__"
        ? !emp.department
        : emp.department?._id === departmentFilter);
    return matchesSearch && matchesDepartment;
  });

  const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage);
  const paginatedEmployees = filteredEmployees.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Reset to first page when search or department filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, departmentFilter]);

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
    if (!confirm(`${t("common.confirmDelete")} ${name}?`)) return;
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
    // Animation: Page entrance fade + slide
    <PageTransition>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground mb-1">{t("manageEmployees.title")}</h1>
          <p className="text-muted-foreground text-sm">{t("manageEmployees.subtitle")}</p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
          <input
            type="text"
            placeholder={t("manageEmployees.searchPlaceholder")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="border rounded-md px-3 py-2 text-sm bg-background w-full sm:w-48 focus:ring-2 focus:ring-primary focus:outline-none"
          />
          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className="border rounded-md px-3 py-2 text-sm bg-background w-full sm:w-48 focus:ring-2 focus:ring-primary focus:outline-none"
          >
            <option value="">{t("manageEmployees.allDepartments")}</option>
            <option value="__unassigned__">— {t("manageEmployees.noDepartment")} —</option>
            {departments.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
          </select>
          {/* Animation: Button with tap scale effect */}
          <motion.button
            onClick={() => { if (showForm) resetForm(); else setShowForm(true); }}
            className="bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium hover:opacity-90 transition-opacity whitespace-nowrap"
            whileTap={{ scale: 0.97 }}
          >
            {showForm ? t("manageEmployees.cancel") : t("manageEmployees.addEmployee")}
          </motion.button>
        </div>
      </div>

      {/* Animation: Collapsible form with slide-down entrance */}
      <AnimatePresence>
        {showForm && (
          <motion.form
            onSubmit={handleSubmit}
            className="bg-card rounded-lg border shadow-sm p-5 mb-6 overflow-hidden"
            initial={{ height: 0, opacity: 0, marginBottom: 0 }}
            animate={{ height: "auto", opacity: 1, marginBottom: 24 }}
            exit={{ height: 0, opacity: 0, marginBottom: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <h3 className="font-semibold text-card-foreground mb-3">{editingId ? t("manageEmployees.editEmployee") : t("manageEmployees.newEmployee")}</h3>
            {/* Animation: Error alert with fade-in */}
            <AnimatePresence>
              {error && (
                <motion.div
                  className="bg-destructive/10 text-destructive text-sm p-2 rounded-md mb-3"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">{t("manageEmployees.name")}</label>
                <input required className="w-full border rounded-md px-3 py-2 text-sm bg-background" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder={t("manageEmployees.name")} />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">{t("manageEmployees.email")}</label>
                <input required type="email" className="w-full border rounded-md px-3 py-2 text-sm bg-background" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="email@example.com" />
              </div>
              {!editingId && (
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">{t("manageEmployees.password")}</label>
                  <div className="relative">
                    <input required type={showPassword ? "text" : "password"} className="w-full border rounded-md px-3 py-2 text-sm bg-background pr-10" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} placeholder="••••••••" />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              )}
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">{t("manageEmployees.department")}</label>
                <select className="w-full border rounded-md px-3 py-2 text-sm bg-background" value={form.departmentId} onChange={e => setForm({ ...form, departmentId: e.target.value })}>
                  <option value="">{t("manageEmployees.noDepartment")}</option>
                  {departments.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
                </select>
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <motion.button type="submit" className="bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium hover:opacity-90" whileTap={{ scale: 0.97 }}>
                {editingId ? t("manageEmployees.updateEmployee") : t("manageEmployees.createEmployee")}
              </motion.button>
              {editingId && (
                <motion.button type="button" onClick={resetForm} className="border px-4 py-2 rounded-md text-sm font-medium hover:bg-muted" whileTap={{ scale: 0.97 }}>{t("manageEmployees.cancelEdit")}</motion.button>
              )}
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <SkeletonCard key={i} variant="default" />
          ))}
        </div>
      ) : employees.length === 0 ? (
        <div className="text-center py-10 text-muted-foreground">{t("manageEmployees.noEmployees")}</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted">
                <th className="text-left py-3 px-4 font-medium text-muted-foreground whitespace-nowrap">#</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground whitespace-nowrap">{t("manageEmployees.name")}</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground whitespace-nowrap">{t("manageEmployees.email")}</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground whitespace-nowrap">{t("manageEmployees.department")}</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground whitespace-nowrap">{t("manageEmployees.active")}</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground whitespace-nowrap">{t("manageEmployees.actions")}</th>
              </tr>
            </thead>
            <tbody>
              {/* Animation: Stagger table rows on mount */}
              {paginatedEmployees.map((e, i) => (
                <motion.tr
                  key={e._id}
                  className="border-b hover:bg-muted/50 transition-colors"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: i * 0.05, ease: "easeOut" }}
                >
                  <td className="py-3 px-4 whitespace-nowrap font-mono text-xs">{(currentPage - 1) * itemsPerPage + i + 1}</td>
                  <td className="py-3 px-4 whitespace-nowrap font-medium text-foreground">{e.name}</td>
                  <td className="py-3 px-4 whitespace-nowrap text-muted-foreground">{e.email}</td>
                  <td className="py-3 px-4 whitespace-nowrap text-muted-foreground">{e.department?.name || t("complaintDetails.unassigned")}</td>
                  <td className="py-3 px-4 whitespace-nowrap text-muted-foreground">{e.activeComplaints || 0}</td>
                  <td className="py-3 px-4">
                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 items-start sm:items-center">
                      <Link to={`/admin/employees/${e._id}`} className="text-xs text-secondary-foreground hover:text-primary transition-colors font-medium">{t("manageEmployees.viewDetails")}</Link>
                      <button onClick={() => handleEdit(e)} className="text-xs text-primary hover:underline font-medium">{t("manageEmployees.edit")}</button>
                      <button onClick={() => handleDelete(e._id, e.name)} className="text-xs text-destructive hover:underline font-medium">{t("manageEmployees.delete")}</button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
          
          {totalPages > 1 && (
            <div className="flex justify-between items-center px-4 py-3 bg-card border-t">
              <span className="text-sm text-muted-foreground">
                {t("manageEmployees.showing")} {filteredEmployees.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1} {t("manageEmployees.to")} {Math.min(currentPage * itemsPerPage, filteredEmployees.length)} {t("manageEmployees.of")} {filteredEmployees.length} {t("manageEmployees.entries")}
              </span>
              <div className="flex space-x-2">
                <motion.button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 text-sm bg-muted rounded disabled:opacity-50 hover:bg-secondary"
                  whileTap={{ scale: 0.95 }}
                >
                  {t("manageEmployees.previous")}
                </motion.button>
                <div className="flex space-x-1">
                  {Array.from({ length: totalPages }).map((_, idx) => (
                    <motion.button
                      key={idx}
                      onClick={() => setCurrentPage(idx + 1)}
                      className={`px-3 py-1 text-sm rounded ${currentPage === idx + 1 ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-secondary'}`}
                      whileTap={{ scale: 0.95 }}
                    >
                      {idx + 1}
                    </motion.button>
                  ))}
                </div>
                <motion.button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 text-sm bg-muted rounded disabled:opacity-50 hover:bg-secondary"
                  whileTap={{ scale: 0.95 }}
                >
                  {t("manageEmployees.next")}
                </motion.button>
              </div>
            </div>
          )}
        </div>
      )}
    </PageTransition>
  );
};

export default ManageEmployees;
