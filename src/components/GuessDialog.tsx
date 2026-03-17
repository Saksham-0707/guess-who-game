import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
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

      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">

        <DialogHeader>
          <DialogTitle className="font-heading text-xl">
            Guess Your Opponent's Character
          </DialogTitle>
        </DialogHeader>

        {!isMyTurn && (
          <p className="text-sm text-muted-foreground text-center mb-3">
            You can only guess on your turn.
          </p>
        )}

        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">

          {room.characters.map(c => (

            <button
              key={c.id}
              disabled={!isMyTurn}
              onClick={() => handleGuess(c.id)}
              className={`rounded-xl border overflow-hidden transition-all
                ${isMyTurn
                  ? 'border-border hover:border-primary hover:shadow-card'
                  : 'border-border opacity-50 cursor-not-allowed'
                }`}
            >

              <img
                src={c.imageUrl}
                alt={c.name}
                className="aspect-square w-full object-cover"
              />

              <div className="p-1.5 text-center">
                <p className="text-xs font-medium text-foreground truncate">
                  {c.name}
                </p>
              </div>

            </button>

          ))}

        </div>

      </DialogContent>

    </Dialog>
  );
};

export default GuessDialog;