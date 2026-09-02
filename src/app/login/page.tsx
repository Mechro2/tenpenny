'use client'

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'

export default function AuthPage() {
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [businessName, setBusinessName] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrorMsg('')

    // Safe runtime instantiation inside the submit handler
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder'
    const supabase = createClient(supabaseUrl, supabaseAnonKey)

    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({ email, password })
        if (error) throw error
        
        if (data.user) {
          await supabase.from('user_settings').insert({
            user_id: data.user.id,
            business_name: businessName || 'My Contracting Co.'
          })
        }
        router.push('/')
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        router.push('/')
      }
    } catch (err: any) {
      setErrorMsg(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0f172a', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <div style={{ backgroundColor: '#1e293b', padding: '2rem', borderRadius: '8px', width: '100%', maxWidth: '400px' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem', textAlign: 'center' }}>
          {isSignUp ? 'Create Tenpenny Account' : 'Sign In to Tenpenny'}
        </h1>

        {errorMsg && <p style={{ color: '#ef4444', marginBottom: '1rem', fontSize: '0.875rem' }}>{errorMsg}</p>}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {isSignUp && (
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Business Name</label>
              <input 
                type="text" 
                required 
                value={businessName} 
                onChange={(e) => setBusinessName(e.target.value)} 
                placeholder="Apex Construction LLC" 
                style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', backgroundColor: '#0f172a', border: '1px solid #334155', color: '#fff' }} 
              />
            </div>
          )}

          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Email</label>
            <input 
              type="email" 
              required 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', backgroundColor: '#0f172a', border: '1px solid #334155', color: '#fff' }} 
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Password</label>
            <input 
              type="password" 
              required 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', backgroundColor: '#0f172a', border: '1px solid #334155', color: '#fff' }} 
            />
          </div>

          <button type="submit" disabled={loading} style={{ backgroundColor: '#2563eb', padding: '0.75rem', borderRadius: '4px', color: '#fff', fontWeight: 'bold', border: 'none', cursor: 'pointer', marginTop: '0.5rem' }}>
            {loading ? 'Processing...' : isSignUp ? 'Sign Up' : 'Sign In'}
          </button>
        </form>

        <p style={{ marginTop: '1.5rem', fontSize: '0.875rem', textAlign: 'center', color: '#94a3b8' }}>
          {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button onClick={() => setIsSignUp(!isSignUp)} style={{ background: 'none', border: 'none', color: '#60a5fa', cursor: 'pointer', textDecoration: 'underline' }}>
            {isSignUp ? 'Sign In' : 'Sign Up'}
          </button>
        </p>
      </div>
    </div>
  )
}