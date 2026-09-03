import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import AdminShell from '../../../components/AdminShell'
import { supabase } from '../../../lib/supabase'

function money(value) {
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

export default function QuoteDetail() {
  const router = useRouter()
  const { id } = router.query
  const [quote, setQuote] = useState(null)
  const [items, setItems] = useState([])
  const [suppliers, setSuppliers] = useState([])
  const [catalogProducts, setCatalogProducts] = useState([])
  const [notes, setNotes] = useState('')
  const [selectedProduct, setSelectedProduct] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [unitPrice, setUnitPrice] = useState(0)
  const [unitCost, setUnitCost] = useState(0)
  const [supplierName, setSupplierName] = useState('')
  const [customProductName, setCustomProductName] = useState('')
  const [message, setMessage] = useState('')

  useEffect(() => { if (id) loadData() }, [id])

  async function loadData() {
    const { data: quoteData } = await supabase.from('quotes').select('*').eq('id', id).single()
    const { data: itemsData } = await supabase.from('quote_items').select('*').eq('quote_id', id).order('created_at', { ascending: true })
    const { data: supplierData } = await supabase.from('suppliers').select('*').order('name', { ascending: true })
    const { data: productData } = await supabase.from('products').select('*').eq('status', 'active').order('name', { ascending: true })
    setQuote(quoteData)
    setItems(itemsData || [])
    setSuppliers(supplierData || [])
    setCatalogProducts(productData || [])
    setNotes(quoteData?.internal_notes || '')
  }

  function handleProductChange(productId) {
    setSelectedProduct(productId)
    const product = catalogProducts.find((p) => p.id === productId)
    if (product) {
      setUnitPrice(Number(product.price || 0))
      setUnitCost(Number(product.cost || 0))
      setCustomProductName(product.name)
    }
  }

  async function addItem() {
    const product = catalogProducts.find((p) => p.id === selectedProduct)
    const productName = product?.name || customProductName
    const productSlug = product?.sku || product?.id || customProductName.toLowerCase().replace(/[^a-z0-9]+/g, '-')
    if (!productName) return setMessage('Select a product or enter a custom product name.')

    const { data, error } = await supabase.from('quote_items').insert([{ quote_id: id, product_slug: productSlug, product_name: productName, quantity, unit: product?.unit || 'each', unit_price: unitPrice, unit_cost: unitCost, supplier_name: supplierName }]).select()
    if (error) return setMessage(error.message)
    setItems([...items, ...(data || [])])
    setSelectedProduct('')
    setCustomProductName('')
    setQuantity(1)
    setUnitPrice(0)
    setUnitCost(0)
    setSupplierName('')
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
    const { data: sessionData } = await supabase.auth.getSession()
    const token = sessionData.session?.access_token
    const res = await fetch(`/api/quotes/${id}/send`, { method: 'POST', headers: { Authorization: `Bearer ${token}` } })
    const data = await res.json()
    if (!data.success) return setMessage(data.message || 'Error sending quote.')
    setQuote({ ...quote, status: 'quoted' })
    setMessage('Quote sent to customer.')
  }

  if (!quote) return <AdminShell title="Quote Detail"><div className="rounded-3xl bg-white p-10 text-slate-600 shadow-sm">Loading quote...</div></AdminShell>

  const total = items.reduce((sum, item) => sum + Number(item.total_price || 0), 0)
  const totalCost = items.reduce((sum, item) => sum + Number(item.quantity || 0) * Number(item.unit_cost || 0), 0)
  const totalMargin = total - totalCost
  const marginPercent = total > 0 ? (totalMargin / total) * 100 : 0

  return (
    <AdminShell title={`Quote ${quote.quote_id}`}>
      <div className="space-y-6">
        {message && <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800">{message}</div>}

        <div className="rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 p-8 text-white shadow-sm">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <div className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-blue-200">Quote Workspace</div>
              <h2 className="text-3xl font-bold">{quote.company || 'Customer Quote'}</h2>
              <p className="mt-2 text-slate-300">{quote.name} · {quote.email} · {quote.phone || 'No phone'}</p>
              <div className="mt-4"><Badge tone={statusTone(quote.status)}>{quote.status}</Badge></div>
            </div>
            <div className="grid grid-cols-2 gap-3 text-right sm:grid-cols-4 lg:min-w-[560px]">
              <div className="rounded-2xl bg-white/10 p-4"><div className="text-xs text-slate-300">Sell Total</div><div className="mt-1 text-xl font-bold">{money(total)}</div></div>
              <div className="rounded-2xl bg-white/10 p-4"><div className="text-xs text-slate-300">Cost</div><div className="mt-1 text-xl font-bold">{money(totalCost)}</div></div>
              <div className="rounded-2xl bg-white/10 p-4"><div className="text-xs text-slate-300">Margin</div><div className="mt-1 text-xl font-bold text-green-300">{money(totalMargin)}</div></div>
              <div className="rounded-2xl bg-white/10 p-4"><div className="text-xs text-slate-300">Margin %</div><div className="mt-1 text-xl font-bold text-green-300">{marginPercent.toFixed(1)}%</div></div>
            </div>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
          <div className="space-y-6">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-bold text-slate-950">Customer Request</h2>
              <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-5 whitespace-pre-wrap text-sm leading-6 text-slate-700">{quote.details || 'No details provided.'}</div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
                <div><h2 className="text-xl font-bold text-slate-950">Line Items</h2><p className="mt-1 text-sm text-slate-600">Price requested quantities, assign suppliers, and track margin.</p></div>
                <div className="text-right"><div className="text-2xl font-bold text-slate-950">{money(total)}</div><div className="text-sm font-semibold text-green-700">Gross Margin: {money(totalMargin)}</div></div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="grid gap-3 md:grid-cols-6">
                  <select value={selectedProduct} onChange={(e) => handleProductChange(e.target.value)} className="rounded-xl border border-slate-300 bg-white p-3 text-sm md:col-span-2"><option value="">Select Catalog Product</option>{catalogProducts.map((product) => <option key={product.id} value={product.id}>{product.name} {product.sku ? `(${product.sku})` : ''}</option>)}</select>
                  <input value={customProductName} onChange={(e) => setCustomProductName(e.target.value)} className="rounded-xl border border-slate-300 bg-white p-3 text-sm md:col-span-2" placeholder="Or custom product name" />
                  <input type="number" value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} className="rounded-xl border border-slate-300 bg-white p-3 text-sm" placeholder="Qty" />
                  <select value={supplierName} onChange={(e) => setSupplierName(e.target.value)} className="rounded-xl border border-slate-300 bg-white p-3 text-sm"><option value="">Supplier</option>{suppliers.map((supplier) => <option key={supplier.id} value={supplier.name}>{supplier.name}</option>)}</select>
                </div>
                <div className="mt-3 grid gap-3 md:grid-cols-[1fr_1fr_auto]">
                  <input type="number" value={unitPrice} onChange={(e) => setUnitPrice(Number(e.target.value))} className="rounded-xl border border-slate-300 bg-white p-3 text-sm" placeholder="Sell price" />
                  <input type="number" value={unitCost} onChange={(e) => setUnitCost(Number(e.target.value))} className="rounded-xl border border-slate-300 bg-white p-3 text-sm" placeholder="Unit cost" />
                  <button type="button" onClick={addItem} className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700">Add Item</button>
                </div>
              </div>

              <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200">
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead className="bg-slate-50 text-slate-600"><tr><th className="p-4 text-left">Product</th><th className="p-4 text-left">Supplier</th><th className="p-4 text-right">Qty</th><th className="p-4 text-right">Sell</th><th className="p-4 text-right">Cost</th><th className="p-4 text-right">Margin</th><th className="p-4 text-right">Total</th></tr></thead>
                    <tbody>
                      {items.length === 0 && <tr><td colSpan="7" className="p-8 text-center text-slate-500">No quote items yet.</td></tr>}
                      {items.map((item) => {
                        const lineCost = Number(item.quantity || 0) * Number(item.unit_cost || 0)
                        const lineMargin = Number(item.total_price || 0) - lineCost
                        return <tr key={item.id} className="border-t border-slate-200"><td className="p-4 font-semibold text-slate-950">{item.product_name}</td><td className="p-4">{item.supplier_name || '-'}</td><td className="p-4 text-right">{item.quantity}</td><td className="p-4 text-right">{money(item.unit_price)}</td><td className="p-4 text-right">{money(item.unit_cost)}</td><td className="p-4 text-right font-bold text-green-700">{money(lineMargin)}</td><td className="p-4 text-right font-bold">{money(item.total_price)}</td></tr>
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          <aside className="space-y-6">
            <div className="sticky top-24 space-y-6">
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="text-xl font-bold text-slate-950">Workflow Actions</h2>
                <select value={quote.status} onChange={(e) => updateStatus(e.target.value)} className="mt-5 w-full rounded-xl border border-slate-300 bg-white p-3 text-sm"><option value="pending">Pending</option><option value="quoted">Quoted</option><option value="accepted">Accepted</option><option value="won">Won</option><option value="lost">Lost</option></select>
                <div className="mt-4 space-y-3"><a href={`/api/quotes/${id}/pdf`} target="_blank" className="block rounded-xl bg-green-600 px-5 py-3 text-center text-sm font-semibold text-white hover:bg-green-700">Generate PDF</a><button type="button" onClick={sendQuote} className="w-full rounded-xl bg-purple-600 px-5 py-3 text-sm font-semibold text-white hover:bg-purple-700">Send Quote</button></div>
              </div>
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="text-xl font-bold text-slate-950">Internal Notes</h2>
                <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows="8" className="mt-4 w-full rounded-xl border border-slate-300 p-3 text-sm" placeholder="Pricing notes, vendor quotes, lead time, follow-up reminders..." />
                <button type="button" onClick={saveNotes} className="mt-3 w-full rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700">Save Notes</button>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </AdminShell>
  )
}
