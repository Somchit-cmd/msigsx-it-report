import React, { useState } from "react";
import ConfirmDialog from "./ConfirmDialog";
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
import { WorkTicket } from "@/services/helpdeskService";
import { useToast } from "@/hooks/use-toast";

interface EditTicketDialogProps {
  ticket: WorkTicket;
  onUpdate: (updated: Partial<Omit<WorkTicket, 'id' | 'createdAt' | 'updatedAt'>>) => Promise<void>;
}

const EditTicketDialog = ({ ticket, onUpdate }: EditTicketDialogProps) => {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    itStaffName: ticket.itStaffName,
    itStaffEmail: ticket.itStaffEmail,
    issueCategory: ticket.issueCategory,
    specificIssue: ticket.specificIssue,
    resolutionAction: ticket.resolutionAction,
    timeSpent: ticket.timeSpent.toString(),
    ticketStatus: ticket.ticketStatus,
    department: ticket.department,
    employeeName: ticket.employeeName,
    priority: ticket.priority,
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

  const issueCategories = [
    "Hardware",
    "Software",
    "Network",
    "Account",
    "Printing",
    "Email",
    "Permissions",
    "Security",
    "Other"
  ];

  const ticketStatuses = ["Opened", "Resolved", "Pending"];

  const departments = [
    'HR',
    'Finance and Accounting',
    'Health Claims',
    'Non-Health Claims',
    'Legal and Compliance',
    'Sales and Marketing',
    'Underwriting',
    'Other'
  ];

  const priorities = ["Low", "Medium", "High"];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onUpdate({
        issueCategory: formData.issueCategory,
        specificIssue: formData.specificIssue,
        resolutionAction: formData.resolutionAction,
        timeSpent: parseInt(formData.timeSpent) || 0,
        ticketStatus: formData.ticketStatus as WorkTicket['ticketStatus'],
        department: formData.department,
        employeeName: formData.employeeName,
        priority: formData.priority as WorkTicket['priority'],
      });
      toast({
        title: "Ticket Updated",
        description: "The ticket has been updated successfully.",
      });
      setOpen(false);
    } catch (error) {
      console.error("Error updating ticket", error);
      toast({
        title: "Error",
        description: "Failed to update ticket. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon">
          <Pencil className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Work Ticket</DialogTitle>
          <DialogDescription>
            Update the ticket details and click save.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSaveClick}
          className="space-y-4"
        >
          <ConfirmDialog
            open={confirmOpen}
            title="Save Changes?"
            description="Are you sure you want to save the changes to this ticket? This action cannot be undone."
            confirmText="Yes, Save Changes"
            cancelText="Cancel"
            onConfirm={handleConfirm}
            onCancel={handleCancel}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="itStaff">IT Staff Name</Label>
              <Input id="itStaff" value={formData.itStaffName} disabled className="bg-gray-50" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select
                value={formData.priority}
                onValueChange={(value) => setFormData({ ...formData, priority: value as WorkTicket['priority'] })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {priorities.map((priority) => (
                    <SelectItem key={priority} value={priority}>
                      {priority}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Issue Category</Label>
              <Select
                value={formData.issueCategory}
                onValueChange={(value) => setFormData({ ...formData, issueCategory: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {issueCategories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Ticket Status</Label>
              <Select
                value={formData.ticketStatus}
                onValueChange={(value) => setFormData({ ...formData, ticketStatus: value as WorkTicket['ticketStatus'] })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ticketStatuses.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="specificIssue">Specific Issue Description</Label>
            <Textarea
              id="specificIssue"
              value={formData.specificIssue}
              onChange={(e) => setFormData({ ...formData, specificIssue: e.target.value })}
              rows={3}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="resolution">Resolution/Action Taken</Label>
            <Textarea
              id="resolution"
              value={formData.resolutionAction}
              onChange={(e) => setFormData({ ...formData, resolutionAction: e.target.value })}
              rows={3}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="timeSpent">Time Spent (Minutes)</Label>
              <Input
                id="timeSpent"
                type="number"
                value={formData.timeSpent}
                onChange={(e) => setFormData({ ...formData, timeSpent: e.target.value })}
                min="1"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="department">Department</Label>
              <Select value={formData.department} onValueChange={(value) => setFormData({ ...formData, department: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((dept) => (
                    <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="employeeName">Employee Name</Label>
              <Input
                id="employeeName"
                value={formData.employeeName}
                onChange={(e) => setFormData({ ...formData, employeeName: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 pt-4">
            <Button type="submit" className="w-full sm:w-auto" disabled={loading}>
              {loading ? "Saving..." : "Save Changes"}
            </Button>
            <Button type="button" variant="outline" onClick={() => setOpen(false)} className="w-full sm:w-auto">
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditTicketDialog;
