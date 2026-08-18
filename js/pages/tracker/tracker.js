// === KANBAN JOB & PROJECT TRACKER PAGE ===
// Real-time 3-column Kanban project tracker matching specification with non-blocking initial rendering

import { getCurrentAuthUser } from '../../../firebase/authService.js';
import { getProjects, saveProject, updateProject, deleteProject, fetchWithTimeout } from '../../../firebase/firestoreService.js';

let cachedProjects = [];

export function renderTrackerPage() {
    return `
    <div class="tracker-wrapper">
        <div class="tracker-container">
            
            <!-- Page Header -->
            <div class="flex items-center justify-between mb-8 border-b pb-6" style="border-color: var(--border);">
                <div>
                    <h1 class="font-display font-bold text-3xl mb-2" style="color: var(--fg);">Job & Project Tracker</h1>
                    <p class="text-sm text-muted">Manage application progress and move cards through columns.</p>
                </div>
                <button id="toggleCardFormBtn" class="btn-primary text-xs px-4 py-2.5" style="background: #10b981; color: #fff;">
                    <i class="fas fa-plus mr-1"></i> Add New Card
                </button>
            </div>

            <!-- Async Loading / Connection Error Status Indicator -->
            <div id="trackerDataStatus" class="mb-6 p-3 rounded-lg border font-mono text-xs hidden" style="background: var(--card); border-color: var(--border);">
            </div>

            <!-- Create / Edit Tracker Card Form Container -->
            <div id="cardFormContainer" class="hidden mb-10 p-6 rounded-xl border" style="background: rgba(var(--accent-rgb), 0.015); border-color: var(--border-strong);">
                <h3 id="cardFormTitle" class="font-display font-bold text-xl mb-6" style="color: var(--fg);">Create Tracker Card</h3>
                
                <form id="trackerCardForm" class="space-y-6">
                    <input type="hidden" id="cardEditId" value="">

                    <div class="grid md:grid-cols-2 gap-6">
                        <div>
                            <label class="profile-label">CARD TITLE *</label>
                            <input type="text" id="cardTitle" class="profile-input" placeholder="e.g. Build E-commerce Frontend" required>
                        </div>
                        <div>
                            <label class="profile-label">TECH STACK (COMMA SEPARATED)</label>
                            <input type="text" id="cardTech" class="profile-input" placeholder="e.g. React, Tailwind, Zustand">
                        </div>
                    </div>

                    <div class="grid md:grid-cols-2 gap-6">
                        <div>
                            <label class="profile-label">REPOSITORY URL</label>
                            <input type="url" id="cardRepo" class="profile-input" placeholder="e.g. https://github.com/user/repo">
                        </div>
                        <div>
                            <label class="profile-label">DEPLOY URL</label>
                            <input type="url" id="cardDeploy" class="profile-input" placeholder="e.g. https://my-app.vercel.app">
                        </div>
                    </div>

                    <div>
                        <label class="profile-label">STATUS COLUMN</label>
                        <select id="cardStatus" class="profile-select">
                            <option value="To-Do">To-Do</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Done">Done</option>
                        </select>
                    </div>

                    <div>
                        <label class="profile-label">NOTES / DESCRIPTION</label>
                        <textarea id="cardDesc" class="profile-input h-24" placeholder="Add key objectives or notes..."></textarea>
                    </div>

                    <div class="flex items-center justify-end gap-3 pt-4 border-t" style="border-color: var(--border);">
                        <button type="button" id="cancelCardFormBtn" class="btn-secondary text-xs px-4 py-2">Cancel</button>
                        <button type="submit" class="btn-primary text-xs px-5 py-2" style="background: #10b981; color: #fff;">Save Card</button>
                    </div>
                </form>
            </div>

            <!-- Kanban 3-Column Grid -->
            <div class="kanban-grid">
                
                <!-- To-Do Column -->
                <div class="kanban-column">
                    <div class="flex items-center justify-between mb-6 pb-2 border-b" style="border-color: var(--border);">
                        <h3 class="font-mono font-bold text-sm" style="color: var(--fg);">To-Do</h3>
                        <span id="countTodo" class="w-6 h-6 rounded-full flex items-center justify-center font-mono text-xs border" style="border-color: var(--border-strong); color: var(--muted); background: var(--bg);">
                            0
                        </span>
                    </div>
                    <div id="columnTodo" class="space-y-4 flex-1">
                        <div class="text-xs text-muted font-mono italic p-4 text-center border border-dashed rounded-lg" style="border-color: var(--border);">
                            <i class="fas fa-circle-notch fa-spin mr-1 text-emerald-500"></i> Syncing cards...
                        </div>
                    </div>
                </div>

                <!-- In Progress Column -->
                <div class="kanban-column">
                    <div class="flex items-center justify-between mb-6 pb-2 border-b" style="border-color: var(--border);">
                        <h3 class="font-mono font-bold text-sm text-emerald-500">In Progress</h3>
                        <span id="countInProgress" class="w-6 h-6 rounded-full flex items-center justify-center font-mono text-xs border" style="border-color: var(--border-strong); color: var(--muted); background: var(--bg);">
                            0
                        </span>
                    </div>
                    <div id="columnInProgress" class="space-y-4 flex-1">
                        <div class="text-xs text-muted font-mono italic p-4 text-center border border-dashed rounded-lg" style="border-color: var(--border);">
                            <i class="fas fa-circle-notch fa-spin mr-1 text-emerald-500"></i> Syncing cards...
                        </div>
                    </div>
                </div>

                <!-- Done Column -->
                <div class="kanban-column">
                    <div class="flex items-center justify-between mb-6 pb-2 border-b" style="border-color: var(--border);">
                        <h3 class="font-mono font-bold text-sm" style="color: var(--fg);">Done</h3>
                        <span id="countDone" class="w-6 h-6 rounded-full flex items-center justify-center font-mono text-xs border" style="border-color: var(--border-strong); color: var(--muted); background: var(--bg);">
                            0
                        </span>
                    </div>
                    <div id="columnDone" class="space-y-4 flex-1">
                        <div class="text-xs text-muted font-mono italic p-4 text-center border border-dashed rounded-lg" style="border-color: var(--border);">
                            <i class="fas fa-circle-notch fa-spin mr-1 text-emerald-500"></i> Syncing cards...
                        </div>
                    </div>
                </div>

            </div>

        </div>
    </div>
    `;
}

