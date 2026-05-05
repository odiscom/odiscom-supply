import Link from 'next/link'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { categories } from '../data/products'

export default function Shop() {
  return (
    <>
      <Header />
      <main className="bg-gray-50 min-h-screen px-6 py-12 max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Shop Telecom Products</h1>
        <div className="grid md:grid-cols-3 gap-6">
          {categories.map((cat) => (
            <Link key={cat.slug} href={`/category/${cat.slug}`}>
              <div className="border p-6 rounded-lg bg-white shadow hover:shadow-md cursor-pointer h-full">
                <h2 className="text-xl font-semibold mb-2">{cat.name}</h2>
                <p className="text-sm text-gray-600">{cat.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </main>
      <Footer />
    </>
  )
}
