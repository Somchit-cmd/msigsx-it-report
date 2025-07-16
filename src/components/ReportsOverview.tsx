
import React, { useEffect, useState, useRef } from 'react';
import pptxgen from 'pptxgenjs';
import { collection, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { getWeeksInMonth, getWeekOfMonth, startOfMonth, addDays, format } from 'date-fns';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { FileText, Download, TrendingUp, Calendar } from 'lucide-react';

const GEMINI_API_KEY = "AIzaSyAOwO8Dp5U7d903WkXXyCbCYiS1wlEycwY";
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=" + GEMINI_API_KEY;

const ReportsOverview = () => {
  // Ref for the report section
  const reportRef = useRef<HTMLDivElement>(null);

  // Helper to call Gemini AI
  async function getGeminiSummary(prompt: string): Promise<string> {
    const body = {
      contents: [{ parts: [{ text: prompt }] }]
    };
    const response = await fetch(GEMINI_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    const data = await response.json();
    if (data && data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts) {
      return data.candidates[0].content.parts.map((p: any) => p.text).join('\n');
    }
    return 'No summary generated.';
  }

  // Handler for Export PPTX
  async function handleExportPPTX() {
    // Gather data for summary
    const ticketSummary = ticketData.map((t: any) => `${t.name}: Opened ${t.open}, Resolved ${t.resolved}, Pending ${t.pending}`).join("; ");
    const uptimeSummary = uptimeData.map((u: any) => `${u.name}: ${u.uptime}%`).join("; ");
    const incidentSummary = securityIncidentTypes.map((i: any) => `${i.name}: ${i.value}`).join("; ");
    const projectSummary = projectStatus.map((p: any) => `${p.name}: ${p.value}`).join("; ");
    const prompt = `Summarize this IT monthly report data for a PowerPoint executive summary:\n\nTickets: ${ticketSummary}\nUptime: ${uptimeSummary}\nIncidents: ${incidentSummary}\nProjects: ${projectSummary}`;

    // Call Gemini for summary
    let aiSummary = 'Generating summary...';
    try {
      aiSummary = await getGeminiSummary(prompt);
    } catch (e) {
      aiSummary = 'AI summary failed.';
    }

    // Create PPTX
    const pptx = new pptxgen();
    // Summary Slide
    const slideSummary = pptx.addSlide();
    slideSummary.addText('Monthly IT Performance Summary', { x: 0.5, y: 0.3, fontSize: 24, bold: true });
    slideSummary.addText(aiSummary, { x: 0.5, y: 1, w: 8, h: 4, fontSize: 18, color: '363636', align: 'left' });

    // Tickets Chart slide
    const slideTickets = pptx.addSlide();
    slideTickets.addText('Weekly Support Tickets', { x: 0.5, y: 0.3, fontSize: 18, bold: true });
    slideTickets.addChart(pptx.ChartType.bar, [
      { name: 'Opened', labels: ticketData.map((t: any) => t.name), values: ticketData.map((t: any) => t.open) },
      { name: 'Resolved', labels: ticketData.map((t: any) => t.name), values: ticketData.map((t: any) => t.resolved) },
      { name: 'Pending', labels: ticketData.map((t: any) => t.name), values: ticketData.map((t: any) => t.pending) },
    ], { x: 0.5, y: 1, w: 8, h: 3 });

    // Uptime Chart slide
    const slideUptime = pptx.addSlide();
    slideUptime.addText('System Uptime Performance', { x: 0.5, y: 0.3, fontSize: 18, bold: true });
    slideUptime.addChart(pptx.ChartType.bar, [
      { name: 'Uptime', labels: uptimeData.map((u: any) => u.name), values: uptimeData.map((u: any) => u.uptime) },
    ], { x: 0.5, y: 1, w: 8, h: 3 });

    // Incidents Pie chart
    const slideIncidents = pptx.addSlide();
    slideIncidents.addText('Security Incident Types', { x: 0.5, y: 0.3, fontSize: 18, bold: true });
    slideIncidents.addChart(pptx.ChartType.pie, [
      { name: 'Incidents', labels: securityIncidentTypes.map((i: any) => i.name), values: securityIncidentTypes.map((i: any) => i.value) },
    ], { x: 1, y: 1, w: 6, h: 4 });

    // Project Status Pie chart
    const slideProjects = pptx.addSlide();
    slideProjects.addText('Project Status Distribution', { x: 0.5, y: 0.3, fontSize: 18, bold: true });
    slideProjects.addChart(pptx.ChartType.pie, [
      { name: 'Projects', labels: projectStatus.map((p: any) => p.name), values: projectStatus.map((p: any) => p.value) },
    ], { x: 1, y: 1, w: 6, h: 4 });

    pptx.writeFile({ fileName: 'IT_Performance_Report.pptx' });
  }

  // State for Firestore-powered weekly ticket data
  const [ticketData, setTicketData] = useState([]);

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'helpdesk_tickets'));
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth();
        // Custom week range calculation: Week 1 starts on the 1st, then each week starts on Monday, ends on Sunday or last day of month
        const firstDayOfMonth = startOfMonth(now);
        const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        const weekRanges = [];
        let weekStart = firstDayOfMonth;
        while (weekStart <= lastDayOfMonth) {
          let weekEnd;
          // If weekStart is not Monday, end this week on the first Sunday or last day of month
          if (weekRanges.length === 0 && weekStart.getDay() !== 1) {
            weekEnd = addDays(weekStart, 7 - weekStart.getDay()); // End on Sunday
          } else {
            weekEnd = addDays(weekStart, 6);
          }
          if (weekEnd > lastDayOfMonth) weekEnd = lastDayOfMonth;
          weekRanges.push({ start: weekStart, end: weekEnd });
          weekStart = addDays(weekEnd, 1);
        }
        const weekly = Array.from({ length: weekRanges.length }, () => ({ open: 0, resolved: 0, pending: 0 }));

        // Aggregate tickets by real calendar week
        querySnapshot.forEach(doc => {
          const data = doc.data();
          let ticketDate = data.date;
          if (ticketDate && ticketDate.seconds) {
            ticketDate = new Date(ticketDate.seconds * 1000);
          } else if (typeof ticketDate === 'string') {
            ticketDate = new Date(ticketDate);
          } else {
            ticketDate = null;
          }
          // Normalize ticketDate to local midnight for comparison
          if (ticketDate) {
            ticketDate = new Date(ticketDate.getFullYear(), ticketDate.getMonth(), ticketDate.getDate(), ticketDate.getHours(), ticketDate.getMinutes(), ticketDate.getSeconds(), ticketDate.getMilliseconds());
          }
          console.log('[DEBUG] Ticket:', data);
          console.log('[DEBUG] Parsed date:', ticketDate);
          let assignedWeek = null;
          if (ticketDate && ticketDate.getMonth() === month && ticketDate.getFullYear() === year) {
            // Find the week index this ticket falls into
            const weekIdx = weekRanges.findIndex(({ start, end }) => ticketDate >= start && ticketDate <= end);
            assignedWeek = weekIdx + 1;
            if (weekIdx >= 0) {
              if (data.ticketStatus === 'Opened') weekly[weekIdx].open++;
              else if (data.ticketStatus === 'Resolved') weekly[weekIdx].resolved++;
              else if (data.ticketStatus === 'Pending') weekly[weekIdx].pending++;
            }
          }
          console.log('[DEBUG] Assigned week:', assignedWeek);
        });
        setTicketData(
          weekly.map((w, i) => ({
            name: `Week ${i + 1}`,
            rangeLabel: `${format(weekRanges[i].start, 'd MMM')} - ${format(weekRanges[i].end, 'd MMM')}`,
            ...w
          }))
        );
      } catch (err) {
        console.error('Failed to fetch tickets:', err);
      }
    };
    fetchTickets();
  }, []);

  const uptimeData = [
    { name: 'Mail Server', uptime: 99.8 },
    { name: 'Web Server', uptime: 99.9 },
    { name: 'Database', uptime: 100.0 },
    { name: 'File Server', uptime: 99.5 },
  ];

  const securityIncidentTypes = [
    { name: 'Malware', value: 45, color: '#ef4444' },
    { name: 'Phishing', value: 30, color: '#f97316' },
    { name: 'Unauthorized Access', value: 15, color: '#eab308' },
    { name: 'Other', value: 10, color: '#22c55e' },
  ];

  const projectStatus = [
    { name: 'Completed', value: 3, color: '#22c55e' },
    { name: 'In Progress', value: 5, color: '#3b82f6' },
    { name: 'Planning', value: 2, color: '#8b5cf6' },
    { name: 'On Hold', value: 1, color: '#f59e0b' },
  ];

  const monthlyTrends = [
    { month: 'Jan', tickets: 45, incidents: 2, uptime: 99.5 },
    { month: 'Feb', tickets: 38, incidents: 1, uptime: 99.7 },
    { month: 'Mar', tickets: 52, incidents: 3, uptime: 99.2 },
    { month: 'Apr', tickets: 41, incidents: 1, uptime: 99.8 },
    { month: 'May', tickets: 47, incidents: 2, uptime: 99.6 },
    { month: 'Jun', tickets: 39, incidents: 1, uptime: 99.9 },
    { month: 'Jul', tickets: 43, incidents: 2, uptime: 99.8 },
  ];

  return (
    <div className="space-y-6" ref={reportRef}>
      {/* Report Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 sm:gap-0">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold">Monthly IT Performance Report</h2>
          <p className="text-sm sm:text-base text-gray-600">Comprehensive overview of IT department metrics</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button variant="outline" className="flex items-center gap-2 w-full sm:w-auto">
            <Calendar className="h-4 w-4" />
            Previous Month
          </Button>
          <Button className="flex items-center gap-2 w-full sm:w-auto" onClick={handleExportPPTX}>
            <Download className="h-4 w-4" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Key Metrics Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        <Card>
          <CardContent className="p-3 sm:p-4 text-center">
            <div className="text-lg sm:text-2xl font-bold text-blue-600">147</div>
            <div className="text-xs sm:text-sm text-gray-600">Total Tickets</div>
            <Badge variant="secondary" className="mt-1 bg-green-100 text-green-800 text-xs">
              +12% vs last month
            </Badge>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 sm:p-4 text-center">
            <div className="text-lg sm:text-2xl font-bold text-green-600">99.8%</div>
            <div className="text-xs sm:text-sm text-gray-600">Avg Uptime</div>
            <Badge variant="secondary" className="mt-1 bg-green-100 text-green-800 text-xs">
              +0.2% vs last month
            </Badge>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 sm:p-4 text-center">
            <div className="text-lg sm:text-2xl font-bold text-orange-600">2</div>
            <div className="text-xs sm:text-sm text-gray-600">Security Incidents</div>
            <Badge variant="secondary" className="mt-1 bg-yellow-100 text-yellow-800 text-xs">
              Same as last month
            </Badge>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 sm:p-4 text-center">
            <div className="text-lg sm:text-2xl font-bold text-purple-600">5</div>
            <div className="text-xs sm:text-sm text-gray-600">Active Projects</div>
            <Badge variant="secondary" className="mt-1 bg-blue-100 text-blue-800 text-xs">
              +1 vs last month
            </Badge>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 sm:p-4 text-center">
            <div className="text-lg sm:text-2xl font-bold text-indigo-600">12</div>
            <div className="text-xs sm:text-sm text-gray-600">New Assets</div>
            <Badge variant="secondary" className="mt-1 bg-green-100 text-green-800 text-xs">
              +3 vs last month
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Support Tickets Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Weekly Support Tickets
            </CardTitle>
            <CardDescription>Ticket volume and resolution rates</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={ticketData}>
  <CartesianGrid strokeDasharray="3 3" />
  <XAxis dataKey="name" />
  <YAxis />
  <Tooltip
    content={({ active, payload, label }) => {
      if (active && payload && payload.length) {
        const d = payload[0].payload;
        return (
          <div style={{ background: 'white', border: '1px solid #ccc', padding: 10 }}>
            <div style={{ fontWeight: 600 }}>{d.name} ({d.rangeLabel})</div>
            <div style={{ color: '#3b82f6' }}>Opened : {d.open}</div>
            <div style={{ color: '#22c55e' }}>Resolved : {d.resolved}</div>
            <div style={{ color: '#f59e0b' }}>Pending : {d.pending}</div>
          </div>
        );
      }
      return null;
    }}
  />
  <Bar dataKey="open" fill="#3b82f6" name="Opened" />
  <Bar dataKey="resolved" fill="#22c55e" name="Resolved" />
  <Bar dataKey="pending" fill="#f59e0b" name="Pending" />
</BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* System Uptime */}
        <Card>
          <CardHeader>
            <CardTitle>System Uptime Performance</CardTitle>
            <CardDescription>Server availability percentages</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={uptimeData} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" domain={[99, 100]} />
                <YAxis type="category" dataKey="name" />
                <Tooltip />
                <Bar dataKey="uptime" fill="#22c55e" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Security Incidents Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Security Incident Types</CardTitle>
            <CardDescription>Distribution of security events</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={securityIncidentTypes}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {securityIncidentTypes.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Project Status Overview */}
        <Card>
          <CardHeader>
            <CardTitle>Project Status Distribution</CardTitle>
            <CardDescription>Current status of IT projects</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={projectStatus}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {projectStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Trends */}
      <Card>
        <CardHeader>
          <CardTitle>Monthly Performance Trends</CardTitle>
          <CardDescription>Historical view of key metrics over time</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={monthlyTrends}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Line yAxisId="left" type="monotone" dataKey="tickets" stroke="#3b82f6" strokeWidth={2} name="Support Tickets" />
              <Line yAxisId="left" type="monotone" dataKey="incidents" stroke="#ef4444" strokeWidth={2} name="Security Incidents" />
              <Line yAxisId="right" type="monotone" dataKey="uptime" stroke="#22c55e" strokeWidth={2} name="Uptime %" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Executive Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Executive Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-green-600 mb-2">✅ Achievements This Month</h4>
              <ul className="space-y-1 text-sm">
                <li>• Maintained 99.8% overall system uptime</li>
                <li>• Resolved 89% of support tickets within SLA</li>
                <li>• Completed Office 365 migration project</li>
                <li>• Zero critical security breaches</li>
                <li>• Added 12 new assets to inventory</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-orange-600 mb-2">⚠️ Areas for Improvement</h4>
              <ul className="space-y-1 text-sm">
                <li>• Network infrastructure upgrade 65% complete (target: 75%)</li>
                <li>• 15 support tickets still pending resolution</li>
                <li>• Security awareness training completion at 78%</li>
                <li>• File server uptime below target (99.5% vs 99.8%)</li>
              </ul>
            </div>
          </div>
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-semibold text-blue-800 mb-2">📋 Next Month's Priorities</h4>
            <ul className="space-y-1 text-sm text-blue-700">
              <li>• Complete Phase 1 of network infrastructure upgrade</li>
              <li>• Implement new endpoint detection and response solution</li>
              <li>• Reduce average ticket resolution time by 10%</li>
              <li>• Conduct quarterly disaster recovery testing</li>
              <li>• Complete security awareness training for all staff</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReportsOverview;
