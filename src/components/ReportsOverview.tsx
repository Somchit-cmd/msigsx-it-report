
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { FileText, Download, TrendingUp, Calendar } from 'lucide-react';

const ReportsOverview = () => {
  // Mock data for charts
  const ticketData = [
    { name: 'Week 1', open: 12, resolved: 15, pending: 3 },
    { name: 'Week 2', open: 18, resolved: 16, pending: 5 },
    { name: 'Week 3', open: 15, resolved: 20, pending: 2 },
    { name: 'Week 4', open: 20, resolved: 18, pending: 4 },
  ];

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
    <div className="space-y-6">
      {/* Report Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Monthly IT Performance Report</h2>
          <p className="text-gray-600">Comprehensive overview of IT department metrics</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Previous Month
          </Button>
          <Button className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Key Metrics Summary */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">147</div>
            <div className="text-sm text-gray-600">Total Tickets</div>
            <Badge variant="secondary" className="mt-1 bg-green-100 text-green-800">
              +12% vs last month
            </Badge>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">99.8%</div>
            <div className="text-sm text-gray-600">Avg Uptime</div>
            <Badge variant="secondary" className="mt-1 bg-green-100 text-green-800">
              +0.2% vs last month
            </Badge>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">2</div>
            <div className="text-sm text-gray-600">Security Incidents</div>
            <Badge variant="secondary" className="mt-1 bg-yellow-100 text-yellow-800">
              Same as last month
            </Badge>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">5</div>
            <div className="text-sm text-gray-600">Active Projects</div>
            <Badge variant="secondary" className="mt-1 bg-blue-100 text-blue-800">
              +1 vs last month
            </Badge>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-indigo-600">12</div>
            <div className="text-sm text-gray-600">New Assets</div>
            <Badge variant="secondary" className="mt-1 bg-green-100 text-green-800">
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
                <Tooltip />
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
