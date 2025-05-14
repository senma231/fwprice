'use client';
import { usePathname, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Globe } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface LanguageSwitcherProps {
  currentLang: string;
  dict: {
    switchLanguage: string;
  }
}

export default function LanguageSwitcher({ currentLang, dict }: LanguageSwitcherProps) {
  const router = useRouter();
  const pathname = usePathname();

  const changeLanguage = (newLang: string) => {
    if (currentLang === newLang) return;
    // The pathname from usePathname() does not include the locale
    // So, we construct the new path by replacing the current locale segment if it exists, or just prepending.
    // For App Router, router.push will handle the correct navigation with the new locale.
    const newPath = pathname.startsWith(`/${currentLang}`) ? pathname.replace(`/${currentLang}`, `/${newLang}`) : `/${newLang}${pathname}`;
    router.push(newPath);
    // No need for router.refresh() typically, Next.js handles re-rendering with new locale data.
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label={dict.switchLanguage}>
          <Globe className="h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => changeLanguage('en')} disabled={currentLang === 'en'}>
          English
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => changeLanguage('zh')} disabled={currentLang === 'zh'}>
          中文 (Chinese)
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
