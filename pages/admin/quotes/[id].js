import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import Header from '../../../components/Header'
import Footer from '../../../components/Footer'
import { supabase } from '../../../lib/supabase'
import { products } from '../../../data/products'

export default function QuoteDetail() {
  const router = useRouter()
  const { id } = router.query
  const [quote, setQuote] = useState(null)
  const [items, setItems] = useState([])
  const [notes, setNotes] = useState('')
  const [selectedProduct, setSelectedProduct] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [unitPrice, setUnitPrice] = useState(0)

  useEffect(() => { if (id) loadData() }, [id])

  async function loadData() {
    const { data: quoteData } = await supabase.from('quotes').select('*').eq('id', id).single()
    const { data: itemsData } = await supabase.from('quote_items').select('*').eq('quote_id', id)
    setQuote(quoteData); setItems(itemsData || []); setNotes(quoteData?.internal_notes || '')
  }

  async function addItem() {
    const product = products.find(p => p.slug === selectedProduct)
    if (!product) return
    const { data } = await supabase.from('quote_items').insert([{ quote_id: id, product_slug: product.slug, product_name: product.name, quantity, unit_price: unitPrice }]).select()
    setItems([...items, ...(data || [])])
  }

  async function sendQuote() {
    const res = await fetch(`/api/quotes/${id}/send`, { method: 'POST' })
    const data = await res.json()
    if (data.success) alert('Quote sent successfully')
    else alert(data.message || 'Error sending quote')
  }

  async function updateStatus(newStatus) {
    await supabase.from('quotes').update({ status: newStatus }).eq('id', id)
    setQuote({ ...quote, status: newStatus })
  }

  if (!quote) return <p className="p-10">Loading...</p>
  const total = items.reduce((sum, item) => sum + Number(item.total_price || 0), 0)

  return (
    <>
      <Header />
      <main className="bg-gray-50 min-h-screen">
        <section className="bg-slate-900 text-white"><div className="max-w-5xl mx-auto px-6 py-12"><h1 className="text-3xl font-bold">Quote {quote.quote_id}</h1><p className="text-slate-200 mt-2">{quote.company}</p></div></section>
        <section className="max-w-5xl mx-auto px-6 py-10 space-y-6">
          <div className="bg-white p-6 rounded-xl shadow">
            <div className="flex flex-wrap justify-between gap-3 items-center mb-4">
              <h2 className="text-xl font-bold">Quote Items</h2>
              <div className="flex gap-2">
                <a href={`/api/quotes/${id}/pdf`} target="_blank" className="bg-green-600 text-white px-4 py-2 rounded font-semibold">Generate PDF</a>
                <button onClick={sendQuote} className="bg-purple-600 text-white px-4 py-2 rounded font-semibold">Send Quote</button>
              </div>
            </div>
            <div className="flex flex-wrap gap-4 mb-4">
              <select onChange={(e) => setSelectedProduct(e.target.value)} className="border p-2 rounded"><option value="">Select Product</option>{products.map(p => <option key={p.slug} value={p.slug}>{p.name}</option>)}</select>
              <input type="number" value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} className="border p-2 rounded w-24" />
              <input type="number" placeholder="Unit $" value={unitPrice} onChange={(e) => setUnitPrice(Number(e.target.value))} className="border p-2 rounded w-28" />
              <button onClick={addItem} className="bg-blue-600 text-white px-4 py-2 rounded">Add</button>
            </div>
            <table className="w-full text-sm border"><thead className="bg-gray-100"><tr><th className="p-2 text-left">Product</th><th className="p-2">Qty</th><th className="p-2">Unit Price</th><th className="p-2">Total</th></tr></thead><tbody>{items.map(item => <tr key={item.id} className="border-t"><td className="p-2">{item.product_name}</td><td className="p-2 text-center">{item.quantity}</td><td className="p-2 text-center">${item.unit_price}</td><td className="p-2 text-center font-semibold">${item.total_price}</td></tr>)}</tbody></table>
            <div className="text-right mt-4 font-bold text-lg">Total: ${total}</div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow">
            <h2 className="text-xl font-bold mb-4">Status</h2>
            <select value={quote.status} onChange={(e) => updateStatus(e.target.value)} className="border p-2 rounded">
              <option value="pending">Pending</option><option value="quoted">Quoted</option><option value="accepted">Accepted</option><option value="won">Won</option><option value="lost">Lost</option>
            </select>
          </div>

          <div className="bg-white p-6 rounded-xl shadow">
            <h2 className="text-xl font-bold mb-4">Internal Notes</h2>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} className="w-full border p-3 rounded mb-4" rows="5" />
            <button onClick={async () => { await supabase.from('quotes').update({ internal_notes: notes }).eq('id', quote.id); alert('Saved') }} className="bg-blue-600 text-white px-4 py-2 rounded">Save Notes</button>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
