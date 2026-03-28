"use client";

import { useState, useMemo, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BarChart3,
  Filter,
  ChevronDown,
  TrendingUp,
  X,
  Check,
} from "lucide-react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface Report {
  id: string;
  report_type: string;
  report_month: string;
  report_year: number;
}

interface Indicator {
  id: string;
  label: string;
  has_gender_split: boolean;
  section_name: string;
}

interface DataEntry {
  report_id: string;
  indicator_id: string;
  value_m: number | null;
  value_f: number | null;
}

const MONTH_ORDER: Record<string, number> = {
  JANUARY: 1, FEBRUARY: 2, MARCH: 3, APRIL: 4,
  MAY: 5, JUNE: 6, JULY: 7, AUGUST: 8,
  SEPTEMBER: 9, OCTOBER: 10, NOVEMBER: 11, DECEMBER: 12,
};

const MONTH_SHORT: Record<string, string> = {
  JANUARY: "Jan", FEBRUARY: "Feb", MARCH: "Mar", APRIL: "Apr",
  MAY: "May", JUNE: "Jun", JULY: "Jul", AUGUST: "Aug",
  SEPTEMBER: "Sep", OCTOBER: "Oct", NOVEMBER: "Nov", DECEMBER: "Dec",
};

const REPORT_TYPE_LABELS: Record<string, string> = {
  "GENERAL REPORT": "General Monthly Report",
  "BCG/HEPA B": "BCG/Hepa B Report",
  NATALITY: "Natality Report",
  "DEWORMING AND VITAMIN A": "Deworming & Vitamin A",
  "TEENAGE PREGNANCY": "Teenage Pregnancy",
};

const SECTION_MAP: Record<string, string[]> = {
  "GENERAL REPORT": ["General Report - Single Value", "General Report - Split Value"],
  "BCG/HEPA B": ["BCG/HEPA B"],
  NATALITY: ["NATALITY"],
  "DEWORMING AND VITAMIN A": ["DEWORMING", "VITAMIN A"],
  "TEENAGE PREGNANCY": ["TEENAGE PREGNANCY"],
};

const CHART_COLORS = [
  "#0d9488", "#6366f1", "#f59e0b", "#ef4444", "#8b5cf6",
  "#ec4899", "#14b8a6", "#f97316", "#06b6d4", "#84cc16",
];

const PIE_COLORS = [
  "#0d9488", "#6366f1", "#f59e0b", "#ef4444", "#8b5cf6",
  "#ec4899", "#14b8a6", "#f97316",
];

// Key indicators to chart for each report type
const KEY_INDICATORS: Record<string, string[]> = {
  "GENERAL REPORT": [
    "PRENATAL VISITS", "PREG ASSESSED (1ST TRI)", "POSTPARTUM VISITS",
    "FAMILY PLANNING ACCEPTORS", "PENTA 1", "OPV 1", "PCV 1",
    "MCV 1", "ANTI PNEUMONIA", "ANTI FLU",
  ],
  "BCG/HEPA B": [], // Show all since it's a small set
  NATALITY: [
    "NO. OF LB", "NSD", "CS", "FD", "AB",
    "RHU", "CNPH", "LDH", "PRIV. HOSP.", "HOME",
    ">2500", "<2500",
  ],
  "DEWORMING AND VITAMIN A": [
    "1 - 4 DEWORMED", "5 - 9 DEWORMED", "10 - 19 DEWORMED",
    "6 - 11 MONTHS", "12 - 59 MONTHS",
  ],
  "TEENAGE PREGNANCY": [], // Show all
};

// Natality groupings for pie charts
const NATALITY_GROUPS: Record<string, string[]> = {
  "Delivery Type": ["NSD", "CS"],
  "Birth Weight": [">2500", "<2500", "Unknown"],
  "Pregnancy Outcome": ["LB", "FD", "AB"],
  "Place of Birth": ["RHU", "BMONC OTHERS", "PRIV. L-IN", "CNPH", "LDH", "PRIV. HOSP.", "HOME"],
};

