export interface Character {
  id: string;
  name: string;
  imageUrl: string;
}

export interface Player {
  id: string;
  name: string;
  isHost: boolean;
  selectedCharacter?: string; // character id
  eliminatedCharacters: string[]; // character ids
}

export interface Room {
  code: string;
  players: Player[];
  characters: Character[];
  phase: GamePhase;
  winnerId?: string;
  correctCharacter?: string;
}

export type GamePhase =
  | 'lobby'
  | 'board-setup'
  | 'character-selection'
  | 'playing'
  | 'game-over';

// Socket events
export interface ServerToClientEvents {
  'room-updated': (room: Room) => void;
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
  'rematch': () => void;
}
