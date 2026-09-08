import { totalFor } from '../../../lib/pricing'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import Header from '../../../components/Header'
import Footer from '../../../components/Footer'
import { supabase } from '../../../lib/supabase'

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
  if (status === 'accepted' || status === 'won') return 'green'
  if (status === 'lost') return 'red'
  if (status === 'pending') return 'amber'
  return 'blue'
}

export default function CustomerQuoteDetail() {
  const router = useRouter()
  const { id } = router.query
  const [quote, setQuote] = useState(null)
  const [items, setItems] = useState([])
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [accepting, setAccepting] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (id) loadQuote()
  }, [id])

  async function loadQuote() {
    setLoading(true)
    const { data: quoteData, error } = await supabase.from('quotes').select('*').eq('id', id).single()
    if (error || !quoteData) {
      setMessage('Quote not found.')
      setLoading(false)
      return
    }

    const [{ data: itemData }, { data: orderData }] = await Promise.all([
      supabase.from('quote_items').select('*').eq('quote_id', id).order('created_at', { ascending: true }),
      supabase.from('orders').select('*').eq('quote_id', id).maybeSingle(),
    ])

    setQuote(quoteData)
    setItems(itemData || [])
    setOrder(orderData || null)
    setLoading(false)
  }

  async function acceptQuote() {
    setAccepting(true)
    setMessage('')
    const res = await fetch(`/api/quotes/${id}/accept`, { method: 'POST' })
    const data = await res.json()
    setAccepting(false)

    if (!data.success) {
      setMessage(data.message || 'Could not accept quote.')
      return
    }

    setMessage(`Quote accepted. Order ${data.orderNumber} has been created.`)
    loadQuote()
  }

  const total = totalFor(items)
  const canAccept = quote && ['quoted', 'pending'].includes(quote.status) && !order

  return (
    <>
      <Header />
      <main className="min-h-screen bg-slate-50">
        <section className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 text-white">
          <div className="absolute inset-0 opacity-20"><div className="absolute -left-24 top-8 h-80 w-80 rounded-full bg-blue-500 blur-3xl" /><div className="absolute right-0 bottom-0 h-80 w-80 rounded-full bg-cyan-400 blur-3xl" /></div>
          <div className="relative mx-auto max-w-6xl px-6 py-16">
            <button onClick={() => router.push('/account')} className="mb-5 text-sm font-semibold text-blue-200">← Back to account</button>
            <div className="max-w-4xl">
              <div className="mb-4 inline-flex rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-blue-100">Customer Quote Review</div>
              <h1 className="text-4xl font-bold leading-tight md:text-5xl">{quote?.quote_id || 'Quote Detail'}</h1>
              <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-200">Review the materials, status, and total for this Odiscom Supply quote. When ready, accept the quote to create an order.</p>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 py-10">
          {loading ? (
            <div className="rounded-3xl bg-white p-10 text-slate-600 shadow-sm">Loading quote...</div>
          ) : !quote ? (
            <div className="rounded-3xl bg-white p-10 text-slate-600 shadow-sm">{message || 'Quote not found.'}</div>
          ) : (
            <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
              <div className="space-y-6">
                {message && <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800">{message}</div>}

                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div>
                      <h2 className="text-2xl font-bold text-slate-950">{quote.company}</h2>
                      <p className="mt-2 text-sm text-slate-600">{quote.name} · {quote.email} · {quote.phone || 'No phone'}</p>
                    </div>
                    <Badge tone={statusTone(quote.status)}>{quote.status}</Badge>
                  </div>
                  <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-5 whitespace-pre-wrap text-sm leading-6 text-slate-700">{quote.details || 'No project details provided.'}</div>
                </div>

                <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                  <div className="border-b border-slate-200 px-6 py-5"><h2 className="text-xl font-bold text-slate-950">Quote Items</h2><p className="mt-1 text-sm text-slate-600">Line items prepared by Odiscom Supply.</p></div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                      <thead className="bg-slate-50 text-slate-600"><tr><th className="p-4 text-left">Product</th><th className="p-4 text-right">Qty</th><th className="p-4 text-right">Unit Price</th><th className="p-4 text-right">Total</th></tr></thead>
                      <tbody>
                        {items.length === 0 && <tr><td colSpan="4" className="p-8 text-center text-slate-500">No priced quote items yet.</td></tr>}
                        {items.map((item) => <tr key={item.id} className="border-t border-slate-200"><td className="p-4 font-semibold text-slate-950">{item.product_name}</td><td className="p-4 text-right">{item.quantity}</td><td className="p-4 text-right">{money(Number(item.unit_price)>0 ? item.unit_price : null)}</td><td className="p-4 text-right font-bold">{money(Number(item.unit_price)>0 ? item.total_price : null)}</td></tr>)}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              <aside className="space-y-6">
                <div className="sticky top-24 space-y-6">
                  <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-700">Quote Total</div>
                    <div className="mt-3 text-4xl font-bold text-slate-950">{money(total)}</div>
                    <p className="mt-3 text-sm leading-6 text-slate-600">Accepting this quote converts it into an Odiscom Supply order and notifies the internal team.</p>
                    {order ? (
                      <div className="mt-6 rounded-2xl border border-green-200 bg-green-50 p-4 text-sm text-green-800"><strong>Accepted.</strong><br />Order {order.order_number} is now {order.status}.</div>
                    ) : (
                      <button onClick={acceptQuote} disabled={!canAccept || accepting} className="mt-6 w-full rounded-xl bg-green-600 px-5 py-3 text-sm font-semibold text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50">{accepting ? 'Accepting...' : 'Accept Quote'}</button>
                    )}
                    <p className="mt-3 text-sm">The issued quote PDF is sent to your email. Contact sales@odiscom.com for a copy.</p>
                  </div>

                  <div className="rounded-3xl bg-gradient-to-br from-slate-950 to-blue-950 p-6 text-white shadow-sm"><div className="text-lg font-bold">Need a change?</div><p className="mt-2 text-sm leading-6 text-slate-300">Contact Odiscom Supply before accepting if quantities, delivery requirements, alternates, or project timing need revision.</p></div>
                </div>
              </aside>
            </div>
          )}
        </section>
      </main>
      <Footer />
    </>
  )
}
