
import React from 'react';
import { 
  TrendingUp,
  Headphones,
  Server,
  Shield,
  HardDrive,
  FolderOpen,
  LogOut
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface AppSidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  user?: {
    name: string;
    email: string;
  };
  onLogout?: () => void;
}

const menuItems = [
  {
    id: 'overview',
    title: 'Overview',
    icon: TrendingUp,
  },
  {
    id: 'helpdesk',
    title: 'Helpdesk',
    icon: Headphones,
  },
  {
    id: 'uptime',
    title: 'System Uptime',
    icon: Server,
  },
  {
    id: 'security',
    title: 'Security',
    icon: Shield,
  },
  {
    id: 'assets',
    title: 'Asset Management',
    icon: HardDrive,
  },
  {
    id: 'projects',
    title: 'Projects',
    icon: FolderOpen,
  },
];

export function AppSidebar({ activeTab, setActiveTab, user, onLogout }: AppSidebarProps) {
  const { state } = useSidebar();
  const isCollapsed = state === 'collapsed';

  return (
    <Sidebar className="border-r bg-white" collapsible="icon">
      <SidebarHeader className="p-6 border-b">
        <div className="flex items-center gap-3">
          <div className="p-1.5 rounded-lg flex-shrink-0">
            <img src="assets/msigsx_it_dev.png" alt="MSIGSX IT" className="h-12 w-12" />
          </div>
          {!isCollapsed && (
            <div className="flex flex-col min-w-0">
              <h2 className="text-l font-bold text-gray-900 truncate">IT Performance Dashboard</h2>
              <p className="text-sm text-gray-600 leading-tight">Monthly reporting system for IT department metrics</p>
            </div>
          )}
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className={isCollapsed ? "sr-only" : ""}>
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton
                    onClick={() => setActiveTab(item.id)}
                    isActive={activeTab === item.id}
                    className={`w-full justify-start ${
                      activeTab === item.id 
                        ? 'bg-blue-50 text-blue-600 border-r-2 border-blue-600' 
                        : 'hover:bg-gray-50'
                    }`}
                    tooltip={isCollapsed ? item.title : undefined}
                  >
                    <item.icon className={`h-5 w-5 ${
                      activeTab === item.id ? 'text-blue-600' : 'text-gray-500'
                    }`} />
                    {!isCollapsed && (
                      <span className={`ml-3 ${
                        activeTab === item.id ? 'text-blue-600 font-medium' : 'text-gray-700'
                      }`}>
                        {item.title}
                      </span>
                    )}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {user && (
        <SidebarFooter className="p-6 border-t bg-gray-50/50">
          {!isCollapsed ? (
            <div className="space-y-4">
              <div className="text-center space-y-1">
                <p className="text-sm text-gray-600">Welcome back,</p>
                <p className="font-semibold text-gray-900">{user.name}</p>
                <p className="text-lg font-bold text-blue-600">
                  {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </p>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={onLogout} 
                className="w-full flex items-center gap-2 hover:bg-red-50 hover:text-red-600 hover:border-red-200"
              >
                <LogOut className="h-4 w-4" />
                Log Out
              </Button>
            </div>
          ) : (
            <div className="flex flex-col items-center space-y-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={onLogout} 
                    className="w-full p-2 hover:bg-red-50 hover:text-red-600 hover:border-red-200"
                  >
                    <LogOut className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Log Out</p>
                </TooltipContent>
              </Tooltip>
            </div>
          )}
        </SidebarFooter>
      )}
    </Sidebar>
  );
}
