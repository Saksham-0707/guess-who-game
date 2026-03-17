import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, Loader2 } from 'lucide-react';
import { CharacterTile } from '@/components/CharacterTile';
import { PageLoader } from '@/components/PageLoader';
import { PageShell } from '@/components/PageShell';
import { useSocket } from '@/context/SocketContext';

const CharacterSelectPage = () => {
  const { room, playerId, selectCharacter } = useSocket();
  const navigate = useNavigate();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const currentPlayer = room?.players.find((player) => player.id === playerId);
  const hasSelected = !!currentPlayer?.selectedCharacter;

  useEffect(() => {
    if (!room) {
      navigate('/');
      return;
    }
    if (room.phase === 'playing') navigate('/game');
  }, [navigate, room]);

  const handleSelect = (characterId: string) => {
    if (hasSelected) return;
    setSelectedId(characterId);
    selectCharacter(characterId);
  };

  if (!room) return <PageLoader title="Loading selection" description="Preparing the character board." />;

  return (
    <PageShell
      eyebrow="Secret Pick"
      title="Choose your character without giving it away."
      description="Selected cards get a strong visual treatment so you always know what you locked in, while the full grid remains clean and readable."
      roomCode={room.code}
      actions={
        hasSelected ? (
          <div className="flex items-center gap-2 rounded-full border border-success/30 bg-success/10 px-4 py-2 text-sm text-foreground">
            <Loader2 className="h-4 w-4 animate-spin text-success" />
            Waiting for opponent
          </div>
        ) : (
          <div className="flex items-center gap-2 rounded-full border border-border/70 bg-card/75 px-4 py-2 text-sm text-muted-foreground">
            <CheckCircle2 className="h-4 w-4 text-primary" />
            Pick one card secretly
          </div>
        )
      }
    >
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {room.characters.map((character) => {
          const isSelected = selectedId === character.id || currentPlayer?.selectedCharacter === character.id;
          return (
            <CharacterTile
              key={character.id}
              id={character.id}
              name={character.name}
              imageUrl={character.imageUrl}
              onClick={handleSelect}
              disabled={hasSelected}
              selected={isSelected}
              badge={isSelected ? 'Selected' : undefined}
              footer={
                <p className="text-xs text-muted-foreground">
                  {isSelected ? 'Locked in for this round' : hasSelected ? 'Selection closed' : 'Tap to choose'}
                </p>
              }
            />
          );
        })}
      </div>
    </PageShell>
  );
};

export default CharacterSelectPage;
