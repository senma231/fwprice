'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  DollarSign,
  FilePlus2,
  Users2,
  Megaphone,
  ClipboardList, 
  LogOut,
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
} from '@/components/ui/sidebar';
import { useAuth } from '@/hooks/useAuth';
import { useEffect, useState } from 'react';
import type { Locale } from '@/lib/dictionaries';


interface NavItemBase {
  key: string; // Corresponds to a key in dashboardSidebar dict
  icon: React.ElementType;
  role?: 'agent' | 'admin';
  hrefSuffix: string; // e.g., '', '/internal-prices'
}


interface DashboardSidebarProps {
  lang: Locale;
}

const DashboardSidebar = ({ lang }: DashboardSidebarProps) => {
  const pathname = usePathname(); // Returns path without locale, e.g. /dashboard/internal-prices
  const { user, logout, isLoading: authLoading } = useAuth();
  const [dict, setDict] = useState<any>(null); // To store loaded dictionary
  const [isDictLoading, setIsDictLoading] = useState(true);

  useEffect(() => {
    async function loadDictionary() {
      setIsDictLoading(true);
      try {
        const DYNAMIC_IMPORT_DELAY = 0; //ms
        await new Promise(resolve => setTimeout(resolve, DYNAMIC_IMPORT_DELAY));
        const loadedDict = (await import(`@/locales/${lang}.json`)).default;
        setDict(loadedDict.dashboardSidebar);
      } catch (error) {
        console.error("Failed to load dictionary for sidebar:", error);
        // Fallback or error handling
        const fallbackDict = (await import(`@/locales/en.json`)).default;
        setDict(fallbackDict.dashboardSidebar);
      }
      setIsDictLoading(false);
    }
    loadDictionary();
  }, [lang]);

  const navItemsBase: NavItemBase[] = [
    { key: 'overview', hrefSuffix: '', icon: LayoutDashboard, role: 'agent' },
    { key: 'internalPrices', hrefSuffix: '/internal-prices', icon: DollarSign, role: 'agent' },
    { key: 'rfqManagement', hrefSuffix: '/admin/rfq-management', icon: ClipboardList, role: 'admin' },
    { key: 'managePrices', hrefSuffix: '/admin/manage-prices', icon: FilePlus2, role: 'admin' },
    { key: 'userManagement', hrefSuffix: '/admin/user-management', icon: Users2, role: 'admin' },
    { key: 'announcements', hrefSuffix: '/admin/announcement-management', icon: Megaphone, role: 'admin' },
  ];
  
  if (authLoading || isDictLoading || !user || !dict) {
    return (
      <Sidebar>
        <SidebarContent>
          <SidebarMenu>
            {[...Array(navItemsBase.length)].map((_, i) => <SidebarMenuSkeleton key={i} showIcon />)}
          </SidebarMenu>
        </SidebarContent>
      </Sidebar>
    );
  }
  
  const userRole = user?.role;

  const filteredNavItems = navItemsBase.filter(item => {
    if (!item.role) return true; 
    if (item.role === 'agent' && (userRole === 'agent' || userRole === 'admin')) return true;
    if (item.role === 'admin' && userRole === 'admin') return true;
    return false;
  }).map(item => ({
    ...item,
    label: dict[item.key] || item.key, // Get label from dictionary
    href: `/${lang}/dashboard${item.hrefSuffix}`
  }));

  // Determine the active path without the language prefix
  const activePathSegment = pathname; // e.g. /dashboard or /dashboard/internal-prices

  return (
    <Sidebar>
      <SidebarContent className="pt-4"> 
        <SidebarMenu>
          {filteredNavItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <Link href={item.href} legacyBehavior passHref>
                <SidebarMenuButton
                  isActive={item.href === `/${lang}${activePathSegment}` || (item.href !== `/${lang}/dashboard` && `/${lang}${activePathSegment}`.startsWith(item.href))}
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
                <SidebarMenuButton onClick={logout} tooltip={{ children: dict.logout, side: 'right', align: 'center' }}>
                    <LogOut />
                    <span>{dict.logout}</span>
                </SidebarMenuButton>
            </SidebarMenuItem>
         </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
};

export default DashboardSidebar;
