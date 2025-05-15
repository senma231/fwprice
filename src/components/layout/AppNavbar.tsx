
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import Logo from '@/components/Logo';
import { useAuth } from '@/hooks/useAuth';
import { LayoutDashboard, LogIn, LogOut } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import LanguageSwitcher from './LanguageSwitcher';
import { useToast } from "@/hooks/use-toast";

interface AppNavbarProps {
  lang: string;
  dict: any; // From appNavbar namespace
  commonDict: any; // From common namespace
  toastDict: any; // From toasts namespace
}

const AppNavbar = ({ lang, dict, commonDict, toastDict }: AppNavbarProps) => {
  const { user, logout, isLoading } = useAuth();
  const { toast } = useToast();

  const handleLogout = async () => {
    await logout(); // AuthContext logout doesn't show toast anymore
    // Use the toastDict prop directly
    toast({
        title: toastDict.logoutTitle || "Logged Out",
        description: toastDict.logoutDesc || "You have been successfully logged out."
    });
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Logo lang={lang} />
        <nav className="flex items-center gap-2 sm:gap-4">
          <LanguageSwitcher currentLang={lang} dict={dict}/>
          {isLoading ? (
            <div className="h-8 w-20 animate-pulse rounded-md bg-muted"></div>
          ) : user ? (
            <>
              <Button variant="ghost" asChild>
                <Link href={`/${lang}/dashboard`}>
                  <LayoutDashboard className="mr-2 h-4 w-4" />
                  {commonDict.dashboard}
                </Link>
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={`https://i.pravatar.cc/150?u=${user.email}`} alt={user.name || user.email} />
                      <AvatarFallback>{user.name ? user.name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user.name || commonDict.user}</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    {commonDict.logout}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <Button asChild>
              <Link href={`/${lang}/login`}>
                <LogIn className="mr-2 h-4 w-4" />
                {dict.agentLogin}
              </Link>
            </Button>
          )}
        </nav>
      </div>
    </header>
  );
};

export default AppNavbar;
