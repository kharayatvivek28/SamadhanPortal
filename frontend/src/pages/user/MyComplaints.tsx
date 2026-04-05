import { useState, useEffect } from "react";
import { getAuthHeaders } from "@/context/AuthContext";
import { apiFetch } from "@/lib/api";
import { useTranslation } from "react-i18next";
import ComplaintCard from "@/components/complaint/ComplaintCard";
import FilterBar from "@/components/complaint/FilterBar";
// Animation: Added PageTransition + StaggerContainer for page and list animations
import PageTransition from "@/components/motion/PageTransition";
import StaggerContainer from "@/components/motion/StaggerContainer";
import SkeletonCard from "@/components/ui/skeleton-card";

const MyComplaints = () => {
  const { t } = useTranslation();
  const [complaints, setComplaints] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<any>({});

  useEffect(() => {
    const fetchComplaints = async () => {
      setLoading(true);
      try {
        // filter out empty values
        const activeFilters = Object.fromEntries(Object.entries(filters).filter(([_, v]) => v !== ""));
        const queryParams = new URLSearchParams(activeFilters as Record<string, string>).toString();
        
        const res = await apiFetch(`/api/complaints/my?${queryParams}`, { headers: getAuthHeaders() });
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
  }, [filters]);

  return (
    // Animation: Page entrance fade + slide
    <PageTransition>
      <h1 className="text-2xl font-bold text-foreground mb-1">{t("myComplaints.title", "My Complaints")}</h1>
      <p className="text-muted-foreground text-sm mb-6">{t("myComplaints.subtitle", "View all complaints you have filed")}</p>

      <FilterBar onFilterChange={setFilters} />

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <SkeletonCard key={i} variant="complaint" />
          ))}
        </div>
      ) : complaints.length === 0 ? (
        <div className="text-center py-10 text-muted-foreground">{t("myComplaints.noComplaints", "No complaints filed yet.")}</div>
      ) : (
        // Animation: Staggered card list entrance
        <StaggerContainer className="space-y-4">
          {complaints.map((c) => (
            <ComplaintCard key={c._id} complaint={c} linkPrefix="/user" />
          ))}
        </StaggerContainer>
      )}
    </PageTransition>
  );
};

export default MyComplaints;
