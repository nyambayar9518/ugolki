import React, { useState } from 'react';
import { ChatMessage, Player } from '../types/game';
import { MessageSquare, Send, X, Smile } from 'lucide-react';

interface ChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  messages: ChatMessage[];
  onSendMessage: (text: string, isEmoji?: boolean) => void;
  myPlayerNum?: Player;
}

const QUICK_EMOJIS = ['🎉', '🔥', '👏', '😱', '🏆', '🤔', '🚀', '❤️'];
const QUICK_PHRASES = [
  'Good luck, have fun!',
  'Nice jump chain!',
  'Oops! Bad move.',
  'Well played!',
  'Rematch?'
];

export const ChatModal: React.FC<ChatModalProps> = ({
  isOpen,
  onClose,
  messages,
  onSendMessage,
  myPlayerNum
}) => {
  const [input, setInput] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    onSendMessage(input.trim(), false);
    setInput('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col h-[520px]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800 bg-slate-800/50">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-emerald-400" />
            <h3 className="font-bold text-white text-base">In-Game Chat & Reactions</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Reactions Bar */}
        <div className="px-4 py-2 border-b border-slate-800 flex items-center gap-2 overflow-x-auto bg-slate-800/30">
          <Smile className="w-4 h-4 text-amber-400 flex-shrink-0" />
          {QUICK_EMOJIS.map(emoji => (
            <button
              key={emoji}
              onClick={() => onSendMessage(emoji, true)}
              className="text-xl p-1.5 hover:scale-125 transition-transform active:scale-95"
            >
              {emoji}
            </button>
          ))}
        </div>

        {/* Messages List */}
        <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-2.5">
          {messages.length === 0 ? (
            <div className="my-auto text-center text-slate-500 text-xs">
              Send a quick reaction or message to your opponent!
            </div>
          ) : (
            messages.map(msg => {
              const isMine = myPlayerNum && msg.playerNum === myPlayerNum;
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col max-w-[80%] ${
                    isMine ? 'ml-auto items-end' : 'mr-auto items-start'
                  }`}
                >
                  <span className="text-[10px] text-slate-400 font-semibold mb-0.5 px-1">
                    {msg.sender}
                  </span>
                  <div
                    className={`rounded-2xl px-3 py-2 text-sm ${
                      msg.isEmoji
                        ? 'text-3xl bg-transparent !p-1'
                        : isMine
                        ? 'bg-emerald-600 text-white rounded-tr-none'
                        : 'bg-slate-800 text-slate-100 border border-slate-700 rounded-tl-none'
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Quick Phrases */}
        <div className="px-4 py-2 border-t border-slate-800 flex items-center gap-1.5 overflow-x-auto bg-slate-800/20">
          {QUICK_PHRASES.map(phrase => (
            <button
              key={phrase}
              onClick={() => onSendMessage(phrase, false)}
              className="text-[11px] whitespace-nowrap px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-full border border-slate-700 transition"
            >
              {phrase}
            </button>
          ))}
        </div>

        {/* Input Footer */}
        <form onSubmit={handleSubmit} className="p-3 border-t border-slate-800 bg-slate-900 flex gap-2">
          <input
            type="text"
            value={input}
            maxLength={100}
            onChange={e => setInput(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 px-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-emerald-500"
          />
          <button
            type="submit"
            className="p-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl transition"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
