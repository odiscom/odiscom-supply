import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import AdminShell from '../../components/AdminShell'
import { supabase } from '../../lib/supabase'

function money(value) {
  return `$${Number(value || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

function slugify(value) {
  return String(value || '').toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
}

function Badge({ children, tone = 'blue' }) {
  const tones = {
    blue: 'bg-blue-50 text-blue-700',
    green: 'bg-green-50 text-green-700',
    amber: 'bg-amber-50 text-amber-700',
    slate: 'bg-slate-100 text-slate-700',
  }
  return <span className={`rounded-full px-3 py-1 text-xs font-semibold ${tones[tone] || tones.blue}`}>{children}</span>
}

const emptyProduct = {
  name: '', sku: '', slug: '', category: '', manufacturer: '', description: '', price: 0, cost: 0, unit: 'each', lead_time: '', status: 'active', image_url: '', spec_sheet_url: '',
}

export default function Products() {
  const [products, setProducts] = useState([])
  const [form, setForm] = useState(emptyProduct)
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  useEffect(() => { loadProducts() }, [])

  async function loadProducts() {
    const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: false })
    if (error) setMessage(error.message)
    setProducts(data || [])
    setLoading(false)
  }

  function updateField(field, value) {
    const nextForm = { ...form, [field]: value }
    if (field === 'name' && !form.slug) nextForm.slug = slugify(value)
    if (field === 'sku' && !form.slug && !form.name) nextForm.slug = slugify(value)
    if (field === 'slug') nextForm.slug = slugify(value)
    setForm(nextForm)
  }

  async function saveProduct(e) {
    e.preventDefault()
    setMessage('')
    const productSlug = slugify(form.slug || form.name || form.sku)
    if (!productSlug) return setMessage('Product needs a valid URL slug.')
    const { error } = await supabase.from('products').insert([{ ...form, slug: productSlug, price: Number(form.price || 0), cost: Number(form.cost || 0) }])
    if (error) return setMessage(error.message)
    setForm(emptyProduct)
    setMessage('Product added.')
    loadProducts()
  }

  async function updateStatus(product, status) {
    const { error } = await supabase.from('products').update({ status }).eq('id', product.id)
    if (error) return setMessage(error.message)
    setMessage(`Product marked ${status}.`)
    loadProducts()
  }

  async function fixSlug(product) {
    const cleanSlug = slugify(product.slug || product.name || product.sku || product.id)
    const { error } = await supabase.from('products').update({ slug: cleanSlug }).eq('id', product.id)
    if (error) return setMessage(error.message)
    setMessage(`Slug cleaned: ${cleanSlug}`)
    loadProducts()
  }

  async function deleteProduct(product) {
    if (!confirm(`Delete product "${product.name}"?`)) return
    const { error } = await supabase.from('products').delete().eq('id', product.id)
    if (error) return setMessage(error.message)
    setMessage('Product deleted.')
    loadProducts()
  }

  const filteredProducts = useMemo(() => {
    const query = search.toLowerCase().trim()
    return products.filter((product) => {
      const matchesStatus = statusFilter === 'all' || product.status === statusFilter
      const matchesSearch = !query || [product.name, product.sku, product.slug, product.category, product.manufacturer].join(' ').toLowerCase().includes(query)
      return matchesStatus && matchesSearch
    })
  }, [products, search, statusFilter])

  const activeCount = products.filter((p) => p.status === 'active').length
  const draftCount = products.filter((p) => p.status === 'draft').length
  const avgMargin = products.length ? products.reduce((sum, p) => sum + (Number(p.price || 0) - Number(p.cost || 0)), 0) / products.length : 0

  return (
    <AdminShell title="Products">
      <div className="space-y-6">
        <div className="rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 p-8 text-white shadow-sm">
          <div className="max-w-3xl"><div className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-blue-200">Catalog Management</div><h2 className="text-3xl font-bold">Build the searchable telecom supply catalog for quotes and sourcing.</h2><p className="mt-3 text-sm leading-6 text-slate-300">Create products, clean slugs, track sell/cost, publish active products, and keep public pages request-quote focused.</p></div>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <div className="rounded-3xl border bg-white p-6 shadow-sm"><div className="text-sm text-slate-500">Products</div><div className="mt-2 text-3xl font-bold">{products.length}</div></div>
          <div className="rounded-3xl border bg-white p-6 shadow-sm"><div className="text-sm text-slate-500">Active</div><div className="mt-2 text-3xl font-bold text-green-700">{activeCount}</div></div>
          <div className="rounded-3xl border bg-white p-6 shadow-sm"><div className="text-sm text-slate-500">Draft</div><div className="mt-2 text-3xl font-bold text-amber-700">{draftCount}</div></div>
          <div className="rounded-3xl border bg-white p-6 shadow-sm"><div className="text-sm text-slate-500">Avg Unit Margin</div><div className="mt-2 text-3xl font-bold text-green-700">{money(avgMargin)}</div></div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[420px_1fr]">
          <form onSubmit={saveProduct} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
            <div><h2 className="text-xl font-bold text-slate-950">Add Product</h2><p className="mt-1 text-sm text-slate-600">Create SKUs for fiber, connectors, tools, splicers, trailers, tower materials, and infrastructure supply.</p></div>
            {message && <div className="rounded-xl border border-blue-200 bg-blue-50 p-3 text-sm text-blue-800">{message}</div>}
            <input required value={form.name} onChange={(e) => updateField('name', e.target.value)} placeholder="Product name" className="w-full rounded-xl border p-3" />
            <div className="grid grid-cols-2 gap-3"><input value={form.sku} onChange={(e) => updateField('sku', e.target.value)} placeholder="SKU" className="w-full rounded-xl border p-3" /><input value={form.slug} onChange={(e) => updateField('slug', e.target.value)} placeholder="clean-url-slug" className="w-full rounded-xl border p-3" /></div>
            <div className="grid grid-cols-2 gap-3"><input value={form.category} onChange={(e) => updateField('category', e.target.value)} placeholder="Category" className="w-full rounded-xl border p-3" /><input value={form.manufacturer} onChange={(e) => updateField('manufacturer', e.target.value)} placeholder="Manufacturer" className="w-full rounded-xl border p-3" /></div>
            <textarea value={form.description} onChange={(e) => updateField('description', e.target.value)} placeholder="Description" rows="4" className="w-full rounded-xl border p-3" />
            <div className="grid grid-cols-2 gap-3"><input type="number" value={form.price} onChange={(e) => updateField('price', e.target.value)} placeholder="Internal sell price" className="w-full rounded-xl border p-3" /><input type="number" value={form.cost} onChange={(e) => updateField('cost', e.target.value)} placeholder="Unit cost" className="w-full rounded-xl border p-3" /></div>
            <div className="grid grid-cols-2 gap-3"><input value={form.unit} onChange={(e) => updateField('unit', e.target.value)} placeholder="Unit" className="w-full rounded-xl border p-3" /><input value={form.lead_time} onChange={(e) => updateField('lead_time', e.target.value)} placeholder="Lead time" className="w-full rounded-xl border p-3" /></div>
            <input value={form.image_url} onChange={(e) => updateField('image_url', e.target.value)} placeholder="Image URL" className="w-full rounded-xl border p-3" />
            <input value={form.spec_sheet_url} onChange={(e) => updateField('spec_sheet_url', e.target.value)} placeholder="Spec sheet URL" className="w-full rounded-xl border p-3" />
            <button className="w-full rounded-xl bg-blue-600 py-3 font-semibold text-white hover:bg-blue-700">Add Product</button>
          </form>

          <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 p-5"><div className="grid gap-3 md:grid-cols-[1fr_200px]"><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search products, SKUs, slugs, categories..." className="rounded-2xl border bg-slate-50 px-4 py-3 text-sm" /><select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="rounded-2xl border bg-slate-50 px-4 py-3 text-sm"><option value="all">All statuses</option><option value="active">Active</option><option value="draft">Draft</option></select></div></div>
            {loading ? <div className="p-10 text-slate-600">Loading products...</div> : <div className="overflow-x-auto"><table className="min-w-full text-sm"><thead className="bg-slate-50 text-slate-600"><tr><th className="px-5 py-4 text-left">Product</th><th className="px-5 py-4 text-left">Category</th><th className="px-5 py-4 text-right">Sell</th><th className="px-5 py-4 text-right">Cost</th><th className="px-5 py-4 text-right">Margin</th><th className="px-5 py-4 text-right">Actions</th></tr></thead><tbody>{filteredProducts.length === 0 && <tr><td colSpan="6" className="p-10 text-center text-slate-500">No products found.</td></tr>}{filteredProducts.map((product) => { const margin = Number(product.price || 0) - Number(product.cost || 0); const badSlug = /[^a-z0-9-]/.test(product.slug || ''); return <tr key={product.id} className="border-t align-top hover:bg-slate-50"><td className="px-5 py-4"><div className="font-semibold text-slate-950">{product.name}</div><div className="mt-1 text-xs text-slate-500">{product.sku || 'No SKU'} · {product.manufacturer || 'No manufacturer'} · {product.unit || 'each'}</div><div className={`mt-1 text-xs ${badSlug ? 'text-red-600' : 'text-blue-700'}`}>/{product.slug || product.id}</div></td><td className="px-5 py-4"><div>{product.category || '-'}</div><div className="mt-2"><Badge tone={product.status === 'active' ? 'green' : 'amber'}>{product.status || 'active'}</Badge></div></td><td className="px-5 py-4 text-right font-semibold">{money(product.price)}</td><td className="px-5 py-4 text-right">{money(product.cost)}</td><td className="px-5 py-4 text-right font-bold text-green-700">{money(margin)}</td><td className="px-5 py-4 text-right"><div className="flex flex-col gap-2"><Link href={`/product/${encodeURIComponent(product.slug || product.id)}`} className="rounded-lg bg-blue-600 px-3 py-2 text-center text-xs font-semibold text-white">View</Link><button type="button" onClick={() => updateStatus(product, product.status === 'active' ? 'draft' : 'active')} className="rounded-lg border px-3 py-2 text-xs font-semibold">{product.status === 'active' ? 'Draft' : 'Publish'}</button>{badSlug && <button type="button" onClick={() => fixSlug(product)} className="rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-700">Fix Slug</button>}<button type="button" onClick={() => deleteProduct(product)} className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700">Delete</button></div></td></tr> })}</tbody></table></div>}
          </div>
        </div>
      </div>
    </AdminShell>
  )
}
