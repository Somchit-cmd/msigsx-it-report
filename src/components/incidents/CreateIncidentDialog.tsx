import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

interface AuthUser {
  uid: string;
  email: string;
  name: string;
}

interface CreateIncidentDialogProps {
  user: AuthUser;
  onCreateIncident: (incident: any) => Promise<void>;
}

interface IncidentFormData {
  serverName: string;
  startTime: string;
  endTime: string;
  cause: string;
  resolution: string;
  impact: 'Low' | 'Medium' | 'High' | 'Critical';
}

const CreateIncidentDialog = ({ user, onCreateIncident }: CreateIncidentDialogProps) => {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<IncidentFormData>({
    serverName: '',
    startTime: '',
    endTime: '',
    cause: '',
    resolution: '',
    impact: 'Medium',
  });

  const serverNames = [
    'Mail Server',
    'Web Server',
    'Database Server',
    'File Server',
    'Domain Controller',
    'Print Server',
    'Backup Server',
    'Application Server',
  ];

  const impactLevels = [
    'Low',
    'Medium',
    'High',
    'Critical'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Calculate duration
      const startDate = new Date(formData.startTime);
      const endDate = new Date(formData.endTime);
      const durationMs = endDate.getTime() - startDate.getTime();
      const hours = Math.floor(durationMs / (1000 * 60 * 60));
      const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
      
      const incidentData = {
        ...formData,
        duration: `${hours}h ${minutes}m`,
      };
      
      await onCreateIncident(incidentData);
      
      // Reset form
      setFormData({
        serverName: '',
        startTime: '',
        endTime: '',
        cause: '',
        resolution: '',
        impact: 'Medium',
      });
      
      setOpen(false);
      
      toast({
        title: "Incident Logged",
        description: "Downtime incident has been recorded successfully.",
      });
    } catch (error) {
      console.error('Error creating incident:', error);
      toast({
        title: "Error",
        description: "Failed to log incident. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof IncidentFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-orange-600 hover:bg-orange-700">
          <Plus className="h-4 w-4 mr-2" />
          Log Downtime Incident
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Log Downtime Incident</DialogTitle>
          <DialogDescription>
            Record a server downtime incident with details
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="serverName">Server Name</Label>
              <Select value={formData.serverName} onValueChange={(value) => handleInputChange('serverName', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select server" />
                </SelectTrigger>
                <SelectContent>
                  {serverNames.map((server) => (
                    <SelectItem key={server} value={server}>
                      {server}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="impact">Impact Level</Label>
              <Select value={formData.impact} onValueChange={(value) => handleInputChange('impact', value as 'Low' | 'Medium' | 'High' | 'Critical')}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {impactLevels.map((level) => (
                    <SelectItem key={level} value={level}>
                      {level}
                    </SelectItem>
                  ))}
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
                value={formData.startTime}
                onChange={(e) => handleInputChange('startTime', e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="endTime">End Time</Label>
              <Input
                id="endTime"
                type="datetime-local"
                value={formData.endTime}
                onChange={(e) => handleInputChange('endTime', e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="cause">Cause</Label>
            <Textarea
              id="cause"
              placeholder="Describe the cause of the downtime..."
              value={formData.cause}
              onChange={(e) => handleInputChange('cause', e.target.value)}
              required
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="resolution">Resolution</Label>
            <Textarea
              id="resolution"
              placeholder="Describe the resolution actions taken..."
              value={formData.resolution}
              onChange={(e) => handleInputChange('resolution', e.target.value)}
              required
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-orange-600 hover:bg-orange-700"
            >
              {loading ? "Logging..." : "Log Incident"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateIncidentDialog;
