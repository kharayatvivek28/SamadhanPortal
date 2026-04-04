import { useState, useCallback, useRef, useEffect } from "react";
import { Search, Filter, X, Calendar } from "lucide-react";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";

interface FilterBarProps {
  onFilterChange: (filters: {
    search: string;
    status: string;
    priority: string;
    startDate: string;
    endDate: string;
  }) => void;
}

const FilterBar = ({ onFilterChange }: FilterBarProps) => {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);
  
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [priority, setPriority] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  const triggerChange = useCallback((newFilters: any) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      onFilterChange(newFilters);
    }, 400);
  }, [onFilterChange]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    triggerChange({ search: e.target.value, status, priority, startDate, endDate });
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStatus(e.target.value);
    triggerChange({ search, status: e.target.value, priority, startDate, endDate });
  };

  const handlePriorityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setPriority(e.target.value);
    triggerChange({ search, status, priority: e.target.value, startDate, endDate });
  };

  const handleDateChange = () => {
    triggerChange({ search, status, priority, startDate, endDate });
  };

  // When dates change, we can't reliably trigger immediately inside onChange of native date input without blur or some logic, 
  // so we use an effect to watch them.
  useEffect(() => {
    triggerChange({ search, status, priority, startDate, endDate });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startDate, endDate]);

  const clearFilters = () => {
    setSearch("");
    setStatus("");
    setPriority("");
    setStartDate("");
    setEndDate("");
    triggerChange({ search: "", status: "", priority: "", startDate: "", endDate: "" });
  };

  const hasActiveFilters = search || status || priority || startDate || endDate;

  return (
    <div className="bg-card text-card-foreground p-4 rounded-lg shadow-sm mb-6 border">
      <div className="flex flex-wrap items-center justify-between gap-4">
        
        {/* Search Input */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            className="w-full pl-9 pr-4 py-2 text-sm bg-background border rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
            placeholder={t("filter.searchPlaceholder", "Search complaints...")}
            value={search}
            onChange={handleSearchChange}
          />
        </div>

        {/* Toggle Advanced Filters (Mobile & Clean Desktop UI) */}
        <button
          onClick={() => setExpanded(!expanded)}
          className={`flex items-center gap-2 px-4 py-2 text-sm border rounded-md transition-colors ${
            hasActiveFilters ? "bg-primary/10 border-primary/20 text-primary font-medium" : "bg-background text-muted-foreground hover:bg-muted"
          }`}
        >
          <Filter className="h-4 w-4" />
          <span>{t("filter.advanced", "Filters")}</span>
        </button>

        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-1 px-3 py-2 text-sm text-destructive hover:bg-destructive/10 rounded-md transition-colors"
          >
            <X className="h-4 w-4" />
            <span className="hidden sm:inline">{t("filter.clear", "Clear")}</span>
          </button>
        )}
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0, marginTop: 0 }}
            animate={{ height: "auto", opacity: 1, marginTop: 16 }}
            exit={{ height: 0, opacity: 0, marginTop: 0 }}
            className="overflow-hidden"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-2 border-t">
              
              {/* Status Select */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">{t("filter.status", "Status")}</label>
                <select 
                  className="w-full px-3 py-2 text-sm bg-background border rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
                  value={status}
                  onChange={handleStatusChange}
                >
                  <option value="">{t("filter.all", "All")}</option>
                  <option value="Pending">{t("status.pending", "Pending")}</option>
                  <option value="Assigned">{t("status.assigned", "Assigned")}</option>
                  <option value="In Progress">{t("status.inProgress", "In Progress")}</option>
                  <option value="Resolved">{t("status.resolved", "Resolved")}</option>
                </select>
              </div>

              {/* Priority Select */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">{t("filter.priority", "Priority")}</label>
                <select 
                  className="w-full px-3 py-2 text-sm bg-background border rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
                  value={priority}
                  onChange={handlePriorityChange}
                >
                  <option value="">{t("filter.all", "All")}</option>
                  <option value="High">{t("priority.high", "High")}</option>
                  <option value="Medium">{t("priority.medium", "Medium")}</option>
                  <option value="Low">{t("priority.low", "Low")}</option>
                </select>
              </div>

              {/* Start Date */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">{t("filter.startDate", "Start Date")}</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                  <input
                    type="date"
                    className="w-full pl-9 pr-3 py-2 text-sm bg-background border rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
              </div>

              {/* End Date */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">{t("filter.endDate", "End Date")}</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                  <input
                    type="date"
                    className="w-full pl-9 pr-3 py-2 text-sm bg-background border rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FilterBar;
