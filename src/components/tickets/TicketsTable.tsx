import React, { useState, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Download,
  FileSpreadsheet,
  Trash2,
} from "lucide-react";
import { WorkTicket } from "@/services/helpdeskService";
import { Timestamp } from "firebase/firestore";
import EditTicketDialog from "./EditTicketDialog";

interface TicketsTableProps {
  tickets: WorkTicket[];
  onUpdateStatus: (id: string, status: WorkTicket["ticketStatus"]) => void;
  onEditTicket: (
    id: string,
    updated: Partial<Omit<WorkTicket, "id" | "createdAt" | "updatedAt">>
  ) => Promise<void>;
  onDeleteTicket: (id: string) => Promise<void>;
}

const ROWS_PER_PAGE = 10;

import ConfirmDialog from "./ConfirmDialog";

const TicketsTable = ({
  tickets,
  onUpdateStatus,
  onEditTicket,
  onDeleteTicket,
}: TicketsTableProps) => {
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [selectedTicketId, setSelectedTicketId] = React.useState<string | null>(
    null
  );
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(tickets.length / ROWS_PER_PAGE);

  const paginatedTickets = useMemo(() => {
    const startIndex = (currentPage - 1) * ROWS_PER_PAGE;
    const endIndex = startIndex + ROWS_PER_PAGE;
    return tickets.slice(startIndex, endIndex);
  }, [tickets, currentPage]);

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const handleDeleteClick = (ticketId: string) => {
    setSelectedTicketId(ticketId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (selectedTicketId) {
      await onDeleteTicket(selectedTicketId);
      setDeleteDialogOpen(false);
      // Reset to previous page if we're on the last page and it becomes empty
      if (paginatedTickets.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      }
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setSelectedTicketId(null);
  };

  const renderPagination = () => {
    if (tickets.length <= ROWS_PER_PAGE) return null;

    return (
      <div className="flex items-center justify-between px-4 py-3 border-t">
        <div className="text-sm text-muted-foreground">
          Showing{" "}
          {Math.min((currentPage - 1) * ROWS_PER_PAGE + 1, tickets.length)}-
          {Math.min(currentPage * ROWS_PER_PAGE, tickets.length)} of{" "}
          {tickets.length} tickets
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => goToPage(1)}
            disabled={currentPage === 1}
            className="h-8 w-8 p-0"
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage === 1}
            className="h-8 w-8 p-0"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center space-x-1">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }

              return (
                <Button
                  key={pageNum}
                  variant={currentPage === pageNum ? "default" : "outline"}
                  size="sm"
                  onClick={() => goToPage(pageNum)}
                  className="h-8 w-8 p-0"
                >
                  {pageNum}
                </Button>
              );
            })}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="h-8 w-8 p-0"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => goToPage(totalPages)}
            disabled={currentPage === totalPages}
            className="h-8 w-8 p-0"
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
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

  const formatDate = (timestamp: Timestamp) => {
    return timestamp.toDate().toLocaleDateString();
  };

  const formatTime = (timestamp: Timestamp) => {
    return timestamp.toDate().toLocaleTimeString();
  };

  const exportToCSV = () => {
    const headers = [
      "Date",
      "IT Staff",
      "Issue Category",
      "Specific Issue",
      "Resolution Action",
      "Time Spent (min)",
      "Status",
      "Department",
      "Employee Name",
      "Priority",
      "Created At",
    ];

    const csvData = tickets.map((ticket) => [
      ticket.date,
      ticket.itStaffName,
      ticket.issueCategory,
      ticket.specificIssue,
      ticket.resolutionAction,
      ticket.timeSpent,
      ticket.ticketStatus,
      ticket.department,
      ticket.employeeName,
      ticket.priority,
      `${formatDate(ticket.createdAt)} ${formatTime(ticket.createdAt)}`,
    ]);

    const csvContent = [
      headers.join(","),
      ...csvData.map((row) =>
        row.map((field) => `"${String(field).replace(/"/g, '""')}"`).join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `helpdesk-tickets-${new Date().toISOString().split("T")[0]}.csv`
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToExcel = () => {
    // For Excel export, we'll create a more detailed CSV that Excel can handle
    const headers = [
      "Ticket ID",
      "Date",
      "IT Staff Name",
      "IT Staff Email",
      "Issue Category",
      "Specific Issue",
      "Resolution Action",
      "Time Spent (minutes)",
      "Status",
      "Employee Department",
      "Priority",
      "Created Date",
      "Created Time",
      "Last Updated",
    ];

    const excelData = tickets.map((ticket) => [
      ticket.id || "",
      ticket.date,
      ticket.itStaffName,
      ticket.itStaffEmail,
      ticket.issueCategory,
      ticket.specificIssue,
      ticket.resolutionAction,
      ticket.timeSpent,
      ticket.ticketStatus,
      ticket.employeeDepartment,
      ticket.priority,
      formatDate(ticket.createdAt),
      formatTime(ticket.createdAt),
      ticket.updatedAt
        ? `${formatDate(ticket.updatedAt)} ${formatTime(ticket.updatedAt)}`
        : "",
    ]);

    const csvContent = [
      headers.join(","),
      ...excelData.map((row) =>
        row.map((field) => `"${String(field).replace(/"/g, '""')}"`).join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], {
      type: "application/vnd.ms-excel;charset=utf-8;",
    });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `helpdesk-tickets-${new Date().toISOString().split("T")[0]}.xlsx`
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4">
      {/* Export buttons */}
      <div className="flex flex-col sm:flex-row gap-2 sm:justify-end">
        <Button onClick={exportToCSV} variant="outline" size="sm">
          <Download className="h-4 w-4 mr-2" />
          Export CSV
        </Button>
        <Button onClick={exportToExcel} variant="outline" size="sm">
          <FileSpreadsheet className="h-4 w-4 mr-2" />
          Export Excel
        </Button>
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>IT Staff</TableHead>
              <TableHead>Category</TableHead>
              <TableHead className="w-[20%]">Issue</TableHead>
              <TableHead className="w-[20%]">Resolution</TableHead>
              <TableHead>Time</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Employee</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedTickets.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={11}
                  className="text-center py-8 text-gray-500"
                >
                  No tickets found
                </TableCell>
              </TableRow>
            ) : (
              paginatedTickets.map((ticket) => (
                <TableRow key={ticket.id}>
                  <TableCell className="font-medium">
                    <div>
                      <div className="text-sm">
                        {formatDate(ticket.createdAt)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {formatTime(ticket.createdAt)}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium text-sm">
                        {ticket.itStaffName}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{ticket.issueCategory}</Badge>
                  </TableCell>
                  <TableCell className="w-[20%]">
                    <div className="max-w-[200px]">
                      <div
                        className="text-sm font-medium leading-tight line-clamp-2"
                        style={{
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                        }}
                        title={ticket.specificIssue}
                      >
                        {ticket.specificIssue}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="w-[20%]">
                    <div className="max-w-[200px]">
                      <div
                        className="text-sm leading-tight line-clamp-2"
                        style={{
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                        }}
                        title={ticket.resolutionAction}
                      >
                        {ticket.resolutionAction}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{ticket.timeSpent} mins</TableCell>
                  <TableCell>{ticket.department}</TableCell>
                  <TableCell>{ticket.employeeName}</TableCell>
                  <TableCell>
                    <Badge className={getPriorityColor(ticket.priority)}>
                      {ticket.priority}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(ticket.ticketStatus)}>
                      {ticket.ticketStatus}
                    </Badge>
                  </TableCell>
                  <TableCell className="flex gap-2 items-center">
                    <Select
                      value={ticket.ticketStatus}
                      onValueChange={(value) =>
                        onUpdateStatus(ticket.id!, value as any)
                      }
                    >
                      <SelectTrigger className="w-24">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Opened">Opened</SelectItem>
                        <SelectItem value="Pending">Pending</SelectItem>
                        <SelectItem value="Resolved">Resolved</SelectItem>
                      </SelectContent>
                    </Select>
                    <EditTicketDialog
                      ticket={ticket}
                      onUpdate={(updated) => onEditTicket(ticket.id!, updated)}
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleDeleteClick(ticket.id!)}
                      className="text-red-600 border-red-200 hover:bg-red-50"
                      title="Delete Ticket"
                    >
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>

                    <ConfirmDialog
                      open={deleteDialogOpen}
                      title="Delete Ticket?"
                      description="Are you sure you want to delete this ticket? This action cannot be undone."
                      confirmText="Yes, Delete"
                      cancelText="Cancel"
                      onConfirm={handleDeleteConfirm}
                      onCancel={handleDeleteCancel}
                      danger
                    />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        {renderPagination()}
      </div>
    </div>
  );
};

export default TicketsTable;
