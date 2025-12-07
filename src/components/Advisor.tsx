import React, { useEffect, useState } from 'react';
import { GameState, BusinessConfig } from '../types';
import { GAME_UPGRADES } from '../constants';
import { formatCurrency } from '../utils/formatters';
import { Sparkles, X, Lightbulb, TrendingUp } from 'lucide-react';

interface AdvisorProps {
  gameState: GameState;
  businesses: BusinessConfig[];
}

export const Advisor: React.FC<AdvisorProps> = ({ gameState, businesses }) => {
  const [message, setMessage] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [mood, setMood] = useState<'neutral' | 'excited' | 'smart'>('neutral');

  useEffect(() => {
    // Logic to determine the best tip based on game state
    const determineTip = () => {
      // 1. TUTORIAL: Start of game
      if (gameState.lifetimeEarnings === 0 && gameState.businesses['freelancer'].level === 0) {
        setMood('excited');
        return "Welcome, boss! Click 'Unlock' on the Freelancer to start your empire!";
      }

      // 2. TUTORIAL: First manual work needed
      if (gameState.businesses['freelancer'].level > 0 && gameState.lifetimeEarnings === 0) {
        setMood('neutral');
        return "Great! Now click the green 'Start Production' button to earn your first dollar.";
      }

      // 3. TUTORIAL: Reminder to keep clicking if poor and no managers
      if (gameState.cash < 50 && !Object.values(gameState.businesses).some(b => b.isManagerHired)) {
         setMood('neutral');
         return "Keep clicking! Accumulate cash to buy upgrades or hire managers.";
      }

      // 4. STRATEGY: Close to unlocking new business (75% to 99% of cost)
      // Encourages saving instead of spending on small things
      const nextUnownedBusiness = businesses.find(b => !gameState.businesses[b.id].isOwned);
      if (nextUnownedBusiness) {
        const progress = gameState.cash / nextUnownedBusiness.unlockCost;
        if (progress >= 0.75 && progress < 1.0) {
          setMood('excited');
          const remaining = nextUnownedBusiness.unlockCost - gameState.cash;
          return `Hold the line! You're only ${formatCurrency(remaining)} away from unlocking ${nextUnownedBusiness.name}. Save up!`;
        }
      }

      // 5. STRATEGY: High Automation Value (Affordable Manager)
      const affordableManager = businesses.find(b => {
        const state = gameState.businesses[b.id];
        return state.isOwned && !state.isManagerHired && gameState.cash >= b.managerCost;
      });

      if (affordableManager) {
        setMood('smart');
        return `Tired of clicking? You can afford a Manager for ${affordableManager.name} (${formatCurrency(affordableManager.managerCost)})!`;
      }

      // 6. STRATEGY: Efficiency Check (Affordable Upgrade)
      // Triggers if we own the business, don't own the upgrade, and can afford it.
      const affordableUpgrade = GAME_UPGRADES.find(u => {
        const busState = gameState.businesses[u.businessId];
        const isOwned = gameState.purchasedUpgrades[u.id];
        return busState?.isOwned && !isOwned && gameState.cash >= u.cost;
      });

      if (affordableUpgrade) {
        setMood('smart');
        const busName = businesses.find(b => b.id === affordableUpgrade.businessId)?.name;
        return `Efficiency Alert! Buy "${affordableUpgrade.name}" to triple your ${busName} profits!`;
      }

      // 7. EXPANSION: Buy next business
      if (nextUnownedBusiness && gameState.cash >= nextUnownedBusiness.unlockCost) {
        setMood('excited');
        return `Expansion time! You have enough cash to unlock ${nextUnownedBusiness.name}.`;
      }
      
      // 8. FLAVOR: Generic motivation
      if (Math.random() > 0.85) { // Lower frequency
        setMood('neutral');
        const msgs = [
          "Those lemons won't squeeze themselves! Keep growing!",
          "Compound interest is the 8th wonder of the world.",
          "Remember to hydrate while you dominate the market.",
          "A penny saved is... actually, just spend it on upgrades.",
        ];
        return msgs[Math.floor(Math.random() * msgs.length)];
      }

      return null;
    };

    const newTip = determineTip();
    
    // Only update if the message is different to avoid spamming animations
    if (newTip && newTip !== message) {
      setMessage(newTip);
      setIsVisible(true);
      
      // Auto-hide after 10 seconds to not be annoying, unless it's critical tutorial
      if (gameState.lifetimeEarnings > 100) {
        const timer = setTimeout(() => setIsVisible(false), 12000);
        return () => clearTimeout(timer);
      }
    }
  }, [gameState.cash, gameState.lifetimeEarnings, gameState.businesses, gameState.purchasedUpgrades, businesses, message]);

  if (!message || !isVisible) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-xs animate-in slide-in-from-right duration-500">
      <div className="relative group cursor-pointer" onClick={() => setIsVisible(false)}>
        {/* Avatar Area */}
        <div className={`absolute -left-12 -top-10 w-20 h-20 rounded-full border-4 border-white shadow-lg flex items-center justify-center z-10 transition-colors duration-300
          ${mood === 'excited' ? 'bg-gradient-to-br from-purple-400 to-pink-500' : 
            mood === 'smart' ? 'bg-gradient-to-br from-blue-400 to-cyan-500' : 
            'bg-gradient-to-br from-amber-400 to-orange-500'}`}>
           <span className="text-3xl filter drop-shadow-md" role="img" aria-label="Advisor">
             {mood === 'excited' ? '🚀' : mood === 'smart' ? '🧠' : '🤵'}
           </span>
        </div>

        {/* Speech Bubble */}
        <div className="bg-white text-zinc-900 p-4 rounded-2xl rounded-tl-none shadow-xl border-2 border-zinc-200 ml-4 mt-2 relative hover:scale-[1.02] transition-transform">
          <button 
            onClick={(e) => {
              e.stopPropagation();
              setIsVisible(false);
            }}
            className="absolute top-2 right-2 text-zinc-400 hover:text-zinc-600 p-1"
          >
            <X size={14} />
          </button>
          
          <div className="flex items-center gap-2 mb-1">
             <span className={`text-xs font-bold uppercase tracking-wider
               ${mood === 'excited' ? 'text-purple-600' : 
                 mood === 'smart' ? 'text-blue-600' : 
                 'text-orange-600'}`}>
               Advisor
             </span>
             {mood === 'smart' ? <Lightbulb size={12} className="text-blue-400" /> : 
              mood === 'excited' ? <TrendingUp size={12} className="text-purple-400" /> :
              <Sparkles size={12} className="text-orange-400" />}
          </div>
          
          <p className="text-sm font-medium leading-relaxed text-zinc-700">
            {message}
          </p>
          
          <div className="mt-2 text-[10px] text-zinc-400 font-semibold text-right italic">
            Tap to dismiss
          </div>
        </div>
      </div>
    </div>
  );
};