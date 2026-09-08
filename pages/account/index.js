import { useEffect, useState } from 'react'
import Link from 'next/link'
import Header from '../../components/Header'
import Footer from '../../components/Footer'
import { supabase } from '../../lib/supabase'

function money(value) {
  if (value === null || value === undefined || value === '' || !Number.isFinite(Number(value))) return 'Not priced'
  return `$${Number(value || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

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
      <main className="min-h-screen bg-slate-50">
        <section className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 text-white">
          <div className="absolute inset-0 opacity-20"><div className="absolute -left-24 top-8 h-80 w-80 rounded-full bg-blue-500 blur-3xl" /><div className="absolute right-0 bottom-0 h-80 w-80 rounded-full bg-cyan-400 blur-3xl" /></div>
          <div className="relative mx-auto max-w-6xl px-6 py-16">
            <div className="mb-4 inline-flex rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-blue-100">Customer Portal</div>
            <h1 className="max-w-3xl text-4xl font-bold leading-tight md:text-5xl">Track quotes and orders by email</h1>
            <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-200">View Odiscom Supply quote requests, quoted work, accepted orders, and fulfillment status using the email address submitted with your request.</p>
          </div>
        </section>

        <section className="-mt-8 relative z-10 mx-auto max-w-6xl px-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-lg">
            {message && <div className="mb-4 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800">{message}</div>}
            <div className="grid gap-3 md:grid-cols-[1fr_auto]">
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email used for quote request" className="rounded-2xl border border-slate-300 bg-slate-50 px-4 py-4 text-sm outline-none transition focus:border-blue-500 focus:bg-white" />
              <button onClick={() => loadCustomerData()} className="rounded-2xl bg-blue-600 px-6 py-4 text-sm font-semibold text-white hover:bg-blue-700">
                {loading ? 'Loading...' : 'Load Activity'}
              </button>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 py-10">
          <div className="mb-6 grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="text-sm text-slate-500">Quotes</div><div className="mt-1 text-3xl font-bold text-slate-950">{quotes.length}</div></div>
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="text-sm text-slate-500">Orders</div><div className="mt-1 text-3xl font-bold text-slate-950">{orders.length}</div></div>
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="text-sm text-slate-500">Order Value</div><div className="mt-1 text-3xl font-bold text-slate-950">{money(orders.reduce((sum, order) => sum + Number(order.total || 0), 0))}</div></div>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-200 px-6 py-5"><h2 className="text-xl font-bold text-slate-950">Quotes</h2><p className="mt-1 text-sm text-slate-600">Submitted and quoted material requests.</p></div>
              <div className="divide-y divide-slate-200">
                {quotes.length === 0 && <div className="p-8 text-slate-500">No quotes found.</div>}
                {quotes.map((quote) => (
                  <div key={quote.id} className="p-6">
                    <div className="flex items-start justify-between gap-4"><div><div className="font-mono text-sm font-bold text-blue-700">{quote.quote_id}</div><div className="mt-1 font-semibold text-slate-950">{quote.company}</div><div className="mt-2 text-xs text-slate-500">{quote.created_at ? new Date(quote.created_at).toLocaleString() : ''}</div></div><span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">{quote.status}</span></div>
                    <div className="mt-4 line-clamp-3 rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">{quote.details || 'No details provided.'}</div>
                    <div className="mt-4 flex gap-3">
                      <Link href={`/account/quotes/${quote.id}`} className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">View Quote</Link>
                      <a href={`/api/quotes/${quote.id}/pdf`} target="_blank" className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-50">PDF</a>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-200 px-6 py-5"><h2 className="text-xl font-bold text-slate-950">Orders</h2><p className="mt-1 text-sm text-slate-600">Accepted quotes and fulfillment progress.</p></div>
              <div className="divide-y divide-slate-200">
                {orders.length === 0 && <div className="p-8 text-slate-500">No orders found.</div>}
                {orders.map((order) => (
                  <div key={order.id} className="p-6">
                    <div className="flex items-start justify-between gap-4"><div><div className="font-mono text-sm font-bold text-green-700">{order.order_number}</div><div className="mt-1 font-semibold text-slate-950">{order.company}</div><div className="mt-2 text-xs text-slate-500">{order.created_at ? new Date(order.created_at).toLocaleString() : ''}</div></div><div className="text-right"><div className="font-bold text-slate-950">{money(order.total)}</div><span className="mt-2 inline-block rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">{order.status}</span></div></div>
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
