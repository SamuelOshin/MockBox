import { cn } from '@/lib/utils';

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'rounded-md bg-muted animate-pulse relative overflow-hidden',
        className
      )}
      {...props}
    />
  );
}

export { Skeleton };
