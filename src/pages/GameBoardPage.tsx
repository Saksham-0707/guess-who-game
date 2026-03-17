import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSocket } from '@/context/SocketContext';
import { Button } from '@/components/ui/button';
import { HelpCircle } from 'lucide-react';
import GuessDialog from '@/components/GuessDialog';

const GameBoardPage = () => {

  const { room, playerId, eliminateCharacter, restoreCharacter, socket } = useSocket();
  const navigate = useNavigate();

  const [guessOpen, setGuessOpen] = useState(false);

  const currentPlayer = room?.players.find(p => p.id === playerId);

  const isMyTurn = room?.currentTurn === playerId;

  const isFinalGuess = room?.phase === "final-guess";

  useEffect(() => {

    if (!room) {
      navigate('/');
      return;
    }

    if (room.phase === 'game-over') {
      navigate('/gameover');
    }

  }, [room, navigate]);

  if (!room || !currentPlayer) return null;

  const eliminated = new Set(currentPlayer.eliminatedCharacters);

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

    socket?.emit("end-turn");

  };

  const canGuess =
    (room.phase === "playing" && isMyTurn) ||
    (room.phase === "final-guess" && isMyTurn);

  return (

    <div className="min-h-screen py-6" style={{ background: 'var(--gradient-surface)' }}>

      <div className="mx-auto max-w-5xl px-4">

        {/* HEADER */}
        <div className="mb-4 flex items-center justify-between">

          <div>

            <h2 className="font-heading text-2xl font-bold text-foreground">
              Game Board
            </h2>

            {room.phase === "final-guess" ? (

              <p className="text-sm text-amber-500 font-semibold">
                {isMyTurn
                  ? "Final Guess! You get one last chance."
                  : "Final Guess! Opponent gets one last chance."}
              </p>

            ) : (

              <p className="text-sm text-muted-foreground">
                {isMyTurn ? "Your Turn" : "Opponent's Turn"}
              </p>

            )}

          </div>

          <div className="flex gap-2">

            <Button
              onClick={() => setGuessOpen(true)}
              disabled={!canGuess}
              className="gradient-primary text-primary-foreground font-semibold"
            >
              <HelpCircle className="mr-2 h-4 w-4" />
              Guess Character
            </Button>

            {room.phase === "playing" && (

              <Button
                onClick={endTurn}
                disabled={!isMyTurn}
                variant="outline"
              >
                End Turn
              </Button>

            )}

          </div>

        </div>

        {/* CHARACTER GRID */}
        <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">

          {room.characters.map(c => {

            const isEliminated = eliminated.has(c.id);

            return (

              <button
                key={c.id}
                disabled={!isMyTurn || isFinalGuess}
                onClick={() => toggleEliminate(c.id)}
                className={`relative rounded-xl border overflow-hidden transition-all ${
                  isEliminated
                    ? 'border-eliminated opacity-40 grayscale'
                    : 'border-border hover:border-primary/40 hover:shadow-card'
                } ${!isMyTurn || isFinalGuess ? "cursor-not-allowed opacity-60" : ""}`}
              >

                <img
                  src={c.imageUrl}
                  alt={c.name}
                  className="aspect-square w-full object-cover"
                />

                <div className="p-1.5 text-center">
                  <p
                    className={`text-xs font-medium truncate ${
                      isEliminated
                        ? 'text-muted-foreground line-through'
                        : 'text-foreground'
                    }`}
                  >
                    {c.name}
                  </p>
                </div>

                {isEliminated && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="h-0.5 w-3/4 rotate-45 bg-destructive/60 rounded" />
                  </div>
                )}

              </button>

            );

          })}

        </div>

        <GuessDialog
          open={guessOpen}
          onOpenChange={setGuessOpen}
        />

      </div>

    </div>

  );

};

export default GameBoardPage;