import React, { useMemo } from 'react';
import { GameState } from '../types';
import { GAME_UPGRADES, GAME_CONFIG } from '../constants';
import { formatCurrency } from '../utils/formatters';
import { X, Sparkles, Check, DollarSign } from 'lucide-react';

interface UpgradesModalProps {
  isOpen: boolean;
  onClose: () => void;
  gameState: GameState;
  onBuyUpgrade: (id: string) => void;
}

export const UpgradesModal: React.FC<UpgradesModalProps> = ({
  isOpen,
  onClose,
  gameState,
  onBuyUpgrade
}) => {
  if (!isOpen) return null;

  // Filter available upgrades:
  // Show if: 
  // 1. Not bought yet (or keep bought at bottom?) -> Let's hide bought for cleaner UI or put at bottom
  // 2. Business is owned? -> Usually good practice to show all or only for owned businesses. Let's show all for "teasing".
  const sortedUpgrades = useMemo(() => {
    return [...GAME_UPGRADES].sort((a, b) => {
       const ownedA = gameState.purchasedUpgrades[a.id] ? 1 : 0;
       const ownedB = gameState.purchasedUpgrades[b.id] ? 1 : 0;
       if (ownedA !== ownedB) return ownedA - ownedB; // Unowned first
       return a.cost - b.cost; // Cheaper first
    });
  }, [gameState.purchasedUpgrades]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-[#eaddcf] border-4 border-[#d4bca5] rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header - Retro Orange Banner */}
        <div className="relative bg-[#d97736] p-4 shadow-md border-b-4 border-[#b55d22] z-10 flex items-center justify-center">
          <button 
            onClick={onClose}
            className="absolute top-1/2 -translate-y-1/2 right-4 w-8 h-8 bg-white text-[#d97736] rounded-full font-bold flex items-center justify-center hover:scale-110 transition-transform shadow-md"
          >
            <X size={20} />
          </button>
          
          <h2 className="text-3xl text-white font-[cursive] drop-shadow-md tracking-wide" style={{ fontFamily: 'Brush Script MT, cursive' }}>
            Upgrades
          </h2>
        </div>

        {/* Tabs visual (Static for now) */}
        <div className="flex justify-center gap-4 p-4 bg-[#eaddcf] relative z-0">
           <div className="flex flex-col items-center">
             <div className="w-14 h-14 bg-zinc-800 rounded-full border-4 border-[#d97736] flex items-center justify-center text-amber-400 shadow-lg z-10">
               <DollarSign size={24} strokeWidth={3} />
             </div>
             <div className="bg-[#d97736] text-white text-[10px] font-bold px-3 py-1 rounded-full -mt-3 z-20">
               Cash Upgrades
             </div>
           </div>
           
           <div className="flex flex-col items-center opacity-40 grayscale">
             <div className="w-14 h-14 bg-zinc-800 rounded-full border-4 border-zinc-400 flex items-center justify-center text-white shadow-lg z-10">
               <Sparkles size={24} strokeWidth={3} />
             </div>
             <div className="bg-zinc-500 text-white text-[10px] font-bold px-3 py-1 rounded-full -mt-3 z-20">
               Angel Upgrades
             </div>
           </div>
        </div>

        {/* Info Text */}
        <div className="px-6 text-center mb-2">
           <p className="text-[#8c6b5d] font-serif text-sm italic font-semibold">
             "You gotta spend money to make money!"
           </p>
           <p className="text-[#8c6b5d] text-xs opacity-80">
             Purchase these fine quality upgrades to give your businesses a boost.
           </p>
        </div>

        {/* List Content - Retro Stripes Background */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin"
             style={{
               backgroundImage: 'repeating-linear-gradient(90deg, #eaddcf, #eaddcf 10px, #e3d3c4 10px, #e3d3c4 20px)'
             }}>
             
             {sortedUpgrades.map((upgrade) => {
               const isPurchased = gameState.purchasedUpgrades[upgrade.id];
               const canAfford = gameState.cash >= upgrade.cost;
               const businessName = GAME_CONFIG.businesses.find(b => b.id === upgrade.businessId)?.name;

               return (
                 <div key={upgrade.id} className="relative group">
                    {/* The "Paper" Card */}
                    <div className={`relative flex items-center justify-between p-3 rounded-lg shadow-md border-b-4 transition-all
                      ${isPurchased 
                        ? 'bg-zinc-200 border-zinc-400 opacity-60' 
                        : 'bg-white border-[#d1d1d1] hover:scale-[1.01]'}`}>
                      
                      {/* Icon Section - Left arrow shape effect via CSS or simple rounding */}
                      <div className="mr-3">
                         <div className="text-3xl drop-shadow-sm">{upgrade.icon}</div>
                      </div>

                      {/* Info Section */}
                      <div className="flex-1">
                         <h3 className="text-[#d97736] font-bold text-lg leading-none" style={{ fontFamily: 'Brush Script MT, cursive' }}>
                           {upgrade.name}
                         </h3>
                         <div className="text-xs text-zinc-500 font-bold uppercase tracking-tight">
                           {businessName} profit x{upgrade.multiplier}
                         </div>
                         <div className="text-sm font-black text-zinc-700 mt-0.5">
                           {formatCurrency(upgrade.cost)}
                         </div>
                      </div>

                      {/* Button Section */}
                      <div>
                        {isPurchased ? (
                           <div className="w-16 h-12 flex flex-col items-center justify-center text-emerald-600">
                             <Check size={28} strokeWidth={3} />
                             <span className="text-[10px] font-bold uppercase">Owned</span>
                           </div>
                        ) : (
                           <button
                             onClick={() => onBuyUpgrade(upgrade.id)}
                             disabled={!canAfford}
                             className={`w-20 py-2 font-bold text-lg rounded shadow-sm border-b-4 active:border-b-0 active:translate-y-1 transition-all transform -rotate-2
                               ${canAfford 
                                 ? 'bg-[#a3a3a3] text-white border-[#737373] hover:bg-[#949494]' 
                                 : 'bg-[#e5e5e5] text-[#a3a3a3] border-[#d4d4d4] cursor-not-allowed'}`}
                             style={{ fontFamily: 'Brush Script MT, cursive' }}
                           >
                             Buy!
                           </button>
                        )}
                      </div>
                    </div>
                 </div>
               );
             })}
        </div>
      </div>
    </div>
  );
};