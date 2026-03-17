import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { Check, Sparkles, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CharacterTileProps {
  id: string;
  name: string;
  imageUrl: string;
  onClick?: (id: string) => void;
  disabled?: boolean;
  selected?: boolean;
  eliminated?: boolean;
  highlighted?: boolean;
  badge?: string;
  footer?: ReactNode;
  className?: string;
}

export function CharacterTile({
  id,
  name,
  imageUrl,
  onClick,
  disabled = false,
  selected = false,
  eliminated = false,
  highlighted = false,
  badge,
  footer,
  className,
}: CharacterTileProps) {
  const isInteractive = !!onClick;

  return (
    <motion.button
      type="button"
      whileHover={disabled ? undefined : { y: -5, scale: 1.01 }}
      whileTap={disabled ? undefined : { scale: 0.99 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      onClick={onClick ? () => onClick(id) : undefined}
      disabled={disabled || !isInteractive}
      className={cn(
        'group relative overflow-hidden rounded-[24px] border bg-card/92 text-left shadow-card backdrop-blur-xl transition-all duration-300',
        selected && 'border-primary shadow-[0_22px_45px_-28px_hsl(var(--primary)/0.7)] ring-1 ring-primary/40',
        eliminated && 'border-border/40 opacity-60 grayscale-[0.85]',
        highlighted && 'border-warning/50 shadow-[0_24px_48px_-30px_hsl(var(--warning)/0.75)] ring-1 ring-warning/40',
        !selected && !eliminated && !highlighted && 'border-border/70 hover:border-primary/40',
        isInteractive && !disabled && 'cursor-pointer',
        disabled && 'cursor-not-allowed',
        className,
      )}
    >
      <div className="relative aspect-[0.9] overflow-hidden">
        <img
          src={imageUrl}
          alt={name}
          className={cn(
            'h-full w-full object-cover transition-transform duration-500',
            !disabled && 'group-hover:scale-105',
          )}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/5 to-transparent" />

        {badge && (
          <div className="absolute left-3 top-3 rounded-full border border-white/15 bg-black/45 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-white backdrop-blur-md">
            {badge}
          </div>
        )}

        {selected && (
          <div className="absolute right-3 top-3 rounded-full bg-primary p-2 text-primary-foreground shadow-lg">
            <Check className="h-4 w-4" />
          </div>
        )}

        {highlighted && !selected && (
          <div className="absolute right-3 top-3 rounded-full bg-warning p-2 text-warning-foreground shadow-lg">
            <Sparkles className="h-4 w-4" />
          </div>
        )}

        {eliminated && (
          <>
            <div className="absolute inset-0 bg-background/35" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="rounded-full bg-destructive p-3 text-destructive-foreground shadow-lg">
                <X className="h-5 w-5" />
              </div>
            </div>
          </>
        )}
      </div>

      <div className="space-y-2 p-3">
        <p
          className={cn(
            'truncate text-sm font-semibold tracking-tight text-foreground',
            eliminated && 'line-through text-muted-foreground',
          )}
        >
          {name}
        </p>
        {footer}
      </div>
    </motion.button>
  );
}
