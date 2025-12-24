
import React from 'react';
import { GameState } from '../types';

interface ProgressBarProps {
  gameState: GameState;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ gameState }) => {
  const { startPrice, currentPrice, alphaStats, betaStats } = gameState;
  
  // Normalized delta: 50% is center. 
  // If Alpha is BULL and price is UP, it moves towards Alpha.
  // We need a scale. Let's say a 0.1% move is a full bar shift.
  const deltaPct = ((currentPrice - startPrice) / startPrice) * 100;
  const sensitivity = 500; // Multiplier to make small crypto moves look big in tug of war
  
  // Determine direction based on stance
  // If Alpha is BULL, Alpha gains if deltaPct > 0
  // If Beta is BEAR, Beta gains if deltaPct < 0
  
  let alphaPower = 0;
  let betaPower = 0;

  if (alphaStats.stance === 'BULL') alphaPower = deltaPct;
  else alphaPower = -deltaPct;

  if (betaStats.stance === 'BULL') betaPower = deltaPct;
  else betaPower = -deltaPct;

  // Final offset (0 to 100, 50 is center)
  // Let's simplify: 
  // Center is Neutral.
  // If price is above start, BULLS are winning.
  // If Alpha is BULL and Beta is BEAR, price UP = Alpha wins, price DOWN = Beta wins.
  
  let shift = 0;
  const isUp = currentPrice > startPrice;
  
  if (alphaStats.stance !== betaStats.stance) {
    // Tug of war!
    shift = deltaPct * sensitivity;
  } else {
    // Both same stance - tug of war based on conviction!
    const convictionDiff = alphaStats.conviction - betaStats.conviction;
    shift = convictionDiff + (deltaPct * sensitivity);
  }

  const clampedShift = Math.max(-45, Math.min(45, shift));
  const position = 50 - clampedShift;

  return (
    <div className="w-full">
      <div className="flex justify-between mb-2 text-[10px] text-slate-500 uppercase font-bold tracking-widest">
        <span>Team Alpha</span>
        <span>Neutral Zone</span>
        <span>Team Beta</span>
      </div>
      <div className="relative h-12 bg-slate-900 border border-slate-800 rounded-full overflow-hidden shadow-inner flex items-center">
        {/* CENTER LINE */}
        <div className="absolute left-1/2 top-0 bottom-0 w-px bg-slate-700 z-10" />
        
        {/* THE ROPE / TUG INDICATOR */}
        <div 
          className="absolute h-full transition-all duration-1000 ease-out flex items-center justify-center"
          style={{ left: `${position}%`, transform: 'translateX(-50%)' }}
        >
          <div className="w-4 h-4 rounded-full bg-white neon-border animate-pulse" />
          <div className="absolute top-full mt-1 text-[10px] font-bold text-white whitespace-nowrap bg-black/50 px-1 rounded">
             {deltaPct > 0 ? '▲' : '▼'} {Math.abs(deltaPct).toFixed(4)}%
          </div>
        </div>

        {/* GRADIENTS */}
        <div className="absolute inset-0 flex">
           <div className="flex-1 bg-gradient-to-r from-blue-900/20 to-transparent" />
           <div className="flex-1 bg-gradient-to-l from-purple-900/20 to-transparent" />
        </div>
      </div>
    </div>
  );
};

export default ProgressBar;
