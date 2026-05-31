import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Key } from 'lucide-react';

export const LicensePage: React.FC = () => {
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
            Licensing Terms
          </h1>
          <p className="text-xs font-mono text-algo-muted font-bold tracking-widest uppercase mt-1">
            Copyright & Use
          </p>
        </div>
      </div>

      {/* Main Document Content */}
      <div className="space-y-6 text-sm text-algo-muted leading-relaxed font-semibold">
        <div className="flex items-center gap-3 p-4 bg-algo-surface/40 border border-algo-border/40 rounded-xl text-algo-text">
          <Key size={20} className="text-algo-primary" />
          <span>Licensing information for the AlgoVista software, visual assets, and dynamic framework.</span>
        </div>

        <section className="space-y-2.5">
          <h2 className="text-base font-extrabold text-algo-text">1. Copyright Owner</h2>
          <p>
            Copyright © {new Date().getFullYear()} Chirag P Patil. All rights reserved.
          </p>
        </section>

        <section className="space-y-2.5">
          <h2 className="text-base font-extrabold text-algo-text">2. Proprietary Ownership</h2>
          <p>
            The Software—including all React modules, TypeScript scripts, visual assets, CSS styles, and algorithm representation logic—is the exclusive intellectual property of the Owner (Chirag P Patil). No transfer or grant of intellectual property rights is made hereunder.
          </p>
        </section>

        <section className="space-y-2.5">
          <h2 className="text-base font-extrabold text-algo-text">3. Explicit Restrictions</h2>
          <p>
            Except for viewing the source code on GitHub and forking it within the GitHub platform as permitted under the GitHub Terms of Service, you are strictly prohibited from:
          </p>
          <ul className="list-disc pl-5 space-y-2 text-xs font-semibold text-algo-muted mt-2">
            <li><strong>Cloning & Downloading</strong>: Copying or cloning files to local machines, offline registers, or third-party Git storage.</li>
            <li><strong>Modifying & Deriving</strong>: Creating derivative works, modifying logic, or reverse-engineering visual telemetry components.</li>
            <li><strong>Redistributing</strong>: Sublicensing, distributing, or leasing the codebase in any form.</li>
            <li><strong>Hosting & Deploying</strong>: Compiling or hosting the build assets on public servers (Netlify, Vercel, GitHub Pages, Render, AWS, etc.).</li>
          </ul>
        </section>

        <section className="space-y-2.5">
          <h2 className="text-base font-extrabold text-algo-text">4. Collaborative Contributions</h2>
          <p>
            Any submitted pull requests, issues, or codebase suggestions grant the Owner a perpetual, irrevocable, worldwide, royalty-free, fully sub-licensable license to incorporate them into the Software without credit, compensation, or restriction.
          </p>
        </section>
      </div>

    </div>
  );
};
