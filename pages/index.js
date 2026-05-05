import Link from 'next/link'
import Header from '../components/Header'
import Footer from '../components/Footer'

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <section className="bg-slate-900 text-white">
          <div className="max-w-7xl mx-auto px-6 py-24">
            <h1 className="text-5xl font-bold max-w-4xl">Telecom infrastructure supply for fiber and wireless contractors.</h1>
            <p className="text-slate-200 text-xl mt-6 max-w-3xl">Connectors, cable, tools, splicing equipment, private-label fiber, and job-based quotes built by people who understand the field.</p>
            <div className="flex gap-4 mt-8">
              <Link href="/shop" className="bg-blue-600 px-6 py-3 rounded font-semibold">Shop Catalog</Link>
              <Link href="/quote" className="bg-white text-slate-900 px-6 py-3 rounded font-semibold">Request Quote</Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
