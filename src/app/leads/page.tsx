'use client';

import { useEffect, useState } from 'react';

export default function LeadsPage() {
  const [phoneNumber, setPhoneNumber] = useState('+14795550199'); // placeholder until fetched from user profile

  return (
    <div className="min-h-screen bg-background text-foreground p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Leads Dashboard</h1>
          <p className="text-muted-foreground mt-1">Manage your captured calls and view your dedicated Tenpenny line.</p>
        </div>

        {/* Voicemail Setup Card */}
        <div className="p-6 bg-card border rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold mb-2">Your Tenpenny Voicemail Line</h3>
          <p className="text-3xl font-extrabold text-primary mb-4">{phoneNumber}</p>
          
          <p className="text-sm text-muted-foreground mb-4">
            Set up conditional call forwarding on your mobile phone so missed calls automatically roll over to Tenpenny:
          </p>
          
          <ul className="text-sm space-y-2 list-disc list-inside text-muted-foreground">
            <li><strong>AT&T / T-Mobile:</strong> Dial <code className="bg-muted text-foreground px-1 py-0.5 rounded">*61*{phoneNumber}#</code> and press call.</li>
            <li><strong>Verizon:</strong> Dial <code className="bg-muted text-foreground px-1 py-0.5 rounded">*71{phoneNumber}</code> and press call.</li>
          </ul>
        </div>

        {/* Leads Feed Table / List */}
        <div className="p-6 bg-card border rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Recent Captured Calls</h3>
          <div className="border rounded-md p-8 text-center text-muted-foreground">
            No calls captured yet. Once callers reach your Tenpenny line, they will appear here.
          </div>
        </div>

      </div>
    </div>
  );
}