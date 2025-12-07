import { useState, useEffect, useCallback, useRef } from 'react';
import { GameState, BusinessState } from '../types';
import { GAME_CONFIG, GAME_UNLOCKS, GAME_UPGRADES, SAVE_KEY } from '../constants';
import { 
  calculateRevenue, 
  calculateCumulativeCost, 
  calculateMaxAffordable, 
  calculatePrestigePoints,
  calculateGlobalMultiplier
} from '../utils/formatters';

const DEFAULT_STATE: GameState = {
  cash: GAME_CONFIG.initialCash,
  lifetimeEarnings: 0,
  businesses: GAME_CONFIG.businesses.reduce((acc, bus) => ({
    ...acc,
    [bus.id]: {
      id: bus.id,
      level: 0,
      isOwned: bus.unlockCost === 0,
      isManagerHired: false,
      isAutoUpgradeEnabled: false,
      workStartTime: null
    }
  }), {} as Record<string, BusinessState>),
  purchasedUpgrades: {},
  lastSaveTime: Date.now(),
  lastResetTime: Date.now(),
  prestigePoints: 0,
  prestigeMultiplierLevel: 0,
};

// Helper: Calculate Unlock Multiplier (Based on Level)
const getUnlockMultiplier = (businessId: string, level: number) => {
  return GAME_UNLOCKS
    .filter(u => u.businessId === businessId && level >= u.threshold)
    .reduce((acc, u) => acc * u.multiplier, 1);
};

// Helper: Calculate Upgrade Multiplier (Based on Purchased Upgrades)
const getUpgradeMultiplier = (businessId: string, purchasedUpgrades: Record<string, boolean>) => {
  return GAME_UPGRADES
    .filter(u => u.businessId === businessId && purchasedUpgrades[u.id])
    .reduce((acc, u) => acc * u.multiplier, 1);
};

