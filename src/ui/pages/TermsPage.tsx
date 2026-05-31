import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Scale } from 'lucide-react';

export const TermsPage: React.FC = () => {
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
            Terms of Use
          </h1>
          <p className="text-xs font-mono text-algo-muted font-bold tracking-widest uppercase mt-1">
            Usage Policy
          </p>
        </div>
      </div>

      {/* Main Document Content */}
      <div className="space-y-6 text-sm text-algo-muted leading-relaxed font-semibold">
        <div className="flex items-center gap-3 p-4 bg-algo-surface/40 border border-algo-border/40 rounded-xl text-algo-text">
          <Scale size={20} className="text-algo-primary" />
          <span>Please read these Terms of Use carefully before using the AlgoVista suite.</span>
        </div>

        <section className="space-y-2.5">
          <h2 className="text-base font-extrabold text-algo-text">1. Acceptance of Terms</h2>
          <p>
            By accessing or using the visualizer website, you agree to comply with and be bound by these Terms of Use. If you do not agree, you are advised to terminate access to the site immediately.
          </p>
        </section>

        <section className="space-y-2.5">
          <h2 className="text-base font-extrabold text-algo-text">2. Educational Purposes</h2>
          <p>
            AlgoVista is designed exclusively for educational, demonstration, and research purposes. The visualizations, calculations, metrics, complexity matrix estimations, and descriptions are intended to serve as instructional guides.
          </p>
        </section>

        <section className="space-y-2.5">
          <h2 className="text-base font-extrabold text-algo-text">3. Intellectual Property & Code Restrictions</h2>
          <p>
            The Software, rendering frameworks, visualizer designs, and all registered algorithm files are the exclusive property of Chirag P Patil and are protected under proprietary licensing. Users may view and fork the code on GitHub for personal review. However, downloading, cloning, copying, modifying, reverse-engineering, redistributing, or deploying compiled builds of this Software to public platforms (such as Netlify, Vercel, or GitHub Pages) is strictly prohibited under the terms of the project's Proprietary License.
          </p>
        </section>

        <section className="space-y-2.5">
          <h2 className="text-base font-extrabold text-algo-text">4. Warranty Disclaimer</h2>
          <p>
            THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NONINFRINGEMENT. IN NO EVENT SHALL THE COPYRIGHT HOLDERS OR CHIRAG P PATIL BE LIABLE FOR ANY CLAIM, DAMAGES, OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT, OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE.
          </p>
        </section>

        <section className="space-y-2.5">
          <h2 className="text-base font-extrabold text-algo-text">5. Governing Law</h2>
          <p>
            These terms of use are governed by and construed in accordance with applicable copyright and intellectual property laws, without giving effect to conflict of laws principles.
          </p>
        </section>
      </div>

    </div>
  );
};
