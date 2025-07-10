
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
        <div className="mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-0">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="p-1.5 sm:p-2 bg-blue-600 rounded-lg">
                <Monitor className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg sm:text-2xl font-bold text-gray-900">IT Performance Dashboard</h1>
                <p className="text-xs sm:text-sm text-gray-600 hidden sm:block">Monthly reporting system for IT department metrics</p>
              </div>
            </div>
            <div className="text-left sm:text-right">
              <p className="text-xs sm:text-sm text-gray-600">Current Month</p>
              <p className="text-sm sm:text-base font-semibold text-gray-900">{new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 sm:space-y-6">
          {/* Mobile: Scrollable tabs, Desktop: Grid */}
          <div className="w-full overflow-x-auto sm:overflow-x-visible">
            <TabsList className="flex sm:grid w-max sm:w-full sm:grid-cols-6 bg-white shadow-sm min-w-full sm:min-w-0 gap-1 p-1">
              <TabsTrigger value="overview" className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-2 whitespace-nowrap">
                <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="text-xs sm:text-sm">Overview</span>
              </TabsTrigger>
              <TabsTrigger value="helpdesk" className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-2 whitespace-nowrap">
                <Headphones className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="text-xs sm:text-sm">Helpdesk</span>
              </TabsTrigger>
              <TabsTrigger value="uptime" className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-2 whitespace-nowrap">
                <Server className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="text-xs sm:text-sm">Uptime</span>
              </TabsTrigger>
              <TabsTrigger value="security" className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-2 whitespace-nowrap">
                <Shield className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="text-xs sm:text-sm">Security</span>
              </TabsTrigger>
              <TabsTrigger value="assets" className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-2 whitespace-nowrap">
                <HardDrive className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="text-xs sm:text-sm">Assets</span>
              </TabsTrigger>
              <TabsTrigger value="projects" className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-2 whitespace-nowrap">
                <FolderOpen className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="text-xs sm:text-sm">Projects</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="overview" className="space-y-4 sm:space-y-6">
            {/* Dashboard Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
              <Card className="border-l-4 border-l-blue-500">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xs sm:text-sm font-medium">Support Tickets</CardTitle>
                  <Headphones className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent className="p-3 sm:p-6">
                  <div className="text-xl sm:text-2xl font-bold">{dashboardStats.totalTickets}</div>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-2 space-y-1 sm:space-y-0 text-xs text-muted-foreground">
                    <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs">
                      {dashboardStats.resolvedTickets} Resolved
                    </Badge>
                    <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 text-xs">
                      {dashboardStats.pendingTickets} Pending
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-green-500">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xs sm:text-sm font-medium">System Uptime</CardTitle>
                  <Server className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent className="p-3 sm:p-6">
                  <div className="text-xl sm:text-2xl font-bold">{dashboardStats.systemUptime}%</div>
                  <p className="text-xs text-muted-foreground">
                    Excellent performance this month
                  </p>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-red-500">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xs sm:text-sm font-medium">Security Incidents</CardTitle>
                  <Shield className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent className="p-3 sm:p-6">
                  <div className="text-xl sm:text-2xl font-bold">{dashboardStats.securityIncidents}</div>
                  <p className="text-xs text-muted-foreground">
                    Resolved with no impact
                  </p>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-purple-500">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xs sm:text-sm font-medium">Active Projects</CardTitle>
                  <FolderOpen className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent className="p-3 sm:p-6">
                  <div className="text-xl sm:text-2xl font-bold">{dashboardStats.activeProjects}</div>
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
