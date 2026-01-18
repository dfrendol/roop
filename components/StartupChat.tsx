
import React, { useState, useRef, useEffect } from 'react';
import { StartupFailure } from '../types';
import { getStartupChat } from '../services/geminiService';

interface StartupChatProps {
  startup: StartupFailure;
}

const StartupChat: React.FC<StartupChatProps> = ({ startup }) => {
  const sessionKey = `phoenix_chat_v3_${startup.id}`;
  
  const [messages, setMessages] = useState<{ role: 'user' | 'model'; text: string }[]>(() => {
    const saved = sessionStorage.getItem(sessionKey);
    return saved ? JSON.parse(saved) : [];
  });
  
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const chatRef = useRef<any>(null);

  useEffect(() => {
    chatRef.current = getStartupChat(startup.name, startup.description, startup.reasonForFailure);
  }, [startup]);

  useEffect(() => {
    sessionStorage.setItem(sessionKey, JSON.stringify(messages));
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping, sessionKey]);

  const handleSend = async (text: string = inputValue) => {
    if (!text.trim() || isTyping) return;

    const userMsg = { role: 'user' as const, text };
    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsTyping(true);

    try {
      const response = await chatRef.current.sendMessage({ message: text });
      setMessages(prev => [...prev, { role: 'model', text: response.text || "I'm having trouble retrieving that data." }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'model', text: "Connection to the forensic database was lost. Please try again." }]);
    } finally {
      setIsTyping(false);
    }
  };

  const quickQuestions = [
    `Who were ${startup.name}'s competitors?`,
    `What was their biggest mistake?`,
    `Was there any part of the tech that worked?`,
    `Could this work in the current market?`
  ];

  return (
    <div className="flex flex-col h-[600px] bg-[#050505] rounded-3xl border border-zinc-900 overflow-hidden shadow-2xl relative">
      <div className="p-4 border-b border-zinc-900 bg-zinc-950/50 flex items-center justify-between backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-orange-600 animate-pulse"></div>
          <span className="text-[10px] font-black text-orange-600 uppercase tracking-widest">Active Terminal Connection</span>
        </div>
        <button 
          onClick={() => {
            if(confirm("Clear session logs?")) {
              setMessages([]);
              sessionStorage.removeItem(sessionKey);
            }
          }}
          className="text-[9px] font-bold text-zinc-700 hover:text-zinc-400 uppercase tracking-widest transition-colors"
        >
          Clear History
        </button>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-zinc-800">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 rounded-full border border-zinc-900 flex items-center justify-center mb-6 opacity-20">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M2 12h20"/></svg>
            </div>
            <p className="text-zinc-600 text-xs font-bold mb-8 uppercase tracking-widest">Awaiting system query...</p>
            <div className="flex flex-wrap justify-center gap-2 max-w-sm">
              {quickQuestions.map((q, i) => (
                <button 
                  key={i}
                  onClick={() => handleSend(q)}
                  className="text-[10px] bg-zinc-900/50 border border-zinc-800 text-zinc-500 px-4 py-2 rounded-full hover:border-orange-500/50 hover:text-white transition-all font-bold uppercase tracking-widest"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] rounded-2xl px-5 py-3 text-sm leading-relaxed shadow-lg ${
              msg.role === 'user' 
                ? 'bg-orange-600 text-white rounded-tr-none border border-orange-500/20' 
                : 'bg-zinc-900 text-zinc-300 rounded-tl-none border border-zinc-800'
            }`}>
              {msg.text}
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-zinc-900 text-zinc-600 rounded-2xl rounded-tl-none px-5 py-3 flex gap-1.5 items-center border border-zinc-800">
              <span className="w-1.5 h-1.5 bg-zinc-700 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
              <span className="w-1.5 h-1.5 bg-zinc-700 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
              <span className="w-1.5 h-1.5 bg-zinc-700 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
            </div>
          </div>
        )}
      </div>

      <form 
        onSubmit={(e) => { e.preventDefault(); handleSend(); }}
        className="p-5 bg-zinc-950 border-t border-zinc-900 flex gap-3"
      >
        <input 
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="System command..."
          className="flex-1 bg-zinc-900 border border-zinc-800 rounded-2xl px-6 py-4 text-sm text-white focus:outline-none focus:border-orange-500/30 transition-all placeholder:text-zinc-800 font-medium"
        />
        <button 
          type="submit"
          disabled={!inputValue.trim() || isTyping}
          className="bg-orange-600 hover:bg-orange-500 disabled:opacity-50 text-white w-14 h-14 rounded-2xl transition-all shadow-xl shadow-orange-950/20 flex items-center justify-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>
        </button>
      </form>
    </div>
  );
};

export default StartupChat;
