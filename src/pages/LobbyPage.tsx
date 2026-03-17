import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Copy, Loader2, PlayCircle, Users } from 'lucide-react';
import { toast } from 'sonner';
import { PageLoader } from '@/components/PageLoader';
import { PageShell } from '@/components/PageShell';
import { useSocket } from '@/context/SocketContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const LobbyPage = () => {
  const { room, playerId, startSetup } = useSocket();
  const navigate = useNavigate();

  const currentPlayer = room?.players.find((player) => player.id === playerId);
  const isHost = currentPlayer?.isHost ?? false;

  useEffect(() => {
    if (!room) return;

    if (room.phase === 'board-setup') {
      navigate('/setup');
    } else if (room.phase === 'character-selection') {
      navigate('/select');
    } else if (room.phase === 'playing') {
      navigate('/game');
    }
  }, [navigate, room]);

  const copyCode = () => {
    if (!room?.code) return;
    navigator.clipboard.writeText(room.code);
    toast.success('Room code copied.');
  };

  if (!room) return <PageLoader title="Opening lobby" description="Waiting for room data from the server." />;

  return (
    <PageShell
      eyebrow="Lobby"
      title="Invite your opponent and launch the board."
      description="The lobby foregrounds the room code, player readiness, and the host action so the start flow feels obvious on both desktop and mobile."
      roomCode={room.code}
    >
      <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
          <Card>
            <CardHeader>
              <CardTitle className="text-3xl">Room code</CardTitle>
              <CardDescription>Share this with the second player to fill the room.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <button
                type="button"
                onClick={copyCode}
                className="flex w-full items-center justify-between rounded-[24px] border border-border/70 bg-secondary/60 px-5 py-5 text-left transition-all hover:border-primary/35 hover:bg-secondary"
              >
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
                    Tap to copy
                  </p>
                  <p className="mt-2 font-mono text-4xl font-bold tracking-[0.35em] text-foreground">
                    {room.code}
                  </p>
                </div>
                <div className="rounded-full border border-border/70 p-3 text-muted-foreground">
                  <Copy className="h-5 w-5" />
                </div>
              </button>

              <div className="rounded-[24px] border border-border/60 bg-background/70 p-4">
                <p className="text-sm font-semibold text-foreground">Room status</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {room.players.length < 2
                    ? 'Waiting for one more player to join.'
                    : isHost
                      ? 'Both players are here. You can start the board setup now.'
                      : 'Both players are here. Waiting for the host to start setup.'}
                </p>
              </div>

              {room.players.length < 2 ? (
                <div className="flex items-center gap-3 rounded-[24px] border border-warning/30 bg-warning/10 px-4 py-4 text-warning-foreground">
                  <Loader2 className="h-4 w-4 animate-spin text-warning" />
                  <span className="text-sm text-foreground">Waiting for another player...</span>
                </div>
              ) : isHost ? (
                <Button onClick={startSetup} className="w-full gradient-primary text-primary-foreground">
                  <PlayCircle className="h-4 w-4" />
                  Start board setup
                </Button>
              ) : (
                <div className="rounded-[24px] border border-border/60 bg-secondary/60 px-4 py-4 text-sm text-muted-foreground">
                  The host controls the next step. Stay here and you will be moved automatically.
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.05 }}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-3xl">
                <Users className="h-6 w-6 text-primary" />
                Players
              </CardTitle>
              <CardDescription>Each player card stays visually distinct so host ownership is easy to scan.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              {room.players.map((player) => (
                <div
                  key={player.id}
                  className="rounded-[24px] border border-border/60 bg-background/70 p-4 shadow-card"
                >
                  <div className="mb-4 flex items-start justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
                        {player.id === playerId ? 'You' : 'Opponent'}
                      </p>
                      <p className="mt-2 text-xl font-semibold tracking-tight text-foreground">
                        {player.name}
                      </p>
                    </div>
                    {player.isHost && (
                      <span className="rounded-full bg-primary/14 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                        Host
                      </span>
                    )}
                  </div>
                  <div className="rounded-2xl border border-border/60 bg-card/75 px-3 py-3 text-sm text-muted-foreground">
                    {player.isHost ? 'Builds the board and starts the round.' : 'Waits in the lobby and joins once setup is done.'}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </PageShell>
  );
};

export default LobbyPage;
