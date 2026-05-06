import { useEffect, useState } from 'react'
import Link from 'next/link'
import AdminShell from '../../components/AdminShell'
import { supabase } from '../../lib/supabase'

function money(value) {
  return `$${Number(value || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export default function OrdersPage() {
  const [orders, setOrders] = useState([])
  const [items, setItems] = useState([])
  const [statusFilter, setStatusFilter] = useState('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => { loadOrders() }, [])

  async function loadOrders() {
    const { data: orderData } = await supabase.from('orders').select('*').order('created_at', { ascending: false })
    const { data: itemData } = await supabase.from('order_items').select('*')
    setOrders(orderData || [])
    setItems(itemData || [])
    setLoading(false)
  }

  function totalsForOrder(orderId) {
    const orderItems = items.filter((item) => item.order_id === orderId)
    const sell = orderItems.reduce((sum, item) => sum + Number(item.total_price || 0), 0)
    const cost = orderItems.reduce((sum, item) => sum + Number(item.quantity || 0) * Number(item.unit_cost || 0), 0)
    const margin = sell - cost
    const marginPercent = sell > 0 ? (margin / sell) * 100 : 0
    return { sell, cost, margin, marginPercent }
  }

  const filteredOrders = statusFilter === 'all' ? orders : orders.filter((order) => order.status === statusFilter)
  const totalValue = orders.reduce((sum, order) => sum + Number(order.total || 0), 0)
  const totalCost = items.reduce((sum, item) => sum + Number(item.quantity || 0) * Number(item.unit_cost || 0), 0)
  const totalMargin = totalValue - totalCost

  return (
    <AdminShell title="Orders">
      <div className="space-y-6">
        <div className="grid md:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl shadow border p-5"><div className="text-sm text-gray-500">Order Value</div><div className="text-2xl font-bold">{money(totalValue)}</div></div>
          <div className="bg-white rounded-xl shadow border p-5"><div className="text-sm text-gray-500">Estimated Cost</div><div className="text-2xl font-bold">{money(totalCost)}</div></div>
          <div className="bg-white rounded-xl shadow border p-5"><div className="text-sm text-gray-500">Gross Margin</div><div className="text-2xl font-bold text-green-700">{money(totalMargin)}</div></div>
        </div>

        <div className="bg-white border rounded-xl shadow p-4 flex flex-wrap justify-between gap-3 items-center">
          <div>
            <h2 className="font-bold text-slate-900">Order Pipeline</h2>
            <p className="text-sm text-gray-500">Track accepted quotes through vendor ordering, fulfillment, shipping, and completion.</p>
          </div>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="border rounded-lg px-3 py-2 text-sm">
            <option value="all">All statuses</option>
            <option value="new">New</option>
            <option value="processing">Processing</option>
            <option value="ordered">Ordered from Vendor</option>
            <option value="shipped">Shipped</option>
            <option value="completed">Completed</option>
          </select>
        </div>

        {loading ? (
          <div className="bg-white rounded-xl shadow p-8 text-gray-600">Loading orders...</div>
        ) : (
          <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-100 text-gray-700">
                  <tr>
                    <th className="text-left px-4 py-3">Order</th>
                    <th className="text-left px-4 py-3">Company</th>
                    <th className="text-left px-4 py-3">Status</th>
                    <th className="text-right px-4 py-3">Sell</th>
                    <th className="text-right px-4 py-3">Cost</th>
                    <th className="text-right px-4 py-3">Margin</th>
                    <th className="text-right px-4 py-3">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.length === 0 && <tr><td colSpan="7" className="text-center p-8 text-gray-500">No orders found.</td></tr>}
                  {filteredOrders.map((order) => {
                    const totals = totalsForOrder(order.id)
                    return (
                      <tr key={order.id} className="border-t hover:bg-gray-50">
                        <td className="px-4 py-4 font-mono text-blue-700">{order.order_number}</td>
                        <td className="px-4 py-4"><div className="font-semibold">{order.company}</div><div className="text-xs text-gray-500">{order.contact_name}</div></td>
                        <td className="px-4 py-4"><span className="bg-blue-50 text-blue-700 px-2 py-1 rounded-full text-xs font-semibold">{order.status}</span></td>
                        <td className="px-4 py-4 text-right font-semibold">{money(order.total || totals.sell)}</td>
                        <td className="px-4 py-4 text-right">{money(totals.cost)}</td>
                        <td className="px-4 py-4 text-right font-bold text-green-700">{money(totals.margin)} <span className="text-xs">({totals.marginPercent.toFixed(1)}%)</span></td>
                        <td className="px-4 py-4 text-right"><Link href={`/admin/orders/${order.id}`} className="text-blue-600 font-semibold">View</Link></td>
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
