import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSocket } from '@/context/SocketContext';
import { Check, Loader2 } from 'lucide-react';

const CharacterSelectPage = () => {
  const { room, playerId, selectCharacter } = useSocket();
  const navigate = useNavigate();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const currentPlayer = room?.players.find(p => p.id === playerId);
  const hasSelected = !!currentPlayer?.selectedCharacter;

  useEffect(() => {
    if (!room) { navigate('/'); return; }
    if (room.phase === 'playing') navigate('/game');
  }, [room, navigate]);

  const handleSelect = (characterId: string) => {
    if (hasSelected) return;
    setSelectedId(characterId);
    selectCharacter(characterId);
  };

  if (!room) return null;

  return (
    <div className="min-h-screen py-8" style={{ background: 'var(--gradient-surface)' }}>
      <div className="mx-auto max-w-4xl px-6">
        <div className="mb-6 text-center">
          <h2 className="font-heading text-3xl font-bold text-foreground">Choose Your Character</h2>
          <p className="mt-1 text-muted-foreground">
            {hasSelected ? 'Waiting for opponent to choose...' : 'Pick a character secretly — your opponent will try to guess it!'}
          </p>
        </div>

        {hasSelected && (
          <div className="mb-6 flex items-center justify-center gap-2 text-accent">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm font-medium">Waiting for opponent...</span>
          </div>
        )}

        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5">
          {room.characters.map(c => {
            const isSelected = selectedId === c.id;
            return (
              <button
                key={c.id}
                onClick={() => handleSelect(c.id)}
                disabled={hasSelected}
                className={`relative rounded-xl border-2 overflow-hidden transition-all ${
                  isSelected
                    ? 'border-accent ring-2 ring-accent/30 scale-[1.02]'
                    : 'border-border hover:border-primary/40 hover:scale-[1.01]'
                } ${hasSelected && !isSelected ? 'opacity-50' : ''}`}
              >
                <img src={c.imageUrl} alt={c.name} className="aspect-square w-full object-cover" />
                <div className="p-2 text-center">
                  <p className="text-xs font-medium text-foreground truncate">{c.name}</p>
                </div>
                {isSelected && (
                  <div className="absolute inset-0 flex items-center justify-center bg-accent/20">
                    <div className="rounded-full bg-accent p-2">
                      <Check className="h-5 w-5 text-accent-foreground" />
                    </div>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CharacterSelectPage;
