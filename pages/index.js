import Link from 'next/link'
import Header from '../components/Header'
import Footer from '../components/Footer'

const solutionCards = [
  { title: 'Fiber Broadband Builds', text: 'Cable, conduit, splice closures, handholes, cabinets, patch panels, splitters, tools, and test equipment.' },
  { title: 'Wireless & Tower Sites', text: 'Mounts, steel, grounding, power, jumpers, hangers, weatherproofing, safety gear, and site materials.' },
  { title: 'Private-Label Fiber', text: 'Custom sourced fiber cable, branded reel wraps, spool branding, and bulk project supply programs.' },
  { title: 'Project-Based Sourcing', text: 'Upload BOMs, select quantities, request alternates, and let Odiscom Supply quote availability and lead time.' },
]

const categories = [
  'OSP Fiber Cable',
  'Conduit & Innerduct',
  'Splice Closures',
  'Handholes & Vaults',
  'Tower Steel & Mounts',
  'Grounding & Power',
  'Fusion Splicing Tools',
  'Fiber Reel Trailers',
]

export default function Home() {
  return (
    <>
      <Header />
      <main className="bg-slate-50">
        <section className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 text-white">
          <div className="absolute inset-0 opacity-25">
            <div className="absolute -left-20 top-10 h-80 w-80 rounded-full bg-blue-500 blur-3xl" />
            <div className="absolute right-10 top-20 h-96 w-96 rounded-full bg-cyan-400 blur-3xl" />
            <div className="absolute bottom-0 left-1/2 h-72 w-72 rounded-full bg-indigo-500 blur-3xl" />
          </div>

          <div className="relative mx-auto grid max-w-7xl gap-12 px-6 py-20 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:py-28">
            <div>
              <div className="mb-5 inline-flex rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-blue-100">
                Telecom Infrastructure Supply Platform
              </div>
              <h1 className="text-4xl font-bold leading-tight md:text-6xl">
                Built for fiber broadband, wireless, OSP, and tower construction buyers.
              </h1>
              <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-200">
                Odiscom Supply is a B2B sourcing platform for telecom contractors, ISPs, tower crews, and infrastructure builders who need materials quoted by project, quantity, lead time, freight, and availability.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link href="/quote" className="rounded-xl bg-blue-600 px-6 py-4 text-center font-semibold text-white shadow-lg shadow-blue-950/30 transition hover:bg-blue-700">
                  Build a Quote Request
                </Link>
                <Link href="/material-upload" className="rounded-xl bg-white px-6 py-4 text-center font-semibold text-slate-950 transition hover:bg-slate-100">
                  Upload BOM / Material List
                </Link>
              </div>
              <div className="mt-8 grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur"><div className="text-2xl font-bold">B2B</div><div className="text-sm text-slate-300">project quoting</div></div>
                <div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur"><div className="text-2xl font-bold">OSP</div><div className="text-sm text-slate-300">fiber materials</div></div>
                <div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur"><div className="text-2xl font-bold">Tower</div><div className="text-sm text-slate-300">site hardware</div></div>
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/10 p-6 shadow-2xl backdrop-blur">
              <div className="rounded-2xl bg-white p-6 text-slate-900">
                <div className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-700">Quote Workflow</div>
                <div className="mt-5 space-y-4">
                  {[
                    ['1', 'Select materials or upload a BOM'],
                    ['2', 'Odiscom reviews supplier availability'],
                    ['3', 'We quote pricing, lead time, and freight'],
                    ['4', 'Accepted quotes convert into orders'],
                  ].map(([num, text]) => (
                    <div key={num} className="flex gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">{num}</div>
                      <div className="font-semibold text-slate-800">{text}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-6 py-14">
          <div className="mb-8 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="text-sm font-bold uppercase tracking-[0.2em] text-blue-700">Supply Categories</div>
              <h2 className="mt-2 text-3xl font-bold text-slate-950">Everything needed for broadband and tower deployment</h2>
            </div>
            <Link href="/shop" className="font-semibold text-blue-700">Browse catalog →</Link>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {categories.map((category) => (
              <div key={category} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                <div className="font-bold text-slate-900">{category}</div>
                <div className="mt-2 text-sm text-slate-600">Request project pricing and availability.</div>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-6 pb-16">
          <div className="grid gap-6 lg:grid-cols-4">
            {solutionCards.map((card) => (
              <div key={card.title} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <h3 className="text-lg font-bold text-slate-950">{card.title}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-600">{card.text}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-slate-950 text-white">
          <div className="mx-auto grid max-w-7xl gap-8 px-6 py-14 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <h2 className="text-3xl font-bold">Have a project list already?</h2>
              <p className="mt-3 max-w-2xl text-slate-300">Upload your BOM, spreadsheet, plan sheet, or material list and let Odiscom Supply convert it into a structured quote workflow.</p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link href="/material-upload" className="rounded-xl bg-white px-6 py-3 text-center font-semibold text-slate-950">Upload BOM</Link>
              <Link href="/quote" className="rounded-xl bg-blue-600 px-6 py-3 text-center font-semibold text-white">Start Quote</Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
