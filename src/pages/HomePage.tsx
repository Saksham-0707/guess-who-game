import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LogIn, Plus, ShieldCheck, Sparkles, Users, Wifi } from 'lucide-react';
import { PageShell } from '@/components/PageShell';
import { useSocket } from '@/context/SocketContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

const features = [
  {
    icon: Users,
    title: 'Live multiplayer rooms',
    description: 'Create a room in seconds and jump straight into a clean two-player match.',
  },
  {
    icon: Sparkles,
    title: 'Fast custom board setup',
    description: 'Build a fresh celebrity board with image suggestions and instant previews.',
  },
  {
    icon: ShieldCheck,
    title: 'Theme-aware premium UI',
    description: 'Responsive layouts, motion feedback, and accessible dark and light themes.',
  },
];

const HomePage = () => {
  const [playerName, setPlayerName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const { createRoom, joinRoom, isConnected } = useSocket();
  const navigate = useNavigate();

  const handleCreate = () => {
    if (!playerName.trim()) return;
    createRoom(playerName.trim());
    navigate('/lobby');
  };

  const handleJoin = () => {
    if (!playerName.trim() || !roomCode.trim()) return;
    joinRoom(roomCode.trim().toUpperCase(), playerName.trim());
    navigate('/lobby');
  };

  return (
    <PageShell
      eyebrow="Modern Multiplayer Guessing"
      title="A cleaner, faster Guess Who experience for custom online matches."
      description="Built for quick room creation, sharp visuals, responsive play, and a game board that feels polished instead of improvised."
      actions={
        <div className="flex items-center gap-2 rounded-full border border-border/70 bg-card/75 px-4 py-2 text-sm text-muted-foreground shadow-card backdrop-blur-xl">
          <Wifi className={`h-4 w-4 ${isConnected ? 'text-success' : 'text-warning'}`} />
          {isConnected ? 'Server connected' : 'Connecting to server'}
        </div>
      }
    >
      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <motion.section
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.05 }}
          className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1"
        >
          {features.map(({ icon: Icon, title, description }, index) => (
            <Card key={title} className="overflow-hidden">
              <CardHeader>
                <motion.div
                  initial={{ scale: 0.92, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.35, delay: 0.08 * index }}
                  className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/12 text-primary"
                >
                  <Icon className="h-5 w-5" />
                </motion.div>
                <CardTitle className="text-xl">{title}</CardTitle>
                <CardDescription>{description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </motion.section>

        <motion.section
          initial={{ opacity: 0, x: 18 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.45, delay: 0.1 }}
        >
          <Card className="overflow-hidden">
            <CardHeader className="pb-4">
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.24em] text-primary">
                Start a match
              </p>
              <CardTitle className="text-3xl text-balance">Create a room or join one instantly.</CardTitle>
              <CardDescription>
                The home screen is intentionally split into two clear actions so players can enter a match with minimal friction.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground">Player name</label>
                <Input
                  placeholder="Enter your display name"
                  value={playerName}
                  onChange={(event) => setPlayerName(event.target.value)}
                />
              </div>

              <Button
                onClick={handleCreate}
                disabled={!playerName.trim() || !isConnected}
                className="w-full gradient-primary text-primary-foreground"
              >
                <Plus className="h-4 w-4" />
                Create new room
              </Button>

              <div className="flex items-center gap-3 py-1">
                <div className="h-px flex-1 bg-border/70" />
                <span className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
                  or join
                </span>
                <div className="h-px flex-1 bg-border/70" />
              </div>

              <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
                <Input
                  placeholder="Room code"
                  value={roomCode}
                  onChange={(event) => setRoomCode(event.target.value.toUpperCase())}
                  maxLength={6}
                  className="font-mono uppercase tracking-[0.3em]"
                />
                <Button
                  onClick={handleJoin}
                  disabled={!playerName.trim() || !roomCode.trim() || !isConnected}
                  variant="outline"
                  className="w-full sm:w-auto"
                >
                  <LogIn className="h-4 w-4" />
                  Join room
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.section>
      </div>
    </PageShell>
  );
};

export default HomePage;
