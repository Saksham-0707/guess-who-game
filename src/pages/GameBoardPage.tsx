import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Crown, HelpCircle, RotateCcw, ShieldAlert } from 'lucide-react';
import { CharacterTile } from '@/components/CharacterTile';
import { PageLoader } from '@/components/PageLoader';
import { PageShell } from '@/components/PageShell';
import GuessDialog from '@/components/GuessDialog';
import { useSocket } from '@/context/SocketContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const GameBoardPage = () => {
  const { room, playerId, eliminateCharacter, restoreCharacter, socket } = useSocket();
  const navigate = useNavigate();
  const [guessOpen, setGuessOpen] = useState(false);

  const currentPlayer = room?.players.find((player) => player.id === playerId);
  const opponent = room?.players.find((player) => player.id !== playerId);
  const isMyTurn = room?.currentTurn === playerId;
  const isFinalGuess = room?.phase === 'final-guess';

  useEffect(() => {
    if (!room) {
      navigate('/');
      return;
    }

    if (room.phase === 'game-over') {
      navigate('/gameover');
    }
  }, [navigate, room]);

  const eliminated = useMemo(() => new Set(currentPlayer?.eliminatedCharacters ?? []), [currentPlayer?.eliminatedCharacters]);

  if (!room || !currentPlayer) {
    return <PageLoader title="Loading board" description="Syncing turns and character states." />;
  }

  const toggleEliminate = (id: string) => {
    if (!isMyTurn || isFinalGuess) return;

    if (eliminated.has(id)) {
      restoreCharacter(id);
    } else {
      eliminateCharacter(id);
    }
  };

  const endTurn = () => {
    if (!isMyTurn) return;
    socket?.emit('end-turn');
  };

  const canGuess = (room.phase === 'playing' && isMyTurn) || (room.phase === 'final-guess' && isMyTurn);

  return (
    <PageShell
      eyebrow="Game Board"
      title={isFinalGuess ? 'Final guess is live.' : isMyTurn ? 'Your turn to narrow the board.' : "Opponent's turn is in progress."}
      description={
        isFinalGuess
          ? isMyTurn
            ? 'You have one last guess. Make it count.'
            : 'Your opponent has one last guess before the result screen.'
          : 'Eliminate cards as you reason through the clues, then submit a guess when you are ready.'
      }
      roomCode={room.code}
      actions={
        <>
          <Button onClick={() => setGuessOpen(true)} disabled={!canGuess} className="gradient-primary text-primary-foreground">
            <HelpCircle className="h-4 w-4" />
            Guess character
          </Button>
          {room.phase === 'playing' && (
            <Button onClick={endTurn} disabled={!isMyTurn} variant="outline">
              <RotateCcw className="h-4 w-4" />
              End turn
            </Button>
          )}
        </>
      }
    >
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">{currentPlayer.name}</CardTitle>
            <CardDescription>{isMyTurn ? 'Active player' : 'Waiting for your turn'}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3 rounded-[22px] border border-border/60 bg-background/70 px-4 py-4">
              <div className={`rounded-full p-3 ${isMyTurn ? 'bg-primary/14 text-primary' : 'bg-secondary text-muted-foreground'}`}>
                <Crown className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">{isMyTurn ? 'Your move' : 'Stand by'}</p>
                <p className="text-sm text-muted-foreground">
                  {isFinalGuess
                    ? 'No card toggling during the final guess phase.'
                    : isMyTurn
                      ? 'Tap cards to eliminate or restore them.'
                      : 'You can still review your board while waiting.'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">{opponent?.name ?? 'Opponent'}</CardTitle>
            <CardDescription>Round pressure and turn status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3 rounded-[22px] border border-warning/25 bg-warning/10 px-4 py-4">
              <div className="rounded-full bg-warning/20 p-3 text-warning">
                <ShieldAlert className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">
                  {isFinalGuess ? 'Final guess phase' : isMyTurn ? 'Board is editable' : 'Board is locked'}
                </p>
                <p className="text-sm text-muted-foreground">
                  {isFinalGuess
                    ? 'Only the current player can make the deciding guess.'
                    : isMyTurn
                      ? 'You can mark cards before ending your turn.'
                      : 'Wait for the turn handoff before editing your board.'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {room.characters.map((character) => (
          <CharacterTile
            key={character.id}
            id={character.id}
            name={character.name}
            imageUrl={character.imageUrl}
            onClick={toggleEliminate}
            disabled={!isMyTurn || isFinalGuess}
            eliminated={eliminated.has(character.id)}
            badge={eliminated.has(character.id) ? 'Eliminated' : isMyTurn && !isFinalGuess ? 'Active' : undefined}
            footer={
              <p className="text-xs text-muted-foreground">
                {eliminated.has(character.id)
                  ? 'Removed from your shortlist'
                  : isMyTurn && !isFinalGuess
                    ? 'Tap to eliminate'
                    : 'View only'}
              </p>
            }
          />
        ))}
      </div>

      <GuessDialog open={guessOpen} onOpenChange={setGuessOpen} />
    </PageShell>
  );
};

export default GameBoardPage;
