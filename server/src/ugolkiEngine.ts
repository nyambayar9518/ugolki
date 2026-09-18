import { Board, CornerMode, Move, Player, Position, Winner } from '../types/game';

export const BOARD_SIZE = 8;

export function createInitialBoard(mode: CornerMode): Board {
  const board: Board = Array(BOARD_SIZE).fill(0).map(() => Array(BOARD_SIZE).fill(0));

  const p1Positions = getCornerPositions(1, mode, false);
  const p2Positions = getCornerPositions(2, mode, false);

  for (const pos of p1Positions) {
    board[pos.r][pos.c] = 1;
  }
  for (const pos of p2Positions) {
    board[pos.r][pos.c] = 2;
  }

  return board;
}

export function isInsideCorner(
  r: number,
  c: number,
  player: Player,
  mode: CornerMode,
  isTarget: boolean
): boolean {
  if (r < 0 || r >= BOARD_SIZE || c < 0 || c >= BOARD_SIZE) return false;

  // Player 1 start: top-left (0,0). Player 1 target: bottom-right
  // Player 2 start: bottom-right. Player 2 target: top-left (0,0)
  const isTopLeft = (player === 1 && !isTarget) || (player === 2 && isTarget);

  if (mode === '3x3') {
    return isTopLeft ? (r < 3 && c < 3) : (r >= 5 && c >= 5);
  }
  if (mode === '3x4') {
    // 3 rows, 4 columns
    return isTopLeft ? (r < 3 && c < 4) : (r >= 5 && c >= 4);
  }
  if (mode === '4x4') {
    return isTopLeft ? (r < 4 && c < 4) : (r >= 4 && c >= 4);
  }
  return false;
}

export function getCornerPositions(player: Player, mode: CornerMode, isTarget: boolean): Position[] {
  const positions: Position[] = [];
  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      if (isInsideCorner(r, c, player, mode, isTarget)) {
        positions.push({ r, c });
      }
    }
  }
  return positions;
}

export function getPieceCount(mode: CornerMode): number {
  if (mode === '3x3') return 9;
  if (mode === '3x4') return 12;
  return 16;
}

const DIRECTIONS = [
  { dr: -1, dc: 0 }, // Up
  { dr: 1, dc: 0 },  // Down
  { dr: 0, dc: -1 }, // Left
  { dr: 0, dc: 1 }   // Right
];

export function getLegalMovesForPiece(board: Board, from: Position): Move[] {
  const moves: Move[] = [];
  const player = board[from.r]?.[from.c];
  if (!player || player === 0) return moves;

  // 1. Single-step orthogonal moves
  for (const { dr, dc } of DIRECTIONS) {
    const nr = from.r + dr;
    const nc = from.c + dc;
    if (nr >= 0 && nr < BOARD_SIZE && nc >= 0 && nc < BOARD_SIZE) {
      if (board[nr][nc] === 0) {
        moves.push({
          from,
          to: { r: nr, c: nc },
          path: [from, { r: nr, c: nc }],
          isJump: false
        });
      }
    }
  }

  // 2. Jump moves (single or multi-jump via BFS)
  interface JumpState {
    pos: Position;
    path: Position[];
  }

  const visitedKeys = new Set<string>();
  visitedKeys.add(`${from.r},${from.c}`);

  const queue: JumpState[] = [{ pos: from, path: [from] }];

  while (queue.length > 0) {
    const current = queue.shift()!;

    for (const { dr, dc } of DIRECTIONS) {
      const midR = current.pos.r + dr;
      const midC = current.pos.c + dc;
      const landR = current.pos.r + 2 * dr;
      const landC = current.pos.c + 2 * dc;

      // Check bounds for landing square
      if (landR >= 0 && landR < BOARD_SIZE && landC >= 0 && landC < BOARD_SIZE) {
        // Middle square must have ANY piece, and landing square must be EMPTY
        if (board[midR][midC] !== 0 && (board[landR][landC] === 0 || (landR === from.r && landC === from.c && false))) {
          const key = `${landR},${landC}`;
          if (!visitedKeys.has(key)) {
            visitedKeys.add(key);
            const nextLanding: Position = { r: landR, c: landC };
            const nextPath = [...current.path, nextLanding];

            moves.push({
              from,
              to: nextLanding,
              path: nextPath,
              isJump: true
            });

            queue.push({
              pos: nextLanding,
              path: nextPath
            });
          }
        }
      }
    }
  }

  return moves;
}

