import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { apiFetch } from "@/lib/api";
import { toast } from "sonner";
import { UserCircle, Upload } from "lucide-react";

interface ForceCompleteProfileProps {
  isOpen: boolean;
  onCompleted: () => void;
}

const ForceCompleteProfile = ({ isOpen, onCompleted }: ForceCompleteProfileProps) => {
  const { user } = useAuth();
  
  // Split existing name into First and Last if possible
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  
  const [gender, setGender] = useState("");
  const [dob, setDob] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [photographUrl, setPhotographUrl] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user?.name) {
      const parts = user.name.split(" ");
      setFirstName(parts[0] || "");
      if (parts.length > 1) {
        setLastName(parts.slice(1).join(" "));
      }
    }
    if (user?.phone) {
      setPhone(user.phone);
    }
  }, [user]);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // 2MB limit
        toast.error("Image size should be less than 2MB");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotographUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName || !lastName || !gender || !dob || !address || !phone) {
      toast.error("Please fill out all required fields.");
      return;
    }

    setLoading(true);
    try {
      const token = user?.token;
      const res = await apiFetch("/api/employee/complete-profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          firstName,
          lastName,
          gender,
          dob,
          address,
          phone,
          photographUrl,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to save profile");

      toast.success("Profile saved successfully!");
      
      // Update local storage user context manually so it reflects immediately
      const stored = localStorage.getItem("samadhan_user");
      if (stored) {
        const u = JSON.parse(stored);
        u.profileCompleted = true;
        u.name = `${firstName} ${lastName}`;
        localStorage.setItem("samadhan_user", JSON.stringify(u));
      }

      onCompleted();
      window.location.reload(); // Quick refresh to clear local auth state variables and refresh context
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full border rounded-md px-3 py-2 text-sm bg-background text-foreground focus:ring-2 focus:ring-ring focus:outline-none";

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="bg-card w-full max-w-2xl rounded-xl shadow-xl border overflow-hidden my-8"
          >
            <div className="bg-primary/10 p-6 flex flex-col items-center justify-center text-center border-b">
              <div className="bg-primary text-primary-foreground p-3 rounded-full mb-4">
                <UserCircle className="h-6 w-6" />
              </div>
              <h2 className="text-xl font-bold">Complete Your Profile</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Please provide your demographic details to finalize your account setup.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium mb-1">First Name <span className="text-destructive">*</span></label>
                  <input required className={inputClass} value={firstName} onChange={(e) => setFirstName(e.target.value)} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Last Name <span className="text-destructive">*</span></label>
                  <input required className={inputClass} value={lastName} onChange={(e) => setLastName(e.target.value)} />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Gender <span className="text-destructive">*</span></label>
                  <select required className={inputClass} value={gender} onChange={(e) => setGender(e.target.value)}>
                    <option value="" disabled>Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                    <option value="Prefer Not to Say">Prefer Not to Say</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Date of Birth <span className="text-destructive">*</span></label>
                  <input required type="date" className={inputClass} value={dob} onChange={(e) => setDob(e.target.value)} max={new Date().toISOString().split("T")[0]} />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Phone Number <span className="text-destructive">*</span></label>
                  <input required type="tel" className={inputClass} value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="e.g. +91 9876543210" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Upload Photo (Optional)</label>
                  <label className="flex bg-muted/50 border border-dashed rounded-md p-2 items-center justify-center text-muted-foreground hover:bg-muted cursor-pointer transition-colors overflow-hidden group relative h-[38px]">
                    {photographUrl ? (
                      <span className="text-sm truncate text-primary font-medium">Photo Selected</span>
                    ) : (
                      <>
                        <Upload className="h-4 w-4 mr-2" />
                        <span className="text-sm">Click to upload image</span>
                      </>
                    )}
                    <input 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      onChange={handlePhotoChange}
                    />
                  </label>
                  {photographUrl && (
                    <p className="text-[10px] mt-1 text-emerald-600 font-medium tracking-tight">Image loaded successfully.</p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1">Full Address <span className="text-destructive">*</span></label>
                  <textarea required rows={3} className={inputClass + " resize-none"} value={address} onChange={(e) => setAddress(e.target.value)} placeholder="123 Example Street, City, State, ZIP" />
                </div>
              </div>

              <div className="pt-4 border-t flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-primary text-primary-foreground px-8 py-2.5 rounded-md text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50 min-w-[150px]"
                >
                  {loading ? "Saving Profile..." : "Complete Setup"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ForceCompleteProfile;
