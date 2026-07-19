'use client';

import { useState } from 'react';
import Modal from './ui/Modal';
import Icon from './ui/Icon';
import { usePlan } from './PlanProvider';

export default function AuthModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { configured, signInWithEmail } = usePlan();
  const [email, setEmail] = useState('');
  const [state, setState] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [msg, setMsg] = useState('');

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setState('sending');
    const { error } = await signInWithEmail(email.trim());
    if (error) { setState('error'); setMsg(error); }
    else { setState('sent'); }
  }

  return (
    <Modal open={open} onClose={onClose} title="Sign in">
      {!configured ? (
        <div className="text-sm text-muted leading-relaxed">
          <p className="text-ink font-medium mb-1">Accounts aren&rsquo;t switched on yet.</p>
          <p>The calculator works fully without an account. Sign-in and saved-across-devices unlock once the Supabase keys are added — see <code className="text-brand-600">SETUP.md</code>.</p>
        </div>
      ) : state === 'sent' ? (
        <div className="text-center py-2">
          <span className="grid place-items-center w-11 h-11 rounded-full bg-brand-50 text-brand-600 mx-auto mb-3">
            <Icon name="check" size={24} />
          </span>
          <p className="font-medium text-ink">Check your email</p>
          <p className="text-sm text-muted mt-1">We sent a magic sign-in link to <span className="text-ink">{email}</span>.</p>
        </div>
      ) : (
        <form onSubmit={submit} className="space-y-3">
          <p className="text-sm text-muted">Enter your email and we&rsquo;ll send a one-tap sign-in link. No password.</p>
          <input
            data-autofocus
            type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
            placeholder="you@yourcompany.com"
            className="w-full px-3.5 py-2.5 rounded-lg border border-line-strong bg-paper text-ink text-sm focus:border-brand-500"
          />
          {state === 'error' && <p className="text-sm text-loss">{msg}</p>}
          <button
            type="submit" disabled={state === 'sending'}
            className="w-full py-2.5 rounded-lg bg-brand-600 hover:bg-brand-700 text-white font-semibold text-sm transition-colors disabled:opacity-60"
          >
            {state === 'sending' ? 'Sending…' : 'Send magic link'}
          </button>
        </form>
      )}
    </Modal>
  );
}
