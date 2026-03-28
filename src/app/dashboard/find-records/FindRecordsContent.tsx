"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useLoading } from "@/src/context/LoadingContext";
import {
  Search,
  Filter,
  FileText,
  Calendar,
  ChevronDown,
  AlertCircle,
  X,
  Check,
} from "lucide-react";

interface Report {
  id: string;
  report_type: string;
  report_month: string;
  report_year: number;
  status: string;
}

const CATEGORY_MAP: Record<string, string> = {
  GENERAL: "General Monthly Report",
  "GENERAL REPORT": "General Monthly Report",
  "BCG/HEPA B": "BCG/Hepa B Report",
  NATALITY: "Natality Report",
  "DEWORMING AND VITAMIN A": "Deworming & Vitamin A Report",
  "TEENAGE PREGNANCY": "Teenage Pregnancy Report",
};

const MONTH_NAMES: Record<string, string> = {
  JANUARY: "January",
  FEBRUARY: "February",
  MARCH: "March",
  APRIL: "April",
  MAY: "May",
  JUNE: "June",
  JULY: "July",
  AUGUST: "August",
  SEPTEMBER: "September",
  OCTOBER: "October",
  NOVEMBER: "November",
  DECEMBER: "December",
};

const MONTH_ORDER: Record<string, number> = {
  JANUARY: 1,
  FEBRUARY: 2,
  MARCH: 3,
  APRIL: 4,
  MAY: 5,
  JUNE: 6,
  JULY: 7,
  AUGUST: 8,
  SEPTEMBER: 9,
  OCTOBER: 10,
  NOVEMBER: 11,
  DECEMBER: 12,
};

const REPORT_TYPES = [
  "GENERAL REPORT",
  "BCG/HEPA B",
  "NATALITY",
  "DEWORMING AND VITAMIN A",
  "TEENAGE PREGNANCY",
];

type ViewMode = "type" | "month";

