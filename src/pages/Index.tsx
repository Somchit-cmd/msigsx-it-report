
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import LoginPage from '../components/auth/LoginPage';
import HelpdeskTracker from '../components/HelpdeskTracker';
import SystemUptime from '../components/SystemUptime';
import SecurityCompliance from '../components/SecurityCompliance';
import AssetManagement from '../components/AssetManagement';
import ProjectProgress from '../components/ProjectProgress';
import ReportsOverview from '../components/ReportsOverview';
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from '../components/AppSidebar';

interface User {
  name: string;
  email: string;
}

const Index = () => {
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

  const handleLogin = (userData: User) => {
    setUser(userData);
  };

  const handleLogout = () => {
    setUser(null);
    setActiveTab('overview');
  };

  // Show login page if user is not authenticated
  if (!user) {
    return <LoginPage onLogin={handleLogin} />;
  }

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

  const renderContent = () => {
    switch (activeTab) {
      case 'helpdesk':
        return <HelpdeskTracker user={user} />;
      case 'uptime':
        return <SystemUptime />;
      case 'security':
        return <SecurityCompliance />;
      case 'assets':
        return <AssetManagement />;
      case 'projects':
        return <ProjectProgress />;
      default:
        return (
          <div className="space-y-6">
            {/* Dashboard Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
              <Card className="border-l-4 border-l-blue-500">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Support Tickets</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{dashboardStats.totalTickets}</div>
                  <div className="flex flex-col space-y-1 mt-2">
                    <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs w-fit">
                      {dashboardStats.resolvedTickets} Resolved
                    </Badge>
                    <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 text-xs w-fit">
                      {dashboardStats.pendingTickets} Pending
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-green-500">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">System Uptime</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{dashboardStats.systemUptime}%</div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Excellent performance this month
                  </p>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-red-500">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Security Incidents</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{dashboardStats.securityIncidents}</div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Resolved with no impact
                  </p>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-purple-500">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{dashboardStats.activeProjects}</div>
                  <p className="text-xs text-muted-foreground mt-2">
                    {dashboardStats.completedProjects} completed this month
                  </p>
                </CardContent>
              </Card>
            </div>

            <ReportsOverview />
          </div>
        );
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-slate-100 to-blue-50">
        <AppSidebar 
          activeTab={activeTab} 
          setActiveTab={setActiveTab}
          user={user}
          onLogout={handleLogout}
        />
        
        <main className="flex-1 flex flex-col">
          {/* Mobile header with trigger */}
          <div className="md:hidden bg-white shadow-sm border-b">
            <div className="p-4">
              <SidebarTrigger />
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 p-6 lg:p-8 xl:p-12 max-w-7xl mx-auto w-full">
            {renderContent()}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Index;
