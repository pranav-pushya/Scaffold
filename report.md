# Scaffold — Project Report & Engineering Log

**This is a living document.** Every architectural decision, bug, fix, and feature added to this project should be recorded here as it happens — treat it as the single source of truth for "what have we built and why." Update it in the same commit as the code change it describes, not as an afterthought.

- **Project**: Scaffold — a unified developer identity & growth workspace
- **Course**: 25CSE0203, Front End Engineering-II, Chitkara University
- **Team**: Tiksha (Team Lead — UI/UX & Design System), Tammana (Routing, Forms & Page Logic), Pranav Pushya (Firebase, State, AI Integration & Deployment)
- **Group**: 3G5
- **Live URL**: https://scaffold-app-90278.web.app
- **Repo**: https://github.com/pranav-pushya/Scaffold

---

## 1. Project Overview

Scaffold connects five things students normally manage in disconnected tools — profile, AI-suggested projects, a project tracker, a portfolio, and a resume — into one closed loop:

```
Profile → AI Suggests → Track → Complete → Portfolio → Resume
```

Every module reads from and writes to the same underlying data (a Firestore-backed user profile), so information is entered once and reflected everywhere.

---

## 2. Timeline / Phase History

| Phase | Status | Notes |
|---|---|---|
| Idea selection & scoping | ✅ Done | Landed on Scaffold after evaluating ~30+ candidate ideas across domains; picked for genuine differentiation (closed-loop data model) and realistic scope for a 3-person beginner team. |
| PBE-I build (Vanilla JS) | ✅ Done, submitted | Built per syllabus scope (Lectures 1–42): HTML/CSS/JS fundamentals, Firebase Auth + Firestore (disclosed as beyond-syllabus, self-taught), Groq AI integration, deployed to Firebase Hosting. |
| PBE-I evaluation window | ✅ Cleared | 24–28 August. |
| React migration (PBE-II scope) | 🔄 In progress | Staged, phase-by-phase migration from vanilla JS to React on `react-migration` branch. |
| PBE-II build-out | ⏳ Upcoming | Full React feature set: hooks, Context/state, routing, deeper Firestore integration, testing (per course plan Lectures 43–72). |

---

## 3. Team & Ownership

| Member | Owns | Key Files (React version) |
|---|---|---|
| **Tiksha** (Lead) | UI/UX, design tokens, theming, boot/login/home visuals, responsive layout | `styles/`, `Navbar.jsx`, `Footer.jsx`, `Home.jsx`, `*.css` |
| **Tammana** | Routing, forms, page logic | `App.jsx` routes, `Login.jsx`, `Profile.jsx`, `Dashboard.jsx`, `Tracker.jsx`, `Portfolio.jsx`, `Resume.jsx` (logic portions) |
| **Pranav Pushya** | Firebase (Auth/Firestore), state management, AI integration, deployment | `firebase/`, `context/` (Auth, Profile, Tracker, Theme), `Assistant.jsx`, deployment pipeline |

---

## 4. Tech Stack

### Core (PBE-I, in syllabus scope)
- HTML5, CSS3 (Flexbox, Grid, custom-property design tokens), Vanilla JS (ES6+) — now being replaced by React per PBE-II scope
- Vite — build tooling

### React Layer (PBE-II, in progress)
- React 18 + React Router (client-side routing, replacing the old hash-based `router.js`)
- Context API — `AuthContext`, `ProfileContext`, `TrackerContext`, `ThemeContext` (replacing the old module-pattern stores)

### Firebase Platform
- Firebase Authentication — Email/Password + Google OAuth
- Cloud Firestore — NoSQL document database
- Firestore Security Rules — per-user access control
- Firebase Hosting — production deployment

### AI Layer
- Groq Cloud API — REST chat completion endpoint powering the AI Career & Code Assistant

### Disclosed Beyond-Syllabus Additions
Firebase and Groq were adopted specifically because the evaluation required real authentication and a captcha-protected login flow — not achievable in pure client-side JS alone. This is documented transparently in the PBE-I project report rather than presented as syllabus-standard content.

---

## 5. Data Model (Cloud Firestore)

