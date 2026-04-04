/**
 * FloatingActionButton — A fixed-position animated FAB for mobile.
 * Shows a "File Complaint" shortcut on mobile for user role.
 */
import { motion, AnimatePresence } from "framer-motion";
import { FilePlus } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

const FloatingActionButton = () => {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();

  // Only show for logged-in users, not on the file-complaint page itself
  const show =
    isAuthenticated &&
    user?.role === "user" &&
    !location.pathname.includes("file-complaint");

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed bottom-6 right-6 z-50 lg:hidden"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
        >
          <Link
            to="/user/file-complaint"
            className="flex items-center justify-center h-14 w-14 rounded-full bg-primary text-primary-foreground shadow-lg hover:shadow-xl transition-shadow"
          >
            {/* Animation: Subtle pulse effect on the FAB icon */}
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              <FilePlus className="h-6 w-6" />
            </motion.div>
          </Link>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default FloatingActionButton;
