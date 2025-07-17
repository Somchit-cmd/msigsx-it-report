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

interface CreateTicketDialogProps {
  user: AuthUser;
  onCreateTicket: (ticket: any) => Promise<void>;
}

interface TicketFormData {
  itStaffName: string;
  itStaffEmail: string;
  issueCategory: string;
  specificIssue: string;
  resolutionAction: string;
  timeSpent: string;
  ticketStatus: 'Opened' | 'Resolved' | 'Pending';
  department: string;
  employeeName: string;
  priority: 'Low' | 'Medium' | 'High';
}

const CreateTicketDialog = ({ user, onCreateTicket }: CreateTicketDialogProps) => {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<TicketFormData>({
    itStaffName: user.name,
    itStaffEmail: user.email,
    issueCategory: '',
    specificIssue: '',
    resolutionAction: '',
    timeSpent: '',
    ticketStatus: 'Opened',
    department: '',
    employeeName: '',
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
    'Security',
    'Other'
  ];

  const ticketStatuses = [
    'Opened',
    'Resolved',
    'Pending'
  ];

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

  const priorities = [
    'Low',
    'Medium',
    'High'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const newTicket = {
        date: new Date().toISOString(),
        itStaffName: formData.itStaffName,
        itStaffEmail: formData.itStaffEmail,
        issueCategory: formData.issueCategory,
        specificIssue: formData.specificIssue,
        resolutionAction: formData.resolutionAction,
        timeSpent: parseInt(formData.timeSpent) || 0,
        ticketStatus: formData.ticketStatus as 'Opened' | 'Resolved' | 'Pending',
        department: formData.department,
        employeeName: formData.employeeName,
        priority: formData.priority as 'Low' | 'Medium' | 'High',
      };

      await onCreateTicket(newTicket);
      
      // Reset form
      setFormData({
        itStaffName: user.name,
        itStaffEmail: user.email,
        issueCategory: '',
        specificIssue: '',
        resolutionAction: '',
        timeSpent: '',
        ticketStatus: 'Opened',
        department: '',
        employeeName: '',
        priority: 'Medium',
      });
      
      setOpen(false);
    } catch (error) {
      console.error('Error creating ticket:', error);
    } finally {
      setLoading(false);
    }
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
          {/* <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
          </div> */}

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
              <Select value={formData.priority} onValueChange={(value) => setFormData({...formData, priority: value as 'Low' | 'Medium' | 'High'})}>
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
              <Label htmlFor="department">Department</Label>
              <Select value={formData.department} onValueChange={(value) => setFormData({...formData, department: value})}>
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
                onChange={(e) => setFormData({...formData, employeeName: e.target.value})}
                placeholder="John Doe"
                required
              />
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
              <Select value={formData.ticketStatus} onValueChange={(value) => setFormData({...formData, ticketStatus: value as 'Opened' | 'Resolved' | 'Pending'})}>
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

          <div className="flex flex-col sm:flex-row gap-2 pt-4">
            <Button type="submit" className="w-full sm:w-auto" disabled={loading}>
              {loading ? 'Creating...' : 'Create Ticket'}
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
