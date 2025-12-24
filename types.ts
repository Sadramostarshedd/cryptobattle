export type Team = 'ALPHA' | 'BETA';
export type Stance = 'BULL' | 'BEAR' | 'UNDECIDED';
export type Vote = 'UP' | 'DOWN' | null;
export type GamePhase = 'VOTING' | 'BATTLE' | 'RESULT';

export interface PricePoint {
  timestamp: number;
  price: number;
}

export interface ChatMessage {
  id: string;
  sender: string;
  team: Team;
  text: string;
  timestamp: number;
}

export interface TeamStats {
  votesUp: number;
  votesDown: number;
  totalVotes: number;
  stance: Stance;
  conviction: number;
}

export interface GameState {
  phase: GamePhase;
  phaseEndTime: number;
  startPrice: number;
  currentPrice: number;
  priceSource: 'BINANCE' | 'COINBASE' | 'SIMULATED';
  alphaStats: TeamStats;
  betaStats: TeamStats;
  winner: Team | 'DRAW' | null;
  commentary: string;
  priceHistory: PricePoint[];
  chat: ChatMessage[];
}

export interface UserProfile {
  id: string;
  name: string;
  team: Team;
  currentVote: Vote;
}