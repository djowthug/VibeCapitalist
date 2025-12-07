import React, { useMemo } from 'react';
import { GameState, BusinessConfig } from '../types';
import { GAME_UNLOCKS } from '../constants';
import { X, CheckCircle, Lock } from 'lucide-react';

interface UnlocksModalProps {
  isOpen: boolean;
  onClose: () => void;
  gameState: GameState;
  businesses: BusinessConfig[];
}

export const UnlocksModal: React.FC<UnlocksModalProps> = ({
  isOpen,
  onClose,
  gameState,
  businesses
}) => {
  if (!isOpen) return null;

  const totalUnlocks = GAME_UNLOCKS.length;
  
  // Calculate acquired unlocks
  const acquiredCount = useMemo(() => {
    return GAME_UNLOCKS.filter(unlock => {
      const business = gameState.businesses[unlock.businessId];
      return business && business.level >= unlock.threshold;
    }).length;
  }, [gameState.businesses]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-4xl bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header - Styled like the reference image (Orange/Yellow Banner) */}
        <div className="relative bg-[#eab308] p-4 shadow-md z-10">
          <button 
            onClick={onClose}
            className="absolute top-1/2 -translate-y-1/2 right-4 p-1.5 bg-white/20 text-white rounded-full hover:bg-white/30 transition-colors"
          >
            <X size={20} />
          </button>
          
          <div className="flex flex-col items-center justify-center">
            <h2 className="text-3xl font-black text-white drop-shadow-md tracking-tight font-serif italic">Unlocks</h2>
            <div className="flex items-center gap-2 mt-1 bg-black/10 px-3 py-1 rounded-full text-white font-bold text-sm">
               <CheckCircle size={16} />
               <span>{acquiredCount} / {totalUnlocks}</span>
            </div>
          </div>
        </div>

        {/* Info Banner */}
        <div className="bg-[#fef9c3] p-4 text-center border-b border-[#fde047]">
           <p className="text-[#854d0e] font-serif text-sm font-medium italic">
             "Want to maximize profits? Look no further! Get your investments to these quotas to unlock sweet profit bonuses!"
           </p>
        </div>

        {/* Grid Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-[#f4f4f5] dark:bg-zinc-900 scrollbar-thin">
           <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
             {GAME_UNLOCKS.map((unlock) => {
               const business = gameState.businesses[unlock.businessId];
               const config = businesses.find(b => b.id === unlock.businessId);
               const isUnlocked = business && business.level >= unlock.threshold;

               return (
                 <div 
                   key={unlock.id}
                   className={`flex flex-col items-center text-center p-3 rounded-xl border-2 transition-all
                     ${isUnlocked 
                       ? 'bg-white border-orange-400 shadow-lg scale-100 opacity-100' 
                       : 'bg-zinc-100 border-zinc-300 opacity-60 grayscale'
                     }`}
                 >
                    {/* Badge Circle */}
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center text-3xl mb-2 border-4 relative
                      ${isUnlocked ? 'bg-orange-100 border-orange-400' : 'bg-zinc-200 border-zinc-400'}`}>
                      {config?.icon}
                      
                      {/* Level Requirement Badge */}
                      <div className={`absolute -bottom-2 px-2 py-0.5 rounded-full text-xs font-bold text-white shadow-sm
                         ${isUnlocked ? 'bg-orange-500' : 'bg-zinc-500'}`}>
                        {unlock.threshold}
                      </div>
                    </div>

                    <div className="mt-2 w-full">
                       <div className={`font-bold text-xs truncate leading-tight ${isUnlocked ? 'text-zinc-800' : 'text-zinc-500'}`}>
                         {config?.name}
                       </div>
                       <div className={`font-black text-sm ${isUnlocked ? 'text-orange-600' : 'text-zinc-400'}`}>
                         x{unlock.multiplier}
                       </div>
                    </div>
                    
                    {!isUnlocked && (
                       <div className="mt-1 text-[10px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1">
                         <Lock size={10} /> Locked
                       </div>
                    )}
                 </div>
               );
             })}
           </div>
        </div>

      </div>
    </div>
  );
};