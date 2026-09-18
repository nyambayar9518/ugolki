import React, { useEffect } from 'react';
import { Player, Winner } from '../types/game';
import confetti from 'canvas-confetti';
import { Trophy, RefreshCw, X, Scale } from 'lucide-react';

interface GameOverModalProps {
  isOpen: boolean;
  winner: Winner;
  winReason?: string;
  p1Name: string;
  p2Name: string;
  moveCount: number;
  roundNumber: number;
  onRematch: () => void;
  onClose: () => void;
  myPlayerNum?: Player;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  isOpen,
  winner,
  winReason,
  p1Name,
  p2Name,
  moveCount,
  roundNumber,
  onRematch,
  onClose,
  myPlayerNum
}) => {
  useEffect(() => {
    if (isOpen && (winner === 1 || winner === 2)) {
      // Fire confetti cannons!
      confetti({
        particleCount: 90,
        spread: 70,
        origin: { y: 0.6 }
      });
      setTimeout(() => {
        confetti({
          particleCount: 50,
          angle: 60,
          spread: 55,
          origin: { x: 0 }
        });
        confetti({
          particleCount: 50,
          angle: 120,
          spread: 55,
          origin: { x: 1 }
        });
      }, 250);
    }
  }, [isOpen, winner]);

  if (!isOpen || !winner) return null;

  const isDraw = winner === 'draw';
  const winnerName = winner === 1 ? p1Name : p2Name;
  const isMeWinner = myPlayerNum && winner === myPlayerNum;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl overflow-hidden p-6 text-center flex flex-col items-center">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white rounded-full transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Icon */}
        <div className="w-20 h-20 rounded-full flex items-center justify-center mb-4 shadow-xl">
          {isDraw ? (
            <div className="w-full h-full bg-slate-800 border-2 border-slate-600 rounded-full flex items-center justify-center">
              <Scale className="w-10 h-10 text-amber-400" />
            </div>
          ) : (
            <div
              className={`w-full h-full rounded-full flex items-center justify-center border-2 ${
                winner === 1
                  ? 'bg-amber-400/20 border-amber-400'
                  : 'bg-red-500/20 border-red-500'
              }`}
            >
              <Trophy
                className={`w-10 h-10 ${
                  winner === 1 ? 'text-amber-400' : 'text-red-400'
                }`}
              />
            </div>
          )}
        </div>

        {/* Title */}
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-1">
          {isDraw
            ? 'It’s a Draw!'
            : isMeWinner
            ? 'Victory!'
            : `${winnerName} Wins!`}
        </h2>

        {/* Subtitle / Reason */}
        <p className="text-sm text-slate-300 mb-6 max-w-xs leading-relaxed">
          {winReason || 'All pieces moved into the opposing goal corner!'}
        </p>

        {/* Match Statistics Card */}
        <div className="w-full bg-slate-800/80 border border-slate-700/60 rounded-2xl p-4 mb-6 grid grid-cols-2 gap-3 text-left">
          <div>
            <span className="text-xs text-slate-400 block font-medium">Rounds Played</span>
            <span className="text-lg font-bold text-slate-100">{roundNumber}</span>
          </div>
          <div>
            <span className="text-xs text-slate-400 block font-medium">Total Moves</span>
            <span className="text-lg font-bold text-slate-100">{moveCount}</span>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row w-full gap-3">
          <button
            onClick={onRematch}
            className="flex-1 py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg transition flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Play Again</span>
          </button>
          <button
            onClick={onClose}
            className="py-3 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl transition"
          >
            View Board
          </button>
        </div>
      </div>
    </div>
  );
};
