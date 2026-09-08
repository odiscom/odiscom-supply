import { useEffect, useMemo, useState } from 'react'
import AdminShell from '../../components/AdminShell'
import { supabase } from '../../lib/supabase'

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

export default function SupplierReview() {
  const [products, setProducts] = useState([])
  const [suppliers, setSuppliers] = useState([])
  const [search, setSearch] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => { loadData() }, [])

  async function loadData() {
    const [{ data: productData, error: productError }, { data: supplierData, error: supplierError }] = await Promise.all([
      supabase.from('products').select('*').in('status', ['supplier_review', 'draft']).order('updated_at', { ascending: false }),
      supabase.from('suppliers').select('*').order('created_at', { ascending: false }),
    ])
    if (productError || supplierError) setMessage(productError?.message || supplierError?.message)
    setProducts(productData || [])
    setSuppliers(supplierData || [])
    setLoading(false)
  }

  async function approveProduct(product) {
    const { error } = await supabase.from('products').update({ status: 'active', supplier_status: 'approved' }).eq('id', product.id)
    if (error) return setMessage(error.message)
    setMessage(`${product.name} approved and published.`)
    loadData()
  }

  async function returnToDraft(product) {
    const { error } = await supabase.from('products').update({ status: 'draft', supplier_status: 'changes_requested' }).eq('id', product.id)
    if (error) return setMessage(error.message)
    setMessage(`${product.name} returned to draft.`)
    loadData()
  }

  async function approveSupplier(supplier) {
    const { error } = await supabase.from('suppliers').update({ approval_status: 'approved' }).eq('id', supplier.id)
    if (error) return setMessage(error.message)
    setMessage(`${supplier.name} approved.`)
    loadData()
  }

  const filteredProducts = useMemo(() => {
    const query = search.toLowerCase().trim()
    return products.filter((product) => !query || [product.name, product.sku, product.category, product.supplier_name, product.manufacturer].join(' ').toLowerCase().includes(query))
  }, [products, search])

  const pendingSuppliers = suppliers.filter((supplier) => supplier.approval_status !== 'approved')
  const pendingProducts = products.filter((product) => product.status === 'supplier_review')

  return (
    <AdminShell title="Supplier Review">
      <div className="space-y-6">
        <div className="rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 p-8 text-white shadow-sm">
          <div className="max-w-3xl">
            <div className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-blue-200">Supplier Approval Workflow</div>
            <h2 className="text-3xl font-bold">Review supplier-submitted products, pricing, lead times, and supplier profiles.</h2>
            <p className="mt-3 text-sm leading-6 text-slate-300">Approve supplier products into the live catalog only after Odiscom validates cost, availability, product data, and supplier relationship.</p>
          </div>
        </div>

        {message && <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800">{message}</div>}

        <div className="grid gap-4 md:grid-cols-4">
          <div className="rounded-3xl border bg-white p-6 shadow-sm"><div className="text-sm text-slate-500">Pending Products</div><div className="mt-2 text-3xl font-bold text-amber-700">{pendingProducts.length}</div></div>
          <div className="rounded-3xl border bg-white p-6 shadow-sm"><div className="text-sm text-slate-500">Pending Suppliers</div><div className="mt-2 text-3xl font-bold text-blue-700">{pendingSuppliers.length}</div></div>
          <div className="rounded-3xl border bg-white p-6 shadow-sm"><div className="text-sm text-slate-500">Total Review Queue</div><div className="mt-2 text-3xl font-bold text-slate-950">{products.length}</div></div>
          <div className="rounded-3xl border bg-white p-6 shadow-sm"><div className="text-sm text-slate-500">Supplier Directory</div><div className="mt-2 text-3xl font-bold text-green-700">{suppliers.length}</div></div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search supplier products, SKU, category, supplier..." className="w-full rounded-2xl border bg-slate-50 px-4 py-3 text-sm" />
        </div>

        <div className="grid gap-6 xl:grid-cols-[1fr_420px]">
          <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 px-6 py-5"><h3 className="text-xl font-bold text-slate-950">Supplier Product Review</h3><p className="mt-1 text-sm text-slate-600">Approve products into the catalog or return them to draft.</p></div>
            {loading ? <div className="p-10 text-slate-600">Loading review queue...</div> : <div className="overflow-x-auto"><table className="min-w-full text-sm"><thead className="bg-slate-50 text-slate-600"><tr><th className="px-5 py-4 text-left">Product</th><th className="px-5 py-4 text-left">Supplier</th><th className="px-5 py-4 text-right">Cost</th><th className="px-5 py-4 text-left">Lead Time</th><th className="px-5 py-4 text-left">Status</th><th className="px-5 py-4 text-right">Actions</th></tr></thead><tbody>{filteredProducts.length === 0 && <tr><td colSpan="6" className="p-10 text-center text-slate-500">No supplier products pending review.</td></tr>}{filteredProducts.map((product) => <tr key={product.id} className="border-t align-top hover:bg-slate-50"><td className="px-5 py-4"><div className="font-semibold text-slate-950">{product.name}</div><div className="mt-1 text-xs text-slate-500">{product.sku || 'No SKU'} · {product.category || 'No category'}</div><div className="mt-1 text-xs text-blue-700">/{product.slug || product.id}</div></td><td className="px-5 py-4">{product.supplier_name || product.manufacturer || '-'}</td><td className="px-5 py-4 text-right font-semibold">{money(product.cost)}</td><td className="px-5 py-4">{product.lead_time || '-'}</td><td className="px-5 py-4"><Badge tone={product.status === 'supplier_review' ? 'amber' : 'slate'}>{product.status}</Badge></td><td className="px-5 py-4 text-right"><div className="flex flex-col gap-2"><button onClick={() => approveProduct(product)} className="rounded-lg bg-green-600 px-3 py-2 text-xs font-semibold text-white">Approve</button><button onClick={() => returnToDraft(product)} className="rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-700">Return Draft</button></div></td></tr>)}</tbody></table></div>}
          </div>

          <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 px-6 py-5"><h3 className="text-xl font-bold text-slate-950">Supplier Profiles</h3><p className="mt-1 text-sm text-slate-600">Approve supplier records and confirm contact information.</p></div>
            <div className="divide-y divide-slate-200">
              {suppliers.length === 0 && <div className="p-8 text-slate-500">No suppliers found.</div>}
              {suppliers.map((supplier) => <div key={supplier.id} className="p-5"><div className="flex items-start justify-between gap-4"><div><div className="font-semibold text-slate-950">{supplier.name}</div><div className="mt-1 text-xs text-slate-500">{supplier.email || 'No email'} · {supplier.phone || 'No phone'}</div><div className="mt-2 text-xs text-slate-500">{supplier.product_categories || 'No categories listed'}</div></div><Badge tone={supplier.approval_status === 'approved' ? 'green' : 'amber'}>{supplier.approval_status || 'pending'}</Badge></div>{supplier.approval_status !== 'approved' && <button onClick={() => approveSupplier(supplier)} className="mt-4 rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white">Approve Supplier</button>}</div>)}
            </div>
          </div>
        </div>
      </div>
    </AdminShell>
  )
}
