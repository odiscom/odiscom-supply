import { useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { supabase } from '../../lib/supabase'

export default function SupplierLogin() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [mode, setMode] = useState('signin')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  async function submit(e) {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    const result = mode === 'signup'
      ? await supabase.auth.signUp({ email, password })
      : await supabase.auth.signInWithPassword({ email, password })

    setLoading(false)

    if (result.error) return setMessage(result.error.message)

    if (mode === 'signup') {
      setMessage('Supplier account created. Check your email if confirmation is required, then sign in.')
      setMode('signin')
      return
    }

    router.push('/supplier')
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 px-6 py-12 text-white">
      <div className="mx-auto max-w-md rounded-3xl border border-white/10 bg-white p-8 text-slate-950 shadow-2xl">
        <Link href="/" className="text-sm font-semibold text-blue-700">← Back to Odiscom Supply</Link>
        <div className="mt-6">
          <div className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-blue-700">Supplier Portal</div>
          <h1 className="text-3xl font-bold">{mode === 'signup' ? 'Create supplier access' : 'Supplier sign in'}</h1>
          <p className="mt-3 text-sm leading-6 text-slate-600">Suppliers can maintain profile details, submit product availability, update cost inputs, and share lead-time information with Odiscom Supply.</p>
        </div>

        {message && <div className="mt-5 rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800">{message}</div>}

        <form onSubmit={submit} className="mt-6 space-y-4">
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Supplier email" className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500" />
          <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500" />
          <button disabled={loading} className="w-full rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-60">{loading ? 'Please wait...' : mode === 'signup' ? 'Create Account' : 'Sign In'}</button>
        </form>

        <button onClick={() => { setMode(mode === 'signup' ? 'signin' : 'signup'); setMessage('') }} className="mt-5 w-full text-sm font-semibold text-blue-700">
          {mode === 'signup' ? 'Already have access? Sign in' : 'Need supplier access? Create account'}
        </button>

        <div className="mt-6 rounded-2xl bg-slate-50 p-4 text-xs leading-5 text-slate-500">
          Supplier accounts should use the email address Odiscom Supply has on file for your company.
        </div>
      </div>
    </main>
  )
}
