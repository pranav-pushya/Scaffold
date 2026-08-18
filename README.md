# Scaffold — Developer Platform, Portfolio & AI Assistant Engine

> A modular, high-contrast Single Page Application (SPA) built with **Vanilla JS**, **Vite**, **Firebase (Auth & Firestore)**, **Groq AI API**, and **Vanilla CSS / Tailwind**. Built for developer career management, live portfolio generation, Kanban tracking, and AI-assisted engineering workflows.

---

## 🌟 Key Features & Ecosystem

- **🤖 Groq AI Career & Code Assistant (`#assistant`)**:
  - Powered by **Groq Cloud API** (`openai/gpt-oss-20b`) with seamless `.env` API key retrieval (`VITE_GROQ_API_KEY`).
  - Context-aware engine indexing user's real Profile OS fields and active Kanban projects.
  - Interactive modes: *ATS Career Coach*, *System Architect*, *Code Auditor*, and *Project Generator*.
  - Prompt shortcuts for ATS resume auditing, portfolio bio generation, and architecture prep.

- **📊 Reference-Grade Developer Dashboard (`#dashboard`)**:
  - Dynamic **Profile Readiness %** calculator and **ATS Score Heuristic** (`0-100/100` with grade badges).
  - Live Kanban project metrics (*Total Projects*, *In Progress*, *Completed*).
  - Active deliverables list and integrated AI Coach recommendations.

- **💼 Live Web Portfolio (`#portfolio`)**:
  - Dynamically generated developer portfolio reflecting real-time Profile OS records & verified Kanban cards.

- **📄 ATS Resume Exporter (`#resume`)**:
  - High-contrast, ATS-optimized printable CV synced directly with Profile OS data.

- **👤 Firestore Developer Profile OS (`#profile`)**:
  - Real-time management of technical bios, education, skill sets, contact info, and target roles backed by Firestore.

- **📋 Kanban Project Tracker (`#tracker`)**:
  - Interactive developer task board (To-Do, In Progress, Done) with technology tags and live links.

- **📱 Mobile-First Responsive Drawer Navigation**:
  - Touch-friendly responsive hamburger drawer menu for mobile devices, automatically hidden on desktop/laptops.

- **🎨 3-Theme System (`themeManager.js`)**:
  - Themes: `Dark` (Amber glow), `Light` (High contrast clay), and `Cyber` (Matrix CRT scanline mode).
  - Theme-matched form controls, custom dropdown select options, and instant keyboard shortcut (**`T`**).

- **🔐 Authentication & Security (`#login`)**:
  - Firebase Email/Password & Google Single Sign-On with interactive captcha math verification.
  - Logout confirmation modal dialog and protected route guards.

---

## 👥 Team Authorship (PBE-I Deliverable)

| Team Member             | Role                   | Key Contributions                                                                                                                     |
| :---------------------- | :--------------------- | :------------------------------------------------------------------------------------------------------------------------------------ |
| **Tiksha (Lead)** | UI/UX & Design System  | Theme tokens (`themes.css`), ClayGlass visual design system, mobile responsive layouts & styling.                                      |
| **Pranav**        | Backend & Security     | Firebase Auth & Firestore isolation, `SCHEMA.md`, Groq AI Engine integration, state stores (`profileStore`, `trackerStore`), Security guards. |
| **Tammana**       | Client Logic & Routing | SPA Hash Router (`router.js`), Login/Signup form handlers, Profile OS forms & ATS exporter view.                                     |

---

## 📂 Project Architecture

```
scaffold/
├── index.html                           # SPA mount entry point
├── .env                                 # Local environment variables (VITE_GROQ_API_KEY)
├── .env.example                         # Environment template file
├── README.md                            # Documentation
├── docs/
│   ├── SCHEMA.md                        # Firestore collections & schema definition
├── firebase/
│   ├── firebaseConfig.js                # Firebase initialization & auth state
│   ├── authService.js                   # Email/Password & Google Auth wrappers
│   └── firestoreService.js              # Firestore CRUD operations for profiles & projects
├── js/
│   ├── main.js                          # SPA Bootstrap loader
│   ├── router.js                        # Client hash-based router & guards
│   ├── store/                           # Local cache stores (profileStore, trackerStore)
│   ├── theme/                           # Multi-theme switcher engine (themeManager.js)
│   ├── components/                      # Navbar, Footer & ProtectedRoute guards
│   └── pages/                           # Modular views (boot, login, home, dashboard, profile, tracker, portfolio, resume, assistant)
└── styles/
    ├── themes.css                       # CSS custom properties for dark/light/cyber themes
    └── globals.css                      # Global resets, responsive nav styles, select option themes
```

---

## 🚀 Quick Start & Local Setup

### Prerequisites

- Node.js (v16+ recommended)
- npm or yarn

### Installation

1. Clone or navigate to the repository directory:
   ```bash
   cd scaffold
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure Environment Variables:
   Create a `.env` file in the root directory and insert your Groq Cloud API key:
   ```env
   VITE_GROQ_API_KEY=gsk_your_groq_api_key_here
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open your browser at `http://localhost:5173`.

---

## 🔑 Firebase Configuration

To connect the application to your live Firebase backend:

1. Open `firebase/firebaseConfig.js`.
2. Replace placeholder API keys with your Firebase Web App credentials:
   ```javascript
   export const firebaseConfig = {
       apiKey: "YOUR_FIREBASE_API_KEY",
       authDomain: "YOUR_PROJECT.firebaseapp.com",
       projectId: "YOUR_PROJECT_ID",
       storageBucket: "YOUR_PROJECT.appspot.com",
       messagingSenderId: "YOUR_SENDER_ID",
       appId: "YOUR_APP_ID"
   };
   ```

---

## ⌨️ Keyboard Shortcuts

- Press **`T`** anywhere on the site (outside input fields) to cycle between **Dark**, **Light**, and **Cyber** themes.

---

## 📜 License

Developed for Practical Based Evaluation I (PBE-I). Free for educational and developer usage.
