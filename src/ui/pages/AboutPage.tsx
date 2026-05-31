import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Sparkles, Cpu, BookOpen, Layers } from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto py-12 px-6 space-y-10 animate-fade-in text-algo-text">
      
      {/* Header */}
      <div className="flex items-center gap-5 border-b border-algo-border/40 pb-6">
        <Link 
          to="/" 
          className="p-3 bg-algo-surface hover:bg-algo-surface-hover border border-algo-border rounded-xl transition-all duration-300 text-algo-text shadow-sm hover:scale-105 active:scale-95"
        >
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="inline-block text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-algo-text to-algo-primary pb-3 pr-3 pt-1 px-1 leading-normal">
            About AlgoVista
          </h1>
          <p className="text-xs font-mono text-algo-muted font-bold tracking-widest uppercase mt-1">
            Visual Educational Platform
          </p>
        </div>
      </div>

      {/* Hero Intro */}
      <section className="bg-algo-surface/40 backdrop-blur-md border border-algo-border/50 rounded-2xl p-8 relative overflow-hidden space-y-4">
        <div className="absolute top-0 right-0 w-48 h-48 bg-algo-primary/5 rounded-full blur-2xl pointer-events-none" />
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-algo-primary/15 border border-algo-primary/30 rounded-full text-[10px] font-semibold text-algo-primary">
          <Sparkles size={10} />
          Version 1.3.0
        </div>
        <p className="text-base text-algo-muted leading-relaxed font-semibold">
          AlgoVista is an interactive visual sandbox designed to deconstruct complex algorithms step-by-step. 
          Created by <strong className="text-algo-text">Chirag P Patil</strong>, the platform serves as a modern educational tool for students, teachers, and developers to explore structures, invariants, and mechanical optimizations.
        </p>
      </section>

      {/* Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-algo-surface/30 border border-algo-border/40 p-5 rounded-xl space-y-3">
          <div className="p-2 bg-algo-primary/10 rounded-lg w-fit text-algo-primary">
            <Cpu size={18} />
          </div>
          <h3 className="font-extrabold text-sm text-algo-text">Dynamic Discovery</h3>
          <p className="text-xs text-algo-muted leading-relaxed font-semibold">
            Built with a modular registry system that automatically loads and registers algorithm files dynamically using glob parameters.
          </p>
        </div>

        <div className="bg-algo-surface/30 border border-algo-border/40 p-5 rounded-xl space-y-3">
          <div className="p-2 bg-purple-500/10 rounded-lg w-fit text-purple-400">
            <BookOpen size={18} />
          </div>
          <h3 className="font-extrabold text-sm text-algo-text">Visual Telemetry</h3>
          <p className="text-xs text-algo-muted leading-relaxed font-semibold">
            Track runtime local state variables, highlighted pseudocode line progression, comparison metrics, and data structures simultaneously.
          </p>
        </div>

        <div className="bg-algo-surface/30 border border-algo-border/40 p-5 rounded-xl space-y-3">
          <div className="p-2 bg-emerald-500/10 rounded-lg w-fit text-emerald-400">
            <Layers size={18} />
          </div>
          <h3 className="font-extrabold text-sm text-algo-text">Multi-disciplinary</h3>
          <p className="text-xs text-algo-muted leading-relaxed font-semibold">
            Visualizes computational routing, numerical algebra, genomic string sequences, and classical data structure tracks.
          </p>
        </div>
      </div>

      {/* Story */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold text-algo-text">Mission Statement</h2>
        <p className="text-sm text-algo-muted leading-relaxed font-semibold">
          Algorithmic logic is often locked behind abstract code interfaces and mathematical notations. AlgoVista aims to bridge the gap by translating abstract procedures into interactive graphics. 
          By offering timeline scrubbers, playback speed controls, and blueprint canvas configurations, users can study edge behaviors, analyze complexity bounds, and gain intuitive mechanical understanding.
        </p>
      </section>

    </div>
  );
};
