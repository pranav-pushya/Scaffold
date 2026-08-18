// === CAPTCHA MODULE ===
// Simulated reCAPTCHA v2 / Math Captcha widget verification logic

let captchaVerified = false;

export function renderCaptchaWidget() {
    captchaVerified = false;
    const num1 = Math.floor(Math.random() * 9) + 1;
    const num2 = Math.floor(Math.random() * 9) + 1;
    const expected = num1 + num2;

    return {
        html: `
        <div class="p-4 rounded border my-4" style="background: var(--bg-elev); border-color: var(--border-strong);">
            <div class="flex items-center justify-between mb-2">
                <span class="text-xs font-mono" style="color: var(--muted);"><i class="fas fa-shield-alt text-amber-500"></i> Security Check</span>
                <span class="tag">SECURITY CHECK</span>
            </div>
            <div class="flex items-center gap-3">
                <span class="font-mono text-sm font-bold" style="color: var(--fg);">What is ${num1} + ${num2}?</span>
                <input type="number" id="captchaAnswer" data-expected="${expected}" class="input-field py-1.5 px-3 text-xs w-24" placeholder="Answer">
            </div>
        </div>
        `,
        verify: () => {
            const input = document.getElementById('captchaAnswer');
            if (!input) return false;
            return parseInt(input.value) === parseInt(input.dataset.expected);
        }
    };
}
