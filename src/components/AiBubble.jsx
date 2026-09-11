import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import { useProfile } from '../hooks/useProfile.js';
import { useTracker } from '../hooks/useTracker.js';
import { callGroqChat, formatMarkdownToHtml, getGroqApiKey } from '../services/aiService.js';

export default function AiBubble() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { profile } = useProfile();
  const { projects } = useTracker();

  const [isOpen, setIsOpen] = useState(false);
  const [inputVal, setInputVal] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Derived user details for ambient context
  const userName = profile?.fullName || currentUser?.displayName || 'Developer';
  const userRole = profile?.targetRole || 'Software Engineer';
  const projectList = useMemo(() => (Array.isArray(projects) ? projects : []), [projects]);

  // Project statistics
  const doneProjects = useMemo(
    () => projectList.filter((p) => p.status?.toLowerCase() === 'done'),
    [projectList]
  );
  const inProgressProjects = useMemo(
    () => projectList.filter((p) => p.status?.toLowerCase() === 'in-progress'),
    [projectList]
  );

  // Skills parsing
  const skillsList = useMemo(() => {
    const raw = [profile?.coreLanguages, profile?.frameworks, profile?.devTools]
      .filter(Boolean)
      .join(', ');
    return raw
      ? raw.split(/[,•\n]+/).map((s) => s.trim()).filter(Boolean)
      : [];
  }, [profile]);

  // ATS Score calculation matching Dashboard logic
  const atsMetrics = useMemo(() => {
    const profileFields = [
      profile?.fullName, profile?.email, profile?.phone, profile?.location,
      profile?.targetRole, profile?.bio, profile?.coreLanguages, profile?.frameworks,
      profile?.devTools, profile?.degree, profile?.institution, profile?.githubUrl,
      profile?.linkedinUrl, profile?.experience
    ];
    const filledCount = profileFields.filter(Boolean).length;
    const readiness = Math.round((filledCount / profileFields.length) * 100);
    let score = Math.round((readiness * 0.75) + (projectList.length >= 1 ? 15 : 0) + (projectList.length >= 3 ? 10 : 0));
    if (score > 100) score = 100;
    return { score, readiness };
  }, [profile, projectList]);

  // Initial welcome greeting
  const [messages, setMessages] = useState(() => [
    {
      id: 'welcome',
      sender: 'ai',
      text: `👋 Hi **${userName}**! I'm your ambient workspace copilot. Ask me quick questions about your projects, ATS score, keyboard shortcuts, or site features.`,
      html: null,
      quickChips: [
        { label: '⚡ Shortcuts Guide', query: 'What are the keyboard shortcuts?' },
        { label: '📊 ATS Score', query: "What is my current ATS score and readiness?" },
        { label: '✅ Done Projects', query: 'How many projects are marked Done?' },
        { label: '🌐 Public Portfolio', query: 'How do I make my portfolio public?' },
        { label: '📄 Export Resume', query: 'How do I export my resume?' }
      ]
    }
  ]);

  // Auto-scroll chat to bottom
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isThinking, isOpen]);

  // Auto-focus input when panel opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen]);

  /**
   * Static Knowledge / Quick FAQ & Context Lookup Engine
   * Answers navigation, feature, and user-data queries instantly without network latency.
   */
  const checkInstantKnowledge = (rawQuery) => {
    const q = rawQuery.toLowerCase().trim();

    // 1. Full Screen Mode Shortcut & Feature
    if (q.includes('full screen') || q.includes('fullscreen') || (q.includes('full') && q.includes('screen'))) {
      return {
        matched: true,
        html: `
          <div class="space-y-1.5 text-xs">
            <p class="font-bold text-emerald-400">🖥️ Full Screen Mode in Scaffold:</p>
            <p class="text-muted leading-relaxed">
              Press <kbd class="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono text-[11px] border border-amber-500/30">Alt + F</kbd> anywhere to toggle native full screen mode in Scaffold!
            </p>
            <p class="text-[11px] text-muted">
              You can also open the Command Palette (<kbd class="px-1 py-0.5 rounded bg-black/30 text-amber-400 font-mono text-[10px]">Ctrl + K</kbd> or <kbd class="px-1 py-0.5 rounded bg-black/30 text-amber-400 font-mono text-[10px]">/</kbd>) and select <em>"Toggle Full Screen Mode"</em>. A floating button also appears at top-right to exit full screen anytime.
            </p>
          </div>
        `
      };
    }

    // 2. What this website does / Website kya karte hai / Overview
    if (
      q.includes('kya karte') ||
      q.includes('kya karti') ||
      q.includes('kya kaam') ||
      q.includes('ye kya hai') ||
      q.includes('website kya') ||
      q.includes('what does this website do') ||
      q.includes('what is scaffold') ||
      q.includes('about scaffold') ||
      q.includes('what is this website') ||
      q.includes('what is this app') ||
      q.includes('website purpose')
    ) {
      return {
        matched: true,
        html: `
          <div class="space-y-2 text-xs">
            <p class="font-bold text-emerald-400">🚀 Scaffold Developer Workspace:</p>
            <p class="text-muted leading-relaxed">
              Scaffold ek unified developer workspace hai jo aapke projects aur identity ko ek <strong>closed-loop system</strong> mein organize karta hai:
            </p>
            <div class="p-2.5 rounded border bg-black/20 font-mono text-[11px] space-y-1 text-amber-300" style="border-color: var(--border);">
              <div>1. <strong class="text-white">Profile</strong> (<code>/profile</code>) — Skills, bio, and target role</div>
              <div>2. <strong class="text-white">AI Assistant</strong> (<code>/assistant</code>) — Career &amp; project coaching</div>
              <div>3. <strong class="text-white">Tracker</strong> (<code>/tracker</code>) — Kanban board (To-Do / In Progress / Done)</div>
              <div>4. <strong class="text-white">Portfolio</strong> (<code>/portfolio</code>) — Auto-generated live public showcase</div>
              <div>5. <strong class="text-white">Resume</strong> (<code>/resume</code>) — Instant ATS-compliant printable PDF sheet</div>
            </div>
            <p class="text-[11px] text-muted">All data syncs with Cloud Firestore so information is entered once and reflected everywhere.</p>
          </div>
        `
      };
    }

    // 3. Off-topic generic programming / general knowledge redirect
    const isOffTopic =
      (q.includes('what is react') || q.includes('what is javascript') || q.includes('what is python') || q.includes('what is html') || q.includes('what is css')) ||
      (q.includes('closure') || q.includes('hoisting') || q.includes('event loop') || q.includes('recursion') || q.includes('debounce') || q.includes('throttle')) ||
      (q.includes('write a python') || q.includes('write code for') || q.includes('solve this') || q.includes('who is'));

    if (isOffTopic) {
      return {
        matched: true,
        html: `
          <div class="space-y-1.5 text-xs">
            <p class="font-semibold text-amber-400">📌 Scaffold Site Help</p>
            <p class="text-muted leading-relaxed">
              I can only help with things inside Scaffold — try asking about your profile, tracker, or how to use a specific feature (or visit the dedicated <a href="/assistant" class="text-amber-400 underline font-semibold">Assistant page</a> for career &amp; code coaching).
            </p>
          </div>
        `
      };
    }

    // 4. Keyboard Shortcuts
    if (q.includes('shortcut') || q.includes('hotkey') || q.includes('keybind') || (q.includes('key') && q.includes('cmd'))) {
      return {
        matched: true,
        html: `
          <p class="font-bold text-emerald-400 mb-1.5">⚡ Global Keyboard Shortcuts:</p>
          <ul class="space-y-1 text-xs text-muted font-mono">
            <li><strong class="text-amber-400">Ctrl + K</strong> or <strong>/</strong> — Command Palette</li>
            <li><strong class="text-amber-400">Alt + F</strong> — Toggle Full Screen Mode</li>
            <li><strong class="text-amber-400">Alt + N</strong> — Quick Add Card in Tracker</li>
            <li><strong class="text-amber-400">Alt + E</strong> / <strong>Ctrl + P</strong> — Print/Export Resume PDF</li>
            <li><strong class="text-amber-400">Alt + A</strong> — Focus AI Copilot Prompt</li>
            <li><strong class="text-amber-400">Alt + L</strong> — Quick Sign Out</li>
            <li><strong class="text-amber-400">T</strong> — Cycle Theme (Dark / Light / Cyber)</li>
            <li><strong class="text-amber-400">?</strong> — Open Workspace Settings Drawer</li>
            <li><strong class="text-amber-400">Alt + 1-7</strong> — Jump to Modules (Home, Dashboard, Profile, Tracker, Portfolio, Resume, Assistant)</li>
          </ul>
        `
      };
    }

    // 5. Theme Shortcut
    if (q.includes('theme') && (q.includes('shortcut') || q.includes('switch') || q.includes('toggle'))) {
      return {
        matched: true,
        html: `
          <p class="text-xs">Press <kbd class="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono text-[11px] border border-amber-500/30">T</kbd> anywhere to cycle instantly between <strong>Dark</strong>, <strong>Light</strong>, and <strong>Cyber</strong> themes. You can also click the sun/moon button in the top navbar.</p>
        `
      };
    }

    // 3. ATS Score & Profile Readiness Lookup
    if (q.includes('ats') || q.includes('readiness') || (q.includes('score') && !q.includes('project'))) {
      return {
        matched: true,
        html: `
          <div class="space-y-1.5">
            <p class="font-bold text-emerald-400 text-xs">📊 Your Profile &amp; ATS Score Snapshot:</p>
            <div class="p-2 rounded border bg-black/20 text-xs space-y-1 font-mono" style="border-color: var(--border);">
              <div>• <strong>ATS Score:</strong> <span class="text-emerald-400 font-bold">${atsMetrics.score}/100</span></div>
              <div>• <strong>Profile Readiness:</strong> ${atsMetrics.readiness}%</div>
              <div>• <strong>Indexed Projects:</strong> ${projectList.length}</div>
            </div>
            <p class="text-[11px] text-muted">View full diagnostic breakdown on your <a href="/dashboard" class="text-amber-400 underline">Dashboard</a> or compile in <a href="/resume" class="text-amber-400 underline">Resume</a>.</p>
          </div>
        `
      };
    }

    // 4. Projects Status / Done Count Lookup
    if (q.includes('done') || (q.includes('project') && (q.includes('how many') || q.includes('count') || q.includes('status')))) {
      return {
        matched: true,
        html: `
          <div class="space-y-1.5">
            <p class="font-bold text-emerald-400 text-xs">📁 Project Tracker Status:</p>
            <div class="p-2 rounded border bg-black/20 text-xs space-y-1 font-mono" style="border-color: var(--border);">
              <div>• <strong>Total Projects:</strong> ${projectList.length}</div>
              <div>• <strong>Completed (Done):</strong> <span class="text-emerald-400 font-bold">${doneProjects.length}</span></div>
              <div>• <strong>In Progress:</strong> <span class="text-amber-400 font-bold">${inProgressProjects.length}</span></div>
            </div>
            ${doneProjects.length > 0 ? `<p class="text-[11px] text-muted truncate">Latest completed: <em>${doneProjects[doneProjects.length - 1].title || 'Project'}</em></p>` : ''}
            <a href="/tracker" class="btn-secondary text-[11px] px-2 py-1 inline-block mt-1">Open Tracker Board →</a>
          </div>
        `
      };
    }

    // 5. Skills Lookup
    if (q.includes('skill') || q.includes('tech stack') || q.includes('technologies')) {
      const skillsDisplay = skillsList.length > 0 ? skillsList.join(', ') : 'No skills listed yet';
      return {
        matched: true,
        html: `
          <div class="space-y-1.5">
            <p class="font-bold text-emerald-400 text-xs">🛠️ Your Listed Technical Skills (${skillsList.length}):</p>
            <p class="text-xs p-2 rounded border bg-black/20 font-mono text-muted" style="border-color: var(--border);">
              ${skillsDisplay}
            </p>
            <p class="text-[11px] text-muted">Update core languages and dev tools in your <a href="/profile" class="text-amber-400 underline">Profile Settings</a>.</p>
          </div>
        `
      };
    }

    // 6. Public Portfolio Visibility Guide
    if (q.includes('portfolio') && (q.includes('public') || q.includes('share') || q.includes('link') || q.includes('visibility'))) {
      return {
        matched: true,
        html: `
          <div class="space-y-1.5 text-xs">
            <p class="font-bold text-emerald-400">🌐 Making Your Portfolio Public:</p>
            <ol class="list-decimal list-inside space-y-1 text-muted">
              <li>Open <strong>Workspace Settings</strong> (gear icon in Navbar or press <kbd class="px-1 py-0.5 rounded bg-black/30 text-amber-400 font-mono text-[10px]">?</kbd>).</li>
              <li>Under <strong>Portfolio Visibility</strong>, toggle the switch to <strong>Public</strong>.</li>
              <li>Click <strong>Copy Link</strong> to share your live showcase at <code class="text-amber-400 font-mono">/portfolio</code>.</li>
            </ol>
            <div class="pt-1">
              <a href="/portfolio" class="text-amber-400 underline font-mono text-[11px]">Preview Portfolio Showcase →</a>
            </div>
          </div>
        `
      };
    }

    // 7. Resume Export Guide
    if (q.includes('resume') && (q.includes('export') || q.includes('download') || q.includes('pdf') || q.includes('print'))) {
      return {
        matched: true,
        html: `
          <div class="space-y-1.5 text-xs">
            <p class="font-bold text-emerald-400">📄 Exporting ATS Resume:</p>
            <ol class="list-decimal list-inside space-y-1 text-muted">
              <li>Navigate to <a href="/resume" class="text-amber-400 underline font-mono">/resume</a> (or press <kbd class="px-1 py-0.5 rounded bg-black/30 text-amber-400 font-mono text-[10px]">Alt + 6</kbd>).</li>
              <li>Click the yellow <strong>Print / Save as PDF</strong> button at the top (or press <kbd class="px-1 py-0.5 rounded bg-black/30 text-amber-400 font-mono text-[10px]">Alt + E</kbd>).</li>
              <li>Select <em>"Save as PDF"</em> in your browser's print dialog. Clean media stylesheets ensure zero navbar or UI clutter on the exported document.</li>
            </ol>
          </div>
        `
      };
    }

    // 8. Default Landing Route
    if (q.includes('default') && (q.includes('landing') || q.includes('route') || q.includes('start page'))) {
      return {
        matched: true,
        html: `
          <div class="space-y-1 text-xs">
            <p class="font-bold text-emerald-400">⚙️ Default Landing Route:</p>
            <p class="text-muted">You can configure whether Scaffold opens on <strong>Home (/)</strong>, <strong>Dashboard (/dashboard)</strong>, or <strong>Tracker (/tracker)</strong> inside the <strong>Workspace Settings</strong> drawer (<kbd class="px-1 py-0.5 rounded bg-black/30 text-amber-400 font-mono text-[10px]">?</kbd>) under <em>Appearance &amp; UX</em>.</p>
          </div>
        `
      };
    }

    // 9. Data Backup / Export / Purge
    if (q.includes('backup') || q.includes('export json') || q.includes('import json') || q.includes('purge')) {
      return {
        matched: true,
        html: `
          <div class="space-y-1 text-xs">
            <p class="font-bold text-emerald-400">💾 Workspace Data Management:</p>
            <p class="text-muted">In the <strong>Workspace Settings</strong> drawer (<kbd class="px-1 py-0.5 rounded bg-black/30 text-amber-400 font-mono text-[10px]">?</kbd>), open <em>Data Management &amp; Backup</em> to:</p>
            <ul class="list-disc list-inside text-muted space-y-0.5 pl-1">
              <li><strong>Export JSON</strong>: Download a complete backup of your profile, projects, and settings.</li>
              <li><strong>Import JSON</strong>: Restore workspace state from a saved file.</li>
              <li><strong>Purge Cache</strong>: Reset browser cache without affecting Firebase cloud data.</li>
            </ul>
          </div>
        `
      };
    }

    // 10. Deep-work request guardrail
    const isDeepWork =
      (q.includes('audit') && (q.includes('resume') || q.includes('detail') || q.includes('bullet'))) ||
      (q.includes('project') && (q.includes('5') || q.includes('idea') || q.includes('recommend') || q.includes('suggest') || q.includes('architecture'))) ||
      (q.includes('system design') || q.includes('distributed') || q.includes('microservice')) ||
      (q.includes('write') && (q.includes('bio') || q.includes('cover letter') || q.includes('summary')));

    if (isDeepWork) {
      return {
        matched: true,
        isDeepWork: true,
        html: `
          <div class="space-y-2 text-xs">
            <p class="font-semibold text-amber-400">🎯 Deep-Work Session Recommended</p>
            <p class="text-muted leading-relaxed">
              This request involves comprehensive analysis or multi-mode generative generation. While I provide ambient quick answers here, our dedicated <strong>AI Career &amp; Code Assistant</strong> page is engineered specifically for deep-work sessions with full profile analysis and multi-mode coaching.
            </p>
            <div class="pt-1">
              <a
                href="/assistant"
                class="btn-primary text-xs px-3 py-1.5 inline-flex items-center gap-1.5"
                style="background: #10b981; color: #fff;"
              >
                <i class="fas fa-brain"></i> Open Full Assistant Page →
              </a>
            </div>
          </div>
        `
      };
    }

    return { matched: false };
  };

  /**
   * Handle sending a prompt
   */
  const handleSend = async (queryText) => {
    const text = (queryText || inputVal).trim();
    if (!text || isThinking) return;

    setInputVal('');

    // Append user message
    const userMsg = {
      id: 'usr_' + Date.now(),
      sender: 'user',
      text
    };
    setMessages((prev) => [...prev, userMsg]);

    // Check instant local knowledge first
    const instant = checkInstantKnowledge(text);
    if (instant.matched) {
      const aiMsg = {
        id: 'ai_' + Date.now(),
        sender: 'ai',
        html: instant.html,
        isDeepWork: instant.isDeepWork || false
      };
      setMessages((prev) => [...prev, aiMsg]);
      return;
    }

    // Otherwise, dispatch to shared Groq AI service
    setIsThinking(true);
    try {
      const systemPrompt = `You are the Scaffold website's dedicated help and ambient copilot widget.
CRITICAL RULES & SCOPE:
1. You must ONLY answer questions about Scaffold's own features, navigation, shortcuts, and the logged-in user's own profile/tracker data.
2. Do NOT answer generic programming, web-development, or general-knowledge questions (e.g. "what is React", "explain closures", "how to write a loop", general coding tutorials, or trivia).
3. If asked something outside Scaffold itself, you MUST politely redirect using this exact response:
   "I can only help with things inside Scaffold — try asking about your profile, tracker, or how to use a specific feature (or visit the dedicated Assistant page at /assistant for deeper career & code coaching)."
4. If asked "website kya karte hai", "ye kya hai", or "what does this website do" (in English, Hindi, or Hinglish), explain Scaffold specifically: a closed-loop developer workspace connecting Profile -> AI Suggestions -> Tracker -> Portfolio -> Resume.
5. If asked "how to make this website full screen" or about full screen, state clearly: "Press Alt + F anywhere to toggle native Full Screen mode in Scaffold (or use Ctrl + K -> Toggle Full Screen Mode)." Do NOT output generic CSS like height:100vh or overflow:hidden.
6. Keep all responses brief, friendly, and actionable (2 to 4 sentences maximum). Format text with clean HTML tags like <strong>, <em>, <code>, <kbd>, <ul><li>.

GROUND-TRUTH CONTEXT ABOUT THIS APP (SCAFFOLD):
- Core Concept: Closed-loop developer workspace where user data entered once reflects everywhere:
  Profile (skills/goals) -> AI Suggestions -> Kanban Tracker -> Completed Portfolio -> ATS Resume Sheet.
- Navigation & Shortcuts:
  * Alt + 1: Home (/) — Landing page, terminal boot animation, feature cards.
  * Alt + 2: Dashboard (/dashboard) — Profile readiness %, ATS score gauge, project status counts, AI coach insight cards.
  * Alt + 3: Profile (/profile) — Profile form for contact, target role, technical skills, experience, and bio (backed by Cloud Firestore).
  * Alt + 4: Tracker (/tracker) — Kanban board with To-Do, In Progress, and Done columns.
  * Alt + 5: Portfolio (/portfolio) — Auto-generated live developer showcase from profile and completed projects.
  * Alt + 6: Resume (/resume) — ATS-compliant resume sheet compiled from profile and projects, exportable to PDF via native print styling (Alt + E / Ctrl + P).
  * Alt + 7 (or Alt + A): Assistant (/assistant) — Dedicated deep-work AI Career & Code Assistant powered by Groq (ATS resume audit, project ideas, portfolio bio, system design).
- Global Keyboard Shortcuts:
  * Alt + F: Toggle native Full Screen Mode (with on-screen exit button).
  * Ctrl + K or /: Open Command & Search Palette.
  * Alt + N: Quick Add Card modal on Tracker.
  * Alt + E or Ctrl + P: Print / Export Resume PDF.
  * Alt + L: Quick Sign Out.
  * T: Cycle Theme instantly between Dark, Light, and Cyber.
  * ?: Open Workspace Settings Drawer.
  * Esc: Universal dismiss for open drawers, modals, and palette.
- Workspace Settings Drawer (gear icon in navbar or '?'):
  * Data Management: Export JSON workspace backup, Import JSON, Purge Local Cache.
  * Appearance & UX: Reduce Motion & Glow toggle, Compact Density toggle, Default Landing Route selector (Home, Dashboard, or Tracker).
  * Portfolio Visibility: Toggle Public vs Private showcase link, Copy public portfolio link (/portfolio).
  * Cloud Data Sync: Status indicator (Synced / Syncing... / Local Only), last sync timestamp, and "Sync Now" button (on-demand Firestore fetch).
  * System Information: Version 1.2.0-react, React 18, Vite, Cloud Firestore, local cache size.

LOGGED-IN USER CONTEXT:
- Developer Name: ${userName}
- Target Role: ${userRole}
- Technical Skills Listed: ${skillsList.join(', ') || 'No skills listed yet'}
- Total Projects: ${projectList.length} (${doneProjects.length} Done, ${inProgressProjects.length} In Progress, ${projectList.length - doneProjects.length - inProgressProjects.length} To-Do)
- Current Estimated ATS Score: ${atsMetrics.score}/100 (Profile Readiness: ${atsMetrics.readiness}%)`;

      const rawAiResponse = await callGroqChat({
        messages: [{ role: 'user', content: text }],
        systemPrompt,
        temperature: 0.3
      });

      const formattedHtml = formatMarkdownToHtml(rawAiResponse);
      const aiMsg = {
        id: 'ai_' + Date.now(),
        sender: 'ai',
        html: formattedHtml
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      console.warn('AiBubble Groq request notice:', err.message);
      let errorHtml;
      if (err.message === 'MISSING_API_KEY') {
        errorHtml = `
          <div class="text-xs space-y-1">
            <p class="text-amber-400 font-semibold">⚠️ Groq API Key Not Set</p>
            <p class="text-muted leading-relaxed">
              Ambient instant lookups (shortcuts, ATS score, tracker counts, site navigation) are fully operational. To enable open-ended generative responses, set <code>VITE_GROQ_API_KEY</code> in <code>.env</code> or visit the full <a href="/assistant" class="underline text-amber-400">Assistant page</a>.
            </p>
          </div>
        `;
      } else {
        errorHtml = `
          <div class="text-xs space-y-1">
            <p class="text-red-400 font-semibold">⚠️ Unable to reach Groq API</p>
            <p class="text-muted leading-relaxed">${err.message || 'Network error'}. You can still ask me about your projects, ATS score, and shortcuts!</p>
          </div>
        `;
      }
      const aiMsg = {
        id: 'ai_' + Date.now(),
        sender: 'ai',
        html: errorHtml
      };
      setMessages((prev) => [...prev, aiMsg]);
    } finally {
      setIsThinking(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleSend();
  };

  return (
    <>
      {/* Expanded Floating Chat Panel */}
      {isOpen && (
        <div
          id="aiBubblePanel"
          role="dialog"
          aria-label="Ambient AI Copilot"
          className="fixed bottom-24 right-4 sm:right-6 z-40 w-[360px] sm:w-[380px] max-w-[calc(100vw-2rem)] h-[520px] max-h-[75vh] flex flex-col rounded-2xl border shadow-2xl overflow-hidden transition-all duration-200"
          style={{
            background: 'var(--card)',
            borderColor: 'var(--border-strong)',
            boxShadow: '0 16px 48px rgba(0, 0, 0, 0.45)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)'
          }}
        >
          {/* Panel Header */}
          <div
            className="px-4 py-3 border-b flex items-center justify-between flex-shrink-0"
            style={{
              background: 'rgba(var(--accent-rgb), 0.04)',
              borderColor: 'var(--border)'
            }}
          >
            <div className="flex items-center gap-2.5">
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center border"
                style={{
                  background: 'rgba(16, 185, 129, 0.15)',
                  borderColor: 'rgba(16, 185, 129, 0.3)',
                  color: '#10b981'
                }}
              >
                <i className="fas fa-brain text-xs"></i>
              </div>
              <div>
                <div className="font-mono text-xs font-bold flex items-center gap-1.5" style={{ color: 'var(--fg)' }}>
                  <span>AI Copilot</span>
                  <span
                    className="font-mono text-[9px] px-1.5 py-0.2 rounded font-semibold uppercase tracking-wider"
                    style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10b981' }}
                  >
                    Ambient
                  </span>
                </div>
                <div className="text-[10px] text-muted font-mono">Quick Help &amp; Metrics</div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  navigate('/assistant');
                }}
                className="text-[11px] font-mono px-2 py-1 rounded border hover:bg-black/20 transition-colors flex items-center gap-1 text-muted hover:text-white"
                style={{ borderColor: 'var(--border)' }}
                title="Navigate to dedicated deep-work Assistant page"
              >
                <span>Full Page</span>
                <i className="fas fa-external-link-alt text-[9px]"></i>
              </button>
              <button
                type="button"
                id="closeAiBubbleBtn"
                onClick={() => setIsOpen(false)}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-muted hover:text-white hover:bg-black/20 transition-colors"
                title="Close Copilot"
                aria-label="Close Copilot"
              >
                <i className="fas fa-times text-xs"></i>
              </button>
            </div>
          </div>

          {/* Quick Context Sub-bar */}
          <div
            className="px-4 py-1.5 border-b font-mono text-[10px] text-muted flex items-center justify-between"
            style={{ background: 'var(--bg-elev)', borderColor: 'var(--border)' }}
          >
            <span className="flex items-center gap-1.5 truncate max-w-[200px]">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              {userName} • {projectList.length} Project{projectList.length === 1 ? '' : 's'}
            </span>
            <span className="text-amber-400">ATS: {atsMetrics.score}%</span>
          </div>

          {/* Message List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 font-sans text-xs">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                {msg.sender === 'user' ? (
                  <div
                    className="max-w-[85%] px-3.5 py-2 rounded-2xl font-mono text-xs"
                    style={{
                      background: 'var(--accent)',
                      color: '#000',
                      borderBottomRightRadius: '4px'
                    }}
                  >
                    {msg.text}
                  </div>
                ) : (
                  <div
                    className="max-w-[92%] px-3.5 py-2.5 rounded-2xl border text-xs leading-relaxed"
                    style={{
                      background: 'var(--bg-elev)',
                      borderColor: 'var(--border)',
                      color: 'var(--fg)',
                      borderBottomLeftRadius: '4px'
                    }}
                  >
                    {msg.html ? (
                      <div
                        className="prose-content space-y-1.5"
                        dangerouslySet brain-html="true"
                        dangerouslySetInnerHTML={{ __html: msg.html }}
                      />
                    ) : (
                      <p>{msg.text}</p>
                    )}

                    {/* Interactive Quick-Prompt Chips on Welcome */}
                    {msg.quickChips && (
                      <div className="flex flex-wrap gap-1.5 mt-2.5 pt-2 border-t" style={{ borderColor: 'var(--border)' }}>
                        {msg.quickChips.map((chip, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => handleSend(chip.query)}
                            className="font-mono text-[10px] px-2 py-1 rounded-md border transition-all hover:scale-102 hover:border-amber-400"
                            style={{
                              background: 'rgba(var(--accent-rgb), 0.05)',
                              borderColor: 'var(--border)',
                              color: 'var(--fg)'
                            }}
                          >
                            {chip.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}

            {isThinking && (
              <div className="flex items-center gap-2 text-muted text-xs font-mono py-1">
                <i className="fas fa-circle-notch animate-spin text-emerald-400"></i>
                <span>Consulting Groq AI...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input Bar */}
          <form
            onSubmit={handleSubmit}
            className="p-3 border-t flex items-center gap-2 flex-shrink-0"
            style={{ background: 'var(--card)', borderColor: 'var(--border)' }}
          >
            <input
              ref={inputRef}
              type="text"
              id="aiBubbleInput"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder="Ask quick help or lookup..."
              className="flex-1 bg-black/20 text-xs px-3 py-2 rounded-xl border focus:outline-none transition-colors"
              style={{
                borderColor: 'var(--border)',
                color: 'var(--fg)'
              }}
              disabled={isThinking}
            />
            <button
              type="submit"
              id="aiBubbleSubmit"
              disabled={isThinking || !inputVal.trim()}
              className="btn-primary w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-opacity disabled:opacity-40"
              style={{ background: 'var(--accent)', color: '#000' }}
              title="Send question"
            >
              <i className="fas fa-paper-plane text-xs"></i>
            </button>
          </form>
        </div>
      )}

      {/* Floating Circular Trigger Button */}
      <button
        type="button"
        id="aiBubbleBtn"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label={isOpen ? 'Close AI Copilot' : 'Open Ambient AI Copilot'}
        className={`fixed bottom-6 right-6 z-40 w-13 h-13 sm:w-14 sm:h-14 rounded-full border shadow-2xl flex items-center justify-center transition-all duration-200 hover:scale-108 active:scale-95 group ${
          isOpen ? 'rotate-90' : ''
        }`}
        style={{
          background: 'var(--card)',
          borderColor: isOpen ? 'var(--accent)' : 'var(--border-strong)',
          color: isOpen ? 'var(--accent)' : 'var(--fg)',
          boxShadow: isOpen
            ? '0 0 24px rgba(var(--accent-rgb), 0.35)'
            : '0 8px 24px rgba(0, 0, 0, 0.45)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)'
        }}
        title="Quick AI Copilot (Ambient Help)"
      >
        {isOpen ? (
          <i className="fas fa-times text-lg"></i>
        ) : (
          <div className="relative flex items-center justify-center">
            <i className="fas fa-brain text-lg group-hover:text-amber-400 transition-colors"></i>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 absolute -top-2 -right-2 border-2 border-black"></span>
          </div>
        )}
      </button>
    </>
  );
}
