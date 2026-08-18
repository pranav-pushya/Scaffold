// === AI ASSISTANT PAGE ===
// Interactive Developer & Career Assistant powered by Groq API & Profile OS context with non-blocking initial rendering

import { getCurrentAuthUser } from '../../../firebase/authService.js';
import { getProfile, getProjects, fetchWithTimeout } from '../../../firebase/firestoreService.js';

export function renderAssistantPage() {
    const user = getCurrentAuthUser() || { displayName: 'Developer', uid: 'demo' };
    const userName = user.displayName || 'Developer';

    return `
    <div class="assistant-wrapper max-w-6xl mx-auto space-y-6">
        
        <!-- Header Banner -->
        <div class="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-6 rounded-2xl border"
            style="background: var(--card); border-color: var(--border-strong);">
            <div class="space-y-1">
                <div class="flex items-center gap-2">
                    <span class="tag" style="background: rgba(16, 185, 129, 0.15); color: #059669; border-color: rgba(16, 185, 129, 0.3);">
                        <i class="fas fa-brain mr-1"></i> Groq AI Engine
                    </span>
                </div>
                <h1 class="font-display font-black text-3xl" style="color: var(--fg);">AI Career & Code Assistant</h1>
                <p id="assistantSubHeader" class="text-xs text-muted font-mono">
                    Powered by Groq API • Analyzing <strong id="astHeaderUserName" style="color: var(--fg);">${userName}</strong> (<span id="astHeaderUserRole">Software Engineer</span>) • <span id="astHeaderProjectCount">0</span> project(s) indexed.
                </p>
            </div>

            <div class="flex items-center gap-3">
                <button id="clearChatBtn" class="btn-secondary text-xs px-3 py-2">
                    <i class="fas fa-trash-alt mr-1"></i> Clear Chat
                </button>
                <a href="#dashboard" class="btn-primary text-xs px-4 py-2" style="background: #10b981; color: #fff;">
                    <i class="fas fa-chart-line mr-1"></i> Dashboard
                </a>
            </div>
        </div>

        <!-- Chat Container Layout -->
        <div class="grid grid-cols-1 lg:grid-cols-4 gap-6">
            
            <!-- Left Sidebar: Modes & Quick Prompts (Span 1) -->
            <div class="space-y-4">
                
                <!-- Assistant Mode Selector -->
                <div class="p-4 rounded-xl border space-y-3" style="background: var(--card); border-color: var(--border-strong);">
                    <div class="font-mono text-xs font-bold uppercase tracking-wider text-emerald-500">
                        ASSISTANT MODE
                    </div>
                    <select id="assistantModeSelect" class="w-full bg-transparent p-2.5 rounded-lg border text-xs font-mono" style="border-color: var(--border-strong); color: var(--fg);">
                        <option value="career">🤖 ATS Career Coach</option>
                        <option value="architect">🏗️ System Architect</option>
                        <option value="code">💻 Code Auditor</option>
                        <option value="ideas">💡 Project Generator</option>
                    </select>
                </div>

                <!-- Quick Prompt Chips -->
                <div class="p-4 rounded-xl border space-y-3" style="background: var(--card); border-color: var(--border-strong);">
                    <div class="font-mono text-xs font-bold uppercase tracking-wider text-muted">
                        QUICK PROMPTS
                    </div>
                    <div class="space-y-2">
                        <button class="prompt-chip-btn w-full text-left p-2.5 rounded-lg border text-xs text-muted hover:text-fg transition-all"
                            data-prompt="Audit my ATS resume readiness based on my filled profile fields and suggest missing keywords.">
                            <i class="fas fa-file-invoice text-emerald-500 mr-1.5"></i> Audit ATS Resume
                        </button>
                        <button id="chipProjectIdeas" class="prompt-chip-btn w-full text-left p-2.5 rounded-lg border text-xs text-muted hover:text-fg transition-all"
                            data-prompt="Suggest 3 advanced full-stack project ideas matching my core stack.">
                            <i class="fas fa-lightbulb text-amber-500 mr-1.5"></i> Generate Project Ideas
                        </button>
                        <button class="prompt-chip-btn w-full text-left p-2.5 rounded-lg border text-xs text-muted hover:text-fg transition-all"
                            data-prompt="Draft a compelling executive bio for my web portfolio page.">
                            <i class="fas fa-user-edit text-cyan-500 mr-1.5"></i> Write Portfolio Bio
                        </button>
                        <button id="chipSystemDesign" class="prompt-chip-btn w-full text-left p-2.5 rounded-lg border text-xs text-muted hover:text-fg transition-all"
                            data-prompt="Give me system design interview prep tips tailored for a Software Engineer.">
                            <i class="fas fa-network-wired text-purple-500 mr-1.5"></i> System Design Prep
                        </button>
                    </div>
                </div>

                <!-- User Context Summary Card -->
                <div class="p-4 rounded-xl border space-y-2 font-mono text-xs text-muted" style="background: rgba(var(--accent-rgb), 0.02); border-color: var(--border);">
                    <div class="font-bold text-fg flex items-center justify-between">
                        <span>Active Context:</span>
                        <span id="astContextStatus" class="text-[10px] text-emerald-500 font-normal">
                            <i class="fas fa-circle-notch fa-spin"></i> Syncing...
                        </span>
                    </div>
                    <div>• Name: <span id="astCtxName" class="text-emerald-500">${userName}</span></div>
                    <div>• Target: <span id="astCtxRole" class="text-emerald-500">Software Engineer</span></div>
                    <div>• Projects: <span id="astCtxProjects" class="text-emerald-500">0</span></div>
                </div>

            </div>

            <!-- Main Chat Window (Span 3) -->
            <div class="lg:col-span-3 flex flex-col h-[600px] rounded-2xl border overflow-hidden"
                style="background: var(--card); border-color: var(--border-strong);">
                
                <!-- Chat Messages Scroll Area -->
                <div id="chatMessages" class="flex-1 p-5 overflow-y-auto space-y-4 font-sans text-xs md:text-sm">
                    
                    <!-- Welcome AI Message -->
                    <div class="flex items-start gap-3">
                        <div class="w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center shrink-0">
                            🤖
                        </div>
                        <div class="p-4 rounded-2xl rounded-tl-none border max-w-2xl space-y-2" style="background: rgba(16, 185, 129, 0.05); border-color: rgba(16, 185, 129, 0.2);">
                            <div class="font-mono text-[11px] font-bold text-emerald-500">Scaffold Groq AI Assistant</div>
                            <p id="astWelcomeMessage" class="leading-relaxed" style="color: var(--fg);">
                                Hello <strong>${userName}</strong>! I'm your Groq-powered AI Assistant. I am syncing your Profile OS data...
                            </p>
                            <p class="text-xs text-muted">
                                Ask me any developer question, request ATS resume optimizations, project ideas, or architecture advice!
                            </p>
                        </div>
                    </div>

                </div>

                <!-- Chat Input Area -->
                <div class="p-4 border-t" style="border-color: var(--border); background: var(--bg);">
                    <form id="chatForm" class="flex items-center gap-3">
                        <input type="text" id="chatInput" placeholder="Ask Groq AI Assistant anything about your code, career, or projects..."
                            class="flex-1 input-field" style="border-radius: 8px;" autocomplete="off" />
                        <button type="submit" id="sendBtn" class="btn-primary text-xs px-5 py-3 shrink-0" style="background: #10b981; color: #fff;">
                            Send <i class="fas fa-paper-plane ml-1"></i>
                        </button>
                    </form>
                </div>

            </div>

        </div>

    </div>
    `;
}

