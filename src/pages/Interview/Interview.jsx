import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.js';
import { useProfile } from '../../hooks/useProfile.js';
import { useTracker } from '../../hooks/useTracker.js';
import { callGroqChat, getGroqApiKey } from '../../services/aiService.js';
import './interview.css';

// Curated Question Bank for reliable offline and viva scenarios
const QUESTION_BANK = {
  frontend: [
    {
      id: 'fe_1',
      topic: 'React 18/19 Lifecycle & Reconciliation',
      question: 'Explain the difference between React\'s Virtual DOM reconciliation and direct DOM manipulation. Why does React use key props when rendering lists, and what performance bugs happen when keys are omitted or set to array indices?',
      hint: 'Focus on diffing algorithms (O(n) heuristic), component identity, state preservation, and unmounting issues when array indexes shift.',
      keywords: ['virtual dom', 'diffing', 'reconciliation', 'keys', 'identity', 're-render', 'performance'],
      idealPoints: [
        'Direct DOM mutations are slow because browser recalculates layout, style, and repaints.',
        'Virtual DOM keeps a lightweight JS representation and runs a heuristic O(n) diffing algorithm.',
        'Key props provide stable component identity across re-renders.',
        'Using array indices causes state bleed and unnecessary remounting when items are reordered or deleted.'
      ]
    },
    {
      id: 'fe_2',
      topic: 'React Hooks: useCallback vs useMemo',
      question: 'In a performance-sensitive React application (like a Kanban board filtering cards), when should you use useCallback versus useMemo? Write or describe a code snippet illustrating where NOT using them creates wasted re-render cycles.',
      hint: 'useMemo caches a computed value; useCallback caches a function instance to keep reference equality stable across renders.',
      keywords: ['usecallback', 'usememo', 'referential equality', 'closure', 're-render', 'dependency array'],
      idealPoints: [
        'useMemo caches computed return values to prevent heavy recalculations on unrelated state updates.',
        'useCallback preserves function reference equality across renders, preventing memoized child components from invalidating.',
        'Overusing memoization adds memory and dependency array comparison overhead without measurable benefit.'
      ]
    },
    {
      id: 'fe_3',
      topic: 'Client-Side Routing & State Preservation',
      question: 'How does client-side routing (like React Router) work under the hood without triggering a full page refresh? How does Scaffold maintain user authentication state across route transitions?',
      hint: 'Mention the HTML5 History API (pushState/replaceState), popstate event listener, and Context API / onAuthStateChanged subscription.',
      keywords: ['history api', 'pushstate', 'popstate', 'spa', 'authcontext', 'onauthstatechanged'],
      idealPoints: [
        'React Router intercepts navigation clicks, updates the browser URL via history.pushState, and conditionally renders components.',
        'No full network request for new HTML is made; existing DOM tree is preserved.',
        'Scaffold wraps routes in AuthProvider, maintaining currentUser in React Context subscribed to Firebase onAuthStateChanged.'
      ]
    }
  ],
  viva_defense: [
    {
      id: 'viva_1',
      topic: 'Cloud Firestore Architecture & Security Rules',
      question: 'In Scaffold, why did your team choose Cloud Firestore over a traditional SQL database? Explain your data path (profiles/{userId}/projects/{id}) and how your security rule prevents unauthorized tenant data access.',
      hint: 'Mention document-subcollection hierarchy, per-user security rule (request.auth.uid == userId), and automatic indexing.',
      keywords: ['nosql', 'subcollection', 'security rule', 'tenant isolation', 'request.auth.uid', 'profiles'],
      idealPoints: [
        'Firestore provides flexible schema evolution and hierarchical subcollections without complex schema migration scripts.',
        'Scaffold nests projects under profiles/{userId}/projects so a single security rule enforces tenant isolation.',
        'Security rule: match /profiles/{userId}/{document=**} allow read, write: if request.auth.uid == userId;'
      ]
    },
    {
      id: 'viva_2',
      topic: 'Debugging History: The "Client Is Offline" Bug',
      question: 'In report.md Section 6.5, you documented the "Client Is Offline" Firestore error. What was the exact root cause, how did your team eliminate false hypotheses, and why is this strong proof of genuine engineering?',
      hint: 'Talk about network tab showing 200 OK, testing across multiple machines/hotspots, and discovering that the Firestore DB had never been provisioned in Firebase Console.',
      keywords: ['offline', 'provision', 'console', '200 ok', 'hypothesis', 'long polling', 'firestore'],
      idealPoints: [
        'Symptom: SDK reported client offline even though network requests returned HTTP 200.',
        'Eliminated browser extensions, proxy CORS issues, and network incompatibility via multi-machine hotspot tests.',
        'Root cause: Cloud Firestore database was never provisioned in Firebase Console; SDK emitted generic offline code instead of database-not-found.'
      ]
    },
    {
      id: 'viva_3',
      topic: 'Point-in-Time Fetches vs Realtime Listeners',
      question: 'In report.md Section 6.16, you audited the Settings Drawer and corrected the sync label. Why did your team avoid onSnapshot() in favor of getDoc/getDocs, and what are the cost and architectural tradeoffs of this decision?',
      hint: 'Mention active WebSocket listeners, connection maintenance, Firestore document read billing per snapshot update, and honest UI status reporting.',
      keywords: ['onsnapshot', 'getdoc', 'websocket', 'read billing', 'one-time fetch', 'point in time'],
      idealPoints: [
        'onSnapshot maintains continuous WebSockets that fire billable reads whenever documents change.',
        'Scaffold intentionally used getDoc/getDocs point-in-time fetches to keep connection costs minimal for a developer portfolio.',
        'Corrected UI from "Realtime Active" to "Synced" to prevent misrepresenting the architectural reality in viva.'
      ]
    }
  ],
  backend: [
    {
      id: 'be_1',
      topic: 'Authentication & Session Token Lifecycle',
      question: 'Explain how Firebase Authentication manages user sessions in client-side applications. What is the role of JWT access tokens, refresh tokens, and indexedDB storage in preventing silent logouts?',
      hint: 'Access tokens are short-lived (~1hr); refresh tokens are stored securely in browser storage and automatically exchange for fresh tokens.',
      keywords: ['jwt', 'access token', 'refresh token', 'session', 'indexeddb', 'oauth'],
      idealPoints: [
        'Client receives short-lived JWT access token proving identity to backend services.',
        'Refresh token is securely persisted in indexedDB/localStorage and used by SDK background timers to rotate access tokens.',
        'onAuthStateChanged listener fires whenever tokens refresh or session terminates.'
      ]
    },
    {
      id: 'be_2',
      topic: 'LLM Rate Limiting & API Security',
      question: 'In Scaffold, Groq AI API calls are executed client-side via VITE_GROQ_API_KEY. What are the security risks of bundling API keys in frontend builds, and how would you architect a production proxy to protect it?',
      hint: 'Mention client decompilation, token scraping, Cloud Functions / serverless proxy, IP rate limiting, and user quota management.',
      keywords: ['api key', 'client bundle', 'cloud function', 'proxy', 'rate limiting', 'quota'],
      idealPoints: [
        'Frontend environment variables are easily extracted from browser network requests and JS bundles.',
        'A malicious actor can scrape the Groq key and exhaust rate limits or incur financial billing.',
        'Production architecture requires a serverless proxy (Firebase Cloud Functions) requiring auth bearer tokens and rate limiting.'
      ]
    }
  ],
  system_design: [
    {
      id: 'sd_1',
      topic: 'Collaborative Kanban Concurrency',
      question: 'How would you design a real-time collaborative Kanban board (like Scaffold Tracker) to handle concurrency conflicts when two users move the same task card simultaneously?',
      hint: 'Consider Optimistic UI updates, Last-Write-Wins (LWW), Operational Transformation / CRDTs, or Firestore transaction locks.',
      keywords: ['concurrency', 'optimistic ui', 'conflict resolution', 'transactions', 'crdt', 'versioning'],
      idealPoints: [
        'Apply optimistic UI updates locally for instant responsiveness.',
        'Use Firestore runTransaction with a version field (updatedAt timestamp) to detect conflicting writes.',
        'If conflicting write occurs, rollback optimistic local state and notify user with conflict resolution toast.'
      ]
    }
  ],
  behavioral: [
    {
      id: 'bh_1',
      topic: 'Technical Conflict & Team Ownership',
      question: 'In Scaffold, your team divided ownership (Tiksha on UI/Styling, Tammana on Routing/Forms, Pranav on Firebase/State/AI). Describe how you resolved an architectural disagreement or merge conflict during development.',
      hint: 'Use the STAR method (Situation, Task, Action, Result) to explain communication, git branch isolation, and technical consensus.',
      keywords: ['star', 'collaboration', 'ownership', 'git', 'communication', 'tradeoff'],
      idealPoints: [
        'Situation: Team members had overlapping edits on page layout and state management.',
        'Action: Created a formal ownership map in report.md and enforced feature branching before merging.',
        'Result: Eliminated merge conflicts and gave each engineer clear accountability during viva evaluation.'
      ]
    }
  ]
};

