
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Monitor, 
  Shield, 
  HardDrive, 
  FolderOpen, 
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  Server,
  Headphones
} from 'lucide-react';
import HelpdeskTracker from '../components/HelpdeskTracker';
import SystemUptime from '../components/SystemUptime';
import SecurityCompliance from '../components/SecurityCompliance';
import AssetManagement from '../components/AssetManagement';
import ProjectProgress from '../components/ProjectProgress';
import ReportsOverview from '../components/ReportsOverview';

const Index = () => {
  const [activeTab, setActiveTab] = useState('overview');

  // Mock data for dashboard overview
  const dashboardStats = {
    totalTickets: 147,
    resolvedTickets: 132,
    pendingTickets: 15,
    systemUptime: 99.8,
    securityIncidents: 2,
    activeProjects: 5,
    newAssets: 12,
    completedProjects: 3
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-600 rounded-lg">
                <Monitor className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">IT Performance Dashboard</h1>
                <p className="text-sm text-gray-600">Monthly reporting system for IT department metrics</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Current Month</p>
              <p className="font-semibold text-gray-900">{new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6 bg-white shadow-sm">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="helpdesk" className="flex items-center gap-2">
              <Headphones className="h-4 w-4" />
              Helpdesk
            </TabsTrigger>
            <TabsTrigger value="uptime" className="flex items-center gap-2">
              <Server className="h-4 w-4" />
              System Uptime
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Security
            </TabsTrigger>
            <TabsTrigger value="assets" className="flex items-center gap-2">
              <HardDrive className="h-4 w-4" />
              Assets
            </TabsTrigger>
            <TabsTrigger value="projects" className="flex items-center gap-2">
              <FolderOpen className="h-4 w-4" />
              Projects
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Dashboard Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="border-l-4 border-l-blue-500">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Support Tickets</CardTitle>
                  <Headphones className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{dashboardStats.totalTickets}</div>
                  <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      {dashboardStats.resolvedTickets} Resolved
                    </Badge>
                    <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                      {dashboardStats.pendingTickets} Pending
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-green-500">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">System Uptime</CardTitle>
                  <Server className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{dashboardStats.systemUptime}%</div>
                  <p className="text-xs text-muted-foreground">
                    Excellent performance this month
                  </p>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-red-500">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Security Incidents</CardTitle>
                  <Shield className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{dashboardStats.securityIncidents}</div>
                  <p className="text-xs text-muted-foreground">
                    Resolved with no impact
                  </p>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-purple-500">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
                  <FolderOpen className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{dashboardStats.activeProjects}</div>
                  <p className="text-xs text-muted-foreground">
                    {dashboardStats.completedProjects} completed this month
                  </p>
                </CardContent>
              </Card>
            </div>

            <ReportsOverview />
          </TabsContent>

          <TabsContent value="helpdesk">
            <HelpdeskTracker />
          </TabsContent>

          <TabsContent value="uptime">
            <SystemUptime />
          </TabsContent>

          <TabsContent value="security">
            <SecurityCompliance />
          </TabsContent>

          <TabsContent value="assets">
            <AssetManagement />
          </TabsContent>

          <TabsContent value="projects">
            <ProjectProgress />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Index;