function renderKanbanCard(card) {
    const tags = (card.techStack || card.tech || '').split(',').map(t => t.trim()).filter(Boolean);
    return `
    <div class="kanban-card" data-card-id="${card.id}">
        <div class="flex items-start justify-between gap-3 mb-3">
            <h4 class="font-display font-bold text-base leading-snug" style="color: var(--fg);">${card.title || card.name || 'Untitled Card'}</h4>
            <div class="flex items-center gap-1.5 shrink-0">
                <button class="card-action-btn edit-card-btn" data-edit-id="${card.id}" title="Edit Card">
                    <i class="fas fa-pencil"></i>
                </button>
                <button class="card-action-btn delete-card-btn" data-delete-id="${card.id}" title="Delete Card">
                    <i class="fas fa-xmark"></i>
                </button>
            </div>
        </div>

        ${tags.length ? `
            <div class="flex flex-wrap gap-1 mb-3">
                ${tags.map(t => `<span class="tech-tag">${t}</span>`).join('')}
            </div>
        ` : ''}

        ${card.description ? `
            <p class="text-xs text-muted leading-relaxed mb-4">${card.description}</p>
        ` : ''}

        <div class="flex items-center gap-3 text-xs mb-4 font-mono">
            ${card.repoUrl ? `<a href="${card.repoUrl}" target="_blank" rel="noopener" class="hover-link flex items-center gap-1" style="color: #10b981;">Repo ↗</a>` : ''}
            ${card.deployUrl ? `<a href="${card.deployUrl}" target="_blank" rel="noopener" class="hover-link flex items-center gap-1" style="color: #10b981;">Demo ↗</a>` : ''}
        </div>

        <div class="flex items-center justify-between pt-3 border-t font-mono text-xs" style="border-color: var(--border);">
            <span style="color: var(--muted);">Move to:</span>
            <select class="profile-select py-1 px-2 text-xs card-status-select" data-card-id="${card.id}" style="width: auto; height: 28px;">
                <option value="To-Do" ${card.status === 'To-Do' || !card.status ? 'selected' : ''}>To-Do</option>
                <option value="In Progress" ${card.status === 'In Progress' ? 'selected' : ''}>In Progress</option>
                <option value="Done" ${card.status === 'Done' ? 'selected' : ''}>Done</option>
            </select>
        </div>
    </div>
    `;
}