export default function FindRecordsContent({
  reports,
}: {
  reports: Report[];
}) {
  const { startLoading } = useLoading();

  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<string>("ALL");
  const [filterYear, setFilterYear] = useState<string>("ALL");
  const [filterMonth, setFilterMonth] = useState<string>("ALL");
  const [viewMode, setViewMode] = useState<ViewMode>("type");

  const years = [...new Set(reports.map((r) => r.report_year))].sort(
    (a, b) => b - a,
  );

  const filtered = reports.filter((r) => {
    if (filterType !== "ALL" && r.report_type !== filterType) return false;
    if (filterYear !== "ALL" && r.report_year !== Number(filterYear))
      return false;
    if (filterMonth !== "ALL" && r.report_month !== filterMonth) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const displayType = CATEGORY_MAP[r.report_type] || r.report_type;
      const monthName = MONTH_NAMES[r.report_month] || r.report_month;
      const searchable =
        `${displayType} ${monthName} ${r.report_year} ${r.status}`.toLowerCase();
      if (!searchable.includes(q)) return false;
    }
    return true;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (a.report_year !== b.report_year) return b.report_year - a.report_year;
    return (MONTH_ORDER[a.report_month] || 0) - (MONTH_ORDER[b.report_month] || 0);
  });

  const hasActiveFilters =
    filterType !== "ALL" || filterYear !== "ALL" || filterMonth !== "ALL";

  const clearFilters = () => {
    setFilterType("ALL");
    setFilterYear("ALL");
    setFilterMonth("ALL");
    setSearchQuery("");
  };

  const groupedByType = sorted.reduce(
    (acc, r) => {
      const key = CATEGORY_MAP[r.report_type] || "Other Reports";
      if (!acc[key]) acc[key] = [];
      acc[key].push(r);
      return acc;
    },
    {} as Record<string, Report[]>,
  );

  const groupedByMonth = sorted.reduce(
    (acc, r) => {
      const key = `${MONTH_NAMES[r.report_month] || r.report_month} ${r.report_year}`;
      if (!acc[key]) acc[key] = [];
      acc[key].push(r);
      return acc;
    },
    {} as Record<string, Report[]>,
  );

  const grouped = viewMode === "type" ? groupedByType : groupedByMonth;

  const handleNavigate = () => {
    startLoading();
  };

  return (
    <div className="max-w-6xl mx-auto px-4 pt-8 pb-12 md:pt-12 md:pb-16 space-y-8">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm">
        <div className="flex items-center gap-5">
          <div className="relative hidden sm:block">
            <div className="absolute inset-0 bg-indigo-200 rounded-2xl animate-ping opacity-20" />
            <div className="relative bg-linear-to-br from-indigo-600 to-indigo-700 p-4 rounded-2xl shadow-xl shadow-indigo-100 border border-indigo-500/20">
              <Search className="w-15 h-15 text-white" strokeWidth={2.5} />
            </div>
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">
              Find Records
            </h1>
            <p className="text-slate-500 font-medium">
              Search and filter across all your reports.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm font-bold text-slate-400">
          <FileText className="w-5 h-5 text-indigo-500" />
          {reports.length} {reports.length === 1 ? "Record" : "Records"} Total
        </div>
      </header>

      {/* Search + Filters */}
      <div className="bg-white p-6 rounded-[1.5rem] border border-slate-200 shadow-sm space-y-4">
        {/* Search bar */}
        <div className="relative">
          <Search className="absolute left-4 top-3.5 h-5 w-5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder='Search reports... e.g. "BCG April" or "2025 General"'
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 outline-none transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-3 p-1 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X size={18} />
            </button>
          )}
        </div>

        {/* Filters — mobile: grid layout, desktop: inline row */}
        <div className="space-y-3 md:space-y-0">
          {/* Filter dropdowns */}
          <div className="flex items-center gap-2 mb-1 md:hidden">
            <Filter className="w-4 h-4 text-slate-400" />
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Filters</span>
          </div>
          <div className="grid grid-cols-2 gap-2 md:flex md:flex-wrap md:items-center md:gap-3">
            <div className="hidden md:block">
              <Filter className="w-4 h-4 text-slate-400" />
            </div>

            <div className="col-span-2">
              <CustomSelect
                value={filterType}
                onChange={setFilterType}
                fullWidth
                options={[
                  { value: "ALL", label: "All Types" },
                  ...REPORT_TYPES.map((type) => ({
                    value: type,
                    label: CATEGORY_MAP[type] || type,
                  })),
                ]}
              />
            </div>

            <div className="col-span-1">
              <CustomSelect
                value={filterMonth}
                onChange={setFilterMonth}
                fullWidth
                options={[
                  { value: "ALL", label: "All Months" },
                  ...Object.entries(MONTH_NAMES).map(([key, name]) => ({
                    value: key,
                    label: name,
                  })),
                ]}
              />
            </div>

            <div className="col-span-1">
              <CustomSelect
                value={filterYear}
                onChange={setFilterYear}
                fullWidth
                options={[
                  { value: "ALL", label: "All Years" },
                  ...years.map((year) => ({
                    value: String(year),
                    label: String(year),
                  })),
                ]}
              />
            </div>
          </div>

          {/* View toggle + Clear filters row */}
          <div className="flex items-center justify-between pt-1 md:pt-0 md:mt-3">
            <div className="flex items-center gap-2">
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="text-xs font-bold text-red-500 hover:text-red-600 px-3 py-2 rounded-lg hover:bg-red-50 transition-colors"
                >
                  Clear Filters
                </button>
              )}
            </div>

            <div className="flex items-center bg-slate-100 rounded-xl p-1">
              <button
                onClick={() => setViewMode("type")}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  viewMode === "type"
                    ? "bg-white text-teal-700 shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                By Type
              </button>
              <button
                onClick={() => setViewMode("month")}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  viewMode === "month"
                    ? "bg-white text-teal-700 shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                By Month
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="space-y-4">
        <p className="text-sm font-bold text-slate-400 px-2">
          {sorted.length} {sorted.length === 1 ? "result" : "results"} found
        </p>

        {sorted.length === 0 ? (
          <div className="bg-white rounded-[1.5rem] border border-slate-200 shadow-sm p-16 text-center">
            <AlertCircle className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-slate-700">
              No records found
            </h3>
            <p className="text-sm text-slate-400 mt-2">
              {hasActiveFilters || searchQuery
                ? "Try adjusting your filters or search query."
                : "You haven't created any reports yet."}
            </p>
          </div>
        ) : (
          Object.entries(grouped).map(([groupName, groupReports]) => (
            <div
              key={groupName}
              className="bg-white rounded-[1.5rem] border border-slate-200 shadow-sm overflow-hidden"
            >
              <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                <h3 className="font-bold text-slate-700">{groupName}</h3>
                <span className="text-xs font-bold bg-slate-200/60 text-slate-500 px-2.5 py-1 rounded-md">
                  {groupReports.length}
                </span>
              </div>
              <div className="divide-y divide-slate-100">
                {groupReports.map((report) => {
                  const displayType =
                    CATEGORY_MAP[report.report_type] || report.report_type;
                  const monthName =
                    MONTH_NAMES[report.report_month] || report.report_month;

                  return (
                    <Link
                      key={report.id}
                      href={`/dashboard/reports/${report.id}`}
                      onClick={handleNavigate}
                      className="flex items-center justify-between px-6 py-4 hover:bg-teal-50/50 transition-colors group"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 group-hover:bg-teal-100 flex items-center justify-center transition-colors">
                          <Calendar className="w-5 h-5 text-slate-400 group-hover:text-teal-600 transition-colors" />
                        </div>
                        <div>
                          <p className="font-semibold text-slate-800 group-hover:text-teal-700 transition-colors">
                            {viewMode === "month"
                              ? displayType
                              : `${monthName} ${report.report_year}`}
                          </p>
                          <p className="text-xs text-slate-400">
                            {viewMode === "month"
                              ? `${monthName} ${report.report_year}`
                              : displayType}
                          </p>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

interface SelectOption {
  value: string;
  label: string;
}

function CustomSelect({
  value,
  onChange,
  options,
  fullWidth,
}: {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  fullWidth?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const handleClickOutside = useCallback((event: MouseEvent) => {
    if (ref.current && !ref.current.contains(event.target as Node)) {
      setIsOpen(false);
    }
  }, []);

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [handleClickOutside]);

  const selectedLabel = options.find((o) => o.value === value)?.label || value;

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 bg-white border rounded-xl px-4 py-2.5 text-sm font-semibold transition-all cursor-pointer ${fullWidth ? "w-full" : "min-w-[120px]"} ${
          isOpen
            ? "border-teal-500 ring-2 ring-teal-500/50 text-teal-700"
            : value !== "ALL"
              ? "border-teal-300 bg-teal-50/50 text-teal-700"
              : "border-slate-200 text-slate-700 hover:border-slate-300"
        }`}
      >
        <span className="flex-1 text-left truncate">{selectedLabel}</span>
        <ChevronDown
          className={`w-4 h-4 shrink-0 transition-transform duration-200 ${
            isOpen ? "rotate-180 text-teal-500" : "text-slate-400"
          }`}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="absolute top-full left-0 mt-2 z-50 min-w-full w-max max-h-64 overflow-y-auto bg-white/95 backdrop-blur-xl border border-slate-200/80 rounded-2xl shadow-xl shadow-slate-200/40 py-1.5"
            initial={{ opacity: 0, y: -4, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.97 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
          >
            {options.map((option) => {
              const isSelected = option.value === value;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-colors text-left ${
                    isSelected
                      ? "bg-teal-50 text-teal-700"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  <span className="flex-1">{option.label}</span>
                  {isSelected && (
                    <Check className="w-4 h-4 text-teal-500 shrink-0" />
                  )}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
