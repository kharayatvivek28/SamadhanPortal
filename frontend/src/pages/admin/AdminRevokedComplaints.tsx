import { useState, useEffect, useCallback } from "react";
import { getAuthHeaders } from "@/context/AuthContext";
import { useTranslation } from "react-i18next";
import SearchFilter from "@/components/ui/search-filter";
import EmptyState from "@/components/ui/empty-state";
import PageTransition from "@/components/motion/PageTransition";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";

const AdminRevokedComplaints = () => {
  const { t } = useTranslation();
  const [complaints, setComplaints] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Pagination State
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const limit = 10;

  const fetchRevokedComplaints = useCallback(async (currentPage: number, search: string) => {
    setLoading(true);
    try {
      const qs = new URLSearchParams({
        page: currentPage.toString(),
        limit: limit.toString(),
      });
      if (search) qs.append("search", search);

      const res = await fetch(`/api/admin/complaints/revoked?${qs.toString()}`, {
        headers: getAuthHeaders(),
      });
      
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setComplaints(data.data);
          setTotalPages(data.totalPages);
          setTotalCount(data.total);
          setPage(data.currentPage);
        }
      }
    } catch (err) {
      console.error("Failed to fetch revoked complaints:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Initial fetch
    fetchRevokedComplaints(page, searchQuery);
  }, [page, searchQuery, fetchRevokedComplaints]);

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    setPage(1); // Reset to first page on new search
  }, []);

  const handlePrevPage = () => {
    if (page > 1) setPage(p => p - 1);
  };

  const handleNextPage = () => {
    if (page < totalPages) setPage(p => p + 1);
  };

  return (
    <PageTransition>
      <h1 className="text-2xl font-bold text-foreground mb-1">{t("revokedComplaints.title")}</h1>
      <p className="text-muted-foreground text-sm mb-6">
        {t("revokedComplaints.subtitle")} ({totalCount} {t("revokedComplaints.total")})
      </p>

      <SearchFilter
        placeholder={t("revokedComplaints.searchPlaceholder")}
        onSearch={handleSearch}
        className="mb-6 max-w-2xl"
      />

      {loading && complaints.length === 0 ? (
        <div className="flex justify-center items-center py-20 text-muted-foreground">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      ) : complaints.length === 0 ? (
        <EmptyState
          variant="no-results"
          title={t("revokedComplaints.noResults")}
          description={searchQuery ? t("revokedComplaints.noResultsSearch") : t("revokedComplaints.noResultsEmpty")}
        />
      ) : (
        <div className="bg-card rounded-lg border shadow-sm mx-auto overflow-hidden text-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="py-3 px-4 font-medium text-muted-foreground whitespace-nowrap">{t("revokedComplaints.complaintId")}</th>
                  <th className="py-3 px-4 font-medium text-muted-foreground whitespace-nowrap">{t("revokedComplaints.citizenName")}</th>
                  <th className="py-3 px-4 font-medium text-muted-foreground whitespace-nowrap">{t("revokedComplaints.registeredOn")}</th>
                  <th className="py-3 px-4 font-medium text-muted-foreground whitespace-nowrap">{t("revokedComplaints.revokedOn")}</th>
                  <th className="py-3 px-4 font-medium text-muted-foreground max-w-xs">{t("revokedComplaints.reason")}</th>
                </tr>
              </thead>
              <tbody>
                {complaints.map((c, i) => (
                  <motion.tr
                    key={c._id}
                    className="border-b last:border-0 hover:bg-muted/30 transition-colors"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03, duration: 0.3 }}
                  >
                    <td className="py-3 px-4 font-mono text-xs text-primary">{c.complaintId}</td>
                    <td className="py-3 px-4 font-medium">{c.user?.name || t("common.unknown")}</td>
                    <td className="py-3 px-4 text-muted-foreground">{new Date(c.createdAt).toLocaleDateString()}</td>
                    <td className="py-3 px-4 text-destructive/80 font-medium">{c.revokedAt ? new Date(c.revokedAt).toLocaleDateString() : "-"}</td>
                    <td className="py-3 px-4 text-muted-foreground max-w-xs truncate" title={c.revokeReason || "N/A"}>
                      {c.revokeReason || "N/A"}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t bg-muted/20">
              <div className="text-xs text-muted-foreground font-medium">
                {t("revokedComplaints.showingPage")} {page} {t("manageEmployees.of")} {totalPages}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handlePrevPage}
                  disabled={page === 1 || loading}
                  className="p-1.5 rounded border bg-background hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={handleNextPage}
                  disabled={page === totalPages || loading}
                  className="p-1.5 rounded border bg-background hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </PageTransition>
  );
};

export default AdminRevokedComplaints;
