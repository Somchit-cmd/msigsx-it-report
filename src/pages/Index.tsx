import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import LoginPage from '../components/auth/LoginPage';
import HelpdeskTracker from '../components/HelpdeskTracker';
import SystemUptime from '../components/SystemUptime';
import SecurityCompliance from '../components/SecurityCompliance';
import AssetManagement from '../components/AssetManagement';
import ProjectProgress from '../components/ProjectProgress';
import ReportsOverview from '../components/ReportsOverview';
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from '../components/AppSidebar';
import { useFirebaseAuth } from '../hooks/useFirebaseAuth';
import { useDashboardData } from '../hooks/useDashboardData';

const Index = () => {
  const { user, loading: authLoading, login, logout } = useFirebaseAuth();
  const [activeTab, setActiveTab] = useState('overview');
  
  // Initialize dashboard data with default values
  const defaultDashboardStats = {
    totalTickets: 0,
    resolvedTickets: 0,
    pendingTickets: 0,
    systemUptime: 0,
    securityIncidents: 0,
    activeProjects: 0,
    newAssets: 0,
    completedProjects: 0,
  };
  
  // Fetch dashboard data - hook is always called but only uses user.uid when available
  const { stats: dashboardStats = defaultDashboardStats, loading: dashboardLoading, error } = 
    useDashboardData(user?.uid);

  // Show loading spinner while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-100 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Show login page if user is not authenticated
  if (!user) {
    return <LoginPage onLogin={login} loading={authLoading} />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'helpdesk':
        return <HelpdeskTracker user={user} />;
      case 'uptime':
        return <SystemUptime user={user} />;
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
                  {dashboardLoading ? (
                    <div className="space-y-2">
                      <Skeleton className="h-6 w-16" />
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-4 w-20" />
                    </div>
                  ) : error ? (
                    <p className="text-sm text-red-500">Error loading data</p>
                  ) : (
                    <>
                      <div className="text-2xl font-bold">{dashboardStats.totalTickets}</div>
                      <div className="flex flex-col space-y-1 mt-2">
                        <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs w-fit">
                          {dashboardStats.resolvedTickets} Resolved
                        </Badge>
                        <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 text-xs w-fit">
                          {dashboardStats.pendingTickets} Pending
                        </Badge>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-green-500">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">System Uptime</CardTitle>
                </CardHeader>
                <CardContent>
                  {dashboardLoading ? (
                    <div className="space-y-2">
                      <Skeleton className="h-6 w-16" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                  ) : error ? (
                    <p className="text-sm text-red-500">Error loading data</p>
                  ) : (
                    <>
                      <div className="text-2xl font-bold">{dashboardStats.systemUptime}%</div>
                      <p className="text-xs text-muted-foreground mt-2">
                        {dashboardStats.systemUptime > 99.5 ? 'Excellent' : 
                         dashboardStats.systemUptime > 99 ? 'Good' : 
                         'Needs attention'} performance this month
                      </p>
                    </>
                  )}
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-red-500">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Security Incidents</CardTitle>
                </CardHeader>
                <CardContent>
                  {dashboardLoading ? (
                    <div className="space-y-2">
                      <Skeleton className="h-6 w-8" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                  ) : error ? (
                    <p className="text-sm text-red-500">Error loading data</p>
                  ) : (
                    <>
                      <div className="text-2xl font-bold">{dashboardStats.securityIncidents}</div>
                      <p className="text-xs text-muted-foreground mt-2">
                        {dashboardStats.securityIncidents === 0 ? 'No incidents this month' : 'Review in Security tab'}
                      </p>
                    </>
                  )}
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-purple-500">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
                </CardHeader>
                <CardContent>
                  {dashboardLoading ? (
                    <div className="space-y-2">
                      <Skeleton className="h-6 w-8" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                  ) : error ? (
                    <p className="text-sm text-red-500">Error loading data</p>
                  ) : (
                    <>
                      <div className="text-2xl font-bold">{dashboardStats.activeProjects}</div>
                      <p className="text-xs text-muted-foreground mt-2">
                        {dashboardStats.completedProjects} completed this month
                      </p>
                    </>
                  )}
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-yellow-500">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">New Assets</CardTitle>
                </CardHeader>
                <CardContent>
                  {dashboardLoading ? (
                    <div className="space-y-2">
                      <Skeleton className="h-6 w-8" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                  ) : error ? (
                    <p className="text-sm text-red-500">Error loading data</p>
                  ) : (
                    <>
                      <div className="text-2xl font-bold">{dashboardStats.newAssets}</div>
                      <p className="text-xs text-muted-foreground mt-2">
                        Added this month
                      </p>
                    </>
                  )}
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
          onLogout={logout}
        />
        
        <main className="flex-1 flex flex-col">
          {/* Mobile header with trigger */}
          <div className="md:hidden bg-white shadow-sm border-b">
            <div className="p-4">
              <SidebarTrigger />
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 p-6 lg:p-8 xl:p-10 max-w-10xl mx-auto w-full">
            {renderContent()}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Index;
