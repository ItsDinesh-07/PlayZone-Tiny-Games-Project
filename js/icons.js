/* =========================================================
   HIGH-DPI SVG ICON SET — PlayZone v2
   Vector icons matching user provided app icon & PlayZone brand
   ========================================================= */

"use strict";

const GameIcons = {
  // PlayZone App Icon (Matching user uploaded pink-to-blue gradient controller)
  brandMark: `<svg viewBox="0 0 100 100" width="36" height="36" fill="none" class="brand-svg-mark"><circle cx="50" cy="50" r="50" fill="url(#playZoneGrad)"/><path d="M72 40H28c-7.7 0-14 6.3-14 14 0 6.6 4.6 12.2 11 13.6l3.5.8c2.8.6 5.6-1 6.6-3.7l1.4-3.7c1-2.7 3.5-4.5 6.4-4.5h16.2c2.9 0 5.4 1.8 6.4 4.5l1.4 3.7c1 2.7 3.8 4.3 6.6 3.7l3.5-.8c6.4-1.4 11-7 11-13.6 0-7.7-6.3-14-14-14z" stroke="#ffffff" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M35 48v12M29 54h12" stroke="#ffffff" stroke-width="4.5" stroke-linecap="round"/><circle cx="63" cy="49" r="2.5" fill="#ffffff"/><circle cx="71" cy="54" r="2.5" fill="#ffffff"/><circle cx="55" cy="54" r="2.5" fill="#ffffff"/><circle cx="63" cy="59" r="2.5" fill="#ffffff"/><path d="M45 49h10M45 53h10" stroke="#ffffff" stroke-width="3" stroke-linecap="round"/><path d="M50 40V33c0-3 3-5 5-3s3 5 5 3" stroke="#ffffff" stroke-width="3.5" stroke-linecap="round"/><defs><linearGradient id="playZoneGrad" x1="0" y1="0" x2="0" y2="100" gradientUnits="userSpaceOnUse"><stop stop-color="#f43f5e"/><stop offset="0.5" stop-color="#d946ef"/><stop offset="1" stop-color="#0284c7"/></linearGradient></defs></svg>`,

  brandMarkLarge: `<svg viewBox="0 0 100 100" width="60" height="60" fill="none" class="brand-svg-mark-lg"><circle cx="50" cy="50" r="50" fill="url(#playZoneGradLg)"/><path d="M72 40H28c-7.7 0-14 6.3-14 14 0 6.6 4.6 12.2 11 13.6l3.5.8c2.8.6 5.6-1 6.6-3.7l1.4-3.7c1-2.7 3.5-4.5 6.4-4.5h16.2c2.9 0 5.4 1.8 6.4 4.5l1.4 3.7c1 2.7 3.8 4.3 6.6 3.7l3.5-.8c6.4-1.4 11-7 11-13.6 0-7.7-6.3-14-14-14z" stroke="#ffffff" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M35 48v12M29 54h12" stroke="#ffffff" stroke-width="4.5" stroke-linecap="round"/><circle cx="63" cy="49" r="2.5" fill="#ffffff"/><circle cx="71" cy="54" r="2.5" fill="#ffffff"/><circle cx="55" cy="54" r="2.5" fill="#ffffff"/><circle cx="63" cy="59" r="2.5" fill="#ffffff"/><path d="M45 49h10M45 53h10" stroke="#ffffff" stroke-width="3" stroke-linecap="round"/><path d="M50 40V33c0-3 3-5 5-3s3 5 5 3" stroke="#ffffff" stroke-width="3.5" stroke-linecap="round"/><defs><linearGradient id="playZoneGradLg" x1="0" y1="0" x2="0" y2="100" gradientUnits="userSpaceOnUse"><stop stop-color="#f43f5e"/><stop offset="0.5" stop-color="#d946ef"/><stop offset="1" stop-color="#0284c7"/></linearGradient></defs></svg>`,

  // Navigation Tabs SVGs (Inactive & Active versions)
  nav: {
    home: {
      inactive: `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`,
      active: `<svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor" stroke="none"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>`
    },
    badges: {
      inactive: `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/></svg>`,
      active: `<svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor" stroke="none"><path d="M12 2a6 6 0 0 1 6 6c0 2.22-1.21 4.15-3 5.19l1.5 7.81L12 19l-4.5 2 1.5-7.81C7.21 12.15 6 10.22 6 8a6 6 0 0 1 6-6z"/></svg>`
    },
    profile: {
      inactive: `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`,
      active: `<svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor" stroke="none"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>`
    },
    settings: {
      inactive: `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>`,
      active: `<svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor" stroke="none"><path d="M19.43 12.98c.04-.32.07-.64.07-.98s-.03-.66-.07-.98l2.11-1.65c.19-.15.24-.42.12-.64l-2-3.46c-.12-.22-.39-.3-.61-.22l-2.49 1c-.52-.4-1.08-.73-1.69-.98l-.38-2.65C14.46 2.18 14.25 2 14 2h-4c-.25 0-.46.18-.49.42l-.38 2.65c-.61.25-1.17.59-1.69.98l-2.49-1c-.23-.09-.49 0-.61.22l-2 3.46c-.13.22-.07.49.12.64l2.11 1.65c-.04.32-.07.65-.07.98s.03.66.07.98l-2.11 1.65c-.19.15-.24.42-.12.64l2 3.46c.12.22.39.3.61.22l2.49-1c.52.4 1.08.73 1.69.98l.38 2.65c.03.24.24.42.49.42h4c.25 0 .46-.18.49-.42l.38-2.65c.61-.25 1.17-.59 1.69-.98l2.49 1c.23.09.49 0 .61-.22l2-3.46c.12-.22.07-.49-.12-.64l-2.11-1.65zM12 15.5c-1.93 0-3.5-1.57-3.5-3.5s1.57-3.5 3.5-3.5 3.5 1.57 3.5 3.5-1.57 3.5-3.5 3.5z"/></svg>`
    }
  },

  // UI Micro SVGs
  fire: `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" class="svg-micro orange"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>`,
  coin: `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" class="svg-micro yellow"><circle cx="12" cy="12" r="9"/><path d="M12 6v12"/><path d="M15 9.5a2.5 2.5 0 0 0-5 0c0 3 5 1.5 5 4.5a2.5 2.5 0 0 1-5 0"/></svg>`,
  star: `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" class="svg-micro cyan"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`,
  controller: `<svg viewBox="0 0 100 100" width="36" height="36" fill="none"><circle cx="50" cy="50" r="50" fill="url(#playZoneGradCtrl)"/><path d="M72 40H28c-7.7 0-14 6.3-14 14 0 6.6 4.6 12.2 11 13.6l3.5.8c2.8.6 5.6-1 6.6-3.7l1.4-3.7c1-2.7 3.5-4.5 6.4-4.5h16.2c2.9 0 5.4 1.8 6.4 4.5l1.4 3.7c1 2.7 3.8 4.3 6.6 3.7l3.5-.8c6.4-1.4 11-7 11-13.6 0-7.7-6.3-14-14-14z" stroke="#ffffff" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M35 48v12M29 54h12" stroke="#ffffff" stroke-width="4.5" stroke-linecap="round"/><circle cx="63" cy="49" r="2.5" fill="#ffffff"/><circle cx="71" cy="54" r="2.5" fill="#ffffff"/><circle cx="55" cy="54" r="2.5" fill="#ffffff"/><circle cx="63" cy="59" r="2.5" fill="#ffffff"/><path d="M45 49h10M45 53h10" stroke="#ffffff" stroke-width="3" stroke-linecap="round"/><path d="M50 40V33c0-3 3-5 5-3s3 5 5 3" stroke="#ffffff" stroke-width="3.5" stroke-linecap="round"/><defs><linearGradient id="playZoneGradCtrl" x1="0" y1="0" x2="0" y2="100" gradientUnits="userSpaceOnUse"><stop stop-color="#f43f5e"/><stop offset="0.5" stop-color="#d946ef"/><stop offset="1" stop-color="#0284c7"/></linearGradient></defs></svg>`,
  heart: `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" class="svg-micro red"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>`,

  // Memory Flip SVG Icons (10 Pairs for Hard mode)
  memoryPairs: [
    {
      id: "rocket",
      svg: `<svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="svg-icon pink"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/><path d="M12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-3.05 11a22.35 22.35 0 0 1-3.95 2z"/><path d="M9 18l-4.5 4.5"/><path d="M15 9l4.5-4.5"/></svg>`
    },
    {
      id: "gem",
      svg: `<svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="svg-icon cyan"><path d="M6 3h12l4 6-10 12L2 9z"/><path d="M11 3v18"/><path d="M2 9h20"/></svg>`
    },
    {
      id: "lightning",
      svg: `<svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="svg-icon yellow"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>`
    },
    {
      id: "star",
      svg: `<svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="svg-icon purple"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`
    },
    {
      id: "crown",
      svg: `<svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="svg-icon orange"><path d="M2 4l3 12h14l3-12-6 7-4-7-4 7-6-7z"/><circle cx="12" cy="19" r="2"/></svg>`
    },
    {
      id: "shield",
      svg: `<svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="svg-icon green"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`
    },
    {
      id: "trophy",
      svg: `<svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="svg-icon yellow"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2z"/></svg>`
    },
    {
      id: "flame",
      svg: `<svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="svg-icon orange"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>`
    },
    {
      id: "heart",
      svg: `<svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="svg-icon red"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>`
    },
    {
      id: "target",
      svg: `<svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="svg-icon cyan"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>`
    }
  ],

  // Memory Card Back Emblem SVG
  cardBack: `<svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" class="svg-icon card-back-svg"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`,

  // Game Cards SVGs
  games: {
    reflex: `<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>`,
    memory: `<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="3"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>`,
    snake: `<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a4 4 0 0 0-4 4v2a4 4 0 0 0 8 0V6a4 4 0 0 0-4-4z"/><path d="M8 12a4 4 0 0 0-4 4v2a4 4 0 0 0 8 0v-2a4 4 0 0 0-4-4z"/><path d="M16 12a4 4 0 0 0-4 4v2a4 4 0 0 0 8 0v-2a4 4 0 0 0-4-4z"/></svg>`,
    brick: `<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18"/><path d="M3 15h18"/><path d="M9 3v6"/><path d="M15 3v6"/><path d="M6 9v6"/><path d="M18 9v6"/><path d="M12 15v6"/></svg>`,
    traffic: `<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="4"/><circle cx="7.5" cy="16.5" r="1.5"/><circle cx="16.5" cy="16.5" r="1.5"/><path d="M7 11h10l-1-4H8z"/></svg>`,
    math: `<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12h16"/><path d="M12 4v16"/><path d="M16 6l4 4-4 4"/><path d="M8 18l-4-4 4-4"/></svg>`
  }
};
