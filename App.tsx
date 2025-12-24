
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { GameState, UserProfile, Team, Vote, GamePhase, TeamStats, ChatMessage } from './types';
import LoginScreen from './components/LoginScreen';
import GameArena from './components/GameArena';
import { generateBattleCommentary } from './commentaryService';
import { supabase } from './supabaseClient';

const PRICE_HISTORY_LIMIT = 60;
const REALISTIC_FALLBACK_PRICE = 96000;

const INITIAL_TEAM_STATS: TeamStats = {
  votesUp: 0,
  votesDown: 0,
  totalVotes: 0,
  stance: 'UNDECIDED',
  conviction: 0
};

const App: React.FC = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isEligible, setIsEligible] = useState(true);
  const [isLeader, setIsLeader] = useState(false);
  const [onlinePlayers, setOnlinePlayers] = useState<any[]>([]);
  
  const [gameState, setGameState] = useState<GameState>({
    phase: 'VOTING',
    phaseEndTime: 0,
    startPrice: 0,
    currentPrice: 0,
    priceSource: 'SIMULATED',
    alphaStats: { ...INITIAL_TEAM_STATS },
    betaStats: { ...INITIAL_TEAM_STATS },
    winner: null,
    commentary: "Connecting to global command core...",
    priceHistory: [],
    chat: []
  });

  const stateRef = useRef(gameState);
  stateRef.current = gameState;

  // --- SUPABASE SETUP ---
  useEffect(() => {
    if (!user) return;

    const channel = supabase.channel('arena_presence', {
      config: { presence: { key: user.id } }
    });

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        const players = Object.values(state).flat();
        setOnlinePlayers(players);
        
        const leaderId = players.map((p: any) => p.user_id).sort()[0];
        setIsLeader(leaderId === user.id);
      })
      .on('broadcast', { event: 'game_tick' }, ({ payload }) => {
        if (!isLeader) {
          setGameState(prev => ({
            ...prev,
            ...payload,
            priceHistory: [...prev.priceHistory, { timestamp: Date.now(), price: payload.currentPrice }].slice(-PRICE_HISTORY_LIMIT)
          }));
        }
      })
      .on('broadcast', { event: 'chat_msg' }, ({ payload }) => {
        setGameState(prev => ({
          ...prev,
          chat: [...prev.chat, payload].slice(-30)
        }));
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({ user_id: user.id, name: user.name, team: user.team });
        }
      });

    return () => { channel.unsubscribe(); };
  }, [user, isLeader]);

  // --- LEADER GAME LOOP ---
  useEffect(() => {
    if (!isLeader || !user) return;

    const tick = async () => {
      const now = new Date();
      const seconds = now.getSeconds();
      const timestamp = now.getTime();

      let price = stateRef.current.currentPrice || REALISTIC_FALLBACK_PRICE;
      let source: 'SIMULATED' | 'BINANCE' | 'COINBASE' = 'SIMULATED';
      try {
        const res = await fetch('https://api.coinbase.com/v2/prices/BTC-USD/spot');
        const data = await res.json();
        price = parseFloat(data.data.amount);
        source = 'COINBASE';
      } catch (e) {
        price += (Math.random() - 0.5) * 50;
      }

      let currentPhase: GamePhase = 'VOTING';
      let phaseEnd = 0;
      if (seconds < 30) { currentPhase = 'VOTING'; phaseEnd = 30 - seconds; }
      else if (seconds < 50) { currentPhase = 'BATTLE'; phaseEnd = 50 - seconds; }
      else { currentPhase = 'RESULT'; phaseEnd = 60 - seconds; }

      const newState = { ...stateRef.current };
      newState.currentPrice = price;
      newState.priceSource = source;
      newState.phase = currentPhase;
      newState.phaseEndTime = timestamp + (phaseEnd * 1000);

      if (seconds === 30) {
        newState.startPrice = price;
        const finalize = (stats: TeamStats) => {
          const upPct = stats.totalVotes > 0 ? (stats.votesUp / stats.totalVotes) * 100 : 50;
          stats.stance = upPct >= 50 ? 'BULL' : 'BEAR';
          stats.conviction = upPct >= 50 ? Math.round(upPct) : Math.round(100 - upPct);
        };
        finalize(newState.alphaStats);
        finalize(newState.betaStats);
        newState.commentary = generateBattleCommentary({
          phase: 'START', priceDelta: 0,
          alphaStance: newState.alphaStats.stance, alphaConviction: newState.alphaStats.conviction,
          betaStance: newState.betaStats.stance, betaConviction: newState.betaStats.conviction
        });
      }

      if (seconds === 50) {
        const up = price > newState.startPrice;
        const aRight = (newState.alphaStats.stance === 'BULL' && up) || (newState.alphaStats.stance === 'BEAR' && !up);
        const bRight = (newState.betaStats.stance === 'BULL' && up) || (newState.betaStats.stance === 'BEAR' && !up);
        if (aRight && !bRight) newState.winner = 'ALPHA';
        else if (bRight && !aRight) newState.winner = 'BETA';
        else if (aRight && bRight) newState.winner = newState.alphaStats.conviction >= newState.betaStats.conviction ? 'ALPHA' : 'BETA';
        else newState.winner = newState.alphaStats.conviction < newState.betaStats.conviction ? 'ALPHA' : 'BETA';
        
        newState.commentary = generateBattleCommentary({
          phase: 'RESOLVED', priceDelta: ((price - newState.startPrice)/newState.startPrice)*100,
          alphaStance: newState.alphaStats.stance, alphaConviction: newState.alphaStats.conviction,
          betaStance: newState.betaStats.stance, betaConviction: newState.betaStats.conviction,
          winner: newState.winner
        });
      }

      if (seconds === 0) {
        newState.alphaStats = { ...INITIAL_TEAM_STATS };
        newState.betaStats = { ...INITIAL_TEAM_STATS };
        newState.winner = null;
        newState.commentary = "Next cycle initialized. Commander link stable.";
      }

      supabase.channel('arena_presence').send({
        type: 'broadcast',
        event: 'game_tick',
        payload: {
          currentPrice: newState.currentPrice,
          priceSource: newState.priceSource,
          phase: newState.phase,
          phaseEndTime: newState.phaseEndTime,
          startPrice: newState.startPrice,
          alphaStats: newState.alphaStats,
          betaStats: newState.betaStats,
          winner: newState.winner,
          commentary: newState.commentary
        }
      });

      setGameState(prev => ({
        ...prev,
        ...newState,
        priceHistory: [...prev.priceHistory, { timestamp, price }].slice(-PRICE_HISTORY_LIMIT)
      }));
    };

    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [isLeader, user]);

  const handleLogin = (name: string) => {
    const id = uuidv4();
    const team: Team = Math.random() > 0.5 ? 'ALPHA' : 'BETA';
    localStorage.setItem('arena_user_id', id);
    localStorage.setItem('arena_user_name', name);
    localStorage.setItem('arena_user_team', team);
    setUser({ id, name, team, currentVote: null });
    setIsEligible(new Date().getSeconds() < 30);
  };

  const handleExit = () => {
    setUser(null);
    localStorage.clear();
  };

  const handleVote = (vote: Vote) => {
    if (gameState.phase !== 'VOTING' || !user || !isEligible) return;
    setUser(u => u ? { ...u, currentVote: vote } : null);
    
    setGameState(prev => {
      const statsKey = user.team === 'ALPHA' ? 'alphaStats' : 'betaStats';
      const stats = { ...prev[statsKey] };
      if (vote === 'UP') stats.votesUp++; else stats.votesDown++;
      stats.totalVotes++;
      return { ...prev, [statsKey]: stats };
    });
  };

  const handleSendMessage = (text: string) => {
    if (!user) return;
    const msg = { id: uuidv4(), sender: user.name, team: user.team, text, timestamp: Date.now() };
    supabase.channel('arena_presence').send({
      type: 'broadcast',
      event: 'chat_msg',
      payload: msg
    });
    setGameState(prev => ({ ...prev, chat: [...prev.chat, msg].slice(-30) }));
  };

  if (!user) return <LoginScreen onLogin={handleLogin} />;

  return (
    <GameArena 
      gameState={gameState} 
      user={user} 
      onVote={handleVote} 
      onSendMessage={handleSendMessage} 
      onExit={handleExit} 
      isEligible={isEligible}
      onlinePlayers={onlinePlayers}
      isLeader={isLeader}
    />
  );
};

export default App;
