<div align="center">
  <svg width="72" height="72" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <filter id="logoGlow" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="1.2" result="blur" />
        <feComposite in="SourceGraphic" in2="blur" operator="over" />
      </filter>
      <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#6366f1" />
        <stop offset="100%" stopColor="#a855f7" />
      </linearGradient>
    </defs>
    <line x1="5" y1="19" x2="12" y2="5" stroke="url(#logoGrad)" stroke-width="2.5" stroke-linecap="round" filter="url(#logoGlow)" opacity="0.9" />
    <line x1="12" y1="5" x2="19" y2="19" stroke="url(#logoGrad)" stroke-width="2.5" stroke-linecap="round" filter="url(#logoGlow)" opacity="0.9" />
    <line x1="5" y1="19" x2="19" y2="19" stroke="url(#logoGrad)" stroke-width="1.5" stroke-dasharray="2 2" opacity="0.6" />
    <circle cx="12" cy="5" r="3.5" fill="#070b19" stroke="url(#logoGrad)" stroke-width="2.5" filter="url(#logoGlow)" />
    <circle cx="5" cy="19" r="3" fill="#070b19" stroke="#6366f1" stroke-width="2" />
    <circle cx="19" cy="19" r="3" fill="#070b19" stroke="#a855f7" stroke-width="2" />
  </svg>
  <h1>AlgoVista</h1>
  <p><strong>Interactive visual sandbox designed to deconstruct complex algorithms step-by-step.</strong></p>
  <p>Made by students, for students. Bridging the gap between abstract computer science, mathematics, optimization, and nature.</p>
</div>

---

## Key Features

*   **Modular Algorithm Registry**: A dynamically configured glob loader system that automatically detects, parses, and displays registered algorithm modules on the fly.
*   **Visual Telemetry Dashboard**: Step-by-step playback speed controllers, play/pause state scrubbing, responsive local state tables, active call stack tracking, and synchronized pseudocode highlights.
*   **Aesthetic & Modern Themes**: High-contrast Slate-Gray light theme and synthetic-intelligence dark theme with premium gridline overlays, customizable themes, and custom-styled scrollbars.
*   **Custom Rendering Engines**: Interactive rendering primitives built from the ground up for arrays, grids (`Matrix2D`), networks (`GraphNetwork`), and memory pipelines (`StackQueue`).
*   **Universal Algorithm Directory**: High-precision search matching on category landing pages and the universal home search bar to immediately filter through mathematical, search, sorting, and graph suites.

---

## Architecture

AlgoVista runs entirely in the browser using React, TypeScript, and Vite. The design is structured for modularity and rapid expansion:

```
src/
├── core/         # State telemetry engine, visualizer clocks, and playback loops
├── registry/     # Automated dynamic modules and Complexity Matrix configuration
├── renderer/     # Primary rendering primitives (Stage gridlines, node structures)
├── ui/
│   ├── controls/ # Playback settings, theme preferences, and global search
│   ├── layout/   # Responsive conditional layout templates, footers, and custom logos
│   ├── pages/    # Suite dashboards, legal templates, and visual sandboxes
│   └── views/    # Telemetry dashboards, code highlights, and theory drawers
```

---

## Legal & Licensing

**Copyright (c) 2026 Chirag P Patil. All Rights Reserved.**

This codebase, including all visual telemetry rendering engines, custom interactive primitives, UI design variables, and algorithm implementation files, is the proprietary intellectual property of **Chirag P Patil**.

By accessing this repository, you agree to the terms detailed in the [LICENSE](LICENSE) file:
*   **Allowed**: You may view the source code and fork the repository within the GitHub platform for personal review and study.
*   **Prohibited**: You are strictly prohibited from copying, cloning, downloading, modifying, reverse-engineering, sublicensing, or distributing this codebase on local machines or private servers.
*   **Execution & Build Restrictions**: Running, compiling, serving, or testing the codebase locally is strictly prohibited under the terms of the proprietary license. 
*   **Deployment Restrictions**: You are strictly prohibited from compiling, bundling, or deploying this codebase to public hosting environments (e.g., Netlify, Vercel, GitHub Pages, Render, AWS, etc.). All deployments are restricted to the official production server managed by the Owner.

For inquiries regarding commercial licensing or collaborative academic research, please contact Chirag P Patil.
