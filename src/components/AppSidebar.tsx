
import React from 'react';
import { 
  TrendingUp,
  Headphones,
  Server,
  Shield,
  HardDrive,
  FolderOpen
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
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";

interface AppSidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
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

export function AppSidebar({ activeTab, setActiveTab }: AppSidebarProps) {
  const { state } = useSidebar();
  const isCollapsed = state === 'collapsed';

  return (
    <Sidebar className="border-r bg-white" collapsible="icon">
      <div className="p-4 border-b">
        <div className="flex items-center gap-2">
          <SidebarTrigger className="h-8 w-8" />
          {!isCollapsed && (
            <h2 className="text-lg font-semibold text-gray-900">IT Dashboard</h2>
          )}
        </div>
      </div>
      
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
    </Sidebar>
  );
}
