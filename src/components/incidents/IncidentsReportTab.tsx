
import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts';
import { 
  AlertTriangle, 
  Clock, 
  Server, 
  TrendingUp, 
  Activity,
  Calendar,
  Download,
  Filter
} from 'lucide-react';
import { DowntimeIncident, UptimeRecord } from '@/services/uptimeService';
import { format, subDays, subWeeks, subMonths, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, eachDayOfInterval, eachWeekOfInterval, eachMonthOfInterval } from 'date-fns';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

interface IncidentsReportTabProps {
  incidents: DowntimeIncident[];
  servers: UptimeRecord[];
}

type ReportPeriod = 'daily' | 'weekly' | 'monthly';

const IncidentsReportTab = ({ incidents, servers }: IncidentsReportTabProps) => {
  const [reportPeriod, setReportPeriod] = useState<ReportPeriod>('daily');
  const [selectedServer, setSelectedServer] = useState<string>('all');

  const reportData = useMemo(() => {
    const now = new Date();
    let dateRange: { start: Date; end: Date };
    
    // Determine date range based on period
    switch (reportPeriod) {
      case 'daily':
        dateRange = {
          start: startOfDay(subDays(now, 29)), // Last 30 days
          end: endOfDay(now)
        };
        break;
      case 'weekly':
        dateRange = {
          start: startOfWeek(subWeeks(now, 11)), // Last 12 weeks
          end: endOfWeek(now)
        };
        break;
      case 'monthly':
        dateRange = {
          start: startOfMonth(subMonths(now, 11)), // Last 12 months
          end: endOfMonth(now)
        };
        break;
    }

    // Filter incidents by date range and server
    const filteredIncidents = incidents.filter(incident => {
      const incidentDate = new Date(incident.startTime);
      const dateMatch = incidentDate >= dateRange.start && incidentDate <= dateRange.end;
      const serverMatch = selectedServer === 'all' || incident.serverName === selectedServer;
      return dateMatch && serverMatch;
    });

    // Generate time series data
    let timeIntervals: Date[];
    let formatString: string;
    
    switch (reportPeriod) {
      case 'daily':
        timeIntervals = eachDayOfInterval(dateRange);
        formatString = 'MM/dd';
        break;
      case 'weekly':
        timeIntervals = eachWeekOfInterval(dateRange);
        formatString = 'MM/dd';
        break;
      case 'monthly':
        timeIntervals = eachMonthOfInterval(dateRange);
        formatString = 'MMM yyyy';
        break;
    }

    const timeSeriesData = timeIntervals.map(interval => {
      let intervalStart: Date;
      let intervalEnd: Date;
      
      switch (reportPeriod) {
        case 'daily':
          intervalStart = startOfDay(interval);
          intervalEnd = endOfDay(interval);
          break;
        case 'weekly':
          intervalStart = startOfWeek(interval);
          intervalEnd = endOfWeek(interval);
          break;
        case 'monthly':
          intervalStart = startOfMonth(interval);
          intervalEnd = endOfMonth(interval);
          break;
      }

      const incidentsInInterval = filteredIncidents.filter(incident => {
        const incidentDate = new Date(incident.startTime);
        return incidentDate >= intervalStart && incidentDate <= intervalEnd;
      });

      return {
        period: format(interval, formatString),
        incidents: incidentsInInterval.length,
        critical: incidentsInInterval.filter(i => i.impact === 'Critical').length,
        high: incidentsInInterval.filter(i => i.impact === 'High').length,
        medium: incidentsInInterval.filter(i => i.impact === 'Medium').length,
        low: incidentsInInterval.filter(i => i.impact === 'Low').length,
      };
    });

    // Calculate summary statistics
    const impactCounts = filteredIncidents.reduce((acc, incident) => {
      acc[incident.impact] = (acc[incident.impact] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const serverCounts = filteredIncidents.reduce((acc, incident) => {
      acc[incident.serverName] = (acc[incident.serverName] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const totalDowntimeMinutes = filteredIncidents.reduce((total, incident) => {
      const [hours, minutes] = incident.duration.split('h ').map(part => 
        parseInt(part.replace('m', '')) || 0
      );
      return total + (hours * 60) + minutes;
    }, 0);

    const averageUptime = servers.length > 0 
      ? servers.reduce((sum, server) => sum + server.uptimePercentage, 0) / servers.length 
      : 0;

    return {
      timeSeriesData,
      impactData: Object.entries(impactCounts).map(([impact, count]) => ({
        impact,
        count,
        color: impact === 'Critical' ? '#ef4444' : 
               impact === 'High' ? '#f97316' : 
               impact === 'Medium' ? '#3b82f6' : '#10b981'
      })),
      serverData: Object.entries(serverCounts).map(([server, count]) => ({
        server: server.replace(/\s*\([^)]*\)/, ''),
        count
      })),
      totalIncidents: filteredIncidents.length,
      totalDowntimeHours: Math.round(totalDowntimeMinutes / 60 * 10) / 10,
      averageUptime: Math.round(averageUptime * 10) / 10,
      criticalIncidents: impactCounts['Critical'] || 0,
      highImpactIncidents: impactCounts['High'] || 0,
      dateRange,
      filteredIncidents
    };
  }, [incidents, servers, reportPeriod, selectedServer]);

  const exportToPDF = () => {
    const doc = new jsPDF();
    const periodLabel = reportPeriod.charAt(0).toUpperCase() + reportPeriod.slice(1);
    
    // Title
    doc.setFontSize(20);
    doc.text(`${periodLabel} Incidents Report`, 20, 20);
    
    // Date range
    doc.setFontSize(12);
    doc.text(`Period: ${format(reportData.dateRange.start, 'MMM dd, yyyy')} - ${format(reportData.dateRange.end, 'MMM dd, yyyy')}`, 20, 30);
    
    if (selectedServer !== 'all') {
      doc.text(`Server: ${selectedServer}`, 20, 40);
    }
    
    // Summary statistics
    let yPos = selectedServer !== 'all' ? 55 : 45;
    doc.setFontSize(14);
    doc.text('Summary Statistics:', 20, yPos);
    yPos += 10;
    
    doc.setFontSize(11);
    doc.text(`• Total Incidents: ${reportData.totalIncidents}`, 25, yPos);
    yPos += 8;
    doc.text(`• Critical Incidents: ${reportData.criticalIncidents}`, 25, yPos);
    yPos += 8;
    doc.text(`• Total Downtime: ${reportData.totalDowntimeHours} hours`, 25, yPos);
    yPos += 8;
    doc.text(`• Average Uptime: ${reportData.averageUptime}%`, 25, yPos);
    yPos += 15;
    
    // Incidents table
    if (reportData.filteredIncidents.length > 0) {
      const tableData = reportData.filteredIncidents.slice(0, 20).map(incident => [
        incident.serverName,
        incident.impact,
        format(new Date(incident.startTime), 'MM/dd/yyyy HH:mm'),
        incident.duration,
        incident.cause.substring(0, 50) + (incident.cause.length > 50 ? '...' : '')
      ]);
      
      (doc as any).autoTable({
        head: [['Server', 'Impact', 'Start Time', 'Duration', 'Cause']],
        body: tableData,
        startY: yPos,
        theme: 'striped',
        styles: { fontSize: 9 },
        headStyles: { fillColor: [66, 139, 202] }
      });
    }
    
    doc.save(`incidents-report-${reportPeriod}-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
  };

  const COLORS = ['#ef4444', '#f97316', '#3b82f6', '#10b981'];

  return (
    <div className="space-y-6">
      {/* Report Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <Tabs value={reportPeriod} onValueChange={(value) => setReportPeriod(value as ReportPeriod)}>
            <TabsList>
              <TabsTrigger value="daily">Daily</TabsTrigger>
              <TabsTrigger value="weekly">Weekly</TabsTrigger>
              <TabsTrigger value="monthly">Monthly</TabsTrigger>
            </TabsList>
          </Tabs>
          
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            <select 
              value={selectedServer} 
              onChange={(e) => setSelectedServer(e.target.value)}
              className="px-3 py-1 border rounded-md text-sm bg-background"
            >
              <option value="all">All Servers</option>
              {servers.map(server => (
                <option key={server.id} value={server.serverName}>
                  {server.serverName}
                </option>
              ))}
            </select>
          </div>
        </div>
        
        <Button onClick={exportToPDF} variant="outline" size="sm" className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          Export PDF
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Incidents</p>
                <p className="text-2xl font-bold text-red-600">{reportData.totalIncidents}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Downtime</p>
                <p className="text-2xl font-bold text-orange-600">{reportData.totalDowntimeHours}h</p>
              </div>
              <Clock className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Average Uptime</p>
                <p className="text-2xl font-bold text-green-600">{reportData.averageUptime}%</p>
              </div>
              <Activity className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Critical Incidents</p>
                <p className="text-2xl font-bold text-red-500">{reportData.criticalIncidents}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Time Series Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Incidents Trend - {reportPeriod.charAt(0).toUpperCase() + reportPeriod.slice(1)}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              incidents: { label: "Total Incidents", color: "#3b82f6" },
              critical: { label: "Critical", color: "#ef4444" },
              high: { label: "High", color: "#f97316" },
            }}
            className="h-[300px] w-full"
          >
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={reportData.timeSeriesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="period" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line 
                  type="monotone" 
                  dataKey="incidents" 
                  stroke="var(--color-incidents)" 
                  strokeWidth={2}
                  name="Total Incidents"
                />
                <Line 
                  type="monotone" 
                  dataKey="critical" 
                  stroke="var(--color-critical)" 
                  strokeWidth={2}
                  name="Critical"
                />
                <Line 
                  type="monotone" 
                  dataKey="high" 
                  stroke="var(--color-high)" 
                  strokeWidth={2}
                  name="High Impact"
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Incidents by Impact Level */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Incidents by Impact Level
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                Critical: { label: "Critical", color: "#ef4444" },
                High: { label: "High", color: "#f97316" },
                Medium: { label: "Medium", color: "#3b82f6" },
                Low: { label: "Low", color: "#10b981" },
              }}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={reportData.impactData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ impact, count }) => `${impact}: ${count}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {reportData.impactData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Incidents by Server */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Server className="h-5 w-5" />
              Incidents by Server
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                count: { label: "Incidents", color: "#3b82f6" },
              }}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={reportData.serverData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="server" 
                    angle={-45}
                    textAnchor="end"
                    height={80}
                    fontSize={12}
                  />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="count" fill="var(--color-count)" />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Incidents Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Recent Incidents Summary ({reportPeriod})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {reportData.filteredIncidents.slice(0, 10).map((incident) => (
              <div key={incident.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm">{incident.serverName}</span>
                    <Badge className={
                      incident.impact === 'Critical' ? 'bg-red-500 text-white' :
                      incident.impact === 'High' ? 'bg-orange-500 text-white' :
                      incident.impact === 'Medium' ? 'bg-blue-500 text-white' :
                      'bg-green-500 text-white'
                    }>
                      {incident.impact}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-600 truncate">{incident.cause}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">{incident.duration}</p>
                  <p className="text-xs text-gray-500">
                    {format(new Date(incident.startTime), 'MM/dd HH:mm')}
                  </p>
                </div>
              </div>
            ))}
            {reportData.filteredIncidents.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Server className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No incidents found for the selected period.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default IncidentsReportTab;
