import { AIDifficulty, Board, CornerMode, Move, Player } from '../types/game';
import {
  applyMove,
  calculateManhattanDistanceToGoal,
  getAllLegalMoves,
  getCornerPositions,
  isInsideCorner
} from './ugolkiEngine';

export function getAIMove(
  board: Board,
  aiPlayer: Player,
  difficulty: AIDifficulty,
  mode: CornerMode
): Move | null {
  const legalMoves = getAllLegalMoves(board, aiPlayer);
  if (legalMoves.length === 0) return null;

  if (difficulty === 'easy') {
    return getEasyMove(board, legalMoves, aiPlayer, mode);
  } else if (difficulty === 'medium') {
    return getMediumMove(board, legalMoves, aiPlayer, mode);
  } else {
    return getHardMove(board, legalMoves, aiPlayer, mode);
  }
}

function evaluateMoveScore(
  board: Board,
  move: Move,
  player: Player,
  mode: CornerMode
): number {
  const oldDist = calculateManhattanDistanceToGoal(move.from, player, mode);
  const newDist = calculateManhattanDistanceToGoal(move.to, player, mode);
  const distGain = oldDist - newDist;

  const wasInTarget = isInsideCorner(move.from.r, move.from.c, player, mode, true);
  const isNowInTarget = isInsideCorner(move.to.r, move.to.c, player, mode, true);
  const wasInHome = isInsideCorner(move.from.r, move.from.c, player, mode, false);

  let score = distGain * 10;

  // Jump bonus
  if (move.isJump) {
    score += (move.path.length - 1) * 6;
  }

  // Encourage moving into target corner
  if (!wasInTarget && isNowInTarget) {
    score += 40;
  }

  // Penalize moving OUT of target corner
  if (wasInTarget && !isNowInTarget) {
    score -= 100;
  }

  // Encourage leaving home corner
  if (wasInHome) {
    score += 15;
  }

  return score;
}

function getEasyMove(
  board: Board,
  legalMoves: Move[],
  player: Player,
  mode: CornerMode
): Move {
  // Greedy with random variance
  let bestScore = -Infinity;
  let candidates: Move[] = [];

  for (const move of legalMoves) {
    const baseScore = evaluateMoveScore(board, move, player, mode);
    const score = baseScore + (Math.random() * 8 - 4);

    if (score > bestScore) {
      bestScore = score;
      candidates = [move];
    } else if (Math.abs(score - bestScore) < 0.5) {
      candidates.push(move);
    }
  }

  return candidates[Math.floor(Math.random() * candidates.length)] || legalMoves[0];
}

function evaluateBoardState(board: Board, player: Player, mode: CornerMode): number {
  const opponent: Player = player === 1 ? 2 : 1;

  let playerDist = 0;
  let opponentDist = 0;
  let playerInTarget = 0;
  let opponentInTarget = 0;
  let playerInHome = 0;

  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const p = board[r][c];
      if (p === player) {
        playerDist += calculateManhattanDistanceToGoal({ r, c }, player, mode);
        if (isInsideCorner(r, c, player, mode, true)) playerInTarget++;
        if (isInsideCorner(r, c, player, mode, false)) playerInHome++;
      } else if (p === opponent) {
        opponentDist += calculateManhattanDistanceToGoal({ r, c }, opponent, mode);
        if (isInsideCorner(r, c, opponent, mode, true)) opponentInTarget++;
      }
    }
  }

  // We want to minimize our distance and maximize opponent distance
  return (
    (opponentDist - playerDist) * 3 +
    (playerInTarget * 35) -
    (opponentInTarget * 35) -
    (playerInHome * 10)
  );
}

