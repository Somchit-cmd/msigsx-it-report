import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
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
  Cell
} from 'recharts';
import { 
  AlertTriangle, 
  Clock, 
  Server, 
  TrendingUp, 
  Activity,
  Calendar
} from 'lucide-react';
import { DowntimeIncident, UptimeRecord } from '@/services/uptimeService';

interface IncidentsReportTabProps {
  incidents: DowntimeIncident[];
  servers: UptimeRecord[];
}

const IncidentsReportTab = ({ incidents, servers }: IncidentsReportTabProps) => {
  const reportData = useMemo(() => {
    // Calculate incidents by impact level
    const impactCounts = incidents.reduce((acc, incident) => {
      acc[incident.impact] = (acc[incident.impact] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Calculate incidents by server
    const serverCounts = incidents.reduce((acc, incident) => {
      acc[incident.serverName] = (acc[incident.serverName] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Calculate total downtime duration
    const totalDowntimeMinutes = incidents.reduce((total, incident) => {
      const [hours, minutes] = incident.duration.split('h ').map(part => 
        parseInt(part.replace('m', '')) || 0
      );
      return total + (hours * 60) + minutes;
    }, 0);

    // Calculate incidents by month
    const monthlyIncidents = incidents.reduce((acc, incident) => {
      const month = new Date(incident.startTime).toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short' 
      });
      acc[month] = (acc[month] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Calculate average uptime
    const averageUptime = servers.length > 0 
      ? servers.reduce((sum, server) => sum + server.uptimePercentage, 0) / servers.length 
      : 0;

    return {
      impactData: Object.entries(impactCounts).map(([impact, count]) => ({
        impact,
        count,
        color: impact === 'Critical' ? '#ef4444' : 
               impact === 'High' ? '#f97316' : 
               impact === 'Medium' ? '#3b82f6' : '#10b981'
      })),
      serverData: Object.entries(serverCounts).map(([server, count]) => ({
        server: server.replace(/\s*\([^)]*\)/, ''), // Remove parentheses content for cleaner display
        count
      })),
      monthlyData: Object.entries(monthlyIncidents).map(([month, count]) => ({
        month,
        incidents: count
      })),
      totalIncidents: incidents.length,
      totalDowntimeHours: Math.round(totalDowntimeMinutes / 60 * 10) / 10,
      averageUptime: Math.round(averageUptime * 10) / 10,
      criticalIncidents: impactCounts['Critical'] || 0,
      highImpactIncidents: impactCounts['High'] || 0
    };
  }, [incidents, servers]);

  const COLORS = ['#ef4444', '#f97316', '#3b82f6', '#10b981'];

  return (
    <div className="space-y-6">
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

      {/* Charts */}
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
            <ResponsiveContainer width="100%" height={300}>
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
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
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
            <ResponsiveContainer width="100%" height={300}>
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
                <Tooltip />
                <Bar dataKey="count" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Trend */}
      {reportData.monthlyData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Monthly Incident Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={reportData.monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="incidents" fill="#8b5cf6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Server Uptime Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Server Uptime Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {servers.map((server) => (
              <div key={server.id} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-medium">{server.serverName}</span>
                  <Badge variant={server.uptimePercentage >= 99 ? 'default' : 'destructive'}>
                    {server.uptimePercentage}%
                  </Badge>
                </div>
                <Progress 
                  value={server.uptimePercentage} 
                  className="h-2"
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Incidents Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Recent Incidents Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {incidents.slice(0, 5).map((incident) => (
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
                    {new Date(incident.startTime).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default IncidentsReportTab;
