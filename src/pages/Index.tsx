
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
  <div className="flex flex-row items-center justify-between gap-2">
    <div className="flex items-center space-x-2 sm:space-x-3">
      <div className="p-1.5 sm:p-2 rounded-lg">
        <img src="assets/msigsx_it_dev.png" alt="MSIGSX IT" className="h-12 w-12 sm:h-16 sm:w-16" />
      </div>
      <div className="flex flex-col">
        <h1 className="text-lg sm:text-2xl font-bold text-gray-900">IT Performance Dashboard</h1>
        <p className="text-xs sm:text-sm text-gray-600 hidden sm:block">Monthly reporting system for IT department metrics</p>
      </div>
    </div>
    <div className="text-right min-w-[90px]">
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
            <TabsList className="flex sm:grid w-full sm:w-full sm:grid-cols-6 bg-white shadow-sm min-w-full sm:min-w-0 gap-2 p-2 py-2">
              <TabsTrigger value="overview" className={`flex items-center justify-center sm:h-full gap-3 sm:gap-2 px-4 sm:px-3 py-3 sm:py-0 whitespace-nowrap ${activeTab === 'overview' ? 'text-blue-600' : ''}`}>
                <TrendingUp className={`h-5 w-5 sm:h-4 sm:w-4 ${activeTab === 'overview' ? 'text-blue-600' : ''}`} />
                <span className={`text-base sm:text-sm tab-label ${activeTab === 'overview' ? 'text-blue-600' : ''}`}>Overview</span>
              </TabsTrigger>
              <TabsTrigger value="helpdesk" className={`flex items-center justify-center sm:h-full gap-3 sm:gap-2 px-4 sm:px-3 py-3 sm:py-0 whitespace-nowrap ${activeTab === 'helpdesk' ? 'text-blue-600' : ''}`}>
                <Headphones className={`h-5 w-5 sm:h-4 sm:w-4 ${activeTab === 'helpdesk' ? 'text-blue-600' : ''}`} />
                <span className={`text-base sm:text-sm tab-label ${activeTab === 'helpdesk' ? 'text-blue-600' : ''}`}>Helpdesk</span>
              </TabsTrigger>
              <TabsTrigger value="uptime" className={`flex items-center justify-center sm:h-full gap-3 sm:gap-2 px-4 sm:px-3 py-3 sm:py-0 whitespace-nowrap ${activeTab === 'uptime' ? 'text-blue-600' : ''}`}>
                <Server className={`h-5 w-5 sm:h-4 sm:w-4 ${activeTab === 'uptime' ? 'text-blue-600' : ''}`} />
                <span className={`text-base sm:text-sm tab-label ${activeTab === 'uptime' ? 'text-blue-600' : ''}`}>Uptime</span>
              </TabsTrigger>
              <TabsTrigger value="security" className={`flex items-center justify-center sm:h-full gap-3 sm:gap-2 px-4 sm:px-3 py-3 sm:py-0 whitespace-nowrap ${activeTab === 'security' ? 'text-blue-600' : ''}`}>
                <Shield className={`h-5 w-5 sm:h-4 sm:w-4 ${activeTab === 'security' ? 'text-blue-600' : ''}`} />
                <span className={`text-base sm:text-sm tab-label ${activeTab === 'security' ? 'text-blue-600' : ''}`}>Security</span>
              </TabsTrigger>
              <TabsTrigger value="assets" className={`flex items-center justify-center sm:h-full gap-3 sm:gap-2 px-4 sm:px-3 py-3 sm:py-0 whitespace-nowrap ${activeTab === 'assets' ? 'text-blue-600' : ''}`}>
                <HardDrive className={`h-5 w-5 sm:h-4 sm:w-4 ${activeTab === 'assets' ? 'text-blue-600' : ''}`} />
                <span className={`text-base sm:text-sm tab-label ${activeTab === 'assets' ? 'text-blue-600' : ''}`}>Assets</span>
              </TabsTrigger>
              <TabsTrigger value="projects" className={`flex items-center justify-center sm:h-full gap-3 sm:gap-2 px-4 sm:px-3 py-3 sm:py-0 whitespace-nowrap mr-2 rounded-r-xl ${activeTab === 'projects' ? 'text-blue-600' : ''}`}>
                <FolderOpen className={`h-5 w-5 sm:h-4 sm:w-4 ${activeTab === 'projects' ? 'text-blue-600' : ''}`} />
                <span className={`text-base sm:text-sm tab-label ${activeTab === 'projects' ? 'text-blue-600' : ''}`}>Projects</span>
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

// Responsive CSS: Hide tab text on mobile
const tabLabelStyle = `
  @media (max-width: 767px) {
    .tab-label {
      display: none;
    }
  }
`;

export default () => (
  <>
    <style>{tabLabelStyle}</style>
    <Index />
  </>
);

// Original default export
// export default Index;
