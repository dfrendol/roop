
import React, { useState, useMemo, useEffect } from 'react';
import { SEED_STARTUPS } from './constants';
import { StartupFailure, Solution, Reply } from './types';
import StartupCard from './components/StartupCard';
import SolutionModal from './components/SolutionModal';
import RegisterBurialModal from './components/RegisterBurialModal';
import logo from './logo.png';
import { subscribeStartups, upsertStartup } from "./services/startups";

const App: React.FC = () => {
  const [startups, setStartups] = useState<StartupFailure[]>([]);
  
  const [selectedStartupId, setSelectedStartupId] = useState<string | null>(null);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<string>('All');

  useEffect(() => {
    const unsub = subscribeStartups(setStartups);
    return () => unsub();
  }, []);

  const industries = useMemo(() => {
    return ['All', ...Array.from(new Set(startups.map(s => s.industry)))];
  }, [startups]);

  const filteredStartups = useMemo(() => {
    return startups.filter(s => {
      const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           s.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFilter = filter === 'All' || s.industry === filter;
      return matchesSearch && matchesFilter;
    });
  }, [startups, searchQuery, filter]);

  const selectedStartup = useMemo(() => 
    startups.find(s => s.id === selectedStartupId) || null
  , [startups, selectedStartupId]);

  const handleAddStartup = async (newStartup: StartupFailure) => {
    await upsertStartup(newStartup);
  };

  const calculateNewVotes = (currentLikes: number, currentDislikes: number, type: 'like' | 'dislike', previousVote: 'like' | 'dislike' | null) => {
    let likes = currentLikes;
    let dislikes = currentDislikes;

    if (previousVote === 'like') likes--;
    if (previousVote === 'dislike') dislikes--;

    if (type === 'like') likes++;
    if (type === 'dislike') dislikes++;

    return { likes, dislikes };
  };

  // Added missing handleAddSolution function to handle new solution submissions
  const handleAddSolution = async (startupId: string, solution: Solution) => {
    const target = startups.find(s => s.id === startupId);
    if (!target) return;

    const updated: StartupFailure = {
      ...target,
      solutions: [solution, ...target.solutions],
    };

    await upsertStartup(updated);
  };


  const handleVoteSolution = async (
    startupId: string,
    solutionId: string,
    type: 'like' | 'dislike',
    previousVote: 'like' | 'dislike' | null
  ) => {
    const target = startups.find(s => s.id === startupId);
    if (!target) return;

    const updated: StartupFailure = {
      ...target,
      solutions: target.solutions.map(sol => {
        if (sol.id !== solutionId) return sol;
        const { likes, dislikes } = calculateNewVotes(sol.likes, sol.dislikes, type, previousVote);
        return { ...sol, likes, dislikes };
      })
    };

    await upsertStartup(updated);
  };


  const updateReplyVoteRecursive = (replies: Reply[], replyId: string, type: 'like' | 'dislike', previousVote: 'like' | 'dislike' | null): Reply[] => {
    return replies.map(rep => {
      if (rep.id === replyId) {
        const { likes, dislikes } = calculateNewVotes(rep.likes, rep.dislikes, type, previousVote);
        return { ...rep, likes, dislikes };
      }
      if (rep.replies.length > 0) {
        return { ...rep, replies: updateReplyVoteRecursive(rep.replies, replyId, type, previousVote) };
      }
      return rep;
    });
  };

  const handleVoteReply = async (
    startupId: string,
    solutionId: string,
    replyId: string,
    type: 'like' | 'dislike',
    previousVote: 'like' | 'dislike' | null
  ) => {
    const target = startups.find(s => s.id === startupId);
    if (!target) return;

    const updated: StartupFailure = {
      ...target,
      solutions: target.solutions.map(sol => {
        if (sol.id !== solutionId) return sol;
        return { ...sol, replies: updateReplyVoteRecursive(sol.replies, replyId, type, previousVote) };
      })
    };

    await upsertStartup(updated);
  };


  const addReplyRecursive = (replies: Reply[], parentId: string, newReply: Reply): Reply[] => {
    return replies.map(rep => {
      if (rep.id === parentId) {
        return { ...rep, replies: [...rep.replies, newReply] };
      }
      if (rep.replies.length > 0) {
        return { ...rep, replies: addReplyRecursive(rep.replies, parentId, newReply) };
      }
      return rep;
    });
  };

  const handleAddReply = async (startupId: string, solutionId: string, content: string, parentReplyId?: string) => {
    const target = startups.find(s => s.id === startupId);
    if (!target) return;

    const newReply: Reply = {
      id: Math.random().toString(36).substr(2, 9),
      author: "Resonator",
      content,
      timestamp: Date.now(),
      likes: 0,
      dislikes: 0,
      replies: []
    };

    const updated: StartupFailure = {
      ...target,
      solutions: target.solutions.map(sol => {
        if (sol.id !== solutionId) return sol;
        if (parentReplyId) {
          return { ...sol, replies: addReplyRecursive(sol.replies, parentReplyId, newReply) };
        }
        return { ...sol, replies: [...sol.replies, newReply] };
      })
    };

    await upsertStartup(updated);
  };



  return (
    <div className="min-h-screen pb-20 bg-[#050505] text-zinc-100 selection:bg-orange-600 selection:text-white">
      <header className="sticky top-0 z-40 bg-black/60 backdrop-blur-3xl border-b border-zinc-900">
        <div className="max-w-7xl mx-auto px-8 py-5 flex flex-col md:flex-row justify-between items-center gap-8">
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

          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="relative flex-1 md:w-80 group">
               <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none text-zinc-700 group-focus-within:text-orange-400 transition-colors">
                 <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
               </div>
               <input 
                  type="text" 
                  placeholder="Search the ashes..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-zinc-900/40 border border-zinc-800 rounded-[2rem] pl-14 pr-6 py-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 transition-all placeholder:text-zinc-700"
               />
            </div>
            <select 
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="bg-zinc-900/40 border border-zinc-800 rounded-[2rem] px-8 py-4 text-[11px] font-bold text-zinc-500 focus:outline-none cursor-pointer hover:text-white transition-colors"
            >
              {industries.map(ind => <option key={ind} value={ind} className="bg-zinc-950">{ind}</option>)}
            </select>
            <button 
              onClick={() => setIsRegisterModalOpen(true)}
              className="bg-orange-500 hover:bg-orange-700 text-white px-6 py-4 rounded-[2rem] text-[11px] font-black uppercase tracking-widest transition-all shadow-xl shadow-orange-950/20 active:scale-95"
            >
              Register Case
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-8 mt-16">
        <div className="mb-24 text-center relative">
          <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-orange-600/5 blur-[120px] pointer-events-none rounded-full"></div>
          <h2 className="text-7xl md:text-9xl font-black text-white mb-8 tracking-tighter uppercase leading-[0.8] animate-in fade-in slide-in-from-top-4 duration-1000">
            THE STARTUP <br/><span className="text-zinc-600">CEMETERY</span>
          </h2>
          <p className="text-zinc-300 max-w-2xl mx-auto text-sm font-medium leading-relaxed opacity-60">
            Every failure is a lesson in disguise. <br/>
            Decode the past to engineer the future.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10">
          {filteredStartups.map(startup => (
            <StartupCard 
              key={startup.id} 
              startup={startup} 
              onClick={(id) => setSelectedStartupId(id)}
            />
          ))}
          
          <div 
            onClick={() => setIsRegisterModalOpen(true)}
            className="border-4 border-dashed border-zinc-900 rounded-[2.5rem] p-12 flex flex-col items-center justify-center text-center hover:bg-zinc-900/20 hover:border-zinc-800 transition-all cursor-pointer group"
          >
            <div className="w-20 h-20 rounded-[2rem] bg-zinc-950 border-2 border-zinc-900 flex items-center justify-center mb-8 group-hover:scale-110 group-hover:border-orange-600 group-hover:text-orange-600 transition-all duration-500 shadow-inner">
               <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
            </div>
            <h3 className="font-bold text-zinc-700 group-hover:text-white uppercase tracking-widest text-xs transition-colors">Register Burial</h3>
            <p className="text-[10px] text-zinc-800 group-hover:text-zinc-700 mt-3 font-medium">EXPAND THE ARCHIVE</p>
          </div>
        </div>
      </main>

      <footer className="mt-40 border-t border-zinc-900 pt-24 pb-32 text-center">
        <div className="flex flex-wrap justify-center gap-16 md:gap-32 mb-24">
          <div className="group cursor-default">
            <div className="text-5xl font-black text-white tracking-tighter group-hover:text-orange-500 transition-colors">{startups.length}</div>
            <div className="uppercase tracking-[0.2em] text-[10px] text-zinc-200 font-bold mt-3">Archived Collapses</div>
          </div>
          <div className="group cursor-default">
            <div className="text-5xl font-black text-white tracking-tighter group-hover:text-orange-500 transition-colors">{startups.reduce((acc, s) => acc + s.solutions.length, 0)}</div>
            <div className="uppercase tracking-[0.2em] text-[10px] text-zinc-200 font-bold mt-3">Pivot Attempts</div>
          </div>
        </div>
        <div className="flex flex-col items-center gap-6">
          <p className="text-zinc-200 text-[10px] font-bold uppercase tracking-[0.5em] mb-4">SM © 2026</p>
          <div className="flex gap-6">
            <div className="w-1.5 h-1.5 rounded-full bg-zinc-900"></div>
            <div className="w-1.5 h-1.5 rounded-full bg-orange-600 animate-ping"></div>
            <div className="w-1.5 h-1.5 rounded-full bg-zinc-900"></div>
          </div>
        </div>
      </footer>

      {selectedStartup && (
        <SolutionModal 
          startup={selectedStartup}
          onClose={() => setSelectedStartupId(null)}
          onAddSolution={handleAddSolution}
          onVoteSolution={handleVoteSolution}
          onVoteReply={handleVoteReply}
          onAddReply={handleAddReply}
        />
      )}

      {isRegisterModalOpen && (
        <RegisterBurialModal 
          onClose={() => setIsRegisterModalOpen(false)}
          onAddStartup={handleAddStartup}
        />
      )}
    </div>
  );
};

export default App;
