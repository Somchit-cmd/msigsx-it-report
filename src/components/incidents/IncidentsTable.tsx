import React, { useState } from 'react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Download, FileSpreadsheet, Server, Clock, Trash2 } from 'lucide-react';
import { DowntimeIncident } from '@/services/uptimeService';
import EditIncidentDialog from './EditIncidentDialog';
import ConfirmDialog from '../tickets/ConfirmDialog';
import { useToast } from '@/hooks/use-toast';

interface IncidentsTableProps {
  incidents: DowntimeIncident[];
  onEditIncident: (incidentId: string, updated: Partial<Omit<DowntimeIncident, 'id' | 'createdAt'>>) => Promise<void>;
  onDeleteIncident: (incidentId: string) => Promise<void>;
}

const IncidentsTable = ({ incidents, onEditIncident, onDeleteIncident }: IncidentsTableProps) => {
  const { toast } = useToast();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [incidentToDelete, setIncidentToDelete] = useState<string | null>(null);
  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'Critical': return 'bg-red-500 text-white';
      case 'High': return 'bg-orange-500 text-white';
      case 'Medium': return 'bg-blue-500 text-white';
      case 'Low': return 'bg-green-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString();
  };

  const exportToCSV = () => {
    const headers = [
      "Server Name",
      "Impact Level",
      "Duration",
      "Start Date",
      "Start Time",
      "End Date",
      "End Time",
      "Cause",
      "Resolution"
    ];

    const csvData = incidents.map((incident) => [
      incident.serverName,
      incident.impact,
      incident.duration,
      formatDate(incident.startTime),
      formatTime(incident.startTime),
      incident.endTime ? formatDate(incident.endTime) : 'Ongoing',
      incident.endTime ? formatTime(incident.endTime) : 'Ongoing',
      incident.cause,
      incident.resolution
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
      `downtime-incidents-${new Date().toISOString().split("T")[0]}.csv`
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToExcel = () => {
    const headers = [
      "Incident ID",
      "Server Name",
      "Impact Level",
      "Duration",
      "Start Date",
      "Start Time",
      "End Date",
      "End Time",
      "Cause",
      "Resolution",
      "Created Date"
    ];

    const excelData = incidents.map((incident) => [
      incident.id || "",
      incident.serverName,
      incident.impact,
      incident.duration,
      formatDate(incident.startTime),
      formatTime(incident.startTime),
      incident.endTime ? formatDate(incident.endTime) : 'Ongoing',
      incident.endTime ? formatTime(incident.endTime) : 'Ongoing',
      incident.cause,
      incident.resolution,
      incident.createdAt ? formatDate(incident.createdAt.toDate().toISOString()) : ""
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
      `downtime-incidents-${new Date().toISOString().split("T")[0]}.xlsx`
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDeleteClick = (incidentId: string) => {
    setIncidentToDelete(incidentId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (incidentToDelete) {
      try {
        await onDeleteIncident(incidentToDelete);
        toast({
          title: "Incident Deleted",
          description: "The incident has been deleted successfully.",
        });
      } catch (error) {
        console.error('Error deleting incident:', error);
        toast({
          title: "Error",
          description: "Failed to delete incident. Please try again.",
          variant: "destructive",
        });
      } finally {
        setDeleteDialogOpen(false);
        setIncidentToDelete(null);
      }
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setIncidentToDelete(null);
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
              <TableHead>Server</TableHead>
              <TableHead>Impact</TableHead>
              <TableHead className="w-[20%]">Cause</TableHead>
              <TableHead className="w-[20%]">Resolution</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Start Time</TableHead>
              <TableHead>End Time</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {incidents.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={9}
                  className="text-center py-8 text-gray-500"
                >
                  No downtime incidents found
                </TableCell>
              </TableRow>
            ) : (
              incidents.map((incident) => (
                <TableRow key={incident.id}>
                  <TableCell className="font-medium">
                    <div>
                      <div className="text-sm">
                        {formatDate(incident.startTime)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {formatTime(incident.startTime)}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium text-sm flex items-center gap-2">
                        <Server className="h-4 w-4 text-gray-500" />
                        {incident.serverName}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getImpactColor(incident.impact)}>
                      {incident.impact}
                    </Badge>
                  </TableCell>
                  <TableCell className="w-[20%]">
                    <div className="max-w-[200px]">
                      <div
                        className="text-sm font-medium leading-tight line-clamp-2"
                        style={{ 
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden'
                        }}
                        title={incident.cause}
                      >
                        {incident.cause}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="w-[20%]">
                    <div className="max-w-[200px]">
                      <div
                        className="text-sm leading-tight line-clamp-2"
                        style={{ 
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden'
                        }}
                        title={incident.resolution}
                      >
                        {incident.resolution}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4 text-gray-500" />
                      {incident.duration}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">
                    {formatTime(incident.startTime)}
                  </TableCell>
                  <TableCell className="text-sm">
                    {incident.endTime ? formatTime(incident.endTime) : 'Ongoing'}
                  </TableCell>
                  <TableCell className="flex gap-2 items-center">
                    <EditIncidentDialog
                      incident={incident}
                      onUpdate={(updated) => onEditIncident(incident.id!, updated)}
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleDeleteClick(incident.id!)}
                      className="text-red-600 border-red-200 hover:bg-red-50"
                      title="Delete Incident"
                    >
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      
      <ConfirmDialog
        open={deleteDialogOpen}
        title="Delete Incident?"
        description="Are you sure you want to delete this incident? This action cannot be undone."
        confirmText="Yes, Delete"
        cancelText="Cancel"
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
        danger
      />
    </div>
  );
};

export default IncidentsTable;
