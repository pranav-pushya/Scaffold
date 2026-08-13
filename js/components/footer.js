// === FOOTER COMPONENT ===
// Render consistent footer section with Team Members & Platform Highlights

const TEAM_MEMBERS = [
    {
        name: 'Pranav Pushya',
        role: 'State & AI Integration',
        avatar: 'PP',
        githubUrl: 'https://github.com/pranav-pushya',
        linkedinUrl: 'https://www.linkedin.com/in/pranav-pushya/',
    },
    {
        name: 'Tiksha',
        role: 'UI/UX & Design System',
        avatar: 'T',
        githubUrl: 'https://github.com/tiksha26',
        linkedinUrl: 'https://www.linkedin.com/in/tiksha-642255370?utm_source=share_via&utm_content=profile&utm_medium=member_android',
    },
    {
        name: 'Tammanna Kakkar',
        role: 'ATS Engine & Resume Exporter',
        avatar: 'TK',
        githubUrl: 'https://github.com',
        linkedinUrl: 'https://linkedin.com',
    },
];

const PLATFORM_HIGHLIGHTS = [
    'Profile OS',
    'AI Project Coach',
    'Kanban Tracker',
    'Auto Portfolio',
    'ATS Resume Exporter',
];

export function renderFooter() {
    return `
    <footer class="py-14 px-6 border-t mt-auto" style="border-color: var(--border); background: var(--bg-elev);">
        <div class="max-w-7xl mx-auto">
            <div class="grid grid-cols-1 lg:grid-cols-12 gap-10 mb-12">
                
                <!-- Brand & Highlights -->
                <div class="lg:col-span-5 flex flex-col justify-between">
                    <div>
                        <a href="#home" class="font-mono font-bold text-xl flex items-center mb-4"
                            style="color: var(--fg); text-decoration: none;">
                            <span style="color: var(--accent);">&lt;/S&gt;</span>caffold<span class="logo-cursor"></span>
                        </a>
                        <p class="text-sm text-muted mb-6 leading-relaxed max-w-md">
                            Next-generation engineering workspace integrating developer profiles, automated portfolios, project tracking, and intelligent career tools.
                        </p>
                    </div>

                    <!-- Platform Highlights Pills -->
                    <div>
                        <span class="tag mb-3 inline-block">Platform Modules</span>
                        <div class="flex flex-wrap gap-2">
                            ${PLATFORM_HIGHLIGHTS.map(item => `
                                <span class="font-mono text-xs px-3 py-1 rounded border" 
                                      style="background: var(--bg); border-color: var(--border-strong); color: var(--fg-dim);">
                                    <i class="fas fa-cube text-xs text-amber-500 mr-1"></i> ${item}
                                </span>
                            `).join('')}
                        </div>
                    </div>
                </div>

                <!-- Core Team Members -->
                <div class="lg:col-span-7">
                    <span class="tag mb-4 inline-block">Core Engineering Team</span>
                    <div class="grid sm:grid-cols-3 gap-4">
                        ${TEAM_MEMBERS.map(member => `
                            <div class="p-4 rounded-lg border flex flex-col justify-between" 
                                 style="background: var(--card); border-color: var(--border);">
                                <div>
                                    <div class="flex items-center gap-3 mb-3">
                                        <div class="w-9 h-9 rounded-full flex items-center justify-center font-mono text-xs font-bold"
                                             style="background: var(--accent); color: var(--bg);">
                                            ${member.avatar}
                                        </div>
                                        <div>
                                            <div class="font-bold text-sm" style="color: var(--fg);">${member.name}</div>
                                            <div class="font-mono text-xs" style="color: var(--accent-2);">${member.role}</div>
                                        </div>
                                    </div>
                                </div>

                                <div class="flex items-center gap-3 pt-3 border-t font-mono text-xs" style="border-color: var(--border);">
                                    <a href="${member.githubUrl}" target="_blank" rel="noopener" class="hover-link flex items-center gap-1">
                                        <i class="fab fa-github"></i> GitHub
                                    </a>
                                    <span style="color: var(--muted);">·</span>
                                    <a href="${member.linkedinUrl}" target="_blank" rel="noopener" class="hover-link flex items-center gap-1">
                                        <i class="fab fa-linkedin"></i> LinkedIn
                                    </a>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>

            </div>

            <!-- Terminal Footer Status Bar -->
            <div class="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8 font-mono text-xs border-t"
                style="border-color: var(--border); color: var(--muted);">
                <div>
                    © 2026 Scaffold Platform 
                </div>
                <div>
                    <span style="color: var(--accent);">$</span> echo "thanks for using scaffold" | sudo tee /dev/stdout
                </div>
            </div>
        </div>
    </footer>
    `;
}
