import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAuthHeaders } from "@/context/AuthContext";
import { apiFetch, assetUrl, apiUrl } from "@/lib/api";
import { useTranslation } from "react-i18next";
import PageTransition from "@/components/motion/PageTransition";
import SkeletonCard from "@/components/ui/skeleton-card";
import { User, Phone, MapPin, Calendar, Mail, Briefcase, Camera, Lock, CheckCircle2, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

const EmployeeProfilePage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [employee, setEmployee] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profilePicFile, setProfilePicFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Form states
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    address: "",
    gender: "",
    dob: "",
    newPassword: "",
    confirmPassword: ""
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await apiFetch("/api/employee/profile", { headers: getAuthHeaders() });
        if (res.ok) {
          const data = await res.json();
          setEmployee(data);
          setFormData({
            firstName: data.firstName || "",
            lastName: data.lastName || "",
            phone: data.phone || "",
            address: data.address || "",
            gender: data.gender || "",
            dob: data.dob ? data.dob.split('T')[0] : "",
            newPassword: "",
            confirmPassword: ""
          });
        } else {
          toast.error("Failed to load profile");
        }
      } catch (err) {
        toast.error("An error occurred loading profile");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
      return toast.error("Passwords do not match");
    }

    setSaving(true);
    try {
      const formPayload = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        formPayload.append(key, value as string);
      });
      if (profilePicFile) {
        formPayload.append("photograph", profilePicFile);
      }

      // We cannot use standard JSON headers when sending FormData
      const token = JSON.parse(localStorage.getItem("samadhan_user") || "{}").token;
      const headers: any = { Authorization: `Bearer ${token}` };

      const res = await fetch(apiUrl("/api/employee/profile"), {
        method: "PUT",
        headers,
        body: formPayload
      });

      if (res.ok) {
        toast.success("Profile updated successfully");
        if (formData.newPassword) {
          toast.success("Password changed. Please log in again.");
          // Could force logout here or simply let the old token expire if secret wasn't changed
          setFormData(prev => ({ ...prev, newPassword: "", confirmPassword: "" }));
        }
        
        // Refresh display data
        const refresh = await apiFetch("/api/employee/profile", { headers: getAuthHeaders() });
        if (refresh.ok) setEmployee(await refresh.json());
      } else {
        const errData = await res.json();
        toast.error(errData.message || "Failed to update profile");
      }
    } catch (err: any) {
      toast.error("Network error saving profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <PageTransition>
        <div className="mb-6"><SkeletonCard variant="stats" /></div>
        <SkeletonCard variant="complaint" />
      </PageTransition>
    );
  }

  if (!employee) return null;

  return (
    <PageTransition>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground mb-1">{t("accountSettings.title", "My Profile")}</h1>
        <p className="text-muted-foreground text-sm">{t("accountSettings.subtitle", "Manage your personal information and security settings")}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column - ID Card Style */}
        <div className="md:col-span-1 bg-card border rounded-lg shadow-sm overflow-hidden flex flex-col h-fit sticky top-6">
          <div className="h-24 bg-primary/10 w-full relative">
            <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 rounded-full border-4 border-card bg-muted h-24 w-24 flex items-center justify-center overflow-hidden shadow-sm group">
              {previewUrl || employee.photographUrl ? (
                <img src={previewUrl || assetUrl(employee.photographUrl)} alt={employee.name} className="h-full w-full object-cover" />
              ) : (
                <User className="h-10 w-10 text-muted-foreground" />
              )}
              <label className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                <Camera className="h-6 w-6 mb-1" />
                <span className="text-[10px] font-medium">{t("accountSettings.changePhoto", "Change")}</span>
                <input 
                  type="file" 
                  accept="image/jpeg,image/png,image/webp" 
                  className="hidden" 
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setProfilePicFile(file);
                      setPreviewUrl(URL.createObjectURL(file));
                    }
                  }}
                />
              </label>
            </div>
          </div>
          <div className="pt-16 pb-6 px-6 text-center flex-1">
            <h2 className="text-xl font-bold text-card-foreground">{employee.name}</h2>
            <p className="text-sm font-medium text-primary mt-1">{employee.department?.name || t("common.unassigned", "Unassigned")}</p>
            
            <div className="mt-4 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-secondary text-secondary-foreground text-xs font-semibold hover:bg-secondary/80 cursor-default transition-colors">
              <Briefcase className="h-3.5 w-3.5" />
              {t("employeeProfile.activeComplaints", "Active Complaints:")} {employee.activeComplaints || 0}
            </div>

            <div className="mt-6 space-y-3 text-left bg-muted/30 p-4 rounded-lg border text-sm">
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="truncate">{employee.email}</span>
              </div>
              <div className="flex items-center gap-3">
                <Briefcase className="h-4 w-4 text-muted-foreground" />
                <span className="capitalize">{employee.role}</span> {t("employeeProfile.officerRole", "Officer")}
              </div>
              <div className="flex items-center gap-3">
                 <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                 <span className="text-emerald-600 font-medium">{t("accountSettings.verifiedAccount", "Verified Account")}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Forms */}
        <div className="md:col-span-2 space-y-6">
          <form onSubmit={handleSubmit} className="bg-card border rounded-lg shadow-sm overflow-hidden">
            <div className="p-6 border-b bg-muted/10">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                {t("accountSettings.personalInfo", "Personal Information")}
              </h3>
            </div>
            
            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-4">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">{t("accountSettings.firstName", "First Name")}</label>
                <input 
                  type="text" 
                  name="firstName" 
                  value={formData.firstName} 
                  onChange={handleInputChange} 
                  className="w-full h-10 px-3 rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all" 
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">{t("accountSettings.lastName", "Last Name")}</label>
                <input 
                  type="text" 
                  name="lastName" 
                  value={formData.lastName} 
                  onChange={handleInputChange} 
                  className="w-full h-10 px-3 rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all" 
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">{t("accountSettings.phone", "Phone Number")}</label>
                <input 
                  type="tel" 
                  name="phone" 
                  value={formData.phone}
                  autoComplete="off" 
                  onChange={handleInputChange} 
                  className="w-full h-10 px-3 rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all" 
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">{t("accountSettings.gender", "Gender")}</label>
                <select 
                  name="gender" 
                  value={formData.gender} 
                  onChange={handleInputChange} 
                  className="w-full h-10 px-3 rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                  required
                >
                  <option value="">Select gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">{t("accountSettings.dob", "Date of Birth")}</label>
                <input 
                  type="date" 
                  name="dob" 
                  value={formData.dob} 
                  onChange={handleInputChange} 
                  className="w-full h-10 px-3 rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all" 
                  required
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-muted-foreground mb-1">{t("accountSettings.address", "Full Address")}</label>
                <textarea 
                  name="address" 
                  value={formData.address} 
                  onChange={handleInputChange} 
                  rows={2}
                  className="w-full px-3 py-2 rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all resize-none" 
                  required
                />
              </div>

              <div className="sm:col-span-2 pt-4 mt-2 border-t flex items-center justify-between">
                 <h4 className="text-sm font-bold flex items-center gap-2">
                   <Lock className="h-4 w-4 text-muted-foreground" />
                   {t("accountSettings.security", "Security (Optional)")}
                 </h4>
              </div>

              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">{t("accountSettings.newPassword", "New Password")}</label>
                <div className="relative">
                  <input 
                    type={showNewPassword ? "text" : "password"} 
                    name="newPassword" 
                    value={formData.newPassword} 
                    onChange={handleInputChange} 
                    placeholder={t("accountSettings.leaveBlank", "Leave blank to keep current")}
                    className="w-full h-10 px-3 rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all pr-10" 
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">{t("accountSettings.confirmNewPassword", "Confirm New Password")}</label>
                <div className="relative">
                  <input 
                    type={showConfirmPassword ? "text" : "password"} 
                    name="confirmPassword" 
                    value={formData.confirmPassword} 
                    onChange={handleInputChange} 
                    disabled={!formData.newPassword}
                    placeholder={formData.newPassword ? t("accountSettings.reEnterPassword", "Re-enter new password") : ""}
                    className="w-full h-10 px-3 rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all disabled:opacity-50 disabled:bg-muted pr-10" 
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    disabled={!formData.newPassword}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground disabled:opacity-50"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

            </div>
            
            <div className="p-4 border-t bg-muted/10 flex justify-end">
               <motion.button 
                 whileHover={{ scale: 1.01 }}
                 whileTap={{ scale: 0.98 }}
                 type="submit" 
                 disabled={saving}
                 className="bg-primary hover:opacity-90 text-primary-foreground px-6 py-2 rounded-md font-medium text-sm transition-opacity disabled:opacity-50"
               >
                 {saving ? t("common.saving", "Saving Changes...") : t("accountSettings.saveChanges", "Save Profile")}
               </motion.button>
            </div>
          </form>

        </div>
      </div>
    </PageTransition>
  );
};

export default EmployeeProfilePage;
