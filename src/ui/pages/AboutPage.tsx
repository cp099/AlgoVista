import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Sparkles, Cpu, HelpCircle, Code, Volume2, Award, Share2 } from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto py-10 px-4 space-y-12 animate-fade-in text-slate-800 pb-16 font-sans">
      
      {/* Header */}
      <div className="flex items-center gap-4 border-b border-slate-100 pb-5">
        <Link 
          to="/" 
          className="p-2 border border-slate-200 hover:bg-slate-50 rounded-lg text-slate-500 hover:text-slate-900 transition-colors"
          title="Back"
        >
          <ArrowLeft size={16} />
        </Link>
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-slate-900">
            About AlgoVista
          </h1>
          <p className="text-[10px] font-mono text-slate-400 font-bold uppercase tracking-wider mt-0.5">
            Visual Educational Platform
          </p>
        </div>
      </div>

      {/* Hero Intro */}
      <section className="bg-white/70 backdrop-blur-md border border-slate-200/60 rounded-xl p-6 md:p-8 space-y-4">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 border border-slate-200 rounded text-[10px] font-semibold text-slate-600">
          <Sparkles size={10} />
          Version 1.4.0 (Premium EdTech Suite)
        </div>
        <p className="text-sm md:text-base text-slate-500 leading-relaxed font-normal max-w-3xl">
          AlgoVista is an interactive visual sandbox designed to deconstruct complex algorithms step-by-step. 
          Created by <strong>Chirag P Patil</strong>, the platform serves as a modern educational tool for students, teachers, and developers to explore data structures, visual invariants, and computational runtimes.
        </p>
      </section>

      {/* Interactive EdTech Features Section */}
      <section className="space-y-5">
        <h2 className="text-lg font-semibold text-slate-900">
          Educational Visual Suite
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Card 1: Active Recall Quizzes */}
          <div className="bg-white/70 backdrop-blur-md border border-slate-200/60 p-5 rounded-xl space-y-3 shadow-[0_1px_3px_rgba(0,0,0,0.01)]">
            <div className="p-2 bg-slate-100 rounded-lg w-fit text-slate-600">
              <HelpCircle size={18} />
            </div>
            <h3 className="font-semibold text-sm text-slate-900">Socratic Active Recall Quizzes</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Intercepts playback at designated checkpoints with multiple-choice questions. Locks visual execution to engage students actively, breaking the "illusion of competence" before resuming.
            </p>
          </div>

          {/* Card 2: Code Playground */}
          <div className="bg-white/70 backdrop-blur-md border border-slate-200/60 p-5 rounded-xl space-y-3 shadow-[0_1px_3px_rgba(0,0,0,0.01)]">
            <div className="p-2 bg-slate-100 rounded-lg w-fit text-slate-600">
              <Code size={18} />
            </div>
            <h3 className="font-semibold text-sm text-slate-900">Multi-Language Code Playground</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Switch code tracks between Pseudocode, JavaScript, Python, C++, and Java on the fly. A line-by-line syntax translator keeps highlight lines synced. Supports editable editor panels for visual hot-reloads.
            </p>
          </div>

          {/* Card 3: Sound Synthesizer */}
          <div className="bg-white/70 backdrop-blur-md border border-slate-200/60 p-5 rounded-xl space-y-3 shadow-[0_1px_3px_rgba(0,0,0,0.01)]">
            <div className="p-2 bg-slate-100 rounded-lg w-fit text-slate-600">
              <Volume2 size={18} />
            </div>
            <h3 className="font-semibold text-sm text-slate-900">Auditory Sound Synthesizer</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Uses the browser's native Web Audio API to play real-time synthesizer frequencies. Maps element values to pitches and operations (compares, swaps, writes, success) to specific sound wave formats.
            </p>
          </div>

          {/* Card 4: Comparative Races */}
          <div className="bg-white/70 backdrop-blur-md border border-slate-200/60 p-5 rounded-xl space-y-3 shadow-[0_1px_3px_rgba(0,0,0,0.01)]">
            <div className="p-2 bg-slate-100 rounded-lg w-fit text-slate-600">
              <Award size={18} />
            </div>
            <h3 className="font-semibold text-sm text-slate-900">Comparative Algo-Races</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Start synchronous duels with up to 3 sorting algorithms running on a shared array. Features dynamic distribution presets (random, reversed, nearly sorted, duplicates) and awards Gold, Silver, and Bronze rankings.
            </p>
          </div>

          {/* Card 5: Classroom sharing */}
          <div className="bg-white/70 backdrop-blur-md border border-slate-200/60 p-5 rounded-xl space-y-3 shadow-[0_1px_3px_rgba(0,0,0,0.01)]">
            <div className="p-2 bg-slate-100 rounded-lg w-fit text-slate-600">
              <Share2 size={18} />
            </div>
            <h3 className="font-semibold text-sm text-slate-900">Classroom Presentation Mode</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Supports serialization of custom visualizer inputs into Base64 query parameters. Instantly generates shareable URL links for teachers to distribute custom configurations to classrooms.
            </p>
          </div>

          {/* Card 6: Dynamic Glob Registry */}
          <div className="bg-white/70 backdrop-blur-md border border-slate-200/60 p-5 rounded-xl space-y-3 shadow-[0_1px_3px_rgba(0,0,0,0.01)]">
            <div className="p-2 bg-slate-100 rounded-lg w-fit text-slate-600">
              <Cpu size={18} />
            </div>
            <h3 className="font-semibold text-sm text-slate-900">Modular Auto-Registry</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Powered by a modular autoloader executing glob parameters. Discovers and registers custom algorithm modules across sorting, graphs, numeric calculations, and string search files automatically.
            </p>
          </div>

        </div>
      </section>

      {/* Details Grid (Core specs) */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-slate-900">Core Infrastructure</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white/70 backdrop-blur-md border border-slate-200/60 p-5 rounded-xl space-y-1.5 shadow-[0_1px_3px_rgba(0,0,0,0.01)]">
            <h3 className="font-semibold text-sm text-slate-800">Visual Telemetry</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Track local state variables, indices compare/swap events, operation statistics, and canvas nodes in real-time.
            </p>
          </div>

          <div className="bg-white/70 backdrop-blur-md border border-slate-200/60 p-5 rounded-xl space-y-1.5 shadow-[0_1px_3px_rgba(0,0,0,0.01)]">
            <h3 className="font-semibold text-sm text-slate-800">Stage Visualizers</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Supports diverse structures including 1D Arrays, 2D Matrices, Stack/Queue animations, and dynamic D3 SVG Graph layouts.
            </p>
          </div>

          <div className="bg-white/70 backdrop-blur-md border border-slate-200/60 p-5 rounded-xl space-y-1.5 shadow-[0_1px_3px_rgba(0,0,0,0.01)]">
            <h3 className="font-semibold text-sm text-slate-800">Cinema Focus Mode</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Toggle fullscreen visualization states to hide side panels and expand active visual canvases to 100% viewport width.
            </p>
          </div>
        </div>
      </section>

      {/* Mission Statement */}
      <section className="space-y-3.5 bg-white/70 backdrop-blur-md border border-slate-200/60 rounded-xl p-6 md:p-8 shadow-[0_1px_3px_rgba(0,0,0,0.01)]">
        <h2 className="text-base font-semibold text-slate-900">Mission Statement</h2>
        <p className="text-sm text-slate-500 leading-relaxed font-normal">
          Computational logic can feel abstract when locked behind compiler logs and complex notations. AlgoVista bridges this gap by translating logic into interactive graphic stages. 
          By offering granular controls, interactive recall tools, multi-algorithm duels, and sharing channels, it strives to build deep intuitive understanding for learners worldwide.
        </p>
      </section>

    </div>
  );
};
