import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { AppNavbar } from '@/components/AppNavbar';
import { cn } from '@/lib/utils';

interface PageShellProps {
  title: string;
  description?: string;
  eyebrow?: string;
  roomCode?: string;
  actions?: ReactNode;
  children: ReactNode;
  contentClassName?: string;
}

export function PageShell({
  title,
  description,
  eyebrow,
  roomCode,
  actions,
  children,
  contentClassName,
}: PageShellProps) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <AppNavbar roomCode={roomCode} />

      <main className="relative isolate overflow-hidden">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-[-10%] top-16 h-72 w-72 rounded-full bg-primary/12 blur-3xl" />
          <div className="absolute right-[-12%] top-40 h-80 w-80 rounded-full bg-accent/10 blur-3xl" />
          <div className="absolute bottom-[-120px] left-1/3 h-80 w-80 rounded-full bg-warning/10 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 pb-12 pt-8 sm:px-6 lg:px-8 lg:pb-16 lg:pt-10">
          <motion.section
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="mb-8 flex flex-col gap-6 lg:mb-10 lg:flex-row lg:items-end lg:justify-between"
          >
            <div className="max-w-3xl">
              {eyebrow && (
                <p className="mb-3 text-xs font-semibold uppercase tracking-[0.28em] text-primary">
                  {eyebrow}
                </p>
              )}
              <h1 className="font-heading text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
                {title}
              </h1>
              {description && (
                <p className="mt-3 max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base">
                  {description}
                </p>
              )}
            </div>
            {actions && <div className="flex w-full flex-wrap gap-3 lg:w-auto lg:justify-end">{actions}</div>}
          </motion.section>

          <div className={cn('space-y-6', contentClassName)}>{children}</div>
        </div>
      </main>
    </div>
  );
}
