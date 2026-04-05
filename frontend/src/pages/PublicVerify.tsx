import { useState } from "react";
import { apiFetch } from "@/lib/api";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import PageTransition from "@/components/motion/PageTransition";
import { motion, AnimatePresence } from "framer-motion";
import { Search, CheckCircle2, Clock, Circle, Building2, Calendar, Shield } from "lucide-react";

interface VerifyResult {
  complaintId: string;
  title: string;
  status: string;
  department: string;
  filedDate: string;
  lastUpdated: string;
  currentStage: string;
}

const statusIcon: Record<string, typeof CheckCircle2> = {
  Pending: Circle,
  Assigned: Clock,
  "In Progress": Clock,
  Resolved: CheckCircle2,
};

const statusColor: Record<string, string> = {
  Pending: "text-status-pending",
  Assigned: "text-status-progress",
  "In Progress": "text-status-progress",
  Resolved: "text-status-resolved",
};

const PublicVerify = () => {
  const [complaintId, setComplaintId] = useState("");
  const [result, setResult] = useState<VerifyResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searched, setSearched] = useState(false);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!complaintId.trim()) return;
    setLoading(true);
    setError("");
    setResult(null);
    setSearched(true);

    try {
      const res = await apiFetch(`/api/complaints/verify/${complaintId.trim()}`);
      if (res.ok) {
        const data = await res.json();
        setResult({
          complaintId: data.complaintId,
          title: data.title,
          status: data.status,
          department: typeof data.department === "object" ? data.department?.name : data.department || "N/A",
          filedDate: data.createdAt ? new Date(data.createdAt).toLocaleDateString() : "N/A",
          lastUpdated: data.updatedAt ? new Date(data.updatedAt).toLocaleDateString() : "N/A",
          currentStage: data.currentStage || data.status,
        });
      } else {
        setError("Complaint not found. Please check your Complaint ID and try again.");
      }
    } catch {
      setError("Unable to connect to the server. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const StatusIcon = result ? (statusIcon[result.status] || Circle) : Circle;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <PageTransition className="flex-1">
        {/* Hero */}
        <section className="bg-hero text-hero-foreground py-16">
          <div className="container mx-auto px-4 text-center">
            <motion.div
              className="flex justify-center mb-4"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <div className="bg-primary-foreground/10 rounded-full p-4">
                <Shield className="h-10 w-10" />
              </div>
            </motion.div>
            <motion.h1
              className="text-2xl md:text-4xl font-bold mb-3"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              Verify Your Complaint
            </motion.h1>
            <motion.p
              className="text-hero-muted max-w-lg mx-auto mb-8"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              Enter your Complaint ID to check the current status & timeline. No login required.
            </motion.p>

            <motion.form
              onSubmit={handleVerify}
              className="max-w-md mx-auto flex gap-2"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <input
                type="text"
                value={complaintId}
                onChange={(e) => setComplaintId(e.target.value)}
                placeholder="e.g. CMP-2024-001"
                className="flex-1 px-4 py-3 rounded-l-lg text-foreground bg-background border-0 focus:ring-2 focus:ring-ring focus:outline-none"
              />
              <button
                type="submit"
                disabled={loading}
                className="bg-primary-foreground text-primary px-6 py-3 rounded-r-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2"
              >
                <Search className="h-4 w-4" />
                {loading ? "Verifying..." : "Verify"}
              </button>
            </motion.form>
          </div>
        </section>

        {/* Results */}
        <section className="py-12">
          <div className="container mx-auto px-4 max-w-2xl">
            <AnimatePresence mode="wait">
              {error && (
                <motion.div
                  key="error"
                  className="bg-destructive/10 text-destructive rounded-lg p-6 text-center"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                >
                  <p className="font-medium">{error}</p>
                </motion.div>
              )}

              {result && (
                <motion.div
                  key="result"
                  className="bg-card rounded-lg border shadow-sm overflow-hidden"
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                >
                  {/* Header */}
                  <div className="bg-muted p-6 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-mono text-muted-foreground">{result.complaintId}</p>
                      <h2 className="text-lg font-semibold text-foreground mt-1">{result.title}</h2>
                    </div>
                    <div className={`flex items-center gap-2 ${statusColor[result.status] || "text-muted-foreground"}`}>
                      <StatusIcon className="h-6 w-6" />
                      <span className="font-semibold">{result.status}</span>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="p-6 grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-2 text-sm">
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">Department</p>
                        <p className="font-medium text-card-foreground">{result.department}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">Current Stage</p>
                        <p className="font-medium text-card-foreground">{result.currentStage}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">Filed Date</p>
                        <p className="font-medium text-card-foreground">{result.filedDate}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">Last Updated</p>
                        <p className="font-medium text-card-foreground">{result.lastUpdated}</p>
                      </div>
                    </div>
                  </div>

                  <div className="border-t p-4 text-center text-xs text-muted-foreground">
                    Sensitive information has been masked for privacy
                  </div>
                </motion.div>
              )}

              {searched && !result && !error && !loading && (
                <motion.div
                  key="not-found"
                  className="text-center py-16 text-muted-foreground"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  No results to display.
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </section>
      </PageTransition>

      <Footer />
    </div>
  );
};

export default PublicVerify;
