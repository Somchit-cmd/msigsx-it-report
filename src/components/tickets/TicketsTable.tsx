
import React from 'react';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download, FileSpreadsheet } from 'lucide-react';
import { WorkTicket } from '@/services/helpdeskService';
import { Timestamp } from 'firebase/firestore';

interface TicketsTableProps {
  tickets: WorkTicket[];
  onUpdateStatus: (id: string, status: WorkTicket['ticketStatus']) => void;
}

const TicketsTable = ({ tickets, onUpdateStatus }: TicketsTableProps) => {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'bg-red-500 text-white';
      case 'Medium': return 'bg-blue-500 text-white';
      case 'Low': return 'bg-green-500 text-white';
      default: return 'bg-gray-500 text-white';
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

  const formatDate = (timestamp: Timestamp) => {
    return timestamp.toDate().toLocaleDateString();
  };

  const formatTime = (timestamp: Timestamp) => {
    return timestamp.toDate().toLocaleTimeString();
  };

  const exportToCSV = () => {
    const headers = [
      'Date',
      'IT Staff',
      'Issue Category',
      'Specific Issue',
      'Resolution Action',
      'Time Spent (min)',
      'Status',
      'Department',
      'Priority',
      'Created At'
    ];

    const csvData = tickets.map(ticket => [
      ticket.date,
      ticket.itStaffName,
      ticket.issueCategory,
      ticket.specificIssue,
      ticket.resolutionAction,
      ticket.timeSpent,
      ticket.ticketStatus,
      ticket.employeeDepartment,
      ticket.priority,
      `${formatDate(ticket.createdAt)} ${formatTime(ticket.createdAt)}`
    ]);

    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.map(field => `"${String(field).replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `helpdesk-tickets-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToExcel = () => {
    // For Excel export, we'll create a more detailed CSV that Excel can handle
    const headers = [
      'Ticket ID',
      'Date',
      'IT Staff Name',
      'IT Staff Email',
      'Issue Category',
      'Specific Issue',
      'Resolution Action',
      'Time Spent (minutes)',
      'Status',
      'Employee Department',
      'Priority',
      'Created Date',
      'Created Time',
      'Last Updated'
    ];

    const excelData = tickets.map(ticket => [
      ticket.id || '',
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
      ticket.updatedAt ? `${formatDate(ticket.updatedAt)} ${formatTime(ticket.updatedAt)}` : ''
    ]);

    const csvContent = [
      headers.join(','),
      ...excelData.map(row => row.map(field => `"${String(field).replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'application/vnd.ms-excel;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `helpdesk-tickets-${new Date().toISOString().split('T')[0]}.xlsx`);
    link.style.visibility = 'hidden';
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
              <TableHead>Issue</TableHead>
              <TableHead>Resolution</TableHead>
              <TableHead>Time</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tickets.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} className="text-center py-8 text-gray-500">
                  No tickets found
                </TableCell>
              </TableRow>
            ) : (
              tickets.map((ticket) => (
                <TableRow key={ticket.id}>
                  <TableCell className="font-medium">
                    <div>
                      <div className="text-sm">{formatDate(ticket.createdAt)}</div>
                      <div className="text-xs text-gray-500">{formatTime(ticket.createdAt)}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium text-sm">{ticket.itStaffName}</div>
                      <div className="text-xs text-gray-500">{ticket.itStaffEmail}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{ticket.issueCategory}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="max-w-xs">
                      <div className="text-sm font-medium truncate" title={ticket.specificIssue}>
                        {ticket.specificIssue}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="max-w-xs">
                      <div className="text-sm truncate" title={ticket.resolutionAction}>
                        {ticket.resolutionAction}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{ticket.timeSpent}m</TableCell>
                  <TableCell>{ticket.employeeDepartment}</TableCell>
                  <TableCell>
                    <Badge className={getPriorityColor(ticket.priority)} size="sm">
                      {ticket.priority}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(ticket.ticketStatus)} size="sm">
                      {ticket.ticketStatus}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Select 
                      value={ticket.ticketStatus} 
                      onValueChange={(value) => onUpdateStatus(ticket.id!, value as any)}
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
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default TicketsTable;
