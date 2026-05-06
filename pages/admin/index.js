import { useEffect, useState } from 'react'
import AdminShell from '../../components/AdminShell'
import { supabase } from '../../lib/supabase'

function money(value) {
  return `$${Number(value || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export default function AdminDashboard() {
  const [quotes, setQuotes] = useState([])
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      const [{ data: quoteData }, { data: orderData }] = await Promise.all([
        supabase.from('quotes').select('*').order('created_at', { ascending: false }).limit(5),
        supabase.from('orders').select('*').order('created_at', { ascending: false }).limit(5),
      ])

      setQuotes(quoteData || [])
      setOrders(orderData || [])
      setLoading(false)
    }

    loadData()
  }, [])

  const openQuotes = quotes.filter((quote) => !['accepted', 'lost'].includes(quote.status)).length
  const orderTotal = orders.reduce((sum, order) => sum + Number(order.total || 0), 0)

  return (
    <AdminShell title="Dashboard">
      {loading ? (
        <p className="text-gray-600">Loading dashboard...</p>
      ) : (
        <div className="space-y-6">
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-white rounded-xl shadow p-6 border">
              <div className="text-sm text-gray-500">Recent Quotes</div>
              <div className="text-3xl font-bold text-slate-900 mt-2">{quotes.length}</div>
            </div>
            <div className="bg-white rounded-xl shadow p-6 border">
              <div className="text-sm text-gray-500">Open Quotes</div>
              <div className="text-3xl font-bold text-slate-900 mt-2">{openQuotes}</div>
            </div>
            <div className="bg-white rounded-xl shadow p-6 border">
              <div className="text-sm text-gray-500">Recent Order Value</div>
              <div className="text-3xl font-bold text-slate-900 mt-2">{money(orderTotal)}</div>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow border overflow-hidden">
              <div className="px-6 py-4 border-b font-bold">Latest Quotes</div>
              <div className="divide-y">
                {quotes.length === 0 && <div className="p-6 text-gray-500">No quotes yet.</div>}
                {quotes.map((quote) => (
                  <div key={quote.id} className="p-4 flex justify-between gap-4">
                    <div>
                      <div className="font-semibold text-slate-900">{quote.company}</div>
                      <div className="text-sm text-gray-500">{quote.quote_id} · {quote.name}</div>
                    </div>
                    <span className="text-xs font-semibold bg-blue-50 text-blue-700 px-2 py-1 rounded-full h-fit">{quote.status}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl shadow border overflow-hidden">
              <div className="px-6 py-4 border-b font-bold">Latest Orders</div>
              <div className="divide-y">
                {orders.length === 0 && <div className="p-6 text-gray-500">No orders yet.</div>}
                {orders.map((order) => (
                  <div key={order.id} className="p-4 flex justify-between gap-4">
                    <div>
                      <div className="font-semibold text-slate-900">{order.company}</div>
                      <div className="text-sm text-gray-500">{order.order_number}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">{money(order.total)}</div>
                      <div className="text-xs text-gray-500">{order.status}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminShell>
  )
}
