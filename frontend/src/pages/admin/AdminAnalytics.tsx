import { useState, useEffect } from "react";
import { getAuthHeaders } from "@/context/AuthContext";
import { apiFetch } from "@/lib/api";
import { useTranslation } from "react-i18next";
import PageTransition from "@/components/motion/PageTransition";
import StaggerContainer from "@/components/motion/StaggerContainer";
import { staggerItemVariants } from "@/components/motion/StaggerContainer";
import SkeletonCard from "@/components/ui/skeleton-card";
import { motion } from "framer-motion";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area, LineChart, Line, Legend
} from "recharts";

const CHART_COLORS = [
  "hsl(214, 70%, 28%)", "hsl(142, 60%, 40%)", "hsl(45, 90%, 48%)",
  "hsl(0, 72%, 50%)", "hsl(214, 55%, 40%)", "hsl(280, 60%, 50%)",
  "hsl(180, 50%, 40%)", "hsl(30, 80%, 55%)",
];

const AdminAnalytics = () => {
  const { t } = useTranslation();
  const [stats, setStats] = useState<any>(null);
  const [complaints, setComplaints] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const headers = getAuthHeaders();
        const [statsRes, complaintsRes] = await Promise.all([
          apiFetch("/api/admin/stats", { headers }),
          apiFetch("/api/admin/complaints", { headers }),
        ]);
        if (statsRes.ok) setStats(await statsRes.json());
        if (complaintsRes.ok) setComplaints(await complaintsRes.json());
      } catch (err) {
        console.error("Failed to fetch analytics:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Derive chart data from complaints
  const categoryData = complaints.reduce((acc: any[], c) => {
    const cat = c.category || "General";
    const existing = acc.find((d) => d.name === cat);
    if (existing) existing.value += 1;
    else acc.push({ name: cat, value: 1 });
    return acc;
  }, []);

  const departmentData = complaints.reduce((acc: any[], c) => {
    const dept = typeof c.department === "object" && c.department ? c.department.name : c.department || "Unassigned";
    const existing = acc.find((d) => d.name === dept);
    if (existing) existing.count += 1;
    else acc.push({ name: dept, count: 1 });
    return acc;
  }, []);

  const statusData = complaints.reduce((acc: any[], c) => {
    const existing = acc.find((d) => d.name === c.status);
    if (existing) existing.value += 1;
    else acc.push({ name: c.status, value: 1 });
    return acc;
  }, []);

  // Monthly trend data
  const monthlyData = complaints.reduce((acc: any[], c) => {
    const date = new Date(c.createdAt || Date.now());
    const month = date.toLocaleString("default", { month: "short", year: "2-digit" });
    const existing = acc.find((d) => d.month === month);
    if (existing) existing.complaints += 1;
    else acc.push({ month, complaints: 1 });
    return acc;
  }, []).slice(-12);

  // Resolution rate data
  const resolutionData = [
    { name: t("adminAnalytics.resolved"), value: stats?.resolved || 0 },
    { name: t("adminAnalytics.pending"), value: stats?.pending || 0 },
    { name: t("adminAnalytics.inProgress"), value: stats?.inProgress || 0 },
  ];

  if (loading) {
    return (
      <PageTransition>
        <h1 className="text-2xl font-bold text-foreground mb-6">{t("adminAnalytics.title")}</h1>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <h1 className="text-2xl font-bold text-foreground mb-1">{t("adminAnalytics.title")}</h1>
      <p className="text-muted-foreground text-sm mb-6">{t("adminAnalytics.subtitle")}</p>

      {/* Summary stats */}
      <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: t("adminAnalytics.totalComplaints"), value: stats?.totalComplaints || 0, color: "text-primary" },
          { label: t("adminAnalytics.resolved"), value: stats?.resolved || 0, color: "text-status-resolved" },
          { label: t("adminAnalytics.inProgress"), value: stats?.inProgress || 0, color: "text-status-progress" },
          { label: t("adminAnalytics.pending"), value: stats?.pending || 0, color: "text-muted-foreground" },
        ].map((s) => (
          <motion.div
            key={s.label}
            variants={staggerItemVariants}
            className="bg-card rounded-lg border shadow-sm p-4 text-center"
          >
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
          </motion.div>
        ))}
      </StaggerContainer>

      {/* Charts grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Complaints by Category */}
        <motion.div
          className="bg-card rounded-lg border shadow-sm p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h3 className="font-semibold text-card-foreground mb-4">{t("adminAnalytics.byCategory")}</h3>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={categoryData.length > 0 ? categoryData : [{ name: "No Data", value: 1 }]}
                cx="50%"
                cy="50%"
                outerRadius={100}
                dataKey="value"
                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                labelLine={false}
              >
                {(categoryData.length > 0 ? categoryData : [{ name: "No Data", value: 1 }]).map((_, i) => (
                  <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Complaints by Department */}
        <motion.div
          className="bg-card rounded-lg border shadow-sm p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h3 className="font-semibold text-card-foreground mb-4">{t("adminAnalytics.byDepartment")}</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={departmentData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
              <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
              <Tooltip />
              <Bar dataKey="count" fill="hsl(214, 70%, 28%)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Resolution Rate */}
        <motion.div
          className="bg-card rounded-lg border shadow-sm p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h3 className="font-semibold text-card-foreground mb-4">{t("adminAnalytics.resolutionRate")}</h3>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={resolutionData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                dataKey="value"
                label={({ name, value }) => `${name}: ${value}`}
                labelLine={false}
              >
                <Cell fill="hsl(142, 60%, 40%)" />
                <Cell fill="hsl(215, 10%, 65%)" />
                <Cell fill="hsl(45, 90%, 48%)" />
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Monthly Complaint Trend */}
        <motion.div
          className="bg-card rounded-lg border shadow-sm p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h3 className="font-semibold text-card-foreground mb-4">{t("adminAnalytics.monthlyTrend")}</h3>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={monthlyData.length > 0 ? monthlyData : [{ month: "No Data", complaints: 0 }]}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
              <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
              <Tooltip />
              <Area type="monotone" dataKey="complaints" stroke="hsl(214, 70%, 28%)" fill="hsl(214, 70%, 28%)" fillOpacity={0.15} />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>
      </div>
    </PageTransition>
  );
};

export default AdminAnalytics;
