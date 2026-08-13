scaffold/
│
├── index.html                          ← single SPA entry
├── firebase.json                       ← Firebase Hosting config
├── .firebaserc                         ← Firebase project linking
├── package.json
├── vite.config.js
│
├── docs/
│   └── SCHEMA.md                       ← [Pranav]
│
├── firebase/                           ← [Pranav] — all Firebase logic isolated here
│   ├── firebaseConfig.js               ← initializeApp(), exports auth/db instances
│   ├── authService.js                  ← signup, login, logout, Google-login functions
│   └── firestoreService.js             ← CRUD wrappers: saveProfile(), getProfile(), etc.
│
├── js/
│   ├── main.js                         ← app bootstrap, calls router init
│   ├── router.js                       ← [Tammana] hash-based routing
│   │
│   ├── store/                          ← [Pranav] — local cache layer (mirrors Firestore)
│   │   ├── profileStore.js
│   │   └── trackerStore.js
│   │
│   ├── theme/
│   │   └── themeManager.js             ← [Pranav] theme-switch + localStorage persist
│   │
│   ├── pages/
│   │   ├── boot/
│   │   │   ├── boot.js                 ← [Pranav] typing-sequence logic
│   │   │   └── boot.css                ← [Tiksha]
│   │   │
│   │   ├── login/
│   │   │   ├── login.js                ← [Tammana] form logic + [Pranav] authService calls
│   │   │   ├── captcha.js              ← [Pranav] reCAPTCHA widget wrapper
│   │   │   └── login.css               ← [Tiksha] split-layout styling
│   │   │
│   │   ├── home/
│   │   │   ├── home.js                 ← [Tiksha] content + light animation
│   │   │   └── home.css
│   │   │
│   │   ├── dashboard/
│   │   │   ├── dashboard.js            ← [Tammana] skeleton/routing only in PBE-I
│   │   │   └── dashboard.css
│   │   │
│   │   ├── profile/
│   │   │   ├── profile.js              ← [Tammana] logic
│   │   │   └── profile.css             ← [Tiksha]
│   │   │
│   │   └── tracker/
│   │       ├── tracker.js              ← [Pranav] logic
│   │       └── tracker.css             ← [Tiksha]
│   │
│   └── components/
│       ├── navbar.js                   ← [Tiksha] + [Pranav] wires logout/theme-switch
│       ├── footer.js                   ← [Tiksha]
│       └── protectedRoute.js           ← [Pranav] auth-check before page render
│
├── styles/
│   ├── globals.css                     ← [Tiksha]
│   └── themes.css                      ← [Tiksha] CSS variables (dark/light/terminal)
│
└── README.md
