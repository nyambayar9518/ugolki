export type Player = 1 | 2;

export type CornerMode = '3x3' | '3x4' | '4x4';

export type Board = number[][]; // 8x8: 0 = empty, 1 = Player 1, 2 = Player 2

export interface Position {
  r: number;
  c: number;
}

export interface Move {
  from: Position;
  to: Position;
  path: Position[]; // [from, ...intermediate_hops, to]
  isJump: boolean;
}

export type GameStatus = 'waiting' | 'playing' | 'ended';

export type Winner = 1 | 2 | 'draw' | null;

export type GameMode = 'ai' | 'pass_and_play' | 'online';

export type AIDifficulty = 'easy' | 'medium' | 'hard';

export type TurnTimer = 0 | 30 | 60 | 90;

export interface PlayerInfo {
  id: string;
  name: string;
  playerNum: Player;
  connected: boolean;
}

export interface RoomState {
  roomId: string;
  cornerMode: CornerMode;
  turnTimer: TurnTimer;
  player1: PlayerInfo | null;
  player2: PlayerInfo | null;
  spectatorCount: number;
  board: Board;
  currentTurn: Player;
  moveCount: number; // total half-moves played
  roundNumber: number; // each round both players get a move (P1 moves, then P2 moves)
  status: GameStatus;
  winner: Winner;
  winReason?: string;
  p1FinishedAtRound?: number; // for equal turns rule
  p2FinishedAtRound?: number;
  timeRemaining?: number;
  lastMove?: Move;
}

export interface ChatMessage {
  id: string;
  sender: string;
  playerNum?: Player;
  text: string;
  isEmoji?: boolean;
  timestamp: number;
}

export interface PublicRoomSummary {
  roomId: string;
  cornerMode: CornerMode;
  turnTimer: TurnTimer;
  playerCount: number;
  status: GameStatus;
  hostName: string;
}
