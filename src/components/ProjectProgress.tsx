
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Plus, FolderOpen, Calendar, DollarSign, CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

interface Project {
  id: string;
  name: string;
  description: string;
  status: 'Planning' | 'In Progress' | 'On Hold' | 'Completed' | 'Cancelled';
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  startDate: string;
  endDate: string;
  completionPercentage: number;
  budget: string;
  actualSpent: string;
  projectManager: string;
  teamMembers: string[];
  milestones: Milestone[];
  lastUpdate: string;
}

interface Milestone {
  id: string;
  name: string;
  dueDate: string;
  status: 'Pending' | 'In Progress' | 'Completed' | 'Overdue';
  description: string;
}

const ProjectProgress = () => {
  const { toast } = useToast();
  
  const [projects, setProjects] = useState<Project[]>([
    {
      id: '1',
      name: 'Network Infrastructure Upgrade',
      description: 'Upgrade company network switches and Wi-Fi infrastructure',
      status: 'In Progress',
      priority: 'High',
      startDate: '2024-06-01',
      endDate: '2024-08-31',
      completionPercentage: 65,
      budget: '$50,000',
      actualSpent: '$32,500',
      projectManager: 'Mike Johnson',
      teamMembers: ['Mike Johnson', 'Sarah Wilson', 'Tom Brown'],
      milestones: [
        {
          id: 'm1',
          name: 'Network Assessment Complete',
          dueDate: '2024-06-15',
          status: 'Completed',
          description: 'Complete assessment of current network infrastructure'
        },
        {
          id: 'm2',
          name: 'Equipment Procurement',
          dueDate: '2024-07-01',
          status: 'Completed',
          description: 'Purchase new switches and access points'
        },
        {
          id: 'm3',
          name: 'Phase 1 Installation',
          dueDate: '2024-07-15',
          status: 'In Progress',
          description: 'Install new equipment in main office building'
        }
      ],
      lastUpdate: '2024-07-10'
    },
    {
      id: '2',
      name: 'Office 365 Migration',
      description: 'Migrate from on-premises Exchange to Office 365',
      status: 'Completed',
      priority: 'Medium',
      startDate: '2024-03-01',
      endDate: '2024-05-31',
      completionPercentage: 100,
      budget: '$25,000',
      actualSpent: '$23,800',
      projectManager: 'Lisa Chen',
      teamMembers: ['Lisa Chen', 'David Kim', 'Amy Rodriguez'],
      milestones: [
        {
          id: 'm4',
          name: 'User Training Complete',
          dueDate: '2024-05-15',
          status: 'Completed',
          description: 'Train all users on Office 365 features'
        },
        {
          id: 'm5',
          name: 'Data Migration Complete',
          dueDate: '2024-05-30',
          status: 'Completed',
          description: 'Migrate all mailboxes and data to cloud'
        }
      ],
      lastUpdate: '2024-05-31'
    },
    {
      id: '3',
      name: 'Security System Implementation',
      description: 'Deploy new endpoint detection and response solution',
      status: 'Planning',
      priority: 'Critical',
      startDate: '2024-08-01',
      endDate: '2024-10-31',
      completionPercentage: 15,
      budget: '$75,000',
      actualSpent: '$5,000',
      projectManager: 'Robert Taylor',
      teamMembers: ['Robert Taylor', 'Jennifer Lee'],
      milestones: [
        {
          id: 'm6',
          name: 'Vendor Selection',
          dueDate: '2024-07-20',
          status: 'In Progress',
          description: 'Evaluate and select security solution vendor'
        }
      ],
      lastUpdate: '2024-07-08'
    }
  ]);

  const [showProjectForm, setShowProjectForm] = useState(false);
  const [projectForm, setProjectForm] = useState({
    name: '',
    description: '',
    priority: 'Medium' as const,
    startDate: '',
    endDate: '',
    budget: '',
    projectManager: '',
    teamMembers: '',
  });

  const handleProjectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newProject: Project = {
      id: Date.now().toString(),
      ...projectForm,
      status: 'Planning',
      completionPercentage: 0,
      actualSpent: '$0',
      teamMembers: projectForm.teamMembers.split(',').map(member => member.trim()),
      milestones: [],
      lastUpdate: new Date().toISOString().split('T')[0],
    };
    setProjects([newProject, ...projects]);
    setProjectForm({
      name: '',
      description: '',
      priority: 'Medium',
      startDate: '',
      endDate: '',
      budget: '',
      projectManager: '',
      teamMembers: '',
    });
    setShowProjectForm(false);
    toast({
      title: "Project Created",
      description: "New project has been successfully created.",
    });
  };

  const updateProjectStatus = (id: string, status: Project['status']) => {
    setProjects(projects.map(project => 
      project.id === id 
        ? { 
            ...project, 
            status,
            completionPercentage: status === 'Completed' ? 100 : project.completionPercentage,
            lastUpdate: new Date().toISOString().split('T')[0]
          }
        : project
    ));
    toast({
      title: "Status Updated",
      description: `Project status changed to ${status}.`,
    });
  };

  const updateProjectProgress = (id: string, progress: number) => {
    setProjects(projects.map(project => 
      project.id === id 
        ? { 
            ...project, 
            completionPercentage: progress,
            status: progress === 100 ? 'Completed' : project.status,
            lastUpdate: new Date().toISOString().split('T')[0]
          }
        : project
    ));
    toast({
      title: "Progress Updated",
      description: `Project progress updated to ${progress}%.`,
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Planning': return 'bg-blue-100 text-blue-800';
      case 'In Progress': return 'bg-yellow-100 text-yellow-800';
      case 'On Hold': return 'bg-orange-100 text-orange-800';
      case 'Completed': return 'bg-green-100 text-green-800';
      case 'Cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Critical': return 'bg-red-500 text-white';
      case 'High': return 'bg-orange-500 text-white';
      case 'Medium': return 'bg-blue-500 text-white';
      case 'Low': return 'bg-green-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getMilestoneStatusColor = (status: string) => {
    switch (status) {
      case 'Completed': return 'bg-green-100 text-green-800';
      case 'In Progress': return 'bg-yellow-100 text-yellow-800';
      case 'Overdue': return 'bg-red-100 text-red-800';
      case 'Pending': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getMilestoneIcon = (status: string) => {
    switch (status) {
      case 'Completed': return <CheckCircle className="h-4 w-4" />;
      case 'In Progress': return <Clock className="h-4 w-4" />;
      case 'Overdue': return <AlertTriangle className="h-4 w-4" />;
      default: return <Calendar className="h-4 w-4" />;
    }
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 80) return 'bg-green-500';
    if (percentage >= 50) return 'bg-blue-500';
    if (percentage >= 30) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const projectStats = {
    totalProjects: projects.length,
    activeProjects: projects.filter(p => p.status === 'In Progress').length,
    completedProjects: projects.filter(p => p.status === 'Completed').length,
    onHoldProjects: projects.filter(p => p.status === 'On Hold').length,
  };

  return (
    <div className="space-y-6">
      {/* Project Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Projects</p>
                <p className="text-2xl font-bold text-blue-600">{projectStats.totalProjects}</p>
              </div>
              <FolderOpen className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Projects</p>
                <p className="text-2xl font-bold text-yellow-600">{projectStats.activeProjects}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-green-600">{projectStats.completedProjects}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">On Hold</p>
                <p className="text-2xl font-bold text-orange-600">{projectStats.onHoldProjects}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add Project Button */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">IT Projects</h2>
        <Button onClick={() => setShowProjectForm(!showProjectForm)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          New Project
        </Button>
      </div>

      {/* Project Form */}
      {showProjectForm && (
        <Card>
          <CardHeader>
            <CardTitle>Create New Project</CardTitle>
            <CardDescription>Add a new IT project to track progress and milestones</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleProjectSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Project Name</Label>
                  <Input
                    id="name"
                    value={projectForm.name}
                    onChange={(e) => setProjectForm({...projectForm, name: e.target.value})}
                    placeholder="e.g., Network Infrastructure Upgrade"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="priority">Priority</Label>
                  <Select value={projectForm.priority} onValueChange={(value) => setProjectForm({...projectForm, priority: value as any})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Low">Low</SelectItem>
                      <SelectItem value="Medium">Medium</SelectItem>
                      <SelectItem value="High">High</SelectItem>
                      <SelectItem value="Critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={projectForm.description}
                  onChange={(e) => setProjectForm({...projectForm, description: e.target.value})}
                  placeholder="Brief description of the project scope and objectives"
                  rows={3}
                  required
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={projectForm.startDate}
                    onChange={(e) => setProjectForm({...projectForm, startDate: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate">End Date</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={projectForm.endDate}
                    onChange={(e) => setProjectForm({...projectForm, endDate: e.target.value})}
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="budget">Budget</Label>
                  <Input
                    id="budget"
                    value={projectForm.budget}
                    onChange={(e) => setProjectForm({...projectForm, budget: e.target.value})}
                    placeholder="e.g., $50,000"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="projectManager">Project Manager</Label>
                  <Input
                    id="projectManager"
                    value={projectForm.projectManager}
                    onChange={(e) => setProjectForm({...projectForm, projectManager: e.target.value})}
                    placeholder="e.g., Mike Johnson"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="teamMembers">Team Members</Label>
                <Input
                  id="teamMembers"
                  value={projectForm.teamMembers}
                  onChange={(e) => setProjectForm({...projectForm, teamMembers: e.target.value})}
                  placeholder="Comma-separated list of team members"
                  required
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit">Create Project</Button>
                <Button type="button" variant="outline" onClick={() => setShowProjectForm(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Projects List */}
      <div className="space-y-6">
        {projects.map((project) => (
          <Card key={project.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <CardTitle className="text-xl">{project.name}</CardTitle>
                    <Badge className={getPriorityColor(project.priority)}>
                      {project.priority}
                    </Badge>
                    <Badge className={getStatusColor(project.status)}>
                      {project.status}
                    </Badge>
                  </div>
                  <CardDescription>{project.description}</CardDescription>
                </div>
                <Select value={project.status} onValueChange={(value) => updateProjectStatus(project.id, value as any)}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Planning">Planning</SelectItem>
                    <SelectItem value="In Progress">In Progress</SelectItem>
                    <SelectItem value="On Hold">On Hold</SelectItem>
                    <SelectItem value="Completed">Completed</SelectItem>
                    <SelectItem value="Cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Progress</Label>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{project.completionPercentage}%</span>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      value={project.completionPercentage}
                      onChange={(e) => updateProjectProgress(project.id, parseInt(e.target.value) || 0)}
                      className="w-20"
                    />
                  </div>
                </div>
                <Progress value={project.completionPercentage} className="h-3" />
              </div>

              {/* Project Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-sm font-medium">Timeline</p>
                    <p className="text-sm text-gray-600">{project.startDate} - {project.endDate}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-sm font-medium">Budget</p>
                    <p className="text-sm text-gray-600">{project.actualSpent} / {project.budget}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <FolderOpen className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-sm font-medium">Manager</p>
                    <p className="text-sm text-gray-600">{project.projectManager}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-sm font-medium">Last Update</p>
                    <p className="text-sm text-gray-600">{project.lastUpdate}</p>
                  </div>
                </div>
              </div>

              {/* Team Members */}
              <div>
                <p className="text-sm font-medium mb-2">Team Members</p>
                <div className="flex flex-wrap gap-2">
                  {project.teamMembers.map((member, index) => (
                    <Badge key={index} variant="outline">
                      {member}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Milestones */}
              {project.milestones.length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-3">Milestones</p>
                  <div className="space-y-2">
                    {project.milestones.map((milestone) => (
                      <div key={milestone.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          {getMilestoneIcon(milestone.status)}
                          <div>
                            <p className="font-medium">{milestone.name}</p>
                            <p className="text-sm text-gray-600">{milestone.description}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge className={getMilestoneStatusColor(milestone.status)}>
                            {milestone.status}
                          </Badge>
                          <p className="text-sm text-gray-600 mt-1">Due: {milestone.dueDate}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ProjectProgress;
