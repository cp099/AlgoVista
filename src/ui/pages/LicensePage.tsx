import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Key } from 'lucide-react';

export const LicensePage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto py-10 px-4 space-y-10 animate-fade-in text-slate-700 font-sans">
      
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
            Licensing Terms
          </h1>
          <p className="text-[10px] font-mono text-slate-400 font-bold uppercase tracking-wider mt-0.5">
            Copyright & Use
          </p>
        </div>
      </div>

      {/* Main Document Content */}
      <div className="space-y-6 text-sm text-slate-500 leading-relaxed font-normal">
        <div className="flex items-center gap-3 p-4 bg-slate-50 border border-slate-150 rounded-lg text-slate-700">
          <Key size={18} className="text-slate-500" />
          <span>Licensing information for the AlgoVista software, visual assets, and dynamic framework.</span>
        </div>

        <section className="space-y-2">
          <h2 className="text-sm font-semibold text-slate-900">1. Copyright Owner</h2>
          <p>
            Copyright © {new Date().getFullYear()} Chirag P Patil. All rights reserved.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-semibold text-slate-900">2. Proprietary Ownership</h2>
          <p>
            The Software—including all React modules, TypeScript scripts, visual assets, CSS styles, and algorithm representation logic—is the exclusive intellectual property of the Owner (Chirag P Patil). No transfer or grant of intellectual property rights is made hereunder.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-semibold text-slate-900">3. Explicit Restrictions</h2>
          <p>
            Except for viewing the source code on GitHub and forking it within the GitHub platform as permitted under the GitHub Terms of Service, you are strictly prohibited from:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-xs text-slate-500 mt-2">
            <li><strong>Cloning & Downloading</strong>: Copying or cloning files to local machines, offline registers, or third-party Git storage.</li>
            <li><strong>Modifying & Deriving</strong>: Creating derivative works, modifying logic, or reverse-engineering visual telemetry components.</li>
            <li><strong>Redistributing</strong>: Sublicensing, distributing, or leasing the codebase in any form.</li>
            <li><strong>Hosting & Deploying</strong>: Compiling or hosting the build assets on public servers (Netlify, Vercel, GitHub Pages, Render, AWS, etc.).</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-semibold text-slate-900">4. Collaborative Contributions</h2>
          <p>
            Any submitted pull requests, issues, or codebase suggestions grant the Owner a perpetual, irrevocable, worldwide, royalty-free, fully sub-licensable license to incorporate them into the Software without credit, compensation, or restriction.
          </p>
        </section>
      </div>

    </div>
  );
};
