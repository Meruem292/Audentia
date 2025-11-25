import { cn } from '@/lib/utils';
import Image from 'next/image';

export function Logo({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Image src="/logo.png" alt="EcoVend logo" width={24} height={24} className="h-6 w-6 rounded-full" />
      <span className="font-bold font-headline text-lg">EcoVend</span>
    </div>
  );
}
