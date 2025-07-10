
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Shield, AlertTriangle, Bug, Lock, Scan } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

interface SecurityIncident {
  id: string;
  title: string;
  description: string;
  type: 'Malware' | 'Phishing' | 'Unauthorized Access' | 'Data Breach' | 'System Vulnerability' | 'Other';
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  status: 'Open' | 'Investigating' | 'Resolved' | 'Closed';
  detectedDate: string;
  resolvedDate?: string;
  affectedSystems: string;
  actionsTaken: string;
}

interface MalwareDetection {
  id: string;
  threatName: string;
  detectionDate: string;
  affectedDevice: string;
  action: 'Quarantined' | 'Removed' | 'Blocked' | 'Monitored';
  riskLevel: 'Low' | 'Medium' | 'High' | 'Critical';
}

const SecurityCompliance = () => {
  const { toast } = useToast();
  
  const [incidents, setIncidents] = useState<SecurityIncident[]>([
    {
      id: '1',
      title: 'Suspicious login attempts detected',
      description: 'Multiple failed login attempts from unknown IP address',
      type: 'Unauthorized Access',
      severity: 'Medium',
      status: 'Resolved',
      detectedDate: '2024-07-08',
      resolvedDate: '2024-07-08',
      affectedSystems: 'Domain Controller',
      actionsTaken: 'IP blocked, user accounts secured, passwords reset',
    },
    {
      id: '2',
      title: 'Phishing email campaign targeting finance team',
      description: 'Malicious emails with fake invoice attachments',
      type: 'Phishing',
      severity: 'High',
      status: 'Investigating',
      detectedDate: '2024-07-09',
      affectedSystems: 'Email system, Finance department workstations',
      actionsTaken: 'Emails quarantined, users notified, security awareness training scheduled',
    },
  ]);

  const [malwareDetections, setMalwareDetections] = useState<MalwareDetection[]>([
    {
      id: '1',
      threatName: 'Trojan.Win32.Agent',
      detectionDate: '2024-07-07',
      affectedDevice: 'WORKSTATION-05 (John.Doe)',
      action: 'Quarantined',
      riskLevel: 'High',
    },
    {
      id: '2',
      threatName: 'Adware.Generic',
      detectionDate: '2024-07-06',
      affectedDevice: 'LAPTOP-12 (Jane.Smith)',
      action: 'Removed',
      riskLevel: 'Low',
    },
    {
      id: '3',
      threatName: 'PUA.InstallCore',
      detectionDate: '2024-07-05',
      affectedDevice: 'WORKSTATION-03 (Mike.Johnson)',
      action: 'Removed',
      riskLevel: 'Medium',
    },
  ]);

  const [showIncidentForm, setShowIncidentForm] = useState(false);
  const [showMalwareForm, setShowMalwareForm] = useState(false);
  
  const [incidentForm, setIncidentForm] = useState({
    title: '',
    description: '',
    type: 'Other' as const,
    severity: 'Medium' as const,
    affectedSystems: '',
    actionsTaken: '',
  });

  const [malwareForm, setMalwareForm] = useState({
    threatName: '',
    affectedDevice: '',
    action: 'Quarantined' as const,
    riskLevel: 'Medium' as const,
  });

  const handleIncidentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newIncident: SecurityIncident = {
      id: Date.now().toString(),
      ...incidentForm,
      status: 'Open',
      detectedDate: new Date().toISOString().split('T')[0],
    };
    setIncidents([newIncident, ...incidents]);
    setIncidentForm({
      title: '',
      description: '',
      type: 'Other',
      severity: 'Medium',
      affectedSystems: '',
      actionsTaken: '',
    });
    setShowIncidentForm(false);
    toast({
      title: "Security Incident Logged",
      description: "Security incident has been recorded and is being tracked.",
    });
  };

  const handleMalwareSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newDetection: MalwareDetection = {
      id: Date.now().toString(),
      ...malwareForm,
      detectionDate: new Date().toISOString().split('T')[0],
    };
    setMalwareDetections([newDetection, ...malwareDetections]);
    setMalwareForm({
      threatName: '',
      affectedDevice: '',
      action: 'Quarantined',
      riskLevel: 'Medium',
    });
    setShowMalwareForm(false);
    toast({
      title: "Malware Detection Logged",
      description: "Malware detection has been recorded successfully.",
    });
  };

  const updateIncidentStatus = (id: string, status: SecurityIncident['status']) => {
    setIncidents(incidents.map(incident => 
      incident.id === id 
        ? { ...incident, status, resolvedDate: status === 'Resolved' ? new Date().toISOString().split('T')[0] : undefined }
        : incident
    ));
    toast({
      title: "Status Updated",
      description: `Incident status changed to ${status}.`,
    });
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'Critical': return 'bg-red-500 text-white';
      case 'High': return 'bg-orange-500 text-white';
      case 'Medium': return 'bg-blue-500 text-white';
      case 'Low': return 'bg-green-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Open': return 'bg-red-100 text-red-800';
      case 'Investigating': return 'bg-yellow-100 text-yellow-800';
      case 'Resolved': return 'bg-green-100 text-green-800';
      case 'Closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'Quarantined': return 'bg-yellow-100 text-yellow-800';
      case 'Removed': return 'bg-green-100 text-green-800';
      case 'Blocked': return 'bg-red-100 text-red-800';
      case 'Monitored': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const securityStats = {
    totalIncidents: incidents.length,
    openIncidents: incidents.filter(i => i.status === 'Open').length,
    totalMalware: malwareDetections.length,
    highRiskMalware: malwareDetections.filter(m => m.riskLevel === 'High' || m.riskLevel === 'Critical').length,
  };

  return (
    <div className="space-y-6">
      {/* Security Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Security Incidents</p>
                <p className="text-2xl font-bold text-orange-600">{securityStats.totalIncidents}</p>
              </div>
              <Shield className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Open Incidents</p>
                <p className="text-2xl font-bold text-red-600">{securityStats.openIncidents}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Malware Detections</p>
                <p className="text-2xl font-bold text-purple-600">{securityStats.totalMalware}</p>
              </div>
              <Bug className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">High Risk Threats</p>
                <p className="text-2xl font-bold text-red-600">{securityStats.highRiskMalware}</p>
              </div>
              <Scan className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Security Incidents Section */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Security Incidents</h2>
        <Button onClick={() => setShowIncidentForm(!showIncidentForm)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Log Incident
        </Button>
      </div>

      {/* Incident Form */}
      {showIncidentForm && (
        <Card>
          <CardHeader>
            <CardTitle>Log Security Incident</CardTitle>
            <CardDescription>Record a new security incident or breach</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleIncidentSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Incident Title</Label>
                  <Input
                    id="title"
                    value={incidentForm.title}
                    onChange={(e) => setIncidentForm({...incidentForm, title: e.target.value})}
                    placeholder="Brief description of the incident"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type">Incident Type</Label>
                  <Select value={incidentForm.type} onValueChange={(value) => setIncidentForm({...incidentForm, type: value as any})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Malware">Malware</SelectItem>
                      <SelectItem value="Phishing">Phishing</SelectItem>
                      <SelectItem value="Unauthorized Access">Unauthorized Access</SelectItem>
                      <SelectItem value="Data Breach">Data Breach</SelectItem>
                      <SelectItem value="System Vulnerability">System Vulnerability</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="severity">Severity Level</Label>
                <Select value={incidentForm.severity} onValueChange={(value) => setIncidentForm({...incidentForm, severity: value as any})}>
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
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={incidentForm.description}
                  onChange={(e) => setIncidentForm({...incidentForm, description: e.target.value})}
                  placeholder="Detailed description of the security incident"
                  rows={3}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="affectedSystems">Affected Systems</Label>
                <Input
                  id="affectedSystems"
                  value={incidentForm.affectedSystems}
                  onChange={(e) => setIncidentForm({...incidentForm, affectedSystems: e.target.value})}
                  placeholder="Systems, devices, or services affected"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="actionsTaken">Actions Taken</Label>
                <Textarea
                  id="actionsTaken"
                  value={incidentForm.actionsTaken}
                  onChange={(e) => setIncidentForm({...incidentForm, actionsTaken: e.target.value})}
                  placeholder="Immediate response actions and mitigation steps"
                  rows={3}
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
                    <h3 className="font-semibold">{incident.title}</h3>
                    <Badge className={getSeverityColor(incident.severity)}>
                      {incident.severity}
                    </Badge>
                    <Badge variant="outline">{incident.type}</Badge>
                  </div>
                  <p className="text-gray-600 mb-3">{incident.description}</p>
                  <div className="space-y-1 text-sm text-gray-600">
                    <p><strong>Affected Systems:</strong> {incident.affectedSystems}</p>
                    <p><strong>Actions Taken:</strong> {incident.actionsTaken}</p>
                    <p><strong>Detected:</strong> {incident.detectedDate}</p>
                    {incident.resolvedDate && <p><strong>Resolved:</strong> {incident.resolvedDate}</p>}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={getStatusColor(incident.status)}>
                    {incident.status}
                  </Badge>
                  <Select value={incident.status} onValueChange={(value) => updateIncidentStatus(incident.id, value as any)}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Open">Open</SelectItem>
                      <SelectItem value="Investigating">Investigating</SelectItem>
                      <SelectItem value="Resolved">Resolved</SelectItem>
                      <SelectItem value="Closed">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Malware Detections Section */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Malware Detections</h2>
        <Button onClick={() => setShowMalwareForm(!showMalwareForm)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Log Detection
        </Button>
      </div>

      {/* Malware Form */}
      {showMalwareForm && (
        <Card>
          <CardHeader>
            <CardTitle>Log Malware Detection</CardTitle>
            <CardDescription>Record a malware or virus detection</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleMalwareSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="threatName">Threat Name</Label>
                  <Input
                    id="threatName"
                    value={malwareForm.threatName}
                    onChange={(e) => setMalwareForm({...malwareForm, threatName: e.target.value})}
                    placeholder="e.g., Trojan.Win32.Agent"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="affectedDevice">Affected Device</Label>
                  <Input
                    id="affectedDevice"
                    value={malwareForm.affectedDevice}
                    onChange={(e) => setMalwareForm({...malwareForm, affectedDevice: e.target.value})}
                    placeholder="e.g., WORKSTATION-05 (John.Doe)"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="action">Action Taken</Label>
                  <Select value={malwareForm.action} onValueChange={(value) => setMalwareForm({...malwareForm, action: value as any})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Quarantined">Quarantined</SelectItem>
                      <SelectItem value="Removed">Removed</SelectItem>
                      <SelectItem value="Blocked">Blocked</SelectItem>
                      <SelectItem value="Monitored">Monitored</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="riskLevel">Risk Level</Label>
                  <Select value={malwareForm.riskLevel} onValueChange={(value) => setMalwareForm({...malwareForm, riskLevel: value as any})}>
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
              <div className="flex gap-2">
                <Button type="submit">Log Detection</Button>
                <Button type="button" variant="outline" onClick={() => setShowMalwareForm(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Malware Detections List */}
      <div className="space-y-4">
        {malwareDetections.map((detection) => (
          <Card key={detection.id}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-red-100 rounded-lg">
                    <Bug className="h-6 w-6 text-red-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{detection.threatName}</h3>
                    <p className="text-sm text-gray-600">{detection.affectedDevice}</p>
                    <p className="text-sm text-gray-600">Detected: {detection.detectionDate}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={getSeverityColor(detection.riskLevel)}>
                    {detection.riskLevel} Risk
                  </Badge>
                  <Badge className={getActionColor(detection.action)}>
                    {detection.action}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default SecurityCompliance;
