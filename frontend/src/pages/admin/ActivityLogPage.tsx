import { useState, useEffect } from "react";
import { getAuthHeaders } from "@/context/AuthContext";
import { useTranslation } from "react-i18next";
import PageTransition from "@/components/motion/PageTransition";
import EmptyState from "@/components/ui/empty-state";
import { motion } from "framer-motion";
import { Activity, User, FileText, Building2, Settings } from "lucide-react";

const entityIcons: Record<string, typeof Activity> = {
  Complaint: FileText,
  User: User,
  Department: Building2,
  System: Settings,
};

const ActivityLogPage = () => {
  const { t } = useTranslation();
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const fetchLogs = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/admin/activity-log?page=${page}&limit=30`, {
          headers: getAuthHeaders(),
        });
        if (res.ok) {
          const data = await res.json();
          setLogs(data.logs || []);
          setTotalPages(data.totalPages || 1);
        }
      } catch (err) {
        console.error("Failed to fetch activity log:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, [page]);

  return (
    <PageTransition>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground mb-1">{t("activityLog.title")}</h1>
          <p className="text-muted-foreground text-sm">{t("activityLog.subtitle")}</p>
        </div>
        <div className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-primary" />
        </div>
      </div>

      {loading ? (
        <div className="text-center py-10 text-muted-foreground">{t("activityLog.loading")}</div>
      ) : logs.length === 0 ? (
        <EmptyState
          variant="no-data"
          title={t("activityLog.noActivity")}
          description={t("activityLog.noActivityDesc")}
        />
      ) : (
        <>
          <div className="space-y-2">
            {logs.map((log, i) => {
              const Icon = entityIcons[log.entityType] || Activity;
              return (
                <motion.div
                  key={log._id}
                  className="flex items-start gap-4 bg-card rounded-lg border p-4"
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03, duration: 0.3 }}
                >
                  <div className="bg-primary/10 rounded-lg p-2 shrink-0">
                    <Icon className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">{log.action}</p>
                    {log.details && (
                      <p className="text-xs text-muted-foreground mt-0.5">{log.details}</p>
                    )}
                    <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-muted-foreground">
                      {log.user && <span>{t("activityLog.by")}: {log.user.name}</span>}
                      <span>{new Date(log.createdAt).toLocaleString()}</span>
                      {log.entityId && (
                        <span className="font-mono break-all">{log.entityId}</span>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 text-sm border rounded-md bg-background hover:bg-muted disabled:opacity-50 transition-colors"
              >
                {t("common.previous")}
              </button>
              <span className="text-sm text-muted-foreground">
                {t("common.page")} {page} {t("manageEmployees.of")} {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-1.5 text-sm border rounded-md bg-background hover:bg-muted disabled:opacity-50 transition-colors"
              >
                {t("common.next")}
              </button>
            </div>
          )}
        </>
      )}
    </PageTransition>
  );
};

export default ActivityLogPage;
