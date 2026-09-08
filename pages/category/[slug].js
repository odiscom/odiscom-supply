import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import Header from '../../components/Header'
import Footer from '../../components/Footer'
import { supabase } from '../../lib/supabase'

function money(value) {
  if (value === null || value === undefined || value === '' || !Number.isFinite(Number(value))) return 'Not priced'
  return `$${Number(value || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export default function CategoryPage() {
  const router = useRouter()
  const { slug } = router.query
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!slug) return

    async function loadCategory() {
      const decoded = decodeURIComponent(slug)
      const { data } = await supabase
        .from('products')
        .select('*')
        .eq('status', 'active')
        .eq('category', decoded)
        .order('name', { ascending: true })

      setProducts(data || [])
      setLoading(false)
    }

    loadCategory()
  }, [slug])

  const categoryName = slug ? decodeURIComponent(slug) : 'Category'

  return (
    <>
      <Header />
      <main className="bg-gray-50 min-h-screen">
        <section className="bg-slate-900 text-white">
          <div className="max-w-7xl mx-auto px-6 py-14">
            <Link href="/shop" className="text-blue-300 text-sm font-semibold">Shop /</Link>
            <h1 className="text-4xl font-bold mt-3">{categoryName}</h1>
            <p className="text-slate-200 max-w-3xl mt-4">Active Odiscom Supply catalog items in this category.</p>
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-6 py-10">
          {loading ? (
            <div className="bg-white rounded-xl shadow p-8 text-gray-600">Loading category...</div>
          ) : products.length === 0 ? (
            <div className="bg-white rounded-xl shadow p-8 text-gray-600">No active products found in this category.</div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <Link key={product.id} href={`/product/${product.slug || product.id}`}>
                  <article className="bg-white border rounded-xl shadow-sm hover:shadow-md transition overflow-hidden h-full">
                    <div className="bg-slate-100 h-36 flex items-center justify-center">
                      {product.image_url ? <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" /> : <span className="text-slate-400 font-semibold">Odiscom Supply</span>}
                    </div>
                    <div className="p-6">
                      <h3 className="text-xl font-bold mb-3">{product.name}</h3>
                      <p className="text-gray-600 text-sm mb-5">{product.description || 'Request quote for pricing and availability.'}</p>
                      <div className="border-t pt-4 flex items-center justify-between text-sm">
                        <span className="font-mono text-gray-500">{product.sku || 'No SKU'}</span>
                        <span className="font-semibold text-slate-900">Request Quote</span>
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
