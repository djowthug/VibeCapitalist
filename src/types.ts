export interface BusinessConfig {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  baseCost: number;
  baseRevenue: number;
  duration: number; // in seconds
  unlockCost: number;
  managerCost: number;
}

export interface UnlockConfig {
  id: string;
  businessId: string;
  threshold: number;
  multiplier: number;
  name: string;
}

export interface UpgradeConfig {
  id: string;
  businessId: string;
  name: string;
  description: string; // Flavor text like "Little Umbrellas"
  cost: number;
  multiplier: number;
  icon: string; // Emuji or lucide icon name
}

export interface GameConfig {
  gameVersion: string;
  gameName: string;
  currency: string;
  initialCash: number;
  costMultiplier: number;
  businesses: BusinessConfig[];
}

export interface BusinessState {
  id: string;
  level: number;
  isOwned: boolean;
  isManagerHired: boolean; // Prepping for future feature
  isAutoUpgradeEnabled: boolean;
  workStartTime: number | null; // Timestamp when work started, null if idle
}

export interface GameState {
  cash: number;
  lifetimeEarnings: number;
  businesses: Record<string, BusinessState>;
  purchasedUpgrades: Record<string, boolean>; // New: Track owned upgrades
  lastSaveTime: number;
  lastResetTime: number; // New: For concurrency control
  // Prestige System
  prestigePoints: number;
  prestigeMultiplierLevel: number;
}