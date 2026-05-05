import { useEffect, useState } from 'react'
import Link from 'next/link'
import Header from '../../../components/Header'
import Footer from '../../../components/Footer'
import { supabase } from '../../../lib/supabase'

export default function AdminQuotesPage() {
  const [authorized, setAuthorized] = useState(false)
  const [password, setPassword] = useState('')
  const [quotes, setQuotes] = useState([])

  useEffect(() => { if (authorized) loadQuotes() }, [authorized])

  async function loadQuotes() {
    const { data } = await supabase.from('quotes').select('*').order('created_at', { ascending: false })
    setQuotes(data || [])
  }

  if (!authorized) {
    return (
      <>
        <Header />
        <main className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="bg-white p-8 rounded-xl shadow max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Admin Access</h2>
            <input type="password" placeholder="Enter admin password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full border p-3 rounded mb-4" />
            <button onClick={() => password === process.env.NEXT_PUBLIC_ADMIN_PASS ? setAuthorized(true) : alert('Incorrect password')} className="w-full bg-blue-600 text-white py-3 rounded font-semibold">Enter</button>
          </div>
        </main>
        <Footer />
      </>
    )
  }

  return (
    <>
      <Header />
      <main className="bg-gray-50 min-h-screen">
        <section className="bg-slate-900 text-white"><div className="max-w-7xl mx-auto px-6 py-12"><h1 className="text-4xl font-bold">Quote Admin</h1></div></section>
        <section className="max-w-7xl mx-auto px-6 py-10">
          <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-100 text-gray-700"><tr><th className="text-left px-4 py-3">Quote ID</th><th className="text-left px-4 py-3">Company</th><th className="text-left px-4 py-3">Contact</th><th className="text-left px-4 py-3">Status</th><th className="text-left px-4 py-3">Action</th></tr></thead>
              <tbody>
                {quotes.map((quote) => (
                  <tr key={quote.id} className="border-t">
                    <td className="px-4 py-4 font-mono text-blue-700">{quote.quote_id}</td>
                    <td className="px-4 py-4 font-semibold">{quote.company}</td>
                    <td className="px-4 py-4">{quote.name}</td>
                    <td className="px-4 py-4">{quote.status}</td>
                    <td className="px-4 py-4"><Link href={`/admin/quotes/${quote.id}`} className="text-blue-600 font-semibold">View</Link></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