```
profiles/{userId}                    — one doc per user: name, contact, goal, skills
profiles/{userId}/projects/{id}      — subcollection: title, tech stack, status
```

Projects are nested under the user's own profile document (not a separate top-level collection) so that a single security rule governs both, and every query is naturally scoped to the logged-in user.

**Security Rule (deployed):**
```
match /profiles/{userId}/{document=**} {
  allow read, write: if request.auth != null && request.auth.uid == userId;
}
```

**Known limitation (disclosed honestly):** data is fetched with one-time reads (`getDoc`/`getDocs`), not real-time listeners (`onSnapshot`). Two open tabs will not sync live — a refresh is needed to see changes made elsewhere. Documented as a candidate for PBE-II/Final.

---

## 6. Bug Log — Debugging Journal (chronological, detailed)

This is the most viva-relevant section — it demonstrates genuine debugging, not copy-pasted code.

### 6.1 Real API key exposure in `.env`
- **What happened**: a live Groq API key was committed/present in an uploaded project zip with no `.gitignore` in place.
- **Fix**: rotated the key immediately at console.groq.com; added `.gitignore` (`*.env`, `node_modules/`, `dist/`) **before** running `git init`, to avoid the key ever entering Git history.

### 6.2 Fake/mocked Firebase Auth & Firestore (pre-existing from an earlier AI pass)
- **What happened**: an AI coding agent had previously written `authService.js`/`firestoreService.js` that fabricated fake user objects (`Date.now()` as a uid) and a hardcoded fake Google user, with no real Firebase SDK calls. A self-generated audit report incorrectly marked these as "DONE."
- **Fix**: flagged the discrepancy, rewrote both files with real Firebase SDK calls (`createUserWithEmailAndPassword`, `signInWithPopup` + `GoogleAuthProvider`, `onAuthStateChanged`, real Firestore `setDoc`/`getDoc`/`addDoc`). Corrected the audit report to reflect real, verified status only.

