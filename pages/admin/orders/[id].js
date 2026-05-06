import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import AdminShell from '../../../components/AdminShell'
import { supabase } from '../../../lib/supabase'

function money(value) {
  return `$${Number(value || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export default function OrderDetail() {
  const router = useRouter()
  const { id } = router.query
  const [order, setOrder] = useState(null)
  const [items, setItems] = useState([])
  const [message, setMessage] = useState('')

  useEffect(() => { if (id) loadOrder() }, [id])

  async function loadOrder() {
    const { data: orderData } = await supabase.from('orders').select('*').eq('id', id).single()
    const { data: itemsData } = await supabase.from('order_items').select('*').eq('order_id', id).order('created_at', { ascending: true })
    setOrder(orderData)
    setItems(itemsData || [])
  }

  async function updateStatus(newStatus) {
    const { error } = await supabase.from('orders').update({ status: newStatus }).eq('id', id)
    if (error) return setMessage(error.message)
    setOrder({ ...order, status: newStatus })
    setMessage('Order status updated.')
  }

  if (!order) {
    return <AdminShell title="Order Detail"><div className="bg-white rounded-xl shadow p-8 text-gray-600">Loading order...</div></AdminShell>
  }

  const sellTotal = items.reduce((sum, item) => sum + Number(item.total_price || 0), 0)
  const costTotal = items.reduce((sum, item) => sum + Number(item.quantity || 0) * Number(item.unit_cost || 0), 0)
  const marginTotal = sellTotal - costTotal
  const marginPercent = sellTotal > 0 ? (marginTotal / sellTotal) * 100 : 0

  return (
    <AdminShell title={order.order_number}>
      <div className="space-y-6">
        {message && <div className="bg-blue-50 border border-blue-200 text-blue-800 rounded-xl p-4 text-sm">{message}</div>}

        <div className="grid md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl shadow border p-5"><div className="text-sm text-gray-500">Order Total</div><div className="text-2xl font-bold">{money(order.total || sellTotal)}</div></div>
          <div className="bg-white rounded-xl shadow border p-5"><div className="text-sm text-gray-500">Estimated Cost</div><div className="text-2xl font-bold">{money(costTotal)}</div></div>
          <div className="bg-white rounded-xl shadow border p-5"><div className="text-sm text-gray-500">Gross Margin</div><div className="text-2xl font-bold text-green-700">{money(marginTotal)}</div></div>
          <div className="bg-white rounded-xl shadow border p-5"><div className="text-sm text-gray-500">Margin %</div><div className="text-2xl font-bold text-green-700">{marginPercent.toFixed(1)}%</div></div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow border">
            <h2 className="text-xl font-bold mb-4">Customer</h2>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div><span className="text-gray-500">Company</span><div className="font-semibold">{order.company}</div></div>
              <div><span className="text-gray-500">Contact</span><div className="font-semibold">{order.contact_name}</div></div>
              <div><span className="text-gray-500">Email</span><div className="font-semibold">{order.email}</div></div>
              <div><span className="text-gray-500">Phone</span><div className="font-semibold">{order.phone || '-'}</div></div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow border">
            <h2 className="text-xl font-bold mb-4">Fulfillment Status</h2>
            <select value={order.status} onChange={(e) => updateStatus(e.target.value)} className="w-full border p-3 rounded-lg">
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

        <div className="bg-white p-6 rounded-xl shadow border">
          <h2 className="text-xl font-bold mb-4">Order Items</h2>
          <div className="overflow-x-auto border rounded-xl">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-100"><tr><th className="text-left p-3">Product</th><th className="text-left p-3">Supplier</th><th className="text-right p-3">Qty</th><th className="text-right p-3">Sell</th><th className="text-right p-3">Cost</th><th className="text-right p-3">Margin</th><th className="text-right p-3">Line Total</th></tr></thead>
              <tbody>
                {items.length === 0 && <tr><td colSpan="7" className="p-6 text-center text-gray-500">No order items.</td></tr>}
                {items.map((item) => {
                  const lineCost = Number(item.quantity || 0) * Number(item.unit_cost || 0)
                  const lineMargin = Number(item.total_price || 0) - lineCost
                  return (
                    <tr key={item.id} className="border-t">
                      <td className="p-3 font-semibold">{item.product_name}</td>
                      <td className="p-3">{item.supplier_name || '-'}</td>
                      <td className="p-3 text-right">{item.quantity}</td>
                      <td className="p-3 text-right">{money(item.unit_price)}</td>
                      <td className="p-3 text-right">{money(item.unit_cost)}</td>
                      <td className="p-3 text-right font-bold text-green-700">{money(lineMargin)}</td>
                      <td className="p-3 text-right font-bold">{money(item.total_price)}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminShell>
  )
}
