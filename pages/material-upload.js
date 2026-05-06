import Header from '../components/Header'
import Footer from '../components/Footer'
import BomUploader from '../components/BomUploader'

export default function MaterialUploadPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-slate-50">
        <section className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 text-white">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute -left-24 top-8 h-80 w-80 rounded-full bg-blue-500 blur-3xl" />
            <div className="absolute right-0 bottom-0 h-80 w-80 rounded-full bg-cyan-400 blur-3xl" />
          </div>
          <div className="relative mx-auto max-w-6xl px-6 py-16 lg:py-20">
            <div className="max-w-4xl">
              <div className="mb-4 inline-flex rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-blue-100">BOM Upload • Project Sourcing</div>
              <h1 className="text-4xl font-bold leading-tight md:text-5xl">Upload your BOM, plan set, spreadsheet, or telecom material list</h1>
              <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-200">Send Odiscom Supply your fiber, wireless, splicing, construction, OSP, or tower material request and our team will convert it into a structured project quote.</p>
            </div>
          </div>
        </section>

        <section className="-mt-8 relative z-10 mx-auto max-w-6xl px-6">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="text-sm font-semibold text-slate-900">Spreadsheet & PDF Friendly</div><p className="mt-2 text-sm text-slate-600">Use XLSX, CSV, PDFs, shared links, or pasted project requirements.</p></div>
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="text-sm font-semibold text-slate-900">Telecom Review</div><p className="mt-2 text-sm text-slate-600">We review OSP, tower, wireless, fiber, power, grounding, and tool requirements.</p></div>
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="text-sm font-semibold text-slate-900">Quote Conversion</div><p className="mt-2 text-sm text-slate-600">Admin can convert uploads into quote records for pricing and fulfillment.</p></div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 py-10">
          <BomUploader />
        </section>
      </main>
      <Footer />
    </>
  )
}
