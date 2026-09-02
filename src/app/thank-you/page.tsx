'use client';

import Link from 'next/link';

export default function ThankYouPage() {
  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8 animate-fadeIn">
      {/* Thank You Header Card */}
      <div className="bg-gradient-to-br from-blue-900/40 via-slate-900 to-slate-950 border border-blue-500/30 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex items-center justify-between mb-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold uppercase tracking-wider">
            Payment Verified • 14 Days Free
          </div>
          <Link
            href="/leads"
            className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-4 py-2 rounded-xl transition-all shadow-lg shadow-blue-600/25 flex items-center gap-2"
          >
            <span>Go to Leads Dashboard</span>
            <span>→</span>
          </Link>
        </div>

        <h1 className="text-3xl font-bold tracking-tight text-white">Thank You for Subscribing to Tenpenny AI!</h1>
        <p className="text-slate-300 text-sm mt-2 max-w-xl">
          Your 14-day free trial for Pro Operations is active. Your autonomous voice pipelines are fully armed and ready to handle customer inquiries.
        </p>
      </div>

      {/* Highlights & Top App Features */}
      <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 shadow-xl space-y-6">
        <div>
          <h2 className="text-xl font-semibold text-white">What Tenpenny AI Can Do For Your Business</h2>
          <p className="text-xs text-slate-400 mt-1">Here is a quick look at your core unlocked high-performance capabilities:</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-5 rounded-2xl bg-slate-800/40 border border-slate-700/50 space-y-2">
            <div className="text-blue-400 font-semibold text-sm">⚡ Instant SMS-to-Callback Routing</div>
            <p className="text-xs text-slate-400">If a lead texts your business line after hours, Tenpenny automatically triggers a warm outbound voice dispatch to qualify them within seconds.</p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-800/40 border border-slate-700/50 space-y-2">
            <div className="text-blue-400 font-semibold text-sm">🎙️ Vapi Autonomous Voice Dispatch</div>
            <p className="text-xs text-slate-400">Inbound and outbound customer phone calls are managed naturally by conversational AI agents built specifically for independent contractors.</p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-800/40 border border-slate-700/50 space-y-2">
            <div className="text-blue-400 font-semibold text-sm">🛠️ Automated Job-Note Extraction</div>
            <p className="text-xs text-slate-400">Every completed conversation parses job scopes, material requirements, and customer addresses straight into your database logs.</p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-800/40 border border-slate-700/50 space-y-2">
            <div className="text-blue-400 font-semibold text-sm">🔒 Secure Real-Time CRM Sync</div>
            <p className="text-xs text-slate-400">All leads populate immediately inside your secure user dashboard backed by Supabase verification and Stripe session security.</p>
          </div>
        </div>
      </div>
    </div>
  );
}