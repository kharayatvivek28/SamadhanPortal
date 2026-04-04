/**
 * LanguageSwitcher — Dropdown to switch UI language (English, Hindi, Punjabi)
 * Stores selection in localStorage via i18next
 */
import { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Globe } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const languages = [
  { code: "en", label: "English", flag: "🇬🇧" },
  { code: "hi", label: "हिन्दी", flag: "🇮🇳" },
  { code: "pa", label: "ਪੰਜਾਬੀ", flag: "🇮🇳" },
];

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const currentLang = languages.find((l) => l.code === i18n.language) || languages[0];

  const handleLanguageChange = (code: string) => {
    i18n.changeLanguage(code);
    setOpen(false);
  };

  return (
    <div className="relative" ref={ref}>
      <motion.button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 text-sm text-primary-foreground/80 hover:text-primary-foreground transition-colors px-2 py-1 rounded-md hover:bg-primary-foreground/10"
        whileTap={{ scale: 0.95 }}
        aria-label="Switch language"
        title="Switch language"
      >
        <Globe className="h-4 w-4" />
        <span className="hidden sm:inline text-xs font-medium">{currentLang.flag} {currentLang.code.toUpperCase()}</span>
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            className="absolute right-0 top-full mt-1 bg-card border rounded-lg shadow-lg overflow-hidden z-50 min-w-[140px]"
            initial={{ opacity: 0, y: -4, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.95 }}
            transition={{ duration: 0.15 }}
          >
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => handleLanguageChange(lang.code)}
                className={`w-full flex items-center gap-2 px-3 py-2 text-sm text-left transition-colors
                  ${i18n.language === lang.code
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-card-foreground hover:bg-muted"
                  }`}
              >
                <span>{lang.flag}</span>
                <span>{lang.label}</span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LanguageSwitcher;
