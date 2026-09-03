'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

export default function DispatchMapPage() {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [selectedJob, setSelectedJob] = useState<any>(null);
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
      if (data.length > 0) setSelectedJob(data[0]);
    }
    setLoading(false);
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white">Job Dispatch & Route Map</h1>
        <p className="text-slate-400 text-sm mt-1">
          Visual map pinouts, client locations, and route planning powered by your automated dispatcher.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Job List / Queue Sidebar */}
        <div className="space-y-4 lg:col-span-1">
          <h2 className="text-lg font-semibold text-white flex items-center justify-between">
            <span>📍 Scheduled Job Stops</span>
            <span className="text-xs bg-blue-500/20 text-blue-400 px-2.5 py-1 rounded-full font-medium">
              {appointments.length} Active
            </span>
          </h2>

          <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
            {loading ? (
              <div className="p-8 rounded-2xl bg-slate-900/60 border border-slate-800 text-slate-400 text-sm text-center">
                Loading appointments...
              </div>
            ) : appointments.length === 0 ? (
              <div className="p-8 rounded-2xl bg-slate-900/60 border border-slate-800 text-slate-400 text-sm text-center">
                No active job appointments booked yet. Have your AI assistant book a test job!
              </div>
            ) : (
              appointments.map((job) => (
                <div
                  key={job.id}
                  onClick={() => setSelectedJob(job)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer space-y-2 ${
                    selectedJob?.id === job.id
                      ? 'bg-blue-950/40 border-blue-500/60 shadow-lg shadow-blue-950/50'
                      : 'bg-slate-900/80 border-slate-800/80 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-blue-400 font-bold">{job.client_name || 'Valued Client'}</span>
                    <span className="text-slate-400">
                      {new Date(job.start_time).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                  <p className="text-slate-200 text-sm font-medium">{job.address || 'Address pending confirmation'}</p>
                  <div className="flex items-center justify-between pt-1 text-xs text-slate-400">
                    <span>{new Date(job.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    <span className="text-emerald-400 font-semibold">Route Ready</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Map Display & Directions Panel */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6 space-y-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-lg font-semibold text-white">
                  {selectedJob ? selectedJob.client_name : 'Select a Job Stop'}
                </h3>
                <p className="text-sm text-slate-400">
                  {selectedJob ? selectedJob.address : 'Click a job on the left to view route details.'}
                </p>
              </div>
              {selectedJob && selectedJob.address && (
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selectedJob.address)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-xl transition-all shadow-md flex items-center gap-1.5"
                >
                  <span>🗺️ Open in Google Maps</span>
                </a>
              )}
            </div>

            {/* Embedded Interactive Map Frame */}
            <div className="w-full h-[400px] rounded-xl overflow-hidden border border-slate-800 bg-slate-950 relative flex items-center justify-center">
              {selectedJob && selectedJob.address ? (
                <iframe
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  loading="lazy"
                  allowFullScreen
                  src={`https://www.google.com/maps/embed/v1/place?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''}&q=${encodeURIComponent(selectedJob.address)}`}
                ></iframe>
              ) : (
                <div className="text-slate-500 text-sm text-center p-6">
                  Select an appointment with a valid address to load live map routing.
                </div>
              )}
            </div>

            {selectedJob && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                <div className="p-4 rounded-xl bg-slate-950/50 border border-slate-800/60 space-y-1">
                  <span className="text-xs text-slate-400 font-medium">Contact Phone</span>
                  <p className="text-sm font-semibold text-white">{selectedJob.client_phone || 'N/A'}</p>
                </div>
                <div className="p-4 rounded-xl bg-slate-950/50 border border-slate-800/60 space-y-1">
                  <span className="text-xs text-slate-400 font-medium">Scheduled Window</span>
                  <p className="text-sm font-semibold text-white">
                    {new Date(selectedJob.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-slate-950/50 border border-slate-800/60 space-y-1">
                  <span className="text-xs text-slate-400 font-medium">Job Description</span>
                  <p className="text-sm font-semibold text-white truncate">{selectedJob.description || 'General Service'}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}