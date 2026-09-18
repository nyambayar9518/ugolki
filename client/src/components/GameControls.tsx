import React from 'react';
import { AIDifficulty, CornerMode, GameMode } from '../types/game';
import {
  RotateCcw,
  Volume2,
  VolumeX,
  Palette,
  HelpCircle,
  Flag,
  Globe,
  Bot,
  Users,
  Repeat
} from 'lucide-react';

interface GameControlsProps {
  gameMode: GameMode;
  cornerMode: CornerMode;
  aiDifficulty: AIDifficulty;
  isSoundEnabled: boolean;
  theme: 'wood' | 'slate';
  canUndo: boolean;
  flipped: boolean;
  onToggleSound: () => void;
  onToggleTheme: () => void;
  onToggleFlip: () => void;
  onUndo: () => void;
  onRestart: () => void;
  onResign: () => void;
  onOpenRules: () => void;
  onOpenLobby: () => void;
  onChangeGameMode: (mode: GameMode) => void;
  onChangeCornerMode: (mode: CornerMode) => void;
  onChangeAIDifficulty: (diff: AIDifficulty) => void;
}

export const GameControls: React.FC<GameControlsProps> = ({
  gameMode,
  cornerMode,
  aiDifficulty,
  isSoundEnabled,
  theme,
  canUndo,
  flipped,
  onToggleSound,
  onToggleTheme,
  onToggleFlip,
  onUndo,
  onRestart,
  onResign,
  onOpenRules,
  onOpenLobby,
  onChangeGameMode,
  onChangeCornerMode,
  onChangeAIDifficulty
}) => {
  return (
    <div className="w-full max-w-[min(90vw,560px)] mx-auto flex flex-col gap-2.5 select-none">
      {/* Top mode tabs */}
      <div className="flex items-center justify-between gap-1 p-1 bg-slate-800/80 rounded-xl border border-slate-700/60">
        <button
          onClick={() => onChangeGameMode('ai')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-semibold transition-all ${
            gameMode === 'ai'
              ? 'bg-rose-600 text-white shadow-md'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
          }`}
        >
          <Bot className="w-3.5 h-3.5" />
          <span>Vs AI</span>
        </button>

        <button
          onClick={() => onChangeGameMode('pass_and_play')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-semibold transition-all ${
            gameMode === 'pass_and_play'
              ? 'bg-rose-600 text-white shadow-md'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Pass & Play</span>
        </button>

        <button
          onClick={onOpenLobby}
          className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-semibold transition-all ${
            gameMode === 'online'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'text-slate-400 hover:text-emerald-300 hover:bg-slate-700/50'
          }`}
        >
          <Globe className="w-3.5 h-3.5" />
          <span>Online</span>
        </button>
      </div>

      {/* Sub-selectors (Corner Mode & AI Difficulty) */}
      {gameMode !== 'online' && (
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
          {/* Corner Mode selector */}
          <div className="flex items-center gap-1 bg-slate-800/60 p-1 rounded-lg border border-slate-700/40">
            <span className="text-slate-400 px-1 font-medium">Corners:</span>
            {(['3x3', '3x4', '4x4'] as CornerMode[]).map(mode => (
              <button
                key={mode}
                onClick={() => onChangeCornerMode(mode)}
                className={`px-2 py-0.5 rounded font-bold transition-all ${
                  cornerMode === mode
                    ? 'bg-amber-500 text-slate-900 shadow'
                    : 'text-slate-300 hover:bg-slate-700/60'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>

          {/* AI Difficulty selector */}
          {gameMode === 'ai' && (
            <div className="flex items-center gap-1 bg-slate-800/60 p-1 rounded-lg border border-slate-700/40">
              <span className="text-slate-400 px-1 font-medium">AI:</span>
              {(['easy', 'medium', 'hard'] as AIDifficulty[]).map(diff => (
                <button
                  key={diff}
                  onClick={() => onChangeAIDifficulty(diff)}
                  className={`px-2 py-0.5 rounded font-bold capitalize transition-all ${
                    aiDifficulty === diff
                      ? diff === 'hard'
                        ? 'bg-rose-500 text-white shadow'
                        : diff === 'medium'
                        ? 'bg-amber-500 text-slate-900 shadow'
                        : 'bg-emerald-500 text-white shadow'
                      : 'text-slate-300 hover:bg-slate-700/60'
                  }`}
                >
                  {diff}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Bottom utility icon bar */}
      <div className="flex items-center justify-between gap-1.5 pt-1">
        <div className="flex items-center gap-1.5">
          {gameMode !== 'online' && (
            <button
              onClick={onUndo}
              disabled={!canUndo}
              title="Undo Move"
              className="p-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={onRestart}
            title="Restart Match"
            className="p-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-700 transition-all text-xs font-semibold flex items-center gap-1"
          >
            <Repeat className="w-4 h-4" />
            <span className="hidden sm:inline">New</span>
          </button>

          <button
            onClick={onResign}
            title="Surrender / Resign"
            className="p-2 rounded-xl bg-slate-800 border border-slate-700 text-rose-400 hover:text-rose-200 hover:bg-rose-950/40 transition-all"
          >
            <Flag className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={onToggleFlip}
            title={flipped ? 'Flip: Player 1 View' : 'Flip: Player 2 View'}
            className="p-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-700 transition-all text-xs font-semibold"
          >
            <span>{flipped ? 'P2 View' : 'P1 View'}</span>
          </button>

          <button
            onClick={onToggleTheme}
            title={`Current theme: ${theme}. Click to toggle wood/slate`}
            className="p-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-700 transition-all"
          >
            <Palette className="w-4 h-4" />
          </button>

          <button
            onClick={onToggleSound}
            title={isSoundEnabled ? 'Mute Audio' : 'Unmute Audio'}
            className="p-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-700 transition-all"
          >
            {isSoundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
          </button>

          <button
            onClick={onOpenRules}
            title="How to Play Ugolki"
            className="p-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-700 transition-all"
          >
            <HelpCircle className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
