import { useEffect, useState } from 'react'
import Header from '../../components/Header'
import Footer from '../../components/Footer'
import { supabase } from '../../lib/supabase'

export default function Account() {
  const [email, setEmail] = useState('')
  const [quotes, setQuotes] = useState([])
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    const savedEmail = typeof window !== 'undefined' ? localStorage.getItem('odiscom_customer_email') : ''
    if (savedEmail) {
      setEmail(savedEmail)
      loadCustomerData(savedEmail)
    }
  }, [])

  async function loadCustomerData(customerEmail = email) {
    if (!customerEmail) return setMessage('Enter the email used for your quote request.')
    setLoading(true)
    setMessage('')
    if (typeof window !== 'undefined') localStorage.setItem('odiscom_customer_email', customerEmail)

    const [{ data: quoteData, error: quoteError }, { data: orderData, error: orderError }] = await Promise.all([
      supabase.from('quotes').select('*').eq('email', customerEmail).order('created_at', { ascending: false }),
      supabase.from('orders').select('*').eq('email', customerEmail).order('created_at', { ascending: false }),
    ])

    if (quoteError || orderError) setMessage(quoteError?.message || orderError?.message)
    setQuotes(quoteData || [])
    setOrders(orderData || [])
    setLoading(false)
  }

  return (
    <>
      <Header />
      <main className="bg-gray-50 min-h-screen">
        <section className="bg-slate-900 text-white">
          <div className="max-w-5xl mx-auto px-6 py-14">
            <h1 className="text-4xl font-bold">Customer Portal</h1>
            <p className="text-slate-200 mt-3">View your Odiscom Supply quotes and accepted orders by email.</p>
          </div>
        </section>

        <section className="max-w-5xl mx-auto px-6 py-10 space-y-6">
          <div className="bg-white rounded-xl shadow border p-6">
            <h2 className="text-xl font-bold mb-4">Find Your Requests</h2>
            {message && <div className="bg-blue-50 border border-blue-200 text-blue-800 rounded-lg p-3 text-sm mb-4">{message}</div>}
            <div className="flex flex-col md:flex-row gap-3">
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email used for quote request" className="flex-1 border rounded-lg p-3" />
              <button onClick={() => loadCustomerData()} className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-5 py-3 font-semibold">
                {loading ? 'Loading...' : 'Load My Activity'}
              </button>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow border overflow-hidden">
              <div className="px-6 py-4 border-b font-bold">Quotes</div>
              <div className="divide-y">
                {quotes.length === 0 && <div className="p-6 text-gray-500">No quotes found.</div>}
                {quotes.map((quote) => (
                  <div key={quote.id} className="p-5">
                    <div className="font-bold text-slate-900">{quote.quote_id}</div>
                    <div className="text-sm text-gray-600 mt-1">{quote.company}</div>
                    <div className="text-xs font-semibold bg-blue-50 text-blue-700 inline-block px-2 py-1 rounded-full mt-3">{quote.status}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl shadow border overflow-hidden">
              <div className="px-6 py-4 border-b font-bold">Orders</div>
              <div className="divide-y">
                {orders.length === 0 && <div className="p-6 text-gray-500">No orders found.</div>}
                {orders.map((order) => (
                  <div key={order.id} className="p-5 flex justify-between gap-4">
                    <div>
                      <div className="font-bold text-slate-900">{order.order_number}</div>
                      <div className="text-sm text-gray-600 mt-1">{order.company}</div>
                      <div className="text-xs font-semibold bg-green-50 text-green-700 inline-block px-2 py-1 rounded-full mt-3">{order.status}</div>
                    </div>
                    <div className="font-bold">${order.total}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
