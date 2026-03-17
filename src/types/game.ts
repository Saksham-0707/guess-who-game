export interface Character {
  id: string;
  name: string;
  imageUrl: string;
}

export interface Player {
  id: string;
  name: string;
  isHost: boolean;
  selectedCharacter?: string;
  eliminatedCharacters: string[]; // character ids
}

export interface RevealedCharacterData {
  name: string;
  imageUrl: string;
}

export interface RevealedSelection {
  playerId: string;
  playerName: string;
  character: RevealedCharacterData;
}

export interface Room {
  code: string;
  players: Player[];
  characters: Character[];
  phase: GamePhase;
  currentTurn?: string | null;
  winnerId?: string | null;
  correctCharacterData?: RevealedCharacterData;
  revealedSelections?: RevealedSelection[];
}

export type GamePhase =
  | 'lobby'
  | 'board-setup'
  | 'character-selection'
  | 'playing'
  | 'final-guess'
  | 'game-over';

// Socket events
export interface ServerToClientEvents {
  'room-updated': (room: Room) => void;
  'your-character': (characterId: string | null) => void;
  'error': (message: string) => void;
  'game-over': (data: { winnerId: string; characterName: string }) => void;
}

export interface ClientToServerEvents {
  'create-room': (playerName: string) => void;
  'join-room': (data: { roomCode: string; playerName: string }) => void;
  'start-setup': () => void;
  'add-character': (character: { name: string; imageUrl: string }) => void;
  'remove-character': (characterId: string) => void;
  'finish-setup': () => void;
  'select-character': (characterId: string) => void;
  'eliminate-character': (characterId: string) => void;
  'restore-character': (characterId: string) => void;
  'guess-character': (characterId: string) => void;
  'end-turn': () => void;
  'edit-board': () => void;
  'rematch': () => void;
}
