import React, { useState } from 'react';
import { Board as BoardType, CornerMode, Move, Player, Position } from '../types/game';
import { isInsideCorner } from '../logic/ugolkiEngine';
import { Piece } from './Piece';

interface BoardProps {
  board: BoardType;
  cornerMode: CornerMode;
  currentTurn: Player;
  selectedPos: Position | null;
  legalMoves: Move[];
  lastMove?: Move;
  flipped?: boolean;
  onSelectPiece: (pos: Position) => void;
  onMakeMove: (move: Move) => void;
  theme: 'wood' | 'slate';
  interactive: boolean;
}

export const Board: React.FC<BoardProps> = ({
  board,
  cornerMode,
  selectedPos,
  legalMoves,
  lastMove,
  flipped = false,
  onSelectPiece,
  onMakeMove,
  theme,
  interactive
}) => {
  const [hoveredMove, setHoveredMove] = useState<Move | null>(null);

  // Map of legal destination "r,c" -> Move
  const movesMap = new Map<string, Move>();
  for (const m of legalMoves) {
    movesMap.set(`${m.to.r},${m.to.c}`, m);
  }

  // Row and column orders depending on flipped board
  const rows = flipped ? [7, 6, 5, 4, 3, 2, 1, 0] : [0, 1, 2, 3, 4, 5, 6, 7];
  const cols = flipped ? [7, 6, 5, 4, 3, 2, 1, 0] : [0, 1, 2, 3, 4, 5, 6, 7];

  const colLabels = flipped ? ['H', 'G', 'F', 'E', 'D', 'C', 'B', 'A'] : ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
  const rowLabels = flipped ? ['1', '2', '3', '4', '5', '6', '7', '8'] : ['8', '7', '6', '5', '4', '3', '2', '1'];

  return (
    <div className={`relative select-none p-3 sm:p-5 rounded-2xl shadow-2xl board-border transition-colors duration-300 theme-${theme}`}>
      {/* Outer wood/slate frame */}
      <div className="relative aspect-square max-w-[min(90vw,560px)] mx-auto rounded-lg overflow-hidden border-2 border-black/40 shadow-inner">
        {/* The 8x8 Board Grid */}
        <div className="grid grid-cols-8 grid-rows-8 w-full h-full">
          {rows.map((r, rIdx) =>
            cols.map((c, cIdx) => {
              const piece = board[r][c];
              const isSelected = selectedPos?.r === r && selectedPos?.c === c;
              const moveKey = `${r},${c}`;
              const availableMove = movesMap.get(moveKey);
              const isDarkSquare = (r + c) % 2 === 1;

              // Corner highlighting
              const isP1Home = isInsideCorner(r, c, 1, cornerMode, false);
              const isP2Home = isInsideCorner(r, c, 2, cornerMode, false);

              // Last move highlight
              const isLastFrom = lastMove?.from.r === r && lastMove?.from.c === c;
              const isLastTo = lastMove?.to.r === r && lastMove?.to.c === c;

              // Intermediate jump path highlighting
              const isJumpPathPoint = hoveredMove?.path.some(p => p.r === r && p.c === c);

              return (
                <div
                  key={`${r}-${c}`}
                  onClick={() => {
                    if (!interactive) return;
                    if (availableMove) {
                      onMakeMove(availableMove);
                    } else if (piece !== 0) {
                      onSelectPiece({ r, c });
                    }
                  }}
                  onMouseEnter={() => {
                    if (availableMove) {
                      setHoveredMove(availableMove);
                    }
                  }}
                  onMouseLeave={() => {
                    setHoveredMove(null);
                  }}
                  className={`relative flex items-center justify-center cursor-pointer transition-colors duration-150 ${
                    isDarkSquare ? 'board-square-dark' : 'board-square-light'
                  } ${isLastFrom || isLastTo ? '!bg-amber-400/40' : ''}`}
                >
                  {/* Home corner subtle boundary styling */}
                  {isP1Home && (
                    <div className="absolute inset-0.5 border border-dashed border-white/50 pointer-events-none rounded" />
                  )}
                  {isP2Home && (
                    <div className="absolute inset-0.5 border border-dashed border-red-500/60 pointer-events-none rounded" />
                  )}

                  {/* Corner indicator badge for empty corner goals */}
                  {piece === 0 && !availableMove && (
                    <>
                      {isP1Home && (
                        <div className="text-[9px] font-mono text-white/40 pointer-events-none select-none">
                          P1
                        </div>
                      )}
                      {isP2Home && (
                        <div className="text-[9px] font-mono text-red-500/50 pointer-events-none select-none">
                          P2
                        </div>
                      )}
                    </>
                  )}

                  {/* Piece */}
                  {piece !== 0 && (
                    <Piece
                      player={piece as Player}
                      isSelected={isSelected}
                      isLastMoved={isLastTo}
                    />
                  )}

                  {/* Legal move destination marker */}
                  {availableMove && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                      {availableMove.isJump ? (
                        <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-full bg-emerald-500/80 border-2 border-white shadow-lg flex items-center justify-center text-[10px] sm:text-xs font-bold text-white animate-bounce-short">
                          {availableMove.path.length > 2 ? `${availableMove.path.length - 1}x` : '⤹'}
                        </div>
                      ) : (
                        <div className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-amber-400/90 shadow-md ring-2 ring-white/60" />
                      )}
                    </div>
                  )}

                  {/* Intermediate jump path ring indicator */}
                  {isJumpPathPoint && !availableMove && (
                    <div className="absolute inset-2 border-2 border-emerald-400 rounded-full animate-ping pointer-events-none opacity-70" />
                  )}

                  {/* Board Coordinate Notation (e.g. A8, H1) */}
                  {cIdx === 0 && (
                    <span className="absolute top-0.5 left-0.5 text-[9px] font-bold opacity-40 text-slate-800 pointer-events-none">
                      {rowLabels[rIdx]}
                    </span>
                  )}
                  {rIdx === 7 && (
                    <span className="absolute bottom-0.5 right-0.5 text-[9px] font-bold opacity-40 text-slate-800 pointer-events-none">
                      {colLabels[cIdx]}
                    </span>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