export function bindAssistantEvents() {
    const chatForm = document.getElementById('chatForm');
    const chatInput = document.getElementById('chatInput');
    const chatMessages = document.getElementById('chatMessages');
    const clearChatBtn = document.getElementById('clearChatBtn');
    const promptChips = document.querySelectorAll('.prompt-chip-btn');
    const modeSelect = document.getElementById('assistantModeSelect');

    const user = getCurrentAuthUser() || { displayName: 'Developer', uid: 'demo' };
    let liveProfile = {};
    let liveProjects = [];

    // Intermediate 3s soft loading notice
    const slowTimer = setTimeout(() => {
        const statusEl = document.getElementById('astContextStatus');
        if (statusEl) statusEl.innerHTML = `<span class="text-amber-400 font-normal"><i class="fas fa-circle-notch fa-spin"></i> Still loading...</span>`;
    }, 3000);

    // 20s soft timeout notice
    const softTimeoutTimer = setTimeout(() => {
        const statusEl = document.getElementById('astContextStatus');
        if (statusEl) statusEl.innerHTML = `<span class="text-amber-400 font-normal"><i class="fas fa-circle-notch fa-spin"></i> Connecting...</span>`;
    }, 20000);

    // Asynchronously fetch Profile & Projects with 20s Promise.race() timeout
    Promise.all([
        fetchWithTimeout(getProfile(user.uid), 20000),
        fetchWithTimeout(getProjects(user.uid), 20000)
    ]).then(([profile, projects]) => {
        clearTimeout(slowTimer);
        clearTimeout(softTimeoutTimer);
        liveProfile = profile || {};
        liveProjects = projects || [];

        const userName = liveProfile.fullName || user.displayName || 'Developer';
        const userRole = liveProfile.targetRole || 'Software Engineer';
        const coreLangs = liveProfile.coreLanguages || 'Web Technologies';

        // Update DOM text
        setText('astHeaderUserName', userName);
        setText('astHeaderUserRole', userRole);
        setText('astHeaderProjectCount', liveProjects.length);

        setText('astCtxName', userName);
        setText('astCtxRole', userRole);
        setText('astCtxProjects', liveProjects.length);

        const statusEl = document.getElementById('astContextStatus');
        if (statusEl) statusEl.innerHTML = `<span class="text-emerald-400">✓ Ready</span>`;

        const welcomeEl = document.getElementById('astWelcomeMessage');
        if (welcomeEl) {
            welcomeEl.innerHTML = `Hello <strong>${userName}</strong>! I'm your Groq-powered AI Assistant. I have indexed your Profile OS (<span class="font-mono">${userRole}</span>) and your ${liveProjects.length} Kanban project(s).`;
        }

        const chipIdeas = document.getElementById('chipProjectIdeas');
        if (chipIdeas) {
            chipIdeas.dataset.prompt = `Suggest 3 advanced full-stack project ideas matching my core stack (${coreLangs}).`;
        }

        const chipSysDesign = document.getElementById('chipSystemDesign');
        if (chipSysDesign) {
            chipSysDesign.dataset.prompt = `Give me system design interview prep tips tailored for a ${userRole}.`;
        }
    }).catch(err => {
        clearTimeout(slowTimer);
        clearTimeout(softTimeoutTimer);
        console.error('Assistant context fetch ACTUAL ERROR object:', err);
        const statusEl = document.getElementById('astContextStatus');
        if (statusEl) statusEl.innerHTML = `<span class="text-amber-400">⚠️ ${err.message || err}</span>`;
    });

    if (chatForm && chatInput && chatMessages) {
        chatForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const text = chatInput.value.trim();
            if (!text) return;
            
            appendUserMessage(text);
            chatInput.value = '';
            
            const loadingDiv = appendLoadingMessage();
            
            try {
                const aiResponse = await fetchGroqCompletion(text, modeSelect ? modeSelect.value : 'career');
                loadingDiv.remove();
                appendAIMessage(aiResponse);
            } catch (err) {
                loadingDiv.remove();
                appendAIMessage(`
                    <div class="p-3 rounded-lg border border-red-500/30 bg-red-500/10 text-red-400 space-y-1">
                        <div class="font-bold">⚠️ Groq AI Connection Notice</div>
                        <p class="text-xs text-muted">${escapeHtml(err.message || 'Unable to connect to Groq API.')}</p>
                    </div>
                `);
            }
        });
    }

    if (promptChips.length) {
        promptChips.forEach(chip => {
            chip.addEventListener('click', () => {
                const promptText = chip.dataset.prompt;
                if (chatInput && promptText) {
                    chatInput.value = promptText;
                    chatForm.dispatchEvent(new Event('submit'));
                }
            });
        });
    }

    if (clearChatBtn && chatMessages) {
        clearChatBtn.addEventListener('click', () => {
            chatMessages.innerHTML = `
                <div class="flex items-start gap-3">
                    <div class="w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center shrink-0">
                        🤖
                    </div>
                    <div class="p-4 rounded-2xl rounded-tl-none border max-w-xl space-y-2" style="background: rgba(16, 185, 129, 0.05); border-color: rgba(16, 185, 129, 0.2);">
                        <div class="font-mono text-[11px] font-bold text-emerald-500">Scaffold Groq AI Assistant</div>
                        <p class="text-xs text-muted">Chat cleared. Ready for your next query!</p>
                    </div>
                </div>
            `;
        });
    }

    async function fetchGroqCompletion(promptText, mode) {
        const envKey = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_GROQ_API_KEY) ? import.meta.env.VITE_GROQ_API_KEY : '';
        const storedKey = localStorage.getItem('scaffold_groq_api_key') || '';
        const apiKey = envKey || storedKey || '';

        if (!apiKey) {
            // Fallback intelligent response generator if key is empty
            return generateFallbackResponse(promptText, mode);
        }

        const userName = liveProfile.fullName || user.displayName || 'Developer';
        const userRole = liveProfile.targetRole || 'Software Engineer';
        const coreLangs = liveProfile.coreLanguages || 'Web Technologies';

        const systemPrompt = `You are Scaffold AI, an expert developer, system architect, and career coach powered by Groq.
User Context:
- Full Name: ${userName}
- Target Role: ${userRole}
- Core Languages/Stack: ${coreLangs}
- Bio: ${liveProfile.bio || 'Developer'}
- Kanban Projects: ${JSON.stringify(liveProjects.map(p => ({ title: p.title || p.name, status: p.status, tech: p.techStack || p.tech })))}
Assistant Mode: ${mode}

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
        const content = data.choices && data.choices[0] && data.choices[0].message ? data.choices[0].message.content : '';
        
        return formatMarkdownToHtml(content);
    }

    function appendUserMessage(text) {
        const userDiv = document.createElement('div');
        userDiv.className = 'flex items-start justify-end gap-3';
        userDiv.innerHTML = `
            <div class="p-4 rounded-2xl rounded-tr-none border max-w-xl text-xs md:text-sm"
                style="background: rgba(var(--accent-rgb), 0.1); border-color: var(--accent); color: var(--fg);">
                ${escapeHtml(text)}
            </div>
            <div class="w-8 h-8 rounded-lg bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center shrink-0">
                👤
            </div>
        `;
        chatMessages.appendChild(userDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function appendLoadingMessage() {
        const loadingDiv = document.createElement('div');
        loadingDiv.className = 'flex items-start gap-3';
        loadingDiv.innerHTML = `
            <div class="w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center shrink-0">
                🤖
            </div>
            <div class="p-4 rounded-2xl rounded-tl-none border max-w-xl text-xs text-muted flex items-center gap-2"
                style="background: rgba(16, 185, 129, 0.05); border-color: rgba(16, 185, 129, 0.2);">
                <i class="fas fa-circle-notch fa-spin text-emerald-500"></i> Groq AI is thinking...
            </div>
        `;
        chatMessages.appendChild(loadingDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
        return loadingDiv;
    }

    function appendAIMessage(htmlContent) {
        const aiDiv = document.createElement('div');
        aiDiv.className = 'flex items-start gap-3';
        aiDiv.innerHTML = `
            <div class="w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center shrink-0">
                🤖
            </div>
            <div class="p-4 rounded-2xl rounded-tl-none border max-w-2xl space-y-2 text-xs md:text-sm leading-relaxed"
                style="background: rgba(16, 185, 129, 0.05); border-color: rgba(16, 185, 129, 0.2); color: var(--fg);">
                <div class="font-mono text-[11px] font-bold text-emerald-500">Scaffold Groq AI Assistant</div>
                <div>${htmlContent}</div>
            </div>
        `;
        chatMessages.appendChild(aiDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function formatMarkdownToHtml(md) {
        let html = md
            .replace(/```([\s\S]*?)```/g, (match, code) => `<pre class="p-3 rounded-lg border my-2 font-mono text-[11px] overflow-x-auto" style="background: var(--bg); border-color: var(--border);"><code>${escapeHtml(code.trim())}</code></pre>`)
            .replace(/`([^`]+)`/g, '<code class="px-1 py-0.5 rounded font-mono text-[11px]" style="background: rgba(var(--accent-rgb), 0.1); color: var(--accent);">$1</code>')
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/\n\n/g, '<br/><br/>')
            .replace(/\n/g, '<br/>');
        return html;
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
                    <a href="#resume" class="btn-primary text-[11px] px-3 py-1.5 inline-block" style="background: #10b981; color: #fff;">Inspect ATS Resume Sheet →</a>
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
                    <a href="#tracker" class="btn-secondary text-[11px] px-3 py-1.5 inline-block">Add to Kanban Tracker →</a>
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

    function setText(id, text) {
        const el = document.getElementById(id);
        if (el && text !== undefined) el.innerText = text;
    }

    function escapeHtml(str) {
        return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
    }
}
