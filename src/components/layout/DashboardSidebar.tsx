'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  DollarSign,
  FilePlus2,
  Users2,
  Megaphone,
  Settings,
  LogOut,
  UploadCloud,
  UserPlus2,
  FileText,
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSkeleton,
  SidebarSeparator,
  SidebarGroup,
  SidebarGroupLabel
} from '@/components/ui/sidebar'; // Using the provided custom sidebar
import Logo from '@/components/Logo';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
  role?: 'agent' | 'admin'; // For role-based visibility
}

const navItems: NavItem[] = [
  { href: '/dashboard', label: 'Overview', icon: LayoutDashboard, role: 'agent' },
  { href: '/dashboard/internal-prices', label: 'Internal Prices', icon: DollarSign, role: 'agent' },
  { href: '/dashboard/admin/manage-prices', label: 'Manage Prices', icon: FilePlus2, role: 'admin' },
  { href: '/dashboard/admin/user-management', label: 'User Management', icon: Users2, role: 'admin' },
  { href: '/dashboard/admin/announcement-management', label: 'Announcements', icon: Megaphone, role: 'admin' },
];

const DashboardSidebar = () => {
  const pathname = usePathname();
  const { user, logout, isLoading } = useAuth();

  if (isLoading || !user) {
    return (
      <Sidebar>
        {/* SidebarHeader removed */}
        <SidebarContent>
          <SidebarMenu>
            {[...Array(5)].map((_, i) => <SidebarMenuSkeleton key={i} showIcon />)}
          </SidebarMenu>
        </SidebarContent>
      </Sidebar>
    );
  }
  
  const userRole = user?.role;

  const filteredNavItems = navItems.filter(item => {
    if (!item.role) return true; // No specific role required
    if (item.role === 'agent' && (userRole === 'agent' || userRole === 'admin')) return true;
    if (item.role === 'admin' && userRole === 'admin') return true;
    return false;
  });

  return (
    <Sidebar>
      {/* SidebarHeader removed */}
      <SidebarContent className="pt-4"> {/* Added padding-top to compensate for removed header */}
        <SidebarMenu>
          {filteredNavItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <Link href={item.href} legacyBehavior passHref>
                <SidebarMenuButton
                  isActive={pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))}
                  tooltip={{ children: item.label, side: 'right', align: 'center' }}
                >
                  <item.icon />
                  <span>{item.label}</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarSeparator />
      <SidebarFooter>
         <SidebarMenu>
            <SidebarMenuItem>
                <SidebarMenuButton onClick={logout} tooltip={{ children: "Logout", side: 'right', align: 'center' }}>
                    <LogOut />
                    <span>Logout</span>
                </SidebarMenuButton>
            </SidebarMenuItem>
         </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
};

export default DashboardSidebar;