### 6.3 Groq vs. xAI "Grok" endpoint mismatch
- **What happened**: `assistant.js` called `api.x.ai` (xAI's real Grok endpoint) using a Groq Cloud key (`gsk_...` prefix) — two different companies/products confused by similar names. The call failed with HTTP 400.
- **Fix**: corrected the endpoint to `api.groq.com/openai/v1/chat/completions`; updated all UI copy that incorrectly said "Grok (xAI)" to say "Groq."

### 6.4 Groq model deprecation (twice)
- **What happened**: `llama-3.3-70b-versatile`, then `llama-3.1-8b-instant`, were both deprecated by Groq mid-project, breaking the Assistant with "model does not exist" errors.
- **Fix**: queried Groq's `/models` endpoint directly to find a currently valid model rather than hardcoding a guess. Illustrates the real risk of depending on a live, evolving third-party API.

### 6.5 The "Client Is Offline" Firestore saga (the big one)
- **Symptom**: every Firestore call failed with `FirebaseError: Failed to get document because the client is offline`, even though the Network tab showed every underlying request returning `200 OK`.
- **Investigation, in order**:
  1. Ruled out browser extensions — reproduced in Incognito, same error.
  2. Found and fixed a real bug: an unhandled promise rejection in `router.js` was silently blocking page renders after navigation (added try/catch, safe-loading pattern with timeout).
  3. Forced Firestore long-polling (`experimentalForceLongPolling: true`) to rule out WebChannel network incompatibility — helped latency, didn't fix the core error.
  4. Tested on a different network (mobile hotspot) and a different machine/browser entirely — same error everywhere, ruling out local network/machine issues.
  5. **Root cause found**: the Cloud Firestore *database itself had never been provisioned* in the Firebase Console — it was still showing the "Get Started" marketing page, not an active database. Every SDK call targeted a database that didn't exist. Firestore reports this as a generic "offline" error rather than "database not found," which made it hard to diagnose.
  6. Fix: clicked "Create database" in Firebase Console. Resolved instantly, everywhere.
- **Why this matters**: strongest evidence of genuine debugging — five wrong hypotheses eliminated systematically before finding the real cause via cross-machine/cross-network testing.

### 6.6 Firestore collection path mismatch
- **What happened**: `saveProfile` wrote to `profiles/{userId}` while `saveProject`/`getProjects` wrote to a separate `users/{userId}/projects` collection — profile and projects were structurally disconnected.
- **Fix**: standardized everything under `profiles/{userId}/projects` as a subcollection.

### 6.7 Firestore Security Rules left in test mode
- **What happened**: rules were open to any authenticated (or unauthenticated) user for 30 days by default.
- **Fix**: deployed the per-user rule documented in Section 5.

### 6.8 Captcha mislabeled as "reCAPTCHA"
- **What happened**: the login page's security check is a custom client-side math challenge (`num1 + num2`), but UI text called it "reCAPTCHA" and claimed "Powered by Firebase Auth & Firestore" in ways that overstated what was implemented at the time.
- **Fix**: relabeled to "Security Check" throughout the UI to avoid misrepresenting it as Google's reCAPTCHA service.

### 6.9 React migration: stray "boot" nav link
- **What happened**: after Phase 1 setup, the boot sequence (a one-time load animation) was incorrectly added as a clickable navbar route.
- **Fix**: removed from `Navbar.jsx`'s link list; boot remains a one-time route only, not a persistent nav item.

### 6.10 React migration: Link clicks changed the URL but not the page content
- **Symptom**: clicking a navbar `Link` updated the address bar (e.g. to `/tracker`) but the visible content stayed on the previous page. A manual refresh at that same URL *did* show the correct page.
- **Diagnosis**: this pattern (refresh works, client-side nav doesn't) pointed to the old vanilla `router.js` (hash-based, manual DOM `innerHTML` manipulation) still running alongside React Router and fighting over control of the page — confirmed and fixed by removing the legacy router logic.

### 6.11 React migration: stuck "Authenticating..." + Home content bleeding into Dashboard
- **What happened**: `AuthContext`'s `loading` state was never set to `false` in the logged-out branch of `onAuthStateChanged`, so `ProtectedRoute` hung indefinitely instead of redirecting to `/login`. Home's content was also visibly bleeding through underneath Dashboard's route.
- **Fix**: corrected `loading` to resolve to `false` in both the logged-in and logged-out cases; fixed route nesting so pages properly unmount instead of layering.

### 6.12 React migration: `/tracker` route rendering Dashboard's content
- **What happened**: after the routing fix above, a new route-mapping bug surfaced — `/tracker` resolved to Dashboard's exact content, with "dashboard" incorrectly highlighted as the active nav link.
- **Fix**: audited the full `<Routes>` block in `App.jsx` for mismatched `element=` props; corrected the `/tracker` route to point at `Tracker.jsx`; verified every other route individually rather than assuming only one was broken.

### 6.13 Home page "Account Portal" button not working
- **What happened**: button click didn't navigate correctly (root cause not fully detailed in chat, but resolved).
- **Fix**: confirmed working after a targeted fix.

### 6.14 Duplicate `firebase/` folder
- **What happened**: an exact duplicate of `firebase/firebaseConfig.js`, `authService.js`, and `firestoreService.js` existed at both project root and `src/firebase/` (confirmed via SHA256 hash match). All React components resolved imports to `src/firebase/`, making the root copy dead weight.
- **Fix**: deleted the unused root `firebase/` folder after confirming zero remaining references to it.

### 6.15 Legacy CSS `<link>` tags in `index.html`
- **What happened**: 9 stylesheet `<link>` tags still pointed at `js/pages/*/*.css` even though every React page now imports its own CSS directly.
- **Fix**: removed the legacy links from `index.html` before deleting the `js/` folder, to avoid 404s.

### 6.16 Settings Drawer "Realtime Active" sync label overclaim
- **What happened**: The newly built Workspace Settings drawer displayed "Status: Realtime Active" under Cloud Auto-Sync, implying live WebSocket synchronization with Firestore. An audit revealed zero `onSnapshot()` listeners exist in the project — all Firestore reads are one-time `getDoc`/`getDocs` calls.
- **Fix**: Replaced the label with honest status reporting (`Status: Synced` when authenticated, `Status: Syncing...` during transfer, `Status: Local Only` in guest sessions, accompanied by exact timestamp `Last sync: [time]`). Connected the "Sync Now" button to actually trigger `getProfile(uid)` and `getProjects(uid)` to refresh local client caches on demand.

---

## 7. Deployment History

| Event | Notes |
|---|---|
| Initial Firebase Hosting deploy (vanilla JS) | Live at scaffold-app-90278.web.app |
| Post-Firestore-fix redeploy | Confirmed real Auth/Firestore working in production |
| React migration deploys | Deployed from `react-migration` branch during testing; merge to `main` planned once migration is fully stable, with `main` as the sole deploy source going forward |

**Standing gotcha to remember**: `firebase deploy` always deploys whatever branch/build is currently checked out locally — always confirm `git status`/branch and run `npm run build` fresh before every `firebase deploy`.

---

## 8. Feature Log

### 8.1 Core Loop (PBE-I, carried into React)
- Terminal-style boot sequence (typing animation)
- Login/Signup — Firebase Auth (Email/Password + Google), custom math Security Check
- Home — landing page, stat counters, CTA buttons
- Dashboard — profile readiness %, ATS score, project counts, AI Career Coach card
- Profile — controlled form (contact, goals, skills), Firestore-backed
- Tracker — Kanban board (To-Do / In Progress / Done), full CRUD, syncs to Firestore
- Portfolio — auto-generated from Profile + completed Tracker projects
- Resume — compiled from the same data, exported via `window.print()` + `@media print` CSS (no PDF library)
- AI Assistant — Groq-powered, context-aware (reads live profile/project data), multiple modes (ATS Coach, Project Ideas, Portfolio Bio, System Design)

### 8.2 Added post-PBE-I (during React migration)
- **Workspace Settings drawer**: JSON export/import of full workspace state, "Purge Local Cache," Reduce Motion toggle, Compact Density toggle, Default Landing Route selector, Portfolio Visibility (Public/Private) with shareable link, Cloud Data Sync status indicator with genuine on-demand Firestore re-fetch, keyboard shortcuts reference, System Information panel.
- **Command Palette** (`Ctrl+K` or `/`): fuzzy navigation to any page, shown with keyboard shortcut hints (Alt+1 through Alt+7 for page navigation, Alt+N/E/A/F/L for actions, `T` for theme cycling).
- **Verified Cloud Sync label audit (no `onSnapshot` used)**: Audited the entire codebase for Firestore's `onSnapshot()` real-time listener — confirmed zero occurrences. All database operations are point-in-time SDK queries (`getDoc`/`getDocs`/`setDoc`/`updateDoc`). The Settings drawer was updated to reflect this honestly: section retitled "Cloud Data Sync", label changed from misleading "Status: Realtime Active" to "Status: Synced" / "Status: Local Only" alongside "Last sync: [timestamp]", and "Sync Now" button wired to perform an authentic cloud re-fetch.
- **Ambient Floating AI Chat Widget (`AiBubble.jsx`)**: A lightweight, fixed-position circular copilot pinned at the bottom-right of every page across the shared `Layout.jsx`.
  - **Core Design Rationale (Viva Reference)**: *"Humare paas do AI touchpoints hain jaan-bujh ke — poora Assistant page deep-work sessions ke liye hai (resume audit, project ideas, system design prep), jabki floating widget ambient, quick-help ke liye hai jo kisi bhi page se turant access ho sakta hai bina context switch kiye — jaise real products mein help-widget aur dedicated-tool alag hote hain (Intercom vs. ek poori analytics dashboard)."*
  - **Data Access & Scope**: Reads live data from `ProfileContext` (name, target role, technical skills, profile readiness, estimated ATS score) and `TrackerContext` (total project count, completed/done count, in-progress tasks), paired with a static local knowledge engine for instantaneous navigation and feature answers (shortcuts guide, making portfolio public, resume export, workspace data backup).
  - **Shared API Integration**: Reuses the exact same Groq Cloud API configuration as `Assistant.jsx` via a unified `src/services/aiService.js` (same endpoint, same `openai/gpt-oss-20b` model, same `VITE_GROQ_API_KEY`).
  - **Deliberate Non-Duplication**: Purposely excludes heavy multi-mode tabs, deep prompting pipelines, and long conversation persistence. When heavy prompts (e.g. detailed resume rewrite, 5+ project architectures) are detected, it supplies a concise summary and guides the user to the dedicated Assistant page (`/assistant`).
- **README & Proprietary Academic Licensing Overhaul**:
  - Overhauled `README.md` into a comprehensive, professional developer OS specification detailing the closed-loop architecture, dual-tier AI touchpoints, Command Palette, Settings Drawer, master keyboard shortcuts table, ATS scoring algorithm, and viva defense Q&A.
  - Formally designated the repository as **NOT Open Source** (Proprietary Academic Submission for Chitkara University Course 25CSE0203 by Group 3G5). Updated `package.json` with `"license": "UNLICENSED"` and `"private": true`, preventing accidental open-source package publication or indexing under permissive licenses.

### 8.3 Bug-fix batch (post-migration polish)
- Password show/hide eye icon on Login
- Forgot Password flow via Firebase's `sendPasswordResetEmail`
- Confirm Password field on Sign Up with independent eye-icon toggle
- Replaced low-value Home page stats ("3 Core Engineers" / "100% React JS & Firebase") with more informative content
- Fixed missing card styling on the "Firebase Auth System" feature card (was inconsistent with its sibling cards)
- Fixed Tracker status dropdown to correctly show the project's current status as selected, not default to the first option

---

## 9. React Migration Log

Migration is staged and phase-gated — each phase is built, tested, and confirmed working before the next begins, on a dedicated `react-migration` branch (kept separate from `main` until stable).

| Phase | Scope | Status |
|---|---|---|
| 1 | Project setup — install React/Router, folder structure (`src/components`, `src/pages`, `src/context`, `src/hooks`, `src/firebase`) | ✅ Done |
| 2 | Auth & state → React Context (`AuthContext`, `ProfileContext`, `TrackerContext`) | ✅ Done |
| 3 | React Router setup, `ProtectedRoute` component | ✅ Done (after fixing bugs in 6.10–6.12) |
| 4 | Page-by-page conversion (Login, Home, Dashboard, Profile, Tracker, Portfolio, Resume, Assistant) | ✅ Done |
| 5 | Shared components (Navbar, Footer, ThemeContext) + full regression test | ✅ Done |
| Cleanup | Remove legacy `js/` folder and duplicate `firebase/` folder after full audit | ✅ Done |
| Merge to `main` | Pending confirmation of full stability | ⏳ Upcoming |

---

## 10. Known Limitations (disclosed honestly, not hidden)

- Firestore reads are one-time fetches, not real-time listeners — no live cross-tab sync.
- The Groq API key is used client-side (bundled into the JS), not proxied through a backend — acceptable for a pure-frontend academic project, but a real production app would proxy this.
- The login Security Check is a custom math captcha, not Google's reCAPTCHA — labeled honestly as such.
- PDF export uses the browser's native print-to-PDF, not a dedicated PDF-generation library.

---

## 11. Open Items / Next Steps

- [x] Verify the Settings drawer's "Realtime Active" label is accurate; corrected to "Status: Synced" / "Last sync" after confirming no `onSnapshot` in codebase.
- [ ] Full regression test of the new Settings drawer + Command Palette (Export/Import JSON, Purge Cache, all keyboard shortcuts) to confirm each is genuinely functional, not just visual.
- [ ] Merge `react-migration` into `main` once fully verified; redeploy from `main` going forward.
- [ ] PBE-II scope build-out: deeper hooks usage (useMemo/useCallback/custom hooks), Jest/RTL testing, performance optimization (lazy loading, code splitting), per the course plan.
- [ ] Consider `onSnapshot` for real cross-tab real-time sync if pursued.
- [ ] Consider a server-side proxy for the Groq API key before any real-world/production use.

---

## 12. How to Keep This Report Updated

When asking an AI coding agent to make a change, add this line to the prompt:

> "After this change, also update `report.md`: add an entry to the relevant section (Bug Log, Feature Log, or Migration Log) describing what changed and why."

Review the diff to `report.md` the same way code diffs are reviewed — don't let it silently drift from what's actually true in the code.
