import { Skeleton } from '@/components/ui/skeleton';
import { PageShell } from '@/components/PageShell';

interface PageLoaderProps {
  title?: string;
  description?: string;
}

export function PageLoader({
  title = 'Loading room',
  description = 'Syncing the latest game state.',
}: PageLoaderProps) {
  return (
    <PageShell title={title} description={description} eyebrow="Loading">
      <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="rounded-[28px] border border-border/60 bg-card/75 p-6 shadow-card backdrop-blur-xl">
          <Skeleton className="mb-4 h-6 w-40" />
          <Skeleton className="mb-2 h-12 w-full" />
          <Skeleton className="h-12 w-2/3" />
        </div>
        <div className="rounded-[28px] border border-border/60 bg-card/75 p-6 shadow-card backdrop-blur-xl">
          <Skeleton className="mb-4 h-6 w-32" />
          <div className="space-y-3">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        </div>
      </div>
    </PageShell>
  );
}
