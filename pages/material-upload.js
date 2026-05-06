import Header from '../components/Header'
import Footer from '../components/Footer'
import BomUploader from '../components/BomUploader'

export default function MaterialUploadPage() {
  return (
    <>
      <Header />
      <main className="bg-gray-50 min-h-screen">
        <section className="bg-slate-900 text-white">
          <div className="max-w-5xl mx-auto px-6 py-16">
            <h1 className="text-4xl font-bold">Upload Your BOM or Material List</h1>
            <p className="text-slate-200 mt-4 max-w-3xl">
              Send Odiscom Supply your fiber, wireless, splicing, construction, or OSP material list and our team will build a project quote.
            </p>
          </div>
        </section>
        <section className="max-w-5xl mx-auto px-6 py-10">
          <BomUploader />
        </section>
      </main>
      <Footer />
    </>
  )
}
