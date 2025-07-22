import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Server, AlertTriangle, CheckCircle, Clock, Activity, Pencil, Trash2, RefreshCw } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { uptimeService, UptimeRecord, DowntimeIncident } from '@/services/uptimeService';
import CreateIncidentDialog from '@/components/incidents/CreateIncidentDialog';
import IncidentsTable from '@/components/incidents/IncidentsTable';
import IncidentsReportTab from '@/components/incidents/IncidentsReportTab';
import EditIncidentDialog from '@/components/incidents/EditIncidentDialog';
import ConfirmDialog from '@/components/tickets/ConfirmDialog';

interface AuthUser {
  uid: string;
  email: string;
  name: string;
}

interface SystemUptimeProps {
  user: AuthUser;
}

const SystemUptime = ({ user }: SystemUptimeProps) => {
  const { toast } = useToast();
  
  const [servers, setServers] = useState<UptimeRecord[]>([]);
  const [incidents, setIncidents] = useState<DowntimeIncident[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [incidentToDelete, setIncidentToDelete] = useState<string | null>(null);

  // Load data from database
  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const loadData = async () => {
      try {
        setLoading(true);
        
        // Initialize sample data if needed
        await uptimeService.initializeSampleData();
        
        // Load the data with calculated uptime percentages
        const [uptimeRecords, downtimeIncidents] = await Promise.all([
          uptimeService.getUptimeRecords(),
          uptimeService.getDowntimeIncidents()
        ]);
        
        setServers(uptimeRecords);
        setIncidents(downtimeIncidents);
        
        console.log('Loaded uptime data:', { servers: uptimeRecords.length, incidents: downtimeIncidents.length });
      } catch (error) {
        console.error('Error loading uptime data:', error);
        toast({
          title: "Error",
          description: "Failed to load uptime data from database. Please check your permissions.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadData();

    // Set up real-time subscriptions
    const unsubscribeUptime = uptimeService.subscribeToUptimeRecords((records) => {
      console.log('Real-time uptime update:', records.length);
      setServers(records);
    });

    const unsubscribeIncidents = uptimeService.subscribeToIncidents((incidents) => {
      console.log('Real-time incidents update:', incidents.length);
      setIncidents(incidents);
    });

    // Cleanup subscriptions on unmount
    return () => {
      unsubscribeUptime();
      unsubscribeIncidents();
    };
  }, [user, toast]);

  const handleRefreshData = async () => {
    setRefreshing(true);
    try {
      const [uptimeRecords, downtimeIncidents] = await Promise.all([
        uptimeService.getUptimeRecords(),
        uptimeService.getDowntimeIncidents()
      ]);
      
      setServers(uptimeRecords);
      setIncidents(downtimeIncidents);
      
      toast({
        title: "Data Refreshed",
        description: "Uptime data has been refreshed with latest calculations.",
      });
    } catch (error) {
      console.error('Error refreshing data:', error);
      toast({
        title: "Refresh Failed",
        description: "Failed to refresh uptime data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setRefreshing(false);
    }
  };

  const handleCreateIncident = async (incidentData: any) => {
    try {
      await uptimeService.createIncident(incidentData);
      toast({
        title: "Incident Created",
        description: "Downtime incident has been logged successfully. Uptime calculations will be updated automatically.",
      });
    } catch (error) {
      console.error('Error creating incident:', error);
      toast({
        title: "Error",
        description: "Failed to create incident. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleEditIncident = async (incidentId: string, updated: Partial<Omit<DowntimeIncident, 'id' | 'createdAt'>>) => {
    try {
      await uptimeService.updateIncident(incidentId, updated);
      toast({
        title: "Incident Updated",
        description: "The incident has been updated successfully. Uptime calculations will be recalculated.",
      });
    } catch (error) {
      console.error('Error updating incident:', error);
      toast({
        title: "Error",
        description: "Failed to update incident. Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const handleDeleteIncident = async (incidentId: string) => {
    try {
      await uptimeService.deleteIncident(incidentId);
      toast({
        title: "Incident Deleted",
        description: "The incident has been deleted successfully. Uptime percentages will be recalculated.",
      });
    } catch (error) {
      console.error('Error deleting incident:', error);
      toast({
        title: "Error",
        description: "Failed to delete incident. Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const handleDeleteClick = (incidentId: string) => {
    setIncidentToDelete(incidentId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (incidentToDelete) {
      try {
        await handleDeleteIncident(incidentToDelete);
      } catch (error) {
        // Error already handled in handleDeleteIncident
      } finally {
        setDeleteDialogOpen(false);
        setIncidentToDelete(null);
      }
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setIncidentToDelete(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Online': return 'bg-green-100 text-green-800';
      case 'Offline': return 'bg-red-100 text-red-800';
      case 'Maintenance': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Online': return <CheckCircle className="h-4 w-4" />;
      case 'Offline': return <AlertTriangle className="h-4 w-4" />;
      case 'Maintenance': return <Clock className="h-4 w-4" />;
      default: return <Server className="h-4 w-4" />;
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'Critical': return 'bg-red-500 text-white';
      case 'High': return 'bg-orange-500 text-white';
      case 'Medium': return 'bg-blue-500 text-white';
      case 'Low': return 'bg-green-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const overallUptime = servers.length > 0 ? servers.reduce((sum, server) => sum + server.uptimePercentage, 0) / servers.length : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading uptime data...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overall Statistics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600">Overall Uptime</p>
                <p className="text-lg sm:text-2xl font-bold text-green-600">{overallUptime.toFixed(1)}%</p>
              </div>
              <Activity className="h-6 w-6 sm:h-8 sm:w-8 text-green-600 self-end sm:self-auto" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600">Online Servers</p>
                <p className="text-lg sm:text-2xl font-bold text-green-600">
                  {servers.filter(s => s.status === 'Online').length}
                </p>
              </div>
              <CheckCircle className="h-6 w-6 sm:h-8 sm:w-8 text-green-600 self-end sm:self-auto" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600">Total Incidents</p>
                <p className="text-lg sm:text-2xl font-bold text-orange-600">{incidents.length}</p>
              </div>
              <AlertTriangle className="h-6 w-6 sm:h-8 sm:w-8 text-orange-600 self-end sm:self-auto" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600">In Maintenance</p>
                <p className="text-lg sm:text-2xl font-bold text-yellow-600">
                  {servers.filter(s => s.status === 'Maintenance').length}
                </p>
              </div>
              <Clock className="h-6 w-6 sm:h-8 sm:w-8 text-yellow-600 self-end sm:self-auto" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Server Status */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Server className="h-5 w-5" />
            <h2 className="text-lg font-semibold">Server Uptime Status</h2>
          </div>
          <Button 
            onClick={handleRefreshData} 
            disabled={refreshing}
            variant="outline" 
            size="sm"
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Refreshing...' : 'Refresh Data'}
          </Button>
        </div>
        <p className="text-sm text-gray-600 -mt-2">Current status and calculated uptime percentage for all servers (based on incidents in last 30 days)</p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {servers.map((server) => {
            const formatLastChecked = (dateString: string) => {
              const date = new Date(dateString);
              const now = new Date();
              const diffMs = now.getTime() - date.getTime();
              const diffMinutes = Math.floor(diffMs / (1000 * 60));
              
              if (diffMinutes < 1) return 'Just now';
              if (diffMinutes < 60) return `${diffMinutes}m ago`;
              if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)}h ago`;
              return date.toLocaleDateString();
            };

            return (
              <Card key={server.id} className={`hover:shadow-lg transition-all duration-200 border-l-4 overflow-hidden ${
                server.status === 'Online' ? 'border-green-500' :
                server.status === 'Offline' ? 'border-red-500' :
                'border-yellow-500'
              }`}>
                <CardContent className="p-5">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className={`p-2.5 rounded-lg ${
                          server.status === 'Online' ? 'bg-green-50' :
                          server.status === 'Offline' ? 'bg-red-50' :
                          'bg-yellow-50'
                        }`}>
                          <Server className={`h-5 w-5 ${
                            server.status === 'Online' ? 'text-green-600' :
                            server.status === 'Offline' ? 'text-red-600' :
                            'text-yellow-600'
                          }`} />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-800 text-lg">{server.serverName}</h3>
                          <div className="flex items-center gap-1.5 mt-1">
                            <div className={`w-2 h-2 rounded-full ${
                              server.status === 'Online' ? 'bg-green-500' :
                              server.status === 'Offline' ? 'bg-red-500' :
                              'bg-yellow-500'
                            }`} />
                            <span className="text-sm text-gray-500 capitalize">{server.status.toLowerCase()}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="pl-1">
                        <p className="text-xs text-gray-500">
                          <span className="font-medium">Last checked:</span> {formatLastChecked(server.lastChecked)}
                        </p>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="flex flex-col items-end">
                        <div className={`text-3xl font-bold ${
                          server.uptimePercentage >= 99.5 ? 'text-green-600' :
                          server.uptimePercentage >= 95 ? 'text-yellow-600' :
                          'text-red-600'
                        }`}>
                          {server.uptimePercentage.toFixed(1)}%
                        </div>
                        <div className="text-xs font-medium text-gray-500 mt-1">Uptime (30d)</div>
                        
                        {/* Uptime progress bar */}
                        <div className="w-24 h-1.5 bg-gray-200 rounded-full overflow-hidden mt-2">
                          <div 
                            className={`h-full ${
                              server.uptimePercentage >= 99.5 ? 'bg-green-500' :
                              server.uptimePercentage >= 95 ? 'bg-yellow-500' :
                              'bg-red-500'
                            }`}
                            style={{ width: `${Math.min(100, server.uptimePercentage)}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Downtime Incidents */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-0">
        <h2 className="text-lg sm:text-xl font-semibold">Downtime Incidents Management</h2>
        <CreateIncidentDialog user={user} onCreateIncident={handleCreateIncident} />
      </div>

      {/* Incidents Tabs */}
      <Tabs defaultValue="cards" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-3 max-w-lg">
          <TabsTrigger value="cards">Incident List</TabsTrigger>
          <TabsTrigger value="table" className="hidden md:block">Incident Table</TabsTrigger>
          <TabsTrigger value="report">Incident Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="cards" className="space-y-4 mt-6">
          {incidents.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Server className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No downtime incidents recorded.</p>
                <p className="text-sm text-gray-400 mt-2">All systems are running smoothly! Uptime will be calculated as 100%.</p>
              </CardContent>
            </Card>
          ) : (
            incidents.map((incident) => (
              <Card key={incident.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold">{incident.serverName}</h3>
                        <Badge className={getImpactColor(incident.impact)}>
                          {incident.impact} Impact
                        </Badge>
                        <Badge variant="outline">{incident.duration}</Badge>
                      </div>
                      <div className="space-y-2 text-sm">
                        <p><strong>Period:</strong> {incident.startTime} - {incident.endTime}</p>
                        <p><strong>Cause:</strong> {incident.cause}</p>
                        <p><strong>Resolution:</strong> {incident.resolution}</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-3">
                      <div className="text-right">
                        <AlertTriangle className="h-6 w-6 text-orange-500 mb-2" />
                        <p className="text-sm text-gray-600">Duration</p>
                        <p className="font-semibold">{incident.duration}</p>
                      </div>
                      <div className="flex gap-2">
                        <EditIncidentDialog
                          incident={incident}
                          onUpdate={(updated) => handleEditIncident(incident.id!, updated)}
                        />
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleDeleteClick(incident.id!)}
                          className="text-red-600 border-red-200 hover:bg-red-50"
                          title="Delete Incident"
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="table" className="mt-6">
          <IncidentsTable 
            incidents={incidents} 
            onEditIncident={handleEditIncident}
            onDeleteIncident={handleDeleteIncident}
          />
        </TabsContent>

        <TabsContent value="report" className="mt-6">
          <IncidentsReportTab incidents={incidents} servers={servers} />
        </TabsContent>
      </Tabs>
      
      <ConfirmDialog
        open={deleteDialogOpen}
        title="Delete Incident?"
        description="Are you sure you want to delete this incident? This action cannot be undone and will affect uptime calculations."
        confirmText="Yes, Delete"
        cancelText="Cancel"
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
        danger
      />
    </div>
  );
};

export default SystemUptime;
