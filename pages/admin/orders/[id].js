import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import Header from '../../../components/Header'
import Footer from '../../../components/Footer'
import { supabase } from '../../../lib/supabase'

export default function OrderDetail() {
  const router = useRouter()
  const { id } = router.query
  const [order, setOrder] = useState(null)
  const [items, setItems] = useState([])

  useEffect(() => { if (id) loadOrder() }, [id])

  async function loadOrder() {
    const { data: orderData } = await supabase.from('orders').select('*').eq('id', id).single()
    const { data: itemsData } = await supabase.from('order_items').select('*').eq('order_id', id)
    setOrder(orderData); setItems(itemsData || [])
  }

  async function updateStatus(newStatus) {
    await supabase.from('orders').update({ status: newStatus }).eq('id', id)
    setOrder({ ...order, status: newStatus })
  }

  if (!order) return <p className="p-10">Loading...</p>

  return (
    <>
      <Header />
      <main className="bg-gray-50 min-h-screen">
        <section className="bg-slate-900 text-white"><div className="max-w-5xl mx-auto px-6 py-12"><h1 className="text-3xl font-bold">{order.order_number}</h1><p className="text-slate-200 mt-2">{order.company}</p></div></section>
        <section className="max-w-5xl mx-auto px-6 py-10 space-y-6">
          <div className="bg-white p-6 rounded-xl shadow"><h2 className="text-xl font-bold mb-4">Customer</h2><p><strong>Contact:</strong> {order.contact_name}</p><p><strong>Email:</strong> {order.email}</p><p><strong>Phone:</strong> {order.phone}</p></div>
          <div className="bg-white p-6 rounded-xl shadow"><h2 className="text-xl font-bold mb-4">Status</h2><select value={order.status} onChange={(e) => updateStatus(e.target.value)} className="border p-2 rounded"><option value="new">New</option><option value="processing">Processing</option><option value="ordered">Ordered from Vendor</option><option value="shipped">Shipped</option><option value="completed">Completed</option></select></div>
          <div className="bg-white p-6 rounded-xl shadow"><h2 className="text-xl font-bold mb-4">Items</h2>{items.map(item => <div key={item.id} className="border-b py-3">{item.product_name} — Qty: {item.quantity} — ${item.total_price}</div>)}<h2 className="text-right mt-4 text-xl font-bold">Total: ${order.total}</h2></div>
        </section>
      </main>
      <Footer />
    </>
  )
}
