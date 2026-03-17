import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSocket } from '@/context/SocketContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Users, Plus, LogIn } from 'lucide-react';

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
    <div className="flex min-h-screen items-center justify-center" style={{ background: 'var(--gradient-surface)' }}>
      <div className="w-full max-w-md px-6">
        <div className="mb-10 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl gradient-primary shadow-elevated">
            <Users className="h-8 w-8 text-primary-foreground" />
          </div>
          <h1 className="font-heading text-4xl font-bold tracking-tight text-foreground">
            Guess Who
          </h1>
          <p className="mt-2 text-lg text-muted-foreground">Multiplayer</p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 shadow-card space-y-5">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">Your Name</label>
            <Input
              placeholder="Enter your name"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              className="h-11"
            />
          </div>

          <Button
            onClick={handleCreate}
            disabled={!playerName.trim() || !isConnected}
            className="w-full h-11 gradient-primary text-primary-foreground font-semibold"
          >
            <Plus className="mr-2 h-4 w-4" /> Create New Room
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border" /></div>
            <div className="relative flex justify-center"><span className="bg-card px-3 text-sm text-muted-foreground">or join existing</span></div>
          </div>

          <div className="flex gap-2">
            <Input
              placeholder="Room Code"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
              maxLength={6}
              className="h-11 font-mono tracking-widest uppercase"
            />
            <Button
              onClick={handleJoin}
              disabled={!playerName.trim() || !roomCode.trim() || !isConnected}
              variant="outline"
              className="h-11 px-5"
            >
              <LogIn className="mr-2 h-4 w-4" /> Join
            </Button>
          </div>

          {!isConnected && (
            <p className="text-center text-sm text-destructive">
              Connecting to server...
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default HomePage;
