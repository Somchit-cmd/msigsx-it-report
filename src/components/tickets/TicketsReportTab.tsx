

import React, { useState } from "react";
import {
  ChartContainer,
  ChartTooltip,
  ChartLegend,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, LabelList } from "recharts";
import { WorkTicket } from "@/services/helpdeskService";

interface TicketsReportTabProps {
  tickets: WorkTicket[];
}

function groupTicketsBy(tickets: WorkTicket[], type: "day" | "week" | "month") {
  const map = new Map<string, number>();
  tickets.forEach((ticket) => {
    const date = ticket.createdAt.toDate();
    let key = "";
    if (type === "day") {
      key = date.toLocaleDateString();
    } else if (type === "week") {
      // Get year-week
      const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
      const days = Math.floor(
        (date.getTime() - firstDayOfYear.getTime()) / (24 * 60 * 60 * 1000)
      );
      const week = Math.ceil((days + firstDayOfYear.getDay() + 1) / 7);
      key = `${date.getFullYear()}-W${week}`;
    } else if (type === "month") {
      key = `${date.getFullYear()}-${(date.getMonth() + 1)
        .toString()
        .padStart(2, "0")}`;
    }
    map.set(key, (map.get(key) || 0) + 1);
  });
  // Sort keys
  return Array.from(map.entries())
    .sort((a, b) => (a[0] > b[0] ? 1 : -1))
    .map(([label, count]) => ({ label, count }));
}

const TABS = [
  { key: "day", label: "Daily" },
  { key: "week", label: "Weekly" },
  { key: "month", label: "Monthly" },
] as const;

type TabKey = typeof TABS[number]["key"];

const chartColors: Record<TabKey, string> = {
  day: "#2563eb",
  week: "#22c55e",
  month: "#f59e42",
};

const TicketsReportTab: React.FC<TicketsReportTabProps> = ({ tickets }) => {
  const [activeTab, setActiveTab] = useState<TabKey>("day");
  const grouped = {
    day: groupTicketsBy(tickets, "day"),
    week: groupTicketsBy(tickets, "week"),
    month: groupTicketsBy(tickets, "month"),
  };
  const activeData = grouped[activeTab];

  return (
    <div className="flex justify-center items-start w-full mt-6">
      <div className="w-full max-w-3xl">
        <div className="flex gap-2 mb-4" role="tablist" aria-label="Ticket Granularity Tabs">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              className={`px-4 py-2 rounded-t-lg font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                activeTab === tab.key
                  ? "bg-white shadow text-blue-700 border-b-2 border-blue-600"
                  : "bg-gray-100 text-gray-500 hover:bg-gray-200"
              }`}
              role="tab"
              aria-selected={activeTab === tab.key}
              aria-controls={`tickets-${tab.key}-panel`}
              id={`tickets-${tab.key}-tab`}
              tabIndex={activeTab === tab.key ? 0 : -1}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="bg-white rounded-lg shadow p-6 min-h-[370px]" id={`tickets-${activeTab}-panel`} role="tabpanel" aria-labelledby={`tickets-${activeTab}-tab`}>
          <h3 className="font-semibold mb-4 text-lg text-gray-800">Support Tickets Count</h3>
          {activeData.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-60 text-gray-400">
              <svg width="64" height="64" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="mb-2"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2a4 4 0 018 0v2M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2h-4.18A2 2 0 0113 3.82V3a2 2 0 00-2-2H7a2 2 0 00-2 2v16a2 2 0 002 2z" /></svg>
              <span>No tickets found for this range.</span>
            </div>
          ) : (
            <ChartContainer config={{}}>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={activeData} margin={{ top: 10, right: 16, left: 0, bottom: 32 }}>
                  <XAxis dataKey="label" fontSize={12} angle={-30} textAnchor="end" height={60} tick={{ fill: '#64748b' }} />
                  <YAxis allowDecimals={false} tick={{ fill: '#64748b' }} />
                  <Bar dataKey="count" fill={chartColors[activeTab]} radius={[6, 6, 0, 0]}>
                    <LabelList dataKey="count" position="top" fill="#334155" fontSize={13} />
                  </Bar>
                  <ChartTooltip content={<ChartTooltipContent />} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          )}
        </div>
      </div>
    </div>
  );
};

export default TicketsReportTab;
