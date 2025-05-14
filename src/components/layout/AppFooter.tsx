'use client'; // Footer can be client component if it uses hooks or for consistency
import { useEffect, useState } from 'react';

interface AppFooterProps {
  lang: string;
  dict: any; // from appFooter namespace
  commonDict: any; // from common namespace
}

const AppFooter = ({ lang, dict, commonDict }: AppFooterProps) => {
  const [year, setYear] = useState(new Date().getFullYear());

  useEffect(() => {
    setYear(new Date().getFullYear());
  }, []);
  
  return (
    <footer className="border-t py-6 md:py-8">
      <div className="container flex flex-col items-center justify-between gap-4 md:flex-row">
        <p className="text-sm text-muted-foreground">
          {dict.copyright.replace('{year}', year.toString())} {commonDict.allRightsReserved}
        </p>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          {/* These links would also ideally be localized if they lead to localized pages */}
          <a href={`/${lang}/privacy`} className="hover:text-foreground">{dict.privacyPolicy}</a>
          <a href={`/${lang}/terms`} className="hover:text-foreground">{dict.termsOfService}</a>
        </div>
      </div>
    </footer>
  );
};

export default AppFooter;
