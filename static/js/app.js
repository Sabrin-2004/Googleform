/**
 * Executive Portfolio Command Center
 * Clean Modular JavaScript Architecture
 */
(function(){
  'use strict';

  // ==========================================================================
  // 1. CONFIGURATION & ICONS
  // ==========================================================================
  const ICONS = {
    cloud: `<svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/></svg>`,
    refresh: `<svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/></svg>`,
    zap: `<svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>`,
    upload: `<svg viewBox="0 0 24 24" width="15" height="15" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>`,
    clipboard: `<svg viewBox="0 0 24 24" width="15" height="15" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><rect width="8" height="4" x="8" y="2" rx="1" ry="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="M12 11h4"/><path d="M12 16h4"/></svg>`,
    plus: `<svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>`,
    download: `<svg viewBox="0 0 24 24" width="15" height="15" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>`,
    alert: `<svg viewBox="0 0 24 24" width="15" height="15" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
    lock: `<svg viewBox="0 0 24 24" width="12" height="12" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>`,
    eye: `<svg viewBox="0 0 24 24" width="13" height="13" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>`,
    eyeOff: `<svg viewBox="0 0 24 24" width="13" height="13" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" y1="2" x2="22" y2="22"/></svg>`,
    settings: `<svg viewBox="0 0 24 24" width="13" height="13" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>`,
    table: `<svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v18"/><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 9h18"/><path d="M3 15h18"/></svg>`,
    package: `<svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="m7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg>`,
    fileCode: `<svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/></svg>`,
    edit: `<svg viewBox="0 0 24 24" width="13" height="13" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>`,
    trash: `<svg viewBox="0 0 24 24" width="13" height="13" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>`,
    chevronDown: `<svg viewBox="0 0 24 24" width="11" height="11" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>`,
    user: `<svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`,
    logOut: `<svg viewBox="0 0 24 24" width="13" height="13" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>`,
    webhook: `<svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M18 16.98h-5.99c-1.1 0-1.95.94-2.48 1.9A4 4 0 0 1 2 17c0-2.21 1.79-4 4-4h5.99c1.1 0 1.95-.94 2.48-1.9A4 4 0 0 1 22 13c0 2.21-1.79 4-4 4z"/></svg>`,
    code: `<svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>`,
    copy: `<svg viewBox="0 0 24 24" width="13" height="13" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>`,
    check: `<svg viewBox="0 0 24 24" width="13" height="13" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`,
    terminal: `<svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/></svg>`
  };

  function icon(name, extraClass = ''){
    const svg = ICONS[name] || '';
    if(!extraClass) return svg;
    return svg.replace('<svg ', `<svg class="${extraClass}" `);
  }

  // ==========================================================================
  // 2. TOAST NOTIFICATION SERVICE
  // ==========================================================================
  const Toast = {
    show(message, type = 'info', duration = 3500){
      const container = document.getElementById('gcc-toast-container');
      if(!container) return;
      const toast = document.createElement('div');
      toast.className = `gcc-toast ${type}`;
      toast.innerHTML = `
        <span style="display:inline-flex;">${type==='success'?icon('zap'):(type==='error'?icon('alert'):icon('cloud'))}</span>
        <span style="flex:1;">${escapeHtml(message)}</span>
      `;
      container.appendChild(toast);
      setTimeout(()=>{
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(10px)';
        toast.style.transition = 'all 0.2s ease';
        setTimeout(()=> toast.remove(), 250);
      }, duration);
    },
    success(msg){ this.show(msg, 'success'); },
    error(msg){ this.show(msg, 'error', 5500); },
    info(msg){ this.show(msg, 'info'); }
  };

  // ==========================================================================
  // 3. API & STORAGE ENGINE
  // ==========================================================================
  let isBackendConnected = false;
  let isSyncingSheets = false;
  let stagedFiles = [];
  let persistentUploadStatus = null;
  let activeStatusDropdown = null;
  const REFRESH_TOKEN_KEY = 'gcc_refresh_token';
  let refreshInFlight = null;

  // Authentication State
  // Authentication is carried by the HttpOnly gcc_session cookie, never JavaScript-readable storage.
  let currentUser = null;
  try {
    const savedUser = sessionStorage.getItem('gcc_user');
    if(savedUser) currentUser = JSON.parse(savedUser);
  } catch(e){}

  function isAdmin(){
    return Boolean(currentUser && (currentUser.role === 'admin' || currentUser.role === 'Administrator'));
  }
  function isViewer(){
    return !isAdmin();
  }

  function storeRefreshToken(refreshToken){
    if(!refreshToken) return;
    sessionStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  }

  function clearStoredSession(){
    sessionStorage.removeItem('gcc_user');
    sessionStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  }

  function redirectToLogin(){
    clearStoredSession();
    window.location.href = '/login';
  }

  async function tryRefreshToken(){
    const refreshToken = sessionStorage.getItem(REFRESH_TOKEN_KEY) || localStorage.getItem(REFRESH_TOKEN_KEY);
    if(!refreshToken) return false;
    if(refreshInFlight) return refreshInFlight;

    refreshInFlight = (async ()=>{
      try {
        const res = await fetch('/api/auth/refresh', {
          method: 'POST',
          credentials: 'same-origin',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({refresh_token: refreshToken})
        });
        if(!res.ok) return false;
        const data = await res.json();
        if(!data.success || !data.refresh_token) return false;
        storeRefreshToken(data.refresh_token);
        if(data.user){
          currentUser = data.user;
          sessionStorage.setItem('gcc_user', JSON.stringify(currentUser));
        }
        return true;
      } catch(e) {
        return false;
      } finally {
        refreshInFlight = null;
      }
    })();
    return refreshInFlight;
  }

  async function apiFetch(endpoint, options = {}, retriedAfterRefresh = false){
    options = {...options, headers: {...(options.headers || {})}};
    try {
      const res = await fetch(endpoint, {...options, credentials: options.credentials || 'same-origin'});
      if (res.ok) {
        isBackendConnected = true;
        return await res.json();
      }
      if(res.status === 401 && endpoint !== '/api/auth/login' && endpoint !== '/api/auth/refresh'){
        if(!retriedAfterRefresh && await tryRefreshToken()){
          return apiFetch(endpoint, options, true);
        }
        redirectToLogin();
      }
      let errText = `HTTP ${res.status}: ${res.statusText}`;
      try {
        const errJson = await res.json();
        if (errJson.detail) errText = errJson.detail;
        else if (errJson.error) errText = errJson.error;
      } catch(e){}
      throw new Error(errText);
    } catch(err) {
      if (endpoint === '/api/data') isBackendConnected = false;
      throw err;
    }
  }

  async function checkAuthSession(){
    try {
      const res = await apiFetch('/api/auth/me');
      if(res && res.authenticated && res.user){
        currentUser = res.user;
        sessionStorage.setItem('gcc_user', JSON.stringify(currentUser));
        if(isViewer()){
          document.body.classList.add('gcc-viewer-mode');
        } else {
          document.body.classList.remove('gcc-viewer-mode');
        }
        return true;
      }
    } catch(e){
      if(currentUser && (currentUser.email || currentUser.username)){
        if(isViewer()){
          document.body.classList.add('gcc-viewer-mode');
        } else {
          document.body.classList.remove('gcc-viewer-mode');
        }
        return true;
      }
      window.location.href = '/login';
    }
    return false;
  }

  async function performLogin(username, password){
    if(!username || !password){
      throw new Error('Please provide both email/username and password.');
    }
    try {
      const res = await apiFetch('/api/auth/login', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ email: username, username, password })
      });
      if(res && res.success){
        currentUser = res.user;
        sessionStorage.setItem('gcc_user', JSON.stringify(currentUser));
        storeRefreshToken(res.refresh_token);
        if(isViewer()){
          document.body.classList.add('gcc-viewer-mode');
        } else {
          document.body.classList.remove('gcc-viewer-mode');
        }
        return currentUser;
      }
    } catch(err){
      throw err;
    }
  }

  async function performLogout(){
    try {
      // The session token is HttpOnly, so JavaScript cannot inspect it. Always
      // ask the server to clear the session cookie before navigating away.
      await fetch('/api/auth/logout', { method: 'POST', credentials: 'same-origin' });
    } catch(e){}
    currentUser = null;
    sessionUnlocked = false;
    clearStoredSession();
    window.location.href = '/login';
  }

  function defaultSettings(){
    return {
      colors: {
        attention: '#F85149', progress: '#58A6FF', done: '#3FB950', hold: '#8B949E', future: '#6E7681',
        text: '#F0F3F6', muted: '#8B949E', tableText: '#F0F3F6', labelText: '#8B949E', tableHeaderText: '#8B949E'
      },
      companyColors: { Pranik: '#3FA796', Aarna: '#E0A458', Miraee: '#8B7FD1', Abhee: '#E0705C', RedT: '#5B8DEF', 'Casa Monde': '#C77DD0' },
      companies: [
        {id: 'Pranik', name: 'Pranik'},
        {id: 'Aarna', name: 'Aarna'},
        {id: 'Miraee', name: 'Miraee'},
        {id: 'Abhee', name: 'Abhee'},
        {id: 'RedT', name: 'RedT'},
        {id: 'Casa Monde', name: 'Casa Monde'}
      ],
      statuses: ['Blocked', 'Delayed', 'On Hold', 'WIP', 'To Start', 'Planned', 'To Plan', 'Future', 'Done'],
      statusBuckets: {
        'Blocked': 'attention', 'Delayed': 'attention', 'On Hold': 'hold', 'WIP': 'progress',
        'To Start': 'progress', 'Planned': 'progress', 'To Plan': 'progress', 'Future': 'future', 'Done': 'done'
      },
      columns: [
        {key: 'company', label: 'Company', visible: true},
        {key: 'function', label: 'Function', visible: true},
        {key: 'item', label: 'Item', visible: true},
        {key: 'owner', label: 'Owner', visible: true},
        {key: 'founderDependency', label: 'Founder Dependency', visible: true},
        {key: 'status', label: 'Status', visible: true},
        {key: 'comments', label: 'Comments', visible: false}
      ],
      decisionColumns: [
        {key: 'decision', label: 'Decision', visible: true},
        {key: 'owner', label: 'Owner', visible: true},
        {key: 'status', label: 'Status', visible: true},
        {key: 'founderDependency', label: 'Founder Dependency', visible: false},
        {key: 'impact', label: 'Impact if delayed', visible: true},
        {key: 'deadline', label: 'Deadline', visible: false},
        {key: 'nextReview', label: 'Next Review', visible: false}
      ],
      kpis: [
        {id: 'bucket:attention', label: 'Needs attention', visible: true},
        {id: 'bucket:hold', label: 'On hold', visible: true},
        {id: 'bucket:progress', label: 'In progress', visible: true},
        {id: 'bucket:done', label: 'Done', visible: true}
      ],
      emphasis: {},
      pin: '',
      tabs: [
        {key: 'overview', label: 'Overview', visible: true},
        {key: 'register', label: 'Register', visible: true},
        {key: 'decisions', label: 'Decisions', visible: true},
        {key: 'priorities', label: 'Priorities', visible: true},
        {key: 'data', label: 'Data', visible: true},
        {key: 'webhooks', label: 'Webhooks', visible: true},
        {key: 'settings', label: 'Settings', visible: true}
      ],
      overviewSections: { companyHealth: true, needsAttention: true, founderReview: true, decisionQueue: true },
      spotlightStatuses: ['Blocked', 'Delayed', 'On Hold'],
      googleSheets: {
        sheetId: '',
        target: 'all',
        mode: 'merge',
        autoSyncIntervalMinutes: 0,
        lastSyncTime: null,
        syncStatus: 'idle',
        syncMessage: ''
      },
      webhookSettings: {
        enabled: true,
        secretKey: '',
        defaultTarget: 'all',
        autoApprove: true
      }
    };
  }

  function seedData(){
    return {
      lastUpdated: new Date().toISOString(),
      settings: defaultSettings(),
      actions: [
        {id:"a1", company:"Aarna", function:"Content", item:"Creatorpreneur Content Studio (CCS) Plan", status:"Done", owner:"Saurav", founderDependency:"None", due:'', comments:""},
        {id:"a2", company:"Aarna", function:"Content", item:"Medical Tourism Database", status:"Done", owner:"Lakshmi", founderDependency:"None", due:'', comments:""},
        {id:"a3", company:"Aarna", function:"Content", item:"MICE Database", status:"Done", owner:"Jalpa", founderDependency:"None", due:'', comments:""},
        {id:"a4", company:"Aarna", function:"Content", item:"Experiences database", status:"Done", owner:"Raghava", founderDependency:"None", due:'', comments:""},
        {id:"a5", company:"Aarna", function:"ONDC", item:"Direction on what we will share (Videos, Images) as a seller app.", status:"Done", owner:"Kiran", founderDependency:"None", due:'', comments:""},
        {id:"a6", company:"Aarna", function:"ONDC", item:"ONDC (Experiences) Team formation", status:"Done", owner:"Prasad", founderDependency:"None", due:'', comments:""},
        {id:"a7", company:"Aarna", function:"Product", item:"AI-driven personalized recommendation system", status:"Done", owner:"Kiran", founderDependency:"None", due:'', comments:"in vibe"},
        {id:"a8", company:"Aarna", function:"Product", item:"Q&A capability for real-time product enquiries", status:"Done", owner:"Kiran", founderDependency:"None", due:'', comments:""},
        {id:"a9", company:"Aarna", function:"Product", item:"Quantitative metrics dashboard (products, transactions)", status:"Done", owner:"Kiran", founderDependency:"None", due:'', comments:""},
        {id:"a10", company:"Aarna", function:"Product", item:"Resolve Phase-1 Gemini integration issues and retrain agents with new input format requirements", status:"Done", owner:"Kiran", founderDependency:"None", due:'', comments:""},
        {id:"a11", company:"Aarna", function:"GTM", item:"Develop detailed demand-side GTM strategy", status:"Done", owner:"Nikhil", founderDependency:"None", due:'', comments:"Integrate transit tourism opportunities into strategy"},
        {id:"a12", company:"Aarna", function:"GTM", item:"B2B distribution Plan", status:"Done", owner:"Nikhil", founderDependency:"None", due:'', comments:""},
        {id:"a13", company:"Aarna", function:"GTM", item:"Detailed execution plan at vision level", status:"Done", owner:"Nikhil", founderDependency:"None", due:'', comments:""},
        {id:"a54", company:"Aarna", function:"GTM", item:"Digital Stores Onboarding Plan- Creatorpreneur Digital Store Owner (C. DSO)", status:"On Hold", owner:"Kiran", founderDependency:"Delayed", due:'', comments:""},
        {id:"a73", company:"Aarna", function:"GTM", item:"Going to market with Aarna OS (ES incl)- Vibe Feature Review", status:"To Start", owner:"Kiran", founderDependency:"To Review", due:'', comments:""},
        {id:"a80", company:"Aarna", function:"Product", item:"finalize screens showing business/catalog/pricing/inventory with examples for all 5 verticals", status:"WIP", owner:"Bhuvan", founderDependency:"None", due:'', comments:""},
        {id:"a87", company:"Abhee", function:"GTM", item:"UAE: Execution Plan & P&L", status:"Done", owner:"Nikhil", founderDependency:"None", due:'', comments:""},
        {id:"a96", company:"Abhee", function:"Product", item:"Feedback: Explore Section Logic & Trips Section Design Screens", status:"To Start", owner:"Vishwa", founderDependency:"To Review", due:'', comments:""},
        {id:"a108", company:"Abhee", function:"Product", item:"Trip Flows: Booking history in the trip section & Pre-trip recommendations", status:"WIP", owner:"Vishwa", founderDependency:"Ongoing", due:'', comments:""},
        {id:"a121", company:"Pranik", function:"GTM", item:"Identify Sick Units- Hyd, Chennai, Mumbai", status:"On Hold", owner:"Kiran", founderDependency:"Decision", due:'', comments:"Is this a Priority in Phase-1?"},
        {id:"a122", company:"Pranik", function:"Product", item:"Constant Care- Cancer Integration", status:"Future", owner:"Natesh", founderDependency:"Decision", due:'', comments:""},
        {id:"a143", company:"Pranik", function:"Product", item:"Auto assignment of doctors with CDSS & Scribe", status:"Done", owner:"Praveen", founderDependency:"None", due:'', comments:"Deployed CDSS & Scribe"}
      ],
      decisions: [
        {id:"d1", decision:"Avaitor's Project Assignment", owner:"Prasad", status:"To Start", founderDependency:"Delayed", impact:"Unused resources", deadline:"", nextReview:""},
        {id:"d2", decision:"UAE GTM- Execution Plan", owner:"Nikhil", status:"WIP", founderDependency:"To Review", impact:"Loss of opportunity", deadline:"", nextReview:""},
        {id:"d3", decision:"Exp. Creation Plan", owner:"Saurav", status:"Done", founderDependency:"To Review", impact:"1st mover advantage lost", deadline:"", nextReview:""},
        {id:"d4", decision:"Pranik-0 Product Demo", owner:"Kiran", status:"Done", founderDependency:"To Review", impact:"Loss of market penetration", deadline:"", nextReview:""},
        {id:"d5", decision:"Legal Agreements", owner:"Anagha", status:"To Start", founderDependency:"Delayed", impact:"Loss of opportunity", deadline:"", nextReview:""},
        {id:"d6", decision:"Qwipo-CP Plan", owner:"Siva, Vamshi", status:"To Start", founderDependency:"Delayed", impact:"Loss of market penetration", deadline:"", nextReview:""}
      ],
      priorities: [
        {id:'p1', priority:'1.0', group:'Pranik Products', focusArea:'P4P / P4D / P4H Integration', why:'Product readiness for rapid GTM rollout', horizon:'Next 15 days'},
        {id:'p2', priority:'2.0', group:'Pranik GTM', focusArea:'Indian Army & SPV Partnerships', why:'Data source for SLMs and market leadership', horizon:'Next 30 days'},
        {id:'p3', priority:'2.0', group:'Pranik Centres', focusArea:'Smart Clinic POC Model', why:'Establish standard operating procedures', horizon:'Next 60 days'},
        {id:'p4', priority:'3.0', group:'Aarna Product', focusArea:'Digital Stores & Whitelight Platform', why:'Core feature set readiness for creators', horizon:'Next 30 days'},
        {id:'p5', priority:'4.0', group:'Aarna GTM', focusArea:'Creatorpreneur Acquisition Drive', why:'Scale onboarded stores across 15 categories', horizon:'Next 60 days'},
        {id:'p6', priority:'5.0', group:'Miraee Product', focusArea:'Revenue Generation Engine', why:'Primary driver of initial cash flows', horizon:'Next 15 days'}
      ]
    };
  }

  // Application State
  let state = null;
  let view = 'overview';
  let sessionUnlocked = false;
  let activeOverviewKpi = null;
  let filters = {
    register: {company:'', status:'', function:'', owner:'', founderDependency:'', q:'', showHidden:false},
    decisions: {owner:'', founderDependency:'', q:'', showHidden:false},
    priorities: {q:''},
    overview: {q:''}
  };
  let jumpTarget = null;
  let autoSyncTimer = null;

  const app = document.getElementById('gcc-app');
  const modalContainer = document.getElementById('gcc-modal-container') || createModalContainer();

  function createModalContainer(){
    let mc = document.getElementById('gcc-modal-container');
    if(!mc){
      mc = document.createElement('div');
      mc.id = 'gcc-modal-container';
      document.body.appendChild(mc);
    }
    return mc;
  }

  async function loadState(){
    await checkAuthSession();
    try {
      const remote = await apiFetch('/api/data');
      state = remote;
      isBackendConnected = true;
      localStorage.setItem('gcc-data', JSON.stringify(state));
    } catch(e) {
      try {
        const local = localStorage.getItem('gcc-data');
        state = local ? JSON.parse(local) : seedData();
      } catch(err) {
        state = seedData();
      }
    }

    const d = defaultSettings();
    state.settings = Object.assign({}, d, state.settings);
    state.settings.colors = Object.assign({}, d.colors, state.settings.colors);
    state.settings.companyColors = Object.assign({}, d.companyColors, state.settings.companyColors);
    if(!Array.isArray(state.settings.columns) || !state.settings.columns.length) state.settings.columns = d.columns;
    if(!Array.isArray(state.settings.decisionColumns) || !state.settings.decisionColumns.length) state.settings.decisionColumns = d.decisionColumns;
    if(!Array.isArray(state.settings.companies) || !state.settings.companies.length) state.settings.companies = d.companies;
    if(!Array.isArray(state.settings.statuses) || !state.settings.statuses.length) state.settings.statuses = d.statuses;
    state.settings.statusBuckets = Object.assign({}, d.statusBuckets, state.settings.statusBuckets);
    if(!Array.isArray(state.settings.kpis) || !state.settings.kpis.length) state.settings.kpis = d.kpis;
    if(!Array.isArray(state.settings.tabs) || !state.settings.tabs.length) state.settings.tabs = d.tabs;
    d.tabs.forEach(t=>{ if(!state.settings.tabs.some(x=>x.key===t.key)) state.settings.tabs.push(t); });
    state.settings.overviewSections = Object.assign({}, d.overviewSections, state.settings.overviewSections);
    if(!Array.isArray(state.settings.spotlightStatuses)) state.settings.spotlightStatuses = d.spotlightStatuses;
    state.settings.googleSheets = Object.assign({}, d.googleSheets, state.settings.googleSheets);
    state.settings.webhookSettings = Object.assign({}, d.webhookSettings, state.settings.webhookSettings);

    applyTheme();
    render();
    setupAutoSync();
  }

  // Admin event-driven refresh: called after every successful admin mutation
  let isReloadingData = false;
  async function reloadDashboardData(){
    if(!isAdmin() || isReloadingData) return;
    isReloadingData = true;
    try {
      const remote = await apiFetch('/api/data');
      if(remote){
        state = remote;
        const d = defaultSettings();
        state.settings = Object.assign({}, d, state.settings);
        state.settings.colors = Object.assign({}, d.colors, state.settings.colors);
        state.settings.companyColors = Object.assign({}, d.companyColors, state.settings.companyColors);
        applyTheme();
        localStorage.setItem('gcc-data', JSON.stringify(state));
        render();
      }
    } catch(err){
      console.error('[admin] Failed to reload dashboard data:', err);
    } finally {
      isReloadingData = false;
    }
  }

  // Viewer-only: apply remote data when admin changes are detected
  async function applyRemoteIfChanged(remote){
    if(!remote || !remote.lastUpdated) return;
    if(state && remote.lastUpdated === state.lastUpdated) return;
    state = remote;
    const d = defaultSettings();
    state.settings = Object.assign({}, d, state.settings);
    state.settings.colors = Object.assign({}, d.colors, state.settings.colors);
    state.settings.companyColors = Object.assign({}, d.companyColors, state.settings.companyColors);
    applyTheme();
    localStorage.setItem('gcc-data', JSON.stringify(state));
    render();
  }

  async function saveState(silent = false){
    state.lastUpdated = new Date().toISOString();
    localStorage.setItem('gcc-data', JSON.stringify(state));

    if(isBackendConnected){
      try {
        await apiFetch('/api/save', {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify(state)
        });
        if(!silent) Toast.success('Saved to server.');
        if(isAdmin()){
          await reloadDashboardData();
        }
      } catch(e) {
        if(!silent) Toast.info('Saved locally (Server offline).');
      }
    } else {
      if(!silent) Toast.info('Saved locally.');
    }
  }

  function applyTheme(){
    if(!state || !state.settings || !state.settings.colors) return;
    const c = state.settings.colors;
    const root = document.documentElement;
    root.style.setProperty('--attention', c.attention || '#F85149');
    root.style.setProperty('--progress', c.progress || '#58A6FF');
    root.style.setProperty('--done', c.done || '#3FB950');
    root.style.setProperty('--hold', c.hold || '#8B949E');
    root.style.setProperty('--future', c.future || '#6E7681');
    root.style.setProperty('--text', c.text || '#F0F3F6');
    root.style.setProperty('--text-muted', c.muted || '#8B949E');
    root.style.setProperty('--table-text', c.tableText || '#F0F3F6');
    root.style.setProperty('--label-text', c.labelText || '#8B949E');
    root.style.setProperty('--table-header-text', c.tableHeaderText || '#8B949E');
  }

  function companiesList(){ return (state && state.settings && state.settings.companies) || []; }
  function statusesList(){ return (state && state.settings && state.settings.statuses) || []; }
  function companyColor(cid){ return (state.settings && state.settings.companyColors && state.settings.companyColors[cid]) || '#5A5F6B'; }
  function statusBucket(s){ return (state && state.settings && state.settings.statusBuckets && state.settings.statusBuckets[s]) || 'future'; }

  function bucketColors(st){
    const b = statusBucket(st);
    if(b==='attention') return ['var(--attention-soft)','var(--attention)'];
    if(b==='hold') return ['var(--hold-soft)','var(--hold)'];
    if(b==='progress') return ['var(--progress-soft)','var(--progress)'];
    if(b==='done') return ['var(--done-soft)','var(--done)'];
    return ['var(--future-soft)','var(--future)'];
  }

  function emphClass(st){
    const e = (state && state.settings && state.settings.emphasis && state.settings.emphasis[st]) || 'normal';
    if(e==='hi') return 'gcc-emph-hi';
    if(e==='dim') return 'gcc-emph-dim';
    return '';
  }

  function companyStats(cid){
    const items = state.actions.filter(a=>a.company===cid && !a.hidden);
    const total = items.length;
    const attention = items.filter(a=>statusBucket(a.status)==='attention').length;
    const hold = items.filter(a=>statusBucket(a.status)==='hold').length;
    const progress = items.filter(a=>statusBucket(a.status)==='progress').length;
    const done = items.filter(a=>statusBucket(a.status)==='done').length;
    const future = items.filter(a=>statusBucket(a.status)==='future').length;
    return {total, attention, hold, progress, done, future};
  }

  function setupAutoSync(){
    if(autoSyncTimer) clearInterval(autoSyncTimer);
    const mins = state.settings.googleSheets.autoSyncIntervalMinutes || 0;
    if(mins > 0 && isBackendConnected){
      autoSyncTimer = setInterval(()=> syncGoogleSheets(false), mins * 60 * 1000);
    }
  }

  async function syncGoogleSheets(interactive = true, selectedMode = null){
    const sheetIdInput = document.getElementById('gs-sheet-id');
    const sheetId = sheetIdInput ? sheetIdInput.value.trim() : state.settings.googleSheets.sheetId;
    const mode = selectedMode || (document.getElementById('gs-sync-mode') && document.getElementById('gs-sync-mode').value) || state.settings.googleSheets.mode || 'merge';
    const target = (document.getElementById('gs-sync-target') && document.getElementById('gs-sync-target').value) || state.settings.googleSheets.target || 'all';

    if(!sheetId && interactive){
      Toast.error('Please enter a Google Sheet ID or published URL.');
      return;
    }

    isSyncingSheets = true;
    renderTopPill();
    if(interactive) Toast.info('Syncing Google Sheets…');

    try {
      const res = await apiFetch('/api/sync/google-sheets', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ sheetId, mode, target })
      });
      if(res.success){
        const latestData = await apiFetch('/api/data');
        state = latestData;
        localStorage.setItem('gcc-data', JSON.stringify(state));
        Toast.success(res.message || 'Google Sheets synced successfully.');
        if(interactive && target !== 'all' && ['register', 'decisions', 'priorities'].includes(target)){
          view = target;
        }
      }
    } catch(err) {
      Toast.error(`Sync error: ${err.message}`);
    } finally {
      isSyncingSheets = false;
      render();
    }
  }

  // ==========================================================================
  // Credentials Manager Logic (Hot-Reload without server restart)
  // ==========================================================================

  let _stagedCredsFile = null;

  async function loadCredsStatus() {
    const pill = document.getElementById('creds-status-pill');
    const emailEl = document.getElementById('creds-email-display');
    const projectEl = document.getElementById('creds-project-display');
    const keyIdEl = document.getElementById('creds-keyid-display');
    const sourceEl = document.getElementById('creds-source-display');
    const hintEl = document.getElementById('creds-share-hint');
    if (!pill) return;

    try {
      const data = await apiFetch('/api/credentials/status');
      if (data.hasCredentials) {
        pill.textContent = '🟢 Active';
        pill.style.background = 'var(--done)';
        if (emailEl) emailEl.textContent = data.clientEmail || '—';
        if (projectEl) projectEl.textContent = data.projectId || '—';
        if (keyIdEl) keyIdEl.textContent = data.privateKeyId ? data.privateKeyId.substring(0, 12) + '…' : '—';
        if (sourceEl) sourceEl.textContent = data.source || '—';
        if (hintEl) hintEl.textContent = data.shareInstruction || '';
      } else {
        pill.textContent = '⚪ Not Configured';
        pill.style.background = 'var(--hold)';
        if (emailEl) emailEl.textContent = 'No credentials found';
        if (hintEl) hintEl.textContent = 'Upload a credentials.json file below to connect to Google Sheets API.';
      }
    } catch (e) {
      if (pill) { pill.textContent = '🔴 Error'; pill.style.background = 'var(--attention)'; }
    }
  }

  function wireCredsManager() {
    // Load status immediately on render
    loadCredsStatus();

    // Copy email button
    const copyBtn = document.getElementById('btn-copy-sa-email');
    if (copyBtn) {
      copyBtn.onclick = () => {
        const email = document.getElementById('creds-email-display')?.textContent?.trim();
        if (email && email !== 'Loading…' && email !== 'No credentials found') {
          navigator.clipboard.writeText(email).then(() => Toast.success('Service Account email copied!')).catch(() => Toast.error('Copy failed'));
        }
      };
    }

    // Test connection button
    const testBtn = document.getElementById('btn-test-creds');
    if (testBtn) {
      testBtn.onclick = async () => {
        testBtn.disabled = true;
        testBtn.textContent = '⏳ Testing…';
        const sheetId = document.getElementById('gs-sheet-id')?.value?.trim() || state.settings.googleSheets?.sheetId || '';
        const resultEl = document.getElementById('creds-test-result');
        try {
          const res = await apiFetch('/api/credentials/test', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sheetId: sheetId || undefined })
          });
          if (resultEl) {
            resultEl.style.display = 'block';
            resultEl.style.background = 'rgba(63,185,80,0.12)';
            resultEl.style.border = '1px solid var(--done)';
            resultEl.style.color = 'var(--done)';
            const tabs = res.details?.worksheets ? `<br><strong>Worksheets:</strong> ${res.details.worksheets.join(', ')}` : '';
            resultEl.innerHTML = `✅ ${res.message}${tabs}`;
          }
          Toast.success('Connection test passed!');
        } catch (err) {
          if (resultEl) {
            resultEl.style.display = 'block';
            resultEl.style.background = 'rgba(248,81,73,0.12)';
            resultEl.style.border = '1px solid var(--attention)';
            resultEl.style.color = 'var(--attention)';
            resultEl.innerHTML = `❌ ${err.message}`;
          }
          Toast.error(`Test failed: ${err.message}`);
        } finally {
          testBtn.disabled = false;
          testBtn.innerHTML = `${icon('zap')} Test Connection`;
        }
      };
    }

    // Browse button
    const browseBtn = document.getElementById('creds-browse-btn');
    const fileInput = document.getElementById('creds-file-input');
    if (browseBtn && fileInput) browseBtn.onclick = () => fileInput.click();

    // Drag & drop zone for credentials.json
    const dropzone = document.getElementById('creds-dropzone');
    if (dropzone) {
      dropzone.ondragover = (e) => { e.preventDefault(); dropzone.style.borderColor = 'var(--progress)'; };
      dropzone.ondragleave = () => { dropzone.style.borderColor = ''; };
      dropzone.ondrop = (e) => {
        e.preventDefault();
        dropzone.style.borderColor = '';
        const f = e.dataTransfer.files[0];
        if (f) stageCredsFile(f);
      };
    }

    if (fileInput) {
      fileInput.onchange = () => { if (fileInput.files[0]) stageCredsFile(fileInput.files[0]); };
    }

    // Upload & Activate button
    const uploadBtn = document.getElementById('btn-upload-creds');
    if (uploadBtn) {
      uploadBtn.onclick = async () => {
        if (!_stagedCredsFile) { Toast.error('No file selected.'); return; }
        uploadBtn.disabled = true;
        uploadBtn.textContent = '⏳ Uploading…';
        try {
          const formData = new FormData();
          formData.append('file', _stagedCredsFile);
          const res = await fetch('/api/credentials/upload', { method: 'POST', body: formData });
          const data = await res.json();
          if (!res.ok) throw new Error(data.detail || 'Upload failed');
          Toast.success(data.message || 'Credentials activated!');
          _stagedCredsFile = null;
          const stagedEl = document.getElementById('creds-staged-name');
          if (stagedEl) stagedEl.style.display = 'none';
          uploadBtn.style.display = 'none';
          await loadCredsStatus();
        } catch (err) {
          Toast.error(`Upload failed: ${err.message}`);
        } finally {
          uploadBtn.disabled = false;
          uploadBtn.innerHTML = `${icon('upload')} Upload & Activate Key`;
        }
      };
    }

    // Cleanup fallback button
    const cleanupBtn = document.getElementById('btn-cleanup-fallback');
    if (cleanupBtn) {
      cleanupBtn.onclick = async () => {
        if (!confirm('Remove all "Google Sheet" fallback rows? This cannot be undone.')) return;
        cleanupBtn.disabled = true;
        try {
          const res = await apiFetch('/api/companies/cleanup-fallback', { method: 'POST' });
          Toast.success(`Removed ${res.removedActions} action(s), ${res.removedDecisions} decision(s), ${res.removedPriorities} priority item(s) labelled "Google Sheet".`);
          const latestData = await apiFetch('/api/data');
          state = latestData;
          localStorage.setItem('gcc-data', JSON.stringify(state));
          render();
        } catch (err) {
          Toast.error(`Cleanup failed: ${err.message}`);
        } finally {
          cleanupBtn.disabled = false;
        }
      };
    }
  }

  function stageCredsFile(file) {
    if (!file.name.endsWith('.json')) { Toast.error('Please select a .json credentials file.'); return; }
    _stagedCredsFile = file;
    const stagedEl = document.getElementById('creds-staged-name');
    if (stagedEl) { stagedEl.style.display = 'block'; stagedEl.textContent = `📄 Staged: ${file.name} (${(file.size / 1024).toFixed(1)} KB) — ready to upload`; }
    const uploadBtn = document.getElementById('btn-upload-creds');
    if (uploadBtn) uploadBtn.style.display = 'inline-flex';
    Toast.info(`${file.name} staged. Click "Upload & Activate Key" to apply.`);
  }

  function editingLocked(){
    return !!(state.settings && state.settings.pin && state.settings.pin.length && !sessionUnlocked);
  }

  function renderTopPill(){
    const el = document.getElementById('top-status-pill');
    if(!el) return;
    const lastSync = state.settings.googleSheets.lastSyncTime ? new Date(state.settings.googleSheets.lastSyncTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : null;
    el.innerHTML = `
      <span class="gcc-status-dot ${isSyncingSheets ? 'syncing' : (isBackendConnected ? '' : 'offline')}"></span>
      <span>${isSyncingSheets ? 'Syncing…' : (isBackendConnected ? 'Backend Live' : 'Standalone')}</span>
      ${lastSync ? `<span style="color:var(--text-dim);">· Synced ${lastSync}</span>` : ''}
    `;
  }

  // ==========================================================================
  // 4. CLIENT-SIDE MULTI-FILE FALLBACK PARSERS (SheetJS)
  // ==========================================================================
  // ==========================================================================
  // Client-Side Import Fallback Engine
  // ==========================================================================
  async function parseFilesClientSide(files, destination = 'all', mode = 'merge', options = {}){
    const {
      conflictStrategy = 'incoming_wins',
      minQualityScore = 0.0,
      excludedStatuses = ['archived', 'cancelled', 'deleted', 'trash'],
      dateStart = null,
      dateEnd = null,
      newCompanyName = ''
    } = options;

    let appended = 0, updated = 0, skipped = 0, flagged = 0, deleted = 0, sheetsProcessed = 0;
    const conflicts = [];
    const matched = { actions: new Set(), decisions: new Set(), priorities: new Set() };
    // Delete & Merge always protects dashboard changes; incoming values only fill blanks.
    const effectiveConflictStrategy = mode === 'delete_merge' ? 'existing_wins' : conflictStrategy;
    const fillBlankFields = (existing, incoming) => {
      Object.entries(incoming).forEach(([key, value]) => {
        if(key !== 'id' && !existing[key] && value) existing[key] = value;
      });
    };
    
    if(destination === 'create_new' && newCompanyName){
      const compId = newCompanyName.toLowerCase().replace(/[^a-z0-9]/g, '_');
      if(!state.settings.companies.some(c=> c.id === compId || c.name.toLowerCase() === newCompanyName.toLowerCase())){
        state.settings.companies.push({ id: compId, name: newCompanyName });
        state.settings.companyColors[compId] = '#4C9AFF';
      }
    }

    if(mode === 'replace'){
      if(destination === 'all' || destination === 'register') state.actions = [];
      if(destination === 'all' || destination === 'decisions') state.decisions = [];
      if(destination === 'all' || destination === 'priorities') state.priorities = [];
    }

    for(const file of files){
      const fname = file.name || '';
      const fnameLower = fname.toLowerCase();
      const buffer = await file.arrayBuffer();

      if(fnameLower.endsWith('.csv') || fnameLower.endsWith('.xlsx') || fnameLower.endsWith('.xls')){
        if(typeof XLSX === 'undefined'){
          throw new Error("SheetJS is not loaded for client-side parsing.");
        }
        const workbook = XLSX.read(buffer, {type: 'array'});
        for(const sheetName of workbook.SheetNames){
          sheetsProcessed++;
          const worksheet = workbook.Sheets[sheetName];
          const jsonRows = XLSX.utils.sheet_to_json(worksheet, {defval: ''});
          if(!jsonRows.length) continue;

          const sNameLower = sheetName.toLowerCase().trim();
          let detected = destination;
          if(destination === 'all'){
            if(sNameLower.includes('decision')) detected = 'decisions';
            else if(sNameLower.includes('priority') || sNameLower.includes('focus')) detected = 'priorities';
            else detected = 'register';
          }

          for(const r of jsonRows){
            if(detected === 'decisions'){
              const title = r.Decision || r['Decision Required'] || r.Title || r.Item || '';
              if(!title || String(title).trim().length < 2){ skipped++; continue; }
              const st = String(r.Status || 'To Start').trim().toLowerCase();
              if(excludedStatuses.includes(st)){ skipped++; continue; }

              const norm = {
                id: 'd_' + Math.random().toString(36).slice(2, 9),
                decision: String(title).trim(),
                owner: String(r.Owner || '').trim(),
                status: String(r.Status || 'To Start').trim(),
                founderDependency: String(r['Founder Dependency'] || 'To Review').trim(),
                impact: String(r.Impact || r['Impact if delayed'] || '').trim(),
                deadline: String(r.Deadline || '').trim(),
                nextReview: String(r['Next Review'] || '').trim()
              };

              const existing = state.decisions.find(d=> d.decision.toLowerCase().replace(/[^a-z0-9]/g,'') === norm.decision.toLowerCase().replace(/[^a-z0-9]/g,''));
              if(existing && (mode === 'merge' || mode === 'delete_merge')){
                matched.decisions.add(existing.id);
                if(effectiveConflictStrategy === 'incoming_wins'){
                  Object.assign(existing, { owner: norm.owner || existing.owner, status: norm.status || existing.status, impact: norm.impact || existing.impact });
                  updated++;
                } else if(effectiveConflictStrategy === 'existing_wins'){
                  fillBlankFields(existing, norm);
                  updated++;
                } else if(conflictStrategy === 'manual_review'){
                  flagged++;
                  conflicts.push({ type: 'decision', id: existing.id, existing, incoming: norm, diffs: { status: { existing: existing.status, incoming: norm.status } } });
                }
              } else {
                if(mode === 'delete_merge') matched.decisions.add(norm.id);
                state.decisions.unshift(norm);
                appended++;
              }
            } else if(detected === 'priorities'){
              const focus = r['Focus Area'] || r.Focus || r.Item || r.Initiative || '';
              if(!focus || String(focus).trim().length < 2){ skipped++; continue; }

              const norm = {
                id: 'p_' + Math.random().toString(36).slice(2, 9),
                priority: String(r.Priority || '1.0').trim(),
                group: String(r.Group || r.Company || 'Strategic Focus').trim(),
                focusArea: String(focus).trim(),
                why: String(r.Why || '').trim(),
                horizon: String(r.Horizon || 'Next 30 days').trim()
              };

              const existing = state.priorities.find(p=> p.focusArea.toLowerCase().replace(/[^a-z0-9]/g,'') === norm.focusArea.toLowerCase().replace(/[^a-z0-9]/g,''));
              if(existing && (mode === 'merge' || mode === 'delete_merge')){
                matched.priorities.add(existing.id);
                if(effectiveConflictStrategy === 'incoming_wins'){
                  Object.assign(existing, { priority: norm.priority || existing.priority, why: norm.why || existing.why, horizon: norm.horizon || existing.horizon });
                  updated++;
                } else if(effectiveConflictStrategy === 'existing_wins'){
                  fillBlankFields(existing, norm);
                  updated++;
                }
              } else {
                if(mode === 'delete_merge') matched.priorities.add(norm.id);
                state.priorities.unshift(norm);
                appended++;
              }
            } else {
              // Register / Actions
              const comp = destination === 'create_new' && newCompanyName ? newCompanyName : ((!['actions', 'action items', 'sheet1', 'data'].includes(sNameLower)) ? sheetName.trim() : 'General');
              const item = r['Action Item'] || r.Item || r.Task || r.Action || '';
              if(!item || String(item).trim().length < 2){ skipped++; continue; }
              const st = String(r.Status || 'WIP').trim().toLowerCase();
              if(excludedStatuses.includes(st)){ skipped++; continue; }

              const norm = {
                id: 'a_' + Math.random().toString(36).slice(2, 9),
                company: String(r.Company || comp).trim(),
                function: String(r.Function || 'General').trim(),
                item: String(item).trim(),
                status: String(r.Status || 'WIP').trim(),
                owner: String(r.Owner || '').trim(),
                founderDependency: String(r['Founder Dependency'] || 'None').trim(),
                due: String(r.Due || '').trim(),
                comments: String(r.Comments || '').trim()
              };

              const existing = state.actions.find(a=> a.company.toLowerCase() === norm.company.toLowerCase() && a.item.toLowerCase().replace(/[^a-z0-9]/g,'') === norm.item.toLowerCase().replace(/[^a-z0-9]/g,''));
              if(existing && (mode === 'merge' || mode === 'delete_merge')){
                matched.actions.add(existing.id);
                if(effectiveConflictStrategy === 'incoming_wins'){
                  Object.assign(existing, { status: norm.status || existing.status, owner: norm.owner || existing.owner, function: norm.function || existing.function, due: norm.due || existing.due });
                  updated++;
                } else if(effectiveConflictStrategy === 'existing_wins'){
                  fillBlankFields(existing, norm);
                  updated++;
                } else if(conflictStrategy === 'manual_review'){
                  flagged++;
                  conflicts.push({ type: 'action', id: existing.id, existing, incoming: norm, diffs: { status: { existing: existing.status, incoming: norm.status } } });
                }
              } else {
                if(mode === 'delete_merge') matched.actions.add(norm.id);
                state.actions.unshift(norm);
                appended++;
              }
            }
          }
        }
      }
    }

    if(mode === 'delete_merge'){
      if(destination === 'all' || destination === 'register' || destination === 'create_new'){
        const kept = state.actions.filter(a => matched.actions.has(a.id));
        deleted += state.actions.length - kept.length;
        state.actions = kept;
      }
      if(destination === 'all' || destination === 'decisions'){
        const kept = state.decisions.filter(d => matched.decisions.has(d.id));
        deleted += state.decisions.length - kept.length;
        state.decisions = kept;
      }
      if(destination === 'all' || destination === 'priorities'){
        const kept = state.priorities.filter(p => matched.priorities.has(p.id));
        deleted += state.priorities.length - kept.length;
        state.priorities = kept;
      }
    }

    await saveState(true);
    return {
      message: `Processed ${sheetsProcessed} sheet(s): ${appended} appended, ${updated} updated, ${deleted} removed, ${skipped} skipped, ${flagged} flagged.`,
      counts: { appended, updated, deleted, skipped, flagged, sheets_processed: sheetsProcessed },
      conflicts
    };
  }

  // ==========================================================================
  // Conflict Resolution Modal
  // ==========================================================================
  function openConflictResolutionModal(conflicts, onResolved){
    if(!conflicts || !conflicts.length) return;

    const titleHtml = `<span class="gcc-icon-inline">${icon('alertTriangle')}</span>Review ${conflicts.length} Overlapping Record Conflict(s)`;
    
    let itemsHtml = `<div class="gcc-conflict-list">`;
    conflicts.forEach((c, idx)=>{
      const existing = c.existing || {};
      const incoming = c.incoming || {};
      const diffs = c.diffs || {};
      const itemName = existing.item || existing.decision || existing.focusArea || `Item #${idx+1}`;
      const itemType = c.type ? c.type.toUpperCase() : 'RECORD';

      itemsHtml += `
        <div class="gcc-conflict-item" id="conflict-card-${idx}">
          <div class="gcc-conflict-header">
            <div><span class="gcc-badge" style="background:var(--panel-elevated);color:var(--text-muted);margin-right:8px;">${itemType}</span><strong>${escapeHtml(itemName)}</strong></div>
            <div class="gcc-row-flex" style="gap:8px;">
              <button class="gcc-btn sm" id="btn-conf-incoming-${idx}">Use Incoming</button>
              <button class="gcc-btn secondary sm" id="btn-conf-existing-${idx}">Keep Existing</button>
            </div>
          </div>
          <div class="gcc-diff-grid">
            <div class="gcc-diff-col existing">
              <div class="gcc-diff-title">Current Dashboard Record</div>
              ${Object.keys(existing).filter(k=> !['id'].includes(k)).map(k=>{
                const hasDiff = diffs[k] !== undefined;
                return `
                  <div class="gcc-diff-field">
                    <span class="gcc-diff-field-name">${k}:</span>
                    <span class="gcc-diff-field-val ${hasDiff ? 'changed' : ''}">${escapeHtml(String(existing[k]||'—'))}</span>
                  </div>
                `;
              }).join('')}
            </div>
            <div class="gcc-diff-col incoming">
              <div class="gcc-diff-title">Incoming Import Record</div>
              ${Object.keys(incoming).filter(k=> !['id'].includes(k)).map(k=>{
                const hasDiff = diffs[k] !== undefined;
                return `
                  <div class="gcc-diff-field">
                    <span class="gcc-diff-field-name">${k}:</span>
                    <span class="gcc-diff-field-val ${hasDiff ? 'changed' : ''}">${escapeHtml(String(incoming[k]||'—'))}</span>
                  </div>
                `;
              }).join('')}
            </div>
          </div>
        </div>
      `;
    });
    itemsHtml += `</div>`;

    const footerHtml = `
      <button class="gcc-btn" id="btn-conf-all-incoming">${icon('check')} Resolve All with Incoming</button>
      <button class="gcc-btn secondary" id="btn-conf-all-existing">Keep All Existing</button>
      <button class="gcc-btn secondary" id="btn-conf-dismiss">Dismiss</button>
    `;

    showModal(titleHtml, itemsHtml, footerHtml);

    // Wire Per-Conflict Handlers
    conflicts.forEach((c, idx)=>{
      const btnIn = document.getElementById(`btn-conf-incoming-${idx}`);
      const btnEx = document.getElementById(`btn-conf-existing-${idx}`);
      const card = document.getElementById(`conflict-card-${idx}`);

      if(btnIn){
        btnIn.onclick = async ()=>{
          btnIn.disabled = true;
          if(isBackendConnected){
            await apiFetch('/api/conflicts/resolve', {
              method: 'POST',
              body: JSON.stringify({
                resolutions: [{ id: c.id, type: c.type, resolution: 'use_incoming', incoming: c.incoming }]
              })
            });
          } else {
            // Standalone client state update
            if(c.type === 'action'){
              const target = state.actions.find(a=> a.id === c.id);
              if(target) Object.assign(target, c.incoming);
            } else if(c.type === 'decision'){
              const target = state.decisions.find(d=> d.id === c.id);
              if(target) Object.assign(target, c.incoming);
            } else if(c.type === 'priority'){
              const target = state.priorities.find(p=> p.id === c.id);
              if(target) Object.assign(target, c.incoming);
            }
            await saveState(true);
          }
          if(card) card.style.opacity = '0.4';
          Toast.success("Resolved using incoming record");
        };
      }

      if(btnEx){
        btnEx.onclick = ()=>{
          if(card) card.style.opacity = '0.4';
          Toast.info("Preserved existing record");
        };
      }
    });

    // Wire Bulk Handlers
    const btnAllIn = document.getElementById('btn-conf-all-incoming');
    const btnAllEx = document.getElementById('btn-conf-all-existing');
    const btnDismiss = document.getElementById('btn-conf-dismiss');

    if(btnAllIn){
      btnAllIn.onclick = async ()=>{
        btnAllIn.disabled = true;
        btnAllIn.innerHTML = `${icon('refresh', 'gcc-svg-spin')} Resolving…`;
        if(isBackendConnected){
          await apiFetch('/api/conflicts/resolve', {
            method: 'POST',
            body: JSON.stringify({
              resolutions: conflicts.map(c=> ({ id: c.id, type: c.type, resolution: 'use_incoming', incoming: c.incoming }))
            })
          });
          const latest = await apiFetch('/api/data');
          state = latest;
        } else {
          for(const c of conflicts){
            if(c.type === 'action'){
              const target = state.actions.find(a=> a.id === c.id);
              if(target) Object.assign(target, c.incoming);
            } else if(c.type === 'decision'){
              const target = state.decisions.find(d=> d.id === c.id);
              if(target) Object.assign(target, c.incoming);
            } else if(c.type === 'priority'){
              const target = state.priorities.find(p=> p.id === c.id);
              if(target) Object.assign(target, c.incoming);
            }
          }
          await saveState(true);
        }
        closeModal();
        Toast.success(`Resolved all ${conflicts.length} conflict(s) with incoming data.`);
        if(onResolved) onResolved();
        render();
      };
    }

    if(btnAllEx){
      btnAllEx.onclick = ()=>{
        closeModal();
        Toast.info("Preserved all existing records.");
        if(onResolved) onResolved();
      };
    }

    if(btnDismiss){
      btnDismiss.onclick = closeModal;
    }
  }

  // ==========================================================================
  // 5. INTERACTIVE STATUS QUICK-PICKER
  // ==========================================================================
  function showStatusQuickPicker(targetEl, currentStatus, onSelect){
    closeStatusDropdown();
    const rect = targetEl.getBoundingClientRect();
    const dropdown = document.createElement('div');
    dropdown.className = 'gcc-status-dropdown';
    dropdown.style.top = `${rect.bottom + window.scrollY + 4}px`;
    dropdown.style.left = `${Math.max(10, rect.left + window.scrollX - 20)}px`;

    dropdown.innerHTML = statusesList().map(s=>{
      const [soft, solid] = bucketColors(s);
      return `
        <button data-status="${escapeHtml(s)}">
          <span style="width:8px;height:8px;border-radius:50%;background:${solid};display:inline-block;"></span>
          <span style="${s===currentStatus?'font-weight:700;color:var(--text);':''}">${escapeHtml(s)}</span>
        </button>
      `;
    }).join('');

    dropdown.querySelectorAll('button').forEach(btn=>{
      btn.onclick = (e)=>{
        e.stopPropagation();
        const selected = btn.dataset.status;
        closeStatusDropdown();
        onSelect(selected);
      };
    });

    document.body.appendChild(dropdown);
    activeStatusDropdown = dropdown;

    const onDocClick = (e)=>{
      if(!dropdown.contains(e.target) && e.target !== targetEl){
        closeStatusDropdown();
        document.removeEventListener('click', onDocClick);
      }
    };
    setTimeout(()=> document.addEventListener('click', onDocClick), 10);
  }

  function closeStatusDropdown(){
    if(activeStatusDropdown){
      activeStatusDropdown.remove();
      activeStatusDropdown = null;
    }
  }

  // ==========================================================================
  // 6. MODALS SYSTEM (EDIT / ADD DIALOGS)
  // ==========================================================================
  function showModal(titleHtml, bodyHtml, footerHtml){
    const mc = createModalContainer();
    mc.innerHTML = `
      <div class="gcc-modal-backdrop" id="gcc-modal-backdrop">
        <div class="gcc-modal" id="gcc-modal-box">
          <div class="gcc-modal-header">
            <div class="gcc-modal-title">${titleHtml}</div>
            <button class="gcc-modal-close" id="gcc-modal-close-btn">&times;</button>
          </div>
          <div class="gcc-modal-body">
            ${bodyHtml}
          </div>
          <div class="gcc-modal-footer">
            ${footerHtml}
          </div>
        </div>
      </div>
    `;

    document.getElementById('gcc-modal-close-btn').onclick = closeModal;
    document.getElementById('gcc-modal-backdrop').onclick = (e)=>{
      if(e.target.id === 'gcc-modal-backdrop') closeModal();
    };
  }

  function closeModal(){
    const mc = document.getElementById('gcc-modal-container');
    if(mc) mc.innerHTML = '';
  }

  // Edit Action Item Modal
  function openEditActionModal(actionId){
    const a = state.actions.find(x=>x.id === actionId);
    if(!a) return;

    const titleHtml = `${icon('edit')} Edit Action Item`;
    const bodyHtml = `
      <div class="gcc-form">
        <label>Action Item Description</label>
        <textarea id="edit-act-item" class="gcc-textarea" style="min-height:75px;">${escapeHtml(a.item)}</textarea>
        
        <div class="two">
          <div>
            <label>Company</label>
            <select id="edit-act-company">
              ${companiesList().map(c=>`<option value="${c.id}" ${a.company===c.id?'selected':''}>${c.name}</option>`).join('')}
            </select>
          </div>
          <div>
            <label>Function</label>
            <input id="edit-act-function" value="${escapeHtml(a.function||'General')}"/>
          </div>
        </div>

        <div class="two">
          <div>
            <label>Owner</label>
            <input id="edit-act-owner" value="${escapeHtml(a.owner||'')}"/>
          </div>
          <div>
            <label>Status</label>
            <select id="edit-act-status">
              ${statusesList().map(s=>`<option value="${s}" ${a.status===s?'selected':''}>${s}</option>`).join('')}
            </select>
          </div>
        </div>

        <div class="two">
          <div>
            <label>Founder Dependency</label>
            <input id="edit-act-founder" value="${escapeHtml(a.founderDependency||'None')}"/>
          </div>
          <div>
            <label>Due Date</label>
            <input id="edit-act-due" value="${escapeHtml(a.due||'')}"/>
          </div>
        </div>

        <label>Notes / Comments</label>
        <textarea id="edit-act-comments" class="gcc-textarea" style="min-height:60px;">${escapeHtml(a.comments||'')}</textarea>
      </div>
    `;

    const footerHtml = `
      <button class="gcc-btn danger" id="btn-delete-act">${icon('trash')} Delete</button>
      <div style="display:flex;gap:8px;">
        <button class="gcc-btn secondary" onclick="document.getElementById('gcc-modal-close-btn').click();">Cancel</button>
        <button class="gcc-btn" id="btn-save-act">Save Changes</button>
      </div>
    `;

    showModal(titleHtml, bodyHtml, footerHtml);

    document.getElementById('btn-save-act').onclick = async ()=>{
      const newItem = document.getElementById('edit-act-item').value.trim();
      if(!newItem){ Toast.error('Item description is required.'); return; }

      a.item = newItem;
      a.company = document.getElementById('edit-act-company').value;
      a.function = document.getElementById('edit-act-function').value.trim() || 'General';
      a.owner = document.getElementById('edit-act-owner').value.trim();
      a.status = document.getElementById('edit-act-status').value;
      a.founderDependency = document.getElementById('edit-act-founder').value.trim() || 'None';
      a.due = document.getElementById('edit-act-due').value.trim();
      a.comments = document.getElementById('edit-act-comments').value.trim();

      closeModal();
      await saveState(true);
      Toast.success('Action item updated.');
      render();
    };

    document.getElementById('btn-delete-act').onclick = async ()=>{
      if(!confirm('Delete this action item?')) return;
      state.actions = state.actions.filter(x=>x.id !== actionId);
      closeModal();
      await saveState(true);
      Toast.info('Action item deleted.');
      render();
    };
  }

  // Quick Add Action Item Modal
  function openAddActionModal(){
    const titleHtml = `${icon('plus')} Add New Action Item`;
    const defaultComp = filters.register.company || (companiesList()[0]?.id) || 'General';
    const bodyHtml = `
      <div class="gcc-form">
        <label>Action Item Description <span style="color:var(--attention);">*</span></label>
        <textarea id="add-act-item" class="gcc-textarea" style="min-height:75px;" placeholder="e.g. Finalize Q3 vendor contract negotiations and compliance audit"></textarea>
        
        <div class="two">
          <div>
            <label>Company</label>
            <select id="add-act-company">
              ${companiesList().map(c=>`<option value="${c.id}" ${defaultComp===c.id?'selected':''}>${c.name}</option>`).join('')}
            </select>
          </div>
          <div>
            <label>Function / Department</label>
            <input id="add-act-function" placeholder="e.g. GTM, Product, Operations" value="${escapeHtml(filters.register.function || 'General')}"/>
          </div>
        </div>

        <div class="two">
          <div>
            <label>Owner / Assignee</label>
            <input id="add-act-owner" placeholder="e.g. Kiran, Sarah" value="${escapeHtml(filters.register.owner || '')}"/>
          </div>
          <div>
            <label>Status</label>
            <select id="add-act-status">
              ${statusesList().map(s=>`<option value="${s}" ${s==='WIP'||s==='In Progress'?'selected':''}>${s}</option>`).join('')}
            </select>
          </div>
        </div>

        <div class="two">
          <div>
            <label>Founder Dependency</label>
            <select id="add-act-founder">
              <option value="None">None</option>
              <option value="To Review">To Review</option>
              <option value="Decision">Decision</option>
              <option value="Clarity">Clarity</option>
              <option value="Blocker">Blocker</option>
            </select>
          </div>
          <div>
            <label>Due Date</label>
            <input id="add-act-due" placeholder="e.g. 2026-09-15 or Next Week"/>
          </div>
        </div>

        <label>Notes / Comments</label>
        <textarea id="add-act-comments" class="gcc-textarea" style="min-height:60px;" placeholder="Additional context, links, or remarks…"></textarea>
      </div>
    `;

    const footerHtml = `
      <div></div>
      <div style="display:flex;gap:8px;">
        <button class="gcc-btn secondary" onclick="document.getElementById('gcc-modal-close-btn').click();">Cancel</button>
        <button class="gcc-btn" id="btn-submit-add-act">${icon('plus')} Create Action Item</button>
      </div>
    `;

    showModal(titleHtml, bodyHtml, footerHtml);

    document.getElementById('btn-submit-add-act').onclick = async ()=>{
      const newItem = document.getElementById('add-act-item').value.trim();
      if(!newItem){ Toast.error('Action item description is required.'); return; }

      const newAction = {
        id: 'a_' + Date.now() + '_' + Math.random().toString(36).slice(2,6),
        item: newItem,
        company: document.getElementById('add-act-company').value,
        function: document.getElementById('add-act-function').value.trim() || 'General',
        owner: document.getElementById('add-act-owner').value.trim(),
        status: document.getElementById('add-act-status').value,
        founderDependency: document.getElementById('add-act-founder').value.trim() || 'None',
        due: document.getElementById('add-act-due').value.trim(),
        comments: document.getElementById('add-act-comments').value.trim(),
        hidden: false
      };

      state.actions.unshift(newAction);
      closeModal();
      await saveState(true);
      Toast.success('Action item created successfully.');
      render();
    };
  }

  // Edit Decision Modal
  function openEditDecisionModal(decisionId){
    const d = state.decisions.find(x=>x.id === decisionId);
    if(!d) return;

    const titleHtml = `${icon('edit')} Edit Decision`;
    const bodyHtml = `
      <div class="gcc-form">
        <label>Decision Required</label>
        <textarea id="edit-dec-title" class="gcc-textarea" style="min-height:75px;">${escapeHtml(d.decision)}</textarea>
        
        <div class="two">
          <div>
            <label>Owner</label>
            <input id="edit-dec-owner" value="${escapeHtml(d.owner||'')}"/>
          </div>
          <div>
            <label>Status</label>
            <select id="edit-dec-status">
              ${statusesList().map(s=>`<option value="${s}" ${d.status===s?'selected':''}>${s}</option>`).join('')}
            </select>
          </div>
        </div>

        <div class="two">
          <div>
            <label>Founder Dependency</label>
            <input id="edit-dec-founder" value="${escapeHtml(d.founderDependency||'To Review')}"/>
          </div>
          <div>
            <label>Deadline</label>
            <input id="edit-dec-deadline" value="${escapeHtml(d.deadline||'')}"/>
          </div>
        </div>

        <label>Impact if Delayed</label>
        <input id="edit-dec-impact" value="${escapeHtml(d.impact||'')}"/>
      </div>
    `;

    const footerHtml = `
      <button class="gcc-btn danger" id="btn-delete-dec">${icon('trash')} Delete</button>
      <div style="display:flex;gap:8px;">
        <button class="gcc-btn secondary" onclick="document.getElementById('gcc-modal-close-btn').click();">Cancel</button>
        <button class="gcc-btn" id="btn-save-dec">Save Changes</button>
      </div>
    `;

    showModal(titleHtml, bodyHtml, footerHtml);

    document.getElementById('btn-save-dec').onclick = async ()=>{
      const newTitle = document.getElementById('edit-dec-title').value.trim();
      if(!newTitle){ Toast.error('Decision title is required.'); return; }

      d.decision = newTitle;
      d.owner = document.getElementById('edit-dec-owner').value.trim();
      d.status = document.getElementById('edit-dec-status').value;
      d.founderDependency = document.getElementById('edit-dec-founder').value.trim() || 'None';
      d.deadline = document.getElementById('edit-dec-deadline').value.trim();
      d.impact = document.getElementById('edit-dec-impact').value.trim();

      closeModal();
      await saveState(true);
      Toast.success('Decision updated.');
      render();
    };

    document.getElementById('btn-delete-dec').onclick = async ()=>{
      if(!confirm('Delete this decision?')) return;
      state.decisions = state.decisions.filter(x=>x.id !== decisionId);
      closeModal();
      await saveState(true);
      Toast.info('Decision deleted.');
      render();
    };
  }

  // Quick Add Decision Modal
  function openAddDecisionModal(){
    const titleHtml = `${icon('plus')} Add New Decision`;
    const bodyHtml = `
      <div class="gcc-form">
        <label>Decision Required</label>
        <textarea id="add-dec-title" class="gcc-textarea" style="min-height:75px;" placeholder="e.g. Expand marketing budget for Q3"></textarea>
        <div class="two">
          <div><label>Owner</label><input id="add-dec-owner" placeholder="Owner name"/></div>
          <div>
            <label>Status</label>
            <select id="add-dec-status">${statusesList().map(s=>`<option value="${s}">${s}</option>`).join('')}</select>
          </div>
        </div>
        <div class="two">
          <div><label>Founder Dependency</label><input id="add-dec-founder" value="To Review"/></div>
          <div><label>Deadline</label><input id="add-dec-deadline" placeholder="e.g. Next Week"/></div>
        </div>
        <label>Impact if Delayed</label>
        <input id="add-dec-impact" placeholder="e.g. Loss of market opportunity"/>
      </div>
    `;

    const footerHtml = `
      <div></div>
      <div style="display:flex;gap:8px;">
        <button class="gcc-btn secondary" onclick="document.getElementById('gcc-modal-close-btn').click();">Cancel</button>
        <button class="gcc-btn" id="btn-submit-add-dec">Create Decision</button>
      </div>
    `;

    showModal(titleHtml, bodyHtml, footerHtml);

    document.getElementById('btn-submit-add-dec').onclick = async ()=>{
      const title = document.getElementById('add-dec-title').value.trim();
      if(!title){ Toast.error('Decision title is required.'); return; }

      state.decisions.unshift({
        id: 'd_' + Date.now() + '_' + Math.random().toString(36).slice(2,6),
        decision: title,
        owner: document.getElementById('add-dec-owner').value.trim(),
        status: document.getElementById('add-dec-status').value,
        founderDependency: document.getElementById('add-dec-founder').value.trim() || 'To Review',
        impact: document.getElementById('add-dec-impact').value.trim(),
        deadline: document.getElementById('add-dec-deadline').value.trim(),
        nextReview: ''
      });

      closeModal();
      await saveState(true);
      Toast.success('Decision created.');
      render();
    };
  }

  // Edit Priority Modal
  function openEditPriorityModal(priorityId){
    const p = state.priorities.find(x=>x.id === priorityId);
    if(!p) return;

    const titleHtml = `${icon('edit')} Edit Strategic Priority`;
    const bodyHtml = `
      <div class="gcc-form">
        <div class="two">
          <div><label>Priority Rank</label><input id="edit-prio-num" value="${escapeHtml(p.priority||'1.0')}"/></div>
          <div><label>Strategic Group</label><input id="edit-prio-group" value="${escapeHtml(p.group||'Strategic Focus')}"/></div>
        </div>
        <label>Focus Area / Initiative</label>
        <input id="edit-prio-focus" value="${escapeHtml(p.focusArea)}"/>
        <label>Strategic 'Why' & Impact</label>
        <textarea id="edit-prio-why" class="gcc-textarea" style="min-height:60px;">${escapeHtml(p.why||'')}</textarea>
        <label>Time Horizon</label>
        <input id="edit-prio-horizon" value="${escapeHtml(p.horizon||'Next 30 days')}"/>
      </div>
    `;

    const footerHtml = `
      <button class="gcc-btn danger" id="btn-delete-prio">${icon('trash')} Delete</button>
      <div style="display:flex;gap:8px;">
        <button class="gcc-btn secondary" onclick="document.getElementById('gcc-modal-close-btn').click();">Cancel</button>
        <button class="gcc-btn" id="btn-save-prio">Save Changes</button>
      </div>
    `;

    showModal(titleHtml, bodyHtml, footerHtml);

    document.getElementById('btn-save-prio').onclick = async ()=>{
      const focus = document.getElementById('edit-prio-focus').value.trim();
      if(!focus){ Toast.error('Focus area is required.'); return; }

      p.priority = document.getElementById('edit-prio-num').value.trim() || '1.0';
      p.group = document.getElementById('edit-prio-group').value.trim() || 'Strategic Focus';
      p.focusArea = focus;
      p.why = document.getElementById('edit-prio-why').value.trim();
      p.horizon = document.getElementById('edit-prio-horizon').value.trim();

      closeModal();
      await saveState(true);
      Toast.success('Priority updated.');
      render();
    };

    document.getElementById('btn-delete-prio').onclick = async ()=>{
      if(!confirm('Delete this priority?')) return;
      state.priorities = state.priorities.filter(x=>x.id !== priorityId);
      closeModal();
      await saveState(true);
      Toast.info('Priority deleted.');
      render();
    };
  }

  // Quick Add Priority Modal
  function openAddPriorityModal(){
    const titleHtml = `${icon('plus')} Add Strategic Priority`;
    const bodyHtml = `
      <div class="gcc-form">
        <div class="two">
          <div><label>Priority Rank</label><input id="add-prio-num" value="1.0"/></div>
          <div><label>Strategic Group</label><input id="add-prio-group" placeholder="e.g. Pranik Products, Aarna GTM"/></div>
        </div>
        <label>Focus Area / Initiative</label>
        <input id="add-prio-focus" placeholder="e.g. SLM Model Fine-Tuning & Integration"/>
        <label>Strategic 'Why' & Impact</label>
        <textarea id="add-prio-why" class="gcc-textarea" style="min-height:60px;" placeholder="Why this matters right now…"></textarea>
        <label>Time Horizon</label>
        <input id="add-prio-horizon" value="Next 30 days"/>
      </div>
    `;

    const footerHtml = `
      <div></div>
      <div style="display:flex;gap:8px;">
        <button class="gcc-btn secondary" onclick="document.getElementById('gcc-modal-close-btn').click();">Cancel</button>
        <button class="gcc-btn" id="btn-submit-add-prio">Create Priority</button>
      </div>
    `;

    showModal(titleHtml, bodyHtml, footerHtml);

    document.getElementById('btn-submit-add-prio').onclick = async ()=>{
      const focus = document.getElementById('add-prio-focus').value.trim();
      if(!focus){ Toast.error('Focus area is required.'); return; }

      state.priorities.unshift({
        id: 'p_' + Date.now() + '_' + Math.random().toString(36).slice(2,6),
        priority: document.getElementById('add-prio-num').value.trim() || '1.0',
        group: document.getElementById('add-prio-group').value.trim() || 'Strategic Focus',
        focusArea: focus,
        why: document.getElementById('add-prio-why').value.trim(),
        horizon: document.getElementById('add-prio-horizon').value.trim() || 'Next 30 days'
      });

      closeModal();
      await saveState(true);
      Toast.success('Priority created.');
      render();
    };
  }

  // ==========================================================================
  // 7. VIEW RENDERERS
  // ==========================================================================
  function metricValue(id){
    const all = state.actions.filter(a=>!a.hidden);
    if(id==='total') return all.length;
    if(id.startsWith('bucket:')){
      const b = id.slice(7);
      return all.filter(a=>statusBucket(a.status)===b).length;
    }
    if(id.startsWith('status:')){
      const s = id.slice(7);
      return all.filter(a=>a.status===s).length;
    }
    return 0;
  }
  function statusesForMetric(id){
    if(id==='total') return statusesList().slice();
    if(id.startsWith('bucket:')) return statusesList().filter(s=>statusBucket(s)===id.slice(7));
    if(id.startsWith('status:')) return [id.slice(7)];
    return [];
  }
  function metricColorVar(id){
    if(id==='bucket:attention') return 'var(--attention)';
    if(id==='bucket:hold') return 'var(--hold)';
    if(id==='bucket:progress') return 'var(--progress)';
    if(id==='bucket:done') return 'var(--done)';
    return 'var(--text)';
  }

  function renderSpotlightGroups(spotItems){
    if(!spotItems.length) return `<div class="gcc-empty">No action items matching your highlighted status filters.</div>`;
    const groups = {};
    spotItems.forEach(a=>{
      const st = a.status;
      if(!groups[st]) groups[st] = [];
      groups[st].push(a);
    });

    return `
      <div class="gcc-alist">
        ${Object.keys(groups).map(st=>{
          const items = groups[st];
          const [soft, solid] = bucketColors(st);
          return `
            <div style="margin-bottom:12px;">
              <div style="font-family:var(--font-mono);font-size:11px;color:${solid};text-transform:uppercase;letter-spacing:.08em;margin-bottom:6px;display:flex;align-items:center;gap:6px;">
                <span style="display:inline-block;width:6px;height:6px;border-radius:50%;background:${solid};"></span>
                ${escapeHtml(st)} (${items.length})
              </div>
              <div style="display:flex;flex-direction:column;gap:6px;">
                ${items.map(a=>`
                  <div class="gcc-arow ${emphClass(a.status)}" ${isAdmin()?`data-edit-action="${a.id}"`:''} style="border-left-color:${solid};">
                    <div class="gcc-flag"></div>
                    <div class="gcc-a-co"><span class="gcc-co-tag" style="background:${companyColor(a.company)}22;color:${companyColor(a.company)}">${escapeHtml(a.company)}</span></div>
                    <div class="gcc-a-item" title="${escapeHtml(a.item)}">${escapeHtml(a.item)}</div>
                    <div class="gcc-a-owner">${escapeHtml(a.owner||'—')}</div>
                    <div class="gcc-a-status" ${isAdmin()?`data-quick-status="action" data-item-id="${a.id}" style="cursor:pointer;background:${soft};color:${solid};"`:`style="background:${soft};color:${solid};"`}>${escapeHtml(a.status)}${isAdmin()?` ${icon('chevronDown')}`:''}</div>
                    ${isAdmin() ? `
                    <div style="text-align:right;">
                      <button class="gcc-btn secondary" style="padding:3px 6px;font-size:10px;" title="Edit action">${icon('edit')}</button>
                    </div>` : ''}
                  </div>
                `).join('')}
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;
  }

  function renderOverview(){
    const os = state.settings.overviewSections;
    const oq = filters.overview.q.trim().toLowerCase();
    const spotlight = state.settings.spotlightStatuses || [];
    let spotItems = state.actions.filter(a=>!a.hidden && spotlight.includes(a.status));
    let founderReviewItems = state.actions.filter(a=>
      !a.hidden && statusBucket(a.status)==='done' && (a.founderDependency||'').trim().toLowerCase()==='to review'
    );
    let decisionItems = state.decisions.filter(d=>!d.hidden && d.status!=='Done');
    let companyRows = companiesList();
    if(oq){
      spotItems = spotItems.filter(a=> (a.item+a.owner+a.company+a.function).toLowerCase().includes(oq));
      founderReviewItems = founderReviewItems.filter(a=> (a.item+a.owner+a.company).toLowerCase().includes(oq));
      decisionItems = decisionItems.filter(d=> (d.decision+d.owner+d.impact).toLowerCase().includes(oq));
      companyRows = companyRows.filter(c=> c.name.toLowerCase().includes(oq));
    }
    const visibleKpis = state.settings.kpis.filter(k=>k.visible);

    // KPI Drilldown Section on Overview
    let kpiDrilldownHtml = '';
    if(activeOverviewKpi){
      const activeKpiObj = visibleKpis.find(k=>k.id === activeOverviewKpi) || state.settings.kpis.find(k=>k.id === activeOverviewKpi) || { id: activeOverviewKpi, label: activeOverviewKpi };
      const targetStatuses = statusesForMetric(activeOverviewKpi);
      let kpiItems = state.actions.filter(a=> !a.hidden && targetStatuses.includes(a.status));
      if(oq){
        kpiItems = kpiItems.filter(a=> (a.item+a.owner+a.company+a.function).toLowerCase().includes(oq));
      }
      const kpiColor = metricColorVar(activeOverviewKpi);

      kpiDrilldownHtml = `
        <div class="gcc-kpi-drilldown" id="gcc-kpi-drilldown-box" style="border-left: 4px solid ${kpiColor};">
          <div class="gcc-kpi-drilldown-header">
            <div class="gcc-kpi-drilldown-title">
              <span style="display:inline-block;width:9px;height:9px;border-radius:50%;background:${kpiColor};box-shadow:0 0 8px ${kpiColor};"></span>
              <span>${escapeHtml(activeKpiObj.label)}</span>
              <span class="gcc-kpi-drilldown-badge" style="background:${kpiColor}22;color:${kpiColor};">${kpiItems.length} item${kpiItems.length===1?'':'s'}</span>
            </div>
            <button class="gcc-kpi-drilldown-close" id="btn-close-kpi-drilldown" title="Clear selected KPI filter">
              ✕ Close View
            </button>
          </div>
          <div class="gcc-alist">
            ${kpiItems.length ? kpiItems.map(a=>{
              const [bSoft, bSolid] = bucketColors(a.status);
              return `
              <div class="gcc-arow ${emphClass(a.status)}" ${isAdmin()?`data-edit-action="${a.id}"`:''} style="border-left-color:${bSolid};">
                <div class="gcc-flag"></div>
                <div class="gcc-a-co"><span class="gcc-co-tag" style="background:${companyColor(a.company)}22;color:${companyColor(a.company)}">${escapeHtml(a.company)}</span></div>
                <div class="gcc-a-item" title="${escapeHtml(a.item)}">
                  <strong>${escapeHtml(a.item)}</strong>
                  ${a.function ? `<span style="font-size:11.5px;color:var(--text-dim);margin-left:6px;">· ${escapeHtml(a.function)}</span>` : ''}
                </div>
                <div class="gcc-a-owner">${escapeHtml(a.owner||'—')}</div>
                <div class="gcc-a-status" ${isAdmin()?`data-quick-status="action" data-item-id="${a.id}" style="cursor:pointer;background:${bSoft};color:${bSolid};"`:`style="background:${bSoft};color:${bSolid};"`}>${escapeHtml(a.status)}${isAdmin()?` ${icon('chevronDown')}`:''}</div>
                ${isAdmin() ? `
                <div style="text-align:right;">
                  <button class="gcc-btn secondary" style="padding:3px 6px;font-size:10px;" title="Edit action">${icon('edit')}</button>
                </div>` : ''}
              </div>`;
            }).join('') : `<div class="gcc-empty" style="padding:18px;">No action items matching "${activeKpiObj.label}".</div>`}
          </div>
        </div>
      `;
    }

    return `
      <div class="gcc-filters">
        <input id="f-overview-q" placeholder="Search across all portfolio items…" value="${escapeHtml(filters.overview.q)}" style="flex:1;min-width:240px;"/>
      </div>

      <div class="gcc-kpis" style="grid-template-columns:repeat(${Math.max(visibleKpis.length,1)},1fr)">
        ${visibleKpis.length ? visibleKpis.map(k=>{
          const isActive = activeOverviewKpi === k.id;
          const kColor = metricColorVar(k.id);
          return `
          <div class="gcc-kpi ${isActive ? 'active' : ''}" data-kpi-id="${escapeHtml(k.id)}" style="--kpi-color:${kColor};" title="Click to view ${escapeHtml(k.label)} items">
            <div class="gcc-kpi-label">${escapeHtml(k.label)}</div>
            <div class="gcc-kpi-val" style="color:${kColor}">${metricValue(k.id)}</div>
          </div>
        `;}).join('') : '<div class="gcc-empty">No KPI cards active — configure in Settings.</div>'}
      </div>

      ${kpiDrilldownHtml}

      <div id="overview-dynamic-content">
        ${os.companyHealth ? `
        <div class="gcc-h">Company Health & Execution Pulse</div>
        <div class="gcc-companies">
          ${companyRows.map(c=>{
            const s = companyStats(c.id);
            if(s.total===0) return '';
            const seg = (n,color)=> s.total? `<div class="gcc-pulse-seg" style="width:${(n/s.total*100)}%;background:${color}" title="${n} items"></div>` : '';
            return `
            <div class="gcc-co-row">
              <div class="gcc-co-name"><span class="gcc-dot" style="background:${companyColor(c.id)}"></span>${c.name}</div>
              <div class="gcc-pulse">
                ${seg(s.attention,'var(--attention)')}${seg(s.hold,'var(--hold)')}${seg(s.progress,'var(--progress)')}${seg(s.done,'var(--done)')}
              </div>
              <div class="gcc-co-stats">
                <span class="gcc-stat-attn"><b>${s.attention}</b> attn</span>
                <span class="gcc-stat-prog"><b>${s.progress}</b> wip</span>
                <span class="gcc-stat-done"><b>${s.done}</b>/${s.total} done</span>
              </div>
            </div>`;
          }).join('') || '<div class="gcc-empty">No active companies found. Upload or sync data to begin.</div>'}
        </div>` : ''}

        ${os.founderReview ? `
        <div class="gcc-h">Needs Founder Review</div>
        <div class="gcc-alist">
          ${founderReviewItems.length ? founderReviewItems.map(a=>{
            const [soft, solid] = bucketColors(a.status);
            return `
            <div class="gcc-arow ${emphClass(a.status)}" ${isAdmin()?`data-edit-action="${a.id}"`:''} style="border-left-color:${solid};">
              <div class="gcc-flag"></div>
              <div class="gcc-a-co"><span class="gcc-co-tag" style="background:${companyColor(a.company)}22;color:${companyColor(a.company)}">${escapeHtml(a.company)}</span></div>
              <div class="gcc-a-item" title="${escapeHtml(a.item)}">${escapeHtml(a.item)}</div>
              <div class="gcc-a-owner">${escapeHtml(a.owner||'—')}</div>
              <div class="gcc-a-status" ${isAdmin()?`data-quick-status="action" data-item-id="${a.id}" style="cursor:pointer;background:${soft};color:${solid};"`:`style="background:${soft};color:${solid};"`}>${escapeHtml(a.status)}${isAdmin()?` ${icon('chevronDown')}`:''}</div>
              ${isAdmin() ? `
              <div style="text-align:right;">
                <button class="gcc-btn secondary" style="padding:3px 6px;font-size:10px;" title="Edit action">${icon('edit')}</button>
              </div>` : ''}
            </div>`;
          }).join('') : '<div class="gcc-empty">No completed items pending founder review.</div>'}
        </div>` : ''}

        ${os.needsAttention ? `
        <div class="gcc-h" id="highlighted-section">
          Spotlight Action Items
          ${isAdmin() ? `<button class="gcc-btn secondary" id="edit-spotlight" style="padding:3px 8px;font-size:11px;margin-left:auto;">${icon('settings')} Edit</button>` : ''}
        </div>
        ${renderSpotlightGroups(spotItems)}` : ''}

        ${os.decisionQueue ? `
        <div class="gcc-h">Decisions Queue</div>
        <div class="gcc-dq">
          ${decisionItems.length ? decisionItems.map(d=>{
            const [soft, solid] = bucketColors(d.status);
            return `
            <div class="gcc-dqrow ${emphClass(d.status)}" ${isAdmin()?`data-edit-decision="${d.id}"`:''} style="border-left:3px solid ${solid};">
              <div class="gcc-dq-decision">${escapeHtml(d.decision)}</div>
              <div class="gcc-dq-owner">${escapeHtml(d.owner||'—')}</div>
              <div class="gcc-dq-impact" title="${escapeHtml(d.impact||'')}">${escapeHtml(d.impact||'—')}</div>
              <div class="gcc-a-status" ${isAdmin()?`data-quick-status="decision" data-item-id="${d.id}" style="cursor:pointer;background:${soft};color:${solid};"`:`style="background:${soft};color:${solid};"`}>${escapeHtml(d.status)}${isAdmin()?` ${icon('chevronDown')}`:''}</div>
              ${isAdmin() ? `
              <div style="text-align:right;">
                <button class="gcc-btn secondary" style="padding:3px 6px;font-size:10px;" title="Edit decision">${icon('edit')}</button>
              </div>` : ''}
            </div>`;
          }).join('') : '<div class="gcc-empty">All decisions resolved.</div>'}
        </div>` : ''}
      </div>
    `;
  }

  function allAvailableMetrics(){
    const base = [
      {id:'bucket:attention', label:'Needs attention'},
      {id:'bucket:hold', label:'On hold'},
      {id:'bucket:progress', label:'In progress'},
      {id:'bucket:done', label:'Done'},
      {id:'bucket:future', label:'Future'},
      {id:'total', label:'Total items'}
    ];
    statusesList().forEach(s => base.push({id:'status:'+s, label:s+' (exact status)'}));
    return base;
  }

  function renderRegister(){
    const f = filters.register;
    let items = state.actions.slice();
    if(!f.showHidden) items = items.filter(a=>!a.hidden);
    if(f.company) items = items.filter(a=>(a.company||'').trim().toLowerCase()===f.company.trim().toLowerCase());
    if(f.status) items = items.filter(a=>(a.status||'').trim().toLowerCase()===f.status.trim().toLowerCase());
    if(f.function) items = items.filter(a=>(a.function||'').trim().toLowerCase()===f.function.trim().toLowerCase());
    if(f.owner) items = items.filter(a=>(a.owner||'').trim().toLowerCase()===f.owner.trim().toLowerCase());
    if(f.founderDependency) items = items.filter(a=>(a.founderDependency||'').trim().toLowerCase()===f.founderDependency.trim().toLowerCase());
    if(f.q){
      const q = f.q.trim().toLowerCase();
      items = items.filter(a=>(
        (a.item||'') + ' ' +
        (a.owner||'') + ' ' +
        (a.comments||'') + ' ' +
        (a.function||'') + ' ' +
        (a.company||'') + ' ' +
        (a.founderDependency||'') + ' ' +
        (a.due||'')
      ).toLowerCase().includes(q));
    }

    const functions = [...new Set(state.actions.map(a=>(a.function||'').trim()).filter(Boolean))].sort();
    const owners = [...new Set(state.actions.map(a=>(a.owner||'').trim()).filter(Boolean))].sort();
    const founderDeps = [...new Set(state.actions.map(a=>(a.founderDependency||'').trim()).filter(Boolean))].sort();
    const visibleCols = state.settings.columns.filter(c=>c.visible);
    const hasActiveFilters = Boolean(f.company || f.status || f.function || f.owner || f.founderDependency || f.q || f.showHidden);

    const cellForAction = (a, c) => {
      const soft = bucketColors(a.status)[0];
      const solid = bucketColors(a.status)[1];
      if(c.key === 'company') return `<td><span class="gcc-co-tag" style="background:${companyColor(a.company)}22;color:${companyColor(a.company)}">${escapeHtml(a.company)}</span></td>`;
      if(c.key === 'status') return `<td><span class="gcc-a-status" ${isAdmin()?`data-quick-status="action" data-item-id="${a.id}" style="cursor:pointer;background:${soft};color:${solid};"`:`style="background:${soft};color:${solid};"`}>${escapeHtml(a.status)}${isAdmin()?` ${icon('chevronDown')}`:''}</span></td>`;
      if(c.key === 'owner') return `<td class="owner">${escapeHtml(a.owner||'—')}</td>`;
      if(c.key === 'founderDependency') return `<td>${escapeHtml(a.founderDependency||'—')}</td>`;
      if(c.key === 'comments') return `<td style="color:var(--text-muted);font-size:11.5px;">${escapeHtml(a.comments||'—')}</td>`;
      if(c.key === 'item') return `<td style="font-weight:500;">${escapeHtml(a.item)}</td>`;
      if(c.key === 'function') return `<td>${escapeHtml(a.function||'—')}</td>`;
      const val = (a.custom && a.custom[c.key] !== undefined) ? a.custom[c.key] : (a[c.key] !== undefined ? a[c.key] : '');
      if(!isAdmin()){
        return `<td>${escapeHtml(val || '—')}</td>`;
      }
      return `<td><input class="gcc-inline-edit" data-custom-edit="action:${a.id}:${c.key}" value="${escapeHtml(val)}" placeholder="—"/></td>`;
    };

    return `
      <div class="gcc-filters" style="flex-wrap:wrap;gap:8px;align-items:center;">
        <select id="f-company" title="Filter by company">
          <option value="">All Companies (${state.actions.length})</option>
          ${companiesList().map(c=>{
            const count = state.actions.filter(a=> (a.company||'').toLowerCase()===c.id.toLowerCase() || (a.company||'').toLowerCase()===c.name.toLowerCase()).length;
            return `<option value="${c.id}" ${f.company.toLowerCase()===c.id.toLowerCase()?'selected':''}>${c.name} (${count})</option>`;
          }).join('')}
        </select>
        <select id="f-status" title="Filter by status">
          <option value="">All Statuses</option>
          ${statusesList().map(s=>{
            const count = state.actions.filter(a=>(a.status||'').toLowerCase()===s.toLowerCase()).length;
            return `<option value="${s}" ${f.status.toLowerCase()===s.toLowerCase()?'selected':''}>${s} (${count})</option>`;
          }).join('')}
        </select>
        <select id="f-function" title="Filter by function">
          <option value="">All Functions</option>
          ${functions.map(fn=>{
            const count = state.actions.filter(a=>(a.function||'').toLowerCase()===fn.toLowerCase()).length;
            return `<option value="${fn}" ${f.function.toLowerCase()===fn.toLowerCase()?'selected':''}>${fn} (${count})</option>`;
          }).join('')}
        </select>
        <select id="f-owner" title="Filter by owner">
          <option value="">All Owners</option>
          ${owners.map(o=>{
            const count = state.actions.filter(a=>(a.owner||'').toLowerCase()===o.toLowerCase()).length;
            return `<option value="${o}" ${f.owner.toLowerCase()===o.toLowerCase()?'selected':''}>${o} (${count})</option>`;
          }).join('')}
        </select>
        <select id="f-founder" title="Filter by Founder Dependency">
          <option value="">Founder Dependency</option>
          ${founderDeps.map(fd=>{
            const count = state.actions.filter(a=>(a.founderDependency||'').toLowerCase()===fd.toLowerCase()).length;
            return `<option value="${fd}" ${f.founderDependency.toLowerCase()===fd.toLowerCase()?'selected':''}>${fd} (${count})</option>`;
          }).join('')}
        </select>
        <input id="f-q" placeholder="Filter tasks, owners, notes…" value="${escapeHtml(f.q)}" style="flex:1;min-width:180px;"/>
        <label class="gcc-checkline" style="margin:0;"><input type="checkbox" id="f-show-hidden" ${f.showHidden?'checked':''}/> Show hidden</label>
        
        <button class="gcc-btn secondary" id="btn-reset-register-filters" title="Reset all filters to default" style="padding:5px 10px;font-size:11.5px;display:inline-flex;align-items:center;gap:4px;${hasActiveFilters?'border-color:var(--progress);color:var(--progress);':''}">
          ${icon('refresh')} Reset Filters
        </button>
        ${isAdmin() ? `
        <button class="gcc-btn" id="btn-open-add-action" style="margin-left:auto;display:inline-flex;align-items:center;gap:5px;padding:5px 12px;font-size:12px;">
          ${icon('plus')} Add Action Item
        </button>` : ''}
      </div>

      <div class="gcc-table-wrap">
        <table class="gcc-table">
          <thead>
            <tr>
              ${visibleCols.map(c=>`<th>${escapeHtml(c.label)}</th>`).join('')}
              ${isAdmin() ? `<th style="width:72px;text-align:right;">Actions</th>` : ''}
            </tr>
          </thead>
          <tbody id="register-tbody">
            ${items.map(a=>{
              return `
              <tr data-row-id="${a.id}" class="${emphClass(a.status)}">
                ${visibleCols.map(c=>cellForAction(a, c)).join('')}
                ${isAdmin() ? `
                <td style="text-align:right;white-space:nowrap;">
                  <button class="gcc-btn secondary" data-edit-action="${a.id}" title="Edit item" style="padding:3px 6px;font-size:10px;">${icon('edit')}</button>
                  <button class="gcc-btn secondary" data-hide-action="${a.id}" title="${a.hidden?'Unhide':'Hide'} row" style="padding:3px 6px;font-size:10px;">${a.hidden?icon('eye'):icon('eyeOff')}</button>
                </td>` : ''}
              </tr>`;
            }).join('') || '<tr><td colspan="15" style="text-align:center;padding:30px;color:var(--text-muted);">No matching action items found.</td></tr>'}
          </tbody>
        </table>
      </div>
      <div style="font-family:var(--font-mono);font-size:11px;color:var(--text-dim);margin-top:10px;text-align:right;">Showing ${items.length} of ${state.actions.length} action items</div>
    `;
  }

  function renderDecisions(){
    const f = filters.decisions;
    let items = state.decisions.slice();
    if(!f.showHidden) items = items.filter(d=>!d.hidden);
    if(f.owner) items = items.filter(d=>d.owner===f.owner);
    if(f.founderDependency) items = items.filter(d=>(d.founderDependency||'')===f.founderDependency);
    if(f.q){
      const q = f.q.toLowerCase();
      items = items.filter(d=>(d.decision+d.owner+d.impact).toLowerCase().includes(q));
    }
    const owners = [...new Set(state.decisions.map(d=>d.owner).filter(Boolean))].sort();
    const visibleCols = state.settings.decisionColumns.filter(c=>c.visible);

    const cellForDecision = (d, c) => {
      const soft = bucketColors(d.status)[0];
      const solid = bucketColors(d.status)[1];
      if(c.key === 'decision') return `<td style="font-weight:600;color:var(--table-text);">${escapeHtml(d.decision)}</td>`;
      if(c.key === 'owner') return `<td class="owner">${escapeHtml(d.owner||'—')}</td>`;
      if(c.key === 'status') return `<td><span class="gcc-a-status" ${isAdmin()?`data-quick-status="decision" data-item-id="${d.id}" style="cursor:pointer;background:${soft};color:${solid};"`:`style="background:${soft};color:${solid};"`}>${escapeHtml(d.status)}${isAdmin()?` ${icon('chevronDown')}`:''}</span></td>`;
      if(c.key === 'founderDependency') return `<td>${escapeHtml(d.founderDependency||'—')}</td>`;
      if(c.key === 'impact') return `<td style="color:var(--attention);font-size:12px;">${escapeHtml(d.impact||'—')}</td>`;
      if(c.key === 'deadline') return `<td class="owner">${escapeHtml(d.deadline||'—')}</td>`;
      if(c.key === 'nextReview') return `<td class="owner">${escapeHtml(d.nextReview||'—')}</td>`;
      const val = (d.custom && d.custom[c.key] !== undefined) ? d.custom[c.key] : (d[c.key] !== undefined ? d[c.key] : '');
      if(!isAdmin()){
        return `<td>${escapeHtml(val || '—')}</td>`;
      }
      return `<td><input class="gcc-inline-edit" data-custom-edit="decision:${d.id}:${c.key}" value="${escapeHtml(val)}" placeholder="—"/></td>`;
    };

    return `
      <div class="gcc-filters">
        <select id="f-decisions-owner">
          <option value="">All Owners</option>
          ${owners.map(o=>`<option value="${o}" ${f.owner===o?'selected':''}>${o}</option>`).join('')}
        </select>
        <input id="f-decisions-q" placeholder="Filter decisions or impact…" value="${escapeHtml(f.q)}" style="flex:1;min-width:200px;"/>
        <label class="gcc-checkline" style="margin:0;"><input type="checkbox" id="f-decisions-show-hidden" ${f.showHidden?'checked':''}/> Show hidden</label>
        ${isAdmin() ? `<button class="gcc-btn" id="btn-open-add-decision" style="margin-left:auto;">${icon('plus')} Add Decision</button>` : ''}
      </div>

      <div class="gcc-table-wrap">
        <table class="gcc-table">
          <thead>
            <tr>
              ${visibleCols.map(c=>`<th>${escapeHtml(c.label)}</th>`).join('')}
              ${isAdmin() ? `<th style="width:72px;text-align:right;">Actions</th>` : ''}
            </tr>
          </thead>
          <tbody id="decisions-tbody">
            ${items.map(d=>{
              return `
              <tr data-row-id="${d.id}" class="${emphClass(d.status)}">
                ${visibleCols.map(c=>cellForDecision(d, c)).join('')}
                ${isAdmin() ? `
                <td style="text-align:right;white-space:nowrap;">
                  <button class="gcc-btn secondary" data-edit-decision="${d.id}" title="Edit decision" style="padding:3px 6px;font-size:10px;">${icon('edit')}</button>
                  <button class="gcc-btn secondary" data-hide-decision="${d.id}" title="${d.hidden?'Unhide':'Hide'} row" style="padding:3px 6px;font-size:10px;">${d.hidden?icon('eye'):icon('eyeOff')}</button>
                </td>` : ''}
              </tr>`;
            }).join('') || '<tr><td colspan="15" style="text-align:center;padding:30px;color:var(--text-muted);">No decisions found.</td></tr>'}
          </tbody>
        </table>
      </div>
    `;
  }

  function renderPriorities(){
    const q = filters.priorities.q.toLowerCase();
    let items = state.priorities || [];
    if(q) items = items.filter(p=>(p.group+p.focusArea+p.why+p.horizon).toLowerCase().includes(q));

    const groups = {};
    items.forEach(p=>{
      const g = p.group || 'Strategic Focus';
      if(!groups[g]) groups[g] = [];
      groups[g].push(p);
    });

    return `
      <div class="gcc-filters">
        <input id="f-priorities-q" placeholder="Filter priorities and strategic focus areas…" value="${escapeHtml(filters.priorities.q)}" style="flex:1;"/>
        ${isAdmin() ? `<button class="gcc-btn" id="btn-open-add-priority">${icon('plus')} Add Priority</button>` : ''}
      </div>
      <div id="priorities-container">
        ${Object.keys(groups).map(g=>`
          <div class="gcc-prio-group">
            <div class="gcc-prio-title">
              <span class="gcc-prio-num">#</span>
              ${escapeHtml(g)}
            </div>
            ${groups[g].map(p=>`
              <div class="gcc-prio-item" ${isAdmin()?`data-edit-priority="${p.id}"`:''}>
                <div>
                  <div style="font-weight:600;color:var(--table-text);margin-bottom:3px;">
                    <span style="font-family:var(--font-mono);color:var(--progress);margin-right:6px;">${escapeHtml(p.priority||'1.0')}</span>
                    ${escapeHtml(p.focusArea)}
                  </div>
                  <div class="gcc-prio-why">${escapeHtml(p.why||'')}</div>
                </div>
                <div class="gcc-prio-horizon">${escapeHtml(p.horizon||'')}</div>
                ${isAdmin() ? `
                <div style="text-align:right;">
                  <button class="gcc-btn secondary" style="padding:3px 6px;font-size:10px;" title="Edit priority">${icon('edit')}</button>
                </div>` : ''}
              </div>
            `).join('')}
          </div>
        `).join('') || `<div class="gcc-empty">No priorities logged yet.</div>`}
      </div>
    `;
  }


  function formatBytes(bytes, decimals = 1){
    if(!+bytes) return '0 B';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
  }

  function renderData(){
    const gs = state.settings.googleSheets || {};
    return `
      <div class="gcc-h">Data Management & Cloud Synchronization</div>
      <div class="gcc-data-grid">

        <!-- Google Sheets Cloud Live Integration -->
        <div class="gcc-card highlight-card">
          <h3>
            <span style="display:inline-flex;align-items:center;"><span class="gcc-icon-inline">${icon('cloud')}</span>Google Sheets Sync (3+ Sheets/Tabs)</span>
            <span class="gcc-status-pill">${isBackendConnected ? 'Connected' : 'Offline'}</span>
          </h3>
          <p>Connect and synchronize Google Sheets directly to Register, Decisions, Priorities, or Auto-Detect.</p>
          
          <div style="background:var(--bg);border:1px solid var(--border);border-radius:var(--radius-sm);padding:9px 12px;margin-bottom:14px;font-size:11.5px;color:var(--text-muted);line-height:1.4;">
            <strong style="color:var(--text);">Mondee Inc / Domain Sharing:</strong> In Google Sheets, click <em>Share</em> (top right) &rarr; paste your Service Account email in <strong>Add people, groups</strong> (Viewer). Or use the <strong>Webhooks</strong> tab for live Apps Script sync.
          </div>

          <div class="gcc-form">
            <label>Google Sheet ID or Full URL</label>
            <input id="gs-sheet-id" placeholder="e.g. 1AbCdEfGhIjKlMnOpQrStUvWxYz1234567890 or https://docs.google.com/spreadsheets/d/..." value="${escapeHtml(gs.sheetId||'')}"/>
            
            <div class="two">
              <div>
                <label>Sync Target (Destination Tab)</label>
                <select id="gs-sync-target">
                  <option value="all" ${gs.target==='all'||!gs.target?'selected':''}>All / Auto-Detect Tabs</option>
                  <option value="register" ${gs.target==='register'?'selected':''}>Register (Action Items)</option>
                  <option value="decisions" ${gs.target==='decisions'?'selected':''}>Decisions</option>
                  <option value="priorities" ${gs.target==='priorities'?'selected':''}>Priorities</option>
                </select>
              </div>
              <div>
                <label>Sync Strategy</label>
                <select id="gs-sync-mode">
                  <option value="merge" ${gs.mode==='merge'||!gs.mode?'selected':''}>Merge & Update</option>
                  <option value="delete_merge" ${gs.mode==='delete_merge'?'selected':''}>Delete &amp; Merge</option>
                  <option value="replace" ${gs.mode==='replace'?'selected':''}>Replace All</option>
                </select>
              </div>
            </div>
            
            <div style="margin-top:6px;">
              <label>Auto-Sync Interval</label>
              <select id="gs-auto-interval">
                <option value="0" ${gs.autoSyncIntervalMinutes===0?'selected':''}>Manual Only</option>
                <option value="5" ${gs.autoSyncIntervalMinutes===5?'selected':''}>Every 5 Minutes</option>
                <option value="15" ${gs.autoSyncIntervalMinutes===15?'selected':''}>Every 15 Minutes</option>
                <option value="60" ${gs.autoSyncIntervalMinutes===60?'selected':''}>Every Hour</option>
              </select>
            </div>
            
            <div class="gcc-row-flex" style="margin-top:12px;">
              <button class="gcc-btn" id="btn-sync-gs">
                ${isSyncingSheets ? `${icon('refresh', 'gcc-svg-spin')} Syncing…` : `${icon('zap')} Sync Google Sheets Now`}
              </button>
            </div>
          </div>
        </div>

        <!-- ==========================================
             Service Account Credentials Manager
             ========================================== -->
        <div class="gcc-card" id="creds-manager-card">
          <h3>
            <span style="display:inline-flex;align-items:center;gap:6px;">
              <span class="gcc-icon-inline">${icon('key')}</span>
              Service Account Key Manager
            </span>
            <span id="creds-status-pill" class="gcc-status-pill" style="background:var(--hold);color:#fff;">Checking…</span>
          </h3>
          <p>Manage your Google Service Account credentials. Upload a new key file when Google disables an old one — <strong>no server restart needed</strong>.</p>

          <div id="creds-info-block" style="background:var(--bg);border:1px solid var(--border);border-radius:var(--radius-sm);padding:10px 14px;margin-bottom:14px;font-size:12px;">
            <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
              <span style="color:var(--text-muted);">Service Account Email:</span>
              <code id="creds-email-display" style="color:var(--progress);font-size:11.5px;">Loading…</code>
              <button id="btn-copy-sa-email" class="gcc-btn-sm" title="Copy email to clipboard" style="padding:2px 8px;font-size:10.5px;">Copy</button>
            </div>
            <div style="display:flex;gap:18px;flex-wrap:wrap;margin-top:6px;">
              <span style="color:var(--text-muted);">Project: <code id="creds-project-display" style="color:var(--text);">—</code></span>
              <span style="color:var(--text-muted);">Key ID: <code id="creds-keyid-display" style="color:var(--text);">—</code></span>
              <span style="color:var(--text-muted);">Source: <code id="creds-source-display" style="color:var(--text);">—</code></span>
            </div>
            <div id="creds-share-hint" style="margin-top:6px;padding:6px 9px;background:rgba(94,158,255,0.08);border-radius:4px;color:var(--text-muted);font-size:11px;"></div>
          </div>

          <!-- Test Connection result -->
          <div id="creds-test-result" style="display:none;padding:8px 12px;border-radius:var(--radius-sm);margin-bottom:12px;font-size:12px;"></div>

          <!-- Upload new key area -->
          <div class="gcc-dropzone" id="creds-dropzone" style="padding:18px;min-height:unset;border-style:dashed;">
            <input type="file" id="creds-file-input" accept=".json" style="display:none;"/>
            <div class="gcc-dropzone-icon" style="font-size:26px;">${icon('key')}</div>
            <div class="gcc-dropzone-text">Drag & drop new <code>credentials.json</code> here, or <span style="color:var(--progress);text-decoration:underline;cursor:pointer;" id="creds-browse-btn">browse</span></div>
            <div class="gcc-dropzone-sub">Upload the new JSON key from Google Cloud Console to hot-reload credentials</div>
          </div>

          <div id="creds-staged-name" style="display:none;margin-top:8px;font-size:12px;color:var(--text-muted);padding:5px 10px;background:var(--bg);border-radius:4px;"></div>

          <div class="gcc-row-flex" style="margin-top:12px;gap:10px;flex-wrap:wrap;">
            <button class="gcc-btn" id="btn-test-creds">${icon('zap')} Test Connection</button>
            <button class="gcc-btn" id="btn-upload-creds" style="display:none;background:var(--done);">${icon('upload')} Upload & Activate Key</button>
            <button class="gcc-btn" id="btn-cleanup-fallback" style="background:var(--attention);" title="Remove 'Google Sheet' fallback rows left by previous failed syncs">${icon('trash')} Clean Up Fallback Data</button>
          </div>
        </div>

        <!-- Multi-File CSV & Excel Uploader -->
        <div class="gcc-card">

          <h3><span class="gcc-icon-inline">${icon('upload')}</span>Upload Multi-Tab Excel or 3+ CSV Files</h3>
          <p>Upload a multi-sheet Excel workbook (<code>.xlsx</code> / <code>.xls</code>) or multiple <code>.csv</code> files simultaneously with smart auto-detection and overlap resolution.</p>
          
          <div class="gcc-dropzone" id="gcc-dropzone">
            <input type="file" id="multi-file-upload" multiple accept=".xlsx,.xls,.csv" style="display:none;"/>
            <div class="gcc-dropzone-icon">${icon('upload')}</div>
            <div class="gcc-dropzone-text">Drag & drop files here, or <span style="color:var(--progress);text-decoration:underline;">browse</span></div>
            <div class="gcc-dropzone-sub">Supports Excel (.xlsx, .xls) with multiple tabs and 3+ CSV files</div>
          </div>

          <div class="gcc-staged-list" id="gcc-staged-list"></div>

          <div class="two" style="margin-top:12px;">
            <div>
              <label style="font-size:11px;color:var(--text-muted);display:block;margin-bottom:4px;">Import Destination</label>
              <select id="upload-target-select">
                <option value="all">All / Auto-Detect Tabs</option>
                <option value="register">Register (Action Items)</option>
                <option value="decisions">Decisions</option>
                <option value="priorities">Priorities</option>
                <option value="create_new">Create New Company Table…</option>
              </select>
            </div>
            <div>
              <label style="font-size:11px;color:var(--text-muted);display:block;margin-bottom:4px;">Import Strategy</label>
              <select id="upload-mode-select">
                <option value="merge">Merge & Update</option>
                <option value="delete_merge">Delete &amp; Merge</option>
                <option value="append">Append Only (New IDs)</option>
                <option value="replace">Replace All Existing</option>
              </select>
            </div>
          </div>

          <div id="container-new-company" style="display:none;margin-top:10px;">
            <label style="font-size:11px;color:var(--text-muted);display:block;margin-bottom:4px;">New Company Name</label>
            <input id="upload-new-company-name" placeholder="e.g. Apex Health, Orbit Labs…"/>
          </div>

          <div class="two" style="margin-top:10px;">
            <div>
              <label style="font-size:11px;color:var(--text-muted);display:block;margin-bottom:4px;">Conflict Resolution Strategy</label>
              <select id="upload-conflict-strategy">
                <option value="incoming_wins">Incoming Wins (Overwrite Changed)</option>
                <option value="existing_wins">Preserve Existing (Fill Blanks Only)</option>
                <option value="timestamp_wins">Most Recent Date / Timestamp Wins</option>
                <option value="manual_review">Flag Conflicts for Manual Review</option>
              </select>
            </div>
            <div>
              <label style="font-size:11px;color:var(--text-muted);display:block;margin-bottom:4px;">Data Quality Threshold</label>
              <select id="upload-quality-score">
                <option value="0.0">No Filter (Include All 0%)</option>
                <option value="0.2">Lenient (Min 20% Completeness)</option>
                <option value="0.4" selected>Standard (Min 40% Completeness)</option>
                <option value="0.7">Strict (Min 70% High-Confidence)</option>
              </select>
            </div>
          </div>

          <!-- Advanced Thresholds Collapsible Accordion -->
          <div class="gcc-advanced-import-panel">
            <div class="gcc-advanced-toggle" id="btn-toggle-advanced-import">
              <span>${icon('sliders')} Advanced Exclusion Rules & Date Filtering</span>
              <span id="adv-arrow">▾</span>
            </div>
            <div class="gcc-advanced-content" id="adv-import-content">
              <div class="two">
                <div>
                  <label style="font-size:11px;color:var(--text-muted);display:block;margin-bottom:4px;">Excluded Record Statuses (Comma-separated)</label>
                  <input id="upload-excluded-statuses" value="archived, cancelled, deleted, trash" placeholder="archived, cancelled, deleted, trash"/>
                </div>
                <div>
                  <label style="font-size:11px;color:var(--text-muted);display:block;margin-bottom:4px;">Date Range Filter (Optional)</label>
                  <div style="display:flex;gap:8px;">
                    <input type="date" id="upload-date-start" title="Earliest Date" style="font-size:11px;"/>
                    <input type="date" id="upload-date-end" title="Latest Date" style="font-size:11px;"/>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="gcc-row-flex" style="margin-top:14px;">
            <button class="gcc-btn" id="btn-multi-upload" ${stagedFiles.length ? '' : 'disabled'}>
              ${icon('upload')} Import Files ${stagedFiles.length ? `(${stagedFiles.length})` : ''}
            </button>
            ${stagedFiles.length ? `<button class="gcc-btn secondary" id="btn-clear-staged">Clear Selection</button>` : ''}
          </div>

          ${persistentUploadStatus && persistentUploadStatus.counts ? `
            <div class="gcc-metrics-container">
              <div class="gcc-metric-card appended">
                <div class="gcc-metric-val">+${persistentUploadStatus.counts.appended || 0}</div>
                <div class="gcc-metric-label">Appended</div>
              </div>
              <div class="gcc-metric-card updated">
                <div class="gcc-metric-val">${persistentUploadStatus.counts.updated || 0}</div>
                <div class="gcc-metric-label">Updated</div>
              </div>
              ${(persistentUploadStatus.counts.deleted || 0) > 0 ? `
              <div class="gcc-metric-card flagged" style="background:rgba(239,68,68,0.12);border-color:rgba(239,68,68,0.35);">
                <div class="gcc-metric-val" style="color:#ef4444;">-${persistentUploadStatus.counts.deleted}</div>
                <div class="gcc-metric-label">Removed</div>
              </div>` : ''}
              <div class="gcc-metric-card skipped">
                <div class="gcc-metric-val">${persistentUploadStatus.counts.skipped || 0}</div>
                <div class="gcc-metric-label">Excluded</div>
              </div>
              <div class="gcc-metric-card flagged">
                <div class="gcc-metric-val">${persistentUploadStatus.counts.flagged || 0}</div>
                <div class="gcc-metric-label">Flagged</div>
              </div>
            </div>
            ${persistentUploadStatus.conflicts && persistentUploadStatus.conflicts.length ? `
              <div style="margin:10px 0;">
                <button class="gcc-btn" id="btn-open-conflict-modal" style="background:var(--attention);color:#fff;width:100%;">
                  ${icon('alertTriangle')} Review ${persistentUploadStatus.conflicts.length} Flagged Overlap Conflict(s)
                </button>
              </div>
            ` : ''}
          ` : ''}

          <div class="gcc-file-status ${persistentUploadStatus ? `show ${persistentUploadStatus.type}` : ''}" id="multi-upload-status">
            ${persistentUploadStatus ? escapeHtml(persistentUploadStatus.message) : ''}
          </div>
        </div>

        <!-- Quick TSV / Excel Copy-Paste -->
        <div class="gcc-card">
          <h3><span class="gcc-icon-inline">${icon('clipboard')}</span>Paste Rows from Spreadsheet</h3>
          <p>Copy a range straight from Excel or Google Sheets and paste below (tab-separated). Columns: <code>Company, Function, Item, Status, Owner, Comments</code>.</p>
          <textarea class="gcc-textarea" id="import-actions" placeholder="Pranik&#9;GTM&#9;Provide customer timeline&#9;WIP&#9;Karthik&#9;"></textarea>
          <div class="gcc-row-flex">
            <button class="gcc-btn" id="btn-import">Import Pasted Rows</button>
            <button class="gcc-btn secondary" id="btn-clear-import">Clear</button>
          </div>
        </div>

        <!-- Single Item Add Form -->
        <div class="gcc-card">
          <h3><span class="gcc-icon-inline">${icon('plus')}</span>Quick Add Action Item</h3>
          <p>Quickly log an action item or task during founder review sessions.</p>
          <div class="gcc-form">
            <label>Company</label>
            <select id="nf-company">${companiesList().map(c=>`<option value="${c.id}">${c.name}</option>`).join('')}</select>
            <div class="two">
              <div><label>Function</label><input id="nf-function" placeholder="GTM / Product / Ops…"/></div>
              <div><label>Owner</label><input id="nf-owner" placeholder="Owner name"/></div>
            </div>
            <label>Action Item</label>
            <textarea id="nf-item" placeholder="Task description"></textarea>
            <div class="two">
              <div><label>Status</label><select id="nf-status">${statusesList().map(s=>`<option>${s}</option>`).join('')}</select></div>
              <div><label>Founder Dependency</label><input id="nf-founder" placeholder="e.g. To Review, Decision…"/></div>
            </div>
            <div class="gcc-row-flex"><button class="gcc-btn" id="btn-add-item">Create Item</button></div>
          </div>
        </div>

        <!-- Export & Backup Center -->
        <div class="gcc-card">
          <h3><span class="gcc-icon-inline">${icon('download')}</span>Export Data Snapshot</h3>
          <p>Download full snapshots of your command center state across all companies, actions, decisions, and priorities.</p>
          <div class="gcc-row-flex">
            ${isBackendConnected ? `
              <a href="/api/export/excel" class="gcc-btn secondary" download="portfolio_dashboard.xlsx" style="text-decoration:none;">${icon('table')} Export Excel (.xlsx)</a>
              <a href="/api/export/csv" class="gcc-btn secondary" download="portfolio_csvs.zip" style="text-decoration:none;">${icon('package')} Export CSV Bundle (.zip)</a>
            ` : ''}
            <button class="gcc-btn secondary" id="btn-export-json">${icon('fileCode')} Export JSON</button>
          </div>
        </div>

        <!-- Reset System -->
        <div class="gcc-card">
          <h3><span class="gcc-icon-inline" style="color:var(--attention);">${icon('alert')}</span>System Reset</h3>
          <p>Reset the state back to default seed data.</p>
          <div class="gcc-row-flex">
            <button class="gcc-btn danger" id="btn-reset">Reset to Default Seed Data</button>
          </div>
        </div>

      </div>
    `;
  }

  function renderSettings(){
    const s = state.settings;
    const emphOptions = ['normal','hi','dim'];
    const emphLabelMap = {normal:'Normal', hi:'Highlight', dim:'Mute'};
    return `
      <div class="gcc-h">Appearance & System Settings</div>
      <div class="gcc-data-grid">

        <div class="gcc-card">
          <h3>Appearance — Text Colors</h3>
          <p>Configure typography colors across headers and data cells so nothing is unreadable against your theme.</p>
          <div class="gcc-swatch-row">
            <span class="gcc-swatch-label">Body text</span>
            <input type="color" data-color-key="text" value="${s.colors.text||'#F0F3F6'}"/>
          </div>
          <div class="gcc-swatch-row">
            <span class="gcc-swatch-label">Muted / Secondary text</span>
            <input type="color" data-color-key="muted" value="${s.colors.muted||'#8B949E'}"/>
          </div>
          <div class="gcc-swatch-row">
            <span class="gcc-swatch-label">Table cell text (Function, Item, Decision…)</span>
            <input type="color" data-color-key="tableText" value="${s.colors.tableText||'#F0F3F6'}"/>
          </div>
          <div class="gcc-swatch-row">
            <span class="gcc-swatch-label">Table header text</span>
            <input type="color" data-color-key="tableHeaderText" value="${s.colors.tableHeaderText||'#8B949E'}"/>
          </div>
          <div class="gcc-swatch-row">
            <span class="gcc-swatch-label">Section labels (small caps headers)</span>
            <input type="color" data-color-key="labelText" value="${s.colors.labelText||'#8B949E'}"/>
          </div>
        </div>

        <div class="gcc-card">
          <h3>Appearance — Status Colors</h3>
          <p>Drives every status badge, pulse bar, and highlight across the whole dashboard.</p>
          ${[
            {key:'attention', label:'Attention (Blocked / Delayed)'},
            {key:'progress', label:'Progress (WIP / To Start)'},
            {key:'done', label:'Done (Done)'},
            {key:'hold', label:'Hold (On Hold)'},
            {key:'future', label:'Future (Future)'}
          ].map(k=>`
            <div class="gcc-swatch-row">
              <span class="gcc-swatch-label">${k.label}</span>
              <input type="color" data-color-key="${k.key}" value="${s.colors[k.key]||'#58A6FF'}"/>
            </div>
          `).join('')}
        </div>

        <div class="gcc-card">
          <h3>Appearance — Company Colors</h3>
          <p>Used for the tag next to each company's name in Overview and the Register.</p>
          ${companiesList().map(c=>`
            <div class="gcc-swatch-row">
              <span class="gcc-swatch-label">${escapeHtml(c.name)}</span>
              <input type="color" data-company-key="${escapeHtml(c.id)}" value="${companyColor(c.id)}"/>
            </div>
          `).join('')}
        </div>

        <div class="gcc-card">
          <h3>Companies</h3>
          <p>Add or remove companies in your portfolio. Removing one won't delete existing action items tagged with it, but it drops off the Overview health list and dropdowns.</p>
          <div id="company-list">
            ${s.companies.map((c,i)=>`
              <div class="gcc-col-row" data-idx="${i}">
                <label style="flex:1;">${escapeHtml(c.name)}</label>
                <div class="gcc-col-btns">
                  <button class="gcc-col-remove" data-company-remove="${i}" title="Remove this company">✕</button>
                </div>
              </div>
            `).join('')}
          </div>
          <div class="gcc-row-flex" style="margin-top:12px;">
            <button class="gcc-btn secondary" id="btn-add-company">+ Add company</button>
          </div>
        </div>

        <div class="gcc-card">
          <h3>Statuses</h3>
          <p>Add or remove statuses available across the dashboard. Each status has a bucket (Attention, Hold, In Progress, Done, Future).</p>
          <div id="status-list">
            ${s.statuses.map((st,i)=>`
              <div class="gcc-col-row" data-idx="${i}">
                <label style="flex:1;">${escapeHtml(st)} <span class="gcc-lock-badge">${escapeHtml(s.statusBuckets[st]||'future')}</span></label>
                <div class="gcc-col-btns">
                  <button class="gcc-col-remove" data-status-remove="${i}" title="Remove this status">✕</button>
                </div>
              </div>
            `).join('')}
          </div>
          <div class="gcc-row-flex" style="margin-top:12px;">
            <button class="gcc-btn secondary" id="btn-add-status">+ Add status</button>
          </div>
        </div>

        <div class="gcc-card">
          <h3>Register Columns</h3>
          <p>Choose which fields show in the Action Register table, in what order, or add a brand-new custom field (editable right in the table).</p>
          <div id="col-list">
            ${s.columns.map((c,i)=>`
              <div class="gcc-col-row" data-idx="${i}">
                <label><input type="checkbox" data-col-visible="${i}" ${c.visible?'checked':''}/> ${escapeHtml(c.label)}</label>
                <div class="gcc-col-btns">
                  <button class="gcc-col-remove" data-col-remove="${i}" title="Remove this column">✕</button>
                  <button class="gcc-icon-btn" data-col-up="${i}" ${i===0?'disabled':''} title="Move up">↑</button>
                  <button class="gcc-icon-btn" data-col-down="${i}" ${i===s.columns.length-1?'disabled':''} title="Move down">↓</button>
                </div>
              </div>
            `).join('')}
          </div>
          <div class="gcc-row-flex" style="margin-top:12px;">
            <button class="gcc-btn secondary" id="btn-add-col-register">+ Add column</button>
          </div>
        </div>

        <div class="gcc-card">
          <h3>Decision Queue Columns</h3>
          <p>Choose which fields show in the Decisions tab — hide fields you don't need or add custom columns.</p>
          <div id="dcol-list">
            ${s.decisionColumns.map((c,i)=>`
              <div class="gcc-col-row" data-idx="${i}">
                <label><input type="checkbox" data-dcol-visible="${i}" ${c.visible?'checked':''}/> ${escapeHtml(c.label)}</label>
                <div class="gcc-col-btns">
                  <button class="gcc-col-remove" data-dcol-remove="${i}" title="Remove this column">✕</button>
                  <button class="gcc-icon-btn" data-dcol-up="${i}" ${i===0?'disabled':''} title="Move up">↑</button>
                  <button class="gcc-icon-btn" data-dcol-down="${i}" ${i===s.decisionColumns.length-1?'disabled':''} title="Move down">↓</button>
                </div>
              </div>
            `).join('')}
          </div>
          <div class="gcc-row-flex" style="margin-top:12px;">
            <button class="gcc-btn secondary" id="btn-add-col-decisions">+ Add column</button>
          </div>
        </div>

        <div class="gcc-card">
          <h3>Overview KPI Cards</h3>
          <p>Pick which metrics show at the top of Overview, and in what order — swap the set every review.</p>
          <div id="kpi-list">
            ${s.kpis.map((k,i)=>`
              <div class="gcc-col-row" data-idx="${i}">
                <label style="flex:1;">${escapeHtml(k.label)}</label>
                <div class="gcc-col-btns">
                  <button class="gcc-col-remove" data-kpi-remove="${i}" title="Remove this card">✕</button>
                  <button class="gcc-icon-btn" data-kpi-up="${i}" ${i===0?'disabled':''} title="Move up">↑</button>
                  <button class="gcc-icon-btn" data-kpi-down="${i}" ${i===s.kpis.length-1?'disabled':''} title="Move down">↓</button>
                </div>
              </div>
            `).join('') || '<div class="gcc-empty" style="padding:12px;">No KPI cards yet.</div>'}
          </div>
          <div class="gcc-row-flex" style="margin-top:12px;">
            <select id="kpi-add-select" style="flex:1;min-width:180px;">
              ${allAvailableMetrics().filter(m=>!s.kpis.some(k=>k.id===m.id)).map(m=>`<option value="${escapeHtml(m.id)}" data-label="${escapeHtml(m.label)}">${escapeHtml(m.label)}</option>`).join('') || '<option value="">All metrics already added</option>'}
            </select>
            <button class="gcc-btn secondary" id="btn-add-kpi">+ Add card</button>
          </div>
        </div>

        <div class="gcc-card">
          <h3>Tabs</h3>
          <p>Reorder, show/hide, or manage tabs in the navigation bar. Settings can't be hidden so you won't get locked out.</p>
          <div id="tab-order-list">
            ${s.tabs.map((t,i)=>`
              <div class="gcc-order-row" data-idx="${i}">
                <label style="flex:1;display:flex;align-items:center;gap:8px;cursor:pointer;">
                  <input type="checkbox" data-tab-visible="${i}" ${t.visible?'checked':''} ${t.key==='settings'?'disabled':''}/>
                  ${escapeHtml(t.label)}
                </label>
                <div class="gcc-col-btns">
                  <button class="gcc-icon-btn" data-tab-up="${i}" ${i===0?'disabled':''} title="Move up">↑</button>
                  <button class="gcc-icon-btn" data-tab-down="${i}" ${i===s.tabs.length-1?'disabled':''} title="Move down">↓</button>
                </div>
              </div>
            `).join('')}
          </div>
          <p style="margin-top:10px;font-size:11.5px;color:var(--text-dim);">Unchecking a tab hides it from the top bar without deleting any data. You can re-enable it anytime.</p>
        </div>

        <div class="gcc-card">
          <h3>Overview: Highlighted Action Items</h3>
          <p>Pick which statuses show in Overview's "Spotlight Action Items" list — Blocked, Delayed, and On Hold by default.</p>
          <div style="display:flex;flex-direction:column;gap:6px;margin-top:8px;">
            ${statusesList().map(st=>`
              <label class="gcc-checkline">
                <input type="checkbox" data-spotlight-status="${escapeHtml(st)}" ${(s.spotlightStatuses||[]).includes(st)?'checked':''}/>
                ${escapeHtml(st)}
              </label>
            `).join('')}
          </div>
        </div>

        <div class="gcc-card">
          <h3>Status Emphasis</h3>
          <p>Make certain statuses stand out (Highlight glow) or fade back (Mute) in the Register and Overview lists.</p>
          ${statusesList().map(st=>`
            <div class="gcc-emph-row">
              <span class="gcc-swatch-label">${escapeHtml(st)}</span>
              <div class="gcc-seg" data-emph-status="${escapeHtml(st)}">
                ${emphOptions.map(o=>`<button data-emph-val="${o}" class="${(s.emphasis[st]||'normal')===o?'on':''}">${emphLabelMap[o]}</button>`).join('')}
              </div>
            </div>
          `).join('')}
        </div>

        <div class="gcc-card">
          <h3>Edit Access Protection <span class="gcc-lock-badge">${s.pin ? 'PIN ACTIVE' : 'UNLOCKED'}</span></h3>
          <p>Set a PIN to require passcode authentication before opening Data or Settings tabs.</p>
          ${s.pin ? `
            <div class="gcc-form">
              <label>Current PIN (required to change or remove)</label>
              <input type="password" id="pin-current" placeholder="Enter current PIN"/>
              <label>New PIN (leave blank to remove protection)</label>
              <input type="password" id="pin-new" placeholder="New PIN"/>
              <div class="gcc-row-flex"><button class="gcc-btn" id="btn-set-pin">Save PIN</button></div>
            </div>
          ` : `
            <div class="gcc-form">
              <label>Set Access PIN</label>
              <input type="password" id="pin-new" placeholder="Choose a PIN"/>
              <div class="gcc-row-flex"><button class="gcc-btn" id="btn-set-pin">Set PIN</button></div>
            </div>
          `}
        </div>

        <div class="gcc-card">
          <h3>Reset Theme & Settings</h3>
          <p>Restore default colors, columns, KPI cards, tabs, and status emphasis. Doesn't touch your action items, decisions, or PIN.</p>
          <div class="gcc-row-flex"><button class="gcc-btn secondary" id="btn-reset-settings">Reset Appearance</button></div>
        </div>

      </div>
    `;
  }

  function renderLogin(){
    return `
      <div class="gcc-login-wrapper">
        <div class="gcc-login-bg-glow"></div>
        <div class="gcc-login-card">
          <div class="gcc-login-header">
            <div class="gcc-login-logo">${icon('lock')}</div>
            <div class="gcc-login-title">Executive Command Center</div>
            <div class="gcc-login-subtitle">Gamma Group · Secure Authentication</div>
          </div>

          <form id="gcc-login-form">
            <div class="gcc-form-group">
              <label for="login-username">Username</label>
              <div class="gcc-input-wrap">
                <input id="login-username" type="text" placeholder="Enter executive username" autocomplete="username" required autofocus/>
              </div>
            </div>

            <div class="gcc-form-group">
              <label for="login-password">Password</label>
              <div class="gcc-input-wrap">
                <input id="login-password" type="password" placeholder="Enter your password" autocomplete="current-password" required/>
                <button type="button" class="gcc-input-toggle" id="btn-toggle-password" title="Toggle password visibility">
                  ${icon('eye')}
                </button>
              </div>
            </div>

            <div class="gcc-demo-credentials">
              <div class="gcc-demo-credentials-text">
                <strong>Demo Access:</strong><br>
                User: <code>admin</code> | Pass: <code>admin123</code>
              </div>
              <button type="button" class="gcc-btn-autofill" id="btn-autofill-login">Auto-fill</button>
            </div>

            <button type="submit" class="gcc-login-submit-btn" id="btn-login-submit">
              ${icon('zap')} Sign In to Portfolio Center
            </button>
          </form>
        </div>
      </div>
    `;
  }

  function wireLogin(){
    const form = document.getElementById('gcc-login-form');
    const pwdInput = document.getElementById('login-password');
    const userInput = document.getElementById('login-username');
    const toggleBtn = document.getElementById('btn-toggle-password');
    const autofillBtn = document.getElementById('btn-autofill-login');
    const submitBtn = document.getElementById('btn-login-submit');

    if(toggleBtn && pwdInput){
      toggleBtn.onclick = ()=>{
        const isPwd = pwdInput.type === 'password';
        pwdInput.type = isPwd ? 'text' : 'password';
        toggleBtn.innerHTML = isPwd ? icon('eyeOff') : icon('eye');
      };
    }

    if(autofillBtn && userInput && pwdInput){
      autofillBtn.onclick = ()=>{
        userInput.value = 'admin';
        pwdInput.value = 'admin123';
        userInput.focus();
      };
    }

    if(form){
      form.onsubmit = async (e)=>{
        e.preventDefault();
        const username = userInput.value.trim();
        const password = pwdInput.value;
        submitBtn.disabled = true;
        submitBtn.innerHTML = `${icon('refresh', 'gcc-svg-spin')} Verifying…`;

        try {
          await performLogin(username, password);
          Toast.success(`Welcome back, ${currentUser.name || currentUser.username}!`);
          render();
        } catch(err){
          Toast.error(err.message || 'Login failed.');
          submitBtn.disabled = false;
          submitBtn.innerHTML = `${icon('zap')} Sign In to Portfolio Center`;
        }
      };
    }
  }

  function renderWebhooks(){
    const hostUrl = window.location.origin;
    const webhookUrl = `${hostUrl}/api/webhook`;
    const ws = (state.settings && state.settings.webhookSettings) || {};
    const secretKey = ws.secretKey || '';

    return `
      <div class="gcc-h">Webhooks Integration Studio & Real-time Ingestion</div>
      <div class="gcc-data-grid">

        <!-- Endpoint & Configuration Card -->
        <div class="gcc-card highlight-card">
          <h3>
            <span style="display:inline-flex;align-items:center;"><span class="gcc-icon-inline">${icon('webhook')}</span>Inbound Webhook Endpoint</span>
            <span class="gcc-status-pill">${isBackendConnected ? 'Live Endpoint' : 'Standalone Mode'}</span>
          </h3>
          <p>Send Google Forms responses, Zapier triggers, or custom HTTP POST requests to automatically ingest action items, decisions, and priorities.</p>

          <label style="font-size:12px;font-weight:600;color:var(--text-muted);text-transform:uppercase;margin-top:10px;display:block;">HTTP POST Webhook URL</label>
          <div class="gcc-webhook-url-box">
            <span class="gcc-webhook-url-text" id="wh-endpoint-url">${escapeHtml(webhookUrl)}</span>
            <button class="gcc-btn secondary" id="btn-copy-webhook-url" style="padding:4px 10px;font-size:12px;">
              ${icon('copy')} Copy URL
            </button>
          </div>

          <div class="gcc-form" style="margin-top:14px;">
            <div class="two">
              <div>
                <label>Webhook Secret Key (Optional Security)</label>
                <input id="wh-secret-key" placeholder="e.g. gcc_secret_key_123" value="${escapeHtml(secretKey)}"/>
              </div>
              <div>
                <label>Default Destination Target</label>
                <select id="wh-default-target">
                  <option value="all" ${ws.defaultTarget==='all'?'selected':''}>Auto-Detect Fields</option>
                  <option value="register" ${ws.defaultTarget==='register'?'selected':''}>Register (Action Items)</option>
                  <option value="decisions" ${ws.defaultTarget==='decisions'?'selected':''}>Decisions</option>
                  <option value="priorities" ${ws.defaultTarget==='priorities'?'selected':''}>Strategic Priorities</option>
                </select>
              </div>
            </div>
            <div class="gcc-row-flex" style="margin-top:8px;">
              <button class="gcc-btn" id="btn-save-webhook-settings">Save Webhook Settings</button>
            </div>
          </div>
        </div>

        <!-- Interactive Webhook Simulator Card -->
        <div class="gcc-card">
          <h3><span class="gcc-icon-inline">${icon('zap')}</span>Interactive Webhook Simulator</h3>
          <p>Test your webhook ingestion in 1-click. Simulated submissions immediately create new entries in the respective views.</p>

          <div class="gcc-sim-grid">
            <div class="gcc-sim-card">
              <div>
                <div class="gcc-sim-title">${icon('table')} Google Form: Action Item</div>
                <div class="gcc-sim-desc">Simulates a team member submitting a new action item form.</div>
              </div>
              <button class="gcc-btn secondary" id="btn-sim-action" style="font-size:12px;">
                ${icon('zap')} Ingest Action Item
              </button>
            </div>

            <div class="gcc-sim-card">
              <div>
                <div class="gcc-sim-title">${icon('clipboard')} Google Form: Decision</div>
                <div class="gcc-sim-desc">Simulates executive decision review intake request.</div>
              </div>
              <button class="gcc-btn secondary" id="btn-sim-decision" style="font-size:12px;">
                ${icon('zap')} Ingest Decision
              </button>
            </div>

            <div class="gcc-sim-card">
              <div>
                <div class="gcc-sim-title">${icon('package')} Google Form: Strategic Priority</div>
                <div class="gcc-sim-desc">Simulates quarterly focus area submission.</div>
              </div>
              <button class="gcc-btn secondary" id="btn-sim-priority" style="font-size:12px;">
                ${icon('zap')} Ingest Priority
              </button>
            </div>
          </div>

          <div id="wh-sim-result" style="display:none;background:var(--bg);border:1px solid var(--border);border-radius:var(--radius-sm);padding:10px 12px;font-size:12px;margin-top:10px;"></div>
        </div>

      </div>

      <!-- Google Apps Script Automation Template -->
      <div class="gcc-card" style="margin-top:20px;">
        <h3>
          <span class="gcc-icon-inline">${icon('code')}</span>Google Forms Apps Script Automation (Copy & Paste)
        </h3>
        <p>In your Google Form, open <strong>Script editor</strong>, paste the following snippet, and add an <strong>On form submit</strong> trigger.</p>

        <div class="gcc-code-container">
          <button class="gcc-code-copy-btn" id="btn-copy-gas-script">
            ${icon('copy')} Copy Script
          </button>
          <pre><code id="wh-gas-code">/**
 * Google Apps Script for Google Forms -> Command Center Webhook
 */
const WEBHOOK_URL = "${webhookUrl}";
const WEBHOOK_SECRET = "${secretKey}";

function onFormSubmit(e) {
  if (!e || !e.response) return;
  const formResponse = e.response;
  const itemResponses = formResponse.getItemResponses();
  const payload = {
    formTitle: e.source ? e.source.getTitle() : "Google Form",
    submittedAt: new Date().toISOString(),
    responses: {}
  };
  for (let i = 0; i < itemResponses.length; i++) {
    const item = itemResponses[i];
    payload.responses[item.getItem().getTitle().trim()] = item.getResponse();
  }
  UrlFetchApp.fetch(WEBHOOK_URL, {
    method: "post",
    contentType: "application/json",
    headers: {
      "X-Webhook-Secret": WEBHOOK_SECRET,
      "X-Idempotency-Key": formResponse.getId()
    },
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  });
}</code></pre>
        </div>
      </div>

      <!-- Inbound Webhook Activity Logs -->
      <div class="gcc-card" style="margin-top:20px;">
        <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:10px;">
          <div>
            <h3><span class="gcc-icon-inline">${icon('terminal')}</span>Live Webhook Activity Logs</h3>
            <p style="margin:0;">Audit stream of received inbound HTTP POST webhooks.</p>
          </div>
          <div class="gcc-row-flex">
            <button class="gcc-btn secondary" id="btn-refresh-webhook-logs" style="font-size:12px;">
              ${icon('refresh')} Refresh Logs
            </button>
            <button class="gcc-btn secondary" id="btn-clear-webhook-logs" style="font-size:12px;color:var(--attention);">
              ${icon('trash')} Clear Logs
            </button>
          </div>
        </div>

        <div id="wh-logs-container" style="margin-top:12px;overflow-x:auto;">
          <div style="text-align:center;padding:24px;color:var(--text-muted);">Loading webhook activity logs…</div>
        </div>
      </div>
    `;
  }

  function renderLockScreen(){
    return `
      <div class="gcc-lockscreen">
        <div class="gcc-eyebrow">Authentication Required</div>
        <div style="font-size:15px;font-weight:600;margin-top:6px;">Enter PIN to Access Settings</div>
        <input id="lock-pin" type="password" inputmode="numeric" placeholder="••••" maxlength="12"/>
        <div class="gcc-row-flex" style="justify-content:center;">
          <button class="gcc-btn" id="lock-unlock">Unlock</button>
        </div>
      </div>
    `;
  }

  function renderStagedFilesList(){
    const listEl = document.getElementById('gcc-staged-list');
    if(!listEl) return;
    if(!stagedFiles.length){
      listEl.innerHTML = '';
      return;
    }
    listEl.innerHTML = stagedFiles.map((file, idx)=>{
      const isCsv = (file.name||'').toLowerCase().endsWith('.csv');
      return `
        <div class="gcc-staged-item">
          <div class="gcc-staged-info">
            <span class="gcc-file-tag ${isCsv ? 'csv' : ''}">${isCsv ? 'CSV' : 'XLSX'}</span>
            <span class="gcc-staged-name" title="${escapeHtml(file.name)}">${escapeHtml(file.name)}</span>
            <span class="gcc-staged-size">(${formatBytes(file.size)})</span>
          </div>
          <button class="gcc-btn-remove-staged" data-remove-staged="${idx}" title="Remove file">✕</button>
        </div>
      `;
    }).join('');

    listEl.querySelectorAll('[data-remove-staged]').forEach(btn=>{
      btn.onclick = (e)=>{
        e.stopPropagation();
        const idx = +btn.dataset.removeStaged;
        stagedFiles.splice(idx, 1);
        renderStagedFilesList();
        const uploadBtn = document.getElementById('btn-multi-upload');
        if(uploadBtn){
          uploadBtn.disabled = !stagedFiles.length;
          uploadBtn.innerHTML = `${icon('upload')} Import Files ${stagedFiles.length ? `(${stagedFiles.length})` : ''}`;
        }
      };
    });
  }

  function escapeHtml(s){
    return (s||'').toString().replace(/[&<>"']/g, m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  }

  // ==========================================================================
  // 8. MAIN RENDER CONTROLLER & NON-DESTRUCTIVE EVENT WIRING
  // ==========================================================================
  function render(){
    if(!currentUser){
      window.location.href = '/login';
      return;
    }

    const allTabs = (state && state.settings && state.settings.tabs) || [];
    let visibleTabs = [];
    if(isAdmin()){
      visibleTabs = allTabs.filter(t => t.visible);
    } else {
      // For regular user/viewer: hide data, settings, webhooks ALWAYS
      const restricted = ['data', 'settings', 'webhooks'];
      visibleTabs = allTabs.filter(t => t.visible && !restricted.includes(t.key));
    }

    if(!visibleTabs.some(t=>t.key===view)){
      const firstVisible = visibleTabs[0];
      view = firstVisible ? firstVisible.key : 'overview';
    }

    if(isViewer() && ['data', 'settings', 'webhooks'].includes(view)){
      view = 'overview';
    }

    const lastSyncTimeStr = state.settings.googleSheets.lastSyncTime ? new Date(state.settings.googleSheets.lastSyncTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'Not synced yet';

    app.innerHTML = `
      <div class="gcc-top">
        <div>
          <div class="gcc-eyebrow">
            Gamma Group · ${isAdmin() ? 'Executive Control (Admin)' : 'Portfolio Command Center (Viewer)'}
            <span class="gcc-status-pill" id="top-status-pill">
              <span class="gcc-status-dot ${isSyncingSheets ? 'syncing' : (isBackendConnected ? '' : 'offline')}"></span>
              <span>${isSyncingSheets ? 'Syncing Sheets…' : (isBackendConnected ? 'Backend Live' : 'Standalone Mode')}</span>
            </span>
          </div>
          <div class="gcc-title">Portfolio Command Center</div>
          <div class="gcc-sub">
            <span>Last updated ${new Date(state.lastUpdated).toLocaleString()}</span>
            <span style="color:var(--border);">|</span>
            <span style="color:var(--text-muted);">Google Sheets: ${lastSyncTimeStr}</span>
          </div>
        </div>
        <div class="gcc-top-actions">
          <div class="gcc-user-pill">
            <div class="gcc-user-avatar" style="background:${isAdmin()?'linear-gradient(135deg,#6366f1,#8b5cf6)':'linear-gradient(135deg,#06b6d4,#3b82f6)'};" title="${escapeHtml(currentUser.role || 'Viewer')}">${escapeHtml((currentUser.name || currentUser.email || currentUser.username || 'U')[0].toUpperCase())}</div>
            <span style="font-weight:600;">${escapeHtml(currentUser.name || currentUser.email || currentUser.username)}</span>
            <span class="gcc-status-pill" style="font-size:10.5px;text-transform:uppercase;background:${isAdmin()?'rgba(99,102,241,0.2)':'rgba(6,182,212,0.2)'};color:${isAdmin()?'#a5b4fc':'#67e8f9'};">${escapeHtml(currentUser.role || 'viewer')}</span>
            ${isAdmin() ? `
              <a href="/admin" class="gcc-btn secondary" style="padding:4px 8px;font-size:11px;text-decoration:none;display:inline-flex;align-items:center;gap:4px;">
                ${icon('settings')} Admin Panel
              </a>
            ` : ''}
            <button class="gcc-btn-logout" id="btn-gcc-logout" title="Log out of Command Center">
              ${icon('logOut')} Logout
            </button>
          </div>
          ${isBackendConnected && isAdmin() ? `
            <button class="gcc-btn secondary" id="btn-top-sync" title="Instant Google Sheets Sync">
              ${isSyncingSheets ? `${icon('refresh', 'gcc-svg-spin')} Syncing…` : `${icon('cloud')} Sync Sheets`}
            </button>
          ` : ''}
          <div class="gcc-nav" id="gcc-nav">
            ${visibleTabs.map(t=>`
              <button data-view="${t.key}" class="${view===t.key?'active':''}">${t.label}${(t.key==='data'||t.key==='settings')&&editingLocked()?` <span style="display:inline-flex;vertical-align:-2px;margin-left:3px;">${icon('lock')}</span>`:''}</button>
            `).join('')}
          </div>
        </div>
      </div>
      <div id="gcc-view"></div>
    `;

    const logoutBtn = document.getElementById('btn-gcc-logout');
    if(logoutBtn) logoutBtn.onclick = () => performLogout();

    document.querySelectorAll('#gcc-nav button').forEach(b=>{
      b.onclick = ()=>{ view = b.dataset.view; render(); };
    });

    const topSyncBtn = document.getElementById('btn-top-sync');
    if(topSyncBtn) topSyncBtn.onclick = ()=> syncGoogleSheets(true);

    const v = document.getElementById('gcc-view');
    const gated = (view==='data' || view==='settings') && editingLocked();
    if(gated){
      v.innerHTML = renderLockScreen();
      const tryUnlock = ()=>{
        const val = document.getElementById('lock-pin').value;
        if(val === state.settings.pin){ sessionUnlocked = true; render(); }
        else { Toast.error('Incorrect PIN.'); }
      };
      document.getElementById('lock-unlock').onclick = tryUnlock;
      document.getElementById('lock-pin').addEventListener('keydown', e=>{ if(e.key==='Enter') tryUnlock(); });
      return;
    }

    if(view==='overview') v.innerHTML = renderOverview();
    if(view==='register') v.innerHTML = renderRegister();
    if(view==='decisions') v.innerHTML = renderDecisions();
    if(view==='priorities') v.innerHTML = renderPriorities();
    if(view==='data' && isAdmin()) v.innerHTML = renderData();
    if(view==='webhooks' && isAdmin()) v.innerHTML = renderWebhooks();
    if(view==='settings' && isAdmin()) v.innerHTML = renderSettings();
    wireView();

    if(jumpTarget && ((jumpTarget.type==='action' && view==='register') || (jumpTarget.type==='decision' && view==='decisions'))){
      const el = document.querySelector(`[data-row-id="${jumpTarget.id}"]`);
      if(el){
        el.scrollIntoView({behavior:'smooth', block:'center'});
        el.classList.add('gcc-row-jump');
        setTimeout(()=>el.classList.remove('gcc-row-jump'), 1800);
      }
      jumpTarget = null;
    }
  }

  function wireView(){
    // Universal Quick Status Picker Trigger (Admin only)
    if(isAdmin()){
      document.querySelectorAll('[data-quick-status]').forEach(badge=>{
        badge.onclick = (e)=>{
          e.stopPropagation();
          const type = badge.dataset.quickStatus;
          const itemId = badge.dataset.itemId;

          if(type === 'action'){
            const a = state.actions.find(x=>x.id === itemId);
            if(!a) return;
            showStatusQuickPicker(badge, a.status, async (newStatus)=>{
              a.status = newStatus;
              await saveState(true);
              Toast.success(`Status updated to ${newStatus}`);
              render();
            });
          } else if(type === 'decision'){
            const d = state.decisions.find(x=>x.id === itemId);
            if(!d) return;
            showStatusQuickPicker(badge, d.status, async (newStatus)=>{
              d.status = newStatus;
              await saveState(true);
              Toast.success(`Status updated to ${newStatus}`);
              render();
            });
          }
        };
      });
    }

    if(view==='overview'){
      if(isAdmin()){
        document.querySelectorAll('[data-edit-action]').forEach(el=>{
          el.onclick = (e)=>{
            if(e.target.closest('[data-quick-status]')) return;
            openEditActionModal(el.dataset.editAction);
          };
        });

        document.querySelectorAll('[data-edit-decision]').forEach(el=>{
          el.onclick = (e)=>{
            if(e.target.closest('[data-quick-status]')) return;
            openEditDecisionModal(el.dataset.editDecision);
          };
        });

        const spotlightBtn = document.getElementById('edit-spotlight');
        if(spotlightBtn) spotlightBtn.onclick = (e)=>{
          e.stopPropagation();
          view = 'settings';
          render();
        };
      }

      // Non-destructive search input handling: restores cursor position & focus
      const oq = document.getElementById('f-overview-q');
      if(oq){
        oq.oninput = e=>{
          filters.overview.q = e.target.value;
          const pos = e.target.selectionStart;
          const dynamicEl = document.getElementById('overview-dynamic-content');
          if(dynamicEl){
            // Update only sub-content without destroying the active search input
            const os = state.settings.overviewSections;
            const qStr = filters.overview.q.trim().toLowerCase();
            const spotlight = state.settings.spotlightStatuses || [];
            let spotItems = state.actions.filter(a=>!a.hidden && spotlight.includes(a.status));
            let founderReviewItems = state.actions.filter(a=>
              !a.hidden && statusBucket(a.status)==='done' && (a.founderDependency||'').trim().toLowerCase()==='to review'
            );
            let decisionItems = state.decisions.filter(d=>!d.hidden && d.status!=='Done');
            let companyRows = companiesList();
            if(qStr){
              spotItems = spotItems.filter(a=> (a.item+a.owner+a.company+a.function).toLowerCase().includes(qStr));
              founderReviewItems = founderReviewItems.filter(a=> (a.item+a.owner+a.company).toLowerCase().includes(qStr));
              decisionItems = decisionItems.filter(d=> (d.decision+d.owner+d.impact).toLowerCase().includes(qStr));
              companyRows = companyRows.filter(c=> c.name.toLowerCase().includes(qStr));
            }

            dynamicEl.innerHTML = `
              ${os.companyHealth ? `
              <div class="gcc-h">Company Health & Execution Pulse</div>
              <div class="gcc-companies">
                ${companyRows.map(c=>{
                  const s = companyStats(c.id);
                  if(s.total===0) return '';
                  const seg = (n,color)=> s.total? `<div class="gcc-pulse-seg" style="width:${(n/s.total*100)}%;background:${color}"></div>` : '';
                  return `
                  <div class="gcc-co-row">
                    <div class="gcc-co-name"><span class="gcc-dot" style="background:${companyColor(c.id)}"></span>${c.name}</div>
                    <div class="gcc-pulse">${seg(s.attention,'var(--attention)')}${seg(s.hold,'var(--hold)')}${seg(s.progress,'var(--progress)')}${seg(s.done,'var(--done)')}</div>
                    <div class="gcc-co-stats">
                      <span class="gcc-stat-attn"><b>${s.attention}</b> attn</span>
                      <span class="gcc-stat-prog"><b>${s.progress}</b> wip</span>
                      <span class="gcc-stat-done"><b>${s.done}</b>/${s.total} done</span>
                    </div>
                  </div>`;
                }).join('') || '<div class="gcc-empty">No active companies found.</div>'}
              </div>` : ''}

              ${os.founderReview ? `
              <div class="gcc-h">Needs Founder Review</div>
              <div class="gcc-alist">
                ${founderReviewItems.length ? founderReviewItems.map(a=>{
                  const [soft, solid] = bucketColors(a.status);
                  return `
                  <div class="gcc-arow ${emphClass(a.status)}" data-edit-action="${a.id}" style="border-left-color:${solid};">
                    <div class="gcc-flag"></div>
                    <div class="gcc-a-co"><span class="gcc-co-tag" style="background:${companyColor(a.company)}22;color:${companyColor(a.company)}">${escapeHtml(a.company)}</span></div>
                    <div class="gcc-a-item">${escapeHtml(a.item)}</div>
                    <div class="gcc-a-owner">${escapeHtml(a.owner||'—')}</div>
                    <div class="gcc-a-status" data-quick-status="action" data-item-id="${a.id}" style="background:${soft};color:${solid};">${escapeHtml(a.status)} ${icon('chevronDown')}</div>
                    <div style="text-align:right;"><button class="gcc-btn secondary" style="padding:3px 6px;font-size:10px;">${icon('edit')}</button></div>
                  </div>`;
                }).join('') : '<div class="gcc-empty">No completed items pending founder review.</div>'}
              </div>` : ''}

              ${os.needsAttention ? `
              <div class="gcc-h" id="highlighted-section">
                Spotlight Action Items
                <button class="gcc-btn secondary" id="edit-spotlight" style="padding:3px 8px;font-size:11px;margin-left:auto;">${icon('settings')} Edit</button>
              </div>
              ${renderSpotlightGroups(spotItems)}` : ''}

              ${os.decisionQueue ? `
              <div class="gcc-h">Decisions Queue</div>
              <div class="gcc-dq">
                ${decisionItems.length ? decisionItems.map(d=>{
                  const [soft, solid] = bucketColors(d.status);
                  return `
                  <div class="gcc-dqrow ${emphClass(d.status)}" data-edit-decision="${d.id}" style="border-left:3px solid ${solid};">
                    <div class="gcc-dq-decision">${escapeHtml(d.decision)}</div>
                    <div class="gcc-dq-owner">${escapeHtml(d.owner||'—')}</div>
                    <div class="gcc-dq-impact">${escapeHtml(d.impact||'—')}</div>
                    <div class="gcc-a-status" data-quick-status="decision" data-item-id="${d.id}" style="background:${soft};color:${solid};">${escapeHtml(d.status)} ${icon('chevronDown')}</div>
                    <div style="text-align:right;"><button class="gcc-btn secondary" style="padding:3px 6px;font-size:10px;">${icon('edit')}</button></div>
                  </div>`;
                }).join('') : '<div class="gcc-empty">All decisions resolved.</div>'}
              </div>` : ''}
            `;
            wireView();
          }
        };
      }

      document.querySelectorAll('[data-kpi-id]').forEach(card=>{
        card.onclick = ()=>{
          const id = card.dataset.kpiId;
          if(activeOverviewKpi === id){
            activeOverviewKpi = null;
          } else {
            activeOverviewKpi = id;
          }
          render();
          const drillBox = document.getElementById('gcc-kpi-drilldown-box');
          if(drillBox){
            drillBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          }
        };
      });

      const closeKpiBtn = document.getElementById('btn-close-kpi-drilldown');
      if(closeKpiBtn){
        closeKpiBtn.onclick = ()=>{
          activeOverviewKpi = null;
          render();
        };
      }
    }

    if(view==='register'){
      document.getElementById('f-company').onchange = e=>{filters.register.company=e.target.value; render();};
      document.getElementById('f-status').onchange = e=>{filters.register.status=e.target.value; render();};
      document.getElementById('f-function').onchange = e=>{filters.register.function=e.target.value; render();};
      document.getElementById('f-owner').onchange = e=>{filters.register.owner=e.target.value; render();};
      document.getElementById('f-founder').onchange = e=>{filters.register.founderDependency=e.target.value; render();};
      document.getElementById('f-show-hidden').onchange = e=>{filters.register.showHidden=e.target.checked; render();};

      const resetBtn = document.getElementById('btn-reset-register-filters');
      if(resetBtn){
        resetBtn.onclick = ()=>{
          filters.register = {
            company: '',
            status: '',
            function: '',
            owner: '',
            founderDependency: '',
            q: '',
            showHidden: false
          };
          Toast.info('Filters reset to default.');
          render();
        };
      }

      if(isAdmin()){
        const addActBtn = document.getElementById('btn-open-add-action');
        if(addActBtn) addActBtn.onclick = openAddActionModal;

        document.querySelectorAll('[data-edit-action]').forEach(btn=>{
          btn.onclick = (e)=>{
            e.stopPropagation();
            openEditActionModal(btn.dataset.editAction);
          };
        });

        document.querySelectorAll('[data-hide-action]').forEach(btn=>{
          btn.onclick = async (e)=>{
            e.stopPropagation();
            const a = state.actions.find(x=>x.id===btn.dataset.hideAction);
            if(a){ a.hidden = !a.hidden; await saveState(true); render(); }
          };
        });
      }

      const fq = document.getElementById('f-q');
      if(fq){
        fq.oninput = e=>{
          filters.register.q = e.target.value;
          // Filter tbody rows in place without replacing inputs to keep typing silky smooth!
          const f = filters.register;
          let items = state.actions.slice();
          if(!f.showHidden) items = items.filter(a=>!a.hidden);
          if(f.company) items = items.filter(a=>(a.company||'').trim().toLowerCase()===f.company.trim().toLowerCase());
          if(f.status) items = items.filter(a=>(a.status||'').trim().toLowerCase()===f.status.trim().toLowerCase());
          if(f.function) items = items.filter(a=>(a.function||'').trim().toLowerCase()===f.function.trim().toLowerCase());
          if(f.owner) items = items.filter(a=>(a.owner||'').trim().toLowerCase()===f.owner.trim().toLowerCase());
          if(f.founderDependency) items = items.filter(a=>(a.founderDependency||'').trim().toLowerCase()===f.founderDependency.trim().toLowerCase());
          if(f.q){
            const q = f.q.trim().toLowerCase();
            items = items.filter(a=>(
              (a.item||'') + ' ' +
              (a.owner||'') + ' ' +
              (a.comments||'') + ' ' +
              (a.function||'') + ' ' +
              (a.company||'') + ' ' +
              (a.founderDependency||'') + ' ' +
              (a.due||'')
            ).toLowerCase().includes(q));
          }
          const visibleCols = state.settings.columns.filter(c=>c.visible);
          const tbody = document.getElementById('register-tbody');
          if(tbody){
            tbody.innerHTML = items.map(a=>{
              const [soft, solid] = bucketColors(a.status);
              return `
              <tr data-row-id="${a.id}" class="${emphClass(a.status)}">
                ${visibleCols.map(c=>{
                  if(c.key==='company') return `<td><span class="gcc-co-tag" style="background:${companyColor(a.company)}22;color:${companyColor(a.company)}">${escapeHtml(a.company)}</span></td>`;
                  if(c.key==='status') return `<td><span class="gcc-a-status" ${isAdmin()?`data-quick-status="action" data-item-id="${a.id}" style="cursor:pointer;background:${soft};color:${solid};"`:`style="background:${soft};color:${solid};"`}>${escapeHtml(a.status)}${isAdmin()?` ${icon('chevronDown')}`:''}</span></td>`;
                  if(c.key==='owner') return `<td class="owner">${escapeHtml(a.owner||'—')}</td>`;
                  if(c.key==='founderDependency') return `<td>${escapeHtml(a.founderDependency||'—')}</td>`;
                  if(c.key==='comments') return `<td style="color:var(--text-muted);font-size:11.5px;">${escapeHtml(a.comments||'—')}</td>`;
                  if(c.key==='item') return `<td style="font-weight:500;">${escapeHtml(a.item)}</td>`;
                  return `<td>${escapeHtml(a[c.key]||'—')}</td>`;
                }).join('')}
                ${isAdmin() ? `
                <td style="text-align:right;white-space:nowrap;">
                  <button class="gcc-btn secondary" data-edit-action="${a.id}" title="Edit item" style="padding:3px 6px;font-size:10px;">${icon('edit')}</button>
                  <button class="gcc-btn secondary" data-hide-action="${a.id}" title="${a.hidden?'Unhide':'Hide'} row" style="padding:3px 6px;font-size:10px;">${a.hidden?icon('eye'):icon('eyeOff')}</button>
                </td>` : ''}
              </tr>`;
            }).join('') || '<tr><td colspan="10" style="text-align:center;padding:30px;color:var(--text-muted);">No matching action items found.</td></tr>';
            wireView();
          }
        };
      }
    }

    if(view==='decisions'){
      const fDecOwner = document.getElementById('f-decisions-owner');
      if(fDecOwner) fDecOwner.onchange = e=>{filters.decisions.owner=e.target.value; render();};
      const fDecHidden = document.getElementById('f-decisions-show-hidden');
      if(fDecHidden) fDecHidden.onchange = e=>{filters.decisions.showHidden=e.target.checked; render();};
      
      if(isAdmin()){
        const addDecBtn = document.getElementById('btn-open-add-decision');
        if(addDecBtn) addDecBtn.onclick = openAddDecisionModal;

        document.querySelectorAll('[data-edit-decision]').forEach(btn=>{
          btn.onclick = (e)=>{
            e.stopPropagation();
            openEditDecisionModal(btn.dataset.editDecision);
          };
        });

        document.querySelectorAll('[data-hide-decision]').forEach(btn=>{
          btn.onclick = async (e)=>{
            e.stopPropagation();
            const d = state.decisions.find(x=>x.id===btn.dataset.hideDecision);
            if(d){ d.hidden = !d.hidden; await saveState(true); render(); }
          };
        });
      }

      const fdq = document.getElementById('f-decisions-q');
      if(fdq){
        fdq.oninput = e=>{
          filters.decisions.q = e.target.value;
          const f = filters.decisions;
          let items = state.decisions.slice();
          if(!f.showHidden) items = items.filter(d=>!d.hidden);
          if(f.owner) items = items.filter(d=>d.owner===f.owner);
          if(f.founderDependency) items = items.filter(d=>(d.founderDependency||'')===f.founderDependency);
          if(f.q){
            const q = f.q.toLowerCase();
            items = items.filter(d=>(d.decision+d.owner+d.impact).toLowerCase().includes(q));
          }
          const visibleCols = state.settings.decisionColumns.filter(c=>c.visible);
          const tbody = document.getElementById('decisions-tbody');
          if(tbody){
            tbody.innerHTML = items.map(d=>{
              const [soft, solid] = bucketColors(d.status);
              return `
              <tr data-row-id="${d.id}" class="${emphClass(d.status)}">
                ${visibleCols.map(c=>{
                  if(c.key==='status') return `<td><span class="gcc-a-status" ${isAdmin()?`data-quick-status="decision" data-item-id="${d.id}" style="cursor:pointer;background:${soft};color:${solid};"`:`style="background:${soft};color:${solid};"`}>${escapeHtml(d.status)}${isAdmin()?` ${icon('chevronDown')}`:''}</span></td>`;
                  if(c.key==='decision') return `<td style="font-weight:600;color:var(--table-text);">${escapeHtml(d.decision)}</td>`;
                  if(c.key==='impact') return `<td style="color:var(--attention);font-size:12px;">${escapeHtml(d.impact||'—')}</td>`;
                  return `<td>${escapeHtml(d[c.key]||'—')}</td>`;
                }).join('')}
                ${isAdmin() ? `
                <td style="text-align:right;white-space:nowrap;">
                  <button class="gcc-btn secondary" data-edit-decision="${d.id}" title="Edit decision" style="padding:3px 6px;font-size:10px;">${icon('edit')}</button>
                  <button class="gcc-btn secondary" data-hide-decision="${d.id}" title="${d.hidden?'Unhide':'Hide'} row" style="padding:3px 6px;font-size:10px;">${d.hidden?icon('eye'):icon('eyeOff')}</button>
                </td>` : ''}
              </tr>`;
            }).join('') || '<tr><td colspan="10" style="text-align:center;padding:30px;color:var(--text-muted);">No decisions found.</td></tr>';
            wireView();
          }
        };
      }
    }

    if(view==='priorities'){
      if(isAdmin()){
        const addPrioBtn = document.getElementById('btn-open-add-priority');
        if(addPrioBtn) addPrioBtn.onclick = openAddPriorityModal;

        document.querySelectorAll('[data-edit-priority]').forEach(el=>{
          el.onclick = ()=> openEditPriorityModal(el.dataset.editPriority);
        });
      }

      const fpq = document.getElementById('f-priorities-q');
      if(fpq){
        fpq.oninput = e=>{
          filters.priorities.q = e.target.value;
          const q = filters.priorities.q.toLowerCase();
          let items = state.priorities || [];
          if(q) items = items.filter(p=>(p.group+p.focusArea+p.why+p.horizon).toLowerCase().includes(q));

          const groups = {};
          items.forEach(p=>{
            const g = p.group || 'Strategic Focus';
            if(!groups[g]) groups[g] = [];
            groups[g].push(p);
          });

          const container = document.getElementById('priorities-container');
          if(container){
            container.innerHTML = Object.keys(groups).map(g=>`
              <div class="gcc-prio-group">
                <div class="gcc-prio-title">
                  <span class="gcc-prio-num">#</span>
                  ${escapeHtml(g)}
                </div>
                ${groups[g].map(p=>`
                  <div class="gcc-prio-item" ${isAdmin()?`data-edit-priority="${p.id}"`:''}>
                    <div>
                      <div style="font-weight:600;color:var(--table-text);margin-bottom:3px;">
                        <span style="font-family:var(--font-mono);color:var(--progress);margin-right:6px;">${escapeHtml(p.priority||'1.0')}</span>
                        ${escapeHtml(p.focusArea)}
                      </div>
                      <div class="gcc-prio-why">${escapeHtml(p.why||'')}</div>
                    </div>
                    <div class="gcc-prio-horizon">${escapeHtml(p.horizon||'')}</div>
                    ${isAdmin() ? `
                    <div style="text-align:right;">
                      <button class="gcc-btn secondary" style="padding:3px 6px;font-size:10px;" title="Edit priority">${icon('edit')}</button>
                    </div>` : ''}
                  </div>
                `).join('')}
              </div>
            `).join('') || `<div class="gcc-empty">No priorities logged yet.</div>`;
            wireView();
          }
        };
      }
    }

    if(view==='data'){
      // Wire Credentials Manager
      wireCredsManager();

      const syncGsBtn = document.getElementById('btn-sync-gs');
      if(syncGsBtn) syncGsBtn.onclick = async ()=>{
        const sheetId = document.getElementById('gs-sheet-id').value.trim();
        const autoInterval = +document.getElementById('gs-auto-interval').value;
        const target = (document.getElementById('gs-sync-target') && document.getElementById('gs-sync-target').value) || 'all';
        const mode = (document.getElementById('gs-sync-mode') && document.getElementById('gs-sync-mode').value) || 'merge';
        state.settings.googleSheets.sheetId = sheetId;
        state.settings.googleSheets.target = target;
        state.settings.googleSheets.mode = mode;
        state.settings.googleSheets.autoSyncIntervalMinutes = autoInterval;
        await saveState(true);
        setupAutoSync();
        syncGoogleSheets(true, mode);
      };

      const dropzone = document.getElementById('gcc-dropzone');
      const fileInput = document.getElementById('multi-file-upload');
      const uploadBtn = document.getElementById('btn-multi-upload');
      const clearStagedBtn = document.getElementById('btn-clear-staged');

      renderStagedFilesList();

      if(dropzone && fileInput){
        dropzone.onclick = ()=> fileInput.click();

        dropzone.ondragover = (e)=>{ e.preventDefault(); dropzone.classList.add('dragover'); };
        dropzone.ondragleave = ()=>{ dropzone.classList.remove('dragover'); };
        dropzone.ondrop = (e)=>{
          e.preventDefault();
          dropzone.classList.remove('dragover');
          if(e.dataTransfer.files && e.dataTransfer.files.length){
            Array.from(e.dataTransfer.files).forEach(f=> stagedFiles.push(f));
            renderStagedFilesList();
            if(uploadBtn){
              uploadBtn.disabled = !stagedFiles.length;
              uploadBtn.innerHTML = `${icon('upload')} Import Files (${stagedFiles.length})`;
            }
          }
        };

        fileInput.onchange = ()=>{
          if(fileInput.files && fileInput.files.length){
            Array.from(fileInput.files).forEach(f=> stagedFiles.push(f));
            renderStagedFilesList();
            if(uploadBtn){
              uploadBtn.disabled = !stagedFiles.length;
              uploadBtn.innerHTML = `${icon('upload')} Import Files (${stagedFiles.length})`;
            }
          }
          fileInput.value = '';
        };
      }

      if(clearStagedBtn){
        clearStagedBtn.onclick = ()=>{
          stagedFiles = [];
          renderStagedFilesList();
          if(uploadBtn){
            uploadBtn.disabled = true;
            uploadBtn.innerHTML = `${icon('upload')} Import Files`;
          }
        };
      }

      // Destination target change handler (show new company input)
      const targetSelect = document.getElementById('upload-target-select');
      const newCoContainer = document.getElementById('container-new-company');
      if(targetSelect && newCoContainer){
        targetSelect.onchange = ()=>{
          newCoContainer.style.display = targetSelect.value === 'create_new' ? 'block' : 'none';
        };
      }

      // Advanced import options toggle accordion
      const advToggle = document.getElementById('btn-toggle-advanced-import');
      const advContent = document.getElementById('adv-import-content');
      const advArrow = document.getElementById('adv-arrow');
      if(advToggle && advContent){
        advToggle.onclick = ()=>{
          const isOpen = advContent.classList.toggle('open');
          if(advArrow) advArrow.textContent = isOpen ? '▴' : '▾';
        };
      }

      // Open conflict modal if conflicts button clicked
      const openConfBtn = document.getElementById('btn-open-conflict-modal');
      if(openConfBtn && persistentUploadStatus && persistentUploadStatus.conflicts){
        openConfBtn.onclick = ()=>{
          openConflictResolutionModal(persistentUploadStatus.conflicts, async ()=>{
            const latest = await apiFetch('/api/data');
            state = latest;
            persistentUploadStatus.conflicts = [];
            render();
          });
        };
      }

      if(uploadBtn){
        uploadBtn.onclick = async ()=>{
          if(!stagedFiles.length) return;
          const mode = document.getElementById('upload-mode-select').value;
          const target = (document.getElementById('upload-target-select') && document.getElementById('upload-target-select').value) || 'all';
          const conflictStrategy = (document.getElementById('upload-conflict-strategy') && document.getElementById('upload-conflict-strategy').value) || 'incoming_wins';
          const minQuality = (document.getElementById('upload-quality-score') && document.getElementById('upload-quality-score').value) || '0.4';
          const excludedStatuses = (document.getElementById('upload-excluded-statuses') && document.getElementById('upload-excluded-statuses').value) || '';
          const dateStart = (document.getElementById('upload-date-start') && document.getElementById('upload-date-start').value) || '';
          const dateEnd = (document.getElementById('upload-date-end') && document.getElementById('upload-date-end').value) || '';
          const newCompanyName = (document.getElementById('upload-new-company-name') && document.getElementById('upload-new-company-name').value) || '';
          const statusBox = document.getElementById('multi-upload-status');

          uploadBtn.disabled = true;
          uploadBtn.innerHTML = `${icon('refresh', 'gcc-svg-spin')} Processing Files…`;
          if(statusBox){
            statusBox.className = 'gcc-file-status show info';
            statusBox.textContent = `Uploading and processing ${stagedFiles.length} file(s)…`;
          }

          try {
            if(isBackendConnected){
              const formData = new FormData();
              stagedFiles.forEach(f=> formData.append('files', f));
              formData.append('mode', mode);
              formData.append('target', target);
              formData.append('destination', target);
              formData.append('conflict_strategy', conflictStrategy);
              formData.append('min_quality_score', minQuality);
              formData.append('excluded_statuses', excludedStatuses);
              if(dateStart) formData.append('date_start', dateStart);
              if(dateEnd) formData.append('date_end', dateEnd);
              if(newCompanyName) formData.append('new_company_name', newCompanyName);

              // Upload authentication uses the HttpOnly gcc_session cookie established at login.
              // Do not set multipart Content-Type manually: the browser supplies its boundary.
              const uploadRequest = () => fetch('/api/upload', {
                method: 'POST',
                credentials: 'same-origin',
                body: formData
              });
              let res = await uploadRequest();
              if(res.status === 401 && await tryRefreshToken()){
                res = await uploadRequest();
              }
              if(res.status === 401) redirectToLogin();
              const json = await res.json();
              if(res.ok && json.success){
                const latest = await apiFetch('/api/data');
                state = latest;
                localStorage.setItem('gcc-data', JSON.stringify(state));
                persistentUploadStatus = {
                  message: `✓ ${json.message}`,
                  type: 'success',
                  counts: json.counts || {},
                  conflicts: json.conflicts || []
                };
                Toast.success(json.message);
                stagedFiles = [];

                if(json.conflicts && json.conflicts.length > 0){
                  openConflictResolutionModal(json.conflicts, async ()=>{
                    const updatedData = await apiFetch('/api/data');
                    state = updatedData;
                    persistentUploadStatus.conflicts = [];
                    render();
                  });
                } else if(target !== 'all' && ['register', 'decisions', 'priorities'].includes(target)){
                  view = target;
                }
                render();
              } else {
                const errMsg = json.detail || json.error || 'Upload error.';
                persistentUploadStatus = { message: `✕ ${errMsg}`, type: 'error' };
                Toast.error(errMsg);
                if(statusBox){
                  statusBox.className = 'gcc-file-status show error';
                  statusBox.textContent = `✕ ${errMsg}`;
                }
                uploadBtn.disabled = false;
                uploadBtn.innerHTML = `${icon('upload')} Import Files (${stagedFiles.length})`;
              }
            } else {
              const result = await parseFilesClientSide(stagedFiles, target, mode, {
                conflictStrategy,
                minQualityScore: parseFloat(minQuality),
                excludedStatuses: excludedStatuses.split(',').map(s=>s.trim().toLowerCase()).filter(Boolean),
                dateStart,
                dateEnd,
                newCompanyName
              });
              persistentUploadStatus = {
                message: `✓ ${result.message}`,
                type: 'success',
                counts: result.counts || {},
                conflicts: result.conflicts || []
              };
              Toast.success(result.message);
              stagedFiles = [];
              if(result.conflicts && result.conflicts.length > 0){
                openConflictResolutionModal(result.conflicts, async ()=>{
                  persistentUploadStatus.conflicts = [];
                  render();
                });
              } else if(target !== 'all' && ['register', 'decisions', 'priorities'].includes(target)){
                view = target;
              }
              render();
            }
          } catch(e){
            persistentUploadStatus = { message: `✕ Upload failed: ${e.message}`, type: 'error' };
            Toast.error(`Upload failed: ${e.message}`);
            if(statusBox){
              statusBox.className = 'gcc-file-status show error';
              statusBox.textContent = `✕ ${e.message}`;
            }
            uploadBtn.disabled = false;
            uploadBtn.innerHTML = `${icon('upload')} Import Files (${stagedFiles.length})`;
          }
        };
      }

      document.getElementById('btn-import').onclick = async ()=>{
        const raw = document.getElementById('import-actions').value.trim();
        if(!raw) return;
        const lines = raw.split('\n').filter(l=>l.trim());
        let added = 0;
        lines.forEach(line=>{
          const cols = line.split('\t').map(c=>(c||'').trim());
          if(cols.length < 3) return;
          const [company, func, item, status, owner, comments] = cols;
          if((company||'').toLowerCase()==='company' && (item||'').toLowerCase()==='item') return;
          state.actions.push({
            id: 'a_'+Date.now()+'_'+Math.random().toString(36).slice(2,6),
            company: company || (companiesList()[0] ? companiesList()[0].id : 'General'),
            function: func || 'General',
            item: item || '',
            status: statusesList().includes(status) ? status : (statusesList()[0]||'WIP'),
            owner: owner || '',
            founderDependency: 'None',
            due:'', comments: comments || ''
          });
          added++;
        });
        await saveState(true);
        Toast.success(added ? `Imported ${added} pasted row(s).` : 'No rows imported.');
        render();
      };
      document.getElementById('btn-clear-import').onclick = ()=>{ document.getElementById('import-actions').value=''; };

      document.getElementById('btn-add-item').onclick = async ()=>{
        const item = document.getElementById('nf-item').value.trim();
        if(!item){ Toast.error('Item text is required.'); return; }
        state.actions.unshift({
          id: 'a_'+Date.now()+'_'+Math.random().toString(36).slice(2,6),
          company: document.getElementById('nf-company').value,
          function: document.getElementById('nf-function').value.trim() || 'General',
          owner: document.getElementById('nf-owner').value.trim(),
          item: item,
          status: document.getElementById('nf-status').value,
          founderDependency: document.getElementById('nf-founder').value.trim() || 'None',
          due: '', comments: ''
        });
        await saveState(true);
        Toast.success('Action item created.');
        render();
      };

      const jsonBtn = document.getElementById('btn-export-json');
      if(jsonBtn) jsonBtn.onclick = ()=>{
        const blob = new Blob([JSON.stringify(state, null, 2)], {type: 'application/json'});
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `portfolio_backup_${new Date().toISOString().slice(0,10)}.json`;
        a.click();
        URL.revokeObjectURL(url);
        Toast.success('JSON backup downloaded.');
      };

      document.getElementById('btn-reset').onclick = async ()=>{
        if(!confirm('Reset entire dashboard to default seed data?')) return;
        state = seedData();
        await saveState(true);
        Toast.info('State reset to seed baseline.');
        render();
      };
    }

    if(view==='webhooks'){
      // Wire Copy Webhook URL
      const copyUrlBtn = document.getElementById('btn-copy-webhook-url');
      if(copyUrlBtn){
        copyUrlBtn.onclick = ()=>{
          const urlEl = document.getElementById('wh-endpoint-url');
          if(urlEl){
            navigator.clipboard.writeText(urlEl.innerText).then(()=>{
              Toast.success('Webhook URL copied to clipboard!');
            });
          }
        };
      }

      // Wire Copy Google Apps Script
      const copyScriptBtn = document.getElementById('btn-copy-gas-script');
      if(copyScriptBtn){
        copyScriptBtn.onclick = ()=>{
          const codeEl = document.getElementById('wh-gas-code');
          if(codeEl){
            navigator.clipboard.writeText(codeEl.innerText).then(()=>{
              Toast.success('Google Apps Script copied to clipboard!');
            });
          }
        };
      }

      // Wire Save Webhook Settings
      const saveWhBtn = document.getElementById('btn-save-webhook-settings');
      if(saveWhBtn){
        saveWhBtn.onclick = async ()=>{
          const secret = (document.getElementById('wh-secret-key').value || '').trim();
          const defTarget = document.getElementById('wh-default-target').value;
          state.settings.webhookSettings = state.settings.webhookSettings || {};
          state.settings.webhookSettings.secretKey = secret;
          state.settings.webhookSettings.defaultTarget = defTarget;
          await saveState(false);
          Toast.success('Webhook settings updated.');
          render();
        };
      }

      // Wire Simulators
      const wireSim = (btnId, targetType)=>{
        const btn = document.getElementById(btnId);
        if(!btn) return;
        btn.onclick = async ()=>{
          btn.disabled = true;
          btn.innerHTML = `${icon('refresh', 'gcc-svg-spin')} Ingesting…`;
          try {
            if(isBackendConnected){
              const res = await apiFetch('/api/webhooks/test', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({ target: targetType })
              });
              Toast.success(res.message || 'Webhook processed successfully.');
              const updatedData = await apiFetch('/api/data');
              state = updatedData;
              localStorage.setItem('gcc-data', JSON.stringify(state));
            } else {
              if(targetType === 'action'){
                state.actions.unshift({
                  id: 'wh_a_' + Date.now(),
                  company: 'Aarna',
                  function: 'Product',
                  item: 'Simulated Inbound Webhook: Launch New Partner Portal',
                  owner: 'Saurav',
                  status: 'WIP',
                  founderDependency: 'None',
                  due: '',
                  comments: 'Simulated via local standalone webhook'
                });
              } else if(targetType === 'decision'){
                state.decisions.unshift({
                  id: 'wh_d_' + Date.now(),
                  decision: 'Simulated Inbound Webhook: Expand Regional Hub',
                  owner: 'Nikhil',
                  status: 'To Start',
                  founderDependency: 'To Review',
                  impact: 'First mover advantage',
                  deadline: 'Next Month',
                  nextReview: ''
                });
              } else if(targetType === 'priority'){
                state.priorities.unshift({
                  id: 'wh_p_' + Date.now(),
                  priority: '1.2',
                  group: 'Pranik Products',
                  focusArea: 'Simulated Webhook: Doctor-Patient AI Assistant',
                  why: 'Accelerate patient intake workflow',
                  horizon: 'Next 15 days'
                });
              }
              await saveState(true);
              Toast.success(`Simulated ${targetType} record created.`);
            }
            loadWebhookLogs();
          } catch(err){
            Toast.error(`Simulation error: ${err.message}`);
          } finally {
            btn.disabled = false;
            if(targetType === 'action') btn.innerHTML = `${icon('zap')} Ingest Action Item`;
            if(targetType === 'decision') btn.innerHTML = `${icon('zap')} Ingest Decision`;
            if(targetType === 'priority') btn.innerHTML = `${icon('zap')} Ingest Priority`;
          }
        };
      };

      wireSim('btn-sim-action', 'action');
      wireSim('btn-sim-decision', 'decision');
      wireSim('btn-sim-priority', 'priority');

      // Inbound Logs Fetcher & Renderer
      async function loadWebhookLogs(){
        const container = document.getElementById('wh-logs-container');
        if(!container) return;
        try {
          if(isBackendConnected){
            const res = await apiFetch('/api/webhooks/logs');
            renderWebhookLogsTable(res.logs || []);
          } else {
            renderWebhookLogsTable([
              {
                id: 'wh_local_1',
                timestamp: new Date().toISOString(),
                source: 'Simulator (Standalone)',
                status: 'success',
                target_type: 'action',
                message: 'Local webhook ready'
              }
            ]);
          }
        } catch(e){
          container.innerHTML = `<div style="padding:16px;color:var(--text-dim);text-align:center;">Could not fetch webhook logs: ${escapeHtml(e.message)}</div>`;
        }
      }

      function renderWebhookLogsTable(logs){
        const container = document.getElementById('wh-logs-container');
        if(!container) return;
        if(!logs.length){
          container.innerHTML = `<div style="text-align:center;padding:24px;color:var(--text-muted);">No inbound webhooks received yet. Use the simulator above to test!</div>`;
          return;
        }
        container.innerHTML = `
          <table class="gcc-webhook-log-table">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Source</th>
                <th>Status</th>
                <th>Type</th>
                <th>Details / Record</th>
                <th>Client IP</th>
              </tr>
            </thead>
            <tbody>
              ${logs.map(log=>`
                <tr>
                  <td style="font-family:var(--font-mono);font-size:11px;color:var(--text-dim);white-space:nowrap;">
                    ${new Date(log.timestamp).toLocaleTimeString()} · ${new Date(log.timestamp).toLocaleDateString()}
                  </td>
                  <td style="font-weight:600;">${escapeHtml(log.source || 'Webhook')}</td>
                  <td>
                    <span class="${log.status==='success'?'gcc-badge-success':'gcc-badge-error'}">
                      ${escapeHtml(log.status)}
                    </span>
                  </td>
                  <td><code style="font-size:11px;">${escapeHtml(log.target_type || 'auto')}</code></td>
                  <td style="max-width:320px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;" title="${escapeHtml(log.message)}">
                    ${escapeHtml(log.message)}
                  </td>
                  <td style="font-family:var(--font-mono);font-size:11px;color:var(--text-dim);">${escapeHtml(log.client_ip || '127.0.0.1')}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        `;
      }

      const refreshLogsBtn = document.getElementById('btn-refresh-webhook-logs');
      if(refreshLogsBtn) refreshLogsBtn.onclick = ()=> loadWebhookLogs();

      const clearLogsBtn = document.getElementById('btn-clear-webhook-logs');
      if(clearLogsBtn) clearLogsBtn.onclick = async ()=>{
        if(isBackendConnected){
          await apiFetch('/api/webhooks/clear-logs', { method: 'POST' });
        }
        Toast.info('Webhook logs cleared.');
        loadWebhookLogs();
      };

      loadWebhookLogs();
    }

    // Custom inline column editing
    document.querySelectorAll('[data-custom-edit]').forEach(inp=>{
      inp.onchange = async ()=>{
        const parts = inp.dataset.customEdit.split(':');
        const itemType = parts[0];
        const id = parts[1];
        const key = parts.slice(2).join(':');
        const list = itemType === 'action' ? state.actions : state.decisions;
        const item = list.find(x => String(x.id) === id);
        if(item){
          if(!item.custom) item.custom = {};
          item.custom[key] = inp.value;
          await saveState(true);
          Toast.success('Saved cell.');
        }
      };
    });

    if(view==='settings'){
      // Color pickers (Text & Status)
      document.querySelectorAll('[data-color-key]').forEach(inp=>{
        inp.oninput = async ()=>{
          state.settings.colors[inp.dataset.colorKey] = inp.value;
          applyTheme();
          await saveState(true);
        };
      });

      // Company Color pickers
      document.querySelectorAll('[data-company-key]').forEach(inp=>{
        inp.oninput = async ()=>{
          state.settings.companyColors[inp.dataset.companyKey] = inp.value;
          await saveState(true);
        };
      });

      // Company management
      document.querySelectorAll('[data-company-remove]').forEach(b=>{
        b.onclick = async ()=>{
          const i = +b.dataset.companyRemove;
          if(state.settings.companies.length <= 1){ Toast.error('Keep at least one company in your portfolio.'); return; }
          const co = state.settings.companies[i];
          if(!confirm(`Remove company "${co.name}"? This will permanently delete all associated action items, decisions, and priorities across all tabs.`)) return;
          state.settings.companies.splice(i, 1);
          
          // Remove all details associated with this company
          if (state.actions) state.actions = state.actions.filter(a => a.company !== co.name && a.company !== co.id);
          if (state.decisions) state.decisions = state.decisions.filter(d => d.company !== co.name && d.company !== co.id);
          if (state.priorities) state.priorities = state.priorities.filter(p => p.group !== co.name && p.group !== co.id);
          
          await saveState(true);
          Toast.success(`Company "${co.name}" and its details were removed.`);
          render();
        };
      });

      const addCoBtn = document.getElementById('btn-add-company');
      if(addCoBtn){
        addCoBtn.onclick = async ()=>{
          const name = prompt('Enter new company name:');
          if(!name || !name.trim()) return;
          const id = name.trim();
          if(state.settings.companies.some(c => c.id.toLowerCase() === id.toLowerCase() || c.name.toLowerCase() === id.toLowerCase())){
            Toast.error('That company already exists.');
            return;
          }
          state.settings.companies.push({id, name: id});
          const palette = ['#3FA796', '#E0A458', '#8B7FD1', '#E0705C', '#5B8DEF', '#C77DD0', '#6DBE8C', '#D68BB0', '#FF9F1C', '#2EC4B6'];
          state.settings.companyColors[id] = palette[state.settings.companies.length % palette.length];
          await saveState(true);
          Toast.success(`Company "${id}" added.`);
          render();
        };
      }

      // Status management
      document.querySelectorAll('[data-status-remove]').forEach(b=>{
        b.onclick = async ()=>{
          const i = +b.dataset.statusRemove;
          if(state.settings.statuses.length <= 1){ Toast.error('Keep at least one status.'); return; }
          const st = state.settings.statuses[i];
          if(!confirm(`Remove status "${st}"? Existing items retain their status, but it will no longer appear in status selectors.`)) return;
          state.settings.statuses.splice(i, 1);
          await saveState(true);
          Toast.success(`Status "${st}" removed.`);
          render();
        };
      });

      const addStBtn = document.getElementById('btn-add-status');
      if(addStBtn){
        addStBtn.onclick = async ()=>{
          const name = prompt('Enter new status name:');
          if(!name || !name.trim()) return;
          const stName = name.trim();
          if(state.settings.statuses.some(s => s.toLowerCase() === stName.toLowerCase())){
            Toast.error('That status already exists.');
            return;
          }
          const bucket = prompt('Which bucket does it belong to? Type one of: attention, progress, done, hold, future', 'progress');
          const validBuckets = ['attention', 'progress', 'done', 'hold', 'future'];
          const chosen = (bucket && validBuckets.includes(bucket.trim().toLowerCase())) ? bucket.trim().toLowerCase() : 'progress';
          state.settings.statuses.push(stName);
          state.settings.statusBuckets[stName] = chosen;
          await saveState(true);
          Toast.success(`Status "${stName}" added (${chosen}).`);
          render();
        };
      }

      // Register Columns Management
      document.querySelectorAll('[data-col-visible]').forEach(cb=>{
        cb.onchange = async ()=>{
          const i = +cb.dataset.colVisible;
          state.settings.columns[i].visible = cb.checked;
          await saveState(true);
        };
      });

      document.querySelectorAll('[data-col-up]').forEach(b=>{
        b.onclick = async ()=>{
          const i = +b.dataset.colUp;
          if(i <= 0) return;
          const cols = state.settings.columns;
          [cols[i-1], cols[i]] = [cols[i], cols[i-1]];
          await saveState(true);
          render();
        };
      });

      document.querySelectorAll('[data-col-down]').forEach(b=>{
        b.onclick = async ()=>{
          const i = +b.dataset.colDown;
          const cols = state.settings.columns;
          if(i >= cols.length - 1) return;
          [cols[i+1], cols[i]] = [cols[i], cols[i+1]];
          await saveState(true);
          render();
        };
      });

      document.querySelectorAll('[data-col-remove]').forEach(b=>{
        b.onclick = async ()=>{
          const i = +b.dataset.colRemove;
          if(state.settings.columns.length <= 1){ Toast.error('Keep at least one column.'); return; }
          const col = state.settings.columns[i];
          if(!confirm(`Remove column "${col.label}"? Any data entered in custom fields will be hidden.`)) return;
          state.settings.columns.splice(i, 1);
          await saveState(true);
          Toast.success(`Column "${col.label}" removed.`);
          render();
        };
      });

      const addColRegBtn = document.getElementById('btn-add-col-register');
      if(addColRegBtn){
        addColRegBtn.onclick = async ()=>{
          const label = prompt('Enter name for the new Register column:');
          if(!label || !label.trim()) return;
          const cleanLabel = label.trim();
          const key = 'custom_' + cleanLabel.toLowerCase().replace(/[^a-z0-9]/g, '_') + '_' + Date.now();
          state.settings.columns.push({ key, label: cleanLabel, visible: true });
          await saveState(true);
          Toast.success(`Column "${cleanLabel}" added to Register.`);
          render();
        };
      }

      // Decision Columns Management
      document.querySelectorAll('[data-dcol-visible]').forEach(cb=>{
        cb.onchange = async ()=>{
          const i = +cb.dataset.dcolVisible;
          state.settings.decisionColumns[i].visible = cb.checked;
          await saveState(true);
        };
      });

      document.querySelectorAll('[data-dcol-up]').forEach(b=>{
        b.onclick = async ()=>{
          const i = +b.dataset.dcolUp;
          if(i <= 0) return;
          const cols = state.settings.decisionColumns;
          [cols[i-1], cols[i]] = [cols[i], cols[i-1]];
          await saveState(true);
          render();
        };
      });

      document.querySelectorAll('[data-dcol-down]').forEach(b=>{
        b.onclick = async ()=>{
          const i = +b.dataset.dcolDown;
          const cols = state.settings.decisionColumns;
          if(i >= cols.length - 1) return;
          [cols[i+1], cols[i]] = [cols[i], cols[i+1]];
          await saveState(true);
          render();
        };
      });

      document.querySelectorAll('[data-dcol-remove]').forEach(b=>{
        b.onclick = async ()=>{
          const i = +b.dataset.dcolRemove;
          if(state.settings.decisionColumns.length <= 1){ Toast.error('Keep at least one decision column.'); return; }
          const col = state.settings.decisionColumns[i];
          if(!confirm(`Remove decision column "${col.label}"?`)) return;
          state.settings.decisionColumns.splice(i, 1);
          await saveState(true);
          Toast.success(`Decision column "${col.label}" removed.`);
          render();
        };
      });

      const addColDecBtn = document.getElementById('btn-add-col-decisions');
      if(addColDecBtn){
        addColDecBtn.onclick = async ()=>{
          const label = prompt('Enter name for the new Decision column:');
          if(!label || !label.trim()) return;
          const cleanLabel = label.trim();
          const key = 'custom_' + cleanLabel.toLowerCase().replace(/[^a-z0-9]/g, '_') + '_' + Date.now();
          state.settings.decisionColumns.push({ key, label: cleanLabel, visible: true });
          await saveState(true);
          Toast.success(`Column "${cleanLabel}" added to Decisions.`);
          render();
        };
      }

      // KPI Cards Management
      document.querySelectorAll('[data-kpi-remove]').forEach(b=>{
        b.onclick = async ()=>{
          const i = +b.dataset.kpiRemove;
          state.settings.kpis.splice(i, 1);
          await saveState(true);
          Toast.success('KPI card removed.');
          render();
        };
      });

      document.querySelectorAll('[data-kpi-up]').forEach(b=>{
        b.onclick = async ()=>{
          const i = +b.dataset.kpiUp;
          if(i <= 0) return;
          const kpis = state.settings.kpis;
          [kpis[i-1], kpis[i]] = [kpis[i], kpis[i-1]];
          await saveState(true);
          render();
        };
      });

      document.querySelectorAll('[data-kpi-down]').forEach(b=>{
        b.onclick = async ()=>{
          const i = +b.dataset.kpiDown;
          const kpis = state.settings.kpis;
          if(i >= kpis.length - 1) return;
          [kpis[i+1], kpis[i]] = [kpis[i], kpis[i+1]];
          await saveState(true);
          render();
        };
      });

      const addKpiBtn = document.getElementById('btn-add-kpi');
      if(addKpiBtn){
        addKpiBtn.onclick = async ()=>{
          const sel = document.getElementById('kpi-add-select');
          if(!sel || !sel.value) return;
          const opt = sel.options[sel.selectedIndex];
          state.settings.kpis.push({ id: sel.value, label: opt.dataset.label, visible: true });
          await saveState(true);
          Toast.success(`KPI card "${opt.dataset.label}" added.`);
          render();
        };
      }

      // Tab Management (Order & Visibility)
      document.querySelectorAll('[data-tab-visible]').forEach(cb=>{
        cb.onchange = async ()=>{
          const i = +cb.dataset.tabVisible;
          if(state.settings.tabs[i].key === 'settings'){
            cb.checked = true;
            return;
          }
          state.settings.tabs[i].visible = cb.checked;
          await saveState(true);
          render();
        };
      });

      document.querySelectorAll('[data-tab-up]').forEach(b=>{
        b.onclick = async ()=>{
          const i = +b.dataset.tabUp;
          if(i <= 0) return;
          const tabs = state.settings.tabs;
          [tabs[i-1], tabs[i]] = [tabs[i], tabs[i-1]];
          await saveState(true);
          render();
        };
      });

      document.querySelectorAll('[data-tab-down]').forEach(b=>{
        b.onclick = async ()=>{
          const i = +b.dataset.tabDown;
          const tabs = state.settings.tabs;
          if(i >= tabs.length - 1) return;
          [tabs[i+1], tabs[i]] = [tabs[i], tabs[i+1]];
          await saveState(true);
          render();
        };
      });

      // Spotlight Statuses Filter
      document.querySelectorAll('[data-spotlight-status]').forEach(chk=>{
        chk.onchange = async ()=>{
          const st = chk.dataset.spotlightStatus;
          state.settings.spotlightStatuses = state.settings.spotlightStatuses || [];
          if(chk.checked){
            if(!state.settings.spotlightStatuses.includes(st)) state.settings.spotlightStatuses.push(st);
          } else {
            state.settings.spotlightStatuses = state.settings.spotlightStatuses.filter(x=>x!==st);
          }
          await saveState(true);
        };
      });

      // Status Emphasis (Normal / Highlight / Mute)
      document.querySelectorAll('[data-emph-status]').forEach(seg=>{
        seg.querySelectorAll('button').forEach(btn=>{
          btn.onclick = async ()=>{
            state.settings.emphasis = state.settings.emphasis || {};
            state.settings.emphasis[seg.dataset.emphStatus] = btn.dataset.emphVal;
            await saveState(true);
            render();
          };
        });
      });

      // PIN Access
      const pinBtn = document.getElementById('btn-set-pin');
      if(pinBtn){
        pinBtn.onclick = async ()=>{
          const current = document.getElementById('pin-current');
          const next = document.getElementById('pin-new').value.trim();
          if(state.settings.pin){
            if(!current || current.value !== state.settings.pin){ Toast.error('Current PIN is incorrect.'); return; }
          }
          state.settings.pin = next;
          if(next) sessionUnlocked = true;
          await saveState(true);
          Toast.success(next ? 'PIN protection activated.' : 'PIN protection removed.');
          render();
        };
      }

      // Reset Settings
      document.getElementById('btn-reset-settings').onclick = async ()=>{
        if(!confirm('Reset colors, companies, statuses, columns, KPI cards, and tabs to defaults? Your action items, decisions, priorities, and PIN will remain untouched.')) return;
        const d = defaultSettings();
        state.settings.colors = d.colors;
        state.settings.companyColors = d.companyColors;
        state.settings.companies = d.companies;
        state.settings.statuses = d.statuses;
        state.settings.statusBuckets = d.statusBuckets;
        state.settings.columns = d.columns;
        state.settings.decisionColumns = d.decisionColumns;
        state.settings.kpis = d.kpis;
        state.settings.tabs = d.tabs;
        state.settings.emphasis = d.emphasis;
        state.settings.spotlightStatuses = d.spotlightStatuses;
        state.settings.overviewSections = d.overviewSections;
        applyTheme();
        await saveState(true);
        Toast.success('Settings reset to defaults.');
        render();
      };
    }
  }

  // Initialize
  loadState();

  // Viewer-only: lightweight visibility-aware poll (every 15 seconds)
  // Fires ONLY when the browser tab is visible and the user is NOT an admin.
  // Re-renders ONLY if the admin has changed data (lastUpdated differs).
  // This is the only way viewers can detect admin changes without a manual refresh.
  let viewerPollTimer = null;
  function startViewerPoll(){
    if(isAdmin()) return;  // Admins use event-driven refresh, not polling
    if(viewerPollTimer) return;  // Never create duplicate intervals
    viewerPollTimer = setInterval(async () => {
      if(document.hidden) return;  // Pause when tab is in the background
      try {
        const remote = await apiFetch('/api/data');
        await applyRemoteIfChanged(remote);
      } catch(e) {
        // Ignore transient network errors silently
      }
    }, 15000);
  }

  // Start viewer poll after loadState resolves (give auth a moment to settle)
  setTimeout(() => {
    if(!isAdmin()) startViewerPoll();
  }, 2000);
})();