export const useGameEngine = () => {
  const [buyMultiplier, setBuyMultiplier] = useState<number | 'MAX'>(1);
  const [offlineEarnings, setOfflineEarnings] = useState<number>(0);
  const [offlineTime, setOfflineTime] = useState<number>(0);

  const [gameState, setGameState] = useState<GameState>(() => {
    try {
      const saved = localStorage.getItem(SAVE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        
        // 1. Schema Migrations & Safety
        Object.keys(parsed.businesses).forEach(key => {
          if (parsed.businesses[key].isAutoUpgradeEnabled === undefined) {
            parsed.businesses[key].isAutoUpgradeEnabled = false;
          }
        });
        if (parsed.prestigePoints === undefined) parsed.prestigePoints = 0;
        if (parsed.prestigeMultiplierLevel === undefined) parsed.prestigeMultiplierLevel = 0;
        if (parsed.purchasedUpgrades === undefined) parsed.purchasedUpgrades = {};
        if (parsed.lastResetTime === undefined) parsed.lastResetTime = Date.now();
        if (parsed.lastSaveTime === undefined) parsed.lastSaveTime = Date.now();

        // 2. Offline Earnings Calculation
        const now = Date.now();
        const lastSave = parsed.lastSaveTime || now;
        const elapsedSeconds = (now - lastSave) / 1000;

        // Only calculate if away for more than 5 seconds
        if (elapsedSeconds > 5) {
          let totalOfflineCash = 0;
          const globalMult = calculateGlobalMultiplier(parsed.prestigeMultiplierLevel || 0);

          Object.values(parsed.businesses).forEach((busState: any) => {
            const config = GAME_CONFIG.businesses.find(b => b.id === busState.id);
            
            // Only managers work offline
            if (config && busState.isOwned && busState.isManagerHired) {
              const unlockMult = getUnlockMultiplier(busState.id, busState.level);
              const upgradeMult = getUpgradeMultiplier(busState.id, parsed.purchasedUpgrades);
              
              const revenuePerCycle = calculateRevenue(
                config.baseRevenue,
                busState.level,
                globalMult,
                unlockMult,
                upgradeMult
              );

              // Production per second = Revenue / Duration
              const ratePerSecond = revenuePerCycle / config.duration;
              totalOfflineCash += ratePerSecond * elapsedSeconds;
            }
          });

          if (totalOfflineCash > 0) {
            // Update the initial state immediately so the numbers are correct on render
            parsed.cash += totalOfflineCash;
            parsed.lifetimeEarnings += totalOfflineCash;
            
            // Store simple values in local vars to set side-effect states later
            // We can't call setOfflineEarnings here (in initializer), we'll do it in a useEffect
            // But we can attach it to the object temporarily if we wanted, 
            // OR just re-calculate/expose it via a ref/effect.
            // Cleaner: Return the modified state, and use a useEffect to detect the jump?
            // Simplest: We already modified 'parsed'. We need a way to tell the UI about it.
            // Let's defer the UI trigger to a useEffect.
          }
        }

        return parsed;
      }
    } catch (e) {
      console.error("Failed to load save", e);
    }
    return DEFAULT_STATE;
  });

  // Effect to trigger the modal logic ONCE on mount
  useEffect(() => {
    const saved = localStorage.getItem(SAVE_KEY);
    if (!saved) return;
    
    try {
      const parsed = JSON.parse(saved);
      const now = Date.now();
      const lastSave = parsed.lastSaveTime || now;
      const elapsedSeconds = (now - lastSave) / 1000;

      if (elapsedSeconds > 5) {
        let totalOfflineCash = 0;
        const globalMult = calculateGlobalMultiplier(parsed.prestigeMultiplierLevel || 0);

        Object.values(parsed.businesses).forEach((busState: any) => {
          const config = GAME_CONFIG.businesses.find(b => b.id === busState.id);
          if (config && busState.isOwned && busState.isManagerHired) {
             const unlockMult = getUnlockMultiplier(busState.id, busState.level);
             const upgradeMult = getUpgradeMultiplier(busState.id, parsed.purchasedUpgrades);
             const revenuePerCycle = calculateRevenue(config.baseRevenue, busState.level, globalMult, unlockMult, upgradeMult);
             const ratePerSecond = revenuePerCycle / config.duration;
             totalOfflineCash += ratePerSecond * elapsedSeconds;
          }
        });

        if (totalOfflineCash > 0) {
          setOfflineEarnings(totalOfflineCash);
          setOfflineTime(elapsedSeconds);
        }
      }
    } catch(e) {}
  }, []); // Run once on mount

  const stateRef = useRef(gameState);
  
  // Sync Ref with State immediately after render
  useEffect(() => {
    stateRef.current = gameState;
  }, [gameState]);

  const buyMultiplierRef = useRef(buyMultiplier);
  useEffect(() => {
    buyMultiplierRef.current = buyMultiplier;
  }, [buyMultiplier]);

  // Dynamic Title
  useEffect(() => {
    document.title = `${new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: 'USD', 
      notation: 'compact',
      maximumFractionDigits: 1
    }).format(gameState.cash)} - Vibe Capitalist`;
  }, [gameState.cash]);

  // Game Loop
  useEffect(() => {
    const tickRate = 100;
    const interval = setInterval(() => {
      // Capture the state at the start of the tick
      const startTickState = stateRef.current;
      const now = Date.now();
      
      let currentCash = startTickState.cash;
      let lifetimeEarnings = startTickState.lifetimeEarnings;
      let updatedBusinesses = false;
      const newBusinesses = { ...startTickState.businesses };
      
      const globalMultiplier = calculateGlobalMultiplier(startTickState.prestigeMultiplierLevel);

      // 1. Production Logic
      GAME_CONFIG.businesses.forEach((config) => {
        const business = newBusinesses[config.id];
        if (!business.isOwned) return;
        
        const durationMs = config.duration * 1000;
        const unlockMultiplier = getUnlockMultiplier(config.id, business.level);
        const upgradeMultiplier = getUpgradeMultiplier(config.id, startTickState.purchasedUpgrades);

        // Check if work is active
        if (business.workStartTime) {
          const elapsed = now - business.workStartTime;

          if (elapsed >= durationMs) {
            // Job Finished
            const revenuePerCycle = calculateRevenue(
              config.baseRevenue, 
              business.level, 
              globalMultiplier, 
              unlockMultiplier,
              upgradeMultiplier
            );
            
            if (business.isManagerHired) {
              const cycles = Math.floor(elapsed / durationMs);
              const totalRevenue = revenuePerCycle * cycles;
              currentCash += totalRevenue;
              lifetimeEarnings += totalRevenue;
              
              const remainder = elapsed % durationMs;
              newBusinesses[config.id] = {
                ...business,
                workStartTime: now - remainder
              };
            } else {
              currentCash += revenuePerCycle;
              lifetimeEarnings += revenuePerCycle;
              newBusinesses[config.id] = {
                ...business,
                workStartTime: null
              };
            }
            updatedBusinesses = true;
          }
        } else if (business.isManagerHired) {
           newBusinesses[config.id] = {
             ...business,
             workStartTime: now
           };
           updatedBusinesses = true;
        }
      });

      // 2. Auto-Upgrade Logic
      const multiplier = buyMultiplierRef.current;
      GAME_CONFIG.businesses.forEach((config) => {
        const business = newBusinesses[config.id];
        if (business.isOwned && business.isManagerHired && business.isAutoUpgradeEnabled) {
          
          let amountToBuy = 0;
          let cost = 0;

          if (multiplier === 'MAX') {
             amountToBuy = calculateMaxAffordable(config.baseCost, business.level, GAME_CONFIG.costMultiplier, currentCash);
             if (amountToBuy > 0) {
               cost = calculateCumulativeCost(config.baseCost, business.level, GAME_CONFIG.costMultiplier, amountToBuy);
             }
          } else {
             amountToBuy = multiplier;
             cost = calculateCumulativeCost(config.baseCost, business.level, GAME_CONFIG.costMultiplier, amountToBuy);
             
             if (currentCash < cost) {
               amountToBuy = 0;
             }
          }

          if (amountToBuy > 0) {
            currentCash -= cost;
            newBusinesses[config.id] = {
              ...business,
              level: business.level + amountToBuy
            };
            updatedBusinesses = true;
          }
        }
      });

      if (updatedBusinesses || currentCash !== startTickState.cash) {
        setGameState(prev => {
          if (prev.lastResetTime !== startTickState.lastResetTime) {
            return prev;
          }

          return {
            ...prev,
            cash: currentCash,
            lifetimeEarnings: lifetimeEarnings,
            businesses: updatedBusinesses ? newBusinesses : prev.businesses
          };
        });
      }

    }, tickRate);

    return () => clearInterval(interval);
  }, []);

  // Auto-save
  useEffect(() => {
    const saveInterval = setInterval(() => {
      // Save with updated timestamp
      const stateToSave = { ...stateRef.current, lastSaveTime: Date.now() };
      localStorage.setItem(SAVE_KEY, JSON.stringify(stateToSave));
    }, 2000); // Saved every 2s for better safety
    return () => clearInterval(saveInterval);
  }, []);

  const purchaseBusiness = useCallback((businessId: string, amountToBuy: number = 1) => {
    setGameState(prev => {
      const config = GAME_CONFIG.businesses.find(b => b.id === businessId);
      if (!config) return prev;

      const business = prev.businesses[businessId];
      let cost = 0;
      
      if (!business.isOwned) {
        cost = config.unlockCost;
        if (prev.cash >= cost) {
          return {
            ...prev,
            cash: prev.cash - cost,
            businesses: {
              ...prev.businesses,
              [businessId]: { ...business, isOwned: true, level: 1 }
            }
          };
        }
      } else {
        cost = calculateCumulativeCost(config.baseCost, business.level, GAME_CONFIG.costMultiplier, amountToBuy);
        if (prev.cash >= cost) {
           return {
            ...prev,
            cash: prev.cash - cost,
            businesses: {
              ...prev.businesses,
              [businessId]: { ...business, level: business.level + amountToBuy }
            }
          };
        }
      }
      return prev;
    });
  }, []);

  const hireManager = useCallback((businessId: string) => {
    setGameState(prev => {
      const config = GAME_CONFIG.businesses.find(b => b.id === businessId);
      if (!config) return prev;
      
      const business = prev.businesses[businessId];
      if (business.isManagerHired || !business.isOwned) return prev;

      const cost = config.managerCost;
      if (prev.cash >= cost) {
         return {
           ...prev,
           cash: prev.cash - cost,
           businesses: {
             ...prev.businesses,
             [businessId]: {
               ...business,
               isManagerHired: true,
               isAutoUpgradeEnabled: false,
               workStartTime: business.workStartTime || Date.now()
             }
           }
         };
      }
      return prev;
    });
  }, []);

  const purchaseUpgrade = useCallback((upgradeId: string) => {
    setGameState(prev => {
      const upgrade = GAME_UPGRADES.find(u => u.id === upgradeId);
      if (!upgrade) return prev;
      if (prev.purchasedUpgrades[upgradeId]) return prev; // Already owned

      if (prev.cash >= upgrade.cost) {
        return {
          ...prev,
          cash: prev.cash - upgrade.cost,
          purchasedUpgrades: {
            ...prev.purchasedUpgrades,
            [upgradeId]: true
          }
        };
      }
      return prev;
    });
  }, []);

  const toggleAutoUpgrade = useCallback((businessId: string) => {
    setGameState(prev => {
      const business = prev.businesses[businessId];
      if (!business || !business.isManagerHired) return prev;
      return {
        ...prev,
        businesses: {
          ...prev.businesses,
          [businessId]: { ...business, isAutoUpgradeEnabled: !business.isAutoUpgradeEnabled }
        }
      };
    });
  }, []);

  const startWork = useCallback((businessId: string) => {
    setGameState(prev => {
      const business = prev.businesses[businessId];
      if (business.workStartTime !== null) return prev; 
      return {
        ...prev,
        businesses: {
          ...prev.businesses,
          [businessId]: { ...business, workStartTime: Date.now() }
        }
      };
    });
  }, []);

  const prestige = useCallback(() => {
    setGameState(prev => {
      const pointsToGain = calculatePrestigePoints(prev.lifetimeEarnings);
      if (pointsToGain <= 0) return prev;

      const newPrestigePoints = prev.prestigePoints + pointsToGain;

      // Deep clone and reset logic for businesses
      const resetBusinesses = GAME_CONFIG.businesses.reduce((acc, bus) => ({
        ...acc,
        [bus.id]: {
          id: bus.id,
          level: 0,
          isOwned: bus.unlockCost === 0,
          isManagerHired: false,
          isAutoUpgradeEnabled: false,
          workStartTime: null
        }
      }), {} as Record<string, BusinessState>);

      const newState = {
        ...DEFAULT_STATE, // Resets cash, etc.
        lastResetTime: Date.now(), // Update timestamp to invalidate any pending loops
        lastSaveTime: Date.now(),
        prestigePoints: newPrestigePoints,
        prestigeMultiplierLevel: prev.prestigeMultiplierLevel,
        businesses: resetBusinesses,
        purchasedUpgrades: {} 
      };

      // Force save immediately
      localStorage.setItem(SAVE_KEY, JSON.stringify(newState));

      return newState;
    });
  }, []);

  const buyPrestigeUpgrade = useCallback(() => {
    setGameState(prev => {
      const cost = 1; 
      if (prev.prestigePoints >= cost) {
        return {
          ...prev,
          prestigePoints: prev.prestigePoints - cost,
          prestigeMultiplierLevel: prev.prestigeMultiplierLevel + 1
        };
      }
      return prev;
    });
  }, []);

  const resetGame = useCallback(() => {
    localStorage.removeItem(SAVE_KEY);
    setGameState({
       ...DEFAULT_STATE,
       lastResetTime: Date.now(),
       lastSaveTime: Date.now()
    });
    window.location.reload(); 
  }, []);

  const clearOfflineEarnings = useCallback(() => {
    setOfflineEarnings(0);
  }, []);

  return {
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
    clearOfflineEarnings,
    getUnlockMultiplier,
    getUpgradeMultiplier
  };
};