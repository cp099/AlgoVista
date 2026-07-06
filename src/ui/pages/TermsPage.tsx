import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Scale } from 'lucide-react';

export const TermsPage: React.FC = () => {
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
            Terms of Use
          </h1>
          <p className="text-[10px] font-mono text-slate-400 font-bold uppercase tracking-wider mt-0.5">
            Usage Policy
          </p>
        </div>
      </div>

      {/* Main Document Content */}
      <div className="space-y-6 text-sm text-slate-500 leading-relaxed font-normal">
        <div className="flex items-center gap-3 p-4 bg-slate-50 border border-slate-150 rounded-lg text-slate-700">
          <Scale size={18} className="text-slate-500" />
          <span>Please read these Terms of Use carefully before using the AlgoVista suite.</span>
        </div>

        <section className="space-y-2">
          <h2 className="text-sm font-semibold text-slate-900">1. Acceptance of Terms</h2>
          <p>
            By accessing or using the visualizer website, you agree to comply with and be bound by these Terms of Use. If you do not agree, you are advised to terminate access to the site immediately.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-semibold text-slate-900">2. Educational Purposes</h2>
          <p>
            AlgoVista is designed exclusively for educational, demonstration, and research purposes. The visualizations, calculations, metrics, complexity matrix estimations, and descriptions are intended to serve as instructional guides.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-semibold text-slate-900">3. Intellectual Property & Code Restrictions</h2>
          <p>
            The Software, rendering frameworks, visualizer designs, and all registered algorithm files are the exclusive property of Chirag P Patil and are protected under proprietary licensing. Users may view and fork the code on GitHub for personal review. However, downloading, cloning, copying, modifying, reverse-engineering, redistributing, or deploying compiled builds of this Software to public platforms (such as Netlify, Vercel, or GitHub Pages) is strictly prohibited under the terms of the project's Proprietary License.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-semibold text-slate-900">4. Warranty Disclaimer</h2>
          <p>
            THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NONINFRINGEMENT. IN NO EVENT SHALL THE COPYRIGHT HOLDERS OR CHIRAG P PATIL BE LIABLE FOR ANY CLAIM, DAMAGES, OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT, OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-semibold text-slate-900">5. Governing Law</h2>
          <p>
            These terms of use are governed by and construed in accordance with applicable copyright and intellectual property laws, without giving effect to conflict of laws principles.
          </p>
        </section>
      </div>

    </div>
  );
};
