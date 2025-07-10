
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Server, AlertTriangle, CheckCircle, Clock, Activity } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

interface UptimeRecord {
  id: string;
  serverName: string;
  uptimePercentage: number;
  lastChecked: string;
  status: 'Online' | 'Offline' | 'Maintenance';
}

interface DowntimeIncident {
  id: string;
  serverName: string;
  startTime: string;
  endTime?: string;
  duration: string;
  cause: string;
  resolution: string;
  impact: 'Low' | 'Medium' | 'High' | 'Critical';
}

const SystemUptime = () => {
  const { toast } = useToast();
  
  const [servers] = useState<UptimeRecord[]>([
    {
      id: '1',
      serverName: 'Mail Server (Exchange)',
      uptimePercentage: 99.8,
      lastChecked: '2024-07-10 14:30:00',
      status: 'Online',
    },
    {
      id: '2',
      serverName: 'Web Server (IIS)',
      uptimePercentage: 99.9,
      lastChecked: '2024-07-10 14:30:00',
      status: 'Online',
    },
    {
      id: '3',
      serverName: 'Database Server (SQL)',
      uptimePercentage: 100.0,
      lastChecked: '2024-07-10 14:30:00',
      status: 'Online',
    },
    {
      id: '4',
      serverName: 'File Server (NAS)',
      uptimePercentage: 99.5,
      lastChecked: '2024-07-10 14:30:00',
      status: 'Maintenance',
    },
  ]);

  const [incidents, setIncidents] = useState<DowntimeIncident[]>([
    {
      id: '1',
      serverName: 'Mail Server (Exchange)',
      startTime: '2024-07-05 09:15:00',
      endTime: '2024-07-05 10:30:00',
      duration: '1h 15m',
      cause: 'Power outage in server room',
      resolution: 'UPS battery replaced, backup power system tested',
      impact: 'High',
    },
    {
      id: '2',
      serverName: 'File Server (NAS)',
      startTime: '2024-07-08 22:00:00',
      endTime: '2024-07-09 02:00:00',
      duration: '4h 0m',
      cause: 'Scheduled maintenance - RAID rebuild',
      resolution: 'RAID array successfully rebuilt, performance optimized',
      impact: 'Low',
    },
  ]);

  const [showIncidentForm, setShowIncidentForm] = useState(false);
  const [incidentForm, setIncidentForm] = useState({
    serverName: '',
    startTime: '',
    endTime: '',
    cause: '',
    resolution: '',
    impact: 'Medium' as const,
  });

  const handleIncidentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const startDate = new Date(incidentForm.startTime);
    const endDate = new Date(incidentForm.endTime);
    const durationMs = endDate.getTime() - startDate.getTime();
    const hours = Math.floor(durationMs / (1000 * 60 * 60));
    const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
    
    const newIncident: DowntimeIncident = {
      id: Date.now().toString(),
      ...incidentForm,
      duration: `${hours}h ${minutes}m`,
    };
    
    setIncidents([newIncident, ...incidents]);
    setIncidentForm({
      serverName: '',
      startTime: '',
      endTime: '',
      cause: '',
      resolution: '',
      impact: 'Medium',
    });
    setShowIncidentForm(false);
    
    toast({
      title: "Incident Logged",
      description: "Downtime incident has been recorded successfully.",
    });
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

  const overallUptime = servers.reduce((sum, server) => sum + server.uptimePercentage, 0) / servers.length;

  return (
    <div className="space-y-6">
      {/* Overall Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Overall Uptime</p>
                <p className="text-2xl font-bold text-green-600">{overallUptime.toFixed(1)}%</p>
              </div>
              <Activity className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Online Servers</p>
                <p className="text-2xl font-bold text-green-600">
                  {servers.filter(s => s.status === 'Online').length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Incidents</p>
                <p className="text-2xl font-bold text-orange-600">{incidents.length}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">In Maintenance</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {servers.filter(s => s.status === 'Maintenance').length}
                </p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Server Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Server className="h-5 w-5" />
            Server Uptime Status
          </CardTitle>
          <CardDescription>Current status and uptime percentage for all servers</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {servers.map((server) => (
              <div key={server.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Server className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{server.serverName}</h3>
                    <p className="text-sm text-gray-600">Last checked: {server.lastChecked}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-2xl font-bold text-green-600">{server.uptimePercentage}%</p>
                    <p className="text-sm text-gray-600">Uptime</p>
                  </div>
                  <Badge className={getStatusColor(server.status)}>
                    {getStatusIcon(server.status)}
                    {server.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Downtime Incidents */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Downtime Incidents</h2>
        <Button onClick={() => setShowIncidentForm(!showIncidentForm)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Log Incident
        </Button>
      </div>

      {/* Incident Form */}
      {showIncidentForm && (
        <Card>
          <CardHeader>
            <CardTitle>Log Downtime Incident</CardTitle>
            <CardDescription>Record a server downtime incident with details</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleIncidentSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="serverName">Server Name</Label>
                  <Input
                    id="serverName"
                    value={incidentForm.serverName}
                    onChange={(e) => setIncidentForm({...incidentForm, serverName: e.target.value})}
                    placeholder="e.g., Mail Server (Exchange)"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="impact">Impact Level</Label>
                  <Select value={incidentForm.impact} onValueChange={(value) => setIncidentForm({...incidentForm, impact: value as any})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Low">Low</SelectItem>
                      <SelectItem value="Medium">Medium</SelectItem>
                      <SelectItem value="High">High</SelectItem>
                      <SelectItem value="Critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startTime">Start Time</Label>
                  <Input
                    id="startTime"
                    type="datetime-local"
                    value={incidentForm.startTime}
                    onChange={(e) => setIncidentForm({...incidentForm, startTime: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endTime">End Time</Label>
                  <Input
                    id="endTime"
                    type="datetime-local"
                    value={incidentForm.endTime}
                    onChange={(e) => setIncidentForm({...incidentForm, endTime: e.target.value})}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="cause">Cause</Label>
                <Textarea
                  id="cause"
                  value={incidentForm.cause}
                  onChange={(e) => setIncidentForm({...incidentForm, cause: e.target.value})}
                  placeholder="What caused the downtime?"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="resolution">Resolution</Label>
                <Textarea
                  id="resolution"
                  value={incidentForm.resolution}
                  onChange={(e) => setIncidentForm({...incidentForm, resolution: e.target.value})}
                  placeholder="How was the issue resolved?"
                  required
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit">Log Incident</Button>
                <Button type="button" variant="outline" onClick={() => setShowIncidentForm(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Incidents List */}
      <div className="space-y-4">
        {incidents.map((incident) => (
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
                <div className="text-right">
                  <AlertTriangle className="h-6 w-6 text-orange-500 mb-2" />
                  <p className="text-sm text-gray-600">Duration</p>
                  <p className="font-semibold">{incident.duration}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default SystemUptime;
