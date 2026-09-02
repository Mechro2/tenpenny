"use client"

import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface CallLog {
  id: number
  vapi_call_id: string
  customer_phone: string
  summary: string
  transcript: string
  duration_seconds: number
  created_at: string
}

export default function CallLogsPage() {
  const [logs, setLogs] = useState<CallLog[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedLog, setSelectedLog] = useState<CallLog | null>(null)

  useEffect(() => {
    async function fetchLogs() {
      const { data, error } = await supabase
        .from('call_logs')
        .select('*')
        .order('created_at', { ascending: false })

      if (!error && data) {
        setLogs(data)
        if (data.length > 0) setSelectedLog(data[0])
      }
      setLoading(false)
    }

    fetchLogs()
  }, [])

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.round(seconds % 60)
    return `${mins}m ${secs}s`
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-400 p-12 flex items-center justify-center text-sm">
        Loading call telemetry...
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-12">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="border-b border-slate-800 pb-6 flex justify-between items-end">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 text-xs font-semibold uppercase tracking-wider mb-2 border border-blue-500/20">
              Call Intelligence
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white">Call Logs & Transcripts</h1>
            <p className="text-slate-400 text-sm mt-1">
              Review AI voice interactions, caller history, and automated session summaries.
            </p>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Left Column: Call List */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-3 h-[650px] overflow-y-auto">
            <h2 className="text-sm font-semibold text-slate-400 px-2 uppercase tracking-wider">Recent Calls</h2>
            
            {logs.length === 0 ? (
              <div className="text-slate-500 text-xs p-4 text-center">No recorded calls found.</div>
            ) : (
              logs.map((log) => {
                const active = selectedLog?.id === log.id
                return (
                  <button
                    key={log.id}
                    onClick={() => setSelectedLog(log)}
                    className={`w-full text-left p-4 rounded-xl border transition-all space-y-2 ${
                      active
                        ? 'bg-blue-600/10 border-blue-500/50'
                        : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-semibold text-white">{log.customer_phone}</span>
                      <span className="text-slate-500">{formatDuration(log.duration_seconds)}</span>
                    </div>
                    <p className="text-xs text-slate-400 line-clamp-2">{log.summary || 'No summary available'}</p>
                    <div className="text-[10px] text-slate-500">
                      {new Date(log.created_at).toLocaleString()}
                    </div>
                  </button>
                )
              })
            )}
          </div>

          {/* Right Column: Transcript Details */}
          <div className="md:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl h-[650px] flex flex-col justify-between">
            {selectedLog ? (
              <div className="space-y-6 overflow-y-auto pr-2">
                
                {/* Call Metadata Header */}
                <div className="border-b border-slate-800 pb-4 flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-bold text-white">{selectedLog.customer_phone}</h3>
                    <div className="text-xs text-slate-400 mt-1">
                      Call ID: <span className="font-mono text-slate-300">{selectedLog.vapi_call_id}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="inline-block bg-slate-800 text-slate-300 px-3 py-1 rounded-lg text-xs font-medium border border-slate-700">
                      {formatDuration(selectedLog.duration_seconds)}
                    </span>
                    <div className="text-[11px] text-slate-500 mt-1">
                      {new Date(selectedLog.created_at).toLocaleString()}
                    </div>
                  </div>
                </div>

                {/* Summary Card */}
                <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-1">
                  <div className="text-xs font-semibold text-blue-400 uppercase tracking-wider">AI Call Summary</div>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    {selectedLog.summary || 'No summary generated for this call.'}
                  </p>
                </div>

                {/* Transcript Body */}
                <div className="space-y-2">
                  <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Full Transcript</div>
                  <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 leading-relaxed font-mono whitespace-pre-wrap max-h-[300px] overflow-y-auto">
                    {selectedLog.transcript || 'No transcript text logged.'}
                  </div>
                </div>

              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-slate-500 text-sm">
                Select a call log to view transcript and analysis.
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  )
}