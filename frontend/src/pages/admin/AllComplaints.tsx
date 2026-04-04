import { useState, useEffect, useCallback } from "react";
import { getAuthHeaders } from "@/context/AuthContext";
import { useTranslation } from "react-i18next";
import FilterBar from "@/components/complaint/FilterBar";
import EmptyState from "@/components/ui/empty-state";
import PageTransition from "@/components/motion/PageTransition";
import { motion } from "framer-motion";

const statusColor: Record<string, string> = {
  Pending: "bg-muted text-muted-foreground",
  Assigned: "bg-secondary text-secondary-foreground",
  "In Progress": "bg-status-progress/20 text-foreground",
  Resolved: "bg-status-resolved/20 text-foreground",
};

const AllComplaints = () => {
  const { t } = useTranslation();

  const statusLabel: Record<string, string> = {
    Pending: t("assignedComplaints.submitted"),
    Assigned: t("assignedComplaints.deptAssigned"),
    "In Progress": t("assignedComplaints.inProgress"),
    Resolved: t("assignedComplaints.resolved"),
  };

  const initialFilters = [
    { label: t("allComplaints.all"), value: "all", active: true },
    { label: t("allComplaints.pending"), value: "Pending", active: false },
    { label: t("allComplaints.assigned"), value: "Assigned", active: false },
    { label: t("allComplaints.inProgress"), value: "In Progress", active: false },
    { label: t("allComplaints.resolved"), value: "Resolved", active: false },
  ];

  const [complaints, setComplaints] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<any>({});

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const headers = getAuthHeaders();
        const activeFilters = Object.fromEntries(Object.entries(filters).filter(([_, v]) => v !== ""));
        const queryParams = new URLSearchParams(activeFilters as Record<string, string>).toString();

        const [cRes, dRes, eRes] = await Promise.all([
          fetch(`/api/admin/complaints?${queryParams}`, { headers }),
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
  }, [filters]);

  const filteredComplaints = complaints;

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

  return (
    <PageTransition>
      <h1 className="text-2xl font-bold text-foreground mb-1">{t("allComplaints.title")}</h1>
      <p className="text-muted-foreground text-sm mb-6">{t("allComplaints.subtitle")}</p>

      <FilterBar onFilterChange={setFilters} />

      {loading ? (
        <div className="text-center py-10 text-muted-foreground">{t("allComplaints.loading")}</div>
      ) : filteredComplaints.length === 0 ? (
        <EmptyState
          variant="no-results"
          title={t("allComplaints.noResults")}
          description={t("allComplaints.noResultsDesc")}
        />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted">
                <th className="text-left py-3 px-4 font-medium text-muted-foreground whitespace-nowrap">{t("allComplaints.id")}</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground whitespace-nowrap">{t("allComplaints.complaintTitle")}</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground whitespace-nowrap">{t("allComplaints.status")}</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground whitespace-nowrap">{t("allComplaints.department")}</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground whitespace-nowrap">{t("allComplaints.officer")}</th>
              </tr>
            </thead>
            <tbody>
              {filteredComplaints.map((c, i) => (
                <motion.tr
                  key={c._id}
                  className="border-b hover:bg-muted/50 transition-colors"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03, duration: 0.3 }}
                >
                  <td className="py-3 px-4 whitespace-nowrap font-mono text-xs">{c.complaintId}</td>
                  <td className="py-3 px-4 whitespace-nowrap font-medium text-foreground">{c.title}</td>
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
                      <option value="">{t("allComplaints.selectDepartment")}</option>
                      {departments.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
                    </select>
                  </td>
                  <td className="py-3 px-4">
                    <select
                      className="border rounded px-2 py-1 text-xs bg-background max-w-[120px]"
                      value={c.assignedOfficer?._id || ""}
                      onChange={(e) => handleAssignOfficer(c.complaintId, e.target.value)}
                    >
                      <option value="">{t("allComplaints.selectOfficer")}</option>
                      {c.department?._id
                        ? employees.filter(emp => emp.department?._id === c.department._id).map(emp => <option key={emp._id} value={emp._id}>{emp.name}</option>)
                        : <option value="" disabled>{t("allComplaints.selectDeptFirst")}</option>}
                    </select>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </PageTransition>
  );
};

export default AllComplaints;
