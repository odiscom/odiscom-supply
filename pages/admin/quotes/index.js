import { useEffect, useState } from 'react'
import Link from 'next/link'
import AdminShell from '../../../components/AdminShell'
import { supabase } from '../../../lib/supabase'

export default function AdminQuotesPage() {
  const [quotes, setQuotes] = useState([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('all')

  useEffect(() => {
    loadQuotes()
  }, [])

  async function loadQuotes() {
    const { data } = await supabase
      .from('quotes')
      .select('*')
      .order('created_at', { ascending: false })

    setQuotes(data || [])
    setLoading(false)
  }

  const filteredQuotes = statusFilter === 'all'
    ? quotes
    : quotes.filter((quote) => quote.status === statusFilter)

  return (
    <AdminShell title="Quotes">
      <div className="space-y-4">
        <div className="bg-white border rounded-xl shadow p-4 flex flex-wrap gap-3 items-center justify-between">
          <div>
            <h2 className="font-bold text-slate-900">Incoming Quote Requests</h2>
            <p className="text-sm text-gray-500">Review customer requests, add line items, price work, and send quote PDFs.</p>
          </div>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="border rounded-lg px-3 py-2 text-sm">
            <option value="all">All statuses</option>
            <option value="pending">Pending</option>
            <option value="quoted">Quoted</option>
            <option value="accepted">Accepted</option>
            <option value="lost">Lost</option>
          </select>
        </div>

        {loading ? (
          <div className="bg-white border rounded-xl shadow p-8 text-gray-600">Loading quotes...</div>
        ) : (
          <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-100 text-gray-700">
                  <tr>
                    <th className="text-left px-4 py-3">Quote ID</th>
                    <th className="text-left px-4 py-3">Company</th>
                    <th className="text-left px-4 py-3">Contact</th>
                    <th className="text-left px-4 py-3">Email</th>
                    <th className="text-left px-4 py-3">Status</th>
                    <th className="text-left px-4 py-3">Created</th>
                    <th className="text-left px-4 py-3">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredQuotes.length === 0 && (
                    <tr>
                      <td colSpan="7" className="px-4 py-8 text-center text-gray-500">No quotes found.</td>
                    </tr>
                  )}
                  {filteredQuotes.map((quote) => (
                    <tr key={quote.id} className="border-t align-top hover:bg-gray-50">
                      <td className="px-4 py-4 font-mono text-blue-700">{quote.quote_id}</td>
                      <td className="px-4 py-4 font-semibold">{quote.company}</td>
                      <td className="px-4 py-4">{quote.name}</td>
                      <td className="px-4 py-4">{quote.email}</td>
                      <td className="px-4 py-4">
                        <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded-full text-xs font-semibold">{quote.status}</span>
                      </td>
                      <td className="px-4 py-4 text-gray-500">{quote.created_at ? new Date(quote.created_at).toLocaleString() : ''}</td>
                      <td className="px-4 py-4">
                        <Link href={`/admin/quotes/${quote.id}`} className="text-blue-600 font-semibold">View</Link>
                      </td>
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
