import { totalFor, margins, amount } from '../../lib/pricing'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import AdminShell from '../../components/AdminShell'
import { supabase } from '../../lib/supabase'

function money(value) {
  if (value === null || value === undefined || value === '' || !Number.isFinite(Number(value))) return 'Not priced'
  return `$${Number(value || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

function Badge({ children, tone = 'blue' }) {
  const tones = {
    blue: 'bg-blue-50 text-blue-700',
    green: 'bg-green-50 text-green-700',
    amber: 'bg-amber-50 text-amber-700',
    slate: 'bg-slate-100 text-slate-700',
  }
  return <span className={`rounded-full px-3 py-1 text-xs font-semibold ${tones[tone] || tones.blue}`}>{children}</span>
}

function MetricCard({ label, value, hint, tone = 'blue' }) {
  const ring = tone === 'green' ? 'from-green-500 to-emerald-500' : tone === 'amber' ? 'from-amber-500 to-orange-500' : 'from-blue-500 to-cyan-500'
  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className={`h-1 bg-gradient-to-r ${ring}`} />
      <div className="p-6">
        <div className="text-sm font-medium text-slate-500">{label}</div>
        <div className="mt-2 text-3xl font-bold text-slate-950">{value}</div>
        <div className="mt-2 text-xs text-slate-500">{hint}</div>
      </div>
    </div>
  )
}

export default function AdminDashboard() {
  const [quotes, setQuotes] = useState([])
  const [orders, setOrders] = useState([])
  const [orderItems, setOrderItems] = useState([])
  const [uploads, setUploads] = useState([])
  const [products, setProducts] = useState([])
  const [suppliers, setSuppliers] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      const [quoteRes, orderRes, itemRes, uploadRes, productRes, supplierRes] = await Promise.all([
        supabase.from('quotes').select('*').order('created_at', { ascending: false }).limit(8),
        supabase.from('orders').select('*').order('created_at', { ascending: false }).limit(8),
        supabase.from('order_items').select('*'),
        supabase.from('material_uploads').select('*').order('created_at', { ascending: false }).limit(8),
        supabase.from('products').select('*').order('created_at', { ascending: false }).limit(8),
        supabase.from('suppliers').select('*').order('created_at', { ascending: false }).limit(8),
      ])

      if ([quoteRes,orderRes,itemRes,uploadRes,productRes,supplierRes].some(result => result.error)) { setError('Dashboard data could not be loaded. Totals are unavailable.'); setLoading(false); return }
      setQuotes(quoteRes.data || [])
      setOrders(orderRes.data || [])
      setOrderItems(itemRes.data || [])
      setUploads(uploadRes.data || [])
      setProducts(productRes.data || [])
      setSuppliers(supplierRes.data || [])
      setLoading(false)
    }

    loadData()
  }, [])

  const openQuotes = quotes.filter((quote) => !['accepted', 'lost'].includes(quote.status)).length
  const orderTotal = orders.every(order => amount(order.total) !== null) ? orders.reduce((sum,order) => sum+amount(order.total),0) : null
  const matchingItems = orderItems.filter(item => orders.some(order => order.id === item.order_id))
  const orderCost = orders.every(order => matchingItems.some(item => item.order_id === order.id)) ? totalFor(matchingItems,'unit_cost') : null
  const grossMargin = margins(orderTotal,orderCost).grossProfit
  const needsReview = uploads.filter((upload) => ['new', 'reviewing'].includes(upload.status)).length

  return (
    <AdminShell title="Dashboard">
      {error ? <div role="alert">{error}</div> : loading ? (
        <div className="rounded-3xl bg-white p-10 text-slate-600 shadow-sm">Loading dashboard...</div>
      ) : (
        <div className="space-y-6">
          <div className="rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 p-8 text-white shadow-sm">
            <div className="max-w-3xl">
              <div className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-blue-200">Odiscom Supply Command Center</div>
              <h2 className="text-3xl font-bold">Quote, source, price, and fulfill telecom material requests.</h2>
              <p className="mt-3 text-sm leading-6 text-slate-300">Monitor quote demand, active orders, supplier/material workflow, and margin performance from one operations dashboard.</p>
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/admin/quotes" className="rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-700">Review Quotes</Link>
              <Link href="/admin/material-uploads" className="rounded-xl bg-white px-4 py-3 text-sm font-semibold text-slate-950 hover:bg-slate-100">Review BOM Uploads</Link>
              <Link href="/admin/products" className="rounded-xl border border-white/20 px-4 py-3 text-sm font-semibold text-white hover:bg-white/10">Manage Products</Link>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <MetricCard label="Recent Quotes" value={quotes.length} hint="Latest requests loaded" />
            <MetricCard label="Open Recent Quotes" value={openQuotes} hint="Pending or quoted workflow" tone="amber" />
            <MetricCard label="Order Value" value={money(orderTotal)} hint="Recent accepted order value" tone="green" />
            <MetricCard label="Gross Margin" value={money(grossMargin)} hint="Recent orders; requires confirmed costs for every line" tone="green" />
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"><div className="text-sm text-slate-500">Recent Uploads Needing Review</div><div className="mt-2 text-3xl font-bold text-slate-950">{needsReview}</div></div>
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"><div className="text-sm text-slate-500">Recent Catalog Products</div><div className="mt-2 text-3xl font-bold text-slate-950">{products.length}</div></div>
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"><div className="text-sm text-slate-500">Recent Supplier Records</div><div className="mt-2 text-3xl font-bold text-slate-950">{suppliers.length}</div></div>
          </div>

          <div className="grid gap-6 xl:grid-cols-2">
            <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5"><div><h3 className="font-bold text-slate-950">Latest Quotes</h3><p className="text-sm text-slate-500">Incoming customer requests</p></div><Link href="/admin/quotes" className="text-sm font-semibold text-blue-700">View all</Link></div>
              <div className="divide-y divide-slate-200">
                {quotes.length === 0 && <div className="p-6 text-slate-500">No quotes yet.</div>}
                {quotes.map((quote) => (
                  <Link key={quote.id} href={`/admin/quotes/${quote.id}`} className="block p-5 hover:bg-slate-50">
                    <div className="flex items-start justify-between gap-4"><div><div className="font-semibold text-slate-950">{quote.company}</div><div className="mt-1 text-sm text-slate-500">{quote.quote_id} · {quote.name}</div></div><Badge>{quote.status}</Badge></div>
                  </Link>
                ))}
              </div>
            </div>

            <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5"><div><h3 className="font-bold text-slate-950">Material Uploads</h3><p className="text-sm text-slate-500">BOMs and project lists</p></div><Link href="/admin/material-uploads" className="text-sm font-semibold text-blue-700">View all</Link></div>
              <div className="divide-y divide-slate-200">
                {uploads.length === 0 && <div className="p-6 text-slate-500">No uploads yet.</div>}
                {uploads.map((upload) => (
                  <Link key={upload.id} href="/admin/material-uploads" className="block p-5 hover:bg-slate-50">
                    <div className="flex items-start justify-between gap-4"><div><div className="font-semibold text-slate-950">{upload.company}</div><div className="mt-1 text-sm text-slate-500">{upload.file_name}</div></div><Badge tone={upload.status === 'converted' ? 'green' : 'amber'}>{upload.status}</Badge></div>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5"><div><h3 className="font-bold text-slate-950">Latest Orders</h3><p className="text-sm text-slate-500">Fulfillment and margin tracking</p></div><Link href="/admin/orders" className="text-sm font-semibold text-blue-700">View all</Link></div>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-slate-50 text-slate-600"><tr><th className="px-5 py-3 text-left">Order</th><th className="px-5 py-3 text-left">Company</th><th className="px-5 py-3 text-left">Status</th><th className="px-5 py-3 text-right">Total</th></tr></thead>
                <tbody>
                  {orders.length === 0 && <tr><td colSpan="4" className="p-6 text-center text-slate-500">No orders yet.</td></tr>}
                  {orders.map((order) => <tr key={order.id} className="border-t border-slate-200 hover:bg-slate-50"><td className="px-5 py-4 font-mono text-blue-700">{order.order_number}</td><td className="px-5 py-4 font-semibold text-slate-950">{order.company}</td><td className="px-5 py-4"><Badge tone="green">{order.status}</Badge></td><td className="px-5 py-4 text-right font-bold">{money(order.total)}</td></tr>)}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </AdminShell>
  )
}
