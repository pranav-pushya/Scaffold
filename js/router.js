// === SPA ROUTER ===
// Hash-based client router handling page transitions, auth guards & component mounting

import { renderNavbar, bindNavbarEvents } from './components/navbar.js';
import { renderFooter } from './components/footer.js';
import { requireAuth } from './components/protectedRoute.js';

import { renderHomePage, bindHomeEvents } from './pages/home/home.js';
import { renderBootPage, initBootSequence } from './pages/boot/boot.js';
import { renderLoginPage, bindLoginEvents } from './pages/login/login.js';
import { renderDashboardPage, bindDashboardEvents } from './pages/dashboard/dashboard.js';
import { renderProfilePage, bindProfileEvents } from './pages/profile/profile.js';
import { renderTrackerPage, bindTrackerEvents } from './pages/tracker/tracker.js';
import { renderPortfolioPage } from './pages/portfolio/portfolio.js';
import { renderResumePage, bindResumeEvents } from './pages/resume/resume.js';
import { renderAssistantPage, bindAssistantEvents } from './pages/assistant/assistant.js';

const routes = {
    '#boot': { render: renderBootPage, bind: initBootSequence, protected: false },
    '#home': { render: renderHomePage, bind: bindHomeEvents, protected: false },
    '#login': { render: renderLoginPage, bind: bindLoginEvents, protected: false },
    '#dashboard': { render: renderDashboardPage, bind: bindDashboardEvents, protected: true },
    '#profile': { render: renderProfilePage, bind: bindProfileEvents, protected: true },
    '#tracker': { render: renderTrackerPage, bind: bindTrackerEvents, protected: true },
    '#portfolio': { render: renderPortfolioPage, bind: null, protected: true },
    '#resume': { render: renderResumePage, bind: bindResumeEvents, protected: true },
    '#assistant': { render: renderAssistantPage, bind: bindAssistantEvents, protected: true },
};

export async function handleRouting() {
    const appEl = document.getElementById('app');
    if (!appEl) return;

    let hash = window.location.hash;
    if (!hash || hash === '#' || !routes[hash]) {
        hash = '#boot';
    }

    const route = routes[hash];

    // Check protected route guard
    if (route.protected && !requireAuth()) {
        return; // Guard redirects to #login
    }

    // Render HTML layout
    const contentHtml = await route.render();
    
    // Boot screen renders full screen as the loader without navbar/footer
    if (hash === '#boot') {
        appEl.innerHTML = contentHtml;
    } else {
        appEl.innerHTML = `
            ${renderNavbar()}
            <main id="mainContent">
                ${contentHtml}
            </main>
            ${renderFooter()}
        `;
        bindNavbarEvents();
    }

    // Bind event handlers
    if (route.bind) {
        route.bind();
    }

    window.scrollTo(0, 0);
}

export function initRouter() {
    window.addEventListener('hashchange', handleRouting);

    // Force loader animation on every hard refresh / initial site entry
    const initialTarget = window.location.hash || '#home';
    if (initialTarget !== '#boot') {
        sessionStorage.setItem('scaffold_redirect_target', initialTarget);
        window.location.hash = '#boot';
        handleRouting();
    } else {
        handleRouting();
    }
}
