import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { supabase } from '../lib/supabase'

function productHref(product) {
  return `/product/${encodeURIComponent(product.slug || product.id)}`
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

  const categories = useMemo(() => [...new Set(products.map((product) => product.category).filter(Boolean))], [products])

  const filteredProducts = products.filter((product) => {
    const query = search.toLowerCase()
    const matchesSearch = !query || [product.name, product.sku, product.manufacturer, product.description].join(' ').toLowerCase().includes(query)
    const matchesCategory = category === 'all' || product.category === category
    return matchesSearch && matchesCategory
  })

  return (
    <>
      <Header />
      <main className="min-h-screen bg-slate-50">
        <section className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 text-white">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute left-0 top-0 h-80 w-80 rounded-full bg-blue-500 blur-3xl" />
            <div className="absolute right-0 bottom-0 h-80 w-80 rounded-full bg-cyan-400 blur-3xl" />
          </div>
          <div className="relative mx-auto max-w-7xl px-6 py-16">
            <div className="max-w-4xl">
              <div className="mb-4 inline-flex rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-blue-100">Live Supply Catalog</div>
              <h1 className="text-4xl font-bold leading-tight md:text-5xl">Browse telecom infrastructure materials and request project pricing</h1>
              <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-200">Search active products, SKUs, manufacturers, and categories. Odiscom Supply does not show public pricing online; final pricing is quoted by project, quantity, lead time, freight, and availability.</p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link href="/quote" className="rounded-xl bg-blue-600 px-6 py-3 text-center font-semibold text-white hover:bg-blue-700">Start Quote Request</Link>
                <Link href="/material-upload" className="rounded-xl bg-white px-6 py-3 text-center font-semibold text-slate-950 hover:bg-slate-100">Upload BOM</Link>
              </div>
            </div>
          </div>
        </section>

        <section className="-mt-8 relative z-10 mx-auto max-w-7xl px-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-lg">
            <div className="grid gap-3 md:grid-cols-[1fr_280px]">
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search products, SKUs, manufacturers, fiber, conduit, mounts, grounding..." className="rounded-2xl border border-slate-300 bg-slate-50 px-4 py-4 text-sm outline-none transition focus:border-blue-500 focus:bg-white" />
              <select value={category} onChange={(e) => setCategory(e.target.value)} className="rounded-2xl border border-slate-300 bg-slate-50 px-4 py-4 text-sm outline-none transition focus:border-blue-500 focus:bg-white">
                <option value="all">All categories</option>
                {categories.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <button type="button" onClick={() => setCategory('all')} className={`rounded-full px-4 py-2 text-xs font-semibold ${category === 'all' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700'}`}>All</button>
              {categories.slice(0, 10).map((cat) => <button type="button" key={cat} onClick={() => setCategory(cat)} className={`rounded-full px-4 py-2 text-xs font-semibold ${category === cat ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700'}`}>{cat}</button>)}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-6 py-10">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-950">Catalog Products</h2>
              <p className="text-sm text-slate-600">{filteredProducts.length} active products shown</p>
            </div>
          </div>

          {loading ? (
            <div className="rounded-3xl bg-white p-10 text-slate-600 shadow-sm">Loading catalog...</div>
          ) : filteredProducts.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-600">No products found. Add products in the admin dashboard or adjust your filters.</div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredProducts.map((product) => (
                <Link key={product.id} href={productHref(product)}>
                  <article className="group h-full overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl">
                    <div className="relative h-44 overflow-hidden bg-gradient-to-br from-slate-100 to-blue-50">
                      {product.image_url ? <img src={product.image_url} alt={product.name} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" /> : <div className="flex h-full items-center justify-center text-lg font-bold text-slate-300">Odiscom Supply</div>}
                      <div className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-blue-700 shadow-sm">{product.category || 'Telecom Supply'}</div>
                    </div>
                    <div className="p-6">
                      <div className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">{product.manufacturer || 'Project Sourcing'}</div>
                      <h2 className="text-xl font-bold text-slate-950">{product.name}</h2>
                      <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-600">{product.description || 'Request pricing, lead time, quantity breaks, and availability from Odiscom Supply.'}</p>
                      <div className="mt-5 flex items-center justify-between border-t border-slate-200 pt-4 text-sm">
                        <span className="font-mono text-xs text-slate-500">{product.sku || 'No SKU'}</span>
                        <span className="font-bold text-slate-950">Request Quote</span>
                      </div>
                      <div className="mt-4 rounded-xl bg-slate-950 px-4 py-3 text-center text-sm font-semibold text-white transition group-hover:bg-blue-600">View Product</div>
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
