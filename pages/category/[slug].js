import Link from 'next/link'
import Header from '../../components/Header'
import Footer from '../../components/Footer'
import { categories, getCategory, getProductsByCategory } from '../../data/products'

export default function CategoryPage({ category, products }) {
  return (
    <>
      <Header />
      <main className="bg-gray-50 min-h-screen">
        <section className="bg-slate-900 text-white">
          <div className="max-w-7xl mx-auto px-6 py-14">
            <Link href="/shop" className="text-blue-300 text-sm font-semibold">Shop /</Link>
            <h1 className="text-4xl font-bold mt-3">{category.name}</h1>
            <p className="text-slate-200 max-w-3xl mt-4">{category.description}</p>
          </div>
        </section>
        <section className="max-w-7xl mx-auto px-6 py-10">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <Link key={product.slug} href={`/product/${product.slug}`}>
                <article className="bg-white border rounded-xl shadow-sm hover:shadow-md transition p-6 h-full">
                  <div className="flex flex-wrap gap-2 mb-4">
                    {product.badges.map((badge) => (
                      <span key={badge} className="text-xs font-semibold bg-blue-50 text-blue-700 px-2 py-1 rounded-full">{badge}</span>
                    ))}
                  </div>
                  <h3 className="text-xl font-bold mb-3">{product.name}</h3>
                  <p className="text-gray-600 text-sm mb-5">{product.summary}</p>
                  <div className="border-t pt-4 flex items-center justify-between text-sm">
                    <span className="font-semibold text-slate-900">{product.priceLabel}</span>
                    <span className="text-gray-500">{product.leadTime}</span>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}

export function getStaticPaths() {
  return { paths: categories.map((category) => ({ params: { slug: category.slug } })), fallback: false }
}

export function getStaticProps({ params }) {
  return { props: { category: getCategory(params.slug), products: getProductsByCategory(params.slug) } }
}
