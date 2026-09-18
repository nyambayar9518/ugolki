import React, { useState } from 'react';
import { CornerMode, PublicRoomSummary, TurnTimer } from '../types/game';
import { X, Plus, LogIn, Users, RefreshCw, Copy, Check, Clock } from 'lucide-react';

interface LobbyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateRoom: (name: string, mode: CornerMode, timer: TurnTimer) => void;
  onJoinRoom: (roomId: string, name: string) => void;
  publicRooms: PublicRoomSummary[];
  onRefreshRooms: () => void;
  playerName: string;
  setPlayerName: (name: string) => void;
  activeRoomId?: string;
}

export const LobbyModal: React.FC<LobbyModalProps> = ({
  isOpen,
  onClose,
  onCreateRoom,
  onJoinRoom,
  publicRooms,
  onRefreshRooms,
  playerName,
  setPlayerName,
  activeRoomId
}) => {
  const [tab, setTab] = useState<'browse' | 'create' | 'join'>('browse');
  const [cornerMode, setCornerMode] = useState<CornerMode>('3x4');
  const [turnTimer, setTurnTimer] = useState<TurnTimer>(60);
  const [joinCode, setJoinCode] = useState('');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopyLink = () => {
    if (!activeRoomId) return;
    const url = `${window.location.origin}?room=${activeRoomId}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-800/40">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-emerald-400" />
            <h2 className="text-lg font-bold text-white">Online Multiplayer Lobby</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content body */}
        <div className="p-6 overflow-y-auto flex-1 flex flex-col gap-5">
          {/* Player Name Input */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Your Player Name
            </label>
            <input
              type="text"
              value={playerName}
              maxLength={16}
              onChange={e => setPlayerName(e.target.value)}
              placeholder="Enter nickname..."
              className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-emerald-500 font-medium"
            />
          </div>

          {/* Active room share banner if currently in room */}
          {activeRoomId && (
            <div className="p-4 bg-emerald-950/40 border border-emerald-500/40 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3">
              <div>
                <span className="text-xs text-emerald-400 font-semibold uppercase">Current Room</span>
                <p className="text-xl font-mono font-bold tracking-widest text-white">{activeRoomId}</p>
              </div>
              <button
                onClick={handleCopyLink}
                className="w-full sm:w-auto px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition"
              >
                {copied ? <Check className="w-4 h-4 text-white" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'Link Copied!' : 'Copy Invite Link'}</span>
              </button>
            </div>
          )}

          {/* Tab Navigation */}
          <div className="flex bg-slate-800/80 p-1 rounded-xl border border-slate-700/60">
            <button
              onClick={() => setTab('browse')}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition ${
                tab === 'browse' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              Public Rooms
            </button>
            <button
              onClick={() => setTab('create')}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition ${
                tab === 'create' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              Create Room
            </button>
            <button
              onClick={() => setTab('join')}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition ${
                tab === 'join' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              Join by Code
            </button>
          </div>

          {/* Tab: Browse Public Rooms */}
          {tab === 'browse' && (
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400 font-semibold">Available Open Rooms</span>
                <button
                  onClick={onRefreshRooms}
                  className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-semibold"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Refresh</span>
                </button>
              </div>

              {publicRooms.length === 0 ? (
                <div className="py-8 text-center text-slate-500 text-sm border border-dashed border-slate-800 rounded-2xl">
                  No open public rooms right now. Create one and invite a friend!
                </div>
              ) : (
                <div className="flex flex-col gap-2 max-h-60 overflow-y-auto">
                  {publicRooms.map(room => (
                    <div
                      key={room.roomId}
                      className="p-3 bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 rounded-xl flex items-center justify-between transition"
                    >
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-slate-100">{room.hostName}&apos;s Room</span>
                        <div className="flex items-center gap-2 text-xs text-slate-400">
                          <span className="uppercase font-semibold text-emerald-400">{room.cornerMode}</span>
                          <span>•</span>
                          <span>{room.turnTimer ? `${room.turnTimer}s timer` : 'No timer'}</span>
                          <span>•</span>
                          <span>{room.playerCount}/2 Players</span>
                        </div>
                      </div>

                      <button
                        onClick={() => onJoinRoom(room.roomId, playerName || 'Player')}
                        className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition shadow"
                      >
                        {room.playerCount < 2 ? 'Join' : 'Spectate'}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tab: Create Room */}
          {tab === 'create' && (
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-slate-400">Corner Mode</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['3x3', '3x4', '4x4'] as CornerMode[]).map(mode => (
                    <button
                      key={mode}
                      onClick={() => setCornerMode(mode)}
                      className={`py-2 px-3 rounded-xl border text-xs font-bold transition flex flex-col items-center gap-0.5 ${
                        cornerMode === mode
                          ? 'bg-emerald-600/20 border-emerald-500 text-emerald-300'
                          : 'bg-slate-800/60 border-slate-700 text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      <span className="text-sm">{mode}</span>
                      <span className="text-[10px] opacity-70">
                        {mode === '3x3' ? '9 pieces' : mode === '3x4' ? '12 pieces' : '16 pieces'}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-slate-400 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Turn Timer</span>
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {([0, 30, 60, 90] as TurnTimer[]).map(sec => (
                    <button
                      key={sec}
                      onClick={() => setTurnTimer(sec)}
                      className={`py-2 px-2 rounded-xl border text-xs font-bold transition ${
                        turnTimer === sec
                          ? 'bg-emerald-600/20 border-emerald-500 text-emerald-300'
                          : 'bg-slate-800/60 border-slate-700 text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      {sec === 0 ? 'None' : `${sec}s`}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={() => onCreateRoom(playerName || 'Host', cornerMode, turnTimer)}
                className="mt-2 w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg transition flex items-center justify-center gap-2"
              >
                <Plus className="w-5 h-5" />
                <span>Create & Launch Room</span>
              </button>
            </div>
          )}

          {/* Tab: Join by Code */}
          {tab === 'join' && (
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-400">Enter 6-Character Room Code</label>
                <input
                  type="text"
                  maxLength={6}
                  value={joinCode}
                  onChange={e => setJoinCode(e.target.value.toUpperCase())}
                  placeholder="e.g. UG8K1A"
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-center text-xl font-mono tracking-widest text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <button
                disabled={joinCode.trim().length !== 6}
                onClick={() => onJoinRoom(joinCode.trim(), playerName || 'Player')}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl shadow-lg transition flex items-center justify-center gap-2"
              >
                <LogIn className="w-5 h-5" />
                <span>Join Room</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
