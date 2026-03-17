import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSocket } from '@/context/SocketContext';
import { Button } from '@/components/ui/button';
import { Copy, Users, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const LobbyPage = () => {
  const { room, playerId, startSetup } = useSocket();
  const navigate = useNavigate();

  const currentPlayer = room?.players.find(p => p.id === playerId);
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
  }, [room?.phase, navigate]);

  const copyCode = () => {
    if (room?.code) {
      navigator.clipboard.writeText(room.code);
      toast.success('Room code copied!');
    }
  };

  if (!room) return null;

  return (
    <div className="flex min-h-screen items-center justify-center" style={{ background: 'var(--gradient-surface)' }}>
      <div className="w-full max-w-md px-6">
        <div className="rounded-2xl border border-border bg-card p-8 shadow-card text-center space-y-6">
          <h2 className="font-heading text-2xl font-bold text-foreground">Game Lobby</h2>

          <div>
            <p className="text-sm text-muted-foreground mb-2">Room Code</p>
            <button
              onClick={copyCode}
              className="inline-flex items-center gap-2 rounded-xl bg-muted px-6 py-3 font-mono text-2xl font-bold tracking-[0.3em] text-foreground hover:bg-secondary transition-colors"
            >
              {room.code}
              <Copy className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>

          <div>
            <p className="text-sm text-muted-foreground mb-3 flex items-center justify-center gap-1">
              <Users className="h-4 w-4" /> Players ({room.players.length}/2)
            </p>
            <div className="space-y-2">
              {room.players.map(p => (
                <div key={p.id} className="flex items-center justify-between rounded-lg bg-muted px-4 py-2.5">
                  <span className="font-medium text-foreground">{p.name}</span>
                  {p.isHost && (
                    <span className="rounded-full bg-primary px-2.5 py-0.5 text-xs font-medium text-primary-foreground">
                      Host
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {room.players.length < 2 ? (
            <div className="flex items-center justify-center gap-2 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm">Waiting for another player...</span>
            </div>
          ) : isHost ? (
            <Button
              onClick={startSetup}
              className="w-full h-11 gradient-primary text-primary-foreground font-semibold"
            >
              Start Board Setup
            </Button>
          ) : (
            <p className="text-sm text-muted-foreground">Waiting for host to start...</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default LobbyPage;