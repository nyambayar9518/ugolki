import React from 'react';
import { CornerMode, Player } from '../types/game';
import { getPieceCount } from '../logic/ugolkiEngine';
import { Clock, ShieldAlert } from 'lucide-react';

interface GameHeaderProps {
  currentTurn: Player;
  cornerMode: CornerMode;
  p1Name: string;
  p2Name: string;
  p1InGoal: number;
  p2InGoal: number;
  p1Connected?: boolean;
  p2Connected?: boolean;
  roundNumber: number;
  moveCount: number;
  timeRemaining?: number;
  p1FinishedAtRound?: number;
  isOnline?: boolean;
  myPlayerNum?: Player;
}

export const GameHeader: React.FC<GameHeaderProps> = ({
  currentTurn,
  cornerMode,
  p1Name,
  p2Name,
  p1InGoal,
  p2InGoal,
  p1Connected = true,
  p2Connected = true,
  roundNumber,
  moveCount,
  timeRemaining,
  p1FinishedAtRound,
  isOnline,
  myPlayerNum
}) => {
  const totalPieces = getPieceCount(cornerMode);
  const p1Progress = Math.round((p1InGoal / totalPieces) * 100);
  const p2Progress = Math.round((p2InGoal / totalPieces) * 100);

  return (
    <div className="w-full max-w-[min(90vw,560px)] mx-auto flex flex-col gap-2 select-none">
      {/* Equal turns alert banner */}
      {p1FinishedAtRound !== undefined && (
        <div className="bg-amber-500/20 border border-amber-500/50 rounded-xl px-3 py-2 flex items-center gap-2 text-amber-300 text-xs sm:text-sm font-semibold animate-pulse">
          <ShieldAlert className="w-4 h-4 flex-shrink-0" />
          <span>Equal Turns Rule: Player 1 has filled their corner! Player 2 has this final turn to match for a Draw!</span>
        </div>
      )}

      {/* Players status card */}
      <div className="grid grid-cols-2 gap-3">
        {/* Player 1 (White) */}
        <div
          className={`relative p-3 rounded-2xl border transition-all duration-300 ${
            currentTurn === 1
              ? 'bg-slate-800/90 border-amber-400/80 shadow-lg shadow-amber-500/10 ring-2 ring-amber-400/40'
              : 'bg-slate-800/40 border-slate-700/60 opacity-80'
          }`}
        >
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-4 h-4 rounded-full piece-p1 border border-slate-300 shadow-sm flex-shrink-0" />
              <span className="font-bold text-sm sm:text-base truncate text-slate-100">
                {p1Name} {isOnline && myPlayerNum === 1 && '(You)'}
              </span>
            </div>
            {isOnline && (
              <span
                className={`w-2 h-2 rounded-full ${
                  p1Connected ? 'bg-emerald-400' : 'bg-rose-500 animate-ping'
                }`}
                title={p1Connected ? 'Connected' : 'Disconnected'}
              />
            )}
          </div>

          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Goal:</span>
            <span className="font-semibold text-slate-200">
              {p1InGoal}/{totalPieces} ({p1Progress}%)
            </span>
          </div>

          {/* Goal progress bar */}
          <div className="w-full bg-slate-700 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-slate-200 h-full transition-all duration-500"
              style={{ width: `${p1Progress}%` }}
            />
          </div>

          {currentTurn === 1 && (
            <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 text-[10px] font-bold uppercase tracking-wider bg-amber-400 text-slate-900 px-2 py-0.5 rounded-full shadow">
              Turn
            </span>
          )}
        </div>

        {/* Player 2 (Red) */}
        <div
          className={`relative p-3 rounded-2xl border transition-all duration-300 ${
            currentTurn === 2
              ? 'bg-slate-800/90 border-red-500/80 shadow-lg shadow-red-500/10 ring-2 ring-red-500/40'
              : 'bg-slate-800/40 border-slate-700/60 opacity-80'
          }`}
        >
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-4 h-4 rounded-full piece-p2 border border-red-400 shadow-sm flex-shrink-0" />
              <span className="font-bold text-sm sm:text-base truncate text-slate-100">
                {p2Name} {isOnline && myPlayerNum === 2 && '(You)'}
              </span>
            </div>
            {isOnline && (
              <span
                className={`w-2 h-2 rounded-full ${
                  p2Connected ? 'bg-emerald-400' : 'bg-rose-500 animate-ping'
                }`}
                title={p2Connected ? 'Connected' : 'Disconnected'}
              />
            )}
          </div>

          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Goal:</span>
            <span className="font-semibold text-slate-200">
              {p2InGoal}/{totalPieces} ({p2Progress}%)
            </span>
          </div>

          {/* Goal progress bar */}
          <div className="w-full bg-slate-700 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-red-500 h-full transition-all duration-500"
              style={{ width: `${p2Progress}%` }}
            />
          </div>

          {currentTurn === 2 && (
            <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 text-[10px] font-bold uppercase tracking-wider bg-red-500 text-white px-2 py-0.5 rounded-full shadow">
              Turn
            </span>
          )}
        </div>
      </div>

      {/* Turn info & Timer bar */}
      <div className="flex items-center justify-between px-2 pt-1 text-xs text-slate-400">
        <div className="flex items-center gap-3">
          <span>
            Mode: <strong className="text-slate-200 uppercase">{cornerMode}</strong>
          </span>
          <span>
            Round: <strong className="text-slate-200">{roundNumber}</strong>
          </span>
          <span>
            Moves: <strong className="text-slate-200">{moveCount}</strong>
          </span>
        </div>

        {timeRemaining !== undefined && timeRemaining > 0 && (
          <div
            className={`flex items-center gap-1 font-mono font-bold px-2 py-0.5 rounded-md ${
              timeRemaining <= 10
                ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40 animate-pulse'
                : 'text-slate-300'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>{timeRemaining}s</span>
          </div>
        )}
      </div>
    </div>
  );
};
