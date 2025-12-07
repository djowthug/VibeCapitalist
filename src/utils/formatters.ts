export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    notation: 'compact',
    maximumFractionDigits: 2,
  }).format(amount);
};

export const formatTime = (seconds: number): string => {
  if (seconds < 60) return `${Math.ceil(seconds)}s`;
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.ceil(seconds % 60);
  if (minutes < 60) return `${minutes}m ${remainingSeconds}s`;
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return `${hours}h ${remainingMinutes}m`;
};

// Cost of the NEXT single item
export const calculateNextCost = (baseCost: number, currentLevel: number, multiplier: number): number => {
  return baseCost * Math.pow(multiplier, currentLevel);
};

// Revenue now includes global multiplier AND business unlock multiplier AND upgrade multiplier
export const calculateRevenue = (
  baseRevenue: number, 
  level: number, 
  globalMultiplier: number = 1,
  unlockMultiplier: number = 1,
  upgradeMultiplier: number = 1
): number => {
  return baseRevenue * level * globalMultiplier * unlockMultiplier * upgradeMultiplier;
};

// Geometric Series Sum: Cost to buy 'count' items starting from 'currentLevel'
// Formula: Base * r^L * ( (r^count - 1) / (r - 1) )
export const calculateCumulativeCost = (
  baseCost: number, 
  currentLevel: number, 
  multiplier: number, 
  count: number
): number => {
  const priceAtCurrentLevel = calculateNextCost(baseCost, currentLevel, multiplier);
  return priceAtCurrentLevel * ((Math.pow(multiplier, count) - 1) / (multiplier - 1));
};

// Calculate maximum items affordable with current cash
export const calculateMaxAffordable = (
  baseCost: number,
  currentLevel: number,
  multiplier: number,
  currentCash: number
): number => {
  const priceAtCurrentLevel = calculateNextCost(baseCost, currentLevel, multiplier);
  
  if (currentCash < priceAtCurrentLevel) return 0;

  // Derived from geometric sum formula solved for 'count'
  // count = log_r ( 1 + (cash * (r-1) / priceAtL) )
  const count = Math.floor(
    Math.log(1 + (currentCash * (multiplier - 1)) / priceAtCurrentLevel) / Math.log(multiplier)
  );
  
  return Math.max(0, count);
};

// Prestige Constants
// DIFFICULTY ADJUSTMENT: Set to 10,000,000
// Formula: Points = Sqrt(LifetimeEarnings / 10,000,000)
export const PRESTIGE_DIVISOR = 10000000; 
export const PRESTIGE_MULTIPLIER_PER_LEVEL = 0.5; // 50% boost per level

export const calculatePrestigePoints = (lifetimeEarnings: number): number => {
  // 1 Point for every 10M earned (square root curve to prevent runaway inflation)
  if (lifetimeEarnings < PRESTIGE_DIVISOR) return 0;
  return Math.floor(Math.sqrt(lifetimeEarnings / PRESTIGE_DIVISOR));
};

export const calculateGlobalMultiplier = (level: number): number => {
  return 1 + (level * PRESTIGE_MULTIPLIER_PER_LEVEL);
};