import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.js';
import './boot.css';

const BOOT_MESSAGES = [
  '[OK] Initializing memory subsystems...',
  '[OK] Mounting Firestore & Firebase Auth handlers...',
  '[OK] Loading local cache stores (profileStore, trackerStore)...',
  '[OK] Security Captcha & Theme engine initialized...',
  '[READY] Scaffold kernel boot complete. Redirecting...'
];

export default function Boot() {
  const { currentUser, loading } = useAuth();
  const navigate = useNavigate();

  const [logs, setLogs] = useState([]);
  const [statusText, setStatusText] = useState('Verifying credentials & security modules...');
  const [animationFinished, setAnimationFinished] = useState(false);

  useEffect(() => {
    let timeouts = [];
    let delay = 250;

    BOOT_MESSAGES.forEach((msg, idx) => {
      const t = setTimeout(() => {
        setLogs((prev) => [...prev, msg]);

        if (idx === BOOT_MESSAGES.length - 1) {
          setStatusText('Redirecting...');
          setAnimationFinished(true);
        }
      }, delay);
      timeouts.push(t);
      delay += 350;
    });

    return () => {
      timeouts.forEach((t) => clearTimeout(t));
    };
  }, []);

  // When animation finishes and auth is loaded, redirect
  useEffect(() => {
    if (!animationFinished || loading) return;

    const timer = setTimeout(() => {
      let target = sessionStorage.getItem('scaffold_redirect_target') || '/';
      sessionStorage.removeItem('scaffold_redirect_target');
      if (target === '/boot') {
        target = '/';
      }

      if (!currentUser) {
        // If not logged in and target is a protected route, go to /login
        const isPublic = target === '/' || target === '/login';
        navigate(isPublic ? target : '/login', { replace: true });
      } else {
        navigate(target, { replace: true });
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [animationFinished, loading, currentUser, navigate]);

  return (
    <div className="boot-container">
      <div className="boot-terminal">
        <div className="flex items-center justify-between mb-6 border-b pb-4" style={{ borderColor: 'var(--border)' }}>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-red-500 inline-block"></span>
            <span className="w-3 h-3 rounded-full bg-yellow-500 inline-block"></span>
            <span className="w-3 h-3 rounded-full bg-green-500 inline-block"></span>
            <span className="text-xs text-muted font-mono ml-2">scaffold_kernel_v1.0.4</span>
          </div>
          <span className="tag">SYSTEM LOADER</span>
        </div>

        <div id="bootLog" className="space-y-2 text-sm leading-relaxed font-mono">
          <div>
            <span style={{ color: 'var(--accent)' }}>$</span> initialize --system scaffold
          </div>
          {logs.map((log, idx) => (
            <div key={idx} className="text-xs text-green-400 font-mono">
              {log}
            </div>
          ))}
        </div>

        <div
          className="mt-8 border-t pt-4 flex justify-between items-center text-xs font-mono text-muted"
          style={{ borderColor: 'var(--border)' }}
        >
          <span id="bootStatusText">{statusText}</span>
          <span className="logo-cursor"></span>
        </div>
      </div>
    </div>
  );
}
