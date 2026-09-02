'use client'

import { useState } from 'react'

interface Lead {
  id: string
  created_at: string
  caller_name: string
  caller_phone: string
  job_type: string
  address: string
  description: string
  is_emergency: boolean
  status: string
  photo_url?: string
}

export default function LeadCard({ lead }: { lead: Lead }) {
  const [loadingPay, setLoadingPay] = useState(false)

  const handleCreateDepositLink = async () => {
    setLoadingPay(true)
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          leadId: lead.id,
          callerName: lead.caller_name,
          jobType: lead.job_type,
        }),
      })
      const data = await res.json()
      if (data.url) {
        window.open(data.url, '_blank')
      } else {
        alert(data.error || 'Failed to create payment link')
      }
    } catch (err: any) {
      alert(err.message)
    } finally {
      setLoadingPay(false)
    }
  }

  return (
    <div style={{
      backgroundColor: '#1e293b',
      borderRadius: '8px',
      padding: '1.25rem',
      marginBottom: '1rem',
      borderLeft: lead.is_emergency ? '4px solid #ef4444' : '4px solid #3b82f6'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', margin: 0, color: '#fff' }}>{lead.caller_name}</h3>
        <span style={{
          fontSize: '0.75rem',
          padding: '0.25rem 0.5rem',
          borderRadius: '4px',
          fontWeight: 'bold',
          textTransform: 'uppercase',
          backgroundColor: lead.is_emergency ? 'rgba(239, 68, 68, 0.2)' : 'rgba(59, 130, 246, 0.2)',
          color: lead.is_emergency ? '#f87171' : '#60a5fa'
        }}>
          {lead.is_emergency ? 'Emergency' : lead.status}
        </span>
      </div>

      <div style={{ fontSize: '0.875rem', color: '#cbd5e1', display: 'grid', gap: '0.5rem' }}>
        <div><strong>Phone:</strong> {lead.caller_phone}</div>
        {lead.job_type && <div><strong>Job Type:</strong> {lead.job_type}</div>}
        {lead.address && <div><strong>Address:</strong> {lead.address}</div>}
        {lead.description && (
          <div style={{ marginTop: '0.5rem', backgroundColor: '#0f172a', padding: '0.75rem', borderRadius: '4px', color: '#94a3b8' }}>
            {lead.description}
          </div>
        )}
        {lead.photo_url && (
          <div style={{ marginTop: '0.5rem' }}>
            <a href={lead.photo_url} target="_blank" rel="noreferrer" style={{ color: '#60a5fa', textDecoration: 'underline' }}>
              View Job Site Photo
            </a>
          </div>
        )}
      </div>

      <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
          Received: {new Date(lead.created_at).toLocaleString()}
        </span>
        <button
          onClick={handleCreateDepositLink}
          disabled={loadingPay}
          style={{
            padding: '0.4rem 0.8rem',
            fontSize: '0.8rem',
            borderRadius: '4px',
            backgroundColor: '#10b981',
            color: '#fff',
            fontWeight: 'bold',
            border: 'none',
            cursor: 'pointer'
          }}
        >
          {loadingPay ? 'Generating...' : 'Collect $50 Deposit'}
        </button>
      </div>
    </div>
  )
}