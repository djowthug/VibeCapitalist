import { GameConfig, UnlockConfig, UpgradeConfig } from './types';

export const GAME_CONFIG: GameConfig = {
  "gameVersion": "1.0.0",
  "gameName": "Vibe Capitalist",
  "currency": "$",
  "initialCash": 10,
  "costMultiplier": 1.15,
  "businesses": [
    {
      "id": "freelancer",
      "name": "Freelancer",
      "description": "Start small, dream big",
      "icon": "💼",
      "category": "hustle",
      "baseCost": 10,
      "baseRevenue": 15,
      "duration": 0.6,
      "unlockCost": 0,
      "managerCost": 500
    },
    {
      "id": "coffee_shop",
      "name": "Coffee Shop",
      "description": "Brewing profits one cup at a time",
      "icon": "☕",
      "category": "hustle",
      "baseCost": 500,
      "baseRevenue": 650,
      "duration": 5,
      "unlockCost": 500,
      "managerCost": 10000
    },
    {
      "id": "tech_startup",
      "name": "Tech Startup",
      "description": "Disrupt the market",
      "icon": "🚀",
      "category": "innovation",
      "baseCost": 50000,
      "baseRevenue": 60000,
      "duration": 30,
      "unlockCost": 50000,
      "managerCost": 1000000
    },
    {
      "id": "investment_fund",
      "name": "Investment Fund",
      "description": "Let money work for you",
      "icon": "📈",
      "category": "finance",
      "baseCost": 5000000,
      "baseRevenue": 5500000,
      "duration": 300,
      "unlockCost": 5000000,
      "managerCost": 100000000
    },
    {
      "id": "global_corporation",
      "name": "Global Corporation",
      "description": "Empire building at scale",
      "icon": "🏢",
      "category": "enterprise",
      "baseCost": 500000000,
      "baseRevenue": 525000000,
      "duration": 3600,
      "unlockCost": 500000000,
      "managerCost": 10000000000
    },
    {
      "id": "quantum_computing",
      "name": "Quantum Computing",
      "description": "The future is now",
      "icon": "⚛️",
      "category": "future-tech",
      "baseCost": 100000000000,
      "baseRevenue": 102000000000,
      "duration": 43200,
      "unlockCost": 100000000000,
      "managerCost": 2000000000000
    }
  ]
};

// Unlocks (Quantity based)
export const GAME_UNLOCKS: UnlockConfig[] = [];
GAME_CONFIG.businesses.forEach(b => {
  const milestones = [25, 50, 100, 200, 300, 400];
  milestones.forEach(level => {
    GAME_UNLOCKS.push({
      id: `${b.id}_${level}`,
      businessId: b.id,
      threshold: level,
      multiplier: 2,
      name: `${b.name} Profits x2`
    });
  });
});

// Upgrades (Cash based)
export const GAME_UPGRADES: UpgradeConfig[] = [
  // Freelancer
  { id: "upg_freelancer_1", businessId: "freelancer", name: "Ergonomic Chair", description: "Freelancer profit x3", cost: 2500, multiplier: 3, icon: "🪑" },
  { id: "upg_freelancer_2", businessId: "freelancer", name: "Mechanical Keyboard", description: "Freelancer profit x3", cost: 10000, multiplier: 3, icon: "⌨️" },
  
  // Coffee Shop
  { id: "upg_coffee_1", businessId: "coffee_shop", name: "Fair Trade Beans", description: "Coffee Shop profit x3", cost: 25000, multiplier: 3, icon: "🫘" },
  { id: "upg_coffee_2", businessId: "coffee_shop", name: "Espresso Machine", description: "Coffee Shop profit x3", cost: 100000, multiplier: 3, icon: "⚙️" },

  // Tech Startup
  { id: "upg_startup_1", businessId: "tech_startup", name: "Ping Pong Table", description: "Tech Startup profit x3", cost: 1000000, multiplier: 3, icon: "🏓" },
  { id: "upg_startup_2", businessId: "tech_startup", name: "Free Snacks", description: "Tech Startup profit x3", cost: 5000000, multiplier: 3, icon: "🍕" },

  // Investment Fund
  { id: "upg_fund_1", businessId: "investment_fund", name: "Insider Trading", description: "Investment Fund profit x3", cost: 50000000, multiplier: 3, icon: "🤫" },
  
  // Global Corp
  { id: "upg_corp_1", businessId: "global_corporation", name: "Tax Haven", description: "Global Corp profit x3", cost: 5000000000, multiplier: 3, icon: "🏝️" },

  // Quantum
  { id: "upg_quantum_1", businessId: "quantum_computing", name: "Cold Fusion", description: "Quantum profit x3", cost: 1000000000000, multiplier: 3, icon: "❄️" },
];

export const SAVE_KEY = 'vibe_capitalist_save_v1';