function getMediumMove(
  board: Board,
  legalMoves: Move[],
  player: Player,
  mode: CornerMode
): Move {
  // Sort moves by simple heuristic to prioritize promising moves
  const scoredMoves = legalMoves.map(m => ({
    move: m,
    score: evaluateMoveScore(board, m, player, mode)
  }));
  scoredMoves.sort((a, b) => b.score - a.score);

  // Consider top 15 moves to depth 2
  const topMoves = scoredMoves.slice(0, 15);
  let bestMove = topMoves[0]?.move || legalMoves[0];
  let bestValue = -Infinity;

  const opponent: Player = player === 1 ? 2 : 1;

  for (const { move } of topMoves) {
    const nextBoard = applyMove(board, move);
    // Opponent reply
    const oppMoves = getAllLegalMoves(nextBoard, opponent);
    let minOpponentScore = Infinity;

    // Sample top opponent moves
    const sortedOppMoves = oppMoves
      .map(om => ({ move: om, score: evaluateMoveScore(nextBoard, om, opponent, mode) }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 8);

    if (sortedOppMoves.length === 0) {
      minOpponentScore = evaluateBoardState(nextBoard, player, mode);
    } else {
      for (const opp of sortedOppMoves) {
        const boardAfterOpp = applyMove(nextBoard, opp.move);
        const evalScore = evaluateBoardState(boardAfterOpp, player, mode);
        if (evalScore < minOpponentScore) {
          minOpponentScore = evalScore;
        }
      }
    }

    if (minOpponentScore > bestValue) {
      bestValue = minOpponentScore;
      bestMove = move;
    }
  }

  return bestMove;
}

function getHardMove(
  board: Board,
  legalMoves: Move[],
  player: Player,
  mode: CornerMode
): Move {
  const opponent: Player = player === 1 ? 2 : 1;

  // Order moves with high precision
  const scoredMoves = legalMoves.map(m => {
    let s = evaluateMoveScore(board, m, player, mode);
    // Extra boost for deep corner fills
    const isTarget = isInsideCorner(m.to.r, m.to.c, player, mode, true);
    if (isTarget) {
      // Corner-most square gets biggest reward
      const cornerTargetR = player === 1 ? 7 : 0;
      const cornerTargetC = player === 1 ? 7 : 0;
      const distFromCorner = Math.abs(m.to.r - cornerTargetR) + Math.abs(m.to.c - cornerTargetC);
      s += (14 - distFromCorner) * 8;
    }
    return { move: m, score: s };
  });

  scoredMoves.sort((a, b) => b.score - a.score);
  const candidates = scoredMoves.slice(0, 20);

  let bestMove = candidates[0]?.move || legalMoves[0];
  let alpha = -Infinity;
  const beta = Infinity;

  function minimax(
    currentBoard: Board,
    depth: number,
    isMaximizing: boolean,
    a: number,
    b: number
  ): number {
    if (depth === 0) {
      return evaluateBoardState(currentBoard, player, mode);
    }

    const currPlayer = isMaximizing ? player : opponent;
    const moves = getAllLegalMoves(currentBoard, currPlayer);
    if (moves.length === 0) {
      return evaluateBoardState(currentBoard, player, mode);
    }

    const sorted = moves
      .map(m => ({ move: m, score: evaluateMoveScore(currentBoard, m, currPlayer, mode) }))
      .sort((x, y) => y.score - x.score)
      .slice(0, 10);

    if (isMaximizing) {
      let maxEval = -Infinity;
      for (const item of sorted) {
        const nextB = applyMove(currentBoard, item.move);
        const evalScore = minimax(nextB, depth - 1, false, a, b);
        maxEval = Math.max(maxEval, evalScore);
        a = Math.max(a, evalScore);
        if (b <= a) break; // Beta cutoff
      }
      return maxEval;
    } else {
      let minEval = Infinity;
      for (const item of sorted) {
        const nextB = applyMove(currentBoard, item.move);
        const evalScore = minimax(nextB, depth - 1, true, a, b);
        minEval = Math.min(minEval, evalScore);
        b = Math.min(b, evalScore);
        if (b <= a) break; // Alpha cutoff
      }
      return minEval;
    }
  }

  for (const item of candidates) {
    const nextBoard = applyMove(board, item.move);
    const score = minimax(nextBoard, 2, false, alpha, beta);
    if (score > alpha) {
      alpha = score;
      bestMove = item.move;
    }
  }

  return bestMove;
}