export function getAllLegalMoves(board: Board, player: Player): Move[] {
  const moves: Move[] = [];
  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      if (board[r][c] === player) {
        const pieceMoves = getLegalMovesForPiece(board, { r, c });
        moves.push(...pieceMoves);
      }
    }
  }
  return moves;
}

export function applyMove(board: Board, move: Move): Board {
  const newBoard = board.map(row => [...row]);
  const player = newBoard[move.from.r][move.from.c];
  newBoard[move.from.r][move.from.c] = 0;
  newBoard[move.to.r][move.to.c] = player;
  return newBoard;
}

export function hasPlayerCompletedGoal(board: Board, player: Player, mode: CornerMode): boolean {
  const targetPositions = getCornerPositions(player, mode, true);
  for (const pos of targetPositions) {
    if (board[pos.r][pos.c] !== player) {
      return false;
    }
  }
  return true;
}

export function countPiecesInGoal(board: Board, player: Player, mode: CornerMode): number {
  const targetPositions = getCornerPositions(player, mode, true);
  let count = 0;
  for (const pos of targetPositions) {
    if (board[pos.r][pos.c] === player) {
      count++;
    }
  }
  return count;
}

export function countPiecesInHome(board: Board, player: Player, mode: CornerMode): number {
  const homePositions = getCornerPositions(player, mode, false);
  let count = 0;
  for (const pos of homePositions) {
    if (board[pos.r][pos.c] === player) {
      count++;
    }
  }
  return count;
}

export interface WinEvaluation {
  winner: Winner;
  reason?: string;
  p1FinishedAtRound?: number;
  p2FinishedAtRound?: number;
}

export function evaluateGameEnd(
  board: Board,
  mode: CornerMode,
  roundNumber: number,
  justMovedPlayer: Player,
  p1FinishedAtRound?: number
): WinEvaluation {
  const p1Won = hasPlayerCompletedGoal(board, 1, mode);
  const p2Won = hasPlayerCompletedGoal(board, 2, mode);

  // If Player 1 just completed goal on this round
  if (justMovedPlayer === 1 && p1Won && p1FinishedAtRound === undefined) {
    // Player 2 still gets their move in this round (equal turns rule)
    return {
      winner: null,
      p1FinishedAtRound: roundNumber
    };
  }

  // If Player 2 just moved
  if (justMovedPlayer === 2) {
    // Check if P1 finished in this round or earlier
    if (p1FinishedAtRound !== undefined) {
      if (p2Won) {
        return {
          winner: 'draw',
          reason: 'Both players reached the opposing corner in the same number of turns!',
          p1FinishedAtRound,
          p2FinishedAtRound: roundNumber
        };
      } else {
        return {
          winner: 1,
          reason: 'Player 1 moved all pieces into the corner first!',
          p1FinishedAtRound
        };
      }
    } else if (p2Won) {
      // Player 2 finished without P1 finishing
      return {
        winner: 2,
        reason: 'Player 2 moved all pieces into the corner first!',
        p2FinishedAtRound: roundNumber
      };
    }
  }

  // Anti-camping check (e.g. at round 30, if pieces are still in home corner)
  const maxHomeMoves = mode === '3x3' ? 20 : mode === '3x4' ? 25 : 30;
  if (roundNumber > maxHomeMoves) {
    const p1InHome = countPiecesInHome(board, 1, mode);
    const p2InHome = countPiecesInHome(board, 2, mode);

    if (p1InHome > 0 && p2InHome === 0) {
      return {
        winner: 2,
        reason: `Player 1 failed to vacate home corner within ${maxHomeMoves} moves.`
      };
    } else if (p2InHome > 0 && p1InHome === 0) {
      return {
        winner: 1,
        reason: `Player 2 failed to vacate home corner within ${maxHomeMoves} moves.`
      };
    }
  }

  return { winner: null, p1FinishedAtRound };
}

export function calculateManhattanDistanceToGoal(
  pos: Position,
  player: Player,
  mode: CornerMode
): number {
  // Goal corner target center
  const targetR = player === 1 ? 7 : 0;
  const targetC = player === 1 ? 7 : 0;
  return Math.abs(pos.r - targetR) + Math.abs(pos.c - targetC);
}
