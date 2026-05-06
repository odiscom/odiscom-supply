import { useEffect, useState } from 'react'
import Link from 'next/link'
import AdminShell from '../../components/AdminShell'
import { supabase } from '../../lib/supabase'

function money(value) {
  return `$${Number(value || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

function slugify(value) {
  return String(value || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

const emptyProduct = {
  name: '',
  sku: '',
  slug: '',
  category: '',
  manufacturer: '',
  description: '',
  price: 0,
  cost: 0,
  unit: 'each',
  lead_time: '',
  status: 'active',
  image_url: '',
  spec_sheet_url: '',
}

export default function Products() {
  const [products, setProducts] = useState([])
  const [form, setForm] = useState(emptyProduct)
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')

  useEffect(() => {
    loadProducts()
  }, [])

  async function loadProducts() {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) setMessage(error.message)
    setProducts(data || [])
    setLoading(false)
  }

  function updateField(field, value) {
    const nextForm = { ...form, [field]: value }
    if (field === 'name' && !form.slug) nextForm.slug = slugify(value)
    if (field === 'sku' && !form.slug && !form.name) nextForm.slug = slugify(value)
    setForm(nextForm)
  }

  async function saveProduct(e) {
    e.preventDefault()
    setMessage('')

    const productSlug = form.slug || slugify(form.name || form.sku)

    const { error } = await supabase.from('products').insert([
      {
        ...form,
        slug: productSlug,
        price: Number(form.price || 0),
        cost: Number(form.cost || 0),
      },
    ])

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

  return (
    <AdminShell title="Products">
      <div className="grid lg:grid-cols-3 gap-6">
        <form onSubmit={saveProduct} className="bg-white rounded-xl shadow border p-6 space-y-4 lg:col-span-1">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Add Product</h2>
            <p className="text-sm text-gray-500 mt-1">Create SKUs for fiber, connectors, tools, splicers, trailers, and infrastructure materials.</p>
          </div>

          {message && <div className="bg-blue-50 border border-blue-200 text-blue-800 rounded-lg p-3 text-sm">{message}</div>}

          <input required value={form.name} onChange={(e) => updateField('name', e.target.value)} placeholder="Product name" className="w-full border rounded-lg p-3" />
          <input value={form.sku} onChange={(e) => updateField('sku', e.target.value)} placeholder="SKU" className="w-full border rounded-lg p-3" />
          <input value={form.slug} onChange={(e) => updateField('slug', slugify(e.target.value))} placeholder="URL slug, e.g. 144ct-adss-fiber" className="w-full border rounded-lg p-3" />
          <input value={form.category} onChange={(e) => updateField('category', e.target.value)} placeholder="Category" className="w-full border rounded-lg p-3" />
          <input value={form.manufacturer} onChange={(e) => updateField('manufacturer', e.target.value)} placeholder="Manufacturer" className="w-full border rounded-lg p-3" />
          <textarea value={form.description} onChange={(e) => updateField('description', e.target.value)} placeholder="Description" rows="3" className="w-full border rounded-lg p-3" />
          <div className="grid grid-cols-2 gap-3">
            <input type="number" value={form.price} onChange={(e) => updateField('price', e.target.value)} placeholder="Sell price" className="w-full border rounded-lg p-3" />
            <input type="number" value={form.cost} onChange={(e) => updateField('cost', e.target.value)} placeholder="Cost" className="w-full border rounded-lg p-3" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <input value={form.unit} onChange={(e) => updateField('unit', e.target.value)} placeholder="Unit" className="w-full border rounded-lg p-3" />
            <input value={form.lead_time} onChange={(e) => updateField('lead_time', e.target.value)} placeholder="Lead time" className="w-full border rounded-lg p-3" />
          </div>
          <input value={form.image_url} onChange={(e) => updateField('image_url', e.target.value)} placeholder="Image URL" className="w-full border rounded-lg p-3" />
          <input value={form.spec_sheet_url} onChange={(e) => updateField('spec_sheet_url', e.target.value)} placeholder="Spec sheet URL" className="w-full border rounded-lg p-3" />
          <button className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-lg py-3 font-semibold">Add Product</button>
        </form>

        <div className="lg:col-span-2 bg-white rounded-xl shadow border overflow-hidden">
          <div className="px-6 py-4 border-b">
            <h2 className="font-bold text-slate-900">Product Catalog</h2>
            <p className="text-sm text-gray-500">Internal product database for quoting and the public customer catalog.</p>
          </div>

          {loading ? (
            <div className="p-8 text-gray-600">Loading products...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-100 text-gray-700">
                  <tr>
                    <th className="text-left px-4 py-3">Product</th>
                    <th className="text-left px-4 py-3">SKU</th>
                    <th className="text-left px-4 py-3">Category</th>
                    <th className="text-right px-4 py-3">Price</th>
                    <th className="text-right px-4 py-3">Margin</th>
                    <th className="text-right px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.length === 0 && <tr><td colSpan="6" className="text-center p-8 text-gray-500">No products yet.</td></tr>}
                  {products.map((product) => {
                    const margin = Number(product.price || 0) - Number(product.cost || 0)
                    return (
                      <tr key={product.id} className="border-t hover:bg-gray-50 align-top">
                        <td className="px-4 py-4">
                          <div className="font-semibold text-slate-900">{product.name}</div>
                          <div className="text-xs text-gray-500">{product.manufacturer || 'No manufacturer'} · {product.unit || 'each'} · {product.status || 'active'}</div>
                          <div className="text-xs text-blue-700 mt-1">/{product.slug || product.id}</div>
                        </td>
                        <td className="px-4 py-4 font-mono text-xs">{product.sku || '-'}</td>
                        <td className="px-4 py-4">{product.category || '-'}</td>
                        <td className="px-4 py-4 text-right font-semibold">{money(product.price)}</td>
                        <td className="px-4 py-4 text-right font-semibold text-green-700">{money(margin)}</td>
                        <td className="px-4 py-4 text-right space-y-2">
                          <Link href={`/product/${product.slug || product.id}`} className="block text-blue-600 font-semibold">View</Link>
                          <button type="button" onClick={() => updateStatus(product, product.status === 'active' ? 'draft' : 'active')} className="text-xs text-gray-600 underline">
                            {product.status === 'active' ? 'Make Draft' : 'Publish'}
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AdminShell>
  )
}
