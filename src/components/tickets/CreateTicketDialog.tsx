
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

interface User {
  name: string;
  email: string;
}

interface CreateTicketDialogProps {
  user: User;
  onCreateTicket: (ticket: any) => void;
}

const CreateTicketDialog = ({ user, onCreateTicket }: CreateTicketDialogProps) => {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    itStaffName: user.name,
    issueCategory: '',
    specificIssue: '',
    resolutionAction: '',
    timeSpent: '',
    ticketStatus: 'Opened',
    employeeDepartment: '',
    priority: 'Medium',
  });

  const issueCategories = [
    'Hardware',
    'Software',
    'Network',
    'Account',
    'Printing',
    'Email',
    'Permissions',
    'Security'
  ];

  const ticketStatuses = [
    'Opened',
    'Resolved',
    'Pending'
  ];

  const priorities = [
    'Low',
    'Medium',
    'High'
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newTicket = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      itStaffName: formData.itStaffName,
      issueCategory: formData.issueCategory,
      specificIssue: formData.specificIssue,
      resolutionAction: formData.resolutionAction,
      timeSpent: parseInt(formData.timeSpent) || 0,
      ticketStatus: formData.ticketStatus,
      employeeDepartment: formData.employeeDepartment,
      priority: formData.priority,
      createdAt: new Date().toLocaleDateString(),
      createdTime: new Date().toLocaleTimeString(),
    };

    onCreateTicket(newTicket);
    
    // Reset form
    setFormData({
      itStaffName: user.name,
      issueCategory: '',
      specificIssue: '',
      resolutionAction: '',
      timeSpent: '',
      ticketStatus: 'Opened',
      employeeDepartment: '',
      priority: 'Medium',
    });
    
    setOpen(false);
    toast({
      title: "Ticket Created",
      description: "Work ticket has been successfully logged.",
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2 w-full sm:w-auto">
          <Plus className="h-4 w-4" />
          Log Work Ticket
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Work Ticket</DialogTitle>
          <DialogDescription>
            Log your IT work and issue resolution for daily tracking
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Date & Time</Label>
              <Input
                id="date"
                value={`${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`}
                disabled
                className="bg-gray-50"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="itStaff">IT Staff Name</Label>
              <Input
                id="itStaff"
                value={formData.itStaffName}
                disabled
                className="bg-gray-50"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Issue Category</Label>
              <Select value={formData.issueCategory} onValueChange={(value) => setFormData({...formData, issueCategory: value})}>
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
              <Label htmlFor="priority">Priority</Label>
              <Select value={formData.priority} onValueChange={(value) => setFormData({...formData, priority: value})}>
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

          <div className="space-y-2">
            <Label htmlFor="specificIssue">Specific Issue Description</Label>
            <Textarea
              id="specificIssue"
              value={formData.specificIssue}
              onChange={(e) => setFormData({...formData, specificIssue: e.target.value})}
              placeholder="Describe the specific issue or task you worked on"
              rows={3}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="resolution">Resolution/Action Taken</Label>
            <Textarea
              id="resolution"
              value={formData.resolutionAction}
              onChange={(e) => setFormData({...formData, resolutionAction: e.target.value})}
              placeholder="Describe what actions you took to resolve the issue"
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
                onChange={(e) => setFormData({...formData, timeSpent: e.target.value})}
                placeholder="30"
                min="1"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Ticket Status</Label>
              <Select value={formData.ticketStatus} onValueChange={(value) => setFormData({...formData, ticketStatus: value})}>
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

            <div className="space-y-2">
              <Label htmlFor="department">Employee/Department Affected</Label>
              <Input
                id="department"
                value={formData.employeeDepartment}
                onChange={(e) => setFormData({...formData, employeeDepartment: e.target.value})}
                placeholder="e.g., Finance, HR, John Doe"
                required
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 pt-4">
            <Button type="submit" className="w-full sm:w-auto">
              Create Ticket
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

export default CreateTicketDialog;
