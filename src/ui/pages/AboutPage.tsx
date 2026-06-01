import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Sparkles, Cpu, HelpCircle, Code, Volume2, Award, Share2 } from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto py-12 px-6 space-y-12 animate-fade-in text-algo-text pb-16">
      
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
      <section className="glass-panel border border-algo-border/50 rounded-2xl p-8 relative overflow-hidden space-y-4 shadow-xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-algo-primary/5 rounded-full blur-3xl pointer-events-none" />
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-algo-primary/15 border border-algo-primary/30 rounded-full text-[10px] font-semibold text-algo-primary">
          <Sparkles size={10} />
          Version 1.4.0 (Premium EdTech Suite)
        </div>
        <p className="text-base text-algo-muted leading-relaxed font-semibold">
          AlgoVista is an interactive visual sandbox designed to deconstruct complex algorithms step-by-step. 
          Created by <strong className="text-algo-text">Chirag P Patil</strong>, the platform serves as a modern educational tool for students, teachers, and developers to explore data structures, visual invariants, and computational runtimes.
        </p>
      </section>

      {/* Interactive EdTech Features Section */}
      <section className="space-y-6">
        <h2 className="text-xl font-extrabold text-algo-text flex items-center gap-2">
          <Sparkles className="text-algo-primary" size={20} />
          Premium EdTech Visual Suite
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Card 1: Active Recall Quizzes */}
          <div className="glass-panel border border-algo-border/40 p-5 rounded-2xl space-y-3">
            <div className="p-2.5 bg-algo-primary/10 rounded-xl w-fit text-algo-primary">
              <HelpCircle size={20} />
            </div>
            <h3 className="font-extrabold text-base text-algo-text">Socratic Active Recall Quizzes</h3>
            <p className="text-xs text-algo-muted leading-relaxed font-semibold">
              Intercepts playback at designated checkpoints with multiple-choice questions. Locks visual execution to engage students actively, breaking the "illusion of competence" before resuming.
            </p>
          </div>

          {/* Card 2: Code Playground */}
          <div className="glass-panel border border-algo-border/40 p-5 rounded-2xl space-y-3">
            <div className="p-2.5 bg-purple-500/10 rounded-xl w-fit text-purple-400">
              <Code size={20} />
            </div>
            <h3 className="font-extrabold text-base text-algo-text">Multi-Language Code Playground</h3>
            <p className="text-xs text-algo-muted leading-relaxed font-semibold">
              Switch code tracks between Pseudocode, JavaScript, Python, C++, and Java on the fly. A line-by-line syntax translator keeps highlight lines synced. Supports editable editor panels for visual hot-reloads.
            </p>
          </div>

          {/* Card 3: Sound Synthesizer */}
          <div className="glass-panel border border-algo-border/40 p-5 rounded-2xl space-y-3">
            <div className="p-2.5 bg-emerald-500/10 rounded-xl w-fit text-emerald-400">
              <Volume2 size={20} />
            </div>
            <h3 className="font-extrabold text-base text-algo-text">Auditory Sound Synthesizer</h3>
            <p className="text-xs text-algo-muted leading-relaxed font-semibold">
              Uses the browser's native Web Audio API to play real-time synthesizer frequencies. Maps element values to pitches and operations (compares, swaps, writes, success) to specific sound wave formats.
            </p>
          </div>

          {/* Card 4: Comparative Races */}
          <div className="glass-panel border border-algo-border/40 p-5 rounded-2xl space-y-3">
            <div className="p-2.5 bg-amber-500/10 rounded-xl w-fit text-amber-500">
              <Award size={20} />
            </div>
            <h3 className="font-extrabold text-base text-algo-text">Comparative Algo-Races</h3>
            <p className="text-xs text-algo-muted leading-relaxed font-semibold">
              Start synchronous duels with up to 3 sorting algorithms running on a shared array. Features dynamic distribution presets (random, reversed, nearly sorted, duplicates) and awards Gold, Silver, and Bronze rankings.
            </p>
          </div>

          {/* Card 5: Classroom sharing */}
          <div className="glass-panel border border-algo-border/40 p-5 rounded-2xl space-y-3">
            <div className="p-2.5 bg-sky-500/10 rounded-xl w-fit text-sky-400">
              <Share2 size={20} />
            </div>
            <h3 className="font-extrabold text-base text-algo-text">Classroom Presentation Mode</h3>
            <p className="text-xs text-algo-muted leading-relaxed font-semibold">
              Supports serialization of custom visualizer inputs into Base64 query parameters. Instantly generates shareable URL links for teachers to distribute custom configurations to classrooms.
            </p>
          </div>

          {/* Card 6: Dynamic Glob Registry */}
          <div className="glass-panel border border-algo-border/40 p-5 rounded-2xl space-y-3">
            <div className="p-2.5 bg-pink-500/10 rounded-xl w-fit text-pink-400">
              <Cpu size={20} />
            </div>
            <h3 className="font-extrabold text-base text-algo-text">Modular Auto-Registry</h3>
            <p className="text-xs text-algo-muted leading-relaxed font-semibold">
              Powered by a modular autoloader executing glob parameters. Discovers and registers custom algorithm modules across sorting, graphs, numeric calculations, and string search files automatically.
            </p>
          </div>

        </div>
      </section>

      {/* Details Grid (Core specs) */}
      <section className="space-y-6">
        <h2 className="text-lg font-bold text-algo-text">Core Infrastructure</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-algo-surface/30 border border-algo-border/40 p-5 rounded-xl space-y-2">
            <h3 className="font-bold text-sm text-algo-text">Visual Telemetry</h3>
            <p className="text-xs text-algo-muted leading-relaxed font-medium">
              Track local state variables, indices compare/swap events, operation statistics, and canvas nodes in real-time.
            </p>
          </div>

          <div className="bg-algo-surface/30 border border-algo-border/40 p-5 rounded-xl space-y-2">
            <h3 className="font-bold text-sm text-algo-text">Stage Visualizers</h3>
            <p className="text-xs text-algo-muted leading-relaxed font-medium">
              Supports diverse structures including 1D Arrays, 2D Matrices, Stack/Queue animations, and dynamic D3 SVG Graph layouts.
            </p>
          </div>

          <div className="bg-algo-surface/30 border border-algo-border/40 p-5 rounded-xl space-y-2">
            <h3 className="font-bold text-sm text-algo-text">Cinema Focus Mode</h3>
            <p className="text-xs text-algo-muted leading-relaxed font-medium">
              Toggle fullscreen visualization states to hide side panels and expand active visual canvases to 100% viewport width.
            </p>
          </div>
        </div>
      </section>

      {/* Mission Statement */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold text-algo-text">Mission Statement</h2>
        <p className="text-sm text-algo-muted leading-relaxed font-semibold">
          Computational logic can feel abstract when locked behind compiler logs and complex notations. AlgoVista bridges this gap by translating logic into interactive graphic stages. 
          By offering granular controls, interactive recall tools, multi-algorithm duels, and sharing channels, it strives to build deep intuitive understanding for learners worldwide.
        </p>
      </section>

    </div>
  );
};
