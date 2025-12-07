import React, { useState, useMemo } from 'react';
import { useGameEngine } from './hooks/useGameEngine';
import { useGameSounds } from './hooks/useGameSounds'; // Audio Integration
import { BusinessCard } from './components/BusinessCard';
import { PrestigeModal } from './components/PrestigeModal';
import { UnlocksModal } from './components/UnlocksModal'; 
import { UpgradesModal } from './components/UpgradesModal'; 
import { Advisor } from './components/Advisor'; 
import { WelcomeBackModal } from './components/WelcomeBackModal';
import { SettingsModal } from './components/SettingsModal';
import { GAME_CONFIG } from './constants';
import { formatCurrency, calculateGlobalMultiplier } from './utils/formatters';
import { Wallet, Trophy, RotateCcw, Crown, ListChecks, ArrowUpCircle, Briefcase, Cpu, Landmark, Building2, Atom, LayoutGrid, Settings } from 'lucide-react';

const App: React.FC = () => {
  const { 
    gameState, 
    buyMultiplier,
    offlineEarnings,
    offlineTime,
    setBuyMultiplier,
    purchaseBusiness, 
    hireManager, 
    purchaseUpgrade, 
    toggleAutoUpgrade,
    startWork, 
    prestige,
    buyPrestigeUpgrade,
    resetGame,
    clearOfflineEarnings
  } = useGameEngine();

  // Audio Hook
  const { playClick, playBuy } = useGameSounds();

  const [isPrestigeOpen, setIsPrestigeOpen] = useState(false);
  const [isUnlocksOpen, setIsUnlocksOpen] = useState(false);
  const [isUpgradesOpen, setIsUpgradesOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState('ALL');

  const globalMultiplier = calculateGlobalMultiplier(gameState.prestigeMultiplierLevel);

  // Derive categories from config
  const categories = useMemo(() => {
    const cats = Array.from(new Set(GAME_CONFIG.businesses.map(b => b.category)));
    return ['ALL', ...cats];
  }, []);

  const filteredBusinesses = useMemo(() => {
    if (activeCategory === 'ALL') return GAME_CONFIG.businesses;
    return GAME_CONFIG.businesses.filter(b => b.category === activeCategory);
  }, [activeCategory]);

  const getCategoryIcon = (cat: string) => {
    switch(cat) {
      case 'ALL': return <LayoutGrid size={14} />;
      case 'hustle': return <Briefcase size={14} />;
      case 'innovation': return <Cpu size={14} />;
      case 'finance': return <Landmark size={14} />;
      case 'enterprise': return <Building2 size={14} />;
      case 'future-tech': return <Atom size={14} />;
      default: return <Briefcase size={14} />;
    }
  };

  const getCategoryLabel = (cat: string) => {
     switch (cat) {
      case 'ALL': return 'All Ventures';
      case 'hustle': return 'Side Hustles';
      case 'innovation': return 'Innovation';
      case 'finance': return 'Finance';
      case 'enterprise': return 'Enterprise';
      case 'future-tech': return 'Future Tech';
      default: return cat;
    }
  };

  return (
    <div className="min-h-screen text-zinc-200 selection:bg-orange-500/30 pb-24">
      
      {/* Settings Button - Fixed Top Left */}
      <button 
        onClick={() => { 
          setIsSettingsOpen(true); 
          playClick(); 
        }}
        className="fixed top-4 left-4 z-50 flex items-center justify-center w-12 h-12 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border-2 border-zinc-800 rounded-xl transition-all shadow-lg hover:shadow-xl hover:scale-105 group"
        title="Settings"
      >
        <Settings size={22} className="group-hover:rotate-90 transition-transform duration-300" />
      </button>

      {/* Sticky Header HUD */}
      <header className="sticky top-0 z-40 bg-zinc-950/90 backdrop-blur-md border-b-2 border-zinc-800 shadow-xl">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-0">
            <div className="flex items-center justify-between md:justify-start gap-2 md:gap-6">
              {/* Net Worth Display */}
              <div className="flex items-center gap-3">
                <div className="bg-gradient-to-br from-emerald-500 to-emerald-700 p-2.5 rounded-xl text-white shadow-lg shadow-emerald-900/20 border border-emerald-400/20">
                  <Wallet size={24} />
                </div>
                <div>
                  <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Net Worth</div>
                  <div className="text-2xl md:text-3xl font-black text-white tabular-nums tracking-tight">
                    {formatCurrency(gameState.cash)}
                  </div>
                </div>
              </div>

              {/* Buy Control */}
              <div className="flex items-center bg-zinc-900 rounded-lg p-1 border border-zinc-800 shadow-inner">
                 {[1, 10, 100, 'MAX'].map((val) => (
                   <button
                    key={val}
                    onClick={() => {
                      setBuyMultiplier(val as number | 'MAX');
                      playClick();
                    }}
                    className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${
                      buyMultiplier === val 
                      ? 'bg-orange-500 text-white shadow-md' 
                      : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800'
                    }`}
                   >
                     {val === 'MAX' ? 'MAX' : `x${val}`}
                   </button>
                 ))}
              </div>
            </div>

            <div className="flex items-center gap-3 justify-end">
              <div className="hidden md:block text-right">
                <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Global Boost</div>
                <div className="text-sm font-bold text-purple-400 tabular-nums bg-purple-900/20 px-2 py-0.5 rounded border border-purple-500/20">
                  x{globalMultiplier.toFixed(2)}
                </div>
              </div>

              {/* Unlocks Button */}
              <button 
                onClick={() => { setIsUnlocksOpen(true); playClick(); }}
                className="flex items-center justify-center w-10 h-10 bg-zinc-800 hover:bg-zinc-700 text-orange-400 border border-zinc-700 rounded-lg transition-all"
                title="Unlocks & Achievements"
              >
                <ListChecks size={20} />
              </button>

              {/* Upgrades Button */}
              <button 
                onClick={() => { setIsUpgradesOpen(true); playClick(); }}
                className="flex items-center justify-center w-10 h-10 bg-emerald-900/30 hover:bg-emerald-900/50 text-emerald-400 border border-emerald-500/30 rounded-lg transition-all"
                title="Buy Upgrades"
              >
                <ArrowUpCircle size={20} />
              </button>

              {/* Prestige Button */}
              <button 
                onClick={() => { setIsPrestigeOpen(true); playClick(); }}
                className="flex items-center justify-center w-10 h-10 md:w-auto md:px-3 gap-2 bg-purple-600 hover:bg-purple-500 text-white border-b-4 border-purple-800 active:border-b-0 active:translate-y-1 rounded-lg transition-all shadow-lg shadow-purple-900/30"
                title="Prestige"
              >
                <Crown size={20} fill="currentColor" className="text-purple-200" />
                <span className="text-xs font-bold uppercase hidden md:inline">Prestige</span>
              </button>
              
              <button 
                onClick={() => {
                  if(window.confirm('Hard Reset: Delete all save data? (This is NOT prestige)')) resetGame();
                }}
                className="p-2 text-zinc-600 hover:text-red-400 transition-colors"
                title="Hard Reset Game"
              >
                <RotateCcw size={18} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        
        {/* Intro Section */}
        <div className="mb-6 text-center md:text-left flex flex-col md:flex-row justify-between items-end">
          <div>
            <h1 className="text-4xl font-black text-white mb-2 tracking-tight drop-shadow-sm italic transform -skew-x-6">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-300">VIBE</span> CAPITALIST
            </h1>
            <p className="text-zinc-400 font-medium">
              Hustle. Grind. Dominate the market.
            </p>
          </div>
          <div className="text-xs text-zinc-600 font-mono mt-4 md:mt-0">
             v{GAME_CONFIG.gameVersion}
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex overflow-x-auto pb-2 mb-6 gap-2 no-scrollbar mask-gradient -mx-4 px-4 md:mx-0 md:px-0">
           {categories.map(cat => (
             <button
               key={cat}
               onClick={() => { setActiveCategory(cat); playClick(); }}
               className={`
                 flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap border transition-all duration-200
                 ${activeCategory === cat 
                   ? 'bg-zinc-100 text-zinc-900 border-zinc-100 shadow-lg scale-105 z-10' 
                   : 'bg-zinc-900/50 text-zinc-500 border-zinc-800 hover:bg-zinc-800 hover:border-zinc-700 hover:text-zinc-300'}
               `}
             >
               {getCategoryIcon(cat)}
               {getCategoryLabel(cat)}
             </button>
           ))}
        </div>

        {/* Business Stack */}
        <div className="flex flex-col gap-4 min-h-[50vh]">
          {filteredBusinesses.length > 0 ? (
            filteredBusinesses.map((config) => {
               const state = gameState.businesses[config.id];
               return (
                 <BusinessCard
                   key={config.id}
                   config={config}
                   state={state}
                   currentCash={gameState.cash}
                   buyMultiplier={buyMultiplier}
                   globalMultiplier={globalMultiplier}
                   purchasedUpgrades={gameState.purchasedUpgrades} 
                   onBuy={purchaseBusiness}
                   onWork={startWork}
                   onHireManager={hireManager}
                   onToggleAutoUpgrade={toggleAutoUpgrade}
                 />
               );
            })
          ) : (
            <div className="text-center py-20 opacity-50 border-2 border-dashed border-zinc-800 rounded-xl">
               <p className="text-zinc-500 font-bold">No businesses found in this category.</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <footer className="mt-16 py-8 border-t border-zinc-800/50 text-center text-zinc-600 text-sm">
          <p className="flex items-center justify-center gap-2">
            <Trophy size={14} /> 
            <span>Build your empire.</span>
          </p>
        </footer>

      </main>

      {/* Advisor Component */}
      <Advisor gameState={gameState} businesses={GAME_CONFIG.businesses} />
      
      <WelcomeBackModal
        isOpen={offlineEarnings > 0}
        earnings={offlineEarnings}
        offlineTimeSeconds={offlineTime}
        onCollect={() => { clearOfflineEarnings(); playBuy(); }}
      />

      <PrestigeModal 
        isOpen={isPrestigeOpen}
        onClose={() => setIsPrestigeOpen(false)}
        gameState={gameState}
        onPrestige={() => { prestige(); playBuy(); }}
        onBuyUpgrade={() => { buyPrestigeUpgrade(); playBuy(); }}
      />

      <UnlocksModal 
        isOpen={isUnlocksOpen}
        onClose={() => setIsUnlocksOpen(false)}
        gameState={gameState}
        businesses={GAME_CONFIG.businesses}
      />

      <UpgradesModal 
        isOpen={isUpgradesOpen}
        onClose={() => setIsUpgradesOpen(false)}
        gameState={gameState}
        onBuyUpgrade={(id) => { purchaseUpgrade(id); playBuy(); }}
      />

      <SettingsModal 
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onReset={resetGame}
      />
    </div>
  );
};

export default App;