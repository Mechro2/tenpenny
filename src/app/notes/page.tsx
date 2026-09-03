'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

export default function NotesPage() {
  const [notes, setNotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotes();
  }, []);

  async function fetchNotes() {
    setLoading(true);
    const { data, error } = await supabase
      .from('job_notes')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setNotes(data);
    }
    setLoading(false);
  }

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white">Job Notes & Lead Summaries</h1>
        <p className="text-slate-400 text-sm mt-1">
          Review notes, project scopes, and summaries logged by your AI assistant during customer calls.
        </p>
      </div>

      {loading ? (
        <div className="p-12 rounded-2xl bg-slate-900/60 border border-slate-800 text-slate-400 text-sm text-center">
          Loading job notes...
        </div>
      ) : notes.length === 0 ? (
        <div className="p-12 rounded-2xl bg-slate-900/60 border border-slate-800 text-slate-400 text-sm text-center">
          No job notes logged yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {notes.map((note) => (
            <div key={note.id || note.created_at} className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6 shadow-xl space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Client Phone: <strong className="text-slate-200">{note.client_phone}</strong></span>
                <span>{new Date(note.created_at).toLocaleString()}</span>
              </div>
              <p className="text-slate-200 text-sm whitespace-pre-wrap">{note.notes}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}