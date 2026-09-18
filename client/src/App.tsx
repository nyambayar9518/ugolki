import React, { useState, useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import {
  AIDifficulty,
  Board as BoardType,
  ChatMessage,
  CornerMode,
  GameMode,
  Move,
  Player,
  Position,
  PublicRoomSummary,
  RoomState,
  TurnTimer,
  Winner
} from './types/game';
import {
  applyMove,
  countPiecesInGoal,
  createInitialBoard,
  evaluateGameEnd,
  getLegalMovesForPiece
} from './logic/ugolkiEngine';
import { getAIMove } from './logic/aiPlayer';
import { soundEngine } from './logic/sound';
import { Board } from './components/Board';
import { GameHeader } from './components/GameHeader';
import { GameControls } from './components/GameControls';
import { LobbyModal } from './components/LobbyModal';
import { ChatModal } from './components/ChatModal';
import { GameOverModal } from './components/GameOverModal';
import { RuleGuideModal } from './components/RuleGuideModal';
import { MessageSquare } from 'lucide-react';

interface MoveHistoryEntry {
  board: BoardType;
  currentTurn: Player;
  roundNumber: number;
  moveCount: number;
  lastMove?: Move;
}

interface FloatingEmoji {
  id: string;
  emoji: string;
}

export const App: React.FC = () => {
  // Game Setup & Mode
  const [gameMode, setGameMode] = useState<GameMode>('ai');
  const [cornerMode, setCornerMode] = useState<CornerMode>('3x4');
  const [aiDifficulty, setAiDifficulty] = useState<AIDifficulty>('medium');
  const [theme, setTheme] = useState<'wood' | 'slate'>('wood');
  const [isSoundEnabled, setIsSoundEnabled] = useState(soundEngine.isEnabled());
  const [flipped, setFlipped] = useState(false);

  // Board & State
  const [board, setBoard] = useState<BoardType>(() => createInitialBoard('3x4'));
  const [currentTurn, setCurrentTurn] = useState<Player>(1);
  const [roundNumber, setRoundNumber] = useState(1);
  const [moveCount, setMoveCount] = useState(0);
  const [p1FinishedAtRound, setP1FinishedAtRound] = useState<number | undefined>(undefined);
  const [lastMove, setLastMove] = useState<Move | undefined>(undefined);
  const [history, setHistory] = useState<MoveHistoryEntry[]>([]);

  // Selection & Interactions
  const [selectedPos, setSelectedPos] = useState<Position | null>(null);
  const [legalMoves, setLegalMoves] = useState<Move[]>([]);

  // Win / Game Over
  const [winner, setWinner] = useState<Winner>(null);
  const [winReason, setWinReason] = useState<string | undefined>(undefined);
  const [isGameOverModalOpen, setIsGameOverModalOpen] = useState(false);

  // Turn Timer
  const [turnTimerSetting, setTurnTimerSetting] = useState<TurnTimer>(0);
  const [timeRemaining, setTimeRemaining] = useState<number | undefined>(undefined);

  // Modals
  const [isLobbyOpen, setIsLobbyOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isRulesOpen, setIsRulesOpen] = useState(false);

  // Online Multiplayer State
  const [socket, setSocket] = useState<Socket | null>(null);
  const [playerName, setPlayerName] = useState(() => localStorage.getItem('ugolki_player_name') || 'Player');
  const [activeRoomId, setActiveRoomId] = useState<string | undefined>(undefined);
  const [myPlayerNum, setMyPlayerNum] = useState<Player | undefined>(undefined);
  const [onlineRoomState, setOnlineRoomState] = useState<RoomState | null>(null);
  const [publicRooms, setPublicRooms] = useState<PublicRoomSummary[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [floatingEmojis, setFloatingEmojis] = useState<FloatingEmoji[]>([]);
  const [unreadChatCount, setUnreadChatCount] = useState(0);

  // Keep player name saved
  useEffect(() => {
    localStorage.setItem('ugolki_player_name', playerName);
  }, [playerName]);

  // Connect socket on mount
  useEffect(() => {
    const s = io({
      autoConnect: true,
      reconnectionAttempts: 5
    });

    s.on('connect', () => {
      // Check query param for room
      const params = new URLSearchParams(window.location.search);
      const roomParam = params.get('room');
      if (roomParam) {
        s.emit('joinRoom', { roomId: roomParam.toUpperCase(), name: playerName });
      }
      s.emit('getPublicRooms');
    });

    s.on('roomUpdated', (room: RoomState) => {
      setOnlineRoomState(room);
      setActiveRoomId(room.roomId);
      setBoard(room.board);
      setCornerMode(room.cornerMode);
      setCurrentTurn(room.currentTurn);
      setRoundNumber(room.roundNumber);
      setMoveCount(room.moveCount);
      setP1FinishedAtRound(room.p1FinishedAtRound);
      setLastMove(room.lastMove);
      setTimeRemaining(room.timeRemaining);
      setGameMode('online');

      // Check which player we are
      if (room.player1?.id === s.id) {
        setMyPlayerNum(1);
        setFlipped(false);
      } else if (room.player2?.id === s.id) {
        setMyPlayerNum(2);
        setFlipped(true); // Auto flip for player 2
      } else {
        setMyPlayerNum(undefined); // Spectator
      }

      if (room.status === 'ended' && room.winner) {
        setWinner(room.winner);
        setWinReason(room.winReason);
        setIsGameOverModalOpen(true);
        if (room.winner === myPlayerNum) {
          soundEngine.playVictory();
        } else if (room.winner === 'draw') {
          soundEngine.playTurnAlert();
        } else {
          soundEngine.playDefeat();
        }
      }
    });

    s.on('timerTick', (timeLeft: number) => {
      setTimeRemaining(timeLeft);
      if (timeLeft <= 5 && timeLeft > 0) {
        soundEngine.playTurnAlert();
      }
    });

    s.on('publicRoomsList', (rooms: PublicRoomSummary[]) => {
      setPublicRooms(rooms);
    });

    s.on('chatMessage', (msg: ChatMessage) => {
      setChatMessages(prev => [...prev, msg]);
      if (msg.isEmoji) {
        const id = `${Date.now()}-${Math.random()}`;
        setFloatingEmojis(prev => [...prev, { id, emoji: msg.text }]);
        setTimeout(() => {
          setFloatingEmojis(prev => prev.filter(e => e.id !== id));
        }, 2200);
      }
      if (!isChatOpen) {
        setUnreadChatCount(prev => prev + 1);
      }
    });

    s.on('error', (err: { message: string }) => {
      alert(err.message || 'An error occurred');
    });

    setSocket(s);

    return () => {
      s.disconnect();
    };
  }, []);

  // Reset/Start Local/AI match
  const startNewGame = useCallback(
    (mode: CornerMode = cornerMode) => {
      const initial = createInitialBoard(mode);
      setBoard(initial);
      setCurrentTurn(1);
      setRoundNumber(1);
      setMoveCount(0);
      setP1FinishedAtRound(undefined);
      setLastMove(undefined);
      setWinner(null);
      setWinReason(undefined);
      setIsGameOverModalOpen(false);
      setSelectedPos(null);
      setLegalMoves([]);
      setHistory([]);
      setTimeRemaining(turnTimerSetting > 0 ? turnTimerSetting : undefined);
      soundEngine.playSelect();
    },
    [cornerMode, turnTimerSetting]
  );

  // Turn timer countdown for offline/AI mode
  useEffect(() => {
    if (gameMode === 'online' || winner || turnTimerSetting === 0) return;

    const interval = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev === undefined) return turnTimerSetting;
        if (prev <= 1) {
          // Time expired! Switch turn or forfeit
          soundEngine.playTurnAlert();
          const nextPlayer: Player = currentTurn === 1 ? 2 : 1;
          setCurrentTurn(nextPlayer);
          return turnTimerSetting;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [gameMode, currentTurn, winner, turnTimerSetting]);

  // Execute Move
  const handleMakeMove = useCallback(
    (move: Move) => {
      if (winner) return;

      // Online mode: emit to server
      if (gameMode === 'online') {
        if (socket && activeRoomId && myPlayerNum === currentTurn) {
          socket.emit('makeMove', { roomId: activeRoomId, move });
          setSelectedPos(null);
          setLegalMoves([]);
          if (move.isJump) {
            soundEngine.playJump(move.path.length - 2);
          } else {
            soundEngine.playStep();
          }
        }
        return;
      }

      // Local / AI mode
      setHistory(prev => [
        ...prev,
        {
          board,
          currentTurn,
          roundNumber,
          moveCount,
          lastMove
        }
      ]);

      const newBoard = applyMove(board, move);
      setBoard(newBoard);
      setLastMove(move);
      setSelectedPos(null);
      setLegalMoves([]);

      if (move.isJump) {
        soundEngine.playJump(move.path.length - 2);
      } else {
        soundEngine.playStep();
      }

      const nextMoveCount = moveCount + 1;
      setMoveCount(nextMoveCount);

      // Check win condition
      const evaluation = evaluateGameEnd(
        newBoard,
        cornerMode,
        roundNumber,
        currentTurn,
        p1FinishedAtRound
      );

      if (evaluation.p1FinishedAtRound !== undefined) {
        setP1FinishedAtRound(evaluation.p1FinishedAtRound);
      }

      if (evaluation.winner) {
        setWinner(evaluation.winner);
        setWinReason(evaluation.reason);
        setIsGameOverModalOpen(true);
        if (evaluation.winner === 1 || evaluation.winner === 'draw') {
          soundEngine.playVictory();
        } else {
          soundEngine.playDefeat();
        }
        return;
      }

      // Next turn
      const nextTurn: Player = currentTurn === 1 ? 2 : 1;
      setCurrentTurn(nextTurn);
      if (nextTurn === 1) {
        setRoundNumber(prev => prev + 1);
      }
      setTimeRemaining(turnTimerSetting > 0 ? turnTimerSetting : undefined);
    },
    [
      board,
      currentTurn,
      roundNumber,
      moveCount,
      p1FinishedAtRound,
      cornerMode,
      gameMode,
      socket,
      activeRoomId,
      myPlayerNum,
      winner,
      turnTimerSetting,
      lastMove
    ]
  );

  // AI Turn trigger
  useEffect(() => {
    if (gameMode !== 'ai' || currentTurn !== 2 || winner) return;

    const timer = setTimeout(() => {
      const aiMove = getAIMove(board, 2, aiDifficulty, cornerMode);
      if (aiMove) {
        handleMakeMove(aiMove);
      }
    }, 450);

    return () => clearTimeout(timer);
  }, [currentTurn, gameMode, board, aiDifficulty, cornerMode, winner, handleMakeMove]);

  // Piece Selection
  const handleSelectPiece = (pos: Position) => {
    if (winner) return;
    if (gameMode === 'online') {
      if (myPlayerNum !== currentTurn) return; // not my turn
      if (board[pos.r][pos.c] !== myPlayerNum) return; // not my piece
    } else if (gameMode === 'ai') {
      if (currentTurn !== 1) return; // AI is thinking
      if (board[pos.r][pos.c] !== 1) return;
    } else {
      if (board[pos.r][pos.c] !== currentTurn) return;
    }

    if (selectedPos?.r === pos.r && selectedPos?.c === pos.c) {
      setSelectedPos(null);
      setLegalMoves([]);
      return;
    }

    setSelectedPos(pos);
    const moves = getLegalMovesForPiece(board, pos);
    setLegalMoves(moves);
    soundEngine.playSelect();
  };

  // Undo Move (Local / AI only)
  const handleUndo = () => {
    if (history.length === 0 || gameMode === 'online' || winner) return;

    // If vs AI, undo both AI move and human move to return to human's turn
    const stepsToUndo = gameMode === 'ai' && history.length >= 2 ? 2 : 1;
    const targetState = history[history.length - stepsToUndo];
    if (!targetState) return;

    setBoard(targetState.board);
    setCurrentTurn(targetState.currentTurn);
    setRoundNumber(targetState.roundNumber);
    setMoveCount(targetState.moveCount);
    setLastMove(targetState.lastMove);
    setHistory(prev => prev.slice(0, prev.length - stepsToUndo));
    setSelectedPos(null);
    setLegalMoves([]);
    soundEngine.playSelect();
  };

  // Resign
  const handleResign = () => {
    if (winner) return;
    if (gameMode === 'online' && socket && activeRoomId) {
      socket.emit('surrender', { roomId: activeRoomId });
      return;
    }
    const resigningPlayer = currentTurn;
    const winningPlayer: Player = resigningPlayer === 1 ? 2 : 1;
    setWinner(winningPlayer);
    setWinReason(`Player ${resigningPlayer} resigned the match.`);
    setIsGameOverModalOpen(true);
    soundEngine.playDefeat();
  };

  // Online actions
  const handleCreateOnlineRoom = (name: string, mode: CornerMode, timer: TurnTimer) => {
    if (!socket) return;
    socket.emit('createRoom', { name, cornerMode: mode, turnTimer: timer }, (res: { roomId: string }) => {
      setActiveRoomId(res.roomId);
      setIsLobbyOpen(false);
      window.history.replaceState(null, '', `?room=${res.roomId}`);
    });
  };

  const handleJoinOnlineRoom = (roomId: string, name: string) => {
    if (!socket) return;
    socket.emit('joinRoom', { roomId, name }, (res: { success: boolean; message?: string }) => {
      if (res.success) {
        setActiveRoomId(roomId);
        setIsLobbyOpen(false);
        window.history.replaceState(null, '', `?room=${roomId}`);
      } else {
        alert(res.message || 'Could not join room');
      }
    });
  };

  const handleRefreshRooms = () => {
    if (socket) {
      socket.emit('getPublicRooms');
    }
  };

  const handleSendChat = (text: string, isEmoji = false) => {
    if (socket && activeRoomId) {
      socket.emit('sendChat', {
        roomId: activeRoomId,
        sender: playerName,
        text,
        isEmoji
      });
    }
  };

  const handleRematch = () => {
    if (gameMode === 'online' && socket && activeRoomId) {
      socket.emit('requestRematch', { roomId: activeRoomId });
      setIsGameOverModalOpen(false);
      return;
    }
    startNewGame(cornerMode);
  };

  // Compute pieces in goal
  const p1InGoal = countPiecesInGoal(board, 1, cornerMode);
  const p2InGoal = countPiecesInGoal(board, 2, cornerMode);

  // Player Names
  const p1Name = gameMode === 'online' ? onlineRoomState?.player1?.name || 'Player 1' : 'Player 1 (White)';
  const p2Name =
    gameMode === 'online'
      ? onlineRoomState?.player2?.name || 'Waiting for P2...'
      : gameMode === 'ai'
      ? `Computer (${aiDifficulty})`
      : 'Player 2 (Red)';

  const isInteractive =
    !winner &&
    (gameMode !== 'online'
      ? gameMode === 'pass_and_play' || currentTurn === 1
      : myPlayerNum !== undefined && myPlayerNum === currentTurn);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-between p-3 sm:p-6 relative">
      {/* Floating emojis layer */}
      <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center overflow-hidden">
        {floatingEmojis.map(item => (
          <div key={item.id} className="text-6xl animate-float-reaction select-none">
            {item.emoji}
          </div>
        ))}
      </div>

      {/* Top App Bar */}
      <header className="w-full max-w-[min(90vw,560px)] flex items-center justify-between py-2 border-b border-slate-800/80 mb-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-rose-600 to-amber-400 flex items-center justify-center shadow-lg shadow-rose-900/30 font-extrabold text-white text-base">
            У
          </div>
          <div>
            <h1 className="font-extrabold text-base sm:text-lg tracking-tight text-white flex items-center gap-1.5">
              Ugolki <span className="text-xs font-normal text-rose-400 bg-rose-950/60 px-1.5 py-0.5 rounded border border-rose-800/50">Corners</span>
            </h1>
          </div>
        </div>

        {/* Right header actions */}
        <div className="flex items-center gap-2">
          {gameMode === 'online' && (
            <button
              onClick={() => {
                setIsChatOpen(true);
                setUnreadChatCount(0);
              }}
              className="relative p-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 hover:text-white transition"
              title="Open Chat"
            >
              <MessageSquare className="w-4 h-4" />
              {unreadChatCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center shadow">
                  {unreadChatCount}
                </span>
              )}
            </button>
          )}

          <button
            onClick={() => setIsRulesOpen(true)}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-semibold transition"
          >
            How to Play
          </button>
        </div>
      </header>

      {/* Main Game Container */}
      <main className="w-full flex-1 flex flex-col items-center justify-center gap-3 my-auto">
        <GameHeader
          currentTurn={currentTurn}
          cornerMode={cornerMode}
          p1Name={p1Name}
          p2Name={p2Name}
          p1InGoal={p1InGoal}
          p2InGoal={p2InGoal}
          p1Connected={onlineRoomState?.player1?.connected}
          p2Connected={onlineRoomState?.player2?.connected}
          roundNumber={roundNumber}
          moveCount={moveCount}
          timeRemaining={timeRemaining}
          p1FinishedAtRound={p1FinishedAtRound}
          isOnline={gameMode === 'online'}
          myPlayerNum={myPlayerNum}
        />

        <Board
          board={board}
          cornerMode={cornerMode}
          currentTurn={currentTurn}
          selectedPos={selectedPos}
          legalMoves={legalMoves}
          lastMove={lastMove}
          flipped={flipped}
          onSelectPiece={handleSelectPiece}
          onMakeMove={handleMakeMove}
          theme={theme}
          interactive={isInteractive}
        />

        <GameControls
          gameMode={gameMode}
          cornerMode={cornerMode}
          aiDifficulty={aiDifficulty}
          isSoundEnabled={isSoundEnabled}
          theme={theme}
          canUndo={history.length > 0}
          flipped={flipped}
          onToggleSound={() => setIsSoundEnabled(soundEngine.toggle())}
          onToggleTheme={() => setTheme(prev => (prev === 'wood' ? 'slate' : 'wood'))}
          onToggleFlip={() => setFlipped(prev => !prev)}
          onUndo={handleUndo}
          onRestart={() => startNewGame(cornerMode)}
          onResign={handleResign}
          onOpenRules={() => setIsRulesOpen(true)}
          onOpenLobby={() => setIsLobbyOpen(true)}
          onChangeGameMode={mode => {
            setGameMode(mode);
            if (mode !== 'online') {
              startNewGame(cornerMode);
            } else {
              setIsLobbyOpen(true);
            }
          }}
          onChangeCornerMode={mode => {
            setCornerMode(mode);
            startNewGame(mode);
          }}
          onChangeAIDifficulty={diff => setAiDifficulty(diff)}
        />
      </main>

      {/* Modals */}
      <LobbyModal
        isOpen={isLobbyOpen}
        onClose={() => setIsLobbyOpen(false)}
        onCreateRoom={handleCreateOnlineRoom}
        onJoinRoom={handleJoinOnlineRoom}
        publicRooms={publicRooms}
        onRefreshRooms={handleRefreshRooms}
        playerName={playerName}
        setPlayerName={setPlayerName}
        activeRoomId={activeRoomId}
      />

      <ChatModal
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        messages={chatMessages}
        onSendMessage={handleSendChat}
        myPlayerNum={myPlayerNum}
      />

      <GameOverModal
        isOpen={isGameOverModalOpen}
        winner={winner}
        winReason={winReason}
        p1Name={p1Name}
        p2Name={p2Name}
        moveCount={moveCount}
        roundNumber={roundNumber}
        onRematch={handleRematch}
        onClose={() => setIsGameOverModalOpen(false)}
        myPlayerNum={myPlayerNum}
      />

      <RuleGuideModal isOpen={isRulesOpen} onClose={() => setIsRulesOpen(false)} />
    </div>
  );
};

export default App;
