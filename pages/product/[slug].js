import Header from '../../components/Header'
import Footer from '../../components/Footer'
import Link from 'next/link'
import { products, getProduct } from '../../data/products'

export default function ProductPage({ product }) {
  return (
    <>
      <Header />
      <main className="bg-gray-50 min-h-screen">
        <section className="bg-slate-900 text-white">
          <div className="max-w-7xl mx-auto px-6 py-14">
            <Link href="/shop" className="text-blue-300 text-sm font-semibold">Shop /</Link>
            <h1 className="text-4xl font-bold mt-3">{product.name}</h1>
            <p className="text-slate-200 max-w-3xl mt-4">{product.summary}</p>
          </div>
        </section>
        <section className="max-w-7xl mx-auto px-6 py-10 grid lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold mb-4">Specifications</h2>
            <div className="bg-white border rounded-xl overflow-hidden">
              {Object.entries(product.specs).map(([key, value]) => (
                <div key={key} className="flex justify-between border-b px-6 py-4 text-sm">
                  <span className="font-semibold text-gray-700">{key}</span>
                  <span className="text-gray-900">{value}</span>
                </div>
              ))}
            </div>
          </div>
          <aside className="bg-white border rounded-xl p-6 shadow-sm h-fit">
            <div className="mb-6">
              <div className="text-lg font-bold">{product.priceLabel}</div>
              <div className="text-sm text-gray-500">{product.leadTime}</div>
            </div>
            <Link href="/quote" className="block text-center w-full bg-blue-600 text-white py-3 rounded-md font-semibold mb-3 hover:bg-blue-700">Request Quote</Link>
          </aside>
        </section>
      </main>
      <Footer />
    </>
  )
}

export function getStaticPaths() {
  return { paths: products.map((product) => ({ params: { slug: product.slug } })), fallback: false }
}

export function getStaticProps({ params }) {
  return { props: { product: getProduct(params.slug) } }
}
