import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Outlet, useLocation, Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

export const MainLayout: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const isHomePage = location.pathname === '/';

  return (
    <div className="flex h-full w-full bg-algo-bg text-algo-text overflow-hidden relative font-sans">
      
      {/* 
        SENSATIONAL TECHNICAL BACKGROUND GLOWS
        Paints subtle glowing lights in the corners and layout boundaries to mimic advanced UI dashboards.
      */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(128,128,128,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(128,128,128,0.03)_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none z-0" />
      <div className="absolute top-0 left-0 right-0 h-[600px] bg-gradient-to-b from-algo-primary/5 via-transparent to-transparent pointer-events-none filter blur-3xl opacity-80 z-0" />
      <div className="absolute -bottom-20 -right-20 w-[450px] h-[450px] bg-purple-500/5 rounded-full pointer-events-none filter blur-3xl opacity-60 z-0" />

      {/* MOBILE HEADER (Visible only on small screens) */}
      <div className="md:hidden absolute top-0 left-0 right-0 h-16 bg-algo-surface/80 backdrop-blur-md border-b border-algo-border flex items-center px-4 z-20 justify-between">
        <h1 className="inline-block font-extrabold text-lg bg-clip-text text-transparent bg-gradient-to-r from-algo-text to-algo-primary pb-2 pr-2 pt-1 px-1 leading-normal">
          AlgoVista
        </h1>
        {!isHomePage && (
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
            className="p-2 text-algo-muted hover:text-algo-text bg-algo-surface/50 border border-algo-border rounded-xl transition"
          >
            {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        )}
      </div>

      {/* SIDEBAR CONTAINER */}
      {/* Hides completely on landing page to maximize space for dashboard grid */}
      {!isHomePage && (
        <div className={`
          fixed inset-0 z-30 transform transition-transform duration-300 md:relative md:translate-x-0 flex flex-col shrink-0
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        `}>
          <Sidebar 
            onLinkClick={() => setIsMobileMenuOpen(false)} 
            className="h-full shadow-2xl md:shadow-none" 
          />
          
          {/* Backdrop for mobile only - clicking outside closes menu */}
          {isMobileMenuOpen && (
            <div 
              className="absolute inset-0 bg-black/60 backdrop-blur-sm -z-10 md:hidden"
              onClick={() => setIsMobileMenuOpen(false)} 
            />
          )}
        </div>
      )}
      
      {/* MAIN CONTENT */}
      <main className="flex-1 h-full overflow-y-auto scroll-smooth w-full relative z-10 flex flex-col">
        {/* Add padding top on mobile to account for the header */}
        <div className="pt-20 md:pt-8 p-6 md:p-10 max-w-[1400px] mx-auto pb-8 flex-1 w-full">
          <Outlet /> 
        </div>

        {/* DYNAMIC SEAMLESS LEGAL FOOTER */}
        <footer className="border-t border-algo-border/40 bg-algo-surface/20 backdrop-blur-md py-8 text-center text-xs text-algo-muted shrink-0 w-full mt-auto">
          <div className="max-w-[1400px] mx-auto px-6 md:px-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <span className="inline-block font-extrabold text-sm tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-algo-text to-algo-primary pb-2 pr-2 pt-1 px-1 leading-normal">
                AlgoVista
              </span>
              <span className="opacity-30">|</span>
              <span className="font-medium text-algo-muted">Made by students, for students — Visualizing Algorithms across Mathematics, CS, & Nature</span>
            </div>
            
            <div className="flex flex-wrap justify-center gap-6 font-semibold">
              <Link to="/about" className="hover:text-algo-primary transition-colors duration-300">About Suite</Link>
              <Link to="/terms" className="hover:text-algo-primary transition-colors duration-300">Terms of Use</Link>
              <Link to="/privacy" className="hover:text-algo-primary transition-colors duration-300">Privacy Policy</Link>
              <Link to="/license" className="hover:text-algo-primary transition-colors duration-300">License</Link>
            </div>
            
            <div className="text-[10px] font-mono opacity-70">
              © {new Date().getFullYear()} Chirag P Patil. All rights reserved.
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
};