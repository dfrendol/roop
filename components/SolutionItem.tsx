
import React, { useState, useEffect } from 'react';
import { Solution, Reply } from '../types';

interface SolutionItemProps {
  solution: Solution;
  onVote: (solutionId: string, type: 'like' | 'dislike', previousVote: 'like' | 'dislike' | null) => void;
  onReply: (solutionId: string, content: string, parentReplyId?: string) => void;
  onVoteReply: (solutionId: string, replyId: string, type: 'like' | 'dislike', previousVote: 'like' | 'dislike' | null) => void;
}

const ReplyNode: React.FC<{
  reply: Reply;
  solutionId: string;
  onReply: (content: string, parentReplyId: string) => void;
  onVote: (replyId: string, type: 'like' | 'dislike', previousVote: 'like' | 'dislike' | null) => void;
  depth?: number;
}> = ({ reply, solutionId, onReply, onVote, depth = 0 }) => {
  const [isReplying, setIsReplying] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [hasVoted, setHasVoted] = useState<'like' | 'dislike' | null>(null);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('user_reply_votes_v3') || '{}');
    if (saved[reply.id]) setHasVoted(saved[reply.id]);
  }, [reply.id]);

  const handleVote = (type: 'like' | 'dislike') => {
    if (hasVoted === type) return;
    const prev = hasVoted;
    const saved = JSON.parse(localStorage.getItem('user_reply_votes_v3') || '{}');
    saved[reply.id] = type;
    localStorage.setItem('user_reply_votes_v3', JSON.stringify(saved));
    setHasVoted(type);
    onVote(reply.id, type, prev);
  };

  return (
    <div className={`mt-4 ${depth > 0 ? 'ml-4 pl-4 border-l border-zinc-800' : ''}`}>
      <div className="bg-zinc-950/30 p-4 rounded-2xl border border-zinc-800/30">
        <div className="flex justify-between items-center mb-2">
          <span className="text-[10px] font-bold text-orange-500/60 uppercase tracking-widest">{reply.author}</span>
          <span className="text-[9px] text-zinc-700 font-bold">{new Date(reply.timestamp).toLocaleDateString()}</span>
        </div>
        <p className="text-xs text-zinc-400 leading-relaxed font-medium mb-3">
          {reply.content}
        </p>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <button 
              onClick={() => handleVote('like')}
              className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-[10px] font-bold transition-all ${
                hasVoted === 'like' ? 'bg-orange-600 text-white' : 'text-zinc-600 hover:text-zinc-400'
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill={hasVoted === 'like' ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M7 10v12"/><path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2h0a3.13 3.13 0 0 1 3 3.88Z"/></svg>
              {reply.likes || 0}
            </button>
            <button 
              onClick={() => handleVote('dislike')}
              className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-[10px] font-bold transition-all ${
                hasVoted === 'dislike' ? 'bg-red-900 text-red-200' : 'text-zinc-600 hover:text-zinc-400'
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill={hasVoted === 'dislike' ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 14V2"/><path d="M9 18.12 10 14H4.17a2 2 0 0 1-1.92-2.56l2.33-8A2 2 0 0 1 6.5 2H20a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-2.76a2 2 0 0 0-1.79 1.11L12 22h0a3.13 3.13 0 0 1-3-3.88Z"/></svg>
              {reply.dislikes || 0}
            </button>
          </div>
          {depth < 3 && ( // Limit depth to prevent UI chaos
            <button 
              onClick={() => setIsReplying(!isReplying)}
              className="text-[9px] font-bold text-zinc-600 hover:text-white uppercase tracking-widest"
            >
              Reply
            </button>
          )}
        </div>

        {isReplying && (
          <div className="mt-4 flex flex-col gap-2">
            <textarea
              autoFocus
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Add to the discussion..."
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-orange-500/50 min-h-[60px]"
            />
            <div className="flex justify-end gap-2">
              <button onClick={() => setIsReplying(false)} className="text-[9px] font-bold text-zinc-600 hover:text-white uppercase">Cancel</button>
              <button 
                onClick={() => {
                  if (replyText.trim()) {
                    onReply(replyText, reply.id);
                    setReplyText('');
                    setIsReplying(false);
                  }
                }}
                className="text-[9px] font-bold bg-orange-600 text-white px-3 py-1 rounded-lg uppercase"
              >
                Post
              </button>
            </div>
          </div>
        )}
      </div>
      
      {reply.replies.map(r => (
        <ReplyNode key={r.id} reply={r} solutionId={solutionId} onReply={onReply} onVote={onVote} depth={depth + 1} />
      ))}
    </div>
  );
};

const SolutionItem: React.FC<SolutionItemProps> = ({ solution, onVote, onReply, onVoteReply }) => {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [hasVoted, setHasVoted] = useState<'like' | 'dislike' | null>(null);

  useEffect(() => {
    const savedVotes = JSON.parse(localStorage.getItem('user_votes_v3') || '{}');
    if (savedVotes[solution.id]) {
      setHasVoted(savedVotes[solution.id]);
    }
  }, [solution.id]);

  const handleVote = (type: 'like' | 'dislike') => {
    if (hasVoted === type) return;
    const previous = hasVoted;
    const savedVotes = JSON.parse(localStorage.getItem('user_votes_v3') || '{}');
    savedVotes[solution.id] = type;
    localStorage.setItem('user_votes_v3', JSON.stringify(savedVotes));
    setHasVoted(type);
    onVote(solution.id, type, previous);
  };

  const handleReplySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    onReply(solution.id, replyText);
    setReplyText('');
    setShowReplyForm(false);
  };

  return (
    <div className="p-6 bg-zinc-900/50 border border-zinc-800 rounded-3xl hover:bg-zinc-900 transition-all duration-300 group">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-orange-600 to-amber-500 flex items-center justify-center text-xs font-black text-white shadow-lg">
            {solution.author.substring(0, 2).toUpperCase()}
          </div>
          <div>
            <span className="block text-xs font-bold text-white">{solution.author}</span>
            <span className="text-[10px] text-zinc-600 font-medium uppercase tracking-wider">{new Date(solution.timestamp).toLocaleDateString()}</span>
          </div>
        </div>
        <div className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
          <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">
            AI Score: {solution.aiScore}
          </span>
        </div>
      </div>

      <p className="text-zinc-300 text-sm mb-6 leading-relaxed font-medium">
        {solution.content}
      </p>

      {solution.aiFeedback && (
        <div className="mb-6 p-4 bg-zinc-950/50 border-l-4 border-emerald-500 rounded-r-2xl">
          <h5 className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest mb-1">Oracle Feedback</h5>
          <p className="text-xs text-zinc-400 italic leading-relaxed">
            "{solution.aiFeedback}"
          </p>
        </div>
      )}

      <div className="flex items-center justify-between pt-4 border-t border-zinc-800/50">
        <div className="flex items-center gap-2">
          <button 
            onClick={() => handleVote('like')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              hasVoted === 'like' ? 'bg-orange-600 text-white shadow-md shadow-orange-950/20' : 'text-zinc-500 hover:text-white bg-zinc-800/50 hover:bg-zinc-800'
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill={hasVoted === 'like' ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M7 10v12"/><path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2h0a3.13 3.13 0 0 1 3 3.88Z"/></svg>
            {solution.likes}
          </button>
          <button 
            onClick={() => handleVote('dislike')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              hasVoted === 'dislike' ? 'bg-red-900 text-red-200' : 'text-zinc-500 hover:text-white bg-zinc-800/50 hover:bg-zinc-800'
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill={hasVoted === 'dislike' ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 14V2"/><path d="M9 18.12 10 14H4.17a2 2 0 0 1-1.92-2.56l2.33-8A2 2 0 0 1 6.5 2H20a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-2.76a2 2 0 0 0-1.79 1.11L12 22h0a3.13 3.13 0 0 1-3-3.88Z"/></svg>
            {solution.dislikes}
          </button>
        </div>
        <button 
          onClick={() => setShowReplyForm(!showReplyForm)}
          className="text-[10px] font-bold text-zinc-500 hover:text-white uppercase tracking-widest flex items-center gap-2 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
          Reply ({solution.replies.length})
        </button>
      </div>

      {showReplyForm && (
        <form onSubmit={handleReplySubmit} className="mt-4 flex flex-col gap-2">
          <textarea
            autoFocus
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder="Add to the discussion..."
            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-4 text-sm text-white focus:outline-none focus:ring-1 focus:ring-orange-500/50 min-h-[80px]"
          />
          <div className="flex justify-end gap-2">
            <button 
              type="button"
              onClick={() => setShowReplyForm(false)}
              className="text-[10px] font-bold text-zinc-600 hover:text-white px-4 py-2 uppercase tracking-widest"
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="text-[10px] font-bold bg-orange-600 hover:bg-orange-500 text-white px-6 py-2 rounded-lg transition-all uppercase tracking-widest"
            >
              Post
            </button>
          </div>
        </form>
      )}

      {solution.replies.length > 0 && (
        <div className="mt-2">
          {solution.replies.map((reply) => (
            <ReplyNode 
              key={reply.id} 
              reply={reply} 
              solutionId={solution.id} 
              onReply={(content, pid) => onReply(solution.id, content, pid)} 
              onVote={(rid, type, prev) => onVoteReply(solution.id, rid, type, prev)} 
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default SolutionItem;
