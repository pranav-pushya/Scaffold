
# Scaffold — Technical Documentation & Engineering Reference Manual

> **Document Type**: Comprehensive Engineering Reference Manual & Viva Technical Guide
> **System Name**: `</S>caffold` — Developer Workspace & Identity OS
> **Course**: 25CSE0203 — Front End Engineering-II, Chitkara University
> **Evaluation Group**: Group 3G5 (Academic Year 2025–2026)
> **Live Production Deployment**: [https://scaffold-app-90278.web.app](https://scaffold-app-90278.web.app)
> **Primary Repository**: [https://github.com/pranav-pushya/Scaffold](https://github.com/pranav-pushya/Scaffold)
> **Document Status**: Production-Verified Source Reference

---

## 1. Project Overview

### 1.1 Conceptual Summary: What is Scaffold?

Modern software engineering students and junior developers face an identity fragmentation problem: their skills and contact info live in static text documents, their in-flight tasks are scribbled on random Kanban boards or Markdown files, their public proof-of-work is scattered across various GitHub repositories, and their resumes are formatted manually in word processors whenever job applications open. When a developer finishes a project or learns a new language, they must manually remember to update their resume, portfolio, LinkedIn, and personal website. Inevitably, things fall out of sync.

**Scaffold** is an all-in-one Developer Workspace and Identity Operating System designed to eliminate this fragmentation through an enforced **closed-loop data architecture**:

```text
[ Developer Profile ] ──► [ AI Suggestions ] ──► [ Kanban Tracker ]
         ▲                                                │
         │                                                ▼
[ ATS Resume Sheet ] ◄────────────────────────── [ Portfolio Showcase ]
```

In Scaffold, a developer enters their professional data **once** into a Cloud Firestore-backed profile store. From that single point of truth:

1. **Profile**: Defines core languages, modern frameworks, tools, education, bio, and target career roles.
2. **AI Suggestions**: An integrated Large Language Model reads the user's live profile attributes and recommends tailored project ideas, resume improvements, and system architecture blueprints.
3. **Kanban Tracker**: The developer plans and executes these deliverables across *To-Do*, *In Progress*, and *Done* stages.
4. **Portfolio Showcase**: Any card marked *Done* automatically flows into an interactive, public-facing developer portfolio complete with live demo links, repository tags, and categorized competencies.
5. **ATS Resume Sheet**: Both the verified profile data and completed project records compile instantly into a standardized, single-page ATS-optimized resume ready for native PDF printing.

If the developer updates their target role, adds a skill, or finishes a project in the tracker, that update propagates immediately to their Dashboard metrics, Portfolio showcase, and ATS Resume without re-typing.

---

### 1.2 Full Technical Stack

| Layer                             | Technology                                           | Version                  | Purpose in Codebase                                                                                           |
| --------------------------------- | ---------------------------------------------------- | ------------------------ | ------------------------------------------------------------------------------------------------------------- |
| **Core Framework**          | React (SPA)                                          | `^19.2.8`              | Component lifecycle, declarative UI rendering, virtual DOM state management                                   |
| **Client Routing**          | React Router DOM                                     | `^7.18.3`              | Declarative client-side routing, protected route guards, and history navigation                               |
| **Build & Tooling**         | Vite +`@vitejs/plugin-react`                       | `^5.4.21` / `^4.7.0` | Ultra-fast local dev server with HMR, asset minification, and Rollup bundling                                 |
| **Authentication**          | Firebase Authentication                              | `^12.17.1`             | User session persistence, Email/Password auth, Google OAuth 2.0 popup flows, password resets                  |
| **Database**                | Google Cloud Firestore                               | `^12.17.1`             | NoSQL document database (`profiles/{userId}` and `projects` subcollections) with forced HTTP long-polling |
| **Hosting Infrastructure**  | Firebase Hosting                                     | Production CLI           | Global CDN distribution with Single Page Application rewrite rules (`index.html`)                           |
| **AI / LLM Engine**         | Groq Cloud API                                       | REST Completions         | Ultra-low latency chat inference powered by`openai/gpt-oss-20b`                                             |
| **Styling & Design System** | Tailwind CSS + Custom Tokens                         | CSS3 Variables           | Multi-theme token engine (Dark obsidian, Light parchment, Cyber CRT scanlines)                                |
| **Typography & Icons**      | Space Grotesk, JetBrains Mono, Fraunces, FontAwesome | Web CDN / 6.4.0          | Monospace terminals, elegant display serif headings, and developer glyphs                                     |

---

### 1.3 Team Ownership & Module Responsibilities

Per Chitkara University Course Guidelines for Group 3G5:

| Team Member                      | Module Ownership                 | Core Managed Files & Technical Scope                                                                                                                                                                                                                                                                             |
| -------------------------------- | -------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Tiksha** *(Team Lead)* | UI/UX & Design Tokens            | Design system architecture,`styles/themes.css`, `styles/globals.css`, `Navbar.jsx`, `Footer.jsx`, `Home.jsx`, responsive media queries, cyber CRT scanlines, and animation tokens.                                                                                                                     |
| **Tammana**                | Routing, Forms & Page Logic      | Route configurations in`App.jsx`, `Login.jsx` authentication form, `Profile.jsx` controlled forms, `Dashboard.jsx` scoring logic, `Tracker.jsx` Kanban board, `Portfolio.jsx` showcase, and `Resume.jsx` ATS compilation.                                                                          |
| **Pranav Pushya**          | Firebase, State, AI & Deployment | Cloud Firestore integration (`src/firebase/*`), Context state providers (`AuthContext`, `ProfileContext`, `TrackerContext`, `ThemeContext`), Groq AI service (`aiService.js`), ambient copilot (`AiBubble.jsx`), `SettingsDrawer.jsx`, `CommandPalette.jsx`, and Firebase Hosting deployments. |

---

### 1.4 High-Level Application Architecture

The application is structured as a client-side Single Page Application (SPA) where context providers wrap the component tree, ensuring that state is accessible to all child routes without prop-drilling:

```text
                                 [ index.html ]
                                       │
                                 [ src/main.jsx ]
                                       │
                                 [ src/App.jsx ]
                                       │
            ┌──────────────────────────┴──────────────────────────┐
            ▼                                                     ▼
     Theme Context                                          Auth Context
  (Dark / Light / Cyber)                               (Firebase User & Tokens)
            │                                                     │
            └──────────────────────────┬──────────────────────────┘
                                       ▼
                              Profile Context
                      (User Profile Doc & Local Cache)
                                       │
                                       ▼
                              Tracker Context
                     (Project Cards Subcollection State)
                                       │
                                       ▼
                              [ BrowserRouter ]
                                       │
             ┌─────────────────────────┴─────────────────────────┐
             ▼                                                   ▼
     [ /boot Route ]                                     [ Layout.jsx ]
 (Kernel animation outside                         (Shared navigation, palette,
       shared layout)                               ambient copilot, and footer)
                                                                 │
                                             ┌───────────────────┴───────────────────┐
                                             ▼                                       ▼
                                       Public Routes                          Protected Routes
                                      (/, /login)                       (/dashboard, /profile, /tracker,
                                                                         /portfolio, /resume, /assistant)
```

- **Routing Model**: `App.jsx` organizes pages under a root `<BrowserRouter>`. When an unauthenticated visitor accesses a restricted page, `ProtectedRoute.jsx` intercepts the transition and redirects to `/login` while preserving the intended destination in `location.state.from`.
- **State Management**: React's built-in Context API handles four global concerns (`ThemeContext`, `AuthContext`, `ProfileContext`, `TrackerContext`). Fast initial renders are achieved via optimistic caching in browser `localStorage`, followed by asynchronous cloud reconciliation with Cloud Firestore.
- **Service Abstraction**: Network operations are strictly decoupled from React components. All database queries pass through `firestoreService.js`, authentication actions pass through `authService.js`, and AI prompts pass through `aiService.js`.

---

## 2. Feature-by-Feature Deep Dive

---

### 2.1 Boot Sequence (`/boot`)

#### a) What it does

When a user launches Scaffold for the first time in a browsing session, they are greeted by a simulated retro-futuristic Unix terminal sequence. Green monospace logs stream line-by-line down a terminal window, checking memory subsystems, Firebase handlers, local cache integrity, and theme engines before automatically routing the developer to their desired destination.

#### b) How it works

- **Trigger**: Inside `App.jsx`, a lightweight wrapper called `BootNavigator` intercepts the initial page load. If the path is not `/boot`, it stores the user's requested destination in `sessionStorage` (`scaffold_redirect_target`) and forces an immediate client-side redirection to `/boot`.
- **State Management**: `Boot.jsx` maintains an array of string messages (`logs`) and a boolean `animationFinished`. A series of `setTimeout` timers incrementally append lines from `BOOT_MESSAGES` at 350ms staggered intervals.
- **Route Resolution**: Once the log animation finishes and `AuthContext` finishes resolving its initial Firebase handshake (`loading === false`), an effect inspects `sessionStorage.getItem('scaffold_redirect_target')` and `localStorage.getItem('scaffold_default_landing')`. If the user is unauthenticated and attempting to visit a private route, they are routed to `/login`; otherwise, they land on their target page.

#### c) Actual code

From [`src/pages/Boot/Boot.jsx`](file:///d:/Coding/SEM3/FEE/Scaffold/scaffold/src/pages/Boot/Boot.jsx):

```javascript
// Staggered terminal logging and auto-redirection logic
const BOOT_MESSAGES = [
  '[OK] Initializing memory subsystems...',
  '[OK] Mounting Firestore & Firebase Auth handlers...',
  '[OK] Loading local cache stores (profileStore, trackerStore)...',
  '[OK] Security Captcha & Theme engine initialized...',
  '[READY] Scaffold kernel boot complete. Redirecting...'
];

export default function Boot() {
  const { currentUser, loading } = useAuth();
  const navigate = useNavigate();

  const [logs, setLogs] = useState([]);
  const [statusText, setStatusText] = useState('Verifying credentials & security modules...');
  const [animationFinished, setAnimationFinished] = useState(false);

  useEffect(() => {
    let timeouts = [];
    let delay = 250;

    BOOT_MESSAGES.forEach((msg, idx) => {
      const t = setTimeout(() => {
        setLogs((prev) => [...prev, msg]);

        if (idx === BOOT_MESSAGES.length - 1) {
          setStatusText('Redirecting...');
          setAnimationFinished(true);
        }
      }, delay);
      timeouts.push(t);
      delay += 350;
    });

    return () => timeouts.forEach((t) => clearTimeout(t));
  }, []);

  // When animation finishes and auth is loaded, redirect
  useEffect(() => {
    if (!animationFinished || loading) return;

    const timer = setTimeout(() => {
      let target = sessionStorage.getItem('scaffold_redirect_target') || '/';
      sessionStorage.removeItem('scaffold_redirect_target');
      if (target === '/boot') target = '/';
      if (target === '/') {
        try {
          const preferredLanding = localStorage.getItem('scaffold_default_landing');
          if (preferredLanding) target = preferredLanding;
        } catch (e) {}
      }

      if (!currentUser) {
        // Known protected routes redirect unauthenticated users to /login
        const protectedRoutes = ['/dashboard', '/profile', '/tracker', '/portfolio', '/resume', '/assistant'];
        const isProtected = protectedRoutes.some((route) => target === route || target.startsWith(`${route}?`) || target.startsWith(`${route}/`));
        navigate(isProtected ? '/login' : target, { replace: true });
      } else {
        navigate(target, { replace: true });
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [animationFinished, loading, currentUser, navigate]);
```

---

### 2.2 Authentication: Login & Signup (`/login`)

#### a) What it does

The Authentication module provides secure access control for developers. It supports standard Email/Password authentication, Google OAuth 2.0 Single Sign-On, a self-service password reset email modal, and an active session account portal. When an already logged-in user navigates to `/login`, instead of displaying a redundant login form, Scaffold displays an "Account Portal" showing their verified display name, email, UID, links to their profile, and an instant sign-out action.

#### b) How it works

- **Security Check (Arithmetic Challenge)**: To prevent automated submission spam without relying on invasive commercial trackers, `generateCaptcha()` produces two random integers (`num1 + num2`). Submissions are rejected client-side if the evaluated answer does not match `captcha.expected` (see `report.md` §6.8).
- **Authentication Flows**:
  - `loginWithEmail(email, password)`: Delegates to Firebase SDK's `signInWithEmailAndPassword(auth, email, password)`.
  - `signUpWithEmail(email, password, name)`: Calls `createUserWithEmailAndPassword`, then calls `updateProfile(user, { displayName: name })`.
  - `loginWithGoogle()`: Launches `signInWithPopup(auth, new GoogleAuthProvider())`.
  - `resetPassword(email)`: Calls Firebase's `sendPasswordResetEmail(auth, email.trim())`.
- **Password Visibility Toggles**: Independent boolean states (`showPassword`, `showConfirmPassword`) toggle `<input type={showPassword ? "text" : "password"}>` with FontAwesome eye icons.

#### c) Actual code

From [`src/pages/Login/Login.jsx`](file:///d:/Coding/SEM3/FEE/Scaffold/scaffold/src/pages/Login/Login.jsx):

```javascript
// Arithmetic Security Check & Auth Submission
function generateCaptcha() {
  const num1 = Math.floor(Math.random() * 9) + 1;
  const num2 = Math.floor(Math.random() * 9) + 1;
  return { num1, num2, expected: num1 + num2 };
}

const handleSubmit = async (e) => {
  e.preventDefault();
  setError('');
  setResetMessage('');

  // If Sign Up, validate passwords match before proceeding
  if (mode === 'signup' && password !== confirmPassword) {
    setError('Passwords do not match');
    return;
  }

  // Captcha validation
  if (parseInt(captchaAnswer, 10) !== captcha.expected) {
    setError('Captcha verification failed. Please try again.');
    setCaptcha(generateCaptcha());
    setCaptchaAnswer('');
    return;
  }

  setIsSubmitting(true);
  try {
    if (mode === 'signup') {
      await signUpWithEmail(email, password, name);
    } else {
      await loginWithEmail(email, password);
    }
    const destination = location.state?.from?.pathname || '/';
    navigate(destination, { replace: true });
  } catch (err) {
    setError(err.message || 'Authentication failed. Please try again.');
    setCaptcha(generateCaptcha());
    setCaptchaAnswer('');
  } finally {
    setIsSubmitting(false);
  }
};
```

---

### 2.3 Home Page (`/`)

#### a) What it does

The Home page serves as the public gateway and landing display for Scaffold. It features an interactive cyber-themed hero banner, an automated looping typewriter greeting terminal, dynamic mouse-tracking radial glow effects, architectural badges, and quick-launch buttons directing visitors to the Dashboard or Account Portal.

#### b) How it works

- **Typewriter Effect**: An asynchronous state loop cycles through an array of developer phrases (`"hello, developer."`, `"you found </S>caffold."`, etc.). A `tick()` function calculates substring slices using `setTypewriterText(current.slice(0, cIdx))` with randomized typing delays (75ms–125ms) and pause intervals (2200ms) before backspacing.
- **Interactive Mouse Glow**: `onMouseMove` calculates the cursor's local coordinates relative to the bounding box of the hero section (`e.clientX - rect.left`, `e.clientY - rect.top`) and repositions a radial gradient element (`#mouseGlow`) with zero DOM lag.
- **Navigation Shortcuts**: Features prominent CTA buttons that route to `/dashboard` (which triggers auth checks) or `/login` (which opens the Account Portal for active sessions).

#### c) Actual code

From [`src/pages/Home/Home.jsx`](file:///d:/Coding/SEM3/FEE/Scaffold/scaffold/src/pages/Home/Home.jsx):

```javascript
// Looping typewriter state machine & mouse glow handler
useEffect(() => {
  const greetings = [
    "hello, developer.",
    "you found </S>caffold.",
    "welcome to developers dashboard.",
    "architected for modern engineers.",
    "console.log('system operational.');",
  ];
  let gIdx = 0;
  let cIdx = 0;
  let deleting = false;
  let timeoutId;

  function tick() {
    const current = greetings[gIdx];
    if (deleting) {
      cIdx--;
      setTypewriterText(current.slice(0, cIdx));
      if (cIdx === 0) {
        deleting = false;
        gIdx = (gIdx + 1) % greetings.length;
        timeoutId = setTimeout(tick, 400);
        return;
      }
      timeoutId = setTimeout(tick, 35);
    } else {
      cIdx++;
      setTypewriterText(current.slice(0, cIdx));
      if (cIdx === current.length) {
        deleting = true;
        timeoutId = setTimeout(tick, 2200);
        return;
      }
      timeoutId = setTimeout(tick, 75 + Math.random() * 50);
    }
  }

  tick();
  return () => clearTimeout(timeoutId);
}, []);
```

---

### 2.4 Dashboard (`/dashboard`)

#### a) What it does

The Dashboard acts as the central command center for the developer's growth and deliverables. It displays:

1. An individualized welcome hero with experience-level badges.
2. A mathematical **Profile Readiness Index (0–100%)**.
3. A real-time **ATS Resume Optimization Score (0–100 Index)** with letter grades (A/B/C/D).
4. Kanban deliverable counters (Total, In Progress, Completed).
5. Quick action cards connecting to the AI Assistant and Project Inspiration modal.

#### b) How it works

- **Parallel Data Ingestion**: When mounted, the Dashboard runs `Promise.all([loadProfile(userId), loadProjects(userId)])`. If Firestore requests exceed 3 seconds on slow connections, a soft warning notice informs the user while cached records display immediately.
- **Readiness Scoring Algorithm**: Evaluates 14 critical developer profile fields (name, email, phone, location, target role, bio, core languages, frameworks, dev tools, degree, institution, GitHub, LinkedIn, experience). Readiness equals:

  $$
  \text{Readiness \%} = \text{round}\left(\frac{\text{filledFields}}{14} \times 100\right)
  $$
- **ATS Optimization Index**: Evaluates both profile completeness and actual proof-of-work (projects created):

  $$
  \text{ATS Score} = \min\left(100, \, \text{round}(\text{Readiness} \times 0.75 + (\text{projects} \ge 1 \,?\, 15 : 0) + (\text{projects} \ge 3 \,?\, 10 : 0))\right)
  $$

  - Score $\ge 80 \implies$ **Grade A • Excellent** (`#10b981`)
  - Score $\ge 60 \implies$ **Grade B • Good** (`#3b82f6`)
  - Score $\ge 40 \implies$ **Grade C • Fair** (`#f59e0b`)
  - Score $< 40 \implies$ **Grade D • Needs Work** (`#ef4444`)

#### c) Actual code

From [`src/pages/Dashboard/Dashboard.jsx`](file:///d:/Coding/SEM3/FEE/Scaffold/scaffold/src/pages/Dashboard/Dashboard.jsx):

```javascript
// Mathematical Scoring Engine for Profile Readiness and ATS Index
const profileFields = [
  profile?.fullName, profile?.email, profile?.phone, profile?.location,
  profile?.targetRole, profile?.bio, profile?.coreLanguages, profile?.frameworks,
  profile?.devTools, profile?.degree, profile?.institution, profile?.githubUrl,
  profile?.linkedinUrl, profile?.experience
];
const filledCount = profileFields.filter(Boolean).length;
const readinessPercent = Math.round((filledCount / profileFields.length) * 100);

// ATS Score calculation factoring in verified deliverables
const projectList = Array.isArray(projects) ? projects : [];
let atsScore = Math.round(
  (readinessPercent * 0.75) + 
  (projectList.length >= 1 ? 15 : 0) + 
  (projectList.length >= 3 ? 10 : 0)
);
if (atsScore > 100) atsScore = 100;

let gradeText = 'Grade D • Needs Work';
let gradeColor = '#ef4444';
if (atsScore >= 80) {
  gradeText = 'Grade A • Excellent';
  gradeColor = '#10b981';
} else if (atsScore >= 60) {
  gradeText = 'Grade B • Good';
  gradeColor = '#3b82f6';
} else if (atsScore >= 40) {
  gradeText = 'Grade C • Fair';
  gradeColor = '#f59e0b';
}
```

---

### 2.5 Profile Management Hub (`/profile`)

#### a) What it does

The Profile Hub is the primary data ingestion point for the developer's career identity. It is a controlled multi-section form that records contact information, career objectives, technical competencies (languages, frameworks, tools), education credentials, academic metrics (CGPA, coursework), social handles (GitHub, LinkedIn, Portfolio), and work history. It also supports local avatar photo uploads with a modal preview.

#### b) How it works

- **State Management**: `Profile.jsx` initializes a state object containing 24 discrete attributes. Form inputs are controlled via a shared `handleChange` function mapped by field name.
- **Image Processing**: Avatar photos are read through the HTML5 `FileReader` API (`readAsDataURL`) and compressed directly into a base64 DataURL string stored within the document payload, avoiding the need for an external object storage bucket.
- **Two-Tier Synchronization**: When clicking "Save Profile", the application executes:
  1. `saveProfile(userId, formData)`: Writes the document to Cloud Firestore at `profiles/{userId}` with an updated ISO timestamp.
  2. `saveProfileData(userId, formData)`: Writes immediately to `localStorage` (`scaffold_profile_store_${userId}`) and updates `ProfileContext` state, ensuring zero-latency updates across all other open pages.
- **Toast Notifications**: An auto-dismissing toast (`triggerToast`) alerts the user with confirmation of successful cloud synchronization.

#### c) Actual code

From [`src/pages/Profile/Profile.jsx`](file:///d:/Coding/SEM3/FEE/Scaffold/scaffold/src/pages/Profile/Profile.jsx):

```javascript
// Profile form submission and photo FileReader processing
const handlePhotoUpload = (e) => {
  const file = e.target.files?.[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (event) => {
    const dataUrl = event.target?.result;
    if (dataUrl) {
      setFormData((prev) => ({ ...prev, photoUrl: dataUrl }));
      triggerToast('✓ Photo updated! Remember to save profile.');
    }
  };
  reader.readAsDataURL(file);
};

const handleSubmit = async (e) => {
  e.preventDefault();
  const userId = currentUser?.uid;

  if (!userId) {
    alert('You must be logged in to save your profile.');
    return;
  }

  setIsSaving(true);
  try {
    await saveProfile(userId, formData);
    await saveProfileData(userId, formData);
    triggerToast('✓ Profile successfully saved to Cloud Firestore!');
  } catch (err) {
    console.error('Profile save failure:', err);
    triggerToast('❌ Failed to save to Firestore. Stored locally.');
  } finally {
    setIsSaving(false);
  }
};
```

---

### 2.6 Kanban Project Tracker (`/tracker`)

#### a) What it does

The Tracker is an interactive project board organized into three workflow columns: **To-Do**, **In Progress**, and **Done**. Developers can add projects, tag technologies, provide live deployment and repository URLs, update delivery status via dropdowns or edit modals, and delete completed records. It includes live search filtering and shortcut integration.

#### b) How it works

- **Status Normalization**: Because project data can be entered in various formats, `normalizeStatus(status)` cleanly maps incoming strings into exactly `'To-Do'`, `'In Progress'`, or `'Done'` using regex string matching.
- **Data Partitioning**: The project list from `TrackerContext` is filtered by the user's active search query (`searchQuery`), then partitioned into three separate column buckets:
  - `todoCards = filteredList.filter(p => normalizeStatus(p.status) === 'To-Do')`
  - `inProgressCards = filteredList.filter(p => normalizeStatus(p.status) === 'In Progress')`
  - `doneCards = filteredList.filter(p => normalizeStatus(p.status) === 'Done')`
- **Subcollection Persistence**: Projects are stored in Firestore as individual documents under the subcollection path:
  `/profiles/{userId}/projects/{projectId}`
- **Accelerated Project Creation**: If a user presses `Alt + N` anywhere in Scaffold, `useGlobalShortcuts` routes to `/tracker?new=1`. `Tracker.jsx` parses query parameters on mount and opens the card creation modal automatically.

#### c) Actual code

From [`src/pages/Tracker/Tracker.jsx`](file:///d:/Coding/SEM3/FEE/Scaffold/scaffold/src/pages/Tracker/Tracker.jsx):

```javascript
// Status Normalization and Column Partitioning
export const normalizeStatus = (status) => {
  if (!status) return 'To-Do';
  const s = String(status).trim().toLowerCase();
  if (s.includes('progress')) return 'In Progress';
  if (s.includes('done') || s.includes('complete')) return 'Done';
  return 'To-Do';
};

// Submitting a new or edited card to TrackerContext & Firestore
const handleFormSubmit = async (e) => {
  e.preventDefault();
  if (!userId) {
    alert('You must be logged in to manage projects.');
    return;
  }

  setIsSubmitting(true);
  try {
    if (isEditing && editId) {
      const updated = { id: editId, ...cardForm };
      await updateProject(userId, updated);
      if (userId) await updateFirestoreProject(userId, updated).catch(() => {});
    } else {
      await addProject(userId, cardForm);
      if (userId) await saveProject(userId, cardForm).catch(() => {});
    }

    setCardForm(initialCardState);
    setEditId(null);
    setIsEditing(false);
    setShowForm(false);
  } catch (err) {
    console.error('Failed to save card:', err);
    alert(`Error saving card: ${err.message || err}`);
  } finally {
    setIsSubmitting(false);
  }
};
```

---

### 2.7 Portfolio Showcase (`/portfolio`)

#### a) What it does

The Portfolio is an automated, public-ready showcase that transforms raw profile attributes and completed tracker projects into a presentation website for hiring managers and technical recruiters. It displays the developer's avatar, status, tagline, bio, contact links, categorized skill pills (Core Languages, Frameworks, Developer Tools), and interactive project cards with direct GitHub and live deployment links.

#### b) How it works

- **Zero Redundant Data Entry**: The Portfolio does not maintain its own database table. Instead, it reads directly from `useProfile()` and `useTracker()`. Any change made in `/profile` or `/tracker` is reflected in `/portfolio` without manual copy-pasting.
- **Skill String Parsing**: Comma-delimited skill strings from the profile (`"React, Vue, Node.js"`) are split, trimmed, and rendered as discrete styled badge tags.
- **Public/Private Visibility Guard**: Controlled via the Settings Drawer (`scaffold_portfolio_visibility`). When toggled to *Private*, external preview is restricted; when *Public*, the showcase can be shared directly via the URL `/portfolio`.
- **Photo Modal Preview**: Clicking the avatar photo toggles a high-resolution modal overlay with backdrop blur.

#### c) Actual code

From [`src/pages/Portfolio/Portfolio.jsx`](file:///d:/Coding/SEM3/FEE/Scaffold/scaffold/src/pages/Portfolio/Portfolio.jsx):

```javascript
// Reading profile and tracker data to populate portfolio showcase
export default function Portfolio() {
  const { currentUser } = useAuth();
  const { profile, loadProfile } = useProfile();
  const { projects, loadProjects } = useTracker();

  // Parse skill strings into structured badge arrays
  const coreLangs = profile?.coreLanguages
    ? profile.coreLanguages.split(',').map((s) => s.trim()).filter(Boolean)
    : [];
  const frameworks = profile?.frameworks
    ? profile.frameworks.split(',').map((s) => s.trim()).filter(Boolean)
    : [];
  const devTools = profile?.devTools
    ? profile.devTools.split(',').map((s) => s.trim()).filter(Boolean)
    : [];

  const projectList = Array.isArray(projects) ? projects : [];
  // Project cards map repoUrl, deployUrl, tech tags, and status automatically
```

---

### 2.8 ATS Resume Sheet (`/resume`)

#### a) What it does

The Resume module compiles the developer's data into a strict, single-page, ATS-compliant (Applicant Tracking System) resume. It completely strips away non-standard graphic elements, avatars, and complex colors, arranging data into clean sections: Contact Header, Executive Summary, Technical Competencies, Deliverables & Projects, and Education & Credentials. It includes a native **"Print / Save as PDF"** button.

#### b) How it works

- **Browser-Native PDF Generation**: Rather than bundling heavy third-party JavaScript PDF generation libraries (such as `jspdf` or `html2pdf`), which would bloat client bundles by ~300KB, Scaffold leverages native browser `window.print()` combined with tailored `@media print` CSS rules in `resume.css`.
- **Print Stylesheet Isolation**: All navigation bars, action banners, theme toggles, floating AI bubbles, and footers are tagged with `.no-print` and styled with `display: none !important;`. The `.resume-sheet` resets background colors to pure white, text to dense `#111827`, and enforces strict page-break avoidance (`break-inside: avoid;`).

#### c) Actual code

From [`src/pages/Resume/Resume.jsx`](file:///d:/Coding/SEM3/FEE/Scaffold/scaffold/src/pages/Resume/Resume.jsx) and `resume.css`:

```javascript
// Triggering native print engine with sanitized media styles
const handlePrint = () => {
  window.print();
};

// Render structure: Action Bar (.no-print) + Clean Document Sheet (.resume-sheet)
<div className="no-print flex items-center justify-between gap-3 p-4 rounded-xl border">
  <button
    id="printResumeBtn"
    type="button"
    onClick={handlePrint}
    className="btn-primary text-xs px-5 py-2"
    style={{ background: '#10b981', color: '#fff' }}
  >
    <i className="fas fa-print mr-1"></i> Print / Save as PDF
  </button>
</div>

<div className="resume-sheet space-y-6">
  {/* Standardized ATS document structure */}
</div>
```

```css
/* resume.css - Strict print engine isolation rules */
@media print {
  .no-print, header, footer, #aiBubbleBtn, #aiBubblePanel {
    display: none !important;
  }
  body {
    background: #ffffff !important;
    color: #000000 !important;
  }
  .resume-sheet {
    box-shadow: none !important;
    border: none !important;
    padding: 0 !important;
    margin: 0 !important;
    width: 100% !important;
  }
}
```

---

### 2.9 AI Assistant: Deep-Work Console (`/assistant`)

#### a) What it does

The AI Assistant is a dedicated, full-page generative intelligence workstation designed for deep career coaching and software engineering design. It features four dedicated coaching modes:

1. **ATS Resume Coach (`career`)**: Audits resume bullet points, spots missing keywords, and optimizes action verbs.
2. **Project Inspiration (`ideas`)**: Analyzes the user's missing skills and proposes 3 ambitious full-stack project blueprints.
3. **Portfolio Bio Writer (`bio`)**: Generates charismatic, first-person developer bios tailored to their experience level.
4. **System Architecture (`architecture`)**: Generates 5-part end-to-end system design specifications (Database Schema, API Endpoints, Caching Strategy, Edge-Cases, and Scaling).

#### b) How it works

- **Context Injection**: Before dispatching a prompt to Groq AI, `Assistant.jsx` inspects `ProfileContext` and `TrackerContext`. It constructs an exhaustive system prompt containing the developer's full name, target role, technical skills, profile bio, and a JSON dump of their active Kanban projects.
- **Unified Service Layer**: Calls `callGroqChat()` in `src/services/aiService.js`, targeting the ultra-fast `openai/gpt-oss-20b` model hosted on Groq Cloud.
- **Graceful Fallback**: If `VITE_GROQ_API_KEY` is not present, `generateFallbackResponse(query, mode)` supplies comprehensive pre-computed architectural templates so the UI never breaks during offline demonstrations.

#### c) Actual code

From [`src/pages/Assistant/Assistant.jsx`](file:///d:/Coding/SEM3/FEE/Scaffold/scaffold/src/pages/Assistant/Assistant.jsx):

```javascript
// Context-Aware System Prompt Construction & Groq Execution
const fetchGroqCompletion = async (promptText, currentMode) => {
  const apiKey = getGroqApiKey();
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
Provide deep, production-ready analysis. If in 'architecture' mode, format with 5 structured sections (Data Models, APIs, Caching, Edge Cases, Scaling). Format using clean markdown code blocks.`;

  const rawAiResponse = await callGroqChat({
    messages: [{ role: 'user', content: promptText }],
    systemPrompt,
    temperature: 0.5
  });

  return formatMarkdownToHtml(rawAiResponse);
};
```

---

### 2.10 Ambient Floating AI Copilot (`AiBubble.jsx`)

#### a) What it does

`AiBubble` is a lightweight, circular copilot pinned to the bottom-right corner of every screen across the shared application layout. It acts as an ambient concierge: users can click it (or press `Alt + A`) from any page to get instant answers about their current ATS score, number of completed projects, keyboard shortcut reminders, or site features without navigating away from their work.

#### b) How it works

- **Dual-Tier AI Architecture (Viva Defense)**: Scaffold intentionally implements two distinct AI touchpoints:
  - `Assistant.jsx`: Full-page deep-work console for heavy generative work (system design, full resume rewrite).
  - `AiBubble.jsx`: Ambient quick-help concierge for instant site navigation, data queries, and shortcut lookups.
- **Zero-Latency Static Knowledge Engine**: Before dispatching network requests, `checkInstantKnowledge(rawQuery)` inspects user questions. Inquiries about full screen mode, ATS metrics, completed project counts, public portfolio toggles, or keyboard shortcuts resolve immediately from local state with zero API delay.
- **Strict Ambient Guardrails**: If an off-topic query (*"what is React"*, *"explain closures"*) or a deep-work query (*"write my entire resume"*) is submitted, the copilot provides a polite notification and guides the user to the dedicated Assistant page.

#### c) Actual code

From [`src/components/AiBubble.jsx`](file:///d:/Coding/SEM3/FEE/Scaffold/scaffold/src/components/AiBubble.jsx):

```javascript
// Instant Local Knowledge Lookup & Strict Guardrails
const checkInstantKnowledge = (rawQuery) => {
  const q = rawQuery.toLowerCase().trim();

  // Full Screen Mode Instant Shortcut Answer
  if (q.includes('full screen') || q.includes('fullscreen')) {
    return {
      matched: true,
      html: `<div class="space-y-1.5 text-xs">
        <p class="font-bold text-emerald-400">🖥️ Full Screen Mode:</p>
        <p class="text-muted">Press <kbd class="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono text-[11px]">Alt + F</kbd> anywhere in Scaffold to toggle full screen!</p>
      </div>`
    };
  }

  // Live ATS Score Snapshot
  if (q.includes('ats') || q.includes('readiness')) {
    return {
      matched: true,
      html: `<div class="space-y-1.5 text-xs">
        <p class="font-bold text-emerald-400">📊 ATS Score Snapshot:</p>
        <div>• <strong>ATS Score:</strong> <span class="text-emerald-400 font-bold">${atsMetrics.score}/100</span></div>
        <div>• <strong>Profile Readiness:</strong> ${atsMetrics.readiness}%</div>
      </div>`
    };
  }

  // Off-topic generic coding question redirect
  const isOffTopic = q.includes('what is react') || q.includes('what is javascript') || q.includes('closure');
  if (isOffTopic) {
    return {
      matched: true,
      html: `<p class="text-xs text-muted">I can only help with things inside Scaffold — try asking about your profile, tracker, or visit the full <a href="/assistant" class="text-amber-400 underline font-semibold">Assistant page</a> for general coding help.</p>`
    };
  }

  return { matched: false };
};
```

---

### 2.11 Workspace Settings Slide-Over Drawer (`SettingsDrawer.jsx`)

#### a) What it does

Accessible via the navbar gear icon or pressing `?` / `Shift + /`, the Settings Drawer provides a comprehensive control panel for data management, appearance customization, cloud sync audits, and system diagnostics.

#### b) How it works

- **JSON Data Backup & Restore**:
  - **Export JSON**: Packages `profile`, `tracker_projects`, and user preferences into a portable JSON file (`scaffold-workspace-backup-[date].json`) and triggers an automatic browser blob download.
  - **Import JSON**: Uses `FileReader` to read uploaded JSON backup files, validates the structure, restores entries into `localStorage`, and offers a one-click reload button.
  - **Purge Cache**: Clears client `localStorage` caches (`scaffold_profile_store`, `scaffold_tracker_store`) without altering authenticated cloud records in Cloud Firestore.
- **Appearance & UX**:
  - **Reduce Motion & Glow**: Toggles `body.classList.toggle('reduce-motion')`, suppressing ambient CSS dot float animations, mouse glow, and CRT scanlines for low-power hardware.
  - **Compact Density Mode**: Toggles `body.classList.toggle('compact-density')`, compressing padding across tables and Kanban columns.
  - **Default Landing Route**: Saves preferred startup route (`/`, `/dashboard`, or `/tracker`) to `scaffold_default_landing`.
- **Honest Cloud Sync Audit**: Accurately reports connection state (`Status: Synced`, `Status: Syncing...`, or `Status: Local Only`) and provides a genuine **"Sync Now"** button executing live `getProfile` and `getProjects` fetches (see `report.md` §6.16).
- **System Diagnostics**: Real-time monitor calculating exact `localStorage` footprint in kilobytes.

#### c) Actual code

From [`src/components/SettingsDrawer.jsx`](file:///d:/Coding/SEM3/FEE/Scaffold/scaffold/src/components/SettingsDrawer.jsx):

```javascript
// Exporting complete workspace state to a JSON file blob
const handleExportData = () => {
  try {
    const exportObject = {
      scaffold_version: '1.2.0-react',
      export_timestamp: new Date().toISOString(),
      user_email: currentUser?.email || 'guest',
      profile: JSON.parse(localStorage.getItem('scaffold_profile_store') || '{}'),
      tracker_projects: JSON.parse(localStorage.getItem('scaffold_tracker_store') || '[]'),
      settings: {
        theme: localStorage.getItem('scaffold-theme') || 'dark',
        portfolio_visibility: localStorage.getItem('scaffold_portfolio_visibility') || 'public',
        reduce_motion: localStorage.getItem('scaffold_reduce_motion') === 'true',
        compact_mode: localStorage.getItem('scaffold_compact_mode') === 'true',
        default_landing: localStorage.getItem('scaffold_default_landing') || '/'
      }
    };

    const jsonStr = JSON.stringify(exportObject, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const blobUrl = URL.createObjectURL(blob);
    const dlAnchor = document.createElement('a');
    dlAnchor.href = blobUrl;
    dlAnchor.download = `scaffold-workspace-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(dlAnchor);
    dlAnchor.click();
    document.body.removeChild(dlAnchor);
    URL.revokeObjectURL(blobUrl);
  } catch (err) {
    console.error('Data export error:', err);
  }
};
```

---

### 2.12 Global Command Palette (`CommandPalette.jsx`)

#### a) What it does

Triggered globally via `Ctrl + K` or `/`, the Command Palette is a keyboard-first spotlight navigation and execution modal. Developers can search across all pages, trigger quick actions (add project, export PDF, toggle full screen, sign out), and change themes without removing their hands from the keyboard.

#### b) How it works

- **Modal Scroll Isolation**: To prevent background scrolling while navigating commands, the palette sets `document.body.style.overflow = 'hidden'` and attaches passive wheel listeners that trap scrolling strictly inside `listRef`.
- **Keyboard Navigation Engine**:
  - `ArrowDown` / `ArrowUp`: Increments or decrements `selectedIndex` with circular wrapping (`% filteredCommands.length`).
  - `selectedEl.scrollIntoView({ block: 'nearest' })`: Automatically scrolls long lists so the active item remains visible.
  - `Enter`: Executes the selected command's `action()` callback and closes the palette.
  - `Escape`: Closes the palette cleanly.
- **Fuzzy Search**: A `useMemo` filter searches queries across command titles, descriptions, categories, and hardware shortcuts.

#### c) Actual code

From [`src/components/CommandPalette.jsx`](file:///d:/Coding/SEM3/FEE/Scaffold/scaffold/src/components/CommandPalette.jsx):

```javascript
// Keyboard event listener & auto-scroll inside Command Palette
const handleKeyDown = (e) => {
  if (e.key === 'Escape') {
    e.preventDefault();
    onClose();
    return;
  }
  if (e.key === 'ArrowDown') {
    e.preventDefault();
    setSelectedIndex((prev) => (prev + 1) % Math.max(1, filteredCommands.length));
  } else if (e.key === 'ArrowUp') {
    e.preventDefault();
    setSelectedIndex((prev) => (prev - 1 + filteredCommands.length) % Math.max(1, filteredCommands.length));
  } else if (e.key === 'Enter') {
    e.preventDefault();
    const target = filteredCommands[selectedIndex];
    if (target) {
      onClose();
      target.action();
    }
  }
};
```

---

### 2.13 Multi-Theme Token Engine (`ThemeContext.jsx` & `themes.css`)

#### a) What it does

Scaffold includes an instant-switching three-tier design system:

1. **Dark Mode**: Warm obsidian black background (`#0c0b09`), amber accent (`#f59e0b`), and soft cream foreground text.
2. **Light Mode**: High-readability daylight parchment (`#f3ecdc`), terra-cotta accent (`#c2410c`), and dark charcoal text.
3. **Cyber Mode**: Retro CRT terminal aesthetic featuring phosphor green text (`#4eff96`), bright yellow accent (`#ffea00`), and horizontal scanlines.
   Pressing <kbd>T</kbd> anywhere in Scaffold instantly cycles to the next theme.

#### b) How it works

- **DOM Token Switching**: `ThemeContext` updates the root HTML element with `document.documentElement.setAttribute('data-theme', newTheme)`.
- **Smooth Animation Class**: When toggled, `document.body.classList.add('theme-anim')` activates a 600ms cubic-bezier transition across background, color, and border tokens, removing the class after 700ms to eliminate rendering overhead during regular scrolling.
- **Hardware Keystroke Listener**: A global `keydown` event listener monitors key `T`/`t`. If the active focused element is not an `<input>`, `<textarea>`, or content-editable field, it cycles to the next theme in the array `['dark', 'light', 'cyber']`.

#### c) Actual code

From [`src/context/ThemeContext.jsx`](file:///d:/Coding/SEM3/FEE/Scaffold/scaffold/src/context/ThemeContext.jsx):

```javascript
// Theme Cycle state updater and global 'T' shortcut listener
export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(() => {
    try {
      const saved = localStorage.getItem('scaffold-theme');
      if (saved && ['dark', 'light', 'cyber'].includes(saved)) return saved;
    } catch (e) {}
    return 'dark';
  });

  const cycleTheme = useCallback(() => {
    setThemeState((currentTheme) => {
      const THEMES = ['dark', 'light', 'cyber'];
      const nextIndex = (THEMES.indexOf(currentTheme) + 1) % THEMES.length;
      const nextTheme = THEMES[nextIndex];

      if (typeof document !== 'undefined') {
        document.body.classList.add('theme-anim');
        setTimeout(() => document.body.classList.remove('theme-anim'), 700);
        document.documentElement.setAttribute('data-theme', nextTheme);
      }
      localStorage.setItem('scaffold-theme', nextTheme);
      return nextTheme;
    });
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable) {
        return;
      }
      if (e.key === 't' || e.key === 'T') {
        cycleTheme();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [cycleTheme]);
```

---

### 2.14 Additional Core Features

#### 1. Route Protection & Auth Lifecycle (`ProtectedRoute.jsx` & `AuthContext.jsx`)

- **What it does**: Restricts access to sensitive pages (`/dashboard`, `/profile`, `/tracker`, `/portfolio`, `/resume`, `/assistant`). If an unauthenticated user accesses these URLs, they are redirected to `/login`.
- **How it works**: Inspects `loading` and `currentUser` from `useAuth()`. While Firebase Auth initializes its asynchronous token exchange, it renders a monospace `Authenticating...` loader, preventing layout flashing or false redirects (see `report.md` §6.11).
- **Code snippet** ([`src/components/ProtectedRoute.jsx`](file:///d:/Coding/SEM3/FEE/Scaffold/scaffold/src/components/ProtectedRoute.jsx)):

```javascript
export function ProtectedRoute({ children }) {
  const { currentUser, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh', fontFamily: 'monospace' }}>
        <span>Authenticating...</span>
      </div>
    );
  }

  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}
```

#### 2. Global Keyboard Accelerators (`useGlobalShortcuts.js`)

- **What it does**: Provides a centralized hardware listener for quick navigation and shortcuts across the entire operating system.
- **How it works**: Attaches a single keydown listener to `window`. It distinguishes between typing inside input fields and global keyboard commands:
  - `Alt + 1` through `Alt + 7`: Direct page jumps (`/`, `/dashboard`, `/profile`, `/tracker`, `/portfolio`, `/resume`, `/assistant`).
  - `Alt + F`: Native Full Screen toggle.
  - `Alt + N`: Quick add card modal on tracker.
  - `Alt + E` / `Ctrl + P`: Resume print export.
  - `Alt + A`: Ambient AI copilot prompt focus.
  - `Alt + L`: Sign out confirmation modal.
  - `Ctrl + K` or `/`: Opens Command Palette.
  - `?`: Slides out Settings Drawer.

#### 3. Native Full Screen Engine (`Layout.jsx`)

- **What it does**: Allows developers to maximize Scaffold into an immersive, distraction-free IDE experience.
- **How it works**: Uses the HTML5 Fullscreen API (`document.documentElement.requestFullscreen()` and `document.exitFullscreen()`). A reactive state (`isFullScreen`) syncs with the window's `fullscreenchange` event and conditionally renders an on-screen floating exit badge at the top-right (`Exit Full Screen (Alt+F)`).

#### 4. Shared Application Shell (`Layout.jsx`, `Navbar.jsx`, `Footer.jsx`)

- **What it does**: Enforces visual consistency and provides accessibility landmarks across all sub-pages.
- **How it works**: `Layout.jsx` renders the fixed blur header (`Navbar.jsx`), active route slot (`<Outlet />`), universal footer (`Footer.jsx`), and overlays (`AiBubble`, `CommandPalette`, `SettingsDrawer`).

---

### 2.15 Custom 404 Route Resolution Failure Page (`NotFound.jsx` & `notfound.css`)

#### a) What it does

The Custom 404 Not Found page provides a graceful, terminal-themed diagnostic interface when a user or recruiter accesses an invalid or non-existent URL (e.g. `/xyz`, `/admin`, `/unknown-page`). Rather than crashing, redirecting unexpectedly to the login portal, or showing a blank page, it displays an error screen consistent with Scaffold's developer-centric terminal aesthetic.

Features:
- **Terminal Diagnostic Aesthetic**: Displays window action pills (red/yellow/green), a mock command invocation (`curl -I https://scaffold.dev{pathname}`), and simulated HTTP/2 response status.
- **Dynamic Path Detection**: Extracts the exact invalid path using React Router's `useLocation().pathname` and renders it in an styled code badge.
- **Quick Recovery Navigation**: Offers two primary actions wrapped with React Router `<Link>`:
  - **"Go Home"** (`/`)
  - **"Go to Dashboard"** (`/dashboard`)
- **Document Title Lifecycle Management**: Dynamically sets `document.title` to `404 — Page Not Found | Scaffold` on mount, and restores previous title upon unmount.
- **Theme Design System Integration**: Uses design tokens from `styles/themes.css` (`var(--card)`, `var(--border-strong)`, `var(--accent)`, `var(--code-bg)`, `var(--fg)`) rather than hardcoded hex colors, automatically supporting Dark, Light, and Cyber terminal themes.
- **Universal Layout Integration**: Mounted inside the shared `<Layout />` shell without `ProtectedRoute` restrictions, ensuring unauthenticated visitors, guest reviewers, and logged-in developers all see the page with working navigation headers and footers.

#### b) How it works

1. **SPA Rewrites & Routing Fallback**: `firebase.json` specifies `"source": "**", "destination": "/index.html"`, so direct browser requests to invalid subpaths serve the Single Page Application bundle. In `src/App.jsx`, `<Route path="*" element={<NotFound />} />` is positioned as the final route inside `<Route element={<Layout />}>`.
2. **Boot Navigator Protection**: When a cold request lands on `/xyz`, `BootNavigator` temporarily routes through `/boot` for kernel initialization. `Boot.jsx` verifies whether the stored target is an authenticated protected route (`/dashboard`, `/profile`, `/tracker`, `/portfolio`, `/resume`, `/assistant`). If not, it forwards the unauthenticated user directly to the target URL, allowing React Router's catch-all `*` route to render `<NotFound />` instead of inappropriately forcing `/login`.

#### c) Actual code

From [`src/pages/NotFound/NotFound.jsx`](file:///d:/Coding/SEM3/FEE/Scaffold/scaffold/src/pages/NotFound/NotFound.jsx):

```javascript
import React, { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './notfound.css';

export default function NotFound() {
  const location = useLocation();

  useEffect(() => {
    const previousTitle = document.title;
    document.title = '404 — Page Not Found | Scaffold';
    return () => {
      document.title = previousTitle;
    };
  }, []);

  return (
    <div className="notfound-wrapper">
      <div className="notfound-terminal">
        {/* Terminal Header */}
        <div className="notfound-terminal-header">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-red-500/80 inline-block"></span>
            <span className="w-3 h-3 rounded-full bg-yellow-500/80 inline-block"></span>
            <span className="w-3 h-3 rounded-full bg-green-500/80 inline-block"></span>
            <span className="text-xs text-muted font-mono ml-2">error_code_404.sh</span>
          </div>
          <span className="tag">ROUTE RESOLUTION FAILURE</span>
        </div>

        {/* Terminal Body */}
        <div className="notfound-terminal-body space-y-6">
          <div className="space-y-2">
            <div className="text-xs text-muted">
              <span className="notfound-prompt">$</span> curl -I https://scaffold.dev{location.pathname}
            </div>
            <div className="font-mono text-sm text-red-400 font-semibold">
              HTTP/2 404 NOT FOUND: No route registered for path
            </div>
          </div>

          <div className="py-2">
            <div className="font-display font-black text-6xl md:text-7xl tracking-tight" style={{ color: 'var(--fg)' }}>
              404<span style={{ color: 'var(--accent)' }}>_</span>
            </div>
            <p className="text-lg font-mono font-bold mt-2 text-emerald-500" style={{ color: 'var(--accent)' }}>
              Target route not found in kernel registry.
            </p>
          </div>

          <div
            className="p-4 rounded-xl border text-xs leading-relaxed space-y-2"
            style={{ background: 'var(--bg-elev)', borderColor: 'var(--border)' }}
          >
            <div className="text-muted">Requested Path:</div>
            <div>
              <span className="notfound-path-badge">{location.pathname}</span>
            </div>
            <p className="text-muted pt-1">
              The route you requested does not exist or may have been relocated during system compilation.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
            <Link
              to="/"
              className="btn-primary text-xs px-5 py-2.5 w-full sm:w-auto justify-center font-mono flex items-center gap-2"
              style={{ background: 'var(--accent)', color: 'var(--bg)' }}
            >
              <i className="fas fa-home"></i> Go Home
            </Link>
            <Link
              to="/dashboard"
              className="btn-secondary text-xs px-5 py-2.5 w-full sm:w-auto justify-center font-mono flex items-center gap-2"
            >
              <i className="fas fa-chart-line"></i> Go to Dashboard
            </Link>
          </div>

          <div className="border-t pt-4 flex items-center justify-between text-[11px] text-muted font-mono" style={{ borderColor: 'var(--border)' }}>
            <span>Scaffold Diagnostic Kernel</span>
            <span>
              <span style={{ color: 'var(--accent)' }}>$</span> ready <span className="logo-cursor"></span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
```

---

## 3. Data Flow Summary

### 3.1 Plain Language Data Flow

Scaffold's primary architectural innovation is its **closed-loop data pipeline**. Rather than treating Profile, Tasks, Portfolio, and Resume as separate databases, they are tightly interconnected:

1. **Step 1 — Developer Profile Definition**:
   The user populates contact details, target job title, technical stack, education, and bio in `/profile`. This writes to Firestore document `profiles/{userId}` and is cached in `ProfileContext`.
2. **Step 2 — AI Suggestion & Roadmap**:
   When the user opens `/assistant`, Groq AI ingests this profile context. The user asks for project ideas. Groq recommends full-stack projects that target the user's missing skills.
3. **Step 3 — Task Execution in Tracker**:
   The user creates project cards in `/tracker` corresponding to these deliverables. Projects are stored in Firestore subcollection `profiles/{userId}/projects/{id}` and managed in `TrackerContext`.
4. **Step 4 — Verification & Completion**:
   As milestones are achieved, cards move from *To-Do* $\to$ *In Progress* $\to$ *Done*.
5. **Step 5 — Automated Portfolio Ingestion**:
   When `/portfolio` loads, it merges `ProfileContext` with all projects from `TrackerContext`. Completed projects automatically appear as featured cards with live links.
6. **Step 6 — ATS Resume Compilation**:
   When `/resume` is opened, it compiles verified skills and completed project achievements into a standardized printable sheet, ready for export.

### 3.2 Closed-Loop Data Movement Matrix

| Data Field / Entity                     | Origin Source            | Read By / Ingested In                      | Purpose / Transformation                                                                                                                 |
| --------------------------------------- | ------------------------ | ------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------- |
| **Target Role & Tech Stack**      | `/profile` Form        | Dashboard, AI Assistant, Portfolio, Resume | Powers ATS score calculation, sets AI prompt context, creates categorized skill badges on portfolio, and formats resume header.          |
| **Executive Bio**                 | `/profile` Form        | AI Assistant, Portfolio, Resume            | Ingested by AI for bio rewrites, rendered on public portfolio about card, formatted into resume summary.                                 |
| **Contact (Email, Phone, Links)** | `/profile` Form        | Dashboard, Portfolio, Resume               | Scored for ATS contact density; renders social icons on portfolio; formats ATS contact bar.                                              |
| **Project Deliverables**          | `/tracker` Form        | Dashboard, AI Assistant, Portfolio, Resume | Drives project counts on Dashboard; provides AI context; displays interactive cards on Portfolio; formatted into resume project bullets. |
| **Completion Status (`Done`)**  | `/tracker` Drag/Select | Dashboard, Portfolio, Resume               | Adds 15–25 points to ATS index; flags project as verified proof-of-work on public showcase.                                             |

### 3.3 Visual Closed-Loop Pipeline

```text
  ┌─────────────────────────────────────────────────────────────┐
  │                 Cloud Firestore Database                    │
  │                                                             │
  │   profiles/{userId}                .../projects/{projectId} │
  │   • Full Name, Contact             • Project Title          │
  │   • Languages, Frameworks, Tools   • Tech Tags              │
  │   • Education & Bio                • Status: To-Do/Done     │
  └──────────────┬──────────────────────────────┬───────────────┘
                 │                              │
                 ▼                              ▼
      [ ProfileContext.jsx ]          [ TrackerContext.jsx ]
                 │                              │
                 ├──────────────────────────────┤
                 │                              │
                 ▼                              ▼
        ┌──────────────────┐          ┌──────────────────┐
        │  Dashboard.jsx   │          │  Assistant.jsx   │
        │  • Readiness %   │          │  • Reads Profile │
        │  • ATS Score     │          │  • Reads Tracks  │
        │  • Grade (A-D)   │          │  • Suggests Work │
        └──────────────────┘          └──────────────────┘
                 │                              │
                 ├──────────────────────────────┤
                 │                              │
                 ▼                              ▼
        ┌──────────────────┐          ┌──────────────────┐
        │  Portfolio.jsx   │          │    Resume.jsx    │
        │  • Public Link   │          │  • ATS Standard  │
        │  • Verified Done │          │  • No-Print CSS  │
        │  • Skill Badges  │          │  • PDF Export    │
        └──────────────────┘          └──────────────────┘
```

---

## 4. Security & Authentication Summary

### 4.1 Firebase Authentication Architecture

Authentication state is managed through Firebase Auth and unified within `AuthContext.jsx`. The service exposes:

- **`loginWithEmail`** and **`signUpWithEmail`**: Wraps standard Firebase Auth email/password endpoints.
- **`loginWithGoogle`**: Implements OAuth 2.0 popup flows using Google's identity provider.
- **`resetPassword`**: Triggers self-service password reset emails sent directly by Google's SMTP servers.
- **Session Persistence**: An active session listener (`onAuthStateChanged`) monitors the browser's IndexedDB authentication token, guaranteeing that user sessions survive page refreshes and browser restarts.

From [`src/firebase/authService.js`](file:///d:/Coding/SEM3/FEE/Scaffold/scaffold/src/firebase/authService.js):

```javascript
// Real Firebase Authentication SDK implementation
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut, 
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail
} from 'firebase/auth';
import { auth } from './firebaseConfig.js';

export async function loginWithEmail(email, password) {
  if (!email || !password) throw new Error('Email and password are required.');
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  return userCredential.user;
}

export async function loginWithGoogle() {
  const provider = new GoogleAuthProvider();
  const result = await signInWithPopup(auth, provider);
  return result.user;
}

export async function resetPassword(email) {
  if (!email || !email.trim()) throw new Error('Please enter your email address.');
  await sendPasswordResetEmail(auth, email.trim());
  return true;
}
```

---

### 4.2 Cloud Firestore Security Rules

#### Deployed Security Rules

In Cloud Firestore, security rules protect database documents on Google's cloud servers before any read or write operation is permitted. The deployed security rules for Scaffold enforce strict **per-user multi-tenant isolation**:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Single multi-tenant isolation rule protecting profile document and all nested subcollections
    match /profiles/{userId}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

#### Why This Rule Structure Was Chosen (Viva Defense)

1. **Subcollection Inheritance via Recursive Wildcard (`{document=**}`)**:
   By matching `/profiles/{userId}/{document=**}`, a single rule governs both the root user profile document (`profiles/{userId}`) and all documents in all nested subcollections (`profiles/{userId}/projects/{projectId}`).
2. **Preventing Multi-Tenant Data Leaks**:
   The rule requires `request.auth.uid == userId`. Even if an authenticated user tampers with client-side JavaScript or inspects network queries, Firestore rejects any request attempting to read, modify, or delete another developer's documents.
3. **Prevention of Test-Mode Vulnerabilities**:
   Default Firestore test rules grant open access to anyone for 30 days. Deploying this explicit rule guarantees zero unauthorized database exposure (see `report.md` §6.7).

---

### 4.3 Network Resilience & Long-Polling Guard

During development, Firestore requests frequently dropped or threw `client is offline` errors when communicating through restrictive university proxies or web sockets (see `report.md` §6.5). To permanently resolve this, Firestore is initialized with explicit network fallback configuration.

From [`src/firebase/firebaseConfig.js`](file:///d:/Coding/SEM3/FEE/Scaffold/scaffold/src/firebase/firebaseConfig.js) and [`src/firebase/firestoreService.js`](file:///d:/Coding/SEM3/FEE/Scaffold/scaffold/src/firebase/firestoreService.js):

```javascript
// firebaseConfig.js - Forcing HTTP long-polling over unstable WebChannel sockets
export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
  useFetchStreams: false
});

// firestoreService.js - Safety Timeout Wrapper preventing hung promises
export function fetchWithTimeout(promise, ms = 20000) {
  let timeoutId;
  const timeoutPromise = new Promise((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new Error(`Data fetch timed out after ${ms}ms — Firestore request took too long.`));
    }, ms);
  });
  return Promise.race([promise, timeoutPromise]).finally(() => clearTimeout(timeoutId));
}
```

---

### 4.4 Disclosed Engineering Tradeoffs & Known Limitations

To maintain total academic honesty for viva and project evaluation:

1. **Point-in-Time Reads (`getDoc`) vs. WebSocket Listeners (`onSnapshot`)**:
   - *Current Implementation*: Scaffold queries Firestore documents on demand (`getDoc` / `getDocs`) and caches them in `localStorage`.
   - *Rationale*: Avoids listener churn, reduces battery and data consumption on mobile connections, and simplifies client caching. Two open tabs do not sync simultaneously in real time without refreshing or clicking the "Sync Now" button in Settings (see `report.md` §6.16).
2. **Client-Side Math Captcha vs. Enterprise Google reCAPTCHA**:
   - The login security check is a custom arithmetic challenge (`num1 + num2`). Labeled honestly as **"Security Check"** rather than claiming to be Google's reCAPTCHA service (see `report.md` §6.8).
3. **Native Print Engine vs. Heavy PDF Generator**:
   - The ATS resume utilizes browser-native `window.print()` with `@media print` stylesheets rather than client-side PDF canvas generators, maintaining small bundle sizes and high text fidelity for ATS scanners.
4. **Client-Side API Key in Single Page App**:
   - The Groq API key is bundled into the client build (`VITE_GROQ_API_KEY`). Suitable for a pure-frontend academic prototype; a production release would route requests through a cloud serverless proxy (such as Cloudflare Workers or Firebase Functions) to protect the credential.

---

### 4.5 Viva Quick-Reference Cross-Reference Index

For examiners inquiring about specific debugging stories and evolutionary decisions, consult [`report.md`](file:///d:/Coding/SEM3/FEE/Scaffold/scaffold/report.md):

- **The "Client Is Offline" Firestore Saga**: See `report.md` §6.5 (Bug Log)
- **Groq Model Deprecations & Endpoint Fixes**: See `report.md` §6.3 & §6.4 (Bug Log)
- **React Migration Routing Conflicts (`Link` vs legacy `router.js`)**: See `report.md` §6.10–§6.12 (Bug Log)
- **Settings Drawer Sync Status Honest Audit**: See `report.md` §6.16 (Bug Log)
- **Ambient Floating AI Copilot Architecture (`AiBubble.jsx`)**: See `report.md` §8.2 (Feature Log)
- **README & Proprietary Academic Licensing Overhaul**: See `report.md` §8.2 (Feature Log)
