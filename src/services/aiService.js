/**
 * Shared Groq AI Service for Scaffold
 * Used by both the full Assistant page (Assistant.jsx) and the ambient floating widget (AiBubble.jsx).
 */

export function getGroqApiKey() {
  const envKey = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_GROQ_API_KEY)
    ? import.meta.env.VITE_GROQ_API_KEY
    : '';
  const storedKey = typeof localStorage !== 'undefined'
    ? (localStorage.getItem('scaffold_groq_api_key') || '')
    : '';
  return envKey || storedKey || '';
}

export function escapeHtml(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export function formatMarkdownToHtml(md) {
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

/**
 * Execute a completion request against Groq's OpenAI-compatible chat API
 */
export async function callGroqChat({
  messages = [],
  systemPrompt = '',
  model = 'openai/gpt-oss-20b',
  temperature = 0.7
}) {
  const apiKey = getGroqApiKey();
  if (!apiKey) {
    throw new Error('MISSING_API_KEY');
  }

  const payloadMessages = [];
  if (systemPrompt) {
    payloadMessages.push({ role: 'system', content: systemPrompt });
  }
  payloadMessages.push(...messages);

  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model,
      messages: payloadMessages,
      temperature
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

  return content;
}
