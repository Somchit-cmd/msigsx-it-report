import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Ticket,
  Clock,
  CheckCircle,
  AlertCircle,
  User,
  Calendar,
  Timer,
  Trash2,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import CreateTicketDialog from "./tickets/CreateTicketDialog";
import EditTicketDialog from "./tickets/EditTicketDialog";
import TicketsTable from "./tickets/TicketsTable";
import TicketsReportTab from "./tickets/TicketsReportTab";
import ConfirmDialog from "./tickets/ConfirmDialog";
import { helpdeskService, WorkTicket } from "@/services/helpdeskService";
import { Timestamp } from "firebase/firestore";

interface AuthUser {
  uid: string;
  email: string;
  name: string;
}

interface HelpdeskTrackerProps {
  user: AuthUser;
}

const HelpdeskTracker = ({ user }: HelpdeskTrackerProps) => {
  const { toast } = useToast();
  const [tickets, setTickets] = useState<WorkTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);

  useEffect(() => {
    // Subscribe to real-time ticket updates
    const unsubscribe = helpdeskService.subscribeToTickets((updatedTickets) => {
      setTickets(updatedTickets);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleCreateTicket = async (
    newTicketData: Omit<WorkTicket, "id" | "createdAt" | "updatedAt">
  ) => {
    try {
      await helpdeskService.createTicket(newTicketData);
      toast({
        title: "Ticket Created",
        description: "Work ticket has been successfully logged.",
      });
    } catch (error) {
      console.error("Error creating ticket:", error);
      toast({
        title: "Error",
        description: "Failed to create ticket. Please try again.",
        variant: "destructive",
      });
    }
  };

  const updateTicketStatus = async (
    id: string,
    status: WorkTicket["ticketStatus"]
  ) => {
    try {
      await helpdeskService.updateTicketStatus(id, status);
      toast({
        title: "Status Updated",
        description: `Ticket status changed to ${status}.`,
      });
    } catch (error) {
      console.error("Error updating ticket status:", error);
      toast({
        title: "Error",
        description: "Failed to update ticket status. Please try again.",
        variant: "destructive",
      });
    }
  };

  const deleteTicket = async (id: string) => {
    try {
      await helpdeskService.deleteTicket(id);
      toast({
        title: "Ticket Deleted",
        description: "The ticket has been removed.",
      });
    } catch (error) {
      console.error("Error deleting ticket:", error);
      toast({
        title: "Error",
        description: "Failed to delete ticket.",
        variant: "destructive",
      });
    }
  };

  const updateTicketDetails = async (
    id: string,
    updated: Partial<Omit<WorkTicket, "id" | "createdAt" | "updatedAt">>
  ) => {
    try {
      await helpdeskService.updateTicket(id, updated);
      toast({
        title: "Ticket Updated",
        description: "Ticket details have been updated.",
      });
    } catch (error) {
      console.error("Error updating ticket:", error);
      toast({
        title: "Error",
        description: "Failed to update ticket. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Opened":
        return <AlertCircle className="h-4 w-4" />;
      case "Pending":
        return <Clock className="h-4 w-4" />;
      case "Resolved":
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <Ticket className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Opened":
        return "bg-red-100 text-red-800";
      case "Pending":
        return "bg-yellow-100 text-yellow-800";
      case "Resolved":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "High":
        return "bg-red-500 text-white";
      case "Medium":
        return "bg-blue-500 text-white";
      case "Low":
        return "bg-green-500 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  // Filter tickets for the card view - only show Opened and Pending
  const filteredTicketsForCards = tickets.filter(
    (ticket) => ticket.ticketStatus === "Opened" || ticket.ticketStatus === "Pending"
  );

  const ticketStats = {
    total: tickets.length,
    opened: tickets.filter((t) => t.ticketStatus === "Opened").length,
    pending: tickets.filter((t) => t.ticketStatus === "Pending").length,
    resolved: tickets.filter((t) => t.ticketStatus === "Resolved").length,
    totalTimeSpent: tickets.reduce((sum, ticket) => sum + ticket.timeSpent, 0),
  };

  const formatDate = (timestamp: Timestamp) => {
    return timestamp.toDate().toLocaleDateString();
  };

  const formatTime = (timestamp: Timestamp) => {
    return timestamp.toDate().toLocaleTimeString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Loading tickets...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600">
                  Total Tickets
                </p>
                <p className="text-lg sm:text-2xl font-bold">
                  {ticketStats.total}
                </p>
              </div>
              <Ticket className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600 self-end sm:self-auto" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600">
                  Opened
                </p>
                <p className="text-lg sm:text-2xl font-bold text-red-600">
                  {ticketStats.opened}
                </p>
              </div>
              <AlertCircle className="h-6 w-6 sm:h-8 sm:w-8 text-red-600 self-end sm:self-auto" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600">
                  Pending
                </p>
                <p className="text-lg sm:text-2xl font-bold text-yellow-600">
                  {ticketStats.pending}
                </p>
              </div>
              <Clock className="h-6 w-6 sm:h-8 sm:w-8 text-yellow-600 self-end sm:self-auto" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600">
                  Resolved
                </p>
                <p className="text-lg sm:text-2xl font-bold text-green-600">
                  {ticketStats.resolved}
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
                <p className="text-xs sm:text-sm font-medium text-gray-600">
                  Time Spent
                </p>
                <p className="text-lg sm:text-2xl font-bold text-purple-600">
                  {ticketStats.totalTimeSpent}m
                </p>
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

      {/* Tickets Tabs */}
      <Tabs defaultValue="cards" className="w-full">
        <TabsList className="grid w-full grid-cols-3 max-w-lg">
          <TabsTrigger value="cards">Ticket List</TabsTrigger>
          <TabsTrigger value="table">Ticket Table</TabsTrigger>
          <TabsTrigger value="report">Ticket Report</TabsTrigger>
        </TabsList>

        <TabsContent value="cards" className="space-y-4 mt-6">
          {filteredTicketsForCards.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-gray-500">
                  No open or pending tickets found. All tickets are resolved!
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredTicketsForCards.map((ticket) => (
              <Card key={ticket.id}>
                <CardContent className="p-4 sm:p-6">
                  <div className="relative flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 lg:gap-0">
                    <div className="flex-1">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-3">
                        <h3 className="font-semibold text-sm sm:text-base">
                          {ticket.specificIssue}
                        </h3>
                        <div className="flex flex-wrap gap-1 sm:gap-2">
                          <Badge className={getPriorityColor(ticket.priority)}>
                            {ticket.priority}
                          </Badge>
                          <Badge variant="outline">
                            {ticket.issueCategory}
                          </Badge>
                        </div>
                      </div>

                      <div className="space-y-2 mb-3">
                        <p className="text-sm text-gray-600">
                          <strong>Resolution:</strong> {ticket.resolutionAction}
                        </p>
                        <p className="text-sm text-gray-600">
                          <strong>Affected:</strong> {ticket.department}{" - "}{ticket.employeeName}
                        </p>
                      </div>

                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-xs sm:text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {ticket.itStaffName}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatDate(ticket.createdAt)}{" "}
                          {formatTime(ticket.createdAt)}
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
                      <div className="flex gap-2">
                        <Select
                          value={ticket.ticketStatus}
                          onValueChange={(value) =>
                            updateTicketStatus(ticket.id!, value as any)
                          }
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
                    <div className="absolute bottom-0 right-0 flex gap-2">
                      <EditTicketDialog
                        ticket={ticket}
                        onUpdate={(updated) =>
                          updateTicketDetails(ticket.id!, updated)
                        }
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => {
                          setDeleteDialogOpen(true);
                          setSelectedTicketId(ticket.id!);
                        }}
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                      <ConfirmDialog
                        open={deleteDialogOpen && selectedTicketId === ticket.id}
                        title="Delete Ticket?"
                        description="Are you sure you want to delete this ticket? This action cannot be undone."
                        confirmText="Yes, Delete"
                        cancelText="Cancel"
                        onConfirm={() => {
                          deleteTicket(ticket.id!);
                          setDeleteDialogOpen(false);
                          setSelectedTicketId(null);
                        }}
                        onCancel={() => {
                          setDeleteDialogOpen(false);
                          setSelectedTicketId(null);
                        }}
                        danger
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="table" className="mt-6">
          <TicketsTable
            tickets={tickets}
            onUpdateStatus={updateTicketStatus}
            onEditTicket={updateTicketDetails}
            onDeleteTicket={deleteTicket}
          />
        </TabsContent>
        <TabsContent value="report" className="mt-6">
          <TicketsReportTab tickets={tickets} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default HelpdeskTracker;
