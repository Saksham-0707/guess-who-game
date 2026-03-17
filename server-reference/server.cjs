// ============================================
// Guess Who - Backend Server (TURN + FINAL GUESS RULE)
// ============================================

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();
app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: '*', methods: ['GET', 'POST'] },
});

// In-memory room storage
const rooms = new Map();

function generateRoomCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 5; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

function broadcastRoom(roomCode) {

  const room = rooms.get(roomCode);

  if (!room) return;

  io.to(roomCode).emit('room-updated', {
    code: room.code,
    players: room.players.map(p => ({
      id: p.id,
      name: p.name,
      isHost: p.isHost,
      selectedCharacter: p.selectedCharacter ? '***' : undefined,
      eliminatedCharacters: p.eliminatedCharacters,
    })),
    characters: room.characters,
    phase: room.phase,
    currentTurn: room.currentTurn,
    winnerId: room.winnerId,
    correctCharacter: room.phase === 'game-over' ? room.correctCharacter : undefined,
  });

}

io.on('connection', (socket) => {

  let currentRoom = null;

  // ===============================
  // CREATE ROOM
  // ===============================
  socket.on('create-room', (playerName) => {

    const code = generateRoomCode();

    const room = {
      code,
      players: [
        {
          id: socket.id,
          name: playerName,
          isHost: true,
          selectedCharacter: null,
          eliminatedCharacters: []
        }
      ],
      characters: [],
      phase: 'lobby',
      currentTurn: null,
      winnerId: null,
      correctCharacter: null,
      potentialWinner: null
    };

    rooms.set(code, room);

    socket.join(code);
    currentRoom = code;

    broadcastRoom(code);

  });

  // ===============================
  // JOIN ROOM
  // ===============================
  socket.on('join-room', ({ roomCode, playerName }) => {

    const room = rooms.get(roomCode);

    if (!room) return socket.emit('error', 'Room not found');
    if (room.players.length >= 2) return socket.emit('error', 'Room is full');

    room.players.push({
      id: socket.id,
      name: playerName,
      isHost: false,
      selectedCharacter: null,
      eliminatedCharacters: []
    });

    socket.join(roomCode);
    currentRoom = roomCode;

    broadcastRoom(roomCode);

  });

  // ===============================
  // START BOARD SETUP
  // ===============================
  socket.on('start-setup', () => {

    const room = rooms.get(currentRoom);
    if (!room) return;

    const player = room.players.find(p => p.id === socket.id);

    if (!player?.isHost) return;

    room.phase = 'board-setup';

    broadcastRoom(currentRoom);

  });

  // ===============================
  // ADD CHARACTER
  // ===============================
  socket.on('add-character', ({ name, imageUrl }) => {

    const room = rooms.get(currentRoom);

    if (!room || room.phase !== 'board-setup') return;

    room.characters.push({
      id: uuidv4(),
      name,
      imageUrl
    });

    broadcastRoom(currentRoom);

  });

  // ===============================
  // REMOVE CHARACTER
  // ===============================
  socket.on('remove-character', (characterId) => {

    const room = rooms.get(currentRoom);

    if (!room || room.phase !== 'board-setup') return;

    room.characters = room.characters.filter(c => c.id !== characterId);

    broadcastRoom(currentRoom);

  });

  // ===============================
  // FINISH SETUP
  // ===============================
  socket.on('finish-setup', () => {

    const room = rooms.get(currentRoom);

    if (!room) return;

    room.phase = 'character-selection';

    broadcastRoom(currentRoom);

  });

  // ===============================
  // SELECT CHARACTER
  // ===============================
  socket.on('select-character', (characterId) => {

    const room = rooms.get(currentRoom);

    if (!room || room.phase !== 'character-selection') return;

    const player = room.players.find(p => p.id === socket.id);

    if (!player) return;

    player.selectedCharacter = characterId;

    if (room.players.every(p => p.selectedCharacter)) {

      room.phase = 'playing';

      // Host starts
      room.currentTurn = room.players.find(p => p.isHost).id;

    }

    broadcastRoom(currentRoom);

  });

  // ===============================
  // ELIMINATE CHARACTER
  // ===============================
  socket.on('eliminate-character', (characterId) => {

    const room = rooms.get(currentRoom);

    if (!room || room.phase !== 'playing') return;
    if (room.currentTurn !== socket.id) return;

    const player = room.players.find(p => p.id === socket.id);

    if (!player) return;

    if (!player.eliminatedCharacters.includes(characterId)) {
      player.eliminatedCharacters.push(characterId);
    }

    broadcastRoom(currentRoom);

  });

  // ===============================
  // RESTORE CHARACTER
  // ===============================
  socket.on('restore-character', (characterId) => {

    const room = rooms.get(currentRoom);

    if (!room || room.phase !== 'playing') return;
    if (room.currentTurn !== socket.id) return;

    const player = room.players.find(p => p.id === socket.id);

    if (!player) return;

    player.eliminatedCharacters =
      player.eliminatedCharacters.filter(id => id !== characterId);

    broadcastRoom(currentRoom);

  });

  // ===============================
  // GUESS CHARACTER
  // ===============================
  socket.on('guess-character', (characterId) => {

    const room = rooms.get(currentRoom);

    if (!room) return;

    const opponent = room.players.find(p => p.id !== socket.id);
    const currentPlayer = room.players.find(p => p.id === socket.id);

    if (!opponent || !currentPlayer) return;

    // ===============================
    // NORMAL PLAY
    // ===============================
    if (room.phase === 'playing') {

      if (room.currentTurn !== socket.id) return;

      if (characterId === opponent.selectedCharacter) {

        // Host guessed correctly → opponent gets final guess
        if (currentPlayer.isHost) {

          room.phase = 'final-guess';
          room.potentialWinner = socket.id;
          room.currentTurn = opponent.id;

        }

        // Opponent guessed correctly first → instant win
        else {

          room.winnerId = socket.id;
          room.correctCharacter = opponent.selectedCharacter;
          room.phase = 'game-over';

        }

      } 
      else {

        // Wrong guess → switch turn
        room.currentTurn = opponent.id;

      }

      broadcastRoom(currentRoom);

    }

    // ===============================
    // FINAL GUESS
    // ===============================
    else if (room.phase === 'final-guess') {

      if (room.currentTurn !== socket.id) return;

      if (characterId === opponent.selectedCharacter) {

        // Draw
        room.winnerId = null;
        room.correctCharacter = opponent.selectedCharacter;

      } 
      else {

        // Host wins
        room.winnerId = room.potentialWinner;
        room.correctCharacter = opponent.selectedCharacter;

      }

      room.phase = 'game-over';

      broadcastRoom(currentRoom);

    }

  });

  // ===============================
  // END TURN
  // ===============================
  socket.on('end-turn', () => {

    const room = rooms.get(currentRoom);

    if (!room || room.phase !== 'playing') return;
    if (room.currentTurn !== socket.id) return;

    const opponent = room.players.find(p => p.id !== socket.id);

    if (!opponent) return;

    room.currentTurn = opponent.id;

    broadcastRoom(currentRoom);

  });

  // ===============================
  // REMATCH
  // ===============================
  socket.on('rematch', () => {

    const room = rooms.get(currentRoom);

    if (!room) return;

    room.phase = 'character-selection';
    room.winnerId = null;
    room.correctCharacter = null;
    room.potentialWinner = null;

    room.players.forEach(p => {
      p.selectedCharacter = null;
      p.eliminatedCharacters = [];
    });

    room.currentTurn = room.players.find(p => p.isHost).id;

    broadcastRoom(currentRoom);

  });

  // ===============================
  // DISCONNECT
  // ===============================
  socket.on('disconnect', () => {

    const room = rooms.get(currentRoom);

    if (!room) return;

    room.players = room.players.filter(p => p.id !== socket.id);

    if (room.players.length === 0) {

      rooms.delete(currentRoom);

    } else {

      if (!room.players.some(p => p.isHost)) {
        room.players[0].isHost = true;
      }

      broadcastRoom(currentRoom);

    }

  });

});

const PORT = process.env.PORT || 3001;

server.listen(PORT, () =>
  console.log(`Server running on port ${PORT}`)
);