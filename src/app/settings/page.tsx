'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const [settings, setSettings] = useState({
    contractor_id: 1,
    business_name: '',
    owner_name: '',
    phone_number: '',
    service_radius: '',
    services_offered: '',
    hourly_rate: 85,
    operating_hours: '',
    custom_prompt_instructions: '',
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  async function fetchSettings() {
    setLoading(true);
    const { data, error } = await supabase
      .from('contractor_settings')
      .select('*')
      .eq('contractor_id', 1)
      .maybeSingle();

    if (!error && data) {
      setSettings(data);
    }
    setLoading(false);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);

    // Upsert ensures it creates the row if it's missing or updates it if it exists
    const { error } = await supabase
      .from('contractor_settings')
      .upsert({
        ...settings,
        contractor_id: 1,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'contractor_id' });

    setSaving(false);
    if (!error) {
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } else {
      alert('Error saving settings: ' + error.message);
    }
  }

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white">Business Settings & AI Persona</h1>
        <p className="text-slate-400 text-sm mt-1">
          Configure the core variables your AI voice assistant uses to greet customers, quote services, and qualify leads.
        </p>
      </div>

      {loading ? (
        <div className="p-12 rounded-2xl bg-slate-900/60 border border-slate-800 text-slate-400 text-sm text-center">
          Loading settings...
        </div>
      ) : (
        <form onSubmit={handleSave} className="bg-slate-900/90 rounded-2xl border border-slate-800 p-8 space-y-6 shadow-xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Business Name</label>
              <input
                type="text"
                value={settings.business_name || ''}
                onChange={(e) => setSettings({ ...settings, business_name: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-200 text-sm focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Owner / Primary Contact Name</label>
              <input
                type="text"
                value={settings.owner_name || ''}
                onChange={(e) => setSettings({ ...settings, owner_name: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-200 text-sm focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Business Phone Number</label>
              <input
                type="text"
                value={settings.phone_number || ''}
                placeholder="e.g. (479) 555-0199"
                onChange={(e) => setSettings({ ...settings, phone_number: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-200 text-sm focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Standard Hourly Rate ($)</label>
              <input
                type="number"
                value={settings.hourly_rate || 0}
                onChange={(e) => setSettings({ ...settings, hourly_rate: parseFloat(e.target.value) || 0 })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-200 text-sm focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Service Radius & Locations</label>
              <input
                type="text"
                value={settings.service_radius || ''}
                onChange={(e) => setSettings({ ...settings, service_radius: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-200 text-sm focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Services Offered (Comma separated)</label>
              <input
                type="text"
                value={settings.services_offered || ''}
                onChange={(e) => setSettings({ ...settings, services_offered: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-200 text-sm focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Operating Hours</label>
              <input
                type="text"
                value={settings.operating_hours || ''}
                onChange={(e) => setSettings({ ...settings, operating_hours: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-200 text-sm focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">AI Assistant Behavior & Instructions</label>
              <textarea
                rows={4}
                value={settings.custom_prompt_instructions || ''}
                onChange={(e) => setSettings({ ...settings, custom_prompt_instructions: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-200 text-sm focus:outline-none focus:border-blue-500 resize-none"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-800">
            <span className="text-xs text-emerald-400 font-medium">
              {success ? '✅ Settings updated successfully!' : ''}
            </span>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm rounded-xl shadow-lg transition-all disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Business Settings'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}