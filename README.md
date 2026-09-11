<div align="center">

<!-- > [!IMPORTANT]
> ### 🔒 PROPRIETARY ACADEMIC WORK — NOT OPEN SOURCE
> **This repository and codebase are NOT open source.**  
> This project is a proprietary academic engineering evaluation submission for **Chitkara University (Course 25CSE0203 — Front End Engineering-II)** by **Group 3G5**. It is **NOT** licensed under MIT, Apache, GPL, BSD, or any other open-source or copyleft license. No commercial rights, re-distribution permissions, public re-hosting rights, or assignment re-use rights are granted. See the [full proprietary notice](#-proprietary-academic-notice-not-open-source) at the bottom of this document. -->

## 📌 Executive Summary

Modern developers often scatter their identity across disconnected tools: a Markdown file for task tracking, a static resume in Google Docs, a fragmented GitHub portfolio, and generic ChatGPT prompts for interview prep.

**Scaffold** solves this by enforcing a **continuous, closed-loop developer data architecture**:

```
[ Developer Profile ] ──► [ AI Recommendations ] ──► [ Kanban Tracker ]
         ▲                                                    │
         │                                                    ▼
[ ATS Resume Sheet ] ◄────────────────────────────── [ Portfolio Showcase ]
```

1. **Profile**: Users configure their target role, contact details, core technical competencies, and bio once.
2. **AI Recommendations**: Groq-powered AI reads the live profile to suggest tailored system architectures and project ideas.
3. **Kanban Tracker**: Tasks are managed across *To-Do*, *In Progress*, and *Done* states, syncing asynchronously to Cloud Firestore.
4. **Portfolio Showcase**: Completed (*Done*) projects automatically feed into a responsive, public/private shareable developer portfolio.
5. **ATS Resume**: All profile records and verified completed projects compile instantly into an ATS-friendly, printable PDF sheet.

---

## ⚡ Key Highlights & Core Capabilities

### 1. 🎛️ Workspace Settings Slide-Over Drawer

Accessible via the navbar gear icon or pressing <kbd>?</kbd> / <kbd>Shift + /</kbd>:

- **💾 Data Management & Backup**:
  - **Export JSON**: Download a complete backup of workspace state (profile, projects, and UI preferences).
  - **Import JSON**: Restore or merge workspace state from a backup file with automatic schema validation.
  - **Purge Cache**: Reset local storage without touching authenticated Firestore cloud records.
- **🎨 Appearance & UX Customization**:
  - **Reduce Motion & Glow**: Disables intense CRT/neon bloom and animations for low-power devices.
  - **Compact Density**: Tightens row and card padding for dense workstation displays.
  - **Default Landing Route**: Configure whether Scaffold boots into Home (`/`), Dashboard (`/dashboard`), or Tracker (`/tracker`).
- **🌐 Public Portfolio Visibility**:
  - Toggle showcase between **Public** (live at `/portfolio`) and **Private**.
  - One-click public showcase link copy.
- **☁️ Cloud Data Sync Status**:
  - Honest status indicator: `● Synced` (authenticated), `● Syncing...` (active request), or `○ Local Session`.
  - Live timestamp tracking (*Last sync: [time]*).
  - **Sync Now** button: Actively re-fetches documents (`getProfile` + `getProjects`) from Cloud Firestore to refresh client cache.
- **ℹ️ System Diagnostics**:
  - Real-time client storage footprint monitor (KB size and active keys count).
  - Framework runtime info (React 18/19, Vite 5, Cloud Firestore).

---

### 2. 🤖 Dual-Tier AI Intelligence Architecture

Scaffold deliberately implements **two distinct AI touchpoints** engineered for different user intents:

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          Scaffold AI Ecosystem                          │
├────────────────────────────────────┬────────────────────────────────────┤
│ 🟢 Ambient Floating Copilot        │ 🟣 Dedicated Assistant Page        │
│    (AiBubble.jsx)                  │    (Assistant.jsx)                 │
├────────────────────────────────────┼────────────────────────────────────┤
│ • Always accessible from ANY page  │ • Full-page deep-work workstation  │
│ • Bottom-right floating trigger    │ • Multi-mode generative coach      │
│ • Zero-latency site FAQs & hotkeys │ • Comprehensive ATS resume audits  │
│ • Live user project & ATS lookups  │ • 5-part system design blueprints  │
│ • Strictly scoped to Scaffold only │ • Tailored project roadmap builds  │
└────────────────────────────────────┴────────────────────────────────────┘
```

- **Shared Service Layer ([`aiService.js`](file:///d:/Coding/SEM3/FEE/Scaffold/scaffold/src/services/aiService.js))**: Both components share a single, unified Groq Cloud API service (`openai/gpt-oss-20b`), ensuring zero duplicate network code and consistent error handling.
- **Strict Ambient Guardrails**: If an off-topic query (e.g. *"what is React"*, *"explain closures"*) or deep-work query (e.g. *"write my whole resume"*) is sent to `AiBubble`, it politely redirects the user to the appropriate tool.

---

### 3. ⌨️ Keyboard Accelerators & Master Shortcut Reference

Scaffold is engineered as a keyboard-first Developer OS. Every primary action, route transition, and dialog can be triggered via hardware keystrokes:

| Shortcut                                         | Action                          | Scope           | Description                                                                        |
| ------------------------------------------------ | ------------------------------- | --------------- | ---------------------------------------------------------------------------------- |
| <kbd>Ctrl + K</kbd> or <kbd>/</kbd>              | **Command Palette**       | Global          | Opens fuzzy command & search palette with keyboard navigation                      |
| <kbd>Alt + F</kbd>                               | **Toggle Full Screen**    | Global          | Enters/exits native HTML5 full-screen mode with on-screen exit badge               |
| <kbd>Alt + 1</kbd>                               | **Navigate to Home**      | Global          | Jump to`/` (Landing Page)                                                        |
| <kbd>Alt + 2</kbd>                               | **Navigate to Dashboard** | Global          | Jump to`/dashboard` (Developer Metrics & ATS Index)                              |
| <kbd>Alt + 3</kbd>                               | **Navigate to Profile**   | Global          | Jump to`/profile` (Developer Identity Hub)                                       |
| <kbd>Alt + 4</kbd>                               | **Navigate to Tracker**   | Global          | Jump to`/tracker` (Kanban Task Board)                                            |
| <kbd>Alt + 5</kbd>                               | **Navigate to Portfolio** | Global          | Jump to`/portfolio` (Live Showcase)                                              |
| <kbd>Alt + 6</kbd>                               | **Navigate to Resume**    | Global          | Jump to`/resume` (ATS Printable Sheet)                                           |
| <kbd>Alt + 7</kbd>                               | **Navigate to Assistant** | Global          | Jump to`/assistant` (Deep-Work AI Workspace)                                     |
| <kbd>Alt + N</kbd>                               | **Quick Add Card**        | Tracker         | Opens new project task creation modal                                              |
| <kbd>Alt + E</kbd> / <kbd>Ctrl + P</kbd>         | **Export / Print Resume** | Global / Resume | Triggers browser-native`@media print` PDF generator                              |
| <kbd>Alt + A</kbd>                               | **Focus AI Copilot**      | Global          | Opens or focuses the ambient bottom-right AI bubble                                |
| <kbd>Alt + L</kbd>                               | **Sign Out Modal**        | Global          | Triggers account sign-out confirmation dialog                                      |
| <kbd>?</kbd> or <kbd>Shift + /</kbd>             | **Workspace Settings**    | Global          | Slides out the Settings & Backup drawer                                            |
| <kbd>T</kbd>                                     | **Cycle Theme**           | Global          | Cycles between**Dark**, **Light**, and **Cyber** (CRT Scanlines) |
| <kbd>Esc</kbd>                                   | **Dismiss Modal/Drawer**  | Global          | Universally closes open popups, drawers, or command palette                        |
| <kbd>↑</kbd> / <kbd>↓</kbd> + <kbd>Enter</kbd> | **Palette Navigation**    | Modal           | Traverses command palette items with auto-scrolling viewport                       |

---

### 4. 📊 Developer Modules Breakdown

| Module                       | Route          | Key Capabilities                                                                                                                                                                |
| ---------------------------- | -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Terminal Boot**      | `/boot`      | Animated terminal boot sequence simulating hardware checks and environment setup.                                                                                               |
| **Authentication**     | `/login`     | Firebase Auth (Email/Password + Google OAuth), custom math Security Check challenge, password visibility toggles, and self-service password reset.                              |
| **Home OS**            | `/`          | Platform entry point with interactive metrics, tech stack tags, and quick-action triggers.                                                                                      |
| **Dashboard**          | `/dashboard` | Developer OS overview with automated**Profile Readiness %**, **ATS Index Score (0–100)**, Kanban project metrics, and AI career cards.                             |
| **Profile Hub**        | `/profile`   | Comprehensive developer identity form (target role, languages, frameworks, dev tools, bio, education, social links) synced to Cloud Firestore.                                  |
| **Kanban Tracker**     | `/tracker`   | Drag-and-drop task board with**To-Do**, **In Progress**, and **Done** columns, real-time CRUD, status dropdowns, and search filtering.                        |
| **Portfolio Showcase** | `/portfolio` | Live public developer showcase auto-populated from completed tracker projects and verified skills. Includes shareable link generator.                                           |
| **ATS Resume Sheet**   | `/resume`    | Standardized, single-page ATS-compliant resume compiled directly from profile and project history. Exportable to PDF using browser-native`@media print` styling.              |
| **AI Assistant**       | `/assistant` | Deep-work generative intelligence console with 4 dedicated coaching modes:*ATS Resume Coach*, *Project Inspiration*, *Portfolio Bio Writer*, and *System Architecture*. |

---

### 5. 📈 ATS Scoring Algorithm & Profile Readiness Engine

Scaffold incorporates a real-time mathematical scoring engine in `Dashboard.jsx` that computes two distinct developer benchmarks:

1. **Profile Readiness Index (0–100%)**:

   - Evaluates form completion: Name, Target Role, Contact Details, Bio (>50 chars), Skills (Languages, Frameworks, Tools), and Education.
   - Provides granular missing-field checklists to guide developers toward a complete profile.
2. **ATS Optimization Score (0–100 Index)**:

   - Evaluates resume competitiveness based on real industry hiring criteria:
     - **Contact & Role Clarity (25%)**: Complete title, email, phone, location, and GitHub/LinkedIn URLs.
     - **Skill Density & Categorization (30%)**: Structured balance of programming languages, modern frameworks, and developer tooling.
     - **Project Execution & Proof-of-Work (35%)**: Minimum of 2 completed projects (`Done` column) with live demo and GitHub repository links.
     - **Summary & Impact Keywords (10%)**: Bio length and action-oriented phrasing.

---

## 🏗️ System Architecture

```
                          ┌──────────────────────────┐
                          │   React 18/19 Root SPA   │
                          │        (App.jsx)         │
                          └─────────────┬────────────┘
                                        │
           ┌────────────────────────────┼────────────────────────────┐
           ▼                            ▼                            ▼
┌──────────────────────┐     ┌──────────────────────┐     ┌──────────────────────┐
│  AuthContext.jsx     │     │  ProfileContext.jsx  │     │  TrackerContext.jsx  │
│  Firebase Auth state │     │  User doc sync       │     │  Projects subcol     │
└──────────┬───────────┘     └──────────┬───────────┘     └──────────┬───────────┘
           │                            │                            │
           └────────────────────────────┼────────────────────────────┘
                                        ▼
                          ┌──────────────────────────┐
                          │        Layout.jsx        │
                          ├──────────────────────────┤
                          │ • Navbar & SettingsBtn   │
                          │ • SettingsDrawer.jsx     │
                          │ • CommandPalette.jsx     │
                          │ • AiBubble.jsx (Copilot) │
                          │ • ExitFullScreen Badge   │
                          │ • Outlet (Active Route)  │
                          │ • Footer.jsx             │
                          └─────────────┬────────────┘
                                        │
                     ┌──────────────────┴──────────────────┐
                     ▼                                     ▼
        ┌─────────────────────────┐           ┌─────────────────────────┐
        │ Cloud Firestore Backend │           │     Groq Cloud API      │
        │ • profiles/{userId}     │           │ • openai/gpt-oss-20b    │
        │ • profiles/.../projects │           │ • aiService.js shared   │
        └─────────────────────────┘           └─────────────────────────┘
```

---

## 🛠️ Technical Stack & Dependencies

| Layer                             | Technologies                         | Version / Details                                 |
| --------------------------------- | ------------------------------------ | ------------------------------------------------- |
| **Core Framework**          | React, ReactDOM                      | `^19.2.8` / React 18 Compatibility Mode         |
| **Application Routing**     | React Router DOM                     | `^7.18.3` (Declarative Client-Side SPA Routing) |
| **Build & Tooling**         | Vite,`@vitejs/plugin-react`        | `^5.4.21` (Fast HMR & Rollup Bundler)           |
| **Cloud Infrastructure**    | Google Firebase Platform             | `^12.17.1` (Auth, Cloud Firestore, Hosting)     |
| **AI / LLM Engine**         | Groq Cloud API                       | Model:`openai/gpt-oss-20b` (REST endpoint)      |
| **Styling & Design Tokens** | Tailwind CSS + CSS Custom Properties | Multi-theme token engine (Dark, Light, Cyber)     |
| **Iconography**             | FontAwesome CDN                      | FontAwesome 6.4.0 SVG & Webfonts                  |

---

## 👥 Team & Module Ownership

This project is an academic engineering submission for **Chitkara University (25CSE0203 — Front End Engineering-II)** by **Group 3G5**:

| Member                           | Primary Ownership                | Managed Files & Architecture                                                                                                                                     |
| -------------------------------- | -------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Tiksha** *(Team Lead)* | UI/UX & Design Tokens            | `styles/globals.css`, `Navbar.jsx`, `Footer.jsx`, `Home.jsx`, component stylesheets, responsive viewports                                                |
| **Tammana**                | Routing, Forms & Page Logic      | `App.jsx` routes, `Login.jsx`, `Profile.jsx`, `Dashboard.jsx`, `Tracker.jsx`, `Portfolio.jsx`, `Resume.jsx`                                        |
| **Pranav Pushya**          | Firebase, State, AI & Deployment | `src/firebase/*`, `src/services/aiService.js`, `src/components/AiBubble.jsx`, `SettingsDrawer.jsx`, `CommandPalette.jsx`, Context state, CI/CD Hosting |

---

## 📁 Repository Directory Structure

```text
scaffold/
├── .firebase/                  # Firebase CLI hosting hash cache (gitignored)
├── .firebaserc                 # Firebase project alias (scaffold-app-90278)
├── .gitignore                  # Git exclusions (.env, node_modules, dist, .firebase)
├── AGENTS.md                   # Standing AI pair-programming guidelines & governance
├── firebase.json               # Firebase Hosting rewrite rules for SPA routing
├── index.html                  # HTML5 entry point with fonts & CSS tokens
├── package.json                # Project dependencies (UNLICENSED / Private)
├── report.md                   # Comprehensive living engineering log & viva reference
├── vite.config.js              # Vite React configuration
│
└── src/
    ├── App.jsx                 # Route declarations & ProtectedRoute wrappers
    ├── main.jsx                # React DOM client entry point
    │
    ├── components/             # Reusable & shared UI components
    │   ├── AiBubble.jsx        # Ambient floating AI copilot widget
    │   ├── CommandPalette.jsx  # Global search & command modal (Ctrl+K)
    │   ├── Footer.jsx          # Application footer
    │   ├── Layout.jsx          # Master layout (Navbar, Palette, Bubble, Footer)
    │   ├── Navbar.jsx          # Fixed navigation header with settings trigger
    │   └── SettingsDrawer.jsx  # Workspace preferences & data management drawer
    │
    ├── context/                # React Context state management
    │   ├── AuthContext.jsx     # Firebase Auth user state & lifecycle
    │   ├── ProfileContext.jsx  # Firestore profile synchronization
    │   └── TrackerContext.jsx  # Kanban project data store
    │
    ├── firebase/               # Firebase SDK initialization
    │   ├── authService.js      # Email/Password, Google OAuth, password reset
    │   ├── firebaseConfig.js   # Firebase App & Firestore db instances
    │   └── firestoreService.js # Firestore CRUD operations & timeout guards
    │
    ├── hooks/                  # Custom React Hooks
    │   ├── useAuth.js          # Hook for AuthContext
    │   ├── useGlobalShortcuts.js# Global keyboard event listener
    │   ├── useProfile.js       # Hook for ProfileContext
    │   ├── useTheme.js         # Hook for multi-theme engine
    │   └── useTracker.js       # Hook for TrackerContext
    │
    ├── pages/                  # Page route views
    │   ├── Assistant/          # Dedicated deep-work AI coaching page
    │   ├── Boot/               # Terminal-style boot diagnostic sequence
    │   ├── Dashboard/          # Developer OS hub & ATS score calculator
    │   ├── Home/               # Public landing page
    │   ├── Login/              # Authentication & custom security challenge
    │   ├── Portfolio/          # Live developer showcase
    │   ├── Profile/            # Developer identity form
    │   ├── Resume/             # ATS-formatted printable resume sheet
    │   └── Tracker/            # Kanban project management board
    │
    └── services/               # Shared backend service utilities
        └── aiService.js        # Centralized Groq API completions & markdown parser
```

---

## ⚙️ Local Development & Evaluation Setup

### Prerequisites

- **Node.js**: v18.x or higher
- **npm**: v9.x or higher

### Step-by-Step Installation

1. **Clone the repository**:

   ```bash
   git clone https://github.com/pranav-pushya/Scaffold.git
   cd Scaffold/scaffold
   ```
2. **Install project dependencies**:

   ```bash
   npm install
   ```
3. **Configure Environment Variables**:
   Create a `.env` file in the project root containing your Firebase and Groq credentials:

   ```env
   VITE_FIREBASE_API_KEY=your_firebase_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   VITE_GROQ_API_KEY=your_groq_api_key
   ```
4. **Start the local development server**:

   ```bash
   npm run dev
   ```

   Open `http://localhost:5173` in your browser.
5. **Execute Production Build**:

   ```bash
   npm run build
   ```

   Compiles assets into `dist/` with code-splitting and asset optimization.

---

## 🔍 Disclosed Engineering Tradeoffs (Viva Transparency)

To maintain academic integrity and technical accuracy, the following architectural tradeoffs are disclosed:

1. **Optimistic Local Caching vs. WebSocket Listeners (`onSnapshot`)**:
   - *Architecture*: The application reads Firestore documents using on-demand `getDoc` / `getDocs` request-response queries cached into `localStorage`, rather than maintaining persistent WebSocket connections via `onSnapshot()`.
   - *Rationale*: Preserves Firestore connection quotas, avoids listener churn across frequent tab switches, and enables fast initial page hydration. Live sync is triggered per route load or on-demand via the **"Sync Now"** button in Settings.
2. **Client-Side Security Challenge vs. Third-Party reCAPTCHA**:
   - The login page features a custom client-side arithmetic challenge (`num1 + num2`) rather than Google's enterprise reCAPTCHA service. Labeled accurately as **"Security Check"**.
3. **Browser-Native Print Engine vs. Heavy PDF Libraries**:
   - Resume export utilizes native browser `window.print()` combined with clean `@media print` CSS rules (suppressing navbars, borders, and controls) rather than heavy JavaScript PDF generation engines (e.g. `jspdf` or `html2pdf`), reducing bundle size by ~300KB.
4. **Client-Side API Key in Single Page App**:
   - The Groq API key is bundled into the client build (`VITE_GROQ_API_KEY`). While suitable for this pure-frontend academic evaluation project, a production deployment would route requests through a cloud serverless proxy (Firebase Functions or Cloudflare Workers) to shield the credential.

---

## 🎓 Viva & Architectural Defense Q&A

### Q1: Why use React Context instead of Redux Toolkit or Zustand?

> **Answer**: Scaffold manages three coherent data streams: authentication identity (`AuthContext`), developer profile attributes (`ProfileContext`), and Kanban project cards (`TrackerContext`). Because the update frequency is user-driven (submitting forms or moving Kanban cards) rather than high-frequency streaming ticks, React's built-in Context API coupled with custom hooks provides clean, dependency-free state synchronization without the bundle overhead of Redux.

### Q2: How does the dual-tier AI architecture prevent redundancy?

> **Answer**: `AiBubble.jsx` and `Assistant.jsx` serve complementary user intents. `AiBubble` acts as an ambient site concierge: it answers platform navigation questions, provides keyboard shortcut reminders, and looks up live profile metrics without interrupting the user's flow. In contrast, `Assistant.jsx` is a dedicated deep-work console designed for heavy generation (5-stage system design blueprints, multi-section resume audits). Both components share a single client service layer (`src/services/aiService.js`), eliminating code duplication.

### Q3: Why is Firestore structured with a subcollection (`profiles/{userId}/projects`) instead of a root `projects` collection?

> **Answer**: Subcollections enforce a clean security boundary. A single security rule:
>
> ```javascript
> match /profiles/{userId}/{document=**} {
>   allow read, write: if request.auth != null && request.auth.uid == userId;
> }
> ```
>
> securely protects both the user profile document and all underlying project tasks with a single permission check. This completely prevents multi-tenant data bleed.

---

## 🛠️ Debugging Chronicles (Viva Case Studies)

To demonstrate genuine engineering problem-solving rather than boilerplate generation, here are three notable bugs resolved during development:

1. **The "Client Is Offline" Firestore Saga**:
   - *Symptom*: All Firestore calls failed with `FirebaseError: Failed to get document because the client is offline`, despite the Network tab reporting `200 OK`.
   - *Debugging Process*: Tested in Incognito to rule out extensions; forced Firestore long-polling to rule out WebChannel issues; tested across different machines and mobile hotspots.
   - *Root Cause*: The Cloud Firestore database had never been provisioned in the Firebase Console (the console was still showing the initial setup wizard). Provisioning the database immediately resolved the issue.
2. **Groq Model Deprecation & Endpoint Migration**:
   - *Symptom*: Assistant suddenly failed with HTTP 404/400 errors.
   - *Debugging Process*: Discovered that `llama-3.3-70b-versatile` and `llama-3.1-8b-instant` were deprecated by Groq mid-project. Also caught an endpoint confusion between Groq Cloud and xAI's "Grok".
   - *Resolution*: Queried Groq's `/models` endpoint directly to identify `openai/gpt-oss-20b` as a stable, ultra-fast replacement, and corrected the endpoint URL.
3. **Honest Cloud Sync Audit (Eliminating "Realtime Active" Overclaim)**:
   - *Symptom*: Settings Drawer originally claimed "Status: Realtime Active".
   - *Resolution*: Audited codebase for `onSnapshot()` and found none. Replaced the label with honest status reporting (`Status: Synced` / `Last sync: [timestamp]`) and connected the "Sync Now" button to execute genuine Firestore `getDoc` / `getProjects` calls.

---

## 🔒 Proprietary Academic Notice (NOT Open Source)

> ### ⚠️ STRICT PROPRIETARY NOTICE
>
> **This repository and its codebase are NOT open source.**
>
> This project is the exclusive intellectual property of **Tiksha**, **Tammana**, and **Pranav Pushya**, developed as an official academic engineering evaluation project for **Course 25CSE0203 (Front End Engineering-II)** at **Chitkara University**.
>
> - **No Open Source License**: No license (MIT, Apache, GPL, etc.) is granted.
> - **Prohibited Actions**: Any unauthorized copying, commercial distribution, public re-hosting, assignment plagiarism, or reproduction of this source code without the express written permission of the authors and Chitkara University is strictly prohibited.
>
> *Copyright © 2026 Tiksha, Tammana, Pranav Pushya — All Rights Reserved.*
