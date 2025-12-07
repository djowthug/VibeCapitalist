import React from 'react';
import { GameState } from '../types';
import { calculatePrestigePoints, formatCurrency, PRESTIGE_MULTIPLIER_PER_LEVEL, PRESTIGE_DIVISOR } from '../utils/formatters';
import { Crown, Rocket, Zap, X } from 'lucide-react';

interface PrestigeModalProps {
  isOpen: boolean;
  onClose: () => void;
  gameState: GameState;
  onPrestige: () => void;
  onBuyUpgrade: () => void;
}

export const PrestigeModal: React.FC<PrestigeModalProps> = ({
  isOpen,
  onClose,
  gameState,
  onPrestige,
  onBuyUpgrade
}) => {
  if (!isOpen) return null;

  const potentialPoints = calculatePrestigePoints(gameState.lifetimeEarnings);
  const currentGlobalMultiplier = 1 + (gameState.prestigeMultiplierLevel * PRESTIGE_MULTIPLIER_PER_LEVEL);
  const nextGlobalMultiplier = 1 + ((gameState.prestigeMultiplierLevel + 1) * PRESTIGE_MULTIPLIER_PER_LEVEL);
  const upgradeCost = 1; // 1 Token per upgrade

  // Correct Math for Sqrt Curve Progress
  // If Points = Sqrt(Earnings / Divisor), then Earnings = Points^2 * Divisor
  const nextPointTarget = Math.pow(potentialPoints + 1, 2) * PRESTIGE_DIVISOR;
  const currentPointBase = Math.pow(potentialPoints, 2) * PRESTIGE_DIVISOR;
  
  // Calculate progress within the current "level"
  // Safe calculation for progress bar percentage (0-100)
  const progressPercent = Math.min(100, Math.max(0, 
    ((gameState.lifetimeEarnings - currentPointBase) / (nextPointTarget - currentPointBase)) * 100
  ));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-md bg-[#18181b] border border-[#27272a] rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Header (Gradient Purple) */}
        <div className="relative p-6 bg-gradient-to-r from-[#581c87] to-[#3b0764] border-b border-[#581c87]">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-1 text-purple-200 hover:text-white rounded-full hover:bg-white/10 transition-colors"
          >
            <X size={20} />
          </button>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-black/20 rounded-2xl border border-white/10 shadow-inner">
              <Crown className="text-white" size={28} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white tracking-tight">Prestige</h2>
              <p className="text-xs text-purple-200 font-semibold tracking-widest uppercase">Ascend to Greatness</p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6 bg-[#0f0f11]">
          
          {/* Status Section */}
          <div className="space-y-3">
            {/* Current Run Earnings Card */}
            <div className="bg-[#18181b] rounded-xl border border-[#27272a] shadow-sm p-4">
               <div className="flex items-center justify-between mb-2">
                 <div className="flex items-center gap-2">
                   <Rocket className="text-zinc-500" size={16} />
                   <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Run Earnings</span>
                 </div>
                 <span className="text-lg font-bold text-white tabular-nums tracking-tight">
                   {formatCurrency(gameState.lifetimeEarnings)}
                 </span>
               </div>
               
               {/* Progress Bar to Next Point */}
               <div className="relative h-2 bg-zinc-800 rounded-full overflow-hidden">
                 <div 
                    className="absolute top-0 left-0 h-full bg-purple-600 transition-all duration-300 ease-out" 
                    style={{ width: `${progressPercent}%` }}
                 ></div>
               </div>
               <div className="text-[10px] text-zinc-500 mt-1 text-right">
                 Next point at {formatCurrency(nextPointTarget)}
               </div>
            </div>

            {/* Points to Claim Card */}
            <div className="flex items-center justify-between p-4 bg-[#2e1065]/20 rounded-xl border border-[#581c87]/50 shadow-inner">
              <div className="flex items-center gap-3">
                <Crown className="text-[#a855f7]" size={18} />
                <span className="text-sm font-medium text-[#d8b4fe]">Prestige Points to Claim</span>
              </div>
              <span className="text-2xl font-black text-white drop-shadow-sm">+{potentialPoints}</span>
            </div>

            {/* Reset Button (Neon Purple) */}
            <button
              onClick={() => {
                if (window.confirm("Are you sure? This will reset your businesses and cash to gain Prestige Points.")) {
                  onPrestige();
                  onClose();
                }
              }}
              disabled={potentialPoints === 0}
              className={`w-full py-3.5 rounded-xl font-bold text-sm uppercase tracking-wider transition-all shadow-lg flex flex-col items-center justify-center gap-1
                ${potentialPoints > 0 
                  ? 'bg-[#9333ea] hover:bg-[#7e22ce] text-white shadow-[#9333ea]/25 active:translate-y-0.5' 
                  : 'bg-[#27272a] text-zinc-500 cursor-not-allowed border border-[#3f3f46]'}`}
            >
              <span>{potentialPoints > 0 ? 'Reset & Claim Points' : 'Cannot Prestige Yet'}</span>
              {potentialPoints === 0 && (
                <span className="text-[10px] normal-case opacity-60">Earn {formatCurrency(nextPointTarget)} to earn next point</span>
              )}
            </button>
          </div>

          <div className="h-px bg-[#27272a] w-full" />

          {/* Upgrade Section */}
          <div>
             <div className="flex items-center justify-between mb-4">
               <h3 className="font-bold text-zinc-200 flex items-center gap-2">
                 <Zap size={16} className="text-[#facc15]" fill="currentColor" />
                 Prestige Shop
               </h3>
               <div className="px-3 py-1 bg-[#2e1065] rounded-full border border-[#581c87] text-[10px] font-bold text-[#d8b4fe] uppercase tracking-wide">
                 {gameState.prestigePoints} Points Available
               </div>
             </div>

             {/* Upgrade Card */}
             <div className="p-4 bg-[#09090b] rounded-xl border border-[#27272a] hover:border-[#3f3f46] transition-colors group">
               <div className="flex justify-between items-start mb-4">
                 <div>
                   <div className="font-bold text-white text-base">Global Revenue Boost</div>
                   <div className="text-xs text-zinc-400 mt-1.5 flex items-center gap-2">
                     Multiplies all income by 
                     <span className="text-[#10b981] font-bold bg-[#10b981]/10 px-1.5 py-0.5 rounded">x{currentGlobalMultiplier.toFixed(1)}</span> 
                     <span className="text-zinc-600">→</span>
                     <span className="text-[#34d399] font-bold bg-[#34d399]/10 px-1.5 py-0.5 rounded">x{nextGlobalMultiplier.toFixed(1)}</span>
                   </div>
                 </div>
                 <div className="text-right">
                   <div className="text-[10px] text-zinc-600 uppercase font-bold tracking-wider mb-0.5">Level</div>
                   <div className="text-2xl font-black text-white leading-none">{gameState.prestigeMultiplierLevel}</div>
                 </div>
               </div>
               
               <button
                 onClick={onBuyUpgrade}
                 disabled={gameState.prestigePoints < upgradeCost}
                 className={`w-full py-2.5 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all
                   ${gameState.prestigePoints >= upgradeCost 
                     ? 'bg-[#27272a] text-white hover:bg-[#3f3f46] border border-[#3f3f46]' 
                     : 'bg-[#18181b] text-zinc-600 border border-[#27272a] cursor-not-allowed'}`}
               >
                 Buy Upgrade ({upgradeCost} Point)
               </button>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};