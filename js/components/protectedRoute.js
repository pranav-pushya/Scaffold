// === PROTECTED ROUTE GUARD ===
// Checks user authentication status before granting page view access

import { getCurrentAuthUser } from '../../firebase/authService.js';

export function requireAuth() {
    const user = getCurrentAuthUser();
    if (!user) {
        window.location.hash = '#login';
        return false;
    }
    return true;
}
