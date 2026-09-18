import {
  CornerMode,
  Move,
  Player,
  PublicRoomSummary,
  RoomState,
  TurnTimer
} from './types';
import {
  applyMove,
  createInitialBoard,
  evaluateGameEnd,
  getLegalMovesForPiece
} from './ugolkiEngine';

export class RoomManager {
  private rooms = new Map<string, RoomState>();
  private socketToRoom = new Map<string, { roomId: string; playerNum?: Player }>();

  // Generate random 6-character room code
  private generateRoomCode(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return this.rooms.has(code) ? this.generateRoomCode() : code;
  }

  public createRoom(
    hostSocketId: string,
    hostName: string,
    cornerMode: CornerMode,
    turnTimer: TurnTimer
  ): RoomState {
    const roomId = this.generateRoomCode();
    const room: RoomState = {
      roomId,
      cornerMode,
      turnTimer,
      player1: {
        id: hostSocketId,
        name: hostName || 'Player 1',
        playerNum: 1,
        connected: true
      },
      player2: null,
      spectatorCount: 0,
      board: createInitialBoard(cornerMode),
      currentTurn: 1,
      moveCount: 0,
      roundNumber: 1,
      status: 'waiting',
      winner: null,
      timeRemaining: turnTimer > 0 ? turnTimer : undefined
    };

    this.rooms.set(roomId, room);
    this.socketToRoom.set(hostSocketId, { roomId, playerNum: 1 });
    return room;
  }

  public joinRoom(
    roomId: string,
    socketId: string,
    playerName: string
  ): { success: boolean; room?: RoomState; message?: string; role?: 'player' | 'spectator'; playerNum?: Player } {
    const room = this.rooms.get(roomId);
    if (!room) {
      return { success: false, message: 'Room not found' };
    }

    // Check if player is reconnecting
    if (room.player1 && room.player1.id === socketId) {
      room.player1.connected = true;
      this.socketToRoom.set(socketId, { roomId, playerNum: 1 });
      return { success: true, room, role: 'player', playerNum: 1 };
    }
    if (room.player2 && room.player2.id === socketId) {
      room.player2.connected = true;
      this.socketToRoom.set(socketId, { roomId, playerNum: 2 });
      return { success: true, room, role: 'player', playerNum: 2 };
    }

    // Assign Player 1 if empty
    if (!room.player1) {
      room.player1 = {
        id: socketId,
        name: playerName || 'Player 1',
        playerNum: 1,
        connected: true
      };
      this.socketToRoom.set(socketId, { roomId, playerNum: 1 });
      return { success: true, room, role: 'player', playerNum: 1 };
    }

    // Assign Player 2 if empty
    if (!room.player2) {
      room.player2 = {
        id: socketId,
        name: playerName || 'Player 2',
        playerNum: 2,
        connected: true
      };
      room.status = 'playing'; // Game begins!
      this.socketToRoom.set(socketId, { roomId, playerNum: 2 });
      return { success: true, room, role: 'player', playerNum: 2 };
    }

    // Room is full, join as spectator
    room.spectatorCount++;
    this.socketToRoom.set(socketId, { roomId });
    return { success: true, room, role: 'spectator' };
  }

  public getRoom(roomId: string): RoomState | undefined {
    return this.rooms.get(roomId);
  }

  public getSocketContext(socketId: string) {
    return this.socketToRoom.get(socketId);
  }

  public makeMove(
    roomId: string,
    socketId: string,
    move: Move
  ): { success: boolean; room?: RoomState; message?: string } {
    const room = this.rooms.get(roomId);
    if (!room) return { success: false, message: 'Room not found' };
    if (room.status !== 'playing') return { success: false, message: 'Game not active' };

    const ctx = this.socketToRoom.get(socketId);
    if (!ctx || ctx.playerNum !== room.currentTurn) {
      return { success: false, message: 'Not your turn' };
    }

    // Authoritative move validation
    const piece = room.board[move.from.r]?.[move.from.c];
    if (piece !== ctx.playerNum) {
      return { success: false, message: 'Invalid piece selected' };
    }

    const legalMoves = getLegalMovesForPiece(room.board, move.from);
    const isLegal = legalMoves.some(
      m => m.to.r === move.to.r && m.to.c === move.to.c
    );

    if (!isLegal) {
      return { success: false, message: 'Illegal move attempted' };
    }

    // Apply move
    room.board = applyMove(room.board, move);
    room.lastMove = move;
    room.moveCount++;

    // Evaluate Win Condition
    const evalResult = evaluateGameEnd(
      room.board,
      room.cornerMode,
      room.roundNumber,
      room.currentTurn,
      room.p1FinishedAtRound
    );

    if (evalResult.p1FinishedAtRound !== undefined) {
      room.p1FinishedAtRound = evalResult.p1FinishedAtRound;
    }

    if (evalResult.winner) {
      room.status = 'ended';
      room.winner = evalResult.winner;
      room.winReason = evalResult.reason;
      return { success: true, room };
    }

    // Advance turn
    const nextTurn: Player = room.currentTurn === 1 ? 2 : 1;
    room.currentTurn = nextTurn;
    if (nextTurn === 1) {
      room.roundNumber++;
    }
    room.timeRemaining = room.turnTimer > 0 ? room.turnTimer : undefined;

    return { success: true, room };
  }

