import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth.js';
import { useTracker } from '../../hooks/useTracker.js';
import { saveProject, updateProject as updateFirestoreProject, deleteProject as deleteFirestoreProject } from '../../firebase/firestoreService.js';
import './tracker.css';

const initialCardState = {
  title: '',
  techStack: '',
  repoUrl: '',
  deployUrl: '',
  status: 'To-Do',
  description: '',
};

export const normalizeStatus = (status) => {
  if (!status) return 'To-Do';
  const s = String(status).trim().toLowerCase();
  if (s.includes('progress')) return 'In Progress';
  if (s.includes('done') || s.includes('complete')) return 'Done';
  return 'To-Do';
};

export default function Tracker() {
  const { currentUser } = useAuth();
  const { projects, loading, loadProjects, addProject, updateProject, deleteProject } = useTracker();

  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [cardForm, setCardForm] = useState(initialCardState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusNotice, setStatusNotice] = useState('');

  const userId = currentUser?.uid;

  useEffect(() => {
    if (!userId) return;

    loadProjects(userId).catch((err) => {
      console.error('Tracker fetch error:', err);
      setStatusNotice(`⚠️ Unable to load saved cards — ${err.message || err}. You can still create new cards locally.`);
    });
  }, [userId, loadProjects]);

  const handleToggleForm = (forceOpen = null, isEditMode = false) => {
    if (forceOpen !== null) {
      setShowForm(forceOpen);
      setIsEditing(isEditMode);
    } else {
      setShowForm((prev) => {
        const next = !prev;
        if (!next) {
          setIsEditing(false);
          setEditId(null);
          setCardForm(initialCardState);
        }
        return next;
      });
    }
  };

  const handleEditClick = (card) => {
    setEditId(card.id);
    setIsEditing(true);
    setCardForm({
      title: card.title || card.name || '',
      techStack: card.techStack || card.tech || '',
      repoUrl: card.repoUrl || '',
      deployUrl: card.deployUrl || '',
      status: normalizeStatus(card.status),
      description: card.description || '',
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteClick = async (cardId) => {
    if (window.confirm('Are you sure you want to delete this card?')) {
      try {
        await deleteProject(userId, cardId);
        if (userId) {
          await deleteFirestoreProject(userId, cardId).catch(() => {});
        }
      } catch (err) {
        console.error('Failed to delete card:', err);
      }
    }
  };

  const handleStatusChange = async (card, newStatus) => {
    try {
      const updated = { ...card, status: newStatus };
      await updateProject(userId, updated);
      if (userId) {
        await updateFirestoreProject(userId, updated).catch(() => {});
      }
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!userId) {
      alert('You must be logged in to manage projects.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (isEditing && editId) {
        const updated = { id: editId, ...cardForm };
        await updateProject(userId, updated);
        await updateFirestoreProject(userId, updated).catch(() => {});
      } else {
        await addProject(userId, cardForm);
        await saveProject(userId, cardForm).catch(() => {});
      }

      setCardForm(initialCardState);
      setEditId(null);
      setIsEditing(false);
      setShowForm(false);
    } catch (err) {
      console.error('Failed to save card:', err);
      alert(`Error saving card: ${err.message || err}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const projectList = Array.isArray(projects) ? projects : [];
  const todoCards = projectList.filter((p) => normalizeStatus(p.status) === 'To-Do');
  const inProgressCards = projectList.filter((p) => normalizeStatus(p.status) === 'In Progress');
  const doneCards = projectList.filter((p) => normalizeStatus(p.status) === 'Done');

  const renderCard = (card) => {
    const tags = (card.techStack || card.tech || '')
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    return (
      <div key={card.id} className="kanban-card" data-card-id={card.id}>
        <div className="flex items-start justify-between gap-3 mb-3">
          <h4 className="font-display font-bold text-base leading-snug" style={{ color: 'var(--fg)' }}>
            {card.title || card.name || 'Untitled Card'}
          </h4>
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              className="card-action-btn edit-card-btn"
              onClick={() => handleEditClick(card)}
              title="Edit Card"
            >
              <i className="fas fa-pencil"></i>
            </button>
            <button
              type="button"
              className="card-action-btn delete-card-btn"
              onClick={() => handleDeleteClick(card.id)}
              title="Delete Card"
            >
              <i className="fas fa-xmark"></i>
            </button>
          </div>
        </div>

        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {tags.map((t, idx) => (
              <span key={idx} className="tech-tag">
                {t}
              </span>
            ))}
          </div>
        )}

        {card.description && (
          <p className="text-xs text-muted leading-relaxed mb-4">{card.description}</p>
        )}

        {(card.repoUrl || card.deployUrl) && (
          <div className="flex items-center gap-3 text-xs mb-4 font-mono">
            {card.repoUrl && (
              <a
                href={card.repoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hover-link flex items-center gap-1"
                style={{ color: '#10b981' }}
              >
                Repo ↗
              </a>
            )}
            {card.deployUrl && (
              <a
                href={card.deployUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hover-link flex items-center gap-1"
                style={{ color: '#10b981' }}
              >
                Demo ↗
              </a>
            )}
          </div>
        )}

        <div className="flex items-center justify-between pt-3 border-t font-mono text-xs" style={{ borderColor: 'var(--border)' }}>
          <span style={{ color: 'var(--muted)' }}>Move to:</span>
          <select
            className="profile-select py-1 px-2 text-xs card-status-select"
            data-card-id={card.id}
            aria-label={`Status for ${card.title || card.name || 'card'}`}
            value={normalizeStatus(card.status)}
            onChange={(e) => handleStatusChange(card, e.target.value)}
            style={{ width: 'auto', height: '28px' }}
          >
            <option value="To-Do">To-Do</option>
            <option value="In Progress">In Progress</option>
            <option value="Done">Done</option>
          </select>
        </div>
      </div>
    );
  };

  return (
    <div className="tracker-wrapper">
      <div className="tracker-container">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-8 border-b pb-6" style={{ borderColor: 'var(--border)' }}>
          <div>
            <h1 className="font-display font-bold text-3xl mb-2" style={{ color: 'var(--fg)' }}>
              Job &amp; Project Tracker
            </h1>
            <p className="text-sm text-muted">Manage application progress and move cards through columns.</p>
          </div>
          <button
            id="toggleCardFormBtn"
            type="button"
            onClick={() => handleToggleForm()}
            className="btn-primary text-xs px-4 py-2.5"
            style={{ background: '#10b981', color: '#fff' }}
          >
            {showForm ? (
              'Cancel'
            ) : (
              <>
                <i className="fas fa-plus mr-1"></i> Add New Card
              </>
            )}
          </button>
        </div>

        {/* Async Loading / Status Notice */}
        {statusNotice && (
          <div
            id="trackerDataStatus"
            className="mb-6 p-3 rounded-lg border font-mono text-xs"
            style={{ background: 'var(--card)', borderColor: 'var(--border)' }}
          >
            <span className="text-amber-400">{statusNotice}</span>
          </div>
        )}

        {/* Create / Edit Tracker Card Form */}
        {showForm && (
          <div
            id="cardFormContainer"
            className="mb-10 p-6 rounded-xl border"
            style={{ background: 'rgba(34, 211, 238, 0.015)', borderColor: 'var(--border-strong)' }}
          >
            <h3 id="cardFormTitle" className="font-display font-bold text-xl mb-6" style={{ color: 'var(--fg)' }}>
              {isEditing ? 'Edit Tracker Card' : 'Create Tracker Card'}
            </h3>

            <form id="trackerCardForm" onSubmit={handleFormSubmit} className="space-y-6">
              <input type="hidden" id="cardEditId" value={editId || ''} />

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="profile-label">CARD TITLE *</label>
                  <input
                    type="text"
                    id="cardTitle"
                    value={cardForm.title}
                    onChange={(e) => setCardForm({ ...cardForm, title: e.target.value })}
                    className="profile-input"
                    placeholder="e.g. Build E-commerce Frontend"
                    required
                  />
                </div>
                <div>
                  <label className="profile-label">TECH STACK (COMMA SEPARATED)</label>
                  <input
                    type="text"
                    id="cardTech"
                    value={cardForm.techStack}
                    onChange={(e) => setCardForm({ ...cardForm, techStack: e.target.value })}
                    className="profile-input"
                    placeholder="e.g. React, Tailwind, Zustand"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="profile-label">REPOSITORY URL</label>
                  <input
                    type="url"
                    id="cardRepo"
                    value={cardForm.repoUrl}
                    onChange={(e) => setCardForm({ ...cardForm, repoUrl: e.target.value })}
                    className="profile-input"
                    placeholder="e.g. https://github.com/user/repo"
                  />
                </div>
                <div>
                  <label className="profile-label">DEPLOY URL</label>
                  <input
                    type="url"
                    id="cardDeploy"
                    value={cardForm.deployUrl}
                    onChange={(e) => setCardForm({ ...cardForm, deployUrl: e.target.value })}
                    className="profile-input"
                    placeholder="e.g. https://my-app.vercel.app"
                  />
                </div>
              </div>

              <div>
                <label className="profile-label">STATUS COLUMN</label>
                <select
                  id="cardStatus"
                  value={cardForm.status}
                  onChange={(e) => setCardForm({ ...cardForm, status: e.target.value })}
                  className="profile-select"
                >
                  <option value="To-Do">To-Do</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Done">Done</option>
                </select>
              </div>

              <div>
                <label className="profile-label">NOTES / DESCRIPTION</label>
                <textarea
                  id="cardDesc"
                  value={cardForm.description}
                  onChange={(e) => setCardForm({ ...cardForm, description: e.target.value })}
                  className="profile-input h-24"
                  placeholder="Add key objectives or notes..."
                ></textarea>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t" style={{ borderColor: 'var(--border)' }}>
                <button
                  type="button"
                  id="cancelCardFormBtn"
                  onClick={() => handleToggleForm(false)}
                  className="btn-secondary text-xs px-4 py-2"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-primary text-xs px-5 py-2"
                  style={{ background: '#10b981', color: '#fff' }}
                >
                  {isSubmitting ? 'Saving...' : 'Save Card'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Kanban 3-Column Grid */}
        <div className="kanban-grid">
          {/* To-Do Column */}
          <div className="kanban-column">
            <div className="flex items-center justify-between mb-6 pb-2 border-b" style={{ borderColor: 'var(--border)' }}>
              <h3 className="font-mono font-bold text-sm" style={{ color: 'var(--fg)' }}>
                To-Do
              </h3>
              <span
                id="countTodo"
                className="w-6 h-6 rounded-full flex items-center justify-center font-mono text-xs border"
                style={{ borderColor: 'var(--border-strong)', color: 'var(--muted)', background: 'var(--bg)' }}
              >
                {todoCards.length}
              </span>
            </div>
            <div id="columnTodo" className="space-y-4 flex-1">
              {loading && !projectList.length ? (
                <div
                  className="text-xs text-muted font-mono italic p-4 text-center border border-dashed rounded-lg"
                  style={{ borderColor: 'var(--border)' }}
                >
                  <i className="fas fa-circle-notch fa-spin mr-1 text-emerald-500"></i> Syncing cards...
                </div>
              ) : todoCards.length > 0 ? (
                todoCards.map(renderCard)
              ) : (
                <div
                  className="text-xs text-muted font-mono italic p-4 text-center border border-dashed rounded-lg"
                  style={{ borderColor: 'var(--border)' }}
                >
                  No cards in To-Do
                </div>
              )}
            </div>
          </div>

          {/* In Progress Column */}
          <div className="kanban-column">
            <div className="flex items-center justify-between mb-6 pb-2 border-b" style={{ borderColor: 'var(--border)' }}>
              <h3 className="font-mono font-bold text-sm text-emerald-500">In Progress</h3>
              <span
                id="countInProgress"
                className="w-6 h-6 rounded-full flex items-center justify-center font-mono text-xs border"
                style={{ borderColor: 'var(--border-strong)', color: 'var(--muted)', background: 'var(--bg)' }}
              >
                {inProgressCards.length}
              </span>
            </div>
            <div id="columnInProgress" className="space-y-4 flex-1">
              {loading && !projectList.length ? (
                <div
                  className="text-xs text-muted font-mono italic p-4 text-center border border-dashed rounded-lg"
                  style={{ borderColor: 'var(--border)' }}
                >
                  <i className="fas fa-circle-notch fa-spin mr-1 text-emerald-500"></i> Syncing cards...
                </div>
              ) : inProgressCards.length > 0 ? (
                inProgressCards.map(renderCard)
              ) : (
                <div
                  className="text-xs text-muted font-mono italic p-4 text-center border border-dashed rounded-lg"
                  style={{ borderColor: 'var(--border)' }}
                >
                  No cards in Progress
                </div>
              )}
            </div>
          </div>

          {/* Done Column */}
          <div className="kanban-column">
            <div className="flex items-center justify-between mb-6 pb-2 border-b" style={{ borderColor: 'var(--border)' }}>
              <h3 className="font-mono font-bold text-sm" style={{ color: 'var(--fg)' }}>
                Done
              </h3>
              <span
                id="countDone"
                className="w-6 h-6 rounded-full flex items-center justify-center font-mono text-xs border"
                style={{ borderColor: 'var(--border-strong)', color: 'var(--muted)', background: 'var(--bg)' }}
              >
                {doneCards.length}
              </span>
            </div>
            <div id="columnDone" className="space-y-4 flex-1">
              {loading && !projectList.length ? (
                <div
                  className="text-xs text-muted font-mono italic p-4 text-center border border-dashed rounded-lg"
                  style={{ borderColor: 'var(--border)' }}
                >
                  <i className="fas fa-circle-notch fa-spin mr-1 text-emerald-500"></i> Syncing cards...
                </div>
              ) : doneCards.length > 0 ? (
                doneCards.map(renderCard)
              ) : (
                <div
                  className="text-xs text-muted font-mono italic p-4 text-center border border-dashed rounded-lg"
                  style={{ borderColor: 'var(--border)' }}
                >
                  No completed cards
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
