import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { getAuthHeaders } from "@/context/AuthContext";
import { apiFetch } from "@/lib/api";
import FileUpload from "@/components/complaint/FileUpload";
import { motion, AnimatePresence } from "framer-motion";
import PageTransition from "@/components/motion/PageTransition";
import { CheckCircle2, Sparkles, ArrowRight, RotateCcw } from "lucide-react";

interface DepartmentOption {
  _id: string;
  name: string;
}

const ComplaintForm = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [form, setForm] = useState({ title: "", department: "", priority: "Medium", description: "" });
  const [departments, setDepartments] = useState<DepartmentOption[]>([]);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  // AI Rephrase state
  const [isRephrasing, setIsRephrasing] = useState(false);
  const [rephrasedText, setRephrasedText] = useState("");
  const [showRephrasedPreview, setShowRephrasedPreview] = useState(false);

  // AI Category suggestion state
  const [suggestedDept, setSuggestedDept] = useState("");
  const [isSuggestingCategory, setIsSuggestingCategory] = useState(false);

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const res = await apiFetch("/api/complaints/departments", { headers: getAuthHeaders() });
        if (res.ok) {
          const data = await res.json();
          setDepartments(data);
        }
      } catch {
        // If departments fail to load, they just won't show
      }
    };
    fetchDepartments();
  }, []);

  // Auto-suggest category when description is long enough
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (form.description.length >= 50 && !form.department && !isSuggestingCategory) {
        setIsSuggestingCategory(true);
        try {
          const res = await apiFetch("/api/suggest-category", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text: form.description }),
          });
          if (res.ok) {
            let data;
            try {
              data = await res.json();
            } catch (e) {
              return; // Silently fail suggestion
            }
            if (data?.suggestedDepartment) {
              setSuggestedDept(data.suggestedDepartment);
            }
          }
        } catch {
          // Silently fail — suggestion is not critical
        } finally {
          setIsSuggestingCategory(false);
        }
      }
    }, 1500); // Debounce 1.5s

    return () => clearTimeout(timer);
  }, [form.description, form.department, isSuggestingCategory]);

  // Handle AI rephrase
  const handleRephrase = async () => {
    if (form.description.trim().length < 10) return;
    setIsRephrasing(true);
    setRephrasedText("");
    setShowRephrasedPreview(false);

    try {
      const res = await apiFetch("/api/rephrase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: form.description }),
      });

      if (!res.ok) {
        throw new Error("Rephrase failed");
      }

      let data;
      try {
        data = await res.json();
      } catch (e) {
        throw new Error("Server returned an invalid response.");
      }
      setRephrasedText(data?.rephrased || "");
      setShowRephrasedPreview(true);
    } catch (err) {
      console.error("Rephrase error:", err);
      setError("Failed to improve complaint. Please try again.");
    } finally {
      setIsRephrasing(false);
    }
  };

  // Use the rephrased version
  const useRephrased = () => {
    setForm({ ...form, description: rephrasedText });
    setShowRephrasedPreview(false);
    setRephrasedText("");
  };

  // Dismiss rephrased preview
  const keepOriginal = () => {
    setShowRephrasedPreview(false);
    setRephrasedText("");
  };

  // Apply suggested department
  const applySuggestedDept = () => {
    setForm({ ...form, department: suggestedDept });
    setSuggestedDept("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      // Use FormData to support file uploads
      const formData = new FormData();
      formData.append("title", form.title);
      formData.append("description", form.description);
      formData.append("priority", form.priority);
      formData.append("department", form.department);
      attachments.forEach((file) => formData.append("attachments", file));

      const storedUser = localStorage.getItem("samadhan_user");
      const token = storedUser ? JSON.parse(storedUser).token : "";

      const res = await apiFetch("/api/complaints", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to submit complaint");
      }

      setSubmitted(true);
      setTimeout(() => navigate("/user/my-complaints"), 1500);
    } catch (err: any) {
      setError(err.message || "Failed to submit complaint");
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageTransition>
      <AnimatePresence mode="wait">
        {submitted ? (
          <motion.div
            key="success"
            className="bg-card rounded-lg border shadow-sm p-10 max-w-2xl text-center"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 12, delay: 0.1 }}
              className="mx-auto mb-4 w-fit"
            >
              <CheckCircle2 className="h-16 w-16 text-green-500" />
            </motion.div>
            <motion.h3
              className="text-xl font-bold text-foreground mb-2"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.4 }}
            >
              {t("complaint.submitted")}
            </motion.h3>
            <motion.p
              className="text-muted-foreground text-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.3 }}
            >
              {t("complaint.redirecting")}
            </motion.p>
          </motion.div>
        ) : (
          <motion.form
            key="form"
            onSubmit={handleSubmit}
            className="bg-card rounded-lg border shadow-sm p-6 max-w-2xl space-y-5"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
          >
            <AnimatePresence>
              {error && (
                <motion.div
                  className="bg-destructive/10 text-destructive text-sm p-3 rounded-md"
                  initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                  animate={{ opacity: 1, height: "auto", marginBottom: 8 }}
                  exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                  transition={{ duration: 0.25 }}
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>
            <div>
              <label className="block text-sm font-medium text-card-foreground mb-1">{t("complaint.title")}</label>
              <input
                required
                className="w-full border rounded-md px-3 py-2 text-sm bg-background text-foreground focus:ring-2 focus:ring-ring focus:outline-none"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder={t("complaint.titlePlaceholder")}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-card-foreground mb-1">{t("complaint.department")}</label>
                <select
                  required
                  className="w-full border rounded-md px-3 py-2 text-sm bg-background text-foreground focus:ring-2 focus:ring-ring focus:outline-none"
                  value={form.department}
                  onChange={(e) => { setForm({ ...form, department: e.target.value }); setSuggestedDept(""); }}
                >
                  <option value="">{t("complaint.selectDepartment")}</option>
                  {departments.map((d) => (
                    <option key={d._id} value={d.name}>{d.name}</option>
                  ))}
                </select>
                {/* AI-suggested department chip */}
                <AnimatePresence>
                  {suggestedDept && !form.department && (
                    <motion.button
                      type="button"
                      onClick={applySuggestedDept}
                      className="mt-1.5 inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full 
                                 bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-colors"
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Sparkles className="h-3 w-3" />
                      {t("complaint.suggestedDept")}: {suggestedDept}
                      <ArrowRight className="h-3 w-3" />
                    </motion.button>
                  )}
                </AnimatePresence>
              </div>
              <div>
                <label className="block text-sm font-medium text-card-foreground mb-1">{t("complaint.priority")}</label>
                <select
                  className="w-full border rounded-md px-3 py-2 text-sm bg-background text-foreground focus:ring-2 focus:ring-ring focus:outline-none"
                  value={form.priority}
                  onChange={(e) => setForm({ ...form, priority: e.target.value })}
                >
                  <option value="Low">{t("complaint.low")}</option>
                  <option value="Medium">{t("complaint.medium")}</option>
                  <option value="High">{t("complaint.high")}</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-card-foreground mb-1">{t("complaint.description")}</label>
              <textarea
                required
                rows={5}
                className="w-full border rounded-md px-3 py-2 text-sm bg-background text-foreground focus:ring-2 focus:ring-ring focus:outline-none resize-none"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder={t("complaint.descriptionPlaceholder")}
              />

              {/* AI Rephrase Button — shown when description has 10+ chars */}
              <AnimatePresence>
                {form.description.trim().length >= 10 && (
                  <motion.button
                    type="button"
                    onClick={handleRephrase}
                    disabled={isRephrasing}
                    className="mt-2 inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full 
                               bg-gradient-to-r from-violet-500/10 to-purple-500/10 text-violet-700 dark:text-violet-300
                               border border-violet-500/20 hover:from-violet-500/20 hover:to-purple-500/20 
                               transition-all disabled:opacity-50 font-medium"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.2 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Sparkles className="h-3.5 w-3.5" />
                    {isRephrasing ? t("complaint.improving") : t("complaint.improveBtn")}
                  </motion.button>
                )}
              </AnimatePresence>

              {/* Rephrased preview card */}
              <AnimatePresence>
                {showRephrasedPreview && rephrasedText && (
                  <motion.div
                    className="mt-3 bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-950/30 dark:to-purple-950/30 
                               border border-violet-200 dark:border-violet-800 rounded-lg p-4"
                    initial={{ opacity: 0, height: 0, marginTop: 0 }}
                    animate={{ opacity: 1, height: "auto", marginTop: 12 }}
                    exit={{ opacity: 0, height: 0, marginTop: 0 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                  >
                    <div className="flex items-center gap-1.5 mb-2">
                      <Sparkles className="h-3.5 w-3.5 text-violet-600 dark:text-violet-400" />
                      <p className="text-xs font-semibold text-violet-700 dark:text-violet-300">
                        {t("complaint.improvedVersion")}
                      </p>
                    </div>
                    <p className="text-sm text-foreground/90 leading-relaxed mb-3 whitespace-pre-wrap">
                      {rephrasedText}
                    </p>
                    <div className="flex gap-2">
                      <motion.button
                        type="button"
                        onClick={useRephrased}
                        className="inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded-md 
                                   bg-violet-600 text-white hover:bg-violet-700 transition-colors font-medium"
                        whileTap={{ scale: 0.95 }}
                      >
                        <ArrowRight className="h-3 w-3" />
                        {t("complaint.useImproved")}
                      </motion.button>
                      <motion.button
                        type="button"
                        onClick={keepOriginal}
                        className="inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded-md 
                                   bg-muted text-muted-foreground hover:bg-muted/80 transition-colors font-medium"
                        whileTap={{ scale: 0.95 }}
                      >
                        <RotateCcw className="h-3 w-3" />
                        {t("complaint.keepOriginal")}
                      </motion.button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div>
              <label className="block text-sm font-medium text-card-foreground mb-2">{t("complaint.attachments")}</label>
              <FileUpload onFilesChange={setAttachments} maxFiles={5} accept="image/*" />
            </div>

            <motion.button
              type="submit"
              disabled={loading}
              className="bg-primary text-primary-foreground px-6 py-2.5 rounded-md text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
              whileTap={{ scale: 0.97 }}
            >
              {loading ? t("complaint.submitting") : t("complaint.submit")}
            </motion.button>
          </motion.form>
        )}
      </AnimatePresence>
    </PageTransition>
  );
};

export default ComplaintForm;
