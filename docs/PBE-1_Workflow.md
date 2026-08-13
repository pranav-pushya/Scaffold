# Scaffold — PBE-I Workflow
### Vanilla JS + Firebase (Auth, Firestore, Hosting) + Captcha

Team: Tiksha (Lead), Tammana, Pranav

---

## Non-Negotiable Priority Order

If time runs short, complete these in order — do not skip ahead:

1. **Auth (login/signup + captcha)** — explicitly required by evaluator, highest marks-weight
2. **Profile save/load (Firestore)**
3. **Basic navigation (reaching dashboard)**
4. **Theme system**
5. **Tracker functionality** — if time is short, show UI only; defer full logic to PBE-II
6. **3D/scroll animations, extra theme variants** — first things to cut if squeezed for time

---

## Day 1 — Setup (parallel start)

**Pranav**
- Create Firebase project (enable Auth, Firestore, Hosting)
- Write `firebaseConfig.js`, `authService.js`, `firestoreService.js`

**Tiksha**
- Vite project init, finalize folder structure
- Tailwind/CSS setup, start dark-theme tokens (`themes.css`)

**Tammana**
- Build `router.js` (hash-based routing skeleton) — 5 empty pages switchable

**End-of-day sync**: Everyone shows their setup, resolve blockers immediately.

---

## Day 2 — Schema + Boot Screen

**Pranav**
- Write `SCHEMA.md`
- Build `profileStore.js` / `trackerStore.js` (local cache layer)
- Write boot-screen typing logic

**Tiksha**
- Boot screen CSS (terminal style)
- Start login page split-layout CSS

**Tammana**
- Login/Signup form HTML structure (email, password, confirm fields)

**Deliverable**: Boot screen animation works; schema doc ready and shared.

---

## Day 3 — Captcha + Auth Wiring

**Pranav**
- Integrate reCAPTCHA widget, write `captcha.js`
- Wire Google-login button to `authService`

**Tiksha**
- Complete login page visual polish (both panels)
- Static navbar/footer HTML + CSS

**Tammana**
- Write signup/login form submit logic, call Pranav's `authService` functions (email/password flow)

**Deliverable**: Email/password signup + login works end-to-end (user appears in Firebase console).

---

## Day 4 — Google Login + Protected Routes

**Pranav**
- Test Google login end-to-end
- Write `protectedRoute.js` (block dashboard access without login)

**Tammana**
- Wire protected-route logic into router
- Connect logout button (place in profile dropdown for now)

**Tiksha**
- Home page content + light scroll-reveal animation (no Three.js yet)

**Deliverable**: Google login works; logged-out users are redirected away from the dashboard.

---

## Day 5 — Theme System

**Pranav**
- Write `themeManager.js` (save/load theme preference via localStorage, toggle class on `<body>`)

**Tiksha**
- Fully polish dark theme (top priority)
- Prepare basic light-theme CSS variables

**Tammana**
- Wire theme-switch button in navbar to `themeManager`

**Deliverable**: Dark + Light themes both switchable. (Terminal green/blue variants are optional stretch goals.)

---

## Day 6 — Profile Page

**Pranav**
- Connect Firestore save/load logic (`saveProfile`, `getProfile`) to the profile page

**Tammana**
- Build profile form (name, skills, education, goal) — controlled inputs + validation

**Tiksha**
- Profile page CSS, form styling

**Deliverable**: User can fill profile, it saves to Firestore, and reloads correctly on refresh.

---

## Day 7 — Dashboard + Tracker Skeleton

**Pranav**
- Tracker store CRUD logic (add/update/delete project) — logic only, minimal UI

**Tammana**
- Dashboard skeleton — profile summary + navigation cards to tracker/portfolio/resume/AI-suggestion (links only, no functionality yet)

**Tiksha**
- Dashboard CSS, basic tracker card UI

**Deliverable**: All sections reachable from dashboard; at least one project can be added/deleted in tracker.

---

## Day 8 — Integration Day

**All three members together**
- Test full flow: Boot → Login (captcha + auth) → Home → Dashboard → Profile → Tracker → Logout
- List all bugs, fix by priority (auth bugs > navigation bugs > CSS bugs)

**Deliverable**: End-to-end flow runs without crashing.

---

## Day 9 — Polish + Deploy

**Pranav**
- Deploy to Firebase Hosting, test production URL, verify `.env` keys aren't leaked

**Tiksha**
- Responsive check (mobile/tablet), finalize footer, add terminal-theme variants if time allows

**Tammana**
- Handle form validation edge cases (empty fields, invalid password format), clean up error messages

**Deliverable**: Live deployed link works correctly, including on mobile.

---

## Day 10 — Buffer + Presentation Prep

- Fix any remaining bugs
- Each member practices explaining their own module for viva (schema, auth flow, theme system — everyone should understand their part, not just their teammate's)
- Build presentation (Tiksha leads, per her design role)

---

## During the Evaluation Window

No new features. Only demo rehearsal and minor fixes.
