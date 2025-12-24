
import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, Team } from '../types';

interface ChatBoxProps {
  messages: ChatMessage[];
  userTeam: Team;
  onSend: (text: string) => void;
}

const ChatBox: React.FC<ChatBoxProps> = ({ messages, userTeam, onSend }) => {
  const [text, setText] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim()) {
      onSend(text.trim());
      setText('');
    }
  };

  // Only show messages from the same team
  const filteredMessages = messages.filter(m => m.team === userTeam);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="p-3 border-b border-slate-800 bg-black/20 flex justify-between items-center shrink-0">
        <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Secure Comms [Team {userTeam}]</h4>
        <span className="text-[8px] text-green-600 animate-pulse italic">ENCRYPTED</span>
      </div>
      
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-3 bg-black/10"
      >
        {filteredMessages.length === 0 ? (
          <div className="text-[10px] text-slate-700 text-center mt-4">NO INCOMING TRANSMISSIONS</div>
        ) : (
          filteredMessages.map((msg) => (
            <div key={msg.id} className="animate-in fade-in slide-in-from-right-1">
              <div className="flex gap-2 items-baseline">
                <span className={`text-[9px] font-bold uppercase ${msg.team === 'ALPHA' ? 'text-blue-400' : 'text-purple-400'}`}>
                  {msg.sender}
                </span>
                <span className="text-[8px] text-slate-600">
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </span>
              </div>
              <p className="text-xs text-slate-300 break-words leading-tight mt-1">{msg.text}</p>
            </div>
          ))
        )}
      </div>

      <form onSubmit={handleSubmit} className="p-3 border-t border-slate-800 bg-slate-900 shrink-0">
        <div className="flex gap-2">
          <input 
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="TYPE_MESSAGE..."
            className="flex-1 bg-black border border-slate-800 px-3 py-2 text-xs text-green-400 focus:outline-none focus:border-green-600 placeholder:text-slate-800"
          />
          <button 
            type="submit"
            className="bg-slate-800 hover:bg-slate-700 text-white text-[10px] font-bold px-4 py-2 uppercase transition-colors"
          >
            SEND
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatBox;
