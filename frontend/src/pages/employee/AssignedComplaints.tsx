import { useState, useEffect } from "react";
import { getAuthHeaders } from "@/context/AuthContext";
import { apiFetch } from "@/lib/api";
import { useTranslation } from "react-i18next";
// Animation: Added framer-motion for page transition and staggered card animations
import { motion } from "framer-motion";
import FilterBar from "@/components/complaint/FilterBar";
import PageTransition from "@/components/motion/PageTransition";
import StaggerContainer, { staggerItemVariants } from "@/components/motion/StaggerContainer";
import SkeletonCard from "@/components/ui/skeleton-card";

const statusOptions = ["Pending", "Assigned", "In Progress", "Resolved"];

const AssignedComplaints = () => {
  const { t } = useTranslation();
  const [complaints, setComplaints] = useState<any[]>([]);
  const [statuses, setStatuses] = useState<Record<string, string>>({});
  const [remarks, setRemarks] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<any>({});
  const [saving, setSaving] = useState<string | null>(null);
  const [expandedDescriptions, setExpandedDescriptions] = useState<Record<string, boolean>>({});

  const statusLabel: Record<string, string> = {
    Pending: t("assignedComplaints.submitted"),
    Assigned: t("assignedComplaints.deptAssigned"),
    "In Progress": t("assignedComplaints.inProgress"),
    Resolved: t("assignedComplaints.resolved"),
  };

  const toggleDescription = (id: string) => {
    setExpandedDescriptions(prev => ({ ...prev, [id]: !prev[id] }));
  };

  useEffect(() => {
    const fetchAssigned = async () => {
      setLoading(true);
      try {
        const activeFilters = Object.fromEntries(Object.entries(filters).filter(([_, v]) => v !== ""));
        const queryParams = new URLSearchParams(activeFilters as Record<string, string>).toString();

        const res = await apiFetch(`/api/employee/assigned?${queryParams}`, { headers: getAuthHeaders() });
        if (res.ok) {
          const data = await res.json();
          setComplaints(data);
          setStatuses(Object.fromEntries(data.map((c: any) => [c.complaintId, c.status])));
        }
      } catch (err) {
        console.error("Failed to fetch assigned complaints:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAssigned();
  }, [filters]);

  const handleSave = async (complaintId: string) => {
    setSaving(complaintId);
    try {
      const headers = getAuthHeaders();

      // Update status if changed
      const complaint = complaints.find(c => c.complaintId === complaintId);
      if (complaint && statuses[complaintId] !== complaint.status) {
        await apiFetch(`/api/employee/update-status/${complaintId}`, {
          method: "PUT",
          headers,
          body: JSON.stringify({
            status: statuses[complaintId],
            message: remarks[complaintId] || `Status updated to ${statuses[complaintId]}`,
          }),
        });
      } else if (remarks[complaintId]) {
        // Just add remark
        await apiFetch(`/api/employee/add-remark/${complaintId}`, {
          method: "POST",
          headers,
          body: JSON.stringify({ message: remarks[complaintId] }),
        });
      }

      // Refresh data
      const res = await apiFetch("/api/employee/assigned", { headers });
      if (res.ok) {
        const data = await res.json();
        setComplaints(data);
        setStatuses(Object.fromEntries(data.map((c: any) => [c.complaintId, c.status])));
        setRemarks({ ...remarks, [complaintId]: "" });
      }
    } catch (err) {
      console.error("Failed to update complaint:", err);
    } finally {
      setSaving(null);
    }
  };

  const active = complaints.filter(c => c.status !== "Resolved");
  const DESC_THRESHOLD = 150;

  return (
    // Animation: Page entrance fade + slide
    <PageTransition>
      <h1 className="text-2xl font-bold text-foreground mb-1">{t("assignedComplaints.title")}</h1>
      <p className="text-muted-foreground text-sm mb-6">{t("assignedComplaints.subtitle")}</p>

      <FilterBar onFilterChange={setFilters} />

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <SkeletonCard key={i} variant="complaint" />
          ))}
        </div>
      ) : active.length === 0 ? (
        <div className="text-center py-10 text-muted-foreground">{t("assignedComplaints.noActive")}</div>
      ) : (
        // Animation: Staggered card entrance
        <StaggerContainer className="space-y-4">
          {active.map((c) => {
            const isLong = (c.description?.length || 0) > DESC_THRESHOLD;
            const isExpanded = expandedDescriptions[c.complaintId];
            return (
              // Animation: Individual card stagger item
              <motion.div key={c._id} variants={staggerItemVariants} className="bg-card rounded-lg border shadow-sm p-5">
                <div className="flex flex-wrap items-start justify-between gap-2 mb-3">
                  <div>
                    <p className="text-xs font-mono text-muted-foreground">{c.complaintId}</p>
                    <h3 className="font-semibold text-card-foreground">{c.title}</h3>
                  </div>
                </div>
                <div className="text-sm text-muted-foreground mb-4">
                  <p>
                    {isLong && !isExpanded
                      ? c.description?.substring(0, DESC_THRESHOLD) + "..."
                      : c.description}
                  </p>
                  {isLong && (
                    <button
                      onClick={() => toggleDescription(c.complaintId)}
                      className="text-primary text-xs font-medium hover:underline mt-1"
                    >
                      {isExpanded ? t("assignedComplaints.showLess") : t("assignedComplaints.showMore")}
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1">{t("assignedComplaints.updateStatus")}</label>
                    <select
                      className="w-full border rounded-md px-3 py-2 text-sm bg-background text-foreground"
                      value={statuses[c.complaintId] || c.status}
                      onChange={(e) => setStatuses({ ...statuses, [c.complaintId]: e.target.value })}
                    >
                      {statusOptions.map(s => <option key={s} value={s}>{statusLabel[s] || s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1">{t("assignedComplaints.addRemarks")}</label>
                    <input
                      className="w-full border rounded-md px-3 py-2 text-sm bg-background text-foreground"
                      placeholder={t("assignedComplaints.remarksPlaceholder")}
                      value={remarks[c.complaintId] || ""}
                      onChange={(e) => setRemarks({ ...remarks, [c.complaintId]: e.target.value })}
                    />
                  </div>
                </div>

                {/* Animation: Button with tap scale effect */}
                <motion.button
                  className="mt-3 bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
                  onClick={() => handleSave(c.complaintId)}
                  disabled={saving === c.complaintId}
                  whileTap={{ scale: 0.97 }}
                >
                  {saving === c.complaintId ? t("assignedComplaints.saving") : t("assignedComplaints.saveChanges")}
                </motion.button>
              </motion.div>
            );
          })}
        </StaggerContainer>
      )}
    </PageTransition>
  );
};

export default AssignedComplaints;
