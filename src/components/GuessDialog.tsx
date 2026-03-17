import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { CharacterTile } from '@/components/CharacterTile';
import { useSocket } from '@/context/SocketContext';

interface GuessDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const GuessDialog = ({ open, onOpenChange }: GuessDialogProps) => {

  const { room, playerId, guessCharacter } = useSocket();

  if (!room) return null;

  const isMyTurn = room.currentTurn === playerId;

  const handleGuess = (characterId: string) => {

    if (!isMyTurn) return;

    guessCharacter(characterId);

    onOpenChange(false);

  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>

      <DialogContent className="max-h-[85vh] max-w-5xl overflow-y-auto rounded-[28px] border-border/60 bg-card/92 p-0 backdrop-blur-xl">

        <DialogHeader className="border-b border-border/60 px-6 py-5">
          <DialogTitle className="font-heading text-2xl">
            Guess Your Opponent's Character
          </DialogTitle>
        </DialogHeader>

        <div className="px-6 pb-6 pt-5">
          {!isMyTurn && (
            <p className="mb-4 text-center text-sm text-muted-foreground">
              You can only guess on your turn.
            </p>
          )}

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {room.characters.map((character) => (
              <CharacterTile
                key={character.id}
                id={character.id}
                name={character.name}
                imageUrl={character.imageUrl}
                onClick={handleGuess}
                disabled={!isMyTurn}
                badge={isMyTurn ? 'Guess' : undefined}
                footer={
                  <p className="text-xs text-muted-foreground">
                    {isMyTurn ? 'Tap to submit this guess' : 'Turn required'}
                  </p>
                }
              />
            ))}
          </div>
        </div>

      </DialogContent>

    </Dialog>
  );
};

export default GuessDialog;
