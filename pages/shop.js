import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { supabase } from '../lib/supabase'

function money(value) {
  return `$${Number(value || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export default function Shop() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('all')

  useEffect(() => {
    async function loadProducts() {
      const { data } = await supabase
        .from('products')
        .select('*')
        .eq('status', 'active')
        .order('name', { ascending: true })

      setProducts(data || [])
      setLoading(false)
    }

    loadProducts()
  }, [])

  const categories = useMemo(() => {
    return [...new Set(products.map((product) => product.category).filter(Boolean))]
  }, [products])

  const filteredProducts = products.filter((product) => {
    const query = search.toLowerCase()
    const matchesSearch = !query || [product.name, product.sku, product.manufacturer, product.description].join(' ').toLowerCase().includes(query)
    const matchesCategory = category === 'all' || product.category === category
    return matchesSearch && matchesCategory
  })

  return (
    <>
      <Header />
      <main className="bg-gray-50 min-h-screen">
        <section className="bg-slate-900 text-white">
          <div className="max-w-7xl mx-auto px-6 py-16">
            <h1 className="text-4xl font-bold">Telecom Supply Catalog</h1>
            <p className="text-slate-200 mt-4 max-w-3xl">Browse Odiscom Supply products for fiber, wireless, splicing, OSP infrastructure, tools, trailers, and branded cable programs.</p>
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-6 py-10">
          <div className="bg-white border rounded-xl shadow p-4 mb-8 grid md:grid-cols-3 gap-3">
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search products, SKUs, manufacturers..." className="md:col-span-2 border rounded-lg p-3" />
            <select value={category} onChange={(e) => setCategory(e.target.value)} className="border rounded-lg p-3">
              <option value="all">All categories</option>
              {categories.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          </div>

          {loading ? (
            <div className="bg-white rounded-xl shadow p-8 text-gray-600">Loading catalog...</div>
          ) : filteredProducts.length === 0 ? (
            <div className="bg-white rounded-xl shadow p-8 text-gray-600">No products found. Add products in the admin dashboard.</div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((product) => (
                <Link key={product.id} href={`/product/${product.slug || product.id}`}>
                  <article className="bg-white border rounded-xl shadow-sm hover:shadow-md transition overflow-hidden h-full">
                    <div className="bg-slate-100 h-40 flex items-center justify-center">
                      {product.image_url ? <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" /> : <span className="text-slate-400 font-semibold">Odiscom Supply</span>}
                    </div>
                    <div className="p-6">
                      <div className="text-xs text-blue-700 font-semibold uppercase tracking-wide mb-2">{product.category || 'Telecom Supply'}</div>
                      <h2 className="text-xl font-bold text-slate-900 mb-2">{product.name}</h2>
                      <p className="text-sm text-gray-600 line-clamp-3 mb-4">{product.description || 'Request pricing, lead time, and availability from Odiscom Supply.'}</p>
                      <div className="border-t pt-4 flex justify-between text-sm">
                        <span className="font-mono text-gray-500">{product.sku || 'No SKU'}</span>
                        <span className="font-bold text-slate-900">{Number(product.price || 0) > 0 ? money(product.price) : 'Request Quote'}</span>
                      </div>
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          )}
        </section>
      </main>
      <Footer />
    </>
  )
}
