'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAppointments();
  }, []);

  async function fetchAppointments() {
    setLoading(true);
    const { data, error } = await supabase
      .from('appointments')
      .select('*')
      .order('start_time', { ascending: true });

    if (!error && data) {
      setAppointments(data);
    }
    setLoading(false);
  }

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white">Appointments & Schedule</h1>
        <p className="text-slate-400 text-sm mt-1">
          Manage client site evaluations and scheduled bookings managed by your AI assistant.
        </p>
      </div>

      {loading ? (
        <div className="p-12 rounded-2xl bg-slate-900/60 border border-slate-800 text-slate-400 text-sm text-center">
          Loading appointments...
        </div>
      ) : appointments.length === 0 ? (
        <div className="p-12 rounded-2xl bg-slate-900/60 border border-slate-800 text-slate-400 text-sm text-center">
          No appointments booked yet.
        </div>
      ) : (
        <div className="bg-slate-900/90 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 text-xs font-semibold uppercase tracking-wider bg-slate-950/50">
                <th className="p-4">Client Name</th>
                <th className="p-4">Phone</th>
                <th className="p-4">Job Site Address</th>
                <th className="p-4">Start Time</th>
                <th className="p-4">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-200">
              {appointments.map((apt) => (
                <tr key={apt.id || apt.start_time} className="hover:bg-slate-800/50 transition-colors">
                  <td className="p-4 font-medium text-white">{apt.client_name}</td>
                  <td className="p-4 text-slate-400">{apt.client_phone}</td>
                  <td className="p-4">{apt.address}</td>
                  <td className="p-4 text-blue-400 font-medium">{new Date(apt.start_time).toLocaleString()}</td>
                  <td className="p-4 text-slate-400">{apt.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}