'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

export default function JobPadPage() {
  const [clientName, setClientName] = useState('');
  const [scratchpadContent, setScratchpadContent] = useState('');
  const [notes, setNotes] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    fetchNotes();
  }, []);

  async function fetchNotes() {
    const { data, error } = await supabase
      .from('job_pads')
      .select('*')
      .order('updated_at', { ascending: false });

    if (!error && data) {
      setNotes(data);
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!scratchpadContent.trim()) return;

    setSaving(true);
    setSavedSuccess(false);

    const { error } = await supabase.from('job_pads').insert([
      {
        contractor_id: 1, // Tied to active test contractor
        client_name: clientName || 'General Field Note',
        scratchpad_content: scratchpadContent,
        updated_at: new Date().toISOString(),
      },
    ]);

    setSaving(false);
    if (!error) {
      setSavedSuccess(true);
      setClientName('');
      setScratchpadContent('');
      fetchNotes();
      setTimeout(() => setSavedSuccess(false), 3000);
    }
  }

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white">Live Job Pad</h1>
        <p className="text-slate-400 text-sm mt-1">
          Rapid-fire scratchpad designed for contractors in the field. Jot down measurements, material lists, and client notes instantly.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        {/* The Legal Pad UI */}
        <form onSubmit={handleSave} className="bg-[#fef9c3] rounded-2xl shadow-2xl p-6 text-slate-900 border-b-8 border-r-4 border-amber-300 relative overflow-hidden flex flex-col group">
          {/* Top binder style header */}
          <div className="absolute top-0 left-0 right-0 h-4 bg-amber-200/80 border-b border-amber-300 flex items-center justify-around">
            <div className="w-3 h-3 rounded-full bg-slate-400 shadow-inner" />
            <div className="w-3 h-3 rounded-full bg-slate-400 shadow-inner" />
            <div className="w-3 h-3 rounded-full bg-slate-400 shadow-inner" />
          </div>

          <div className="pt-4 space-y-4">
            <div className="flex items-center justify-between border-b border-amber-200 pb-3">
              <input
                type="text"
                placeholder="Client / Project Name..."
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                className="bg-transparent font-bold text-lg placeholder-amber-700/50 text-slate-900 focus:outline-none w-full"
              />
              <span className="text-xs font-semibold text-amber-800 uppercase tracking-wider bg-amber-200/50 px-2 py-1 rounded">
                Pad 01
              </span>
            </div>

            {/* Note taking textarea with ruled lines effect */}
            <div className="relative">
              <textarea
                rows={8}
                placeholder="Jot down quick details: 2x4 framing needed, custom trim color SW 7005, verify gate clearance..."
                value={scratchpadContent}
                onChange={(e) => setScratchpadContent(e.target.value)}
                className="w-full bg-transparent text-slate-900 placeholder-amber-900/40 text-base leading-loose focus:outline-none resize-none bg-gradient-to-b from-transparent via-transparent to-amber-100/30"
                style={{
                  backgroundImage: 'linear-gradient(to bottom, rgba(0,0,0,0.06) 1px, transparent 1px)',
                  backgroundSize: '100% 2rem',
                  lineHeight: '2rem',
                }}
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-amber-900/60 font-medium">
                {savedSuccess ? '✅ Saved to vault!' : 'Auto-sync ready'}
              </span>
              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2 bg-slate-900 text-amber-100 hover:bg-slate-800 font-semibold text-sm rounded-xl shadow-lg transition-all disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Tear & Save Note'}
              </button>
            </div>
          </div>
        </form>

        {/* Saved Notes Feed */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <span>📝 Recent Scratchpad Notes</span>
          </h2>

          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
            {notes.length === 0 ? (
              <div className="p-8 rounded-2xl bg-slate-900/60 border border-slate-800 text-slate-400 text-sm text-center">
                No notes torn off yet. Type your thoughts on the pad and hit save!
              </div>
            ) : (
              notes.map((note) => (
                <div key={note.id} className="p-4 rounded-xl bg-slate-900/80 border border-slate-800/80 space-y-2 shadow-md">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-blue-400 font-semibold">{note.client_name}</span>
                    <span className="text-slate-500">{new Date(note.updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <p className="text-slate-300 text-sm whitespace-pre-wrap">{note.scratchpad_content}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}