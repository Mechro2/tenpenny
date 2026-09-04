'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

export default function LeadsDashboard() {
  const [loading, setLoading] = useState(true);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [notes, setNotes] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  async function fetchDashboardData() {
    setLoading(true);
    
    // Fetch appointments, job notes, and business settings concurrently
    const [aptRes, notesRes, settingsRes] = await Promise.all([
      supabase.from('appointments').select('*').order('start_time', { ascending: true }),
      supabase.from('job_notes').select('*').order('created_at', { ascending: false }),
      supabase.from('contractor_settings').select('*').eq('contractor_id', 1).maybeSingle(),
    ]);

    if (!aptRes.error && aptRes.data) setAppointments(aptRes.data);
    if (!notesRes.error && notesRes.data) setNotes(notesRes.data);
    if (!settingsRes.error && settingsRes.data) setSettings(settingsRes.data);

    setLoading(false);
  }

  // Calculate metrics
  const totalAppointments = appointments.length;
  const totalNotes = notes.length;
  
  // Count appointments scheduled for today
  const todayStr = new Date().toISOString().split('T')[0];
  const todayAppointments = appointments.filter((apt) => 
    apt.start_time && apt.start_time.startsWith(todayStr)
  ).length;

  const phoneNumber = settings?.phone_number || '+14795550199';

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Header section with active business context */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">
            {settings?.business_name || 'Tenpenny Operations'} Dashboard
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Real-time activity overview, lead tracking, and autonomous voice agent metrics.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/settings"
            className="px-4 py-2 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-200 text-xs font-semibold rounded-xl transition-all"
          >
            ⚙️ Edit Business Profile
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="p-12 rounded-2xl bg-slate-900/60 border border-slate-800 text-slate-400 text-sm text-center">
          Loading dashboard telemetry...
        </div>
      ) : (
        <>
          {/* Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6 shadow-xl space-y-2">
              <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Appointments Today</span>
              <div className="text-3xl font-bold text-white">{todayAppointments}</div>
              <p className="text-xs text-slate-500">Scheduled on-site evaluations</p>
            </div>

            <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6 shadow-xl space-y-2">
              <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Total Booked</span>
              <div className="text-3xl font-bold text-blue-400">{totalAppointments}</div>
              <p className="text-xs text-slate-500">All-time active calendar entries</p>
            </div>

            <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6 shadow-xl space-y-2">
              <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Logged Leads / Notes</span>
              <div className="text-3xl font-bold text-emerald-400">{totalNotes}</div>
              <p className="text-xs text-slate-500">Captured voice summaries</p>
            </div>

            <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6 shadow-xl space-y-2">
              <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Standard Hourly Rate</span>
              <div className="text-3xl font-bold text-amber-400">${settings?.hourly_rate || 85}</div>
              <p className="text-xs text-slate-500">Configured baseline quote</p>
            </div>
          </div>

          {/* Tenpenny Voicemail / Forwarding Line Setup Card */}
          <div className="p-6 bg-slate-900/90 border border-slate-800 rounded-2xl shadow-xl">
            <h3 className="text-lg font-semibold text-white mb-2">Your Tenpenny Voice Line</h3>
            <p className="text-3xl font-extrabold text-blue-400 mb-4">{phoneNumber}</p>
            
            <p className="text-sm text-slate-400 mb-4">
              Set up conditional call forwarding on your mobile phone so missed calls automatically roll over to Tenpenny:
            </p>
            
            <ul className="text-sm space-y-2 list-disc list-inside text-slate-300">
              <li><strong>AT&T / T-Mobile:</strong> Dial <code className="bg-slate-950 text-slate-200 px-1.5 py-0.5 rounded border border-slate-800">*61*{phoneNumber}#</code> and press call.</li>
              <li><strong>Verizon:</strong> Dial <code className="bg-slate-950 text-slate-200 px-1.5 py-0.5 rounded border border-slate-800">*71{phoneNumber}</code> and press call.</li>
            </ul>
          </div>

          {/* Quick Activity Feeds */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Recent Appointments Preview */}
            <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6 space-y-6 shadow-xl">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-white tracking-tight">Upcoming Appointments</h2>
                <Link href="/appointments" className="text-xs text-blue-400 hover:underline">View All →</Link>
              </div>

              {appointments.length === 0 ? (
                <p className="text-xs text-slate-500 py-6 text-center">No appointments found in the database.</p>
              ) : (
                <div className="space-y-3">
                  {appointments.slice(0, 4).map((apt) => (
                    <div key={apt.id || apt.start_time} className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 flex items-center justify-between">
                      <div className="space-y-1">
                        <span className="text-sm font-semibold text-white">{apt.client_name}</span>
                        <p className="text-xs text-slate-400">{apt.address}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-medium text-blue-400">{new Date(apt.start_time).toLocaleDateString()}</span>
                        <p className="text-xs text-slate-500">{new Date(apt.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recent Job Notes Preview */}
            <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6 space-y-6 shadow-xl">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-white tracking-tight">Recent Lead Summaries</h2>
                <Link href="/notes" className="text-xs text-blue-400 hover:underline">View All →</Link>
              </div>

              {notes.length === 0 ? (
                <p className="text-xs text-slate-500 py-6 text-center">No call notes logged yet. Once callers reach your line, they will appear here.</p>
              ) : (
                <div className="space-y-3">
                  {notes.slice(0, 3).map((note) => (
                    <div key={note.id || note.created_at} className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 space-y-2">
                      <div className="flex items-center justify-between text-xs text-slate-500">
                        <span>Client: <strong className="text-slate-300">{note.client_phone}</strong></span>
                        <span>{new Date(note.created_at).toLocaleDateString()}</span>
                      </div>
                      <p className="text-xs text-slate-300 line-clamp-2">{note.notes}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}