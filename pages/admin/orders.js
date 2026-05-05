import { useEffect, useState } from 'react'
import Link from 'next/link'
import Header from '../../components/Header'
import Footer from '../../components/Footer'
import { supabase } from '../../lib/supabase'

export default function OrdersPage() {
  const [orders, setOrders] = useState([])
  useEffect(() => { loadOrders() }, [])

  async function loadOrders() {
    const { data } = await supabase.from('orders').select('*').order('created_at', { ascending: false })
    setOrders(data || [])
  }

  return (
    <>
      <Header />
      <main className="bg-gray-50 min-h-screen">
        <section className="bg-slate-900 text-white"><div className="max-w-7xl mx-auto px-6 py-12"><h1 className="text-4xl font-bold">Orders</h1></div></section>
        <section className="max-w-7xl mx-auto px-6 py-10 grid gap-4">
          {orders.length === 0 && <div className="bg-white rounded-xl shadow p-8">No orders yet.</div>}
          {orders.map(order => (
            <div key={order.id} className="bg-white border rounded-xl shadow p-6 flex justify-between gap-4">
              <div><h2 className="font-bold text-lg">{order.order_number}</h2><p>{order.company}</p><p className="text-sm text-gray-600">Status: {order.status}</p></div>
              <div className="text-right"><p className="font-bold">${order.total}</p><Link href={`/admin/orders/${order.id}`} className="text-blue-600 font-semibold">View Order</Link></div>
            </div>
          ))}
        </section>
      </main>
      <Footer />
    </>
  )
}
