import React, { useState } from "react";
import ConfirmDialog from "../tickets/ConfirmDialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Pencil } from "lucide-react";
import { DowntimeIncident } from "@/services/uptimeService";
import { useToast } from "@/hooks/use-toast";

interface EditIncidentDialogProps {
  incident: DowntimeIncident;
  onUpdate: (updated: Partial<Omit<DowntimeIncident, 'id' | 'createdAt'>>) => Promise<void>;
}

const EditIncidentDialog = ({ incident, onUpdate }: EditIncidentDialogProps) => {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Format dates for input fields
  const formatDateTimeLocal = (dateString: string) => {
    const date = new Date(dateString);
    return date.toISOString().slice(0, 16);
  };

  const [formData, setFormData] = useState({
    serverName: incident.serverName,
    impact: incident.impact,
    startTime: formatDateTimeLocal(incident.startTime),
    endTime: incident.endTime ? formatDateTimeLocal(incident.endTime) : '',
    cause: incident.cause,
    resolution: incident.resolution,
  });

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingEvent, setPendingEvent] = useState<React.FormEvent | null>(null);

  const handleSaveClick = (e: React.FormEvent) => {
    e.preventDefault();
    setPendingEvent(e);
    setConfirmOpen(true);
  };

  const handleConfirm = async () => {
    setConfirmOpen(false);
    if (pendingEvent) {
      await handleSubmit(pendingEvent);
      setPendingEvent(null);
    }
  };

  const handleCancel = () => {
    setConfirmOpen(false);
    setPendingEvent(null);
  };

  const serverOptions = [
    'Mail Server (Exchange)',
    'Web Server (IIS)',
    'Database Server (SQL)',
    'File Server (NAS)',
    'Domain Controller',
    'Print Server',
    'Backup Server',
    'Application Server',
    'Other'
  ];

  const impactLevels = ["Low", "Medium", "High", "Critical"];

  const calculateDuration = (start: string, end: string) => {
    if (!start || !end) return '';
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diffMs = endDate.getTime() - startDate.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (diffHours > 0) {
      return `${diffHours}h ${diffMinutes}m`;
    } else {
      return `${diffMinutes}m`;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const duration = formData.endTime 
        ? calculateDuration(formData.startTime, formData.endTime)
        : 'Ongoing';

      // Validate impact level
      const validImpactLevels = ['Low', 'Medium', 'High', 'Critical'] as const;
      const impact = validImpactLevels.includes(formData.impact as any) 
        ? formData.impact as DowntimeIncident['impact']
        : 'Low' as DowntimeIncident['impact'];

      await onUpdate({
        serverName: formData.serverName,
        impact: impact,
        startTime: formData.startTime,
        endTime: formData.endTime || null,
        cause: formData.cause,
        resolution: formData.resolution,
        duration: duration,
      });
      
      toast({
        title: "Incident Updated",
        description: "The incident has been updated successfully.",
      });
      setOpen(false);
    } catch (error) {
      console.error("Error updating incident", error);
      toast({
        title: "Error",
        description: "Failed to update incident. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="icon" title="Edit Incident">
            <Pencil className="h-4 w-4" />
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Incident</DialogTitle>
            <DialogDescription>
              Update the incident details below.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSaveClick} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="serverName">Server Name</Label>
                <Select
                  value={formData.serverName}
                  onValueChange={(value) =>
                    setFormData({ ...formData, serverName: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select server" />
                  </SelectTrigger>
                  <SelectContent>
                    {serverOptions.map((server) => (
                      <SelectItem key={server} value={server}>
                        {server}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="impact">Impact Level</Label>
                <Select
                  value={formData.impact}
                  onValueChange={(value) =>
                    setFormData({ ...formData, impact: value as 'Low' | 'Medium' | 'High' | 'Critical' })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select impact level" />
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

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startTime">Start Time</Label>
                <Input
                  id="startTime"
                  type="datetime-local"
                  value={formData.startTime}
                  onChange={(e) =>
                    setFormData({ ...formData, startTime: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endTime">End Time (Optional)</Label>
                <Input
                  id="endTime"
                  type="datetime-local"
                  value={formData.endTime}
                  onChange={(e) =>
                    setFormData({ ...formData, endTime: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="cause">Cause</Label>
              <Textarea
                id="cause"
                value={formData.cause}
                onChange={(e) =>
                  setFormData({ ...formData, cause: e.target.value })
                }
                placeholder="Describe the cause of the downtime..."
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="resolution">Resolution</Label>
              <Textarea
                id="resolution"
                value={formData.resolution}
                onChange={(e) =>
                  setFormData({ ...formData, resolution: e.target.value })
                }
                placeholder="Describe how the issue was resolved..."
                required
              />
            </div>

            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Updating..." : "Update Incident"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={confirmOpen}
        title="Update Incident?"
        description="Are you sure you want to update this incident? This action will modify the incident details."
        confirmText="Yes, Update"
        cancelText="Cancel"
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    </>
  );
};

export default EditIncidentDialog;
