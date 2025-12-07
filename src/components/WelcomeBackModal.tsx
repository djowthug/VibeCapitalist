import React from 'react';
import { formatCurrency, formatTime } from '../utils/formatters';
import { Moon, Sparkles, Check } from 'lucide-react';

interface WelcomeBackModalProps {
  isOpen: boolean;
  earnings: number;
  offlineTimeSeconds: number;
  onCollect: () => void;
}

export const WelcomeBackModal: React.FC<WelcomeBackModalProps> = ({
  isOpen,
  earnings,
  offlineTimeSeconds,
  onCollect
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-300">
      <div className="w-full max-w-md bg-zinc-900 border-2 border-indigo-500/50 rounded-3xl shadow-[0_0_50px_rgba(99,102,241,0.25)] overflow-hidden relative">
        
        {/* Background Effects */}
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-indigo-900/40 to-transparent pointer-events-none" />
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="p-8 flex flex-col items-center text-center relative z-10">
          
          <div className="w-20 h-20 bg-indigo-950 rounded-full flex items-center justify-center border-4 border-indigo-500/30 shadow-xl mb-6 animate-bounce-slow">
            <Moon size={40} className="text-indigo-400 fill-indigo-400/20" />
          </div>

          <h2 className="text-3xl font-black text-white mb-2 tracking-tight">
            Welcome Back!
          </h2>
          <p className="text-zinc-400 font-medium mb-6">
            Your managers were grinding while you were away for <span className="text-indigo-300 font-bold">{formatTime(offlineTimeSeconds)}</span>.
          </p>

          <div className="w-full bg-zinc-950/50 border border-zinc-800 rounded-2xl p-6 mb-8 relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-indigo-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1">Offline Earnings</div>
            <div className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400 drop-shadow-sm">
              +{formatCurrency(earnings)}
            </div>
            <Sparkles className="absolute top-4 right-4 text-emerald-500/50 animate-pulse" size={20} />
          </div>

          <button
            onClick={onCollect}
            className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-lg rounded-xl shadow-lg shadow-indigo-900/40 transition-all active:scale-95 flex items-center justify-center gap-2"
          >
            <Check size={24} strokeWidth={3} />
            <span>Collect Cash</span>
          </button>

        </div>
      </div>
    </div>
  );
};