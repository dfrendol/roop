
import React from 'react';
import { StartupFailure } from '../types';

interface StartupCardProps {
  startup: StartupFailure;
  onClick: (id: string) => void;
}

const StartupCard: React.FC<StartupCardProps> = ({ startup, onClick }) => {
  return (
    <div 
      onClick={() => onClick(startup.id)}
      className="group relative bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden cursor-pointer hover:border-orange-500/50 transition-all duration-300 transform hover:-translate-y-1"
    >
      <div className="h-48 overflow-hidden">
        <img 
          src={startup.image} 
          alt={startup.name} 
          className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
        />
        <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold text-zinc-300">
          {startup.founded} - {startup.defunct}
        </div>
      </div>
      <div className="p-5">
        <div className="flex items-start mb-2">
          <h3 className="text-xl font-bold text-white group-hover:text-orange-400 transition-colors">
            {startup.name}
          </h3>
          <span className="ml-auto text-[10px] text-zinc-500 uppercase tracking-widest truncate max-w-[60%]">{startup.industry}</span>
        </div>
        <p className="text-zinc-400 text-sm line-clamp-3 mb-4">
          {startup.description}
        </p>
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-orange-500/80 bg-orange-500/10 px-2 py-1 rounded">
            Valuation: {startup.valuationAtPeak}
          </span>
          <div className="flex -space-x-2">
             <div className="w-6 h-6 rounded-full bg-zinc-700 border-2 border-zinc-900 flex items-center justify-center text-[10px] text-white">
                {startup.solutions.length}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StartupCard;
