import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import { useProfile } from '../hooks/useProfile.js';
import { useTracker } from '../hooks/useTracker.js';
import './assistant.css';

function escapeHtml(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function formatMarkdownToHtml(md) {
  if (!md) return '';
  return md
    .replace(/```([\s\S]*?)```/g, (match, code) => (
      `<pre class="p-3 rounded-lg border my-2 font-mono text-[11px] overflow-x-auto" style="background: var(--bg); border-color: var(--border);"><code>${escapeHtml(code.trim())}</code></pre>`
    ))
    .replace(/`([^`]+)`/g, '<code class="px-1 py-0.5 rounded font-mono text-[11px]" style="background: rgba(var(--accent-rgb), 0.1); color: var(--accent);">$1</code>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/\n\n/g, '<br/><br/>')
    .replace(/\n/g, '<br/>');
}

function generateFallbackResponse(query, mode) {
  const q = query.toLowerCase();

  if (q.includes('ats') || q.includes('resume') || q.includes('audit')) {
    return `
      <p class="font-bold text-emerald-500 mb-1">📋 ATS Resume Audit Insights:</p>
      <ul class="list-disc list-inside space-y-1 text-xs text-muted">
        <li>Ensure your <strong>Target Role</strong> and <strong>Location</strong> are clearly stated at the top.</li>
        <li>Add quantifiable metrics in work descriptions (e.g. <em>"Improved page speed by 40%"</em>).</li>
        <li>Synchronize technologies in your Kanban project cards with your Technical Competencies list.</li>
      </ul>
      <div class="pt-2">
        <a href="/resume" class="btn-primary text-[11px] px-3 py-1.5 inline-block" style="background: #10b981; color: #fff;">Inspect ATS Resume Sheet →</a>
      </div>
    `;
  }

  if (q.includes('idea') || q.includes('project') || q.includes('suggest')) {
    return `
      <p class="font-bold text-emerald-500 mb-1">💡 Custom Project Recommendations:</p>
      <div class="space-y-2 pt-1">
        <div class="p-2.5 rounded-lg border" style="border-color: var(--border); background: var(--bg);">
          <strong style="color: var(--fg);">1. Real-time Multi-tenant Dashboard OS</strong>
          <p class="text-muted text-[11px] mt-0.5">Build a high-throughput event dashboard using WebSockets and CSS variable themes.</p>
        </div>
        <div class="p-2.5 rounded-lg border" style="border-color: var(--border); background: var(--bg);">
          <strong style="color: var(--fg);">2. AI Knowledge Base Heuristic Parser</strong>
          <p class="text-muted text-[11px] mt-0.5">Parse PDF resumes and output JSON metadata with keyword scoring.</p>
        </div>
      </div>
      <div class="pt-2">
        <a href="/tracker" class="btn-secondary text-[11px] px-3 py-1.5 inline-block">Add to Kanban Tracker →</a>
      </div>
    `;
  }

  return `
    <p>Based on your input for mode (<strong class="text-emerald-500 font-mono">${mode.toUpperCase()}</strong>):</p>
    <p class="text-xs text-muted leading-relaxed mt-1">
      To enable live generative responses from Groq AI, ensure your API key is set in <code>.env</code> as <code>VITE_GROQ_API_KEY=gsk-...</code>.
    </p>
  `;
}

export default function Assistant() {
  const { currentUser } = useAuth();
  const { profile, loadProfile } = useProfile();
  const { projects, loadProjects } = useTracker();

  const [mode, setMode] = useState('career');
  const [inputVal, setInputVal] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [isSyncing, setIsSyncing] = useState(true);
  const [contextStatus, setContextStatus] = useState({
    type: 'syncing',
    text: 'Syncing...'
  });

  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      sender: 'ai',
      isWelcome: true
    }
  ]);

  const messagesEndRef = useRef(null);
  const userId = currentUser?.uid;

  useEffect(() => {
    let isMounted = true;

    if (!userId) {
      setIsSyncing(false);
      setContextStatus({ type: 'ready', text: '✓ Ready' });
      return;
    }

    setIsSyncing(true);
    setContextStatus({ type: 'syncing', text: 'Syncing...' });

    // 3s soft loading notice
    const slowTimer = setTimeout(() => {
      if (isMounted && isSyncing) {
        setContextStatus({ type: 'loading', text: 'Still loading...' });
      }
    }, 3000);

    // 20s soft timeout notice
    const softTimeoutTimer = setTimeout(() => {
      if (isMounted && isSyncing) {
        setContextStatus({ type: 'connecting', text: 'Connecting...' });
      }
    }, 20000);

    Promise.all([
      loadProfile(userId),
      loadProjects(userId)
    ])
      .then(() => {
        if (isMounted) {
          clearTimeout(slowTimer);
          clearTimeout(softTimeoutTimer);
          setIsSyncing(false);
          setContextStatus({ type: 'ready', text: '✓ Ready' });
        }
      })
      .catch((err) => {
        if (isMounted) {
          clearTimeout(slowTimer);
          clearTimeout(softTimeoutTimer);
          setIsSyncing(false);
          console.error('Assistant context fetch error:', err);
          setContextStatus({ type: 'error', text: `⚠️ ${err.message || err}` });
        }
      });

    return () => {
      isMounted = false;
      clearTimeout(slowTimer);
      clearTimeout(softTimeoutTimer);
    };
  }, [userId, loadProfile, loadProjects]);

  // Auto-scroll chat on new messages or thinking state
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isThinking]);

  // Derived user details
  const userName = profile?.fullName || currentUser?.displayName || 'Developer';
  const userRole = profile?.targetRole || 'Software Engineer';
  const coreLangs = profile?.coreLanguages || 'Web Technologies';
  const projectList = Array.isArray(projects) ? projects : [];

  // Groq Completion Call
  const fetchGroqCompletion = async (promptText, currentMode) => {
    const envKey = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_GROQ_API_KEY)
      ? import.meta.env.VITE_GROQ_API_KEY
      : '';
    const storedKey = localStorage.getItem('scaffold_groq_api_key') || '';
    const apiKey = envKey || storedKey || '';

    if (!apiKey) {
      return generateFallbackResponse(promptText, currentMode);
    }

    const systemPrompt = `You are Scaffold AI, an expert developer, system architect, and career coach powered by Groq.
User Context:
- Full Name: ${userName}
- Target Role: ${userRole}
- Core Languages/Stack: ${coreLangs}
- Bio: ${profile?.bio || 'Developer'}
- Kanban Projects: ${JSON.stringify(projectList.map((p) => ({ title: p.title || p.name, status: p.status, tech: p.techStack || p.tech })))}
Assistant Mode: ${currentMode}

Instructions:
Answer the user's prompt directly, concisely, and cleanly. Format text using HTML formatting tags like <strong>, <em>, <pre><code>, <ul><li> where appropriate. Keep answers practical, developer-focused, and well-structured.`;

    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'openai/gpt-oss-20b',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: promptText }
        ],
        temperature: 0.7
      })
    });

    if (!res.ok) {
      const errJson = await res.json().catch(() => ({}));
      throw new Error(errJson.error?.message || `Groq API error: HTTP ${res.status}`);
    }

    const data = await res.json();
    const content = data.choices && data.choices[0] && data.choices[0].message
      ? data.choices[0].message.content
      : '';

    return formatMarkdownToHtml(content);
  };

  const handleSend = async (textToSend) => {
    const text = (textToSend || inputVal).trim();
    if (!text || isThinking) return;

    setInputVal('');

    // Append user message
    const userMsg = {
      id: 'usr_' + Date.now(),
      sender: 'user',
      text
    };
    setMessages((prev) => [...prev, userMsg]);
    setIsThinking(true);

    try {
      const htmlReply = await fetchGroqCompletion(text, mode);
      const aiMsg = {
        id: 'ai_' + Date.now(),
        sender: 'ai',
        html: htmlReply,
        isError: false
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      const errorMsg = {
        id: 'ai_err_' + Date.now(),
        sender: 'ai',
        text: err.message || 'Unable to connect to Groq API.',
        isError: true
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsThinking(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleSend();
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: 'cleared_' + Date.now(),
        sender: 'ai',
        isClearedNotice: true
      }
    ]);
  };

  return (
    <div className="assistant-wrapper max-w-6xl mx-auto space-y-6">
      {/* Header Banner */}
      <div
        className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-6 rounded-2xl border"
        style={{ background: 'var(--card)', borderColor: 'var(--border-strong)' }}
      >
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span
              className="tag"
              style={{
                background: 'rgba(16, 185, 129, 0.15)',
                color: '#059669',
                borderColor: 'rgba(16, 185, 129, 0.3)'
              }}
            >
              <i className="fas fa-brain mr-1"></i> Groq AI Engine
            </span>
          </div>
          <h1 className="font-display font-black text-3xl" style={{ color: 'var(--fg)' }}>
            AI Career &amp; Code Assistant
          </h1>
          <p id="assistantSubHeader" className="text-xs text-muted font-mono">
            Powered by Groq API • Analyzing <strong id="astHeaderUserName" style={{ color: 'var(--fg)' }}>{userName}</strong> (
            <span id="astHeaderUserRole">{userRole}</span>) •{' '}
            <span id="astHeaderProjectCount">{projectList.length}</span> project(s) indexed.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            id="clearChatBtn"
            type="button"
            onClick={handleClearChat}
            className="btn-secondary text-xs px-3 py-2"
          >
            <i className="fas fa-trash-alt mr-1"></i> Clear Chat
          </button>
          <Link
            to="/dashboard"
            className="btn-primary text-xs px-4 py-2"
            style={{ background: '#10b981', color: '#fff' }}
          >
            <i className="fas fa-chart-line mr-1"></i> Dashboard
          </Link>
        </div>
      </div>

      {/* Chat Container Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Sidebar: Modes & Quick Prompts (Span 1) */}
        <div className="space-y-4">
          {/* Assistant Mode Selector */}
          <div
            className="p-4 rounded-xl border space-y-3"
            style={{ background: 'var(--card)', borderColor: 'var(--border-strong)' }}
          >
            <div className="font-mono text-xs font-bold uppercase tracking-wider text-emerald-500">
              ASSISTANT MODE
            </div>
            <select
              id="assistantModeSelect"
              value={mode}
              onChange={(e) => setMode(e.target.value)}
              className="w-full bg-transparent p-2.5 rounded-lg border text-xs font-mono"
              style={{ borderColor: 'var(--border-strong)', color: 'var(--fg)' }}
            >
              <option value="career">🤖 ATS Career Coach</option>
              <option value="architect">🏗️ System Architect</option>
              <option value="code">💻 Code Auditor</option>
              <option value="ideas">💡 Project Generator</option>
            </select>
          </div>

          {/* Quick Prompt Chips */}
          <div
            className="p-4 rounded-xl border space-y-3"
            style={{ background: 'var(--card)', borderColor: 'var(--border-strong)' }}
          >
            <div className="font-mono text-xs font-bold uppercase tracking-wider text-muted">
              QUICK PROMPTS
            </div>
            <div className="space-y-2">
              <button
                type="button"
                className="prompt-chip-btn w-full text-left p-2.5 rounded-lg border text-xs text-muted hover:text-fg transition-all"
                onClick={() =>
                  handleSend('Audit my ATS resume readiness based on my filled profile fields and suggest missing keywords.')
                }
              >
                <i className="fas fa-file-invoice text-emerald-500 mr-1.5"></i> Audit ATS Resume
              </button>
              <button
                type="button"
                id="chipProjectIdeas"
                className="prompt-chip-btn w-full text-left p-2.5 rounded-lg border text-xs text-muted hover:text-fg transition-all"
                onClick={() =>
                  handleSend(`Suggest 3 advanced full-stack project ideas matching my core stack (${coreLangs}).`)
                }
              >
                <i className="fas fa-lightbulb text-amber-500 mr-1.5"></i> Generate Project Ideas
              </button>
              <button
                type="button"
                className="prompt-chip-btn w-full text-left p-2.5 rounded-lg border text-xs text-muted hover:text-fg transition-all"
                onClick={() =>
                  handleSend('Draft a compelling executive bio for my web portfolio page.')
                }
              >
                <i className="fas fa-user-edit text-cyan-500 mr-1.5"></i> Write Portfolio Bio
              </button>
              <button
                type="button"
                id="chipSystemDesign"
                className="prompt-chip-btn w-full text-left p-2.5 rounded-lg border text-xs text-muted hover:text-fg transition-all"
                onClick={() =>
                  handleSend(`Give me system design interview prep tips tailored for a ${userRole}.`)
                }
              >
                <i className="fas fa-network-wired text-purple-500 mr-1.5"></i> System Design Prep
              </button>
            </div>
          </div>

          {/* User Context Summary Card */}
          <div
            className="p-4 rounded-xl border space-y-2 font-mono text-xs text-muted"
            style={{ background: 'rgba(var(--accent-rgb), 0.02)', borderColor: 'var(--border)' }}
          >
            <div className="font-bold text-fg flex items-center justify-between">
              <span>Active Context:</span>
              <span id="astContextStatus" className="text-[10px] text-emerald-500 font-normal">
                {contextStatus.type === 'syncing' && (
                  <>
                    <i className="fas fa-circle-notch fa-spin mr-1"></i> {contextStatus.text}
                  </>
                )}
                {(contextStatus.type === 'loading' || contextStatus.type === 'connecting') && (
                  <span className="text-amber-400">
                    <i className="fas fa-circle-notch fa-spin mr-1"></i> {contextStatus.text}
                  </span>
                )}
                {contextStatus.type === 'ready' && (
                  <span className="text-emerald-400">{contextStatus.text}</span>
                )}
                {contextStatus.type === 'error' && (
                  <span className="text-amber-400">{contextStatus.text}</span>
                )}
              </span>
            </div>
            <div>
              • Name: <span id="astCtxName" className="text-emerald-500">{userName}</span>
            </div>
            <div>
              • Target: <span id="astCtxRole" className="text-emerald-500">{userRole}</span>
            </div>
            <div>
              • Projects: <span id="astCtxProjects" className="text-emerald-500">{projectList.length}</span>
            </div>
          </div>
        </div>

        {/* Main Chat Window (Span 3) */}
        <div
          className="lg:col-span-3 flex flex-col h-[600px] rounded-2xl border overflow-hidden"
          style={{ background: 'var(--card)', borderColor: 'var(--border-strong)' }}
        >
          {/* Chat Messages Scroll Area */}
          <div
            id="chatMessages"
            className="flex-1 p-5 overflow-y-auto space-y-4 font-sans text-xs md:text-sm"
          >
            {messages.map((m) => {
              if (m.isWelcome) {
                return (
                  <div key={m.id} className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center shrink-0">
                      🤖
                    </div>
                    <div
                      className="p-4 rounded-2xl rounded-tl-none border max-w-2xl space-y-2"
                      style={{
                        background: 'rgba(16, 185, 129, 0.05)',
                        borderColor: 'rgba(16, 185, 129, 0.2)'
                      }}
                    >
                      <div className="font-mono text-[11px] font-bold text-emerald-500">
                        Scaffold Groq AI Assistant
                      </div>
                      <p id="astWelcomeMessage" className="leading-relaxed" style={{ color: 'var(--fg)' }}>
                        Hello <strong>{userName}</strong>! I'm your Groq-powered AI Assistant.{' '}
                        {isSyncing ? (
                          'I am syncing your Profile OS data...'
                        ) : (
                          <>
                            I have indexed your Profile OS (<span className="font-mono">{userRole}</span>) and your{' '}
                            {projectList.length} Kanban project(s).
                          </>
                        )}
                      </p>
                      <p className="text-xs text-muted">
                        Ask me any developer question, request ATS resume optimizations, project ideas, or architecture advice!
                      </p>
                    </div>
                  </div>
                );
              }

              if (m.isClearedNotice) {
                return (
                  <div key={m.id} className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center shrink-0">
                      🤖
                    </div>
                    <div
                      className="p-4 rounded-2xl rounded-tl-none border max-w-xl space-y-2"
                      style={{
                        background: 'rgba(16, 185, 129, 0.05)',
                        borderColor: 'rgba(16, 185, 129, 0.2)'
                      }}
                    >
                      <div className="font-mono text-[11px] font-bold text-emerald-500">
                        Scaffold Groq AI Assistant
                      </div>
                      <p className="text-xs text-muted">Chat cleared. Ready for your next query!</p>
                    </div>
                  </div>
                );
              }

              if (m.sender === 'user') {
                return (
                  <div key={m.id} className="flex items-start justify-end gap-3">
                    <div
                      className="p-4 rounded-2xl rounded-tr-none border max-w-xl text-xs md:text-sm"
                      style={{
                        background: 'rgba(var(--accent-rgb), 0.1)',
                        borderColor: 'var(--accent)',
                        color: 'var(--fg)'
                      }}
                    >
                      {m.text}
                    </div>
                    <div className="w-8 h-8 rounded-lg bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center shrink-0">
                      👤
                    </div>
                  </div>
                );
              }

              return (
                <div key={m.id} className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center shrink-0">
                    🤖
                  </div>
                  <div
                    className="p-4 rounded-2xl rounded-tl-none border max-w-2xl space-y-2 text-xs md:text-sm leading-relaxed"
                    style={{
                      background: 'rgba(16, 185, 129, 0.05)',
                      borderColor: 'rgba(16, 185, 129, 0.2)',
                      color: 'var(--fg)'
                    }}
                  >
                    <div className="font-mono text-[11px] font-bold text-emerald-500">
                      Scaffold Groq AI Assistant
                    </div>
                    {m.isError ? (
                      <div className="p-3 rounded-lg border border-red-500/30 bg-red-500/10 text-red-400 space-y-1">
                        <div className="font-bold">⚠️ Groq AI Connection Notice</div>
                        <p className="text-xs text-muted">{m.text}</p>
                      </div>
                    ) : (
                      <div dangerouslySetInnerHTML={{ __html: m.html }} />
                    )}
                  </div>
                </div>
              );
            })}

            {/* Loading / Thinking indicator */}
            {isThinking && (
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center shrink-0">
                  🤖
                </div>
                <div
                  className="p-4 rounded-2xl rounded-tl-none border max-w-xl text-xs text-muted flex items-center gap-2"
                  style={{
                    background: 'rgba(16, 185, 129, 0.05)',
                    borderColor: 'rgba(16, 185, 129, 0.2)'
                  }}
                >
                  <i className="fas fa-circle-notch fa-spin text-emerald-500"></i> Groq AI is thinking...
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input Area */}
          <div className="p-4 border-t" style={{ borderColor: 'var(--border)', background: 'var(--bg)' }}>
            <form id="chatForm" onSubmit={handleSubmit} className="flex items-center gap-3">
              <input
                type="text"
                id="chatInput"
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                placeholder="Ask Groq AI Assistant anything about your code, career, or projects..."
                className="flex-1 input-field"
                style={{ borderRadius: '8px' }}
                autoComplete="off"
                disabled={isThinking}
              />
              <button
                type="submit"
                id="sendBtn"
                disabled={isThinking || !inputVal.trim()}
                className="btn-primary text-xs px-5 py-3 shrink-0"
                style={{ background: '#10b981', color: '#fff', opacity: isThinking || !inputVal.trim() ? 0.7 : 1 }}
              >
                Send <i className="fas fa-paper-plane ml-1"></i>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
