import React, { useState } from "react";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, LabelList, PieChart, Pie, Cell, LineChart, Line, CartesianGrid } from "recharts";
import { WorkTicket } from "@/services/helpdeskService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Users, Clock, AlertTriangle, Briefcase, Ticket } from "lucide-react";

interface TicketsReportTabProps {
  tickets: WorkTicket[];
}

function groupTicketsBy(tickets: WorkTicket[], type: "day" | "week" | "month") {
  const map = new Map<string, { opened: number; resolved: number; pending: number }>();
  tickets.forEach((ticket) => {
    const date = ticket.createdAt.toDate();
    let key = "";
    if (type === "day") {
      key = date.toLocaleDateString();
    } else if (type === "week") {
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
    
    if (!map.has(key)) {
      map.set(key, { opened: 0, resolved: 0, pending: 0 });
    }
    
    const entry = map.get(key)!;
    if (ticket.ticketStatus === "Opened") entry.opened++;
    else if (ticket.ticketStatus === "Resolved") entry.resolved++;
    else if (ticket.ticketStatus === "Pending") entry.pending++;
  });
  
  return Array.from(map.entries())
    .sort((a, b) => (a[0] > b[0] ? 1 : -1))
    .map(([label, data]) => ({ label, ...data, total: data.opened + data.resolved + data.pending }));
}

function getStatusData(tickets: WorkTicket[]) {
  const statusCount = tickets.reduce((acc, ticket) => {
    acc[ticket.ticketStatus] = (acc[ticket.ticketStatus] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return Object.entries(statusCount).map(([status, count]) => ({
    name: status,
    value: count,
    color: status === "Opened" ? "#ef4444" : status === "Resolved" ? "#22c55e" : "#f59e0b"
  }));
}

function getCategoryData(tickets: WorkTicket[]) {
  const categoryCount = tickets.reduce((acc, ticket) => {
    acc[ticket.issueCategory] = (acc[ticket.issueCategory] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const colors = ["#3b82f6", "#8b5cf6", "#06b6d4", "#10b981", "#f59e0b", "#ef4444"];
  return Object.entries(categoryCount).map(([category, count], index) => ({
    name: category,
    value: count,
    color: colors[index % colors.length]
  }));
}

function getDepartmentData(tickets: WorkTicket[]) {
  const departmentCount = tickets.reduce((acc, ticket) => {
    acc[ticket.department] = (acc[ticket.department] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return Object.entries(departmentCount).map(([department, count]) => ({
    department,
    count
  }));
}

function getPriorityData(tickets: WorkTicket[]) {
  const priorityCount = tickets.reduce((acc, ticket) => {
    acc[ticket.priority] = (acc[ticket.priority] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return Object.entries(priorityCount).map(([priority, count]) => ({
    name: priority,
    value: count,
    color: priority === "High" ? "#ef4444" : priority === "Medium" ? "#f59e0b" : "#22c55e"
  }));
}

function getTimeSpentData(tickets: WorkTicket[], timeframe: "day" | "week" | "month") {
  const timeMap = new Map<string, number>();
  
  tickets.forEach((ticket) => {
    const date = ticket.createdAt.toDate();
    let key = "";
    if (timeframe === "day") {
      key = date.toLocaleDateString();
    } else if (timeframe === "week") {
      const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
      const days = Math.floor(
        (date.getTime() - firstDayOfYear.getTime()) / (24 * 60 * 60 * 1000)
      );
      const week = Math.ceil((days + firstDayOfYear.getDay() + 1) / 7);
      key = `W${week}`;
    } else if (timeframe === "month") {
      key = date.toLocaleDateString('en-US', { month: 'short' });
    }
    
    timeMap.set(key, (timeMap.get(key) || 0) + ticket.timeSpent);
  });
  
  return Array.from(timeMap.entries())
    .sort((a, b) => (a[0] > b[0] ? 1 : -1))
    .map(([period, timeSpent]) => ({ period, timeSpent }));
}

const TABS = [
  { key: "day", label: "Daily" },
  { key: "week", label: "Weekly" },
  { key: "month", label: "Monthly" },
] as const;

type TabKey = typeof TABS[number]["key"];

// Helper to check if a ticket is in the current period
function isTicketInCurrentPeriod(ticket: WorkTicket, period: "day" | "week" | "month") {
  const now = new Date();
  const date = ticket.createdAt.toDate();
  if (period === "day") {
    return (
      date.getFullYear() === now.getFullYear() &&
      date.getMonth() === now.getMonth() &&
      date.getDate() === now.getDate()
    );
  } else if (period === "week") {
    // ISO week calculation
    const getWeek = (d: Date) => {
      d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
      const dayNum = d.getUTCDay() || 7;
      d.setUTCDate(d.getUTCDate() + 4 - dayNum);
      const yearStart = new Date(Date.UTC(d.getUTCFullYear(),0,1));
      return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1)/7);
    };
    return (
      date.getFullYear() === now.getFullYear() &&
      getWeek(date) === getWeek(now)
    );
  } else if (period === "month") {
    return (
      date.getFullYear() === now.getFullYear() &&
      date.getMonth() === now.getMonth()
    );
  }
  return false;
}

const TicketsReportTab: React.FC<TicketsReportTabProps> = ({ tickets }) => {
  const [activeTab, setActiveTab] = useState<TabKey>("day");
  
  // Filter tickets for the current period only (for summary cards)
  const filteredTickets = tickets.filter(ticket => isTicketInCurrentPeriod(ticket, activeTab));

  // Use ALL tickets for time-based charts to show all periods
  const timeBasedData = groupTicketsBy(tickets, activeTab);
  const statusData = getStatusData(filteredTickets);
  const categoryData = getCategoryData(filteredTickets);
  const departmentData = getDepartmentData(filteredTickets);
  const priorityData = getPriorityData(filteredTickets);
  const timeSpentData = getTimeSpentData(tickets, activeTab);

  const totalTickets = filteredTickets.length;
  const avgTimeSpent = filteredTickets.length > 0 ? Math.round(filteredTickets.reduce((sum, t) => sum + t.timeSpent, 0) / filteredTickets.length) : 0;
  const resolvedRate = filteredTickets.length > 0 ? Math.round((filteredTickets.filter(t => t.ticketStatus === "Resolved").length / filteredTickets.length) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Time Range Tabs */}
      <div className="flex gap-2" role="tablist" aria-label="Ticket Granularity Tabs">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            className={`px-4 py-2 rounded-lg font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
              activeTab === tab.key
                ? "bg-blue-600 text-white shadow-lg"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
            role="tab"
            aria-selected={activeTab === tab.key}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Tickets</p>
                <p className="text-2xl font-bold text-blue-600">{totalTickets}</p>
              </div>
              <Ticket className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Resolution Rate</p>
                <p className="text-2xl font-bold text-green-600">{resolvedRate}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Time Spent</p>
                <p className="text-2xl font-bold text-purple-600">{avgTimeSpent}m</p>
              </div>
              <Clock className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Open Tickets</p>
                <p className="text-2xl font-bold text-red-600">
                  {tickets.filter(t => t.ticketStatus === "Opened").length}
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tickets Over Time - Changed to Line Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Tickets Over Time ({activeTab.charAt(0).toUpperCase() + activeTab.slice(1)})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {timeBasedData.length === 0 ? (
              <div className="flex items-center justify-center h-64 text-gray-400">
                <span>No data available</span>
              </div>
            ) : (
              <ChartContainer config={{}}>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={timeBasedData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="label" fontSize={12} />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line 
                      type="monotone" 
                      dataKey="opened" 
                      stroke="#ef4444" 
                      strokeWidth={3}
                      dot={{ fill: "#ef4444", strokeWidth: 2, r: 4 }}
                      name="Opened"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="pending" 
                      stroke="#f59e0b" 
                      strokeWidth={3}
                      dot={{ fill: "#f59e0b", strokeWidth: 2, r: 4 }}
                      name="Pending"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="resolved" 
                      stroke="#22c55e" 
                      strokeWidth={3}
                      dot={{ fill: "#22c55e", strokeWidth: 2, r: 4 }}
                      name="Resolved"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            )}
          </CardContent>
        </Card>

        {/* Tickets by Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Ticket className="h-5 w-5" />
              Tickets by Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{}}>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Tickets by Category */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5" />
              Tickets by Category
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{}}>
              {categoryData.length === 0 ? (
                <div className="flex items-center justify-center h-64 text-gray-400">
                  <span>No category data</span>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={categoryData} margin={{ top: 24, right: 24, left: 16, bottom: 36 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" fontSize={13} tickLine={false} axisLine={{ stroke: '#e5e7eb' }} label={{ value: 'Category', position: 'bottom', offset: 10 }} />
                    <YAxis allowDecimals={false} fontSize={13} tickLine={false} axisLine={{ stroke: '#e5e7eb' }} label={{ value: 'Tickets', angle: -90, position: 'insideLeft', offset: 10 }} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="value">
                      {categoryData.map((entry, idx) => (
                        <Cell key={`cell-${idx}`} fill={entry.color || '#3b82f6'} />
                      ))}
                      <LabelList dataKey="value" position="top" fontSize={14} fill="#222" />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Tickets by Department */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Tickets by Department
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{}}>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={departmentData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="department" fontSize={12} />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="count" fill="#8b5cf6">
                    <LabelList dataKey="count" position="top" />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Tickets by Priority */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Tickets by Priority
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{}}>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={priorityData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {priorityData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Time Spent Analysis */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Time Spent Analysis ({activeTab.charAt(0).toUpperCase() + activeTab.slice(1)})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{}}>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={timeSpentData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="period" fontSize={12} />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line 
                    type="monotone" 
                    dataKey="timeSpent" 
                    stroke="#06b6d4" 
                    strokeWidth={3}
                    dot={{ fill: "#06b6d4", strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Summary Insights */}
      <Card>
        <CardHeader>
          <CardTitle>Key Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-semibold text-blue-800 mb-2">Most Active Category</h4>
              <p className="text-blue-700">
                {categoryData.length > 0 && 
                  `${categoryData.reduce((max, cat) => cat.value > max.value ? cat : max).name} (${categoryData.reduce((max, cat) => cat.value > max.value ? cat : max).value} tickets)`
                }
              </p>
            </div>
            
            <div className="p-4 bg-green-50 rounded-lg">
              <h4 className="font-semibold text-green-800 mb-2">Top Department</h4>
              <p className="text-green-700">
                {departmentData.length > 0 && 
                  `${departmentData.reduce((max, dept) => dept.count > max.count ? dept : max).department} (${departmentData.reduce((max, dept) => dept.count > max.count ? dept : max).count} tickets)`
                }
              </p>
            </div>
            
            <div className="p-4 bg-purple-50 rounded-lg">
              <h4 className="font-semibold text-purple-800 mb-2">Resolution Efficiency</h4>
              <Badge variant={resolvedRate >= 80 ? "default" : resolvedRate >= 60 ? "secondary" : "destructive"}>
                {resolvedRate >= 80 ? "Excellent" : resolvedRate >= 60 ? "Good" : "Needs Improvement"}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TicketsReportTab;
