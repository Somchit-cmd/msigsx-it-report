
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Ticket, Clock, CheckCircle, AlertCircle, User, Calendar, Timer } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import CreateTicketDialog from './tickets/CreateTicketDialog';

interface WorkTicket {
  id: string;
  date: string;
  itStaffName: string;
  issueCategory: string;
  specificIssue: string;
  resolutionAction: string;
  timeSpent: number;
  ticketStatus: 'Opened' | 'Resolved' | 'Pending';
  employeeDepartment: string;
  priority: 'Low' | 'Medium' | 'High';
  createdAt: string;
  createdTime: string;
}

interface User {
  name: string;
  email: string;
}

interface HelpdeskTrackerProps {
  user: User;
}

const HelpdeskTracker = ({ user }: HelpdeskTrackerProps) => {
  const { toast } = useToast();
  const [tickets, setTickets] = useState<WorkTicket[]>([
    {
      id: '1',
      date: new Date().toISOString(),
      itStaffName: 'John Smith',
      issueCategory: 'Hardware',
      specificIssue: 'Replaced faulty RAM in Finance workstation',
      resolutionAction: 'Diagnosed memory issues, replaced 8GB RAM module, tested system stability',
      timeSpent: 45,
      ticketStatus: 'Resolved',
      employeeDepartment: 'Finance Department',
      priority: 'Medium',
      createdAt: '2024-07-08',
      createdTime: '10:30 AM',
    },
    {
      id: '2',
      date: new Date().toISOString(),
      itStaffName: 'Sarah Johnson',
      issueCategory: 'Network',
      specificIssue: 'Internet connectivity issues in Conference Room B',
      resolutionAction: 'Reset network switch, updated network drivers on conference PC',
      timeSpent: 30,
      ticketStatus: 'Resolved',
      employeeDepartment: 'Conference Room B',
      priority: 'High',
      createdAt: '2024-07-08',
      createdTime: '2:15 PM',
    },
  ]);

  const handleCreateTicket = (newTicket: WorkTicket) => {
    setTickets([newTicket, ...tickets]);
  };

  const updateTicketStatus = (id: string, status: WorkTicket['ticketStatus']) => {
    setTickets(tickets.map(ticket => 
      ticket.id === id ? { ...ticket, ticketStatus: status } : ticket
    ));
    toast({
      title: "Status Updated",
      description: `Ticket status changed to ${status}.`,
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Opened': return <AlertCircle className="h-4 w-4" />;
      case 'Pending': return <Clock className="h-4 w-4" />;
      case 'Resolved': return <CheckCircle className="h-4 w-4" />;
      default: return <Ticket className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Opened': return 'bg-red-100 text-red-800';
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      case 'Resolved': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'bg-red-500 text-white';
      case 'Medium': return 'bg-blue-500 text-white';
      case 'Low': return 'bg-green-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const ticketStats = {
    total: tickets.length,
    opened: tickets.filter(t => t.ticketStatus === 'Opened').length,
    pending: tickets.filter(t => t.ticketStatus === 'Pending').length,
    resolved: tickets.filter(t => t.ticketStatus === 'Resolved').length,
    totalTimeSpent: tickets.reduce((sum, ticket) => sum + ticket.timeSpent, 0),
  };

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600">Total Tickets</p>
                <p className="text-lg sm:text-2xl font-bold">{ticketStats.total}</p>
              </div>
              <Ticket className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600 self-end sm:self-auto" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600">Opened</p>
                <p className="text-lg sm:text-2xl font-bold text-red-600">{ticketStats.opened}</p>
              </div>
              <AlertCircle className="h-6 w-6 sm:h-8 sm:w-8 text-red-600 self-end sm:self-auto" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600">Pending</p>
                <p className="text-lg sm:text-2xl font-bold text-yellow-600">{ticketStats.pending}</p>
              </div>
              <Clock className="h-6 w-6 sm:h-8 sm:w-8 text-yellow-600 self-end sm:self-auto" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600">Resolved</p>
                <p className="text-lg sm:text-2xl font-bold text-green-600">{ticketStats.resolved}</p>
              </div>
              <CheckCircle className="h-6 w-6 sm:h-8 sm:w-8 text-green-600 self-end sm:self-auto" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600">Time Spent</p>
                <p className="text-lg sm:text-2xl font-bold text-purple-600">{ticketStats.totalTimeSpent}m</p>
              </div>
              <Timer className="h-6 w-6 sm:h-8 sm:w-8 text-purple-600 self-end sm:self-auto" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Create Ticket Button */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-0">
        <h2 className="text-lg sm:text-xl font-semibold">Work Tickets</h2>
        <CreateTicketDialog user={user} onCreateTicket={handleCreateTicket} />
      </div>

      {/* Tickets List */}
      <div className="space-y-4">
        {tickets.map((ticket) => (
          <Card key={ticket.id}>
            <CardContent className="p-4 sm:p-6">
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 lg:gap-0">
                <div className="flex-1">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-3">
                    <h3 className="font-semibold text-sm sm:text-base">{ticket.specificIssue}</h3>
                    <div className="flex flex-wrap gap-1 sm:gap-2">
                      <Badge className={getPriorityColor(ticket.priority)}>
                        {ticket.priority}
                      </Badge>
                      <Badge variant="outline">{ticket.issueCategory}</Badge>
                    </div>
                  </div>
                  
                  <div className="space-y-2 mb-3">
                    <p className="text-sm text-gray-600">
                      <strong>Resolution:</strong> {ticket.resolutionAction}
                    </p>
                    <p className="text-sm text-gray-600">
                      <strong>Affected:</strong> {ticket.employeeDepartment}
                    </p>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-xs sm:text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      {ticket.itStaffName}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {ticket.createdAt} {ticket.createdTime}
                    </span>
                    <span className="flex items-center gap-1">
                      <Timer className="h-3 w-3" />
                      {ticket.timeSpent} minutes
                    </span>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 lg:ml-4">
                  <Badge className={getStatusColor(ticket.ticketStatus)}>
                    {getStatusIcon(ticket.ticketStatus)}
                    <span className="ml-1">{ticket.ticketStatus}</span>
                  </Badge>
                  <Select 
                    value={ticket.ticketStatus} 
                    onValueChange={(value) => updateTicketStatus(ticket.id, value as any)}
                  >
                    <SelectTrigger className="w-full sm:w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Opened">Opened</SelectItem>
                      <SelectItem value="Pending">Pending</SelectItem>
                      <SelectItem value="Resolved">Resolved</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default HelpdeskTracker;
