import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import AdminShell from '../../../components/AdminShell'
import { supabase } from '../../../lib/supabase'
import { products } from '../../../data/products'

function money(value) {
  return `$${Number(value || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export default function QuoteDetail() {
  const router = useRouter()
  const { id } = router.query
  const [quote, setQuote] = useState(null)
  const [items, setItems] = useState([])
  const [notes, setNotes] = useState('')
  const [selectedProduct, setSelectedProduct] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [unitPrice, setUnitPrice] = useState(0)
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (id) loadData()
  }, [id])

  async function loadData() {
    const { data: quoteData } = await supabase.from('quotes').select('*').eq('id', id).single()
    const { data: itemsData } = await supabase.from('quote_items').select('*').eq('quote_id', id).order('created_at', { ascending: true })
    setQuote(quoteData)
    setItems(itemsData || [])
    setNotes(quoteData?.internal_notes || '')
  }

  async function addItem() {
    const product = products.find((p) => p.slug === selectedProduct)
    if (!product) return setMessage('Select a product first.')

    const { data, error } = await supabase.from('quote_items').insert([
      {
        quote_id: id,
        product_slug: product.slug,
        product_name: product.name,
        quantity,
        unit_price: unitPrice,
      },
    ]).select()

    if (error) return setMessage(error.message)
    setItems([...items, ...(data || [])])
    setMessage('Item added.')
  }

  async function updateStatus(newStatus) {
    const { error } = await supabase.from('quotes').update({ status: newStatus }).eq('id', id)
    if (error) return setMessage(error.message)
    setQuote({ ...quote, status: newStatus })
    setMessage('Status updated.')
  }

  async function saveNotes() {
    const { error } = await supabase.from('quotes').update({ internal_notes: notes }).eq('id', id)
    if (error) return setMessage(error.message)
    setMessage('Notes saved.')
  }

  async function sendQuote() {
    const res = await fetch(`/api/quotes/${id}/send`, { method: 'POST' })
    const data = await res.json()
    if (!data.success) return setMessage(data.message || 'Error sending quote.')
    setQuote({ ...quote, status: 'quoted' })
    setMessage('Quote sent to customer.')
  }

  if (!quote) {
    return <AdminShell title="Quote Detail"><div className="bg-white rounded-xl shadow p-8 text-gray-600">Loading quote...</div></AdminShell>
  }

  const total = items.reduce((sum, item) => sum + Number(item.total_price || 0), 0)

  return (
    <AdminShell title={`Quote ${quote.quote_id}`}>
      <div className="space-y-6">
        {message && <div className="bg-blue-50 border border-blue-200 text-blue-800 rounded-xl p-4 text-sm">{message}</div>}

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-xl shadow border p-6">
            <h2 className="text-xl font-bold mb-4">Customer Request</h2>
            <div className="grid md:grid-cols-2 gap-4 text-sm mb-6">
              <div><span className="text-gray-500">Company</span><div className="font-semibold">{quote.company}</div></div>
              <div><span className="text-gray-500">Contact</span><div className="font-semibold">{quote.name}</div></div>
              <div><span className="text-gray-500">Email</span><div className="font-semibold">{quote.email}</div></div>
              <div><span className="text-gray-500">Phone</span><div className="font-semibold">{quote.phone || '-'}</div></div>
            </div>
            <div className="bg-gray-50 border rounded-lg p-4 whitespace-pre-wrap text-sm text-gray-700">{quote.details || 'No details provided.'}</div>
          </div>

          <div className="bg-white rounded-xl shadow border p-6">
            <h2 className="text-xl font-bold mb-4">Workflow</h2>
            <select value={quote.status} onChange={(e) => updateStatus(e.target.value)} className="w-full border rounded-lg p-3 mb-4">
              <option value="pending">Pending</option>
              <option value="quoted">Quoted</option>
              <option value="accepted">Accepted</option>
              <option value="won">Won</option>
              <option value="lost">Lost</option>
            </select>
            <a href={`/api/quotes/${id}/pdf`} target="_blank" className="block text-center w-full bg-green-600 hover:bg-green-700 text-white rounded-lg py-3 font-semibold mb-3">Generate PDF</a>
            <button onClick={sendQuote} className="w-full bg-purple-600 hover:bg-purple-700 text-white rounded-lg py-3 font-semibold">Send Quote</button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow border p-6">
          <div className="flex flex-wrap justify-between gap-3 items-center mb-4">
            <h2 className="text-xl font-bold">Line Items</h2>
            <div className="text-xl font-bold text-slate-900">{money(total)}</div>
          </div>
          <div className="grid md:grid-cols-4 gap-3 mb-5">
            <select value={selectedProduct} onChange={(e) => setSelectedProduct(e.target.value)} className="md:col-span-2 border rounded-lg p-3">
              <option value="">Select Product</option>
              {products.map((product) => <option key={product.slug} value={product.slug}>{product.name}</option>)}
            </select>
            <input type="number" value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} className="border rounded-lg p-3" placeholder="Qty" />
            <input type="number" value={unitPrice} onChange={(e) => setUnitPrice(Number(e.target.value))} className="border rounded-lg p-3" placeholder="Unit price" />
          </div>
          <button onClick={addItem} className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-5 py-3 font-semibold mb-5">Add Line Item</button>
          <div className="overflow-x-auto border rounded-xl">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-100"><tr><th className="text-left p-3">Product</th><th className="text-right p-3">Qty</th><th className="text-right p-3">Unit Price</th><th className="text-right p-3">Total</th></tr></thead>
              <tbody>
                {items.length === 0 && <tr><td colSpan="4" className="text-center p-6 text-gray-500">No quote items yet.</td></tr>}
                {items.map((item) => <tr key={item.id} className="border-t"><td className="p-3 font-semibold">{item.product_name}</td><td className="p-3 text-right">{item.quantity}</td><td className="p-3 text-right">{money(item.unit_price)}</td><td className="p-3 text-right font-bold">{money(item.total_price)}</td></tr>)}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow border p-6">
          <h2 className="text-xl font-bold mb-4">Internal Notes</h2>
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows="6" className="w-full border rounded-lg p-3 mb-4" placeholder="Pricing notes, vendor quotes, lead time, follow-up reminders..." />
          <button onClick={saveNotes} className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-5 py-3 font-semibold">Save Notes</button>
        </div>
      </div>
    </AdminShell>
  )
}
