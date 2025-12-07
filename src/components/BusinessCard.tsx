import React, { useMemo, useState, useEffect, useRef } from 'react';
import { BusinessConfig, BusinessState } from '../types';
import { formatCurrency, formatTime, calculateRevenue, calculateCumulativeCost, calculateMaxAffordable } from '../utils/formatters';
import { ProgressBar } from './ProgressBar';
import { GAME_CONFIG, GAME_UNLOCKS, GAME_UPGRADES } from '../constants';
import { ArrowUpCircle, Bot, Zap, Lock, Star, ChevronUp, Banknote } from 'lucide-react';
import { useGameSounds } from '../hooks/useGameSounds'; // Audio Integration

interface BusinessCardProps {
  config: BusinessConfig;
  state: BusinessState;
  currentCash: number;
  buyMultiplier: number | 'MAX';
  globalMultiplier: number;
  purchasedUpgrades: Record<string, boolean>;
  onBuy: (id: string, amount: number) => void;
  onWork: (id: string) => void;
  onHireManager: (id: string) => void;
  onToggleAutoUpgrade: (id: string) => void;
}

// Particle Interface
interface MoneyParticle {
  id: number;
  left: number; // Percentage
  rotation: number; // Degrees
}

export const BusinessCard: React.FC<BusinessCardProps> = ({
  config,
  state,
  currentCash,
  buyMultiplier,
  globalMultiplier,
  purchasedUpgrades,
  onBuy,
  onWork,
  onHireManager,
  onToggleAutoUpgrade
}) => {
  const { playBuy, playClick } = useGameSounds(); // Hook Usage
  
  const isWorking = state.workStartTime !== null;
  const [isRevenuePulse, setIsRevenuePulse] = useState(false);
  const prevWorkTimeRef = useRef<number | null>(state.workStartTime);
  
  // Animation State
  const [particles, setParticles] = useState<MoneyParticle[]>([]);

  // Helper to get local unlock multiplier
  const unlockMultiplier = useMemo(() => {
    return GAME_UNLOCKS
      .filter(u => u.businessId === config.id && state.level >= u.threshold)
      .reduce((acc, u) => acc * u.multiplier, 1);
  }, [config.id, state.level]);

  // Helper to get local UPGRADE multiplier
  const upgradeMultiplier = useMemo(() => {
    return GAME_UPGRADES
      .filter(u => u.businessId === config.id && purchasedUpgrades[u.id])
      .reduce((acc, u) => acc * u.multiplier, 1);
  }, [config.id, purchasedUpgrades]);

  // Next unlock threshold for progress indication
  const nextUnlock = useMemo(() => {
    return GAME_UNLOCKS
      .filter(u => u.businessId === config.id && state.level < u.threshold)
      .sort((a, b) => a.threshold - b.threshold)[0];
  }, [config.id, state.level]);

  useEffect(() => {
    if (prevWorkTimeRef.current !== state.workStartTime) {
      if (prevWorkTimeRef.current !== null) {
        setIsRevenuePulse(true);
        // Play money sound on revenue collection (manual only usually, but let's be safe)
        // Note: For automatic managers this might spam too much, so we rely on manual click mostly
        const timer = setTimeout(() => setIsRevenuePulse(false), 300);
        prevWorkTimeRef.current = state.workStartTime;
        return () => clearTimeout(timer);
      }
      prevWorkTimeRef.current = state.workStartTime;
    }
  }, [state.workStartTime]);
  
  const { amountToBuy, cost } = useMemo(() => {
    if (!state.isOwned) {
      return { amountToBuy: 1, cost: config.unlockCost };
    }
    if (buyMultiplier === 'MAX') {
      const maxCanBuy = calculateMaxAffordable(config.baseCost, state.level, GAME_CONFIG.costMultiplier, currentCash);
      const safeAmount = Math.max(1, maxCanBuy); 
      const totalCost = calculateCumulativeCost(config.baseCost, state.level, GAME_CONFIG.costMultiplier, safeAmount);
      return { amountToBuy: safeAmount, cost: totalCost };
    } else {
      const totalCost = calculateCumulativeCost(config.baseCost, state.level, GAME_CONFIG.costMultiplier, buyMultiplier);
      return { amountToBuy: buyMultiplier, cost: totalCost };
    }
  }, [state.isOwned, state.level, config.baseCost, config.unlockCost, currentCash, buyMultiplier]);

  const currentRevenue = useMemo(() => {
    return calculateRevenue(config.baseRevenue, state.level || 1, globalMultiplier, unlockMultiplier, upgradeMultiplier); 
  }, [config.baseRevenue, state.level, globalMultiplier, unlockMultiplier, upgradeMultiplier]);

  const canAfford = currentCash >= cost;
  const isAffordableInMaxMode = buyMultiplier === 'MAX' ? (currentCash >= calculateCumulativeCost(config.baseCost, state.level, GAME_CONFIG.costMultiplier, 1)) : canAfford;
  const canAffordManager = currentCash >= config.managerCost;
  
  const isLocked = !state.isOwned && config.unlockCost > 0 && state.level === 0;
  const showBuyButton = canAfford || (buyMultiplier === 'MAX' && isAffordableInMaxMode);

  // Handle Buy + Trigger Animation
  const handleBuy = () => {
    if (showBuyButton || isLocked) { // Ensure we can buy
      onBuy(config.id, amountToBuy);
      playBuy(); // 🔊 Sound Effect
      
      // Spawn particles
      const newParticles: MoneyParticle[] = Array.from({ length: 6 }).map((_, i) => ({
        id: Date.now() + i + Math.random(),
        left: 20 + Math.random() * 60, // Random position between 20% and 80% horizontal
        rotation: (Math.random() * 60) - 30 // Random rotation -30deg to 30deg
      }));

      setParticles(prev => [...prev, ...newParticles]);

      // Cleanup particles after animation
      setTimeout(() => {
        setParticles(prev => prev.filter(p => !newParticles.find(np => np.id === p.id)));
      }, 900);
    }
  };

  const handleWork = () => {
    if (!isWorking) {
      onWork(config.id);
      playClick(); // 🔊 Simple click sound for starting work
    }
  };

  const handleHireManager = () => {
    onHireManager(config.id);
    playBuy(); // 🔊 Hiring is a purchase
  };

  return (
    <div className={`relative group transition-all duration-300 ${isLocked ? 'opacity-60 grayscale' : 'opacity-100'}`}>
      
      {/* Main Horizontal Bar Container */}
      <div className={`
        flex flex-col md:flex-row 
        bg-zinc-900 
        border-2 
        rounded-xl 
        overflow-hidden 
        shadow-lg 
        transition-all duration-200 
        hover:scale-[1.02] hover:shadow-2xl hover:border-zinc-600 hover:z-10
        ${isRevenuePulse ? 'border-emerald-500/60 shadow-[0_0_25px_rgba(16,185,129,0.2)]' : 'border-zinc-800'}
      `}>
        
        {/* Flash Overlay for Revenue */}
        <div className={`absolute inset-0 bg-emerald-400/5 pointer-events-none transition-opacity duration-300 ${isRevenuePulse ? 'opacity-100' : 'opacity-0'}`} style={{ zIndex: 1 }} />

        {/* LEFT: Icon & Level Area */}
        <div className="w-full md:w-28 bg-zinc-950 p-4 flex md:flex-col items-center justify-between md:justify-center gap-2 border-b md:border-b-0 md:border-r border-zinc-800 relative overflow-visible z-10">
           
           {/* Money Particle System */}
           {particles.map(p => (
             <div 
               key={p.id}
               className="absolute top-1/2 left-0 pointer-events-none z-50 animate-float-money"
               style={{ 
                 left: `${p.left}%`, 
                 '--tw-rotate': `${p.rotation}deg` 
               } as React.CSSProperties}
             >
               <Banknote className="text-green-500 drop-shadow-md fill-green-900/40" size={24} strokeWidth={1.5} />
             </div>
           ))}

           {state.isManagerHired && (
              <div className="absolute top-2 left-2 text-emerald-500 animate-pulse" title="Manager Active">
                 <Bot size={16} />
              </div>
           )}
           {/* Multiplier Badges */}
           <div className="absolute top-2 right-2 md:left-auto md:right-1 md:-top-1 z-10 flex flex-col items-end gap-1">
             {unlockMultiplier > 1 && (
               <div className="bg-orange-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow-sm flex items-center gap-0.5">
                 <Star size={8} fill="currentColor" />
                 x{unlockMultiplier}
               </div>
             )}
             {upgradeMultiplier > 1 && (
               <div className="bg-blue-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow-sm flex items-center gap-0.5">
                 <ChevronUp size={10} strokeWidth={4} />
                 x{upgradeMultiplier}
               </div>
             )}
           </div>

           <div className="text-4xl md:text-5xl drop-shadow-lg filter transform group-hover:scale-110 transition-transform duration-300 z-0">
             {config.icon}
           </div>
           <div className="bg-zinc-800 px-3 py-1 rounded-full text-xs font-bold text-zinc-300 border border-zinc-700 relative z-10">
             Lvl {state.level}
           </div>
        </div>

        {/* MIDDLE: Info & Progress Area */}
        <div className="flex-1 p-4 flex flex-col justify-between gap-3 bg-zinc-900/50 z-10">
           <div className="flex justify-between items-start">
             <div>
               <h3 className="text-lg font-bold text-white leading-tight">{config.name}</h3>
               <div className="text-xs text-zinc-500 font-medium flex items-center gap-2">
                 <span>Revenue: <span className={`transition-all duration-150 ${isRevenuePulse ? 'text-emerald-400 font-black scale-105 inline-block' : 'text-zinc-400'}`}>{formatCurrency(currentRevenue)}</span></span>
                 {nextUnlock && (
                   <span className="text-[10px] text-orange-400/80 bg-orange-900/10 px-1 rounded border border-orange-500/20">
                     Next x2 at Lvl {nextUnlock.threshold}
                   </span>
                 )}
               </div>
             </div>
             
             <div className="text-right">
                <div className="text-xs text-zinc-500">Cycle Time</div>
                <div className="font-mono text-sm text-zinc-300">{formatTime(config.duration)}</div>
             </div>
           </div>

           {/* Progress Bar Area */}
           <div className="relative">
             <ProgressBar startTime={state.workStartTime} durationSeconds={config.duration} />
             {state.isOwned && !state.isManagerHired && !isWorking && (
               <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
                 <span className="text-[10px] text-white/50 uppercase tracking-widest font-bold">Click to Start</span>
               </div>
             )}
           </div>

           {/* Manager / Auto Upgrade Controls */}
           {state.isOwned && (
             <div className="flex gap-2 mt-1">
                {!state.isManagerHired && (
                  <button
                    onClick={handleWork}
                    disabled={isWorking}
                    className={`flex-1 py-1.5 rounded text-xs font-bold uppercase tracking-wider transition-all
                      ${isWorking 
                        ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed' 
                        : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow shadow-emerald-900/50 active:translate-y-0.5'
                      }`}
                  >
                    {isWorking ? 'Running' : 'Start'}
                  </button>
                )}

                {!state.isManagerHired && (
                  <button
                    onClick={handleHireManager}
                    disabled={!canAffordManager}
                    className={`px-3 py-1.5 rounded text-xs font-bold border transition-colors flex items-center gap-1
                      ${canAffordManager 
                        ? 'bg-indigo-900/30 text-indigo-300 border-indigo-500/30 hover:bg-indigo-900/50' 
                        : 'bg-transparent text-zinc-600 border-zinc-800 cursor-not-allowed'}`}
                    title={`Hire Manager: ${formatCurrency(config.managerCost)}`}
                  >
                    <UserCheck size={12} />
                    Hire ({formatCurrency(config.managerCost)})
                  </button>
                )}

                {state.isManagerHired && (
                  <button 
                    onClick={() => onToggleAutoUpgrade(config.id)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded text-xs font-bold border transition-all ml-auto
                      ${state.isAutoUpgradeEnabled 
                        ? 'bg-amber-900/30 text-amber-400 border-amber-500/50 shadow-sm shadow-amber-900/20' 
                        : 'bg-zinc-800 text-zinc-500 border-zinc-700 hover:text-zinc-300'}`}
                  >
                    <Zap size={12} className={state.isAutoUpgradeEnabled ? "fill-current" : ""} />
                    Auto Upgrade
                  </button>
                )}
             </div>
           )}
        </div>

        {/* RIGHT: Buy Button (Price Tag Style) */}
        <button
          onClick={handleBuy}
          disabled={!showBuyButton && !isLocked}
          className={`w-full md:w-32 relative flex md:flex-col items-center justify-center p-4 gap-1 transition-all border-t md:border-t-0 md:border-l border-zinc-800 z-10
            ${state.isOwned 
               ? (showBuyButton 
                  ? 'bg-gradient-to-br from-orange-600 to-orange-700 hover:from-orange-500 hover:to-orange-600 text-white shadow-inner active:scale-95' 
                  : 'bg-zinc-900 text-zinc-500 cursor-not-allowed')
               : (canAfford 
                  ? 'bg-emerald-700 hover:bg-emerald-600 text-white active:scale-95'
                  : 'bg-zinc-900 text-zinc-600 cursor-not-allowed')
            }
          `}
        >
          <div className="absolute top-1/2 -left-1.5 w-3 h-3 bg-zinc-900 rounded-full hidden md:block"></div>
          
          {isLocked ? (
             <div className="flex flex-col items-center">
               <Lock size={20} className="mb-1" />
               <span className="text-xs font-bold uppercase">Unlock</span>
               <span className="text-xs opacity-80">{formatCurrency(config.unlockCost)}</span>
             </div>
          ) : (
            <>
              <div className="text-xs font-bold uppercase opacity-80 mb-1">
                Buy <span className="text-sm bg-black/20 px-1 rounded">x{amountToBuy}</span>
              </div>
              <div className="flex items-center gap-1 font-bold text-sm md:text-base leading-none">
                 {formatCurrency(cost)}
              </div>
              {state.isOwned && showBuyButton && (
                <div className="absolute top-2 right-2 md:hidden">
                  <ArrowUpCircle size={16} className="opacity-50" />
                </div>
              )}
            </>
          )}
        </button>

      </div>
    </div>
  );
};

const UserCheck = ({ size }: { size: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><polyline points="16 11 18 13 22 9"/></svg>
);