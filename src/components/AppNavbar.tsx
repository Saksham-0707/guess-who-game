import { Link } from 'react-router-dom';
import { Sparkles, Trophy } from 'lucide-react';
import { motion } from 'framer-motion';
import { ThemeToggle } from '@/components/ThemeToggle';

interface AppNavbarProps {
  roomCode?: string;
}

export function AppNavbar({ roomCode }: AppNavbarProps) {
  return (
    <motion.header
      initial={{ opacity: 0, y: -18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="sticky top-0 z-40 border-b border-border/50 bg-background/72 backdrop-blur-xl"
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link to="/" className="group flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/12 text-primary shadow-[0_10px_30px_-18px_hsl(var(--primary)/0.65)] transition-transform duration-300 group-hover:scale-105">
            <Trophy className="h-5 w-5" />
          </div>
          <div>
            <p className="font-heading text-lg font-semibold tracking-tight text-foreground">
              Guess Who Hub
            </p>
            <p className="text-xs text-muted-foreground">
              Fast rounds, clean boards, better multiplayer flow
            </p>
          </div>
        </Link>

        <div className="flex items-center gap-3">
          {roomCode && (
            <div className="hidden items-center gap-2 rounded-full border border-border/70 bg-card/70 px-3 py-2 text-xs font-medium text-muted-foreground shadow-card sm:flex">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              Room {roomCode}
            </div>
          )}
          <ThemeToggle />
        </div>
      </div>
    </motion.header>
  );
}
