import { useEffect, useState } from 'react'
import Header from '../../components/Header'
import Footer from '../../components/Footer'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { supabase } from '../../lib/supabase'

function money(value) {
  return `$${Number(value || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export default function ProductPage() {
  const router = useRouter()
  const { slug } = router.query
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!slug) return

    async function loadProduct() {
      const { data } = await supabase
        .from('products')
        .select('*')
        .or(`slug.eq.${slug},id.eq.${slug}`)
        .single()

      setProduct(data)
      setLoading(false)
    }

    loadProduct()
  }, [slug])

  if (loading) {
    return (
      <>
        <Header />
        <main className="bg-gray-50 min-h-screen p-10 text-gray-600">Loading product...</main>
        <Footer />
      </>
    )
  }

  if (!product) {
    return (
      <>
        <Header />
        <main className="bg-gray-50 min-h-screen p-10 text-gray-600">Product not found.</main>
        <Footer />
      </>
    )
  }

  return (
    <>
      <Header />
      <main className="bg-gray-50 min-h-screen">
        <section className="bg-slate-900 text-white">
          <div className="max-w-7xl mx-auto px-6 py-14">
            <Link href="/shop" className="text-blue-300 text-sm font-semibold">Shop /</Link>
            <h1 className="text-4xl font-bold mt-3">{product.name}</h1>
            <p className="text-slate-200 max-w-3xl mt-4">{product.description || 'Request pricing, lead time, and availability from Odiscom Supply.'}</p>
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-6 py-10 grid lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white border rounded-xl shadow overflow-hidden">
              <div className="bg-slate-100 h-72 flex items-center justify-center">
                {product.image_url ? <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" /> : <span className="text-slate-400 font-semibold text-xl">Odiscom Supply</span>}
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold mb-4">Product Details</h2>
              <div className="bg-white border rounded-xl overflow-hidden">
                <div className="flex justify-between border-b px-6 py-4 text-sm"><span className="font-semibold text-gray-700">SKU</span><span>{product.sku || '-'}</span></div>
                <div className="flex justify-between border-b px-6 py-4 text-sm"><span className="font-semibold text-gray-700">Category</span><span>{product.category || '-'}</span></div>
                <div className="flex justify-between border-b px-6 py-4 text-sm"><span className="font-semibold text-gray-700">Manufacturer</span><span>{product.manufacturer || '-'}</span></div>
                <div className="flex justify-between border-b px-6 py-4 text-sm"><span className="font-semibold text-gray-700">Unit</span><span>{product.unit || 'each'}</span></div>
                <div className="flex justify-between border-b px-6 py-4 text-sm"><span className="font-semibold text-gray-700">Lead Time</span><span>{product.lead_time || 'Confirm with Odiscom Supply'}</span></div>
              </div>
            </div>
          </div>

          <aside className="bg-white border rounded-xl p-6 shadow-sm h-fit">
            <div className="mb-6">
              <div className="text-sm text-gray-500">Catalog Price</div>
              <div className="text-2xl font-bold text-slate-900">{Number(product.price || 0) > 0 ? money(product.price) : 'Request Quote'}</div>
              <div className="text-sm text-gray-500 mt-1">{product.lead_time || 'Lead time confirmed at quote'}</div>
            </div>
            {product.spec_sheet_url && <a href={product.spec_sheet_url} target="_blank" className="block text-center w-full bg-slate-100 text-slate-900 py-3 rounded-md font-semibold mb-3 hover:bg-slate-200">View Spec Sheet</a>}
            <Link href="/quote" className="block text-center w-full bg-blue-600 text-white py-3 rounded-md font-semibold mb-3 hover:bg-blue-700">Request Quote</Link>
            <p className="text-xs text-gray-500">Bulk, contractor, project, private-label, and spool/reel branding pricing may differ from catalog pricing.</p>
          </aside>
        </section>
      </main>
      <Footer />
    </>
  )
}
