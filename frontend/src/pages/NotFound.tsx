import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
// Animation: Added framer-motion for 404 page entrance animation
import { motion } from "framer-motion";

const NotFound = () => {
  const { t } = useTranslation();
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted">
      {/* Animation: Scale + fade entrance with spring bounce for 404 content */}
      <motion.div
        className="text-center"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 20, duration: 0.6 }}
      >
        {/* Animation: Bouncy number entrance with slight delay */}
        <motion.h1
          className="mb-4 text-4xl font-bold"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 15, delay: 0.15 }}
        >
          {t("notFound.title")}
        </motion.h1>
        <motion.p
          className="mb-4 text-xl text-muted-foreground"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.4 }}
        >
          {t("notFound.message")}
        </motion.p>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.45, duration: 0.4 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Link
            to="/"
            className="text-primary underline hover:text-primary/90 block inline-block"
          >
            {t("notFound.returnHome")}
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default NotFound;
