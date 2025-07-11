
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LogOut } from 'lucide-react';
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
          <div className="space-y-4 sm:space-y-6">
            {/* Dashboard Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
              <Card className="border-l-4 border-l-blue-500">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xs sm:text-sm font-medium">Support Tickets</CardTitle>
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
          </div>
        );
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-slate-100 to-blue-50">
        <AppSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <header className="bg-white shadow-sm border-b">
            <div className="mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-4">
              <div className="flex flex-row items-center justify-between gap-2">
                <div className="flex items-center space-x-2 sm:space-x-3">
                  {/* Mobile menu trigger - always visible on mobile */}
                  <div className="md:hidden">
                    <SidebarTrigger />
                  </div>
                  <div className="p-1.5 sm:p-2 rounded-lg">
                    <img src="assets/msigsx_it_dev.png" alt="MSIGSX IT" className="h-12 w-12 sm:h-16 sm:w-16" />
                  </div>
                  <div className="flex flex-col">
                    <h1 className="text-lg sm:text-2xl font-bold text-gray-900">IT Performance Dashboard</h1>
                    <p className="text-xs sm:text-sm text-gray-600 hidden sm:block">Monthly reporting system for IT department metrics</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 sm:gap-4">
                  <div className="text-right min-w-[90px]">
                    <p className="text-xs sm:text-sm text-gray-600">Welcome, {user.name}</p>
                    <p className="text-sm sm:text-base font-semibold text-gray-900">{new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
                  </div>
                  <Button variant="outline" size="sm" onClick={handleLogout} className="flex items-center gap-1">
                    <LogOut className="h-4 w-4" />
                    <span className="hidden sm:inline">Logout</span>
                  </Button>
                </div>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
            {renderContent()}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Index;