const TRACK_METADATA = [
  { id: 'viva_defense', name: 'Scaffold Viva Defense', icon: 'fa-shield-halved', badge: 'Chitkara FEE-II', desc: 'Mock viva defense covering Scaffold architecture, Firestore security, and real debugging bugs.' },
  { id: 'frontend', name: 'Frontend React Engineering', icon: 'fa-atom', badge: 'Core Syllabus', desc: 'React 18/19 hooks, component lifecycle, Virtual DOM, and state management.' },
  { id: 'backend', name: 'Backend & Cloud Systems', icon: 'fa-cloud', badge: 'API & Security', desc: 'Firebase auth lifecycle, REST principles, token management, and serverless design.' },
  { id: 'system_design', name: 'System Architecture', icon: 'fa-diagram-project', badge: 'Scalability', desc: 'Real-time collaborative state, optimistic UI, caching, and data pipelines.' },
  { id: 'behavioral', name: 'Behavioral & STAR Method', icon: 'fa-users', badge: 'Placement Prep', desc: 'Technical team collaboration, debugging under pressure, and conflict resolution.' }
];

export default function Interview() {
  const { currentUser } = useAuth();
  const { profile } = useProfile();
  const { addProject } = useTracker();
  const navigate = useNavigate();

  // Session State Machine: 'setup' | 'interview' | 'review' | 'scorecard'
  const [stage, setStage] = useState('setup');
  const [selectedTrack, setSelectedTrack] = useState('viva_defense');
  const [selectedLevel, setSelectedLevel] = useState('junior');
  const [questionCount, setQuestionCount] = useState(3);

  // Active Session State
  const [sessionQuestions, setSessionQuestions] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [isCodeMode, setIsCodeMode] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evalError, setEvalError] = useState('');

  // Telemetry & Stopwatch
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  const timerRef = useRef(null);

  // History of completed questions in this session
  const [sessionHistory, setSessionHistory] = useState([]);
  const [currentEvaluation, setCurrentEvaluation] = useState(null);
  const [addedTasks, setAddedTasks] = useState({});

  // Timer interval
  useEffect(() => {
    if (timerActive) {
      timerRef.current = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [timerActive]);

  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60);
    const rem = secs % 60;
    return `${String(mins).padStart(2, '0')}:${String(rem).padStart(2, '0')}`;
  };

  // 1. Begin Session
  const handleStartSession = () => {
    const pool = QUESTION_BANK[selectedTrack] || QUESTION_BANK.viva_defense;
    const shuffled = [...pool].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, Math.min(questionCount, pool.length));

    setSessionQuestions(selected);
    setCurrentIdx(0);
    setUserAnswer('');
    setShowHint(false);
    setSessionHistory([]);
    setCurrentEvaluation(null);
    setElapsedSeconds(0);
    setTimerActive(true);
    setStage('interview');
  };

  // 2. Submit Answer for Evaluation
  const handleSubmitAnswer = async () => {
    if (!userAnswer.trim() || isEvaluating) return;

    setIsEvaluating(true);
    setEvalError('');

    const currentQ = sessionQuestions[currentIdx];
    const apiKey = getGroqApiKey();

    let evaluation = null;

    if (apiKey) {
      try {
        const prompt = `You are a technical interviewer and computer science viva examiner.
Question: "${currentQ.question}"
Topic: ${currentQ.topic}
Candidate Level: ${selectedLevel}
Candidate Answer:
"${userAnswer}"

Evaluate strictly on technical accuracy, understanding of core concepts, and clarity.
Output ONLY a raw valid JSON object with no markdown wrapping or code blocks:
{
  "score": <integer from 1 to 10>,
  "verdict": "<Excellent | Good | Fair | Needs Work>",
  "strengths": "<1-2 sentences on what the candidate explained well>",
  "improvements": "<1-2 sentences on missing technical details or edge cases>",
  "idealSummary": "<2 concise bullet points summarizing the model answer>"
}`;

        const raw = await callGroqChat({
          messages: [{ role: 'user', content: prompt }],
          systemPrompt: 'You are an expert technical interviewer. Output valid JSON only.',
          model: 'openai/gpt-oss-20b',
          temperature: 0.3
        });

        const cleaned = raw.replace(/```json/g, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(cleaned);

        evaluation = {
          score: Math.min(10, Math.max(1, Number(parsed.score) || 7)),
          verdict: parsed.verdict || 'Good',
          strengths: parsed.strengths || 'Demonstrated understanding of core principles.',
          improvements: parsed.improvements || 'Consider mentioning edge cases and memory implications.',
          idealSummary: parsed.idealSummary || currentQ.idealPoints.join(' ')
        };
      } catch (err) {
        console.warn('Groq evaluation fallback engaged:', err);
      }
    }

    // Heuristic Fallback if Groq unavailable or parsing failed
    if (!evaluation) {
      const lower = userAnswer.toLowerCase();
      let matchedCount = 0;
      (currentQ.keywords || []).forEach((k) => {
        if (lower.includes(k.toLowerCase())) matchedCount++;
      });

      const baseScore = Math.min(9, Math.max(4, 5 + matchedCount));
      evaluation = {
        score: baseScore,
        verdict: baseScore >= 8 ? 'Excellent' : baseScore >= 6 ? 'Good' : 'Needs Work',
        strengths: `Answer addresses the problem structure with ${userAnswer.split(' ').length} words and key technical terms.`,
        improvements: `Deepen your explanation by explicitly referencing: ${currentQ.keywords?.slice(0, 3).join(', ')}.`,
        idealSummary: currentQ.idealPoints?.join(' ') || 'Ensure clear technical tradeoffs are stated.'
      };
    }

    const record = {
      questionId: currentQ.id,
      topic: currentQ.topic,
      question: currentQ.question,
      userAnswer,
      evaluation,
      timeSpent: elapsedSeconds
    };

    setSessionHistory((prev) => [...prev, record]);
    setCurrentEvaluation(evaluation);
    setIsEvaluating(false);
    setStage('review');
  };

  // 3. Move to next question or scorecard
  const handleProceedNext = () => {
    if (currentIdx + 1 < sessionQuestions.length) {
      setCurrentIdx((prev) => prev + 1);
      setUserAnswer('');
      setShowHint(false);
      setCurrentEvaluation(null);
      setStage('interview');
    } else {
      setTimerActive(false);
      setStage('scorecard');
    }
  };

  // 4. Add recommended follow-up task to Kanban Tracker
  const handleAddToTracker = async (topicTitle, key) => {
    if (!currentUser) {
      alert('Please log in to persist cards to your Kanban board.');
      return;
    }

    try {
      await addProject(currentUser.uid, {
        title: `Interview Prep: ${topicTitle}`,
        techStack: selectedTrack === 'viva_defense' ? 'React, Firebase, Architecture' : 'JavaScript, React, CS Core',
        status: 'To-Do',
        description: `Follow-up learning card generated from AI Mock Interview session (${selectedTrack} track). Review core mechanics and practice viva defense.`
      });
      setAddedTasks((prev) => ({ ...prev, [key]: true }));
    } catch (err) {
      console.error('Failed to add card from interview:', err);
      alert('Unable to add task to tracker: ' + err.message);
    }
  };

  // Calculate overall performance metrics
  const overallMetrics = sessionHistory.reduce(
    (acc, item) => {
      acc.totalScore += item.evaluation?.score || 0;
      return acc;
    },
    { totalScore: 0 }
  );

  const averageScore = sessionHistory.length
    ? Math.round((overallMetrics.totalScore / (sessionHistory.length * 10)) * 100)
    : 0;

  const getGradeBadge = (pct) => {
    if (pct >= 85) return { grade: 'Grade A+ • Placement Ready', color: '#10b981', bg: 'rgba(16, 185, 129, 0.15)' };
    if (pct >= 70) return { grade: 'Grade A • Strong Hire', color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.15)' };
    if (pct >= 55) return { grade: 'Grade B • Needs Polish', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.15)' };
    return { grade: 'Grade C • Review Core Concepts', color: '#ef4444', bg: 'rgba(239, 68, 68, 0.15)' };
  };

  const gradeInfo = getGradeBadge(averageScore);

  return (
    <div className="interview-wrapper">
      <div className="interview-container space-y-6">

        {/* ========================================================
            VIEW 1: SETUP & TRACK SELECTION
           ======================================================== */}
        {stage === 'setup' && (
          <div className="space-y-8 animate-fadeIn">
            {/* Header */}
            <div className="border-b pb-6" style={{ borderColor: 'var(--border)' }}>
              <div className="flex items-center gap-3 mb-2">
                <span className="w-8 h-8 rounded-lg flex items-center justify-center font-mono text-sm" style={{ background: 'rgba(var(--accent-rgb), 0.15)', color: 'var(--accent)' }}>
                  <i className="fas fa-microphone-lines"></i>
                </span>
                <h1 className="font-display font-bold text-3xl" style={{ color: 'var(--fg)' }}>
                  AI Mock Interview Arena &amp; Viva Prep
                </h1>
              </div>
              <p className="text-sm text-muted">
                Practice technical screening and project viva defense with interactive AI grading, turn-by-turn evaluations, and personalized study cards.
              </p>
            </div>

            {/* Candidate Context Pill */}
            <div className="p-4 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs font-mono" style={{ background: 'var(--card)', borderColor: 'var(--border-strong)' }}>
              <div className="flex items-center gap-2">
                <i className="fas fa-user-astronaut text-emerald-400"></i>
                <span>Candidate Profile: <strong>{profile?.fullName || currentUser?.displayName || 'Developer'}</strong></span>
                <span className="text-muted">({profile?.targetRole || 'Software Engineer'})</span>
              </div>
              <div className="flex items-center gap-2 text-muted">
                <span>Verified Projects: <strong>{profile?.coreLanguages ? profile.coreLanguages.split(',').length : '3'} Skills Detected</strong></span>
              </div>
            </div>

            {/* Step 1: Choose Track */}
            <div className="space-y-3">
              <label className="font-mono text-xs uppercase tracking-wider text-muted font-bold">
                1. Select Interview Track
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {TRACK_METADATA.map((track) => (
                  <div
                    key={track.id}
                    onClick={() => setSelectedTrack(track.id)}
                    className={`interview-track-card ${selectedTrack === track.id ? 'selected' : ''}`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-9 h-9 rounded-lg flex items-center justify-center text-sm" style={{ background: 'rgba(var(--accent-rgb), 0.1)', color: 'var(--accent)' }}>
                        <i className={`fas ${track.icon}`}></i>
                      </div>
                      <span className="font-mono text-[10px] px-2 py-0.5 rounded-full border text-muted" style={{ borderColor: 'var(--border)' }}>
                        {track.badge}
                      </span>
                    </div>
                    <h3 className="font-bold text-sm mb-1" style={{ color: 'var(--fg)' }}>
                      {track.name}
                    </h3>
                    <p className="text-xs text-muted leading-relaxed">
                      {track.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Step 2: Session Parameters */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              <div className="p-5 rounded-xl border space-y-3" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
                <label className="font-mono text-xs uppercase tracking-wider text-muted font-bold block">
                  2. Candidate Experience Level
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'intern', label: 'Student / Intern' },
                    { id: 'junior', label: 'Junior SDE' },
                    { id: 'mid', label: 'Mid-Level' }
                  ].map((lvl) => (
                    <button
                      key={lvl.id}
                      type="button"
                      onClick={() => setSelectedLevel(lvl.id)}
                      className={`py-2 px-3 rounded-lg text-xs font-mono border transition-all ${selectedLevel === lvl.id ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400 font-bold' : 'border-border text-muted hover:border-accent'}`}
                      style={{ borderColor: selectedLevel === lvl.id ? 'var(--accent)' : 'var(--border)' }}
                    >
                      {lvl.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-5 rounded-xl border space-y-3" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
                <label className="font-mono text-xs uppercase tracking-wider text-muted font-bold block">
                  3. Session Length
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { count: 3, label: '3 Questions (Quick Drill)' },
                    { count: 5, label: '5 Questions (Full Mock)' }
                  ].map((opt) => (
                    <button
                      key={opt.count}
                      type="button"
                      onClick={() => setQuestionCount(opt.count)}
                      className={`py-2 px-3 rounded-lg text-xs font-mono border transition-all ${questionCount === opt.count ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400 font-bold' : 'border-border text-muted hover:border-accent'}`}
                      style={{ borderColor: questionCount === opt.count ? 'var(--accent)' : 'var(--border)' }}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Launch CTA */}
            <div className="flex justify-end pt-4">
              <button
                type="button"
                id="startInterviewBtn"
                onClick={handleStartSession}
                className="btn-primary text-sm px-8 py-3 flex items-center gap-2 shadow-lg"
                style={{ background: '#10b981', color: '#fff' }}
              >
                <span>Enter Mock Arena</span>
                <i className="fas fa-arrow-right text-xs"></i>
              </button>
            </div>
          </div>
        )}

        {/* ========================================================
            VIEW 2: ACTIVE INTERVIEW COCKPIT
           ======================================================== */}
        {(stage === 'interview' || stage === 'review') && sessionQuestions[currentIdx] && (
          <div className="space-y-6 animate-fadeIn">
            {/* Top Telemetry Bar */}
            <div className="p-4 rounded-xl border flex flex-wrap items-center justify-between gap-4 font-mono text-xs" style={{ background: 'var(--card)', borderColor: 'var(--border-strong)' }}>
              <div className="flex items-center gap-3">
                <span className="px-2.5 py-1 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold uppercase">
                  {selectedTrack.replace('_', ' ')}
                </span>
                <span className="text-muted">
                  Question <strong>{currentIdx + 1}</strong> of <strong>{sessionQuestions.length}</strong>
                </span>
              </div>

              {/* Step indicator pills */}
              <div className="hidden sm:flex items-center gap-1.5">
                {sessionQuestions.map((_, idx) => (
                  <span
                    key={idx}
                    className={`h-1.5 rounded-full transition-all duration-300 ${idx === currentIdx ? 'w-8 bg-emerald-500' : idx < currentIdx ? 'w-4 bg-emerald-700' : 'w-4 bg-gray-700'}`}
                  />
                ))}
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5 text-amber-400">
                  <i className="fas fa-stopwatch"></i>
                  <span>{formatTime(elapsedSeconds)}</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm('Quit interview session early? Answers will not be saved.')) {
                      setTimerActive(false);
                      setStage('setup');
                    }
                  }}
                  className="text-muted hover:text-red-400 text-xs underline"
                >
                  Exit
                </button>
              </div>
            </div>

            {/* Split Screen Workspace */}
            <div className="interview-cockpit-grid">
              {/* Left Column: Interviewer Desk */}
              <div className="p-6 rounded-2xl border flex flex-col justify-between space-y-6" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: 'var(--border)' }}>
                    <div className="flex items-center gap-2 font-mono text-xs text-emerald-400 font-bold">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                      <span>AI INTERVIEWER</span>
                    </div>
                    <span className="font-mono text-[11px] text-muted">
                      {sessionQuestions[currentIdx].topic}
                    </span>
                  </div>

                  <div className="text-base font-medium leading-relaxed" style={{ color: 'var(--fg)' }}>
                    {sessionQuestions[currentIdx].question}
                  </div>

                  {/* Hint Toggle */}
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => setShowHint((prev) => !prev)}
                      className="text-xs font-mono text-muted hover:text-accent flex items-center gap-1.5 transition-colors"
                    >
                      <i className={`fas ${showHint ? 'fa-eye-slash' : 'fa-lightbulb'}`}></i>
                      <span>{showHint ? 'Hide Guidance Hint' : 'Need a Guidance Hint?'}</span>
                    </button>
                    {showHint && (
                      <div className="mt-2 p-3 rounded-lg border text-xs font-mono text-amber-300 leading-relaxed" style={{ background: 'rgba(245, 158, 11, 0.08)', borderColor: 'rgba(245, 158, 11, 0.3)' }}>
                        💡 <strong>Hint:</strong> {sessionQuestions[currentIdx].hint}
                      </div>
                    )}
                  </div>
                </div>

                {/* Expected Topics Pills */}
                <div className="pt-4 border-t" style={{ borderColor: 'var(--border)' }}>
                  <div className="text-[11px] font-mono text-muted mb-2">Evaluated Competencies:</div>
                  <div className="flex flex-wrap gap-1.5">
                    {sessionQuestions[currentIdx].keywords?.map((kw, i) => (
                      <span key={i} className="text-[10px] font-mono px-2 py-0.5 rounded border text-muted" style={{ borderColor: 'var(--border)' }}>
                        #{kw}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column: Candidate Console */}
              <div className="p-6 rounded-2xl border flex flex-col justify-between space-y-4" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
                <div className="space-y-3">
                  <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: 'var(--border)' }}>
                    <div className="flex items-center gap-2 font-mono text-xs text-muted">
                      <i className="fas fa-terminal"></i>
                      <span>YOUR ANSWER CONSOLE</span>
                    </div>
                    <div className="flex items-center gap-1 text-[11px] font-mono">
                      <button
                        type="button"
                        onClick={() => setIsCodeMode(false)}
                        className={`px-2 py-0.5 rounded ${!isCodeMode ? 'bg-accent text-white font-bold' : 'text-muted'}`}
                      >
                        Text Explanation
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsCodeMode(true)}
                        className={`px-2 py-0.5 rounded ${isCodeMode ? 'bg-accent text-white font-bold' : 'text-muted'}`}
                      >
                        Code Scratchpad
                      </button>
                    </div>
                  </div>

                  <textarea
                    id="interviewAnswerInput"
                    rows={12}
                    value={userAnswer}
                    onChange={(e) => setUserAnswer(e.target.value)}
                    placeholder={
                      isCodeMode
                        ? "// Write code or pseudocode here...\nfunction solution() {\n  // Explain step-by-step logic\n}"
                        : "Explain your thought process clearly, discussing data structures, edge cases, and performance tradeoffs..."
                    }
                    className="interview-code-area"
                    disabled={isEvaluating}
                  />

                  <div className="flex items-center justify-between text-[11px] font-mono text-muted">
                    <span>Words: {userAnswer.trim() ? userAnswer.trim().split(/\s+/).length : 0}</span>
                    <span>Characters: {userAnswer.length}</span>
                  </div>
                </div>

                <div className="pt-3 border-t flex items-center justify-between" style={{ borderColor: 'var(--border)' }}>
                  <span className="text-xs text-muted font-mono">
                    {isEvaluating ? 'Evaluating technical depth...' : 'Review before submitting'}
                  </span>
                  <button
                    type="button"
                    id="submitAnswerBtn"
                    onClick={handleSubmitAnswer}
                    disabled={!userAnswer.trim() || isEvaluating}
                    className="btn-primary text-xs px-5 py-2.5 flex items-center gap-2"
                    style={{ background: '#10b981', color: '#fff', opacity: !userAnswer.trim() || isEvaluating ? 0.6 : 1 }}
                  >
                    {isEvaluating ? (
                      <>
                        <i className="fas fa-circle-notch fa-spin"></i>
                        <span>AI Grading...</span>
                      </>
                    ) : (
                      <>
                        <span>Submit Answer</span>
                        <i className="fas fa-check"></i>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
            MODAL / DRAWER: PER-QUESTION AI EVALUATION
           ======================================================== */}
        {stage === 'review' && currentEvaluation && (
          <div className="interview-modal-overlay">
            <div className="interview-modal-content p-6 sm:p-8 space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between border-b pb-4" style={{ borderColor: 'var(--border)' }}>
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center font-mono font-black text-xl"
                    style={{
                      background: currentEvaluation.score >= 8 ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                      color: currentEvaluation.score >= 8 ? '#10b981' : '#f59e0b',
                      border: `1px solid ${currentEvaluation.score >= 8 ? 'rgba(16, 185, 129, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`
                    }}
                  >
                    {currentEvaluation.score}/10
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-lg" style={{ color: 'var(--fg)' }}>
                      Question Evaluation &amp; Critique
                    </h3>
                    <p className="text-xs font-mono text-muted">
                      Rating: <strong className="text-emerald-400">{currentEvaluation.verdict}</strong>
                    </p>
                  </div>
                </div>
              </div>

              {/* Feedback Points */}
              <div className="space-y-4 text-xs leading-relaxed">
                <div className="p-4 rounded-xl border space-y-1.5" style={{ background: 'rgba(16, 185, 129, 0.05)', borderColor: 'rgba(16, 185, 129, 0.2)' }}>
                  <div className="font-mono font-bold text-emerald-400 flex items-center gap-1.5">
                    <i className="fas fa-check-circle"></i>
                    <span>Demonstrated Strengths:</span>
                  </div>
                  <p className="text-muted">{currentEvaluation.strengths}</p>
                </div>

                <div className="p-4 rounded-xl border space-y-1.5" style={{ background: 'rgba(245, 158, 11, 0.05)', borderColor: 'rgba(245, 158, 11, 0.2)' }}>
                  <div className="font-mono font-bold text-amber-400 flex items-center gap-1.5">
                    <i className="fas fa-exclamation-triangle"></i>
                    <span>Improvement Opportunities:</span>
                  </div>
                  <p className="text-muted">{currentEvaluation.improvements}</p>
                </div>

                <div className="p-4 rounded-xl border space-y-1.5" style={{ background: 'var(--bg-elev)', borderColor: 'var(--border)' }}>
                  <div className="font-mono font-bold text-cyan-400 flex items-center gap-1.5">
                    <i className="fas fa-lightbulb"></i>
                    <span>Key Takeaway / Model Answer:</span>
                  </div>
                  <p className="text-muted">{currentEvaluation.idealSummary}</p>
                </div>
              </div>

              {/* Proceed CTA */}
              <div className="flex justify-end pt-2 border-t" style={{ borderColor: 'var(--border)' }}>
                <button
                  type="button"
                  id="proceedNextBtn"
                  onClick={handleProceedNext}
                  className="btn-primary text-xs px-6 py-2.5 flex items-center gap-2"
                  style={{ background: '#10b981', color: '#fff' }}
                >
                  <span>{currentIdx + 1 < sessionQuestions.length ? 'Next Question →' : 'View Performance Scorecard →'}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
            VIEW 3: FINAL PERFORMANCE SCORECARD
           ======================================================== */}
        {stage === 'scorecard' && (
          <div className="space-y-8 animate-fadeIn interview-scorecard-card">
            {/* Hero Card */}
            <div className="p-6 md:p-8 rounded-2xl border text-center space-y-4" style={{ background: 'var(--card)', borderColor: 'var(--border-strong)' }}>
              <span className="font-mono text-xs uppercase tracking-wider text-muted font-bold">
                MOCK INTERVIEW PERFORMANCE SCORECARD
              </span>

              <div className="py-2">
                <div className="font-mono font-extrabold text-5xl md:text-6xl text-emerald-400">
                  {averageScore}
                  <span className="text-2xl text-muted font-normal">/100</span>
                </div>
              </div>

              <div>
                <span
                  className="inline-block px-4 py-1.5 rounded-full text-xs font-mono font-bold"
                  style={{
                    background: gradeInfo.bg,
                    color: gradeInfo.color,
                    border: `1px solid ${gradeInfo.color}40`
                  }}
                >
                  {gradeInfo.grade}
                </span>
              </div>

              <p className="text-xs text-muted max-w-lg mx-auto leading-relaxed">
                Completed {sessionHistory.length} technical drill questions across track <strong>{selectedTrack.replace('_', ' ').toUpperCase()}</strong> in {formatTime(elapsedSeconds)}.
              </p>

              {/* Action Buttons */}
              <div className="pt-4 flex flex-wrap items-center justify-center gap-3 no-print">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="btn-secondary text-xs px-4 py-2 flex items-center gap-2"
                >
                  <i className="fas fa-print"></i>
                  <span>Print Scorecard</span>
                </button>
                <button
                  type="button"
                  onClick={() => setStage('setup')}
                  className="btn-primary text-xs px-5 py-2 flex items-center gap-2"
                  style={{ background: '#10b981', color: '#fff' }}
                >
                  <i className="fas fa-rotate-right"></i>
                  <span>New Session</span>
                </button>
              </div>
            </div>

            {/* Question Breakdown Table */}
            <div className="p-6 rounded-2xl border space-y-4" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
              <h3 className="font-display font-bold text-lg" style={{ color: 'var(--fg)' }}>
                Detailed Question Audit
              </h3>

              <div className="space-y-4">
                {sessionHistory.map((item, idx) => (
                  <div key={idx} className="p-4 rounded-xl border space-y-3" style={{ background: 'var(--bg-elev)', borderColor: 'var(--border)' }}>
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-emerald-500/10 text-emerald-400 font-mono text-xs flex items-center justify-center font-bold">
                          {idx + 1}
                        </span>
                        <span className="font-bold text-xs" style={{ color: 'var(--fg)' }}>
                          {item.topic}
                        </span>
                      </div>
                      <span className="font-mono text-xs font-bold px-2 py-0.5 rounded" style={{ background: item.evaluation?.score >= 8 ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)', color: item.evaluation?.score >= 8 ? '#10b981' : '#f59e0b' }}>
                        Score: {item.evaluation?.score}/10 ({item.evaluation?.verdict})
                      </span>
                    </div>

                    <p className="text-xs text-muted">{item.question}</p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[11px] pt-1">
                      <div className="p-2.5 rounded border" style={{ borderColor: 'rgba(16, 185, 129, 0.2)', background: 'rgba(16, 185, 129, 0.03)' }}>
                        <strong className="text-emerald-400">Strengths:</strong>
                        <p className="text-muted mt-0.5">{item.evaluation?.strengths}</p>
                      </div>
                      <div className="p-2.5 rounded border" style={{ borderColor: 'rgba(245, 158, 11, 0.2)', background: 'rgba(245, 158, 11, 0.03)' }}>
                        <strong className="text-amber-400">Improvement Note:</strong>
                        <p className="text-muted mt-0.5">{item.evaluation?.improvements}</p>
                      </div>
                    </div>

                    {/* 1-Click Action to Kanban */}
                    <div className="flex justify-end pt-1 no-print">
                      <button
                        type="button"
                        disabled={addedTasks[item.questionId]}
                        onClick={() => handleAddToTracker(item.topic, item.questionId)}
                        className="btn-secondary text-[11px] px-3 py-1 flex items-center gap-1.5"
                      >
                        <i className={`fas ${addedTasks[item.questionId] ? 'fa-check text-emerald-400' : 'fa-plus'}`}></i>
                        <span>{addedTasks[item.questionId] ? 'Added to Tracker' : 'Add to Kanban Tracker'}</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom Navigation */}
            <div className="flex justify-between items-center text-xs font-mono text-muted pt-2 no-print">
              <Link to="/dashboard" className="hover-link">
                ← Return to Dashboard
              </Link>
              <Link to="/tracker" className="hover-link text-emerald-400 font-bold">
                Open Kanban Tasks →
              </Link>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
