'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

export default function JobPhotosPage() {
  const [clientName, setClientName] = useState('');
  const [caption, setCaption] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [photos, setPhotos] = useState<any[]>([]);

  useEffect(() => {
    fetchPhotos();
  }, []);

  async function fetchPhotos() {
    const { data, error } = await supabase
      .from('job_photos')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setPhotos(data);
    }
  }

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault();
    if (!file) return;

    setUploading(true);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('job-photos')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage
        .from('job-photos')
        .getPublicUrl(filePath);

      const imageUrl = publicUrlData.publicUrl;

      const { error: dbError } = await supabase.from('job_photos').insert([
        {
          contractor_id: 1,
          client_name: clientName || 'General Project Site',
          image_url: imageUrl,
          caption: caption || 'Site photo inspection',
        },
      ]);

      if (dbError) throw dbError;

      setClientName('');
      setCaption('');
      setFile(null);
      fetchPhotos();
    } catch (err: any) {
      console.error('Error uploading photo:', err.message);
      alert('Failed to upload photo. Ensure the "job-photos" storage bucket is public.');
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white">Job Site Photo Gallery</h1>
        <p className="text-slate-400 text-sm mt-1">
          Capture and organize project photos before, during, and after completion.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <form onSubmit={handleUpload} className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6 space-y-4 shadow-xl lg:col-span-1">
          <h2 className="text-lg font-semibold text-white border-b border-slate-800 pb-3">
            📸 Upload New Photo
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Client / Project Name</label>
              <input
                type="text"
                placeholder="e.g. Smith Kitchen Remodel"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-200 text-sm focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Photo Caption / Notes</label>
              <input
                type="text"
                placeholder="e.g. Subfloor damage near utility lines"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-200 text-sm focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Select Image File</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="w-full text-xs text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-500 cursor-pointer"
              />
            </div>

            <button
              type="submit"
              disabled={uploading || !file}
              className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm rounded-xl shadow-lg transition-all disabled:opacity-50 mt-2"
            >
              {uploading ? 'Uploading to Vault...' : 'Upload Project Photo'}
            </button>
          </div>
        </form>

        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-lg font-semibold text-white flex items-center justify-between">
            <span>🖼️ Project Photo Archive</span>
            <span className="text-xs bg-blue-500/20 text-blue-400 px-2.5 py-1 rounded-full font-medium">
              {photos.length} Uploaded
            </span>
          </h2>

          {photos.length === 0 ? (
            <div className="p-12 rounded-2xl bg-slate-900/60 border border-slate-800 text-slate-400 text-sm text-center">
              No photos uploaded yet. Use the upload panel to add your first job picture!
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {photos.map((item) => (
                <div key={item.id} className="bg-slate-900/80 rounded-2xl border border-slate-800 overflow-hidden shadow-md flex flex-col">
                  <div className="h-48 w-full bg-slate-950 relative overflow-hidden">
                    <img
                      src={item.image_url}
                      alt={item.caption || 'Job photo'}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-4 space-y-1.5 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-blue-400 font-semibold">{item.client_name}</span>
                        <span className="text-slate-500">
                          {new Date(item.created_at).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                      <p className="text-slate-200 text-sm font-medium mt-1">{item.caption}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}