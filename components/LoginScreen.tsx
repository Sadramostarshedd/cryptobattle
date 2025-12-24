import React, { useState } from 'react';
import { X, ShieldAlert, FileText } from 'lucide-react';

interface LoginScreenProps {
  onLogin: (name: string) => void;
  isFull?: boolean;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin, isFull }) => {
  const [name, setName] = useState('');
  const [showRules, setShowRules] = useState(false);
  const [approved, setApproved] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() && approved) onLogin(name.trim());
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 relative overflow-hidden">
      <div className="w-full max-w-md bg-slate-900 border-2 border-green-500/50 p-8 rounded-lg shadow-[0_0_30px_rgba(0,255,65,0.15)] z-10">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-black text-green-400 neon-text-green tracking-tighter mb-2 italic">CRYPTO BATTLE ARENA</h1>
          <p className="text-slate-500 text-xs tracking-widest uppercase font-bold">5v5 Squad Prediction Warfare</p>
        </div>
        
        {isFull && (
          <div className="mb-6 p-3 bg-red-900/30 border border-red-500 text-red-400 text-[10px] font-bold uppercase tracking-widest animate-pulse flex items-center gap-2">
            <ShieldAlert size={16} />
            <span>[ERROR] Arena Capacity Reached.</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-[10px] text-green-500 font-bold uppercase mb-2 tracking-widest">Player Name</label>
            <input 
              autoFocus
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="ENTER_ID"
              maxLength={12}
              className="w-full bg-black border border-slate-700 p-4 text-green-400 focus:outline-none focus:border-green-400 transition-colors placeholder:text-slate-800 font-mono"
            />
          </div>

          <div className="flex flex-col gap-4">
            <button 
              type="button"
              onClick={() => setShowRules(true)}
              className="w-full border border-amber-500/50 text-amber-500 text-[10px] font-bold p-3 hover:bg-amber-500/10 transition-colors flex items-center justify-center gap-2 uppercase tracking-widest rounded"
            >
              <FileText size={14} />
              Read Rules of Engagement
            </button>

            <label className="flex items-center gap-3 cursor-pointer group">
              <input 
                type="checkbox" 
                checked={approved}
                onChange={(e) => setApproved(e.target.checked)}
                className="w-4 h-4 rounded border-slate-700 bg-black text-green-500 focus:ring-green-500 focus:ring-offset-black"
              />
              <span className="text-[10px] text-slate-400 uppercase font-bold group-hover:text-slate-200 transition-colors">
                I accept the mission parameters
              </span>
            </label>
          </div>
          
          <button 
            type="submit"
            disabled={!name.trim() || !approved || isFull}
            className="w-full bg-green-500 text-black font-black p-4 hover:bg-green-400 transition-all active:scale-95 disabled:opacity-30 disabled:grayscale disabled:scale-100 uppercase tracking-widest shadow-[0_0_15px_rgba(0,255,65,0.4)] rounded"
          >
            START THE BATTLE
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-800 grid grid-cols-2 gap-4 text-[9px] text-slate-600 uppercase font-bold tracking-widest">
          <div>&gt; SQUAD: 5v5</div>
          <div className="text-right">&gt; AUTO-LOCK: ACTIVE</div>
          <div>&gt; SYNC: ATOMIC</div>
          <div className="text-right">&gt; VER: 1.2.0-STATIC</div>
        </div>
      </div>

      {/* RULES MODAL */}
      {showRules && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-slate-900 border-2 border-amber-500/50 rounded shadow-[0_0_50px_rgba(245,158,11,0.15)] overflow-hidden">
            <div className="p-4 border-b border-amber-500/30 bg-amber-500/10 flex justify-between items-center">
              <h2 className="text-amber-500 font-bold text-xs uppercase tracking-[0.3em]">Briefing: Arena Rules</h2>
              <button onClick={() => setShowRules(false)} className="text-amber-500 hover:text-white">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 space-y-5 text-xs text-slate-300 uppercase tracking-widest leading-relaxed">
              <div className="flex gap-3">
                <span className="text-amber-500 font-bold shrink-0">[01]</span>
                <p><span className="text-white font-bold">5v5 SQUADS:</span> ALL MATCHES ARE STRICTLY 5V5. BOTS AUTO-FILL EMPTY SLOTS TO ENSURE SYNC.</p>
              </div>
              <div className="flex gap-3">
                <span className="text-amber-500 font-bold shrink-0">[02]</span>
                <p><span className="text-white font-bold">STANCE LOCK:</span> 30 SECONDS TO VOTE BULL OR BEAR. MISSING THE 29S MARK TRIGGERS AN AUTO-VOTE PROTOCOL.</p>
              </div>
              <div className="flex gap-3">
                <span className="text-amber-500 font-bold shrink-0">[03]</span>
                <p><span className="text-white font-bold">CONFLICT:</span> AFTER VOTING, A 20-SECOND LIVE BATTLE COMMENCES. RESULTS ARE FINALIZED AT 60S.</p>
              </div>
              <div className="flex gap-3">
                <span className="text-amber-500 font-bold shrink-0">[04]</span>
                <p><span className="text-white font-bold">VICTORY:</span> SECURE THE WIN THROUGH DIRECTIONAL ACCURACY AND HIGHER SQUAD CONVICTION.</p>
              </div>

              <button 
                onClick={() => { setShowRules(false); setApproved(true); }}
                className="w-full bg-amber-500 text-black font-black p-3 hover:bg-amber-400 transition-colors uppercase tracking-widest mt-2 rounded"
              >
                Accept & Synchronize
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoginScreen;