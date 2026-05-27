'use client';
import { useState, useEffect } from 'react';
import type { CalcInputs, LocalProfile } from '@/types';
import { getProfiles, saveProfile, deleteProfile, renameProfile,
         getActiveProfileId, setActiveProfileId, MAX_PROFILES } from '@/lib/profiles';

interface Props {
  currentInputs: CalcInputs;
  onLoad: (inputs: CalcInputs) => void;
}

export default function ProfileBar({ currentInputs, onLoad }: Props) {
  const [profiles, setProfiles] = useState<LocalProfile[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [mounted,  setMounted]  = useState(false);

  useEffect(() => {
    setProfiles(getProfiles());
    setActiveId(getActiveProfileId());
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const atMax  = profiles.length >= MAX_PROFILES;
  const active = profiles.find(p => p.id === activeId) ?? null;

  function handleSelect(id: string) {
    if (!id) { setActiveProfileId(null); setActiveId(null); return; }
    const p = profiles.find(x => x.id === id);
    if (!p) return;
    setActiveProfileId(id); setActiveId(id); onLoad(p.state);
  }

  function handleSave() {
    const name = prompt('Name this profile:');
    if (!name?.trim()) return;
    const result = saveProfile(name.trim(), currentInputs);
    if (result === false) { alert('Max 5 profiles. Delete one first.'); return; }
    setProfiles(result);
    const newest = result[result.length - 1];
    setActiveProfileId(newest.id); setActiveId(newest.id);
  }

  function handleDelete(id: string) {
    if (!confirm('Delete this profile? This cannot be undone.')) return;
    setProfiles(deleteProfile(id));
    if (activeId === id) setActiveId(null);
  }

  function handleRename(id: string) {
    const p = profiles.find(x => x.id === id);
    const name = prompt('New name:', p?.name ?? '');
    if (!name?.trim()) return;
    setProfiles(renameProfile(id, name.trim()));
  }

  return (
    <div className="flex flex-wrap items-center gap-2 px-5 py-2 bg-blue-50 border-b border-slate-200 text-sm">
      <span className="text-xs font-bold uppercase tracking-widest text-blue-600">📋 Profile:</span>
      <select value={activeId ?? ''} onChange={e => handleSelect(e.target.value)}
        aria-label="Select saved profile"
        className="text-sm font-semibold px-2 py-1 border border-slate-200 rounded-lg text-slate-800 bg-white">
        <option value="">— Unsaved / Working —</option>
        {profiles.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
      </select>
      <button onClick={handleSave} disabled={atMax}
        className="px-3 py-1 bg-blue-600 text-white rounded-lg text-xs font-bold disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed">
        + Save Current
      </button>
      {active && <>
        <button onClick={() => handleRename(active.id)} aria-label="Rename profile"
          className="px-2 py-1 border border-slate-200 rounded-lg text-xs font-bold text-slate-700">
          ✎ Rename
        </button>
        <button onClick={() => handleDelete(active.id)} aria-label="Delete profile"
          className="px-2 py-1 border border-red-400 rounded-lg text-xs font-bold text-red-600">
          🗑 Delete
        </button>
      </>}
      {atMax && <span className="text-xs text-amber-600 italic">Max 5 profiles — delete one to save a new profile.</span>}
    </div>
  );
}
