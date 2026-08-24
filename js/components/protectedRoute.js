import { getCurrentAuthUser } from '../../firebase/authService.js';

export function requireAuth() {
    const user = getCurrentAuthUser();
    if (!user) {
        window.location.hash = '#login';
        return false;
    }
    return true;
}
