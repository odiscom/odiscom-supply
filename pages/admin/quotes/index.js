import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import AdminShell from '../../../components/AdminShell'
import { supabase } from '../../../lib/supabase'

function Badge({ status }) {
  const tones = {
    pending: 'bg-amber-50 text-amber-700',
    quoted: 'bg-blue-50 text-blue-700',
    accepted: 'bg-green-50 text-green-700',
    lost: 'bg-red-50 text-red-700',
  }
  return <span className={`rounded-full px-3 py-1 text-xs font-semibold ${tones[status] || 'bg-slate-100 text-slate-700'}`}>{status}</span>
}

export default function AdminQuotesPage() {
  const [quotes, setQuotes] = useState([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('all')
  const [search, setSearch] = useState('')

  useEffect(() => { loadQuotes() }, [])

  async function loadQuotes() {
    const { data } = await supabase.from('quotes').select('*').order('created_at', { ascending: false })
    setQuotes(data || [])
    setLoading(false)
  }

  const filteredQuotes = useMemo(() => {
    const query = search.toLowerCase().trim()
    return quotes.filter((quote) => {
      const matchesStatus = statusFilter === 'all' || quote.status === statusFilter
      const matchesSearch = !query || [quote.quote_id, quote.company, quote.name, quote.email, quote.details].join(' ').toLowerCase().includes(query)
      return matchesStatus && matchesSearch
    })
  }, [quotes, statusFilter, search])

  return (
    <AdminShell title="Quotes">
      <div className="space-y-6">
        <div className="rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 p-8 text-white shadow-sm">
          <div className="max-w-3xl">
            <div className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-blue-200">Quote Operations</div>
            <h2 className="text-3xl font-bold">Review, price, send, and convert customer material requests.</h2>
            <p className="mt-3 text-sm leading-6 text-slate-300">Use this queue to triage incoming website requests, BOM conversions, and catalog quantity submissions.</p>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="grid gap-3 md:grid-cols-[1fr_220px]">
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search quote ID, company, contact, email, details..." className="rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:bg-white" />
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:bg-white">
              <option value="all">All statuses</option>
              <option value="pending">Pending</option>
              <option value="quoted">Quoted</option>
              <option value="accepted">Accepted</option>
              <option value="lost">Lost</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="rounded-3xl bg-white p-10 text-slate-600 shadow-sm">Loading quotes...</div>
        ) : (
          <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-slate-50 text-slate-600">
                  <tr>
                    <th className="px-5 py-4 text-left">Quote</th>
                    <th className="px-5 py-4 text-left">Customer</th>
                    <th className="px-5 py-4 text-left">Contact</th>
                    <th className="px-5 py-4 text-left">Status</th>
                    <th className="px-5 py-4 text-left">Created</th>
                    <th className="px-5 py-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredQuotes.length === 0 && <tr><td colSpan="6" className="px-5 py-10 text-center text-slate-500">No quotes found.</td></tr>}
                  {filteredQuotes.map((quote) => (
                    <tr key={quote.id} className="border-t border-slate-200 align-top hover:bg-slate-50">
                      <td className="px-5 py-4"><div className="font-mono font-bold text-blue-700">{quote.quote_id}</div><div className="mt-1 text-xs text-slate-500">{quote.source || 'website'}</div></td>
                      <td className="px-5 py-4"><div className="font-semibold text-slate-950">{quote.company}</div><div className="mt-1 max-w-xs truncate text-xs text-slate-500">{quote.details || ''}</div></td>
                      <td className="px-5 py-4"><div>{quote.name}</div><div className="mt-1 text-xs text-slate-500">{quote.email}</div></td>
                      <td className="px-5 py-4"><Badge status={quote.status} /></td>
                      <td className="px-5 py-4 text-slate-500">{quote.created_at ? new Date(quote.created_at).toLocaleString() : ''}</td>
                      <td className="px-5 py-4 text-right"><Link href={`/admin/quotes/${quote.id}`} className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700">Open</Link></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </AdminShell>
  )
}
