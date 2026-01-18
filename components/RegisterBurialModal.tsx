
import React, { useState } from 'react';
import { StartupFailure } from '../types';
import { predictFailureDetails } from '../services/geminiService';

interface RegisterBurialModalProps {
  onClose: () => void;
  onAddStartup: (startup: StartupFailure) => void;
}

const RegisterBurialModal: React.FC<RegisterBurialModalProps> = ({ onClose, onAddStartup }) => {
  const [formData, setFormData] = useState({
    name: '',
    industry: '',
    founded: '',
    defunct: '',
    valuationAtPeak: '',
    description: '',
    reasonForFailure: ''
  });
  const [isScanning, setIsScanning] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.description) return;

    const newStartup: StartupFailure = {
      id: Math.random().toString(36).substr(2, 9),
      name: formData.name,
      industry: formData.industry || 'Unknown Sector',
      founded: parseInt(formData.founded) || new Date().getFullYear(),
      defunct: parseInt(formData.defunct) || new Date().getFullYear(),
      valuationAtPeak: formData.valuationAtPeak || '$0',
      description: formData.description,
      reasonForFailure: formData.reasonForFailure,
      image: `https://picsum.photos/seed/${formData.name.replace(/\s+/g, '')}/800/400`,
      solutions: []
    };

    onAddStartup(newStartup);
    onClose();
  };

  const handleSmartFill = async () => {
    if (!formData.name || !formData.description) {
      alert("Provide a name and basic description first to initiate the forensic scan.");
      return;
    }

    setIsScanning(true);
    try {
      const details = await predictFailureDetails(formData.name, formData.description);
      setFormData(prev => ({
        ...prev,
        industry: details.industry,
        founded: details.foundedYear.toString(),
        defunct: details.defunctYear.toString(),
        valuationAtPeak: details.valuationAtPeak,
        reasonForFailure: details.reasonForFailure
      }));
    } catch (err) {
      console.error("Forensic scan failed", err);
      alert("System was unable to reconstruct history. Manual entry required.");
    } finally {
      setIsScanning(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95 backdrop-blur-xl overflow-y-auto">
      <div className="bg-zinc-950 w-full max-w-2xl rounded-[2.5rem] border border-zinc-900 shadow-[0_0_150px_rgba(0,0,0,0.9)] overflow-hidden my-auto ring-1 ring-white/5 animate-in zoom-in-95 duration-300">
        <div className="p-10">
          <div className="flex justify-between items-center mb-10">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-zinc-900 border border-zinc-800 rounded-2xl flex items-center justify-center text-orange-600">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
              </div>
              <div>
                <h2 className="text-2xl font-black text-white uppercase tracking-tighter">Register Burial</h2>
                <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest">Archive a collapse</p>
              </div>
            </div>
            <button onClick={onClose} className="text-zinc-600 hover:text-white transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">Startup Name</label>
                <input 
                  required
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. Quibi"
                  className="w-full bg-zinc-900/50 border border-zinc-800 rounded-2xl px-5 py-3 text-sm text-white focus:outline-none focus:border-orange-500/50 transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">Industry</label>
                <input 
                  name="industry"
                  value={formData.industry}
                  onChange={handleChange}
                  placeholder="e.g. Media / Streaming"
                  className="w-full bg-zinc-900/50 border border-zinc-800 rounded-2xl px-5 py-3 text-sm text-white focus:outline-none focus:border-orange-500/50 transition-all"
                />
              </div>
              
              <div className="space-y-2 md:col-span-2">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">Core Description</label>
                <textarea 
                  required
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="What was their mission or product?"
                  className="w-full bg-zinc-900/50 border border-zinc-800 rounded-2xl px-5 py-3 text-sm text-white focus:outline-none focus:border-orange-500/50 transition-all min-h-[100px]"
                />
              </div>

              {/* AI Assistant Section */}
              <div className="md:col-span-2 py-4">
                <button 
                  type="button"
                  onClick={handleSmartFill}
                  disabled={isScanning || !formData.name || !formData.description}
                  className={`w-full flex items-center justify-center gap-3 px-6 py-4 rounded-2xl border transition-all font-bold text-[10px] uppercase tracking-[0.2em] ${
                    isScanning ? 'bg-orange-600/20 border-orange-500/50 text-orange-400' : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-orange-500/50 hover:text-white'
                  } disabled:opacity-30`}
                >
                  {isScanning ? (
                    <>
                      <div className="animate-spin h-3 w-3 border-2 border-orange-500 border-t-transparent rounded-full"></div>
                      Forensic Scan in Progress...
                    </>
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>
                      Forensic Smart-Fill (AI)
                    </>
                  )}
                </button>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">Founded Year</label>
                <input 
                  type="number"
                  name="founded"
                  value={formData.founded}
                  onChange={handleChange}
                  placeholder="2018"
                  className="w-full bg-zinc-900/50 border border-zinc-800 rounded-2xl px-5 py-3 text-sm text-white focus:outline-none focus:border-orange-500/50 transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">Defunct Year</label>
                <input 
                  type="number"
                  name="defunct"
                  value={formData.defunct}
                  onChange={handleChange}
                  placeholder="2020"
                  className="w-full bg-zinc-900/50 border border-zinc-800 rounded-2xl px-5 py-3 text-sm text-white focus:outline-none focus:border-orange-500/50 transition-all"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">Peak Valuation</label>
                <input 
                  name="valuationAtPeak"
                  value={formData.valuationAtPeak}
                  onChange={handleChange}
                  placeholder="e.g. $1.75 Billion"
                  className="w-full bg-zinc-900/50 border border-zinc-800 rounded-2xl px-5 py-3 text-sm text-white focus:outline-none focus:border-orange-500/50 transition-all"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">Fatal Flaw (Failure Reason)</label>
                <textarea 
                  name="reasonForFailure"
                  value={formData.reasonForFailure}
                  onChange={handleChange}
                  placeholder="Why did it eventually collapse?"
                  className="w-full bg-zinc-900/50 border border-zinc-800 rounded-2xl px-5 py-3 text-sm text-white focus:outline-none focus:border-orange-500/50 transition-all min-h-[80px]"
                />
              </div>
            </div>

            <button 
              type="submit"
              disabled={isScanning}
              className="w-full bg-orange-600 hover:bg-orange-500 disabled:opacity-50 text-white text-xs font-black py-5 rounded-[2rem] transition-all flex items-center justify-center gap-3 uppercase tracking-widest shadow-2xl shadow-orange-950/40 mt-6"
            >
              Commit to Archive
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegisterBurialModal;
