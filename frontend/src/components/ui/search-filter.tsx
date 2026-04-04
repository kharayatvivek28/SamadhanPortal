import { useState, useCallback, useEffect, useRef } from "react";
import { Search, X, Filter } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface FilterChip {
  label: string;
  value: string;
  active: boolean;
}

interface Props {
  placeholder?: string;
  onSearch: (query: string) => void;
  filters?: FilterChip[];
  onFilterToggle?: (value: string) => void;
  debounceMs?: number;
  className?: string;
}

const SearchFilter = ({
  placeholder = "Search...",
  onSearch,
  filters = [],
  onFilterToggle,
  debounceMs = 300,
  className = "",
}: Props) => {
  const [query, setQuery] = useState("");
  const [expanded, setExpanded] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  const handleChange = useCallback(
    (value: string) => {
      setQuery(value);
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        onSearch(value);
      }, debounceMs);
    },
    [onSearch, debounceMs]
  );

  const handleClear = () => {
    setQuery("");
    onSearch("");
  };

  useEffect(() => {
    if (expanded && inputRef.current) {
      inputRef.current.focus();
    }
  }, [expanded]);

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-center gap-2">
        <motion.div
          className="relative flex items-center"
          animate={{ width: expanded ? "100%" : "auto" }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
        >
          {expanded ? (
            <motion.div
              className="flex items-center w-full bg-background border rounded-lg overflow-hidden"
              initial={{ opacity: 0, width: 40 }}
              animate={{ opacity: 1, width: "100%" }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              <Search className="h-4 w-4 text-muted-foreground ml-3 shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => handleChange(e.target.value)}
                placeholder={placeholder}
                className="flex-1 px-3 py-2 text-sm bg-transparent text-foreground focus:outline-none"
              />
              {query && (
                <motion.button
                  onClick={handleClear}
                  className="p-2 text-muted-foreground hover:text-foreground"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <X className="h-4 w-4" />
                </motion.button>
              )}
              <button
                onClick={() => { setExpanded(false); handleClear(); }}
                className="p-2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </motion.div>
          ) : (
            <motion.button
              onClick={() => setExpanded(true)}
              className="flex items-center gap-2 px-3 py-2 text-sm bg-background border rounded-lg text-muted-foreground hover:text-foreground hover:border-foreground/20 transition-colors"
              whileTap={{ scale: 0.95 }}
            >
              <Search className="h-4 w-4" />
              <span className="hidden sm:inline">Search</span>
            </motion.button>
          )}
        </motion.div>

        {filters.length > 0 && (
          <div className="flex items-center gap-1 text-muted-foreground">
            <Filter className="h-4 w-4" />
          </div>
        )}
      </div>

      {/* Filter chips */}
      <AnimatePresence>
        {filters.length > 0 && (
          <motion.div
            className="flex flex-wrap gap-2"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
          >
            {filters.map((chip) => (
              <motion.button
                key={chip.value}
                onClick={() => onFilterToggle?.(chip.value)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                  chip.active
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
                whileTap={{ scale: 0.95 }}
                layout
              >
                {chip.label}
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SearchFilter;
