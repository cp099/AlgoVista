import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Shield } from 'lucide-react';

export const PrivacyPage: React.FC = () => {
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
            Privacy Policy
          </h1>
          <p className="text-[10px] font-mono text-slate-400 font-bold uppercase tracking-wider mt-0.5">
            Data & Preferences
          </p>
        </div>
      </div>

      {/* Main Document Content */}
      <div className="space-y-6 text-sm text-slate-500 leading-relaxed font-normal">
        <div className="flex items-center gap-3 p-4 bg-slate-50 border border-slate-150 rounded-lg text-slate-700">
          <Shield size={18} className="text-slate-500" />
          <span>Your privacy is paramount. AlgoVista operates entirely within your browser sandboxed workspace.</span>
        </div>

        <section className="space-y-2">
          <h2 className="text-sm font-semibold text-slate-900">1. Information Collection</h2>
          <p>
            AlgoVista does not collect, harvest, transmit, or share any personal identifiable information (PII). No tracking pixels, diagnostic scripts, database profiles, or telemetry data are uploaded to external web servers.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-semibold text-slate-900">2. Local Storage Preferences</h2>
          <p>
            To enhance your visual experience, preferences (such as default step speeds, default gridline toggles, sound cue values, and custom node styling designs) are stored exclusively in your browser's local sandbox memory (`localStorage`). You can clear this data at any time by wiping your browser site settings or clicking the "Reset Defaults" button in the preferences panel.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-semibold text-slate-900">3. Third-Party Connections</h2>
          <p>
            The visual library runs fully client-side and does not rely on outbound analytical API calls. Fonts are loaded statically via secure CDNs, preventing outbound user activity analysis.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-semibold text-slate-900">4. Dynamic Custom Inputs</h2>
          <p>
            Any custom datasets, node structures, graph weights, or parameters entered in the Configuration modals reside solely in the active memory frames of your React application. When the browser tab is refreshed or closed, all custom configurations are wiped.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-semibold text-slate-900">5. Contact Information</h2>
          <p>
            For questions or suggestions regarding the platform or visual algorithms, please reach out directly to the repository manager, Chirag P Patil.
          </p>
        </section>
      </div>

    </div>
  );
};
