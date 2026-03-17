import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, Eye, EyeOff, Loader2 } from 'lucide-react';
import { CharacterTile } from '@/components/CharacterTile';
import { PageLoader } from '@/components/PageLoader';
import { PageShell } from '@/components/PageShell';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useSocket } from '@/context/SocketContext';

const CharacterSelectPage = () => {
  const { room, playerId, mySelectedCharacterId, selectCharacter } = useSocket();
  const navigate = useNavigate();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [hideCharacter, setHideCharacter] = useState(false);

  const currentPlayer = room?.players.find((player) => player.id === playerId);
  const hasSelected = !!currentPlayer?.selectedCharacter;
  const chosenCharacter = useMemo(
    () => room?.characters.find((character) => character.id === (mySelectedCharacterId ?? selectedId)),
    [mySelectedCharacterId, room?.characters, selectedId],
  );

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
      {chosenCharacter && (
        <Card className="mb-6">
          <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-2xl">Your chosen character</CardTitle>
              <CardDescription>
                Keep this visible for yourself, or hide it while you play on a shared screen.
              </CardDescription>
            </div>
            <Button type="button" variant="outline" onClick={() => setHideCharacter((value) => !value)}>
              {hideCharacter ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
              {hideCharacter ? 'Show character' : 'Hide character'}
            </Button>
          </CardHeader>
          <CardContent>
            {hideCharacter ? (
              <div className="rounded-[24px] border border-border/60 bg-secondary/60 p-6 text-sm text-muted-foreground">
                Your character is hidden. Use the button above whenever you want to reveal it again.
              </div>
            ) : (
              <div className="max-w-sm">
                <CharacterTile
                  id={chosenCharacter.id}
                  name={chosenCharacter.name}
                  imageUrl={chosenCharacter.imageUrl}
                  selected
                  badge="Your pick"
                  footer={<p className="text-xs text-muted-foreground">Only you should know this during the round</p>}
                />
              </div>
            )}
          </CardContent>
        </Card>
      )}

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
