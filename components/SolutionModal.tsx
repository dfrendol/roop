
import React, { useState, useEffect } from 'react';
import { StartupFailure, Solution, AIAnalysis } from '../types';
import { evaluateSolution, analyzeFailure } from '../services/geminiService';
import StartupChat from './StartupChat';
import SolutionItem from './SolutionItem';
import { upsertStartup } from '../services/startups';
import logo from '../logo.png';

interface SolutionModalProps {
  startup: StartupFailure;
  onClose: () => void;
  onAddSolution: (id: string, solution: Solution) => void;
  onVoteSolution: (startupId: string, solutionId: string, type: 'like' | 'dislike', previousVote: 'like' | 'dislike' | null) => void;
  onVoteReply: (startupId: string, solutionId: string, replyId: string, type: 'like' | 'dislike', previousVote: 'like' | 'dislike' | null) => void;
  onAddReply: (startupId: string, solutionId: string, content: string, parentReplyId?: string) => void;
}

const SolutionModal: React.FC<SolutionModalProps> = ({ startup, onClose, onAddSolution, onVoteSolution, onVoteReply, onAddReply }) => {
  const [activeTab, setActiveTab] = useState<'info' | 'chat'>('info');
  const [solutionText, setSolutionText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysis | null>(null);
  const [isLoadingAnalysis, setIsLoadingAnalysis] = useState(false);

  useEffect(() => {
    const fetchAnalysis = async () => {
      if (startup.aiAnalysis) {
        setAiAnalysis(startup.aiAnalysis);
        return;
      }


      setIsLoadingAnalysis(true);
        try {
          const analysis = await analyzeFailure(startup.description, startup.reasonForFailure);
          setAiAnalysis(analysis);

          // ✅ Persist into Firestore on the startup doc
          await upsertStartup({
            ...startup,
            aiAnalysis: analysis,
          });
        } catch (err) {
          console.error("AI Analysis failed", err);
        } finally {
          setIsLoadingAnalysis(false);
        }
      };

      fetchAnalysis();
    }, [startup.id]); // ✅ stable

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!solutionText.trim()) return;

      setIsSubmitting(true);
      try {
        const evaluation = await evaluateSolution(startup.description, solutionText);
        const newSolution: Solution = {
          id: Math.random().toString(36).substr(2, 9),
          author: "Phoenix Pilot",
          content: solutionText,
          timestamp: Date.now(),
          aiScore: evaluation.score,
          aiFeedback: evaluation.feedback,
          likes: 0,
          dislikes: 0,
          replies: []
        };
        onAddSolution(startup.id, newSolution);
        setSolutionText('');
      } catch (err) {
        alert("Evaluation failed. Please try again.");
      } finally {
        setIsSubmitting(false);
      }
    };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95 backdrop-blur-xl overflow-y-auto">
      <div className="bg-zinc-950 w-full max-w-6xl rounded-[2.5rem] border border-zinc-900 shadow-[0_0_150px_rgba(0,0,0,0.9)] overflow-hidden my-auto ring-1 ring-white/5">
        <div className="flex flex-col lg:flex-row h-full max-h-[90vh]">
          {/* Left Side: Intelligence Terminal */}
          <div className="lg:w-1/2 p-10 border-b lg:border-b-0 lg:border-r border-zinc-900 overflow-y-auto bg-gradient-to-br from-zinc-950 via-black to-black">
            <div className="flex justify-between items-center mb-10">
              <button onClick={onClose} className="text-zinc-600 hover:text-white flex items-center gap-2 text-[10px] font-black transition-all uppercase tracking-[0.3em] group">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="group-hover:-translate-x-1 transition-transform"><path d="m15 18-6-6 6-6"/></svg>
                Exit Case
              </button>
              <div className="flex bg-zinc-900/50 p-1.5 rounded-2xl border border-zinc-900">
                <button 
                  onClick={() => setActiveTab('info')}
                  className={`px-6 py-2 text-[10px] font-black rounded-xl transition-all uppercase tracking-widest ${activeTab === 'info' ? 'bg-orange-600 text-white shadow-xl shadow-orange-950/20' : 'text-zinc-600 hover:text-zinc-300'}`}
                >
                  Post-Mortem
                </button>
                <button 
                  onClick={() => setActiveTab('chat')}
                  className={`px-6 py-2 text-[10px] font-black rounded-xl transition-all uppercase tracking-widest ${activeTab === 'chat' ? 'bg-orange-600 text-white shadow-xl shadow-orange-950/20' : 'text-zinc-600 hover:text-zinc-300'}`}
                >
                  Forensics
                </button>
              </div>
            </div>
            
            {activeTab === 'info' ? (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="mb-12">
                  <h2 className="text-5xl lg:text-6xl font-black mb-4 text-white tracking-tighter uppercase leading-[0.9]">{startup.name}</h2>
                  <div className="flex gap-3">
                    <span className="px-4 py-1.5 bg-zinc-900 rounded-full text-[10px] font-bold tracking-[0.2em] text-zinc-500 uppercase border border-zinc-800/50">{startup.industry}</span>
                    <span className="px-4 py-1.5 bg-orange-600/10 rounded-full text-[10px] font-bold tracking-[0.2em] text-orange-500 uppercase border border-orange-500/20">{startup.founded} - {startup.defunct}</span>
                  </div>
                </div>

                {isLoadingAnalysis ? (
                   <div className="space-y-8">
                     <div className="h-64 bg-zinc-900/30 rounded-[2rem] animate-pulse border border-zinc-800/30"></div>
                     <div className="grid grid-cols-2 gap-4">
                        <div className="h-24 bg-zinc-900/30 rounded-2xl animate-pulse"></div>
                        <div className="h-24 bg-zinc-900/30 rounded-2xl animate-pulse"></div>
                     </div>
                   </div>
                ) : aiAnalysis && (
                  <div className="space-y-12 pb-10">
                    <section className="relative p-8 bg-zinc-900/30 rounded-[2rem] border border-zinc-900/50 backdrop-blur-sm group overflow-hidden">
                      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-600 to-amber-500 opacity-50"></div>
                      <h4 className="text-[11px] font-black text-orange-500 uppercase tracking-widest mb-6 flex items-center gap-3">
                        <span className="w-12 h-px bg-orange-500/30"></span>
                        Executive Summary
                      </h4>
                      <div className="text-zinc-400 leading-relaxed text-sm font-medium whitespace-pre-wrap selection:bg-orange-600/30">
                        {aiAnalysis.story}
                      </div>
                    </section>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="p-6 bg-red-950/5 border border-red-900/20 rounded-3xl">
                        <h4 className="text-[10px] font-bold text-red-500 uppercase tracking-widest mb-3">Autopsy Finding</h4>
                        <p className="text-zinc-400 text-xs leading-relaxed font-bold italic">"{startup.reasonForFailure}"</p>
                      </div>
                      <div className="p-6 bg-blue-950/5 border border-blue-900/20 rounded-3xl">
                        <h4 className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-3">Root Cause</h4>
                        <p className="text-zinc-400 text-xs leading-relaxed">{aiAnalysis.rootCause}</p>
                      </div>
                    </div>

                    <section className="text-center pt-6">
                      <h4 className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em] mb-8">Rebirth Viability: {aiAnalysis.viabilityScore}%</h4>
                      <div className="w-full h-1.5 bg-zinc-900 rounded-full overflow-hidden mb-12 max-w-md mx-auto ring-1 ring-zinc-800">
                        <div className="h-full bg-gradient-to-r from-orange-600 to-amber-500 transition-all duration-1000" style={{width: `${aiAnalysis.viabilityScore}%`}}></div>
                      </div>
                      
                      <div className="flex flex-wrap gap-2 justify-center">
                        {aiAnalysis.hiddenOpportunities.map((opp, i) => (
                          <span key={i} className="px-5 py-2.5 bg-zinc-900/30 border border-zinc-800 rounded-2xl text-[10px] text-zinc-500 font-bold uppercase tracking-widest hover:text-white hover:border-zinc-700 transition-all cursor-default">
                            {opp}
                          </span>
                        ))}
                      </div>
                    </section>
                  </div>
                )}
              </div>
            ) : (
              <div className="animate-in fade-in duration-500 h-full flex flex-col pt-4">
                <StartupChat startup={startup} />
              </div>
            )}
          </div>

          {/* Right Side: Rebirth Hub */}
          <div className="lg:w-1/2 p-10 flex flex-col overflow-y-auto bg-black/40">
            <div className="mb-12">
              <div className="flex items-center gap-5 group cursor-pointer" onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}>
                <img 
                    src={logo}
                    alt="Startup Memorial logo"
                    className="w-20 h-20 object-contain"
                    draggable={false}
                  />
                <div>
                  <h1 className="text-[25px] font-black tracking-tighter text-white uppercase leading-none">STARTUP</h1>
                  <h1 className="text-[25px] font-black tracking-tighter text-orange-400 uppercase leading-none">MEMORIAL</h1>
                </div>
              </div>
            </div>
            
            <form onSubmit={handleSubmit} className="mb-16 relative">
              <div className="bg-zinc-950 border border-zinc-900 p-2 rounded-[2.5rem] focus-within:border-orange-500/40 transition-all shadow-2xl">
                <textarea 
                  value={solutionText}
                  onChange={(e) => setSolutionText(e.target.value)}
                  placeholder="Propose your pivot to the archives..."
                  className="w-full bg-transparent p-6 text-sm font-medium text-white focus:outline-none min-h-[160px] resize-none placeholder:text-zinc-800"
                />
                <button 
                  disabled={isSubmitting || !solutionText.trim()}
                  type="submit"
                  className="w-full bg-orange-600 hover:bg-orange-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-black py-5 rounded-[2rem] transition-all flex items-center justify-center gap-3 uppercase tracking-widest shadow-2xl shadow-orange-950/40"
                >
                  {isSubmitting ? (
                    <div className="flex items-center gap-4">
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      Decoding Solution...
                    </div>
                  ) : "Ignite Rebirth"}
                </button>
              </div>
            </form>

            <div className="space-y-8 flex-1 pb-10">
              {startup.solutions.length === 0 ? (
                <div className="text-center py-24 opacity-20">
                  <div className="w-20 h-20 rounded-full border-4 border-dashed border-zinc-900 mx-auto flex items-center justify-center mb-6">
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M2 12h20"/></svg>
                  </div>
                  <p className="text-xs font-black uppercase tracking-widest text-zinc-500">Awaiting user input.</p>
                </div>
              ) : (
                startup.solutions.sort((a, b) => b.likes - a.likes || b.timestamp - a.timestamp).map((sol) => (
                  <SolutionItem 
                    key={sol.id} 
                    solution={sol} 
                    onVote={(solId, type, prev) => onVoteSolution(startup.id, solId, type, prev)}
                    onVoteReply={(solId, replyId, type, prev) => onVoteReply(startup.id, solId, replyId, type, prev)}
                    onReply={(solId, content, pid) => onAddReply(startup.id, solId, content, pid)}
                  />
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SolutionModal;
