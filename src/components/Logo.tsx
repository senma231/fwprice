import { Ship } from 'lucide-react';
import Link from 'next/link';

const Logo = ({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) => {
  const iconSize = size === 'sm' ? 20 : size === 'md' ? 24 : 32;
  const textSize = size === 'sm' ? 'text-lg' : size === 'md' ? 'text-xl' : 'text-2xl';

  return (
    <Link href="/" className="flex items-center gap-2 text-primary hover:text-primary/90 transition-colors">
      <Ship size={iconSize} strokeWidth={2.5} />
      <span className={`font-bold ${textSize}`}>FreightWise</span>
    </Link>
  );
};

export default Logo;
