# caffold — Developer Platform & Engineering Journal

> A modular Single Page Application (SPA) built with **Vanilla JS**, **Vite**, **Firebase (Auth & Firestore)**, and **Tailwind CSS**. Designed for engineering portfolios, developer log tracking, and project management.

---

## 🌟 Highlights & Features

- **⚡ Terminal Kernel Loader (`#boot`)**: Fullscreen retro system loader sequence executing on initial load and refresh with automated authentication routing.
- **🔐 Multi-Factor Auth & Captcha Guard (`#login`)**:
  - Firebase Email/Password authentication & Google Single Sign-On.
  - Interactive security math reCAPTCHA verification challenge.
- **👤 Firestore Developer Profile (`#profile`)**: Real-time management of technical bios, education, skill sets, and career targets backed by Firestore and local caching (`profileStore.js`).
- **📋 Project Tracker CRUD (`#tracker`)**: Active project tracking with progress meters, technology tags, and live create/delete operations.
- **🎨 Dynamic 3-Theme System (`themeManager.js`)**:
  - Themes: `Dark` (Amber glow), `Light` (High contrast clay), and `Cyber` (Matrix CRT scanline mode).
  - Persistence via `localStorage` + instant keyboard shortcut (`T`).
- **🧩 Hash-Based SPA Router (`router.js`)**: Seamless client-side routing with route protection guards (`protectedRoute.js`).

---

## 👥 Team Authorship (PBE-I Deliverable)

| Team Member             | Role                   | Key Contributions                                                                                                                     |
| :---------------------- | :--------------------- | :------------------------------------------------------------------------------------------------------------------------------------ |
| **Tiksha (Lead)** | UI/UX & Design System  | Theme tokens (`themes.css`), Global design system, Page layouts & styling.                                                          |
| **Pranav**        | Backend & Security     | Firebase Auth & Firestore isolation,`SCHEMA.md`, State stores (`profileStore`, `trackerStore`), Security guards, Theme Manager. |
| **Tammana**       | Client Logic & Routing | SPA Hash Router (`router.js`), Login/Signup form handlers, Profile forms & validation.                                              |

---

## 📂 Project Architecture

```
scaffold/
├── index.html                           # SPA mount entry point
├── README.md                            # Project documentation
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
│   └── pages/                           # Modular views (boot, login, home, dashboard, profile, tracker)
└── styles/
    ├── themes.css                       # CSS custom properties for dark/light/cyber themes
    └── globals.css                      # Global layout resets, typography & marquee animation
```

---

## 🚀 Quick Start & Local Setup

### Prerequisites

- Node.js (v16+ recommended)
- npm or yarn

### Installation

1. Clone or navigate to the repository directory:

   ```bash
   cd devlog
   ```
2. Install dependencies (if using Vite/npm tooling):

   ```bash
   npm install
   ```
3. Start the development server:

   ```bash
   npm run dev
   ```
4. Open your browser at `http://localhost:5173` (or the port specified in terminal).

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

- Press **`T`** anywhere on the site (outside text inputs) to instantly cycle between **Dark**, **Light**, and **Cyber** themes.

---

## 📜 License

Developed for Practical Based Evaluation I (PBE-I). Free for educational and developer usage.
