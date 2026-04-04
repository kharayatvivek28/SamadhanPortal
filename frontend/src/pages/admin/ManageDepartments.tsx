import { useState, useEffect } from "react";
import { getAuthHeaders } from "@/context/AuthContext";
import { useTranslation } from "react-i18next";
// Animation: Added framer-motion for form toggle and table row animations
import { motion, AnimatePresence } from "framer-motion";
import PageTransition from "@/components/motion/PageTransition";
import SkeletonCard from "@/components/ui/skeleton-card";

const ManageDepartments = () => {
  const { t } = useTranslation();
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
    // Animation: Page entrance fade + slide
    <PageTransition>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground mb-1">{t("manageDepartments.title")}</h1>
          <p className="text-muted-foreground text-sm">{t("manageDepartments.subtitle")}</p>
        </div>
        {/* Animation: Button with tap scale effect */}
        <motion.button
          onClick={() => setShowForm(!showForm)}
          className="bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium hover:opacity-90 transition-opacity w-full sm:w-auto"
          whileTap={{ scale: 0.97 }}
        >
          {showForm ? t("manageDepartments.cancel") : t("manageDepartments.addDepartment")}
        </motion.button>
      </div>

      {/* Animation: Collapsible form with slide-down entrance */}
      <AnimatePresence>
        {showForm && (
          <motion.form
            onSubmit={handleCreate}
            className="bg-card rounded-lg border shadow-sm p-4 mb-6 flex flex-col sm:flex-row gap-3 sm:items-end overflow-hidden"
            initial={{ height: 0, opacity: 0, marginBottom: 0 }}
            animate={{ height: "auto", opacity: 1, marginBottom: 24 }}
            exit={{ height: 0, opacity: 0, marginBottom: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <div className="flex-1">
              <label className="block text-xs font-medium text-muted-foreground mb-1">{t("manageDepartments.name")}</label>
              <input required className="w-full border rounded-md px-3 py-2 text-sm bg-background" value={newDept.name} onChange={e => setNewDept({ ...newDept, name: e.target.value })} placeholder={t("manageDepartments.namePlaceholder")} />
            </div>
            <div className="flex-1">
              <label className="block text-xs font-medium text-muted-foreground mb-1">{t("manageDepartments.description")}</label>
              <input className="w-full border rounded-md px-3 py-2 text-sm bg-background" value={newDept.description} onChange={e => setNewDept({ ...newDept, description: e.target.value })} placeholder={t("manageDepartments.descriptionPlaceholder")} />
            </div>
            <motion.button type="submit" className="bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium hover:opacity-90" whileTap={{ scale: 0.97 }}>{t("manageDepartments.create")}</motion.button>
          </motion.form>
        )}
      </AnimatePresence>

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <SkeletonCard key={i} variant="default" />
          ))}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted">
                <th className="text-left py-3 px-4 font-medium text-muted-foreground whitespace-nowrap">#</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground whitespace-nowrap">{t("manageDepartments.department")}</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground whitespace-nowrap">{t("manageDepartments.head")}</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground whitespace-nowrap">{t("manageDepartments.employees")}</th>
              </tr>
            </thead>
            <tbody>
              {/* Animation: Stagger table rows on mount */}
              {departments.map((d, i) => (
                <motion.tr
                  key={d._id}
                  className="border-b hover:bg-muted/50 transition-colors"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: i * 0.05, ease: "easeOut" }}
                >
                  <td className="py-3 px-4 whitespace-nowrap font-mono text-xs">{i + 1}</td>
                  <td className="py-3 px-4 whitespace-nowrap font-medium text-foreground">{d.name}</td>
                  <td className="py-3 px-4 whitespace-nowrap text-muted-foreground">{d.head?.name || t("manageDepartments.notAssigned")}</td>
                  <td className="py-3 px-4 whitespace-nowrap text-muted-foreground">{d.employees?.length || 0}</td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </PageTransition>
  );
};

export default ManageDepartments;