  public surrender(roomId: string, socketId: string): RoomState | null {
    const room = this.rooms.get(roomId);
    if (!room || room.status !== 'playing') return null;

    const ctx = this.socketToRoom.get(socketId);
    if (!ctx || !ctx.playerNum) return null;

    const winner: Player = ctx.playerNum === 1 ? 2 : 1;
    room.status = 'ended';
    room.winner = winner;
    const resigningName = ctx.playerNum === 1 ? room.player1?.name : room.player2?.name;
    room.winReason = `${resigningName || 'Opponent'} surrendered the game.`;
    return room;
  }

  public resetMatch(roomId: string): RoomState | null {
    const room = this.rooms.get(roomId);
    if (!room) return null;

    room.board = createInitialBoard(room.cornerMode);
    room.currentTurn = 1;
    room.moveCount = 0;
    room.roundNumber = 1;
    room.status = room.player1 && room.player2 ? 'playing' : 'waiting';
    room.winner = null;
    room.winReason = undefined;
    room.p1FinishedAtRound = undefined;
    room.lastMove = undefined;
    room.timeRemaining = room.turnTimer > 0 ? room.turnTimer : undefined;

    return room;
  }

  public handleDisconnect(socketId: string): { roomId?: string; room?: RoomState } {
    const ctx = this.socketToRoom.get(socketId);
    if (!ctx) return {};

    const room = this.rooms.get(ctx.roomId);
    this.socketToRoom.delete(socketId);

    if (!room) return {};

    if (room.player1?.id === socketId) {
      room.player1.connected = false;
    } else if (room.player2?.id === socketId) {
      room.player2.connected = false;
    } else {
      room.spectatorCount = Math.max(0, room.spectatorCount - 1);
    }

    // If both players left, schedule cleanup after 5 minutes
    if (!room.player1?.connected && !room.player2?.connected && room.spectatorCount === 0) {
      setTimeout(() => {
        const checkRoom = this.rooms.get(ctx.roomId);
        if (checkRoom && !checkRoom.player1?.connected && !checkRoom.player2?.connected) {
          this.rooms.delete(ctx.roomId);
        }
      }, 5 * 60 * 1000);
    }

    return { roomId: ctx.roomId, room };
  }

  public getPublicRooms(): PublicRoomSummary[] {
    const list: PublicRoomSummary[] = [];
    for (const room of this.rooms.values()) {
      if (room.status !== 'ended') {
        const count = (room.player1 ? 1 : 0) + (room.player2 ? 1 : 0);
        list.push({
          roomId: room.roomId,
          cornerMode: room.cornerMode,
          turnTimer: room.turnTimer,
          playerCount: count,
          status: room.status,
          hostName: room.player1?.name || 'Host'
        });
      }
    }
    return list;
  }

  public tickTimers(): { expiredRooms: RoomState[]; updatedRooms: { roomId: string; timeLeft: number }[] } {
    const expiredRooms: RoomState[] = [];
    const updatedRooms: { roomId: string; timeLeft: number }[] = [];

    for (const room of this.rooms.values()) {
      if (room.status === 'playing' && room.turnTimer > 0 && room.timeRemaining !== undefined) {
        room.timeRemaining -= 1;
        updatedRooms.push({ roomId: room.roomId, timeLeft: room.timeRemaining });

        if (room.timeRemaining <= 0) {
          // Switch turn automatically on timer expiration
          const nextTurn: Player = room.currentTurn === 1 ? 2 : 1;
          room.currentTurn = nextTurn;
          if (nextTurn === 1) {
            room.roundNumber++;
          }
          room.timeRemaining = room.turnTimer;
          expiredRooms.push(room);
        }
      }
    }

    return { expiredRooms, updatedRooms };
  }
}
