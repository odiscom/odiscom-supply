import { useEffect, useState } from 'react'
import Link from 'next/link'
import SupplierShell from '../../components/SupplierShell'
import { supabase } from '../../lib/supabase'

function money(value) {
  return `$${Number(value || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export default function SupplierDashboard() {
  const [user, setUser] = useState(null)
  const [supplier, setSupplier] = useState(null)
  const [products, setProducts] = useState([])
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => { loadSupplierData() }, [])

  async function loadSupplierData() {
    const { data: sessionData } = await supabase.auth.getSession()
    const sessionUser = sessionData.session?.user
    setUser(sessionUser || null)
    if (!sessionUser?.email) {
      setLoading(false)
      return
    }

    const { data: supplierData, error: supplierError } = await supabase
      .from('suppliers')
      .select('*')
      .eq('email', sessionUser.email)
      .maybeSingle()

    if (supplierError) setMessage(supplierError.message)
    setSupplier(supplierData || null)

    if (supplierData?.name) {
      const { data: productData } = await supabase
        .from('products')
        .select('*')
        .eq('supplier_name', supplierData.name)
        .order('created_at', { ascending: false })
      setProducts(productData || [])
    }

    setLoading(false)
  }

  const activeProducts = products.filter((p) => p.status === 'active').length
  const draftProducts = products.filter((p) => p.status === 'draft' || p.status === 'supplier_review').length
  const avgCost = products.length ? products.reduce((sum, p) => sum + Number(p.cost || 0), 0) / products.length : 0

  return (
    <SupplierShell title="Supplier Dashboard">
      {loading ? (
        <div className="rounded-3xl bg-white p-10 text-slate-600 shadow-sm">Loading supplier dashboard...</div>
      ) : (
        <div className="space-y-6">
          {message && <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800">{message}</div>}

          <div className="rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 p-8 text-white shadow-sm">
            <div className="max-w-3xl">
              <div className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-blue-200">Supplier Operations</div>
              <h2 className="text-3xl font-bold">Keep pricing, lead time, and availability current for Odiscom Supply.</h2>
              <p className="mt-3 text-sm leading-6 text-slate-300">Your portal is used to maintain your supplier profile and submit product/cost updates for Odiscom review.</p>
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/supplier/products" className="rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-700">Manage Products</Link>
              <Link href="/supplier/profile" className="rounded-xl bg-white px-4 py-3 text-sm font-semibold text-slate-950 hover:bg-slate-100">Update Profile</Link>
            </div>
          </div>

          {!supplier && (
            <div className="rounded-3xl border border-amber-200 bg-amber-50 p-6 text-amber-900">
              <h3 className="text-xl font-bold">Supplier profile not linked yet</h3>
              <p className="mt-2 text-sm leading-6">No supplier record was found for {user?.email}. Go to Profile and create your supplier profile, or ask Odiscom Supply to link your email to an existing supplier record.</p>
              <Link href="/supplier/profile" className="mt-4 inline-block rounded-xl bg-amber-600 px-4 py-3 text-sm font-semibold text-white">Create Supplier Profile</Link>
            </div>
          )}

          <div className="grid gap-4 md:grid-cols-4">
            <div className="rounded-3xl border bg-white p-6 shadow-sm"><div className="text-sm text-slate-500">Supplier</div><div className="mt-2 text-xl font-bold text-slate-950">{supplier?.name || 'Not linked'}</div></div>
            <div className="rounded-3xl border bg-white p-6 shadow-sm"><div className="text-sm text-slate-500">Products</div><div className="mt-2 text-3xl font-bold text-slate-950">{products.length}</div></div>
            <div className="rounded-3xl border bg-white p-6 shadow-sm"><div className="text-sm text-slate-500">Active</div><div className="mt-2 text-3xl font-bold text-green-700">{activeProducts}</div></div>
            <div className="rounded-3xl border bg-white p-6 shadow-sm"><div className="text-sm text-slate-500">Avg Cost</div><div className="mt-2 text-3xl font-bold text-blue-700">{money(avgCost)}</div></div>
          </div>

          <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
              <div><h3 className="font-bold text-slate-950">Recent Product Updates</h3><p className="text-sm text-slate-500">Products associated with your supplier record.</p></div>
              <Link href="/supplier/products" className="text-sm font-semibold text-blue-700">View all</Link>
            </div>
            <div className="divide-y divide-slate-200">
              {products.length === 0 && <div className="p-8 text-slate-500">No supplier products yet.</div>}
              {products.slice(0, 8).map((product) => (
                <div key={product.id} className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div><div className="font-semibold text-slate-950">{product.name}</div><div className="mt-1 text-xs text-slate-500">{product.sku || 'No SKU'} · {product.category || 'No category'} · {product.lead_time || 'Lead time TBD'}</div></div>
                    <div className="text-right"><div className="font-bold text-slate-950">Cost {money(product.cost)}</div><div className="mt-1 text-xs text-slate-500">{product.status || 'active'}</div></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </SupplierShell>
  )
}