export function bindTrackerEvents() {
    const user = getCurrentAuthUser() || { uid: 'demo' };
    const toggleBtn = document.getElementById('toggleCardFormBtn');
    const formContainer = document.getElementById('cardFormContainer');
    const cancelBtn = document.getElementById('cancelCardFormBtn');
    const cardForm = document.getElementById('trackerCardForm');
    const formTitle = document.getElementById('cardFormTitle');
    const statusBox = document.getElementById('trackerDataStatus');

    // Intermediate 3s soft loading notice
    const slowTimer = setTimeout(() => {
        if (statusBox && !statusBox.classList.contains('hidden')) {
            statusBox.innerHTML = `<span class="text-amber-400"><i class="fas fa-circle-notch fa-spin mr-1"></i> Still loading, this may take a moment on slow connections...</span>`;
        }
    }, 3000);

    // 20s soft timeout notice
    const softTimeoutTimer = setTimeout(() => {
        if (statusBox && !statusBox.classList.contains('hidden')) {
            statusBox.innerHTML = `<span class="text-amber-400"><i class="fas fa-circle-notch fa-spin mr-1"></i> Still establishing Firestore connection...</span>`;
        }
    }, 20000);

    // Async data fetch with 20s timeout margin
    fetchWithTimeout(getProjects(user.uid), 20000)
        .then((projects) => {
            clearTimeout(slowTimer);
            clearTimeout(softTimeoutTimer);
            if (!projects) projects = [];
            cachedProjects = projects;
            if (statusBox) statusBox.classList.add('hidden');
            renderBoardColumns(projects);
        })
        .catch((err) => {
            clearTimeout(slowTimer);
            clearTimeout(softTimeoutTimer);
            console.error('Tracker fetch ACTUAL ERROR object:', err);
            if (statusBox) {
                statusBox.classList.remove('hidden');
                statusBox.innerHTML = `<span class="text-amber-400">⚠️ Unable to load saved cards — ${err.message || err}. You can still create new cards locally.</span>`;
            }
            renderBoardColumns([]);
        });

    function renderBoardColumns(projects) {
        const todoCards = projects.filter(p => p.status === 'To-Do' || !p.status);
        const inProgressCards = projects.filter(p => p.status === 'In Progress');
        const doneCards = projects.filter(p => p.status === 'Done');

        const colTodo = document.getElementById('columnTodo');
        const colInProgress = document.getElementById('columnInProgress');
        const colDone = document.getElementById('columnDone');

        const cntTodo = document.getElementById('countTodo');
        const cntInProgress = document.getElementById('countInProgress');
        const cntDone = document.getElementById('countDone');

        if (cntTodo) cntTodo.innerText = todoCards.length;
        if (cntInProgress) cntInProgress.innerText = inProgressCards.length;
        if (cntDone) cntDone.innerText = doneCards.length;

        if (colTodo) {
            colTodo.innerHTML = todoCards.length
                ? todoCards.map(c => renderKanbanCard(c)).join('')
                : '<div class="text-xs text-muted font-mono italic p-4 text-center border border-dashed rounded-lg" style="border-color: var(--border);">No cards in To-Do</div>';
        }

        if (colInProgress) {
            colInProgress.innerHTML = inProgressCards.length
                ? inProgressCards.map(c => renderKanbanCard(c)).join('')
                : '<div class="text-xs text-muted font-mono italic p-4 text-center border border-dashed rounded-lg" style="border-color: var(--border);">No cards in Progress</div>';
        }

        if (colDone) {
            colDone.innerHTML = doneCards.length
                ? doneCards.map(c => renderKanbanCard(c)).join('')
                : '<div class="text-xs text-muted font-mono italic p-4 text-center border border-dashed rounded-lg" style="border-color: var(--border);">No completed cards</div>';
        }

        attachCardHandlers();
    }

    function attachCardHandlers() {
        // Handle Status Change via Dropdown Select
        document.querySelectorAll('.card-status-select').forEach(select => {
            select.addEventListener('change', async (e) => {
                const cardId = select.dataset.cardId;
                const newStatus = select.value;
                await updateProject(user.uid, { id: cardId, status: newStatus });
                const updated = await getProjects(user.uid);
                renderBoardColumns(updated);
            });
        });

        // Handle Edit Card Button
        document.querySelectorAll('.edit-card-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const cardId = btn.dataset.editId;
                const card = cachedProjects.find(p => p.id === cardId);
                if (card) {
                    document.getElementById('cardEditId').value = card.id;
                    document.getElementById('cardTitle').value = card.title || card.name || '';
                    document.getElementById('cardTech').value = card.techStack || card.tech || '';
                    document.getElementById('cardRepo').value = card.repoUrl || '';
                    document.getElementById('cardDeploy').value = card.deployUrl || '';
                    document.getElementById('cardStatus').value = card.status || 'To-Do';
                    document.getElementById('cardDesc').value = card.description || '';
                    toggleForm(true, true);
                }
            });
        });

        // Handle Delete Card Button
        document.querySelectorAll('.delete-card-btn').forEach(btn => {
            btn.addEventListener('click', async () => {
                const cardId = btn.dataset.deleteId;
                if (confirm('Are you sure you want to delete this card?')) {
                    await deleteProject(user.uid, cardId);
                    const updated = await getProjects(user.uid);
                    renderBoardColumns(updated);
                }
            });
        });
    }

    // Toggle Form Open/Close
    function toggleForm(open, isEdit = false) {
        if (!formContainer) return;
        if (open) {
            formContainer.classList.remove('hidden');
            if (toggleBtn) toggleBtn.innerHTML = `Cancel`;
            if (formTitle) formTitle.textContent = isEdit ? 'Edit Tracker Card' : 'Create Tracker Card';
        } else {
            formContainer.classList.add('hidden');
            if (cardForm) cardForm.reset();
            document.getElementById('cardEditId').value = '';
            if (toggleBtn) toggleBtn.innerHTML = `<i class="fas fa-plus mr-1"></i> Add New Card`;
        }
    }

    if (toggleBtn) {
        toggleBtn.addEventListener('click', () => {
            const isHidden = formContainer.classList.contains('hidden');
            toggleForm(isHidden);
        });
    }

    if (cancelBtn) {
        cancelBtn.addEventListener('click', () => toggleForm(false));
    }

    // Submit Form (Create or Update)
    if (cardForm) {
        cardForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const editId = document.getElementById('cardEditId').value;
            const cardData = {
                title: document.getElementById('cardTitle').value,
                techStack: document.getElementById('cardTech').value,
                repoUrl: document.getElementById('cardRepo').value,
                deployUrl: document.getElementById('cardDeploy').value,
                status: document.getElementById('cardStatus').value,
                description: document.getElementById('cardDesc').value,
            };

            if (editId) {
                await updateProject(user.uid, { id: editId, ...cardData });
            } else {
                await saveProject(user.uid, cardData);
            }

            toggleForm(false);
            const updated = await getProjects(user.uid);
            renderBoardColumns(updated);
        });
    }
}
