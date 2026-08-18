# Scaffold — A unified developer identity/growth workspace built for PBE-I (25CSE0203 Front End Engineering-II)

---

## 🌐 Live Demo

- **Deployed Application URL**: [https://scaffold-app-90278.web.app](https://scaffold-app-90278.web.app)

---

## 👥 Team & Authorship

- **Tiksha** (Team Lead) — Group 3G5
- **Tammana** — Group 3G5
- **Pranav Pushya** — Group 3G5

*Course*: PBE-I (25CSE0203 Front End Engineering-II), Chitkara University.

---

## 🛠 Tech Stack

- **Core**: Vanilla JavaScript (ES6+), HTML5, CSS3 / Custom Utility Tokens (aligned with PBE-I syllabus scope)
- **Firebase Platform**:
  - **Firebase Authentication**: Email/Password authentication & Google OAuth (`signInWithPopup`).
  - **Cloud Firestore**: Real-time NoSQL database structured under per-user path hierarchy (`profiles/{userId}` and `profiles/{userId}/projects`), initialized with forced long-polling (`experimentalForceLongPolling: true`).
  - **Firebase Hosting**: Deployed web host.
- **AI Integration**: Groq Cloud API (`https://api.groq.com/openai/v1/chat/completions`) using model `openai/gpt-oss-20b` via `VITE_GROQ_API_KEY`.
- **Build Tool**: Vite

---

## 🌟 Implemented Features

1. **Terminal-Style Boot Sequence (`#boot`)**: Interactive developer boot animation with simulated system diagnostic sequence.
2. **Authentication & Security Check (`#login`)**:
   - Email/Password Signup & Login with profile initialization (`updateProfile`).
   - Google Single Sign-On (SSO).
   - Custom client-side math captcha verification challenge (`SECURITY CHECK`).
   - Hash-based protected route guards (`requireAuth`).
3. **Multi-Theme Engine (`themeManager.js`)**:
   - 3 dynamic themes: `Dark` (Amber glow), `Light` (High contrast clay), and `Cyber` (CRT scanline mode).
   - LocalStorage theme persistence and instant keyboard shortcut (`T`).
4. **Developer Profile OS (`#profile`)**: Form interface managing personal bio, skills, education, target roles, social links, and profile photos saved to Firestore.
5. **Kanban Project Tracker (`#tracker`)**: Task board managing project cards across *To-Do*, *In Progress*, and *Done* states with live CRUD operations in Firestore.
6. **Dynamic Web Portfolio (`#portfolio`)**: Live showcase dynamically rendered from the user's Firestore profile and project records.
7. **ATS Resume Exporter (`#resume`)**: Printable ATS-structured resume view hydrated directly from Profile OS data.
8. **Groq AI Career & Code Assistant (`#assistant`)**: Context-aware LLM assistant indexing profile data and Kanban projects with specialized modes (*ATS Career Coach*, *System Architect*, *Code Auditor*, *Project Generator*).

---

## ⚠️ Known Limitations

1. **Client-Side Math Captcha**: The login verification is a custom client-side arithmetic challenge (`num1 + num2`), not Google's server-verified reCAPTCHA widget.
2. **Firestore Rules in Test Mode**: Firestore backend security rules operate in Test Mode. Document isolation is enforced at the client application layer using Auth UID document paths (`profiles/{userId}`).
3. **Network Latency Tolerance**: High-latency network environments (e.g., corporate proxies) may experience long-polling connection handshake delays on initial load; mitigated via forced long-polling configuration and non-blocking 20-second async hydration timeouts.

---

## 🚀 Local Development Setup

### Prerequisites

- Node.js (v16 or higher)
- npm

### Installation & Execution

1. Clone the repository and navigate into the directory:

   ```bash
   cd scaffold
   ```
2. Install dependencies:

   ```bash
   npm install
   ```
3. Create a `.env` file in the project root containing the following keys (populate with your own Firebase & Groq credentials):

   ```env
   VITE_GROQ_API_KEY=your_groq_api_key
   VITE_FIREBASE_API_KEY=your_firebase_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
   VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
   VITE_FIREBASE_APP_ID=your_firebase_app_id
   ```
4. Start the local development server:

   ```bash
   npm run dev
   ```

---

## 🎓 Academic Note

This project is submitted as an official PBE-I (Practical Based Evaluation I) academic assignment for the **Front End Engineering-II (25CSE0203)** course at **Chitkara University**.