export default function AnalyticsContent({
  reports,
  indicators,
  entries,
}: {
  reports: Report[];
  indicators: Indicator[];
  entries: DataEntry[];
}) {
  const years = useMemo(
    () => [...new Set(reports.map((r) => r.report_year))].sort((a, b) => b - a),
    [reports],
  );

  const reportTypes = useMemo(
    () => [...new Set(reports.map((r) => r.report_type))].sort(),
    [reports],
  );

  const [selectedType, setSelectedType] = useState<string>(
    reportTypes.includes("GENERAL REPORT") ? "GENERAL REPORT" : reportTypes[0] || "",
  );
  const [selectedYear, setSelectedYear] = useState<string>(
    years[0]?.toString() || "",
  );

  // Build lookup maps
  const reportMap = useMemo(() => {
    const map: Record<string, Report> = {};
    reports.forEach((r) => { map[r.id] = r; });
    return map;
  }, [reports]);

  const indicatorMap = useMemo(() => {
    const map: Record<string, Indicator> = {};
    indicators.forEach((ind) => { map[ind.id] = ind; });
    return map;
  }, [indicators]);

  // Filter reports by selected type and year
  const filteredReports = useMemo(
    () =>
      reports.filter(
        (r) =>
          r.report_type === selectedType &&
          r.report_year === Number(selectedYear),
      ),
    [reports, selectedType, selectedYear],
  );

  const filteredReportIds = useMemo(
    () => new Set(filteredReports.map((r) => r.id)),
    [filteredReports],
  );

  // Get relevant indicators for this report type
  const relevantIndicators = useMemo(() => {
    const sections = SECTION_MAP[selectedType] || [];
    return indicators.filter((ind) => sections.includes(ind.section_name));
  }, [indicators, selectedType]);

  // Filter entries for selected reports
  const filteredEntries = useMemo(
    () => entries.filter((e) => filteredReportIds.has(e.report_id)),
    [entries, filteredReportIds],
  );

  // Build monthly data: { month -> { indicator_id -> { m, f, total } } }
  const monthlyData = useMemo(() => {
    const data: Record<string, Record<string, { m: number; f: number; total: number }>> = {};

    filteredEntries.forEach((entry) => {
      const report = reportMap[entry.report_id];
      if (!report) return;
      const indicator = indicatorMap[entry.indicator_id];
      if (!indicator) return;

      const month = report.report_month;
      if (!data[month]) data[month] = {};

      const m = entry.value_m || 0;
      const f = entry.value_f || 0;

      if (!data[month][indicator.id]) {
        data[month][indicator.id] = { m: 0, f: 0, total: 0 };
      }
      data[month][indicator.id].m += m;
      data[month][indicator.id].f += f;
      data[month][indicator.id].total += m + f;
    });

    return data;
  }, [filteredEntries, reportMap, indicatorMap]);

  // Sorted months that have data
  const activeMonths = useMemo(
    () =>
      Object.keys(monthlyData).sort(
        (a, b) => (MONTH_ORDER[a] || 0) - (MONTH_ORDER[b] || 0),
      ),
    [monthlyData],
  );

  // Determine which indicators to chart
  const chartIndicators = useMemo(() => {
    const keyLabels = KEY_INDICATORS[selectedType];
    if (keyLabels && keyLabels.length > 0) {
      return relevantIndicators.filter((ind) =>
        keyLabels.some((k) => ind.label.toUpperCase().includes(k.toUpperCase())),
      );
    }
    return relevantIndicators;
  }, [relevantIndicators, selectedType]);

  // ---- CHART DATA BUILDERS ----

  // Monthly trend line chart data
  const trendData = useMemo(() => {
    return activeMonths.map((month) => {
      const row: Record<string, string | number> = { month: MONTH_SHORT[month] || month };
      chartIndicators.forEach((ind) => {
        const val = monthlyData[month]?.[ind.id];
        row[ind.label] = val ? val.total : 0;
      });
      return row;
    });
  }, [activeMonths, monthlyData, chartIndicators]);

  // Gender/age split bar chart data
  const genderData = useMemo(() => {
    const splitIndicators = chartIndicators.filter((ind) => ind.has_gender_split);
    const totals: Record<string, { label: string; m: number; f: number }> = {};

    splitIndicators.forEach((ind) => {
      totals[ind.id] = { label: ind.label, m: 0, f: 0 };
      activeMonths.forEach((month) => {
        const val = monthlyData[month]?.[ind.id];
        if (val) {
          totals[ind.id].m += val.m;
          totals[ind.id].f += val.f;
        }
      });
    });

    const isTeenage = selectedType === "TEENAGE PREGNANCY";

    return Object.entries(totals)
      .filter(([, v]) => v.m > 0 || v.f > 0)
      .map(([id, v]) => ({
        id,
        name: v.label.length > 20 ? v.label.slice(0, 18) + "..." : v.label,
        fullName: v.label,
        [isTeenage ? "10-14 y/o" : "Male"]: v.m,
        [isTeenage ? "15-19 y/o" : "Female"]: v.f,
      }));
  }, [chartIndicators, activeMonths, monthlyData, selectedType]);

  // Natality pie chart data
  const natalityPieData = useMemo(() => {
    if (selectedType !== "NATALITY") return {};

    // Build label -> indicator id lookup for natality indicators
    const labelToId: Record<string, string> = {};
    relevantIndicators.forEach((ind) => {
      labelToId[ind.label] = ind.id;
    });

    const result: Record<string, { name: string; value: number }[]> = {};

    Object.entries(NATALITY_GROUPS).forEach(([groupName, labels]) => {
      const items: { name: string; value: number }[] = [];
      labels.forEach((label) => {
        const indId = labelToId[label];
        if (!indId) return;
        let total = 0;
        activeMonths.forEach((month) => {
          const val = monthlyData[month]?.[indId];
          if (val) total += val.total;
        });
        if (total > 0) items.push({ name: label, value: total });
      });
      if (items.length > 0) result[groupName] = items;
    });

    return result;
  }, [selectedType, activeMonths, monthlyData, relevantIndicators]);

  // Summary stats
  const summaryStats = useMemo(() => {
    let totalRecords = 0;
    let totalM = 0;
    let totalF = 0;

    filteredEntries.forEach((e) => {
      totalM += e.value_m || 0;
      totalF += e.value_f || 0;
    });
    totalRecords = filteredReports.length;

    return { totalRecords, totalM, totalF, grandTotal: totalM + totalF };
  }, [filteredEntries, filteredReports]);

  const isTeenage = selectedType === "TEENAGE PREGNANCY";

  const hasData = filteredEntries.length > 0;

  return (
    <div className="max-w-6xl mx-auto px-4 pt-8 pb-12 md:pt-12 md:pb-16 space-y-8">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm">
        <div className="flex items-center gap-5">
          <div className="relative hidden sm:block">
            <div className="absolute inset-0 bg-violet-200 rounded-2xl animate-ping opacity-20" />
            <div className="relative bg-linear-to-br from-violet-600 to-violet-700 p-4 rounded-2xl shadow-xl shadow-violet-100 border border-violet-500/20">
              <BarChart3 className="w-15 h-15 text-white" strokeWidth={2.5} />
            </div>
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">
              Analytics
            </h1>
            <p className="text-slate-500 font-medium">
              Visualize trends across your reports.
            </p>
          </div>
        </div>
      </header>

      {/* Filters */}
      <div className="bg-white p-4 md:p-6 rounded-[1.5rem] border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2 mb-3 md:hidden">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Filters</span>
        </div>
        <div className="grid grid-cols-2 gap-2 md:flex md:flex-wrap md:items-center md:gap-3">
          <div className="hidden md:block">
            <Filter className="w-4 h-4 text-slate-400" />
          </div>

          <div className="col-span-2 md:col-span-1">
            <AnalyticsSelect
              value={selectedType}
              onChange={setSelectedType}
              fullWidth
              options={reportTypes.map((type) => ({
                value: type,
                label: REPORT_TYPE_LABELS[type] || type,
              }))}
            />
          </div>

          <div className="col-span-2 md:col-span-1">
            <AnalyticsSelect
              value={selectedYear}
              onChange={setSelectedYear}
              fullWidth
              options={years.map((year) => ({
                value: String(year),
                label: String(year),
              }))}
            />
          </div>
        </div>
      </div>

      {!hasData ? (
        <div className="bg-white rounded-[1.5rem] border border-slate-200 shadow-sm p-16 text-center">
          <BarChart3 className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-700">
            No data available
          </h3>
          <p className="text-sm text-slate-400 mt-2">
            No report entries found for {REPORT_TYPE_LABELS[selectedType] || selectedType} in {selectedYear}.
          </p>
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <SummaryCard
              label="Reports Filed"
              value={summaryStats.totalRecords}
              color="teal"
              info={`How many ${REPORT_TYPE_LABELS[selectedType] || selectedType} reports you have for ${selectedYear}.`}
            />
            <SummaryCard
              label="Total Entries"
              value={summaryStats.grandTotal}
              color="indigo"
              info={`All the numbers added up from your ${REPORT_TYPE_LABELS[selectedType] || selectedType} reports in ${selectedYear}.`}
            />
            <SummaryCard
              label={isTeenage ? "10-14 y/o Total" : "Male Total"}
              value={summaryStats.totalM}
              color="sky"
              info={
                isTeenage
                  ? `Total number of 10 to 14 year old cases from your Teenage Pregnancy reports in ${selectedYear}.`
                  : `Total number of males recorded in your ${REPORT_TYPE_LABELS[selectedType] || selectedType} reports for ${selectedYear}.`
              }
            />
            <SummaryCard
              label={isTeenage ? "15-19 y/o Total" : "Female Total"}
              value={summaryStats.totalF}
              color="rose"
              info={
                isTeenage
                  ? `Total number of 15 to 19 year old cases from your Teenage Pregnancy reports in ${selectedYear}.`
                  : `Total number of females recorded in your ${REPORT_TYPE_LABELS[selectedType] || selectedType} reports for ${selectedYear}.`
              }
            />
          </div>

          {/* Monthly Trend Chart */}
          {trendData.length > 1 && chartIndicators.length > 0 && (
            <ChartCard title="Monthly Trends" icon={<TrendingUp className="w-5 h-5" />}>
              <div className="-mx-2 md:mx-0">
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={trendData} margin={{ top: 5, right: 10, left: -15, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="#94a3b8" interval={0} />
                    <YAxis tick={{ fontSize: 10 }} stroke="#94a3b8" width={40} />
                    <Tooltip
                      contentStyle={{
                        borderRadius: "12px",
                        border: "1px solid #e2e8f0",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                        fontSize: "11px",
                        maxWidth: "200px",
                      }}
                    />
                    <Legend
                      wrapperStyle={{ fontSize: "10px", paddingTop: "8px" }}
                      iconSize={10}
                    />
                    {chartIndicators.slice(0, 6).map((ind, i) => (
                      <Line
                        key={ind.id}
                        type="monotone"
                        dataKey={ind.label}
                        stroke={CHART_COLORS[i % CHART_COLORS.length]}
                        strokeWidth={2}
                        dot={{ r: 2 }}
                        activeDot={{ r: 4 }}
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </ChartCard>
          )}

          {/* Gender / Age Split Bar Chart */}
          {genderData.length > 0 && (
            <ChartCard
              title={isTeenage ? "Age Bracket Breakdown" : "Gender Breakdown"}
              icon={<BarChart3 className="w-5 h-5" />}
            >
              {/* Desktop: horizontal bars */}
              <div className="hidden md:block">
                <ResponsiveContainer width="100%" height={Math.max(300, genderData.length * 45)}>
                  <BarChart
                    data={genderData}
                    layout="vertical"
                    margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis type="number" tick={{ fontSize: 12 }} stroke="#94a3b8" />
                    <YAxis
                      dataKey="name"
                      type="category"
                      width={120}
                      tick={{ fontSize: 11 }}
                      stroke="#94a3b8"
                    />
                    <Tooltip
                      contentStyle={{
                        borderRadius: "12px",
                        border: "1px solid #e2e8f0",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                        fontSize: "12px",
                      }}
                      formatter={(value: any, name: any) => [value, name]}
                    />
                    <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "12px" }} />
                    <Bar
                      dataKey={isTeenage ? "10-14 y/o" : "Male"}
                      fill="#0ea5e9"
                      radius={[0, 4, 4, 0]}
                    />
                    <Bar
                      dataKey={isTeenage ? "15-19 y/o" : "Female"}
                      fill="#f43f5e"
                      radius={[0, 4, 4, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              {/* Mobile: vertical bars with rotated labels */}
              <div className="md:hidden -mx-2">
                <ResponsiveContainer width="100%" height={Math.max(300, 280)}>
                  <BarChart
                    data={genderData}
                    margin={{ top: 5, right: 5, left: -10, bottom: 60 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 9 }}
                      stroke="#94a3b8"
                      angle={-45}
                      textAnchor="end"
                      interval={0}
                      height={70}
                    />
                    <YAxis tick={{ fontSize: 10 }} stroke="#94a3b8" width={35} />
                    <Tooltip
                      contentStyle={{
                        borderRadius: "12px",
                        border: "1px solid #e2e8f0",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                        fontSize: "11px",
                      }}
                      formatter={(value: any, name: any) => [value, name]}
                    />
                    <Legend wrapperStyle={{ fontSize: "10px", paddingTop: "4px" }} iconSize={10} />
                    <Bar
                      dataKey={isTeenage ? "10-14 y/o" : "Male"}
                      fill="#0ea5e9"
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar
                      dataKey={isTeenage ? "15-19 y/o" : "Female"}
                      fill="#f43f5e"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </ChartCard>
          )}

          {/* Natality Pie Charts */}
          {selectedType === "NATALITY" &&
            Object.entries(natalityPieData).length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Object.entries(natalityPieData).map(([groupName, data]) => (
                  <ChartCard key={groupName} title={groupName}>
                    {/* Desktop pie with labels */}
                    <div className="hidden md:block">
                      <ResponsiveContainer width="100%" height={280}>
                        <PieChart>
                          <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            innerRadius={55}
                            outerRadius={95}
                            paddingAngle={3}
                            dataKey="value"
                            label={({ name, percent }: any) =>
                              `${name} (${((percent || 0) * 100).toFixed(0)}%)`
                            }
                            labelLine={{ stroke: "#94a3b8" }}
                          >
                            {data.map((_, index) => (
                              <Cell
                                key={`cell-${index}`}
                                fill={PIE_COLORS[index % PIE_COLORS.length]}
                              />
                            ))}
                          </Pie>
                          <Tooltip
                            contentStyle={{
                              borderRadius: "12px",
                              border: "1px solid #e2e8f0",
                              boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                              fontSize: "12px",
                            }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    {/* Mobile pie: smaller, no labels, use legend */}
                    <div className="md:hidden">
                      <ResponsiveContainer width="100%" height={260}>
                        <PieChart>
                          <Pie
                            data={data}
                            cx="50%"
                            cy="45%"
                            innerRadius={40}
                            outerRadius={75}
                            paddingAngle={2}
                            dataKey="value"
                            label={false}
                          >
                            {data.map((_, index) => (
                              <Cell
                                key={`cell-m-${index}`}
                                fill={PIE_COLORS[index % PIE_COLORS.length]}
                              />
                            ))}
                          </Pie>
                          <Tooltip
                            contentStyle={{
                              borderRadius: "12px",
                              border: "1px solid #e2e8f0",
                              boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                              fontSize: "11px",
                            }}
                            formatter={(value: any, name: any) => [value, name]}
                          />
                          <Legend
                            wrapperStyle={{ fontSize: "10px", paddingTop: "4px" }}
                            iconSize={8}
                            layout="horizontal"
                            align="center"
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </ChartCard>
                ))}
              </div>
            )}

          {/* Top Indicators Table */}
          <TopIndicatorsTable
            monthlyData={monthlyData}
            activeMonths={activeMonths}
            relevantIndicators={relevantIndicators}
            isTeenage={isTeenage}
          />
        </>
      )}
    </div>
  );
}

function SummaryCard({
  label,
  value,
  color,
  info,
}: {
  label: string;
  value: number;
  color: string;
  info: string;
}) {
  const [showInfo, setShowInfo] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  const colorMap: Record<string, string> = {
    teal: "from-teal-500 to-teal-600 shadow-teal-200/50",
    indigo: "from-indigo-500 to-indigo-600 shadow-indigo-200/50",
    sky: "from-sky-500 to-sky-600 shadow-sky-200/50",
    rose: "from-rose-500 to-rose-600 shadow-rose-200/50",
  };

  const handleTap = () => {
    setShowInfo(true);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setShowInfo(false), 5000);
  };

  // Close on outside click (mobile)
  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (cardRef.current && !cardRef.current.contains(e.target as Node)) {
        setShowInfo(false);
        if (timerRef.current) clearTimeout(timerRef.current);
      }
    };
    if (showInfo) document.addEventListener("mousedown", handleOutside);
    return () => {
      document.removeEventListener("mousedown", handleOutside);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [showInfo]);

  return (
    <div className="relative" ref={cardRef}>
      <div
        className={`bg-linear-to-br ${colorMap[color] || colorMap.teal} rounded-2xl p-3 md:p-5 text-white shadow-lg cursor-pointer group`}
        onMouseEnter={() => setShowInfo(true)}
        onMouseLeave={() => {
          setShowInfo(false);
          if (timerRef.current) clearTimeout(timerRef.current);
        }}
        onClick={handleTap}
      >
        <p className="text-xs md:text-sm font-medium opacity-80">{label}</p>
        <p className="text-xl md:text-2xl font-black mt-1">{value.toLocaleString()}</p>
      </div>

      <AnimatePresence>
        {showInfo && (
          <motion.div
            className="absolute left-1/2 bottom-full mb-2 z-50 w-56 md:w-64 px-4 py-3 bg-slate-800/95 backdrop-blur-md text-white text-xs md:text-sm leading-relaxed font-medium rounded-xl shadow-xl shadow-slate-900/20 pointer-events-none"
            style={{ x: "-50%" }}
            initial={{ opacity: 0, y: 4, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
          >
            <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-slate-800/95" />
            {info}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ChartCard({
  title,
  icon,
  children,
}: {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-[1.5rem] border border-slate-200 shadow-sm overflow-hidden">
      <div className="px-4 md:px-6 py-3 md:py-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2">
        {icon && <span className="text-slate-400">{icon}</span>}
        <h3 className="font-bold text-slate-700 text-sm md:text-base">{title}</h3>
      </div>
      <div className="p-3 md:p-6">{children}</div>
    </div>
  );
}

function TopIndicatorsTable({
  monthlyData,
  activeMonths,
  relevantIndicators,
  isTeenage,
}: {
  monthlyData: Record<string, Record<string, { m: number; f: number; total: number }>>;
  activeMonths: string[];
  relevantIndicators: Indicator[];
  isTeenage: boolean;
}) {
  // Aggregate totals per indicator across all months
  const totals = useMemo(() => {
    const result: { id: string; label: string; m: number; f: number; total: number }[] = [];

    relevantIndicators.forEach((ind) => {
      let m = 0;
      let f = 0;
      activeMonths.forEach((month) => {
        const val = monthlyData[month]?.[ind.id];
        if (val) {
          m += val.m;
          f += val.f;
        }
      });
      const total = m + f;
      if (total > 0) result.push({ id: ind.id, label: ind.label, m, f, total });
    });

    return result.sort((a, b) => b.total - a.total).slice(0, 15);
  }, [relevantIndicators, activeMonths, monthlyData]);

  if (totals.length === 0) return null;

  return (
    <ChartCard title="Top Indicators (Year Total)">
      <div className="overflow-x-auto -mx-1 md:mx-0">
        <table className="w-full text-xs md:text-sm min-w-[320px]">
          <thead>
            <tr className="border-b border-slate-200">
              <th className="text-left py-2 md:py-3 px-2 font-bold text-slate-600">
                Indicator
              </th>
              <th className="text-right py-2 md:py-3 px-1.5 md:px-2 font-bold text-slate-600">
                {isTeenage ? "10-14" : "Male"}
              </th>
              <th className="text-right py-2 md:py-3 px-1.5 md:px-2 font-bold text-slate-600">
                {isTeenage ? "15-19" : "Female"}
              </th>
              <th className="text-right py-2 md:py-3 px-1.5 md:px-2 font-bold text-slate-600">
                Total
              </th>
            </tr>
          </thead>
          <tbody>
            {totals.map((row, i) => (
              <tr
                key={row.id}
                className={`border-b border-slate-100 ${
                  i % 2 === 0 ? "bg-slate-50/50" : ""
                }`}
              >
                <td className="py-2 md:py-2.5 px-2 font-medium text-slate-700">
                  {row.label}
                </td>
                <td className="py-2 md:py-2.5 px-1.5 md:px-2 text-right text-sky-600 font-semibold">
                  {row.m.toLocaleString()}
                </td>
                <td className="py-2 md:py-2.5 px-1.5 md:px-2 text-right text-rose-600 font-semibold">
                  {row.f.toLocaleString()}
                </td>
                <td className="py-2 md:py-2.5 px-1.5 md:px-2 text-right font-bold text-slate-800">
                  {row.total.toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </ChartCard>
  );
}

interface SelectOption {
  value: string;
  label: string;
}

function AnalyticsSelect({
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
            ? "border-violet-500 ring-2 ring-violet-500/50 text-violet-700"
            : "border-slate-200 text-slate-700 hover:border-slate-300"
        }`}
      >
        <span className="flex-1 text-left truncate">{selectedLabel}</span>
        <ChevronDown
          className={`w-4 h-4 shrink-0 transition-transform duration-200 ${
            isOpen ? "rotate-180 text-violet-500" : "text-slate-400"
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
                      ? "bg-violet-50 text-violet-700"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  <span className="flex-1">{option.label}</span>
                  {isSelected && (
                    <Check className="w-4 h-4 text-violet-500 shrink-0" />
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
