import React from 'react';
import { Player } from '../types/game';

interface PieceProps {
  player: Player;
  isSelected?: boolean;
  isLastMoved?: boolean;
}

export const Piece: React.FC<PieceProps> = ({ player, isSelected, isLastMoved }) => {
  const isP1 = player === 1;

  return (
    <div
      className={`relative w-full h-full flex items-center justify-center transition-all duration-200 ${
        isSelected ? 'scale-105' : 'hover:scale-105'
      }`}
    >
      {/* Outer piece body */}
      <div
        className={`w-[84%] h-[84%] rounded-full piece-shadow transition-transform duration-200 flex items-center justify-center ${
          isP1 ? 'piece-p1' : 'piece-p2'
        } ${isSelected ? 'ring-4 ring-amber-400 ring-offset-2 ring-offset-slate-900 animate-pulse' : ''}`}
      >
        {/* Inner tactile rings */}
        <div
          className={`w-[68%] h-[68%] rounded-full border flex items-center justify-center ${
            isP1
              ? 'border-slate-300/80 bg-gradient-to-br from-white/60 to-slate-200/40'
              : 'border-red-400/80 bg-gradient-to-br from-red-500/60 to-red-800/40'
          }`}
        >
          <div
            className={`w-[45%] h-[45%] rounded-full shadow-inner ${
              isP1 ? 'bg-slate-300/50' : 'bg-red-900/60'
            }`}
          />
        </div>

        {/* Last moved subtle badge */}
        {isLastMoved && !isSelected && (
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-amber-400 rounded-full border-2 border-slate-900 shadow" />
        )}
      </div>
    </div>
  );
};
