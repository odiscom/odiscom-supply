import { totalFor, margins, amount } from '../../lib/pricing'
import { useEffect, useMemo, useState } from 'react'
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
    red: 'bg-red-50 text-red-700',
    slate: 'bg-slate-100 text-slate-700',
  }
  return <span className={`rounded-full px-3 py-1 text-xs font-semibold ${tones[tone] || tones.blue}`}>{children}</span>
}

function statusTone(status) {
  if (status === 'completed' || status === 'shipped') return 'green'
  if (status === 'on_hold') return 'red'
  if (status === 'new') return 'amber'
  return 'blue'
}

export default function OrdersPage() {
  const [orders, setOrders] = useState([])
  const [items, setItems] = useState([])
  const [statusFilter, setStatusFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [error,setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => { loadOrders() }, [])

  async function loadOrders() {
    const { data: orderData,error:orderError } = await supabase.from('orders').select('*').order('created_at', { ascending: false })
    const { data: itemData,error:itemError } = await supabase.from('order_items').select('*')
    if(orderError || itemError) { setError('Orders could not be loaded. Totals are unavailable.');setLoading(false);return }
    setOrders(orderData || [])
    setItems(itemData || [])
    setLoading(false)
  }

  function totalsForOrder(orderId) {
    const orderItems = items.filter((item) => item.order_id === orderId)
    const sell = totalFor(orderItems)
    const cost = totalFor(orderItems,'unit_cost')
    const margin = margins(sell,cost).grossProfit
    const marginPercent = margins(sell,cost).margin
    return { sell, cost, margin, marginPercent, itemCount: orderItems.length }
  }

  const filteredOrders = useMemo(() => {
    const query = search.toLowerCase().trim()
    return orders.filter((order) => {
      const matchesStatus = statusFilter === 'all' || order.status === statusFilter
      const matchesSearch = !query || [order.order_number, order.company, order.contact_name, order.email, order.phone].join(' ').toLowerCase().includes(query)
      return matchesStatus && matchesSearch
    })
  }, [orders, statusFilter, search])

  const totalValue = orders.every(order => amount(order.total) !== null) ? orders.reduce((sum,order) => sum+amount(order.total),0) : null
  const totalCost = orders.every(order => items.some(item => item.order_id === order.id)) ? totalFor(items,'unit_cost') : null
  const totalMargin = margins(totalValue,totalCost).grossProfit
  const activeOrders = orders.filter((order) => !['completed', 'cancelled'].includes(order.status)).length
  const marginPercent = margins(totalValue,totalCost).margin

  if(loading) return <AdminShell title="Orders"><div>Loading orders...</div></AdminShell>
  if(error) return <AdminShell title="Orders"><div role="alert">{error}</div></AdminShell>
  return (
    <AdminShell title="Orders">
      <div className="space-y-6">
        <div className="rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 p-8 text-white shadow-sm">
          <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
            <div className="max-w-3xl">
              <div className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-blue-200">Fulfillment Command Center</div>
              <h2 className="text-3xl font-bold">Track accepted quotes through ordering, receiving, shipping, and completion.</h2>
              <p className="mt-3 text-sm leading-6 text-slate-300">Monitor customer orders, supplier sourcing, order value, costs, and gross margin from one operations view.</p>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 xl:min-w-[620px]">
              <div className="rounded-2xl bg-white/10 p-4"><div className="text-xs text-slate-300">Orders</div><div className="mt-1 text-2xl font-bold">{orders.length}</div></div>
              <div className="rounded-2xl bg-white/10 p-4"><div className="text-xs text-slate-300">Active</div><div className="mt-1 text-2xl font-bold">{activeOrders}</div></div>
              <div className="rounded-2xl bg-white/10 p-4"><div className="text-xs text-slate-300">Value</div><div className="mt-1 text-2xl font-bold">{money(totalValue)}</div></div>
              <div className="rounded-2xl bg-white/10 p-4"><div className="text-xs text-slate-300">Margin</div><div className="mt-1 text-2xl font-bold text-green-300">{marginPercent == null ? 'Not established' : marginPercent.toFixed(1)+'%'}</div></div>
            </div>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"><div className="text-sm text-slate-500">Order Value</div><div className="mt-2 text-3xl font-bold text-slate-950">{money(totalValue)}</div></div>
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"><div className="text-sm text-slate-500">Estimated Cost</div><div className="mt-2 text-3xl font-bold text-slate-950">{money(totalCost)}</div></div>
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"><div className="text-sm text-slate-500">Gross Margin</div><div className="mt-2 text-3xl font-bold text-green-700">{money(totalMargin)}</div></div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="grid gap-3 md:grid-cols-[1fr_240px]">
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search order number, company, contact, email, phone..." className="rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:bg-white" />
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:bg-white">
              <option value="all">All statuses</option>
              <option value="new">New</option>
              <option value="processing">Processing</option>
              <option value="ordered">Ordered from Vendor</option>
              <option value="received">Received</option>
              <option value="shipped">Shipped</option>
              <option value="completed">Completed</option>
              <option value="on_hold">On Hold</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="rounded-3xl bg-white p-10 text-slate-600 shadow-sm">Loading orders...</div>
        ) : (
          <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-slate-50 text-slate-600">
                  <tr>
                    <th className="px-5 py-4 text-left">Order</th>
                    <th className="px-5 py-4 text-left">Customer</th>
                    <th className="px-5 py-4 text-left">Status</th>
                    <th className="px-5 py-4 text-right">Items</th>
                    <th className="px-5 py-4 text-right">Sell</th>
                    <th className="px-5 py-4 text-right">Cost</th>
                    <th className="px-5 py-4 text-right">Margin</th>
                    <th className="px-5 py-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.length === 0 && <tr><td colSpan="8" className="px-5 py-10 text-center text-slate-500">No orders found.</td></tr>}
                  {filteredOrders.map((order) => {
                    const totals = totalsForOrder(order.id)
                    const sell = amount(order.total) ?? totals.sell
                    return (
                      <tr key={order.id} className="border-t border-slate-200 align-top hover:bg-slate-50">
                        <td className="px-5 py-4"><div className="font-mono font-bold text-blue-700">{order.order_number}</div><div className="mt-1 text-xs text-slate-500">{order.created_at ? new Date(order.created_at).toLocaleDateString() : ''}</div></td>
                        <td className="px-5 py-4"><div className="font-semibold text-slate-950">{order.company}</div><div className="mt-1 text-xs text-slate-500">{order.contact_name} · {order.email}</div></td>
                        <td className="px-5 py-4"><Badge tone={statusTone(order.status)}>{order.status}</Badge></td>
                        <td className="px-5 py-4 text-right">{totals.itemCount}</td>
                        <td className="px-5 py-4 text-right font-semibold">{money(sell)}</td>
                        <td className="px-5 py-4 text-right">{money(totals.cost)}</td>
                        <td className="px-5 py-4 text-right font-bold text-green-700">{money(totals.margin)} <span className="text-xs">{totals.marginPercent == null ? '(Unconfirmed costs)' : '('+totals.marginPercent.toFixed(1)+'%)'}</span></td>
                        <td className="px-5 py-4 text-right"><Link href={`/admin/orders/${order.id}`} className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700">Open</Link></td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </AdminShell>
  )
}
