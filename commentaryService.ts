
export interface BattleContext {
  phase: 'START' | 'PROGRESS' | 'RESOLVED';
  priceDelta: number;
  alphaStance: string;
  alphaConviction: number;
  betaStance: string;
  betaConviction: number;
  winner?: string;
}

const START_PHRASES = [
  "Neural link established. Sector conflict initiated.",
  "Squad markers locked. Tactical grid online.",
  "Liquidity grab protocol active. Stand by for impact.",
  "Executing directional scan. Vector shift imminent.",
  "Signal noise filtering. High-octane pressure detected."
];

const BULLISH_WINS = [
  "Upper sector secured. Market pressure yielded to the Bulls.",
  "Signal verified. Alpha-cycle momentum successfully captured.",
  "Resistance bypassed. Bullish conviction overrode the grid.",
  "Liquidity secured. Uplink confirms a clean upward break.",
  "Vector shift complete. The sector has gone green."
];

const BEARISH_WINS = [
  "Lower sector locked. Bearish pressure collapsed the grid.",
  "Short-side breach confirmed. Market gravity taking hold.",
  "Downward trajectory locked. Tactical advantage: Bears.",
  "Liquidity drained. The sector has surrendered to the void.",
  "Sector red-line reached. Bearish dominance verified."
];

const STALEMATE_PHRASES = [
  "Conflict unresolved. High-frequency noise preventing lock.",
  "Grid collision detected. Resulting in a neural stalemate.",
  "Tactical parity achieved. No clear directional winner.",
  "Signal interference too high. Sector remains neutral."
];

export const generateBattleCommentary = (context: BattleContext): string => {
  const getRandom = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)];

  if (context.phase === 'START') {
    return getRandom(START_PHRASES);
  }

  if (context.phase === 'RESOLVED') {
    if (!context.winner || context.winner === 'DRAW') {
      return getRandom(STALEMATE_PHRASES);
    }
    
    // Determine if it was a Bull or Bear win based on price delta
    if (context.priceDelta > 0) {
      return getRandom(BULLISH_WINS);
    } else {
      return getRandom(BEARISH_WINS);
    }
  }

  // Fallback for progress
  return `Vector Delta: ${context.priceDelta.toFixed(4)}%. Monitoring sector pressure...`;
};
