/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Scale, 
  Table as TableIcon, 
  Target, 
  Loader2, 
  Sparkles,
  History,
  Trash2
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { analyzeDecision, type AnalysisResult, type AnalysisType } from './services/gemini';
import { cn } from './lib/utils';

export default function App() {
  const [decision, setDecision] = useState('');
  const [analysisType, setAnalysisType] = useState<AnalysisType>('pros-cons');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState<AnalysisResult[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!decision.trim()) return;

    setIsAnalyzing(true);
    setError(null);

    try {
      const result = await analyzeDecision(decision, analysisType);
      setResults(prev => [result, ...prev]);
      setDecision('');
    } catch (err) {
      console.error(err);
      setError('Failed to analyze decision. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const clearHistory = () => {
    setResults([]);
  };

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 selection:bg-zinc-200">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-zinc-200">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-zinc-900 rounded-lg flex items-center justify-center text-white">
              <Scale size={18} />
            </div>
            <h1 className="text-lg font-semibold tracking-tight">The Tiebreaker</h1>
          </div>
          
          {results.length > 0 && (
            <button 
              onClick={clearHistory}
              className="text-xs font-medium text-zinc-500 hover:text-zinc-900 flex items-center gap-1.5 transition-colors"
            >
              <Trash2 size={14} />
              Clear History
            </button>
          )}
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-12">
        {/* Input Section */}
        <section className="mb-16">
          <div className="max-w-2xl mx-auto text-center mb-10">
            <h2 className="text-4xl font-bold tracking-tight mb-4">
              Make better decisions, <br />
              <span className="text-zinc-400 font-medium italic serif">faster than ever.</span>
            </h2>
            <p className="text-zinc-500 text-lg">
              Describe your dilemma and let AI provide the clarity you need to move forward.
            </p>
          </div>

          <form onSubmit={handleAnalyze} className="max-w-3xl mx-auto">
            <div className="bg-white rounded-2xl shadow-sm border border-zinc-200 p-6 transition-all focus-within:ring-2 focus-within:ring-zinc-900/5 focus-within:border-zinc-300">
              <textarea
                value={decision}
                onChange={(e) => setDecision(e.target.value)}
                placeholder="Should I move to a new city? Or stay where I am?"
                className="w-full h-32 bg-transparent border-none focus:ring-0 text-lg resize-none placeholder:text-zinc-300"
                disabled={isAnalyzing}
              />
              
              <div className="flex flex-wrap items-center justify-between gap-4 mt-4 pt-4 border-t border-zinc-100">
                <div className="flex bg-zinc-100 p-1 rounded-lg">
                  <TypeButton 
                    active={analysisType === 'pros-cons'} 
                    onClick={() => setAnalysisType('pros-cons')}
                    icon={<Scale size={14} />}
                    label="Pros & Cons"
                  />
                  <TypeButton 
                    active={analysisType === 'comparison'} 
                    onClick={() => setAnalysisType('comparison')}
                    icon={<TableIcon size={14} />}
                    label="Comparison"
                  />
                  <TypeButton 
                    active={analysisType === 'swot'} 
                    onClick={() => setAnalysisType('swot')}
                    icon={<Target size={14} />}
                    label="SWOT"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isAnalyzing || !decision.trim()}
                  className={cn(
                    "px-6 py-2.5 bg-zinc-900 text-white rounded-lg font-medium flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50 disabled:active:scale-100",
                    isAnalyzing ? "cursor-not-allowed" : "hover:bg-zinc-800"
                  )}
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Sparkles size={18} />
                      Analyze
                    </>
                  )}
                </button>
              </div>
            </div>
            {error && (
              <p className="mt-3 text-sm text-red-500 text-center">{error}</p>
            )}
          </form>
        </section>

        {/* Results Section */}
        <section className="space-y-8">
          <AnimatePresence mode="popLayout">
            {results.length === 0 && !isAnalyzing && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-20 border-2 border-dashed border-zinc-200 rounded-3xl"
              >
                <div className="w-12 h-12 bg-zinc-100 rounded-full flex items-center justify-center mx-auto mb-4 text-zinc-400">
                  <History size={24} />
                </div>
                <h3 className="text-zinc-900 font-medium">No analyses yet</h3>
                <p className="text-zinc-500 text-sm mt-1">Your decision history will appear here.</p>
              </motion.div>
            )}

            {results.map((result, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-2xl shadow-sm border border-zinc-200 overflow-hidden"
              >
                <div className="px-6 py-4 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/50">
                  <div className="flex items-center gap-3">
                    <span className="px-2 py-1 bg-zinc-900 text-white text-[10px] font-bold uppercase tracking-wider rounded">
                      {result.type.replace('-', ' ')}
                    </span>
                    <h3 className="font-medium text-zinc-900 line-clamp-1">{result.title}</h3>
                  </div>
                  <div className="text-xs text-zinc-400 font-mono">
                    {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
                <div className="p-8">
                  <div className="markdown-body prose prose-zinc max-w-none">
                    <ReactMarkdown>{result.content}</ReactMarkdown>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-12 border-t border-zinc-200 mt-20">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <p className="text-sm text-zinc-400">
            Powered by Gemini 3.1 Pro • Built for clarity.
          </p>
        </div>
      </footer>
    </div>
  );
}

function TypeButton({ 
  active, 
  onClick, 
  icon, 
  label 
}: { 
  active: boolean; 
  onClick: () => void; 
  icon: React.ReactNode; 
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all",
        active 
          ? "bg-white text-zinc-900 shadow-sm" 
          : "text-zinc-500 hover:text-zinc-900 hover:bg-white/50"
      )}
    >
      {icon}
      {label}
    </button>
  );
}
