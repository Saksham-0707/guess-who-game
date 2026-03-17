import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Award, PencilRuler, RotateCcw } from 'lucide-react';
import { CharacterTile } from '@/components/CharacterTile';
import { PageLoader } from '@/components/PageLoader';
import { PageShell } from '@/components/PageShell';
import { useSocket } from '@/context/SocketContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { RevealedSelection } from '@/types/game';

const GameOverPage = () => {
  const { room, playerId, editBoard, rematch } = useSocket();
  const navigate = useNavigate();

  useEffect(() => {
    if (!room) {
      navigate('/');
      return;
    }

    if (room.phase === 'lobby') navigate('/lobby');
    if (room.phase === 'board-setup') navigate('/setup');
    if (room.phase === 'character-selection') navigate('/select');
    if (room.phase === 'playing') navigate('/game');
  }, [navigate, room]);

  if (!room) return <PageLoader title="Loading results" description="Preparing the end-of-round summary." />;

  const isDraw = room.winnerId === null;
  const isWinner = room.winnerId === playerId;
  const winner = room.players.find((player) => player.id === room.winnerId);
  const currentPlayer = room.players.find((player) => player.id === playerId);
  const isHost = currentPlayer?.isHost ?? false;
  const revealedSelections = room.revealedSelections ?? [];

  const handleEditBoard = () => {
    editBoard();
    navigate('/setup');
  };

  return (
    <PageShell
      eyebrow="Round Complete"
      title={isDraw ? 'Both players nailed the guess.' : isWinner ? 'You closed the round.' : 'Round lost.'}
      description={
        isDraw
          ? 'Both players guessed correctly, so the game ends in a draw.'
          : `${winner?.name ?? 'A player'} guessed correctly and ended the round.`
      }
      roomCode={room.code}
    >
      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-3xl">
              <span
                className={`flex h-12 w-12 items-center justify-center rounded-2xl ${
                  isDraw ? 'bg-warning/15 text-warning' : isWinner ? 'bg-success/15 text-success' : 'bg-destructive/15 text-destructive'
                }`}
              >
                <Award className="h-6 w-6" />
              </span>
              {isDraw ? 'Draw' : isWinner ? 'Victory' : 'Defeat'}
            </CardTitle>
            <CardDescription>Use rematch to keep the same room and jump back into selection.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-[24px] border border-border/60 bg-background/70 p-4">
              <p className="text-sm font-semibold text-foreground">Result summary</p>
              <p className="mt-2 text-sm text-muted-foreground">
                {isDraw
                  ? 'The round ended even because both players found the right answer.'
                  : isWinner
                    ? 'You guessed the opponent correctly before they could reverse the result.'
                    : 'The opponent solved your character first.'}
              </p>
            </div>

            {isHost ? (
              <div className="space-y-3">
                <Button onClick={rematch} className="w-full gradient-primary text-primary-foreground">
                  <RotateCcw className="h-4 w-4" />
                  Start rematch
                </Button>
                <Button onClick={handleEditBoard} variant="outline" className="w-full">
                  <PencilRuler className="h-4 w-4" />
                  Edit board first
                </Button>
              </div>
            ) : (
              <div className="rounded-[24px] border border-border/60 bg-secondary/60 p-4 text-sm text-muted-foreground">
                Only the host can start a rematch or change the board. Waiting for the host to choose the next step.
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">Correct character</CardTitle>
            <CardDescription>The revealed answer gets highlighted so the result screen feels definitive.</CardDescription>
          </CardHeader>
          <CardContent>
            {room.correctCharacterData ? (
              <div className="max-w-sm">
                <CharacterTile
                  id="correct-character"
                  name={room.correctCharacterData.name}
                  imageUrl={room.correctCharacterData.imageUrl}
                  highlighted
                  badge="Revealed"
                  footer={<p className="text-xs text-muted-foreground">The final answer for this round</p>}
                />
              </div>
            ) : (
              <div className="rounded-[24px] border border-border/60 bg-background/70 p-4 text-sm text-muted-foreground">
                Correct character data was not available.
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-3xl">Both chosen characters</CardTitle>
          <CardDescription>
            Once the round ends, both players can see the final secret picks.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2">
            {revealedSelections.map(({ playerId: revealedPlayerId, playerName, character }: RevealedSelection) => (
              <div key={revealedPlayerId} className="space-y-3">
                <p className="text-sm font-semibold text-foreground">
                  {playerName}
                  {revealedPlayerId === playerId ? ' (You)' : ''}
                </p>
                <CharacterTile
                  id={`revealed-${revealedPlayerId}`}
                  name={character.name}
                  imageUrl={character.imageUrl}
                  highlighted
                  badge="Chosen"
                  footer={<p className="text-xs text-muted-foreground">Secret pick from this round</p>}
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </PageShell>
  );
};

export default GameOverPage;
