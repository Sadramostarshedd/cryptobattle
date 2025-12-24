
import React, { useEffect, useState } from 'react';
import { GameState, UserProfile, Vote } from '../types';
import LiveChart from './LiveChart';
import ChatBox from './ChatBox';
import ProgressBar from './ProgressBar';
import { LogOut, Radio, Cpu, Users, ShieldCheck } from 'lucide-react';

interface GameArenaProps {
  gameState: GameState;
  user: UserProfile;
  onVote: (vote: Vote) => void;
  onSendMessage: (text: string) => void;
  onExit: () => void;
  isEligible: boolean;
  onlinePlayers: any[];
  isLeader: boolean;
}

const GameArena: React.FC<GameArenaProps> = ({ gameState, user, onVote, onSendMessage, onExit, isEligible, onlinePlayers, isLeader }) => {
  const timeLeft = Math.max(0, Math.floor((gameState.phaseEndTime - Date.now()) / 1000));
  const [commentaryKey, setCommentaryKey] = useState(0);

  useEffect(() => {
    setCommentaryKey(prev => prev + 1);
  }, [gameState.commentary]);

  const isUp = gameState.currentPrice >= gameState.startPrice;

  return (
    <div className="max-w-7xl mx-auto w-full p-4 flex flex-col h-screen max-h-screen gap-4 overflow-hidden">
      {/* HEADERBAR */}
      <header className="flex justify-between items-center bg-slate-900 border border-slate-800 p-4 rounded shadow-xl shrink-0">
        <div className="flex items-center gap-6">
          <h2 className="text-2xl font-black text-green-400 italic leading-none">CBA</h2>
          <div className="h-8 w-px bg-slate-800" />
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-slate-500 uppercase font-bold">Price Index</span>
              <span className={`text-[8px] font-black px-1 rounded flex items-center gap-1 ${gameState.priceSource === 'SIMULATED' ? 'bg-red-500/20 text-red-500' : 'bg-green-500/20 text-green-400 animate-pulse'}`}>
                <Radio size={8} />
                [VIA_{gameState.priceSource}]
              </span>
            </div>
            <span className={`text-xl font-bold leading-none tabular-nums transition-colors duration-300 ${isUp ? 'text-green-400' : 'text-red-500'}`}>
              BTC ${gameState.currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        <div className="flex gap-4 items-center">
          <div className="flex flex-col items-end mr-2">
             <span className="text-[9px] text-slate-500 font-bold uppercase flex items-center gap-1">
               {isLeader ? <ShieldCheck size={10} className="text-amber-500" /> : <Users size={10} />}
               {isLeader ? 'COMMANDER_NODE' : 'SLAVE_NODE'}
             </span>
             <span className="text-[10px] text-green-400 font-black tracking-widest uppercase">{onlinePlayers.length} UNITS SYNCED</span>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-slate-500 block uppercase font-bold">{gameState.phase} PHASE</span>
            <span className="text-2xl font-black text-white">{timeLeft}s</span>
          </div>
          <div className="h-10 w-px bg-slate-800 mx-2" />
          <div className={`p-2 border rounded ${user.team === 'ALPHA' ? 'border-blue-500/50 text-blue-400' : 'border-purple-500/50 text-purple-400'}`}>
            <span className="text-[8px] block uppercase opacity-70">Squad</span>
            <span className="font-bold text-sm tracking-widest">{user.team}</span>
          </div>
          <button onClick={onExit} className="p-2 text-slate-500 hover:text-red-400 transition-colors rounded-lg hover:bg-slate-800">
            <LogOut size={20} />
          </button>
        </div>
      </header>

      {/* MAIN GRID */}
      <div className="grid grid-cols-12 gap-4 flex-1 overflow-hidden min-h-0">
        
        {/* LEFT COLUMN: CHART & ACTION */}
        <div className="col-span-12 lg:col-span-8 flex flex-col gap-4 overflow-hidden h-full">
          <div className="bg-slate-900 border border-slate-800 rounded p-4 flex-1 flex flex-col min-h-0">
             <LiveChart data={gameState.priceHistory} startPrice={gameState.startPrice} phase={gameState.phase} />
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded p-6 relative overflow-hidden shrink-0">
            {gameState.phase === 'VOTING' && (
              <div className="flex flex-col gap-6">
                <div className="text-center">
                  <h4 className="text-sm font-bold text-slate-300 uppercase tracking-widest mb-4">Select Prediction Stance</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <button 
                      onClick={() => onVote('UP')}
                      disabled={!isEligible}
                      className={`p-4 border-2 rounded transition-all flex flex-col items-center gap-1 group ${user.currentVote === 'UP' ? 'bg-green-500 border-white text-black' : 'bg-slate-950 border-green-500/30 text-green-400 hover:border-green-400 disabled:opacity-30'}`}
                    >
                      <span className="text-2xl">▲</span>
                      <span className="font-bold uppercase tracking-widest">BULLISH</span>
                    </button>
                    <button 
                      onClick={() => onVote('DOWN')}
                      disabled={!isEligible}
                      className={`p-4 border-2 rounded transition-all flex flex-col items-center gap-1 group ${user.currentVote === 'DOWN' ? 'bg-red-500 border-white text-black' : 'bg-slate-950 border-red-500/30 text-red-500 hover:border-red-500 disabled:opacity-30'}`}
                    >
                      <span className="text-2xl">▼</span>
                      <span className="font-bold uppercase tracking-widest">BEARISH</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {(gameState.phase === 'BATTLE' || gameState.phase === 'RESULT') && (
              <div className="flex flex-col gap-6 animate-in slide-in-from-bottom-2 duration-300">
                <ProgressBar gameState={gameState} />
                <div className="p-4 bg-black/60 border border-slate-800 rounded flex gap-4 items-start relative overflow-hidden group">
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-green-500" />
                  <Cpu className="text-green-500 shrink-0 mt-0.5" size={18} />
                  <div className="flex flex-col gap-1">
                    <span className="text-[9px] font-black text-green-600 uppercase tracking-widest">[ARENA_VOICE_CORE]</span>
                    <p key={commentaryKey} className="text-xs italic text-green-400 font-mono tracking-tight leading-relaxed animate-commentary-glitch">
                      {gameState.commentary}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: STATS & CHAT */}
        <div className="col-span-12 lg:col-span-4 flex flex-col gap-4 overflow-hidden h-full min-h-0">
          <div className="bg-slate-900 border border-slate-800 rounded p-4 shrink-0">
            <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">Live Squad Intel</h4>
            <div className="grid grid-cols-2 gap-4">
              <TeamMiniPanel name="ALPHA" stats={gameState.alphaStats} isUserTeam={user.team === 'ALPHA'} />
              <TeamMiniPanel name="BETA" stats={gameState.betaStats} isUserTeam={user.team === 'BETA'} />
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded flex-1 flex flex-col overflow-hidden min-h-0">
            <ChatBox messages={gameState.chat} userTeam={user.team} onSend={onSendMessage} />
          </div>
        </div>
      </div>

      {/* RESULT OVERLAY */}
      {gameState.phase === 'RESULT' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in duration-500">
          <div className="bg-slate-900 border-2 border-green-500/50 p-12 rounded-xl text-center max-w-lg w-full shadow-[0_0_80px_rgba(0,255,65,0.2)]">
            <h2 className="text-slate-500 text-[10px] tracking-[0.4em] uppercase mb-4 font-bold">Conflict Resolution Report</h2>
            <div className="text-5xl font-black text-white mb-8 italic uppercase tracking-tighter">
              {gameState.winner === 'ALPHA' ? 'ALPHA WINS' : gameState.winner === 'BETA' ? 'BETA WINS' : 'STALEMATE'}
            </div>
            <div className="text-[10px] text-slate-500 animate-pulse uppercase tracking-[0.3em] font-bold">Recalibrating for next mission: {timeLeft}s</div>
          </div>
        </div>
      )}
    </div>
  );
};

const TeamMiniPanel: React.FC<{ name: string; stats: any; isUserTeam: boolean }> = ({ name, stats, isUserTeam }) => {
  return (
    <div className={`p-3 rounded border transition-all duration-300 ${isUserTeam ? 'border-blue-500/50 bg-blue-500/5 shadow-[inset_0_0_10px_rgba(59,130,246,0.1)]' : 'border-slate-800 bg-slate-950/50'}`}>
      <div className="flex justify-between mb-2 border-b border-slate-800/50 pb-1">
        <span className={`text-[9px] font-black uppercase tracking-widest ${isUserTeam ? 'text-blue-400' : 'text-slate-600'}`}>{name}</span>
      </div>
      <div className="flex justify-between items-end">
        <div className="flex flex-col">
          <span className="text-[8px] text-green-700 font-black mb-1">BULL</span>
          <span className="font-bold text-lg text-green-400 tabular-nums">{stats.votesUp}</span>
        </div>
        <div className="h-4 w-px bg-slate-800 mb-1" />
        <div className="flex flex-col items-end">
          <span className="text-[8px] text-red-800 font-black mb-1">BEAR</span>
          <span className="font-bold text-lg text-red-500 tabular-nums">{stats.votesDown}</span>
        </div>
      </div>
    </div>
  );
};

export default GameArena;
