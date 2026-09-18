import React from 'react';
import { X, BookOpen, ArrowRight, CornerRightDown, ShieldCheck, Zap } from 'lucide-react';

interface RuleGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RuleGuideModal: React.FC<RuleGuideModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-800/50">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-amber-400" />
            <h2 className="text-lg font-bold text-white">How to Play Ugolki (Corners)</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 flex flex-col gap-6 text-slate-300 text-sm leading-relaxed">
          {/* Section 1: Objective */}
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center flex-shrink-0 font-bold border border-amber-500/30">
              1
            </div>
            <div>
              <h3 className="font-bold text-white text-base mb-1">The Goal</h3>
              <p>
                Be the first player to move all your pieces from your starting home corner into the
                opponent&apos;s starting corner at the opposite end of the board.
              </p>
            </div>
          </div>

          {/* Section 2: Moving & Stepping */}
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0 font-bold border border-emerald-500/30">
              2
            </div>
            <div>
              <h3 className="font-bold text-white text-base mb-1">Orthogonal Movement</h3>
              <p>
                Pieces can only move <strong>orthogonally</strong> (Up, Down, Left, Right). Diagonal moves
                are strictly prohibited in classical Ugolki.
              </p>
              <div className="mt-2 p-3 bg-slate-800/60 rounded-xl border border-slate-700/50 flex items-center gap-2 text-xs">
                <ArrowRight className="w-4 h-4 text-emerald-400" />
                <span><strong>Single Step:</strong> Move 1 square into any adjacent empty space.</span>
              </div>
            </div>
          </div>

          {/* Section 3: Jumping & Multi-jumps */}
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center flex-shrink-0 font-bold border border-cyan-500/30">
              3
            </div>
            <div>
              <h3 className="font-bold text-white text-base mb-1">Jumping & Multi-Jumps</h3>
              <p>
                A piece can jump over an adjacent piece (friendly or opponent) if the square directly
                beyond it is empty. No pieces are captured or removed from the board!
              </p>
              <div className="mt-2 p-3 bg-slate-800/60 rounded-xl border border-slate-700/50 flex items-center gap-2 text-xs">
                <Zap className="w-4 h-4 text-cyan-400" />
                <span>
                  <strong>Multi-jump chain:</strong> You can chain multiple jumps in a single turn to fly
                  across the entire board in one move! You can stop at any intermediate landing square.
                </span>
              </div>
            </div>
          </div>

          {/* Section 4: Equal Turns Rule */}
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center flex-shrink-0 font-bold border border-purple-500/30">
              4
            </div>
            <div>
              <h3 className="font-bold text-white text-base mb-1">Equal Turns & Draws</h3>
              <p>
                Player 1 (White) moves first. If Player 1 fills their target corner, Player 2 (Red) is
                granted one final turn to match. If Player 2 also completes their goal on that turn, the
                match ends in an honorable <strong>Draw</strong>.
              </p>
            </div>
          </div>

          {/* Section 5: Anti-Camping */}
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center flex-shrink-0 font-bold border border-rose-500/30">
              5
            </div>
            <div>
              <h3 className="font-bold text-white text-base mb-1">Anti-Camping Rule</h3>
              <p>
                You must vacate your starting home corner within the move limit (20 moves for 3x3, 25 for
                3x4, 30 for 4x4). Leaving a piece behind to block the opponent from winning will result in a
                loss!
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-800/40 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold rounded-xl transition"
          >
            Got it, Let&apos;s Play!
          </button>
        </div>
      </div>
    </div>
  );
};
