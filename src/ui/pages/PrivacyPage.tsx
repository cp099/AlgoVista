import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Shield } from 'lucide-react';

export const PrivacyPage: React.FC = () => {
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
            Privacy Policy
          </h1>
          <p className="text-xs font-mono text-algo-muted font-bold tracking-widest uppercase mt-1">
            Data & Preferences
          </p>
        </div>
      </div>

      {/* Main Document Content */}
      <div className="space-y-6 text-sm text-algo-muted leading-relaxed font-semibold">
        <div className="flex items-center gap-3 p-4 bg-algo-surface/40 border border-algo-border/40 rounded-xl text-algo-text">
          <Shield size={20} className="text-algo-primary animate-pulse" />
          <span>Your privacy is paramount. AlgoVista operates entirely within your browser sandboxed workspace.</span>
        </div>

        <section className="space-y-2.5">
          <h2 className="text-base font-extrabold text-algo-text">1. Information Collection</h2>
          <p>
            AlgoVista does not collect, harvest, transmit, or share any personal identifiable information (PII). No tracking pixels, diagnostic scripts, database profiles, or telemetry data are uploaded to external web servers.
          </p>
        </section>

        <section className="space-y-2.5">
          <h2 className="text-base font-extrabold text-algo-text">2. Local Storage Preferences</h2>
          <p>
            To enhance your visual experience, preferences (such as light/dark mode selection, default step speeds, default gridline toggles, sound cue values, and custom node styling designs) are stored exclusively in your browser's local sandbox memory (`localStorage`). You can clear this data at any time by wiping your browser site settings or clicking the "Reset Defaults" button in the preferences panel.
          </p>
        </section>

        <section className="space-y-2.5">
          <h2 className="text-base font-extrabold text-algo-text">3. Third-Party Connections</h2>
          <p>
            The visual library runs fully client-side and does not rely on third-party analytical API calls. Fonts are loaded statically via secure CDNs (Google Fonts), preventing outbound user activity analysis.
          </p>
        </section>

        <section className="space-y-2.5">
          <h2 className="text-base font-extrabold text-algo-text">4. Dynamic Custom Inputs</h2>
          <p>
            Any custom datasets, node structures, graph weights, or parameters entered in the Configuration modals reside solely in the active memory frames of your React application. When the browser tab is refreshed or closed, all custom configurations are wiped.
          </p>
        </section>

        <section className="space-y-2.5">
          <h2 className="text-base font-extrabold text-algo-text">5. Contact Information</h2>
          <p>
            For questions or suggestions regarding the platform or visual algorithms, please reach out directly to the repository manager, Chirag P Patil.
          </p>
        </section>
      </div>

    </div>
  );
};
