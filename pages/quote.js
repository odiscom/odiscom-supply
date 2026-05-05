import { useState } from 'react'
import Header from '../components/Header'
import Footer from '../components/Footer'

export default function QuotePage() {
  const [form, setForm] = useState({ name: '', company: '', email: '', phone: '', details: '' })
  const [submitted, setSubmitted] = useState(false)
  const [quoteId, setQuoteId] = useState(null)

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    const res = await fetch('/api/quote', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
    const data = await res.json()
    if (data.success) { setSubmitted(true); setQuoteId(data.quoteId) }
    else alert(data.error || data.message || 'Error submitting quote')
  }

  return (
    <>
      <Header />
      <main className="bg-gray-50 min-h-screen">
        <section className="bg-slate-900 text-white">
          <div className="max-w-4xl mx-auto px-6 py-14">
            <h1 className="text-4xl font-bold">Request a Quote</h1>
            <p className="mt-4 text-slate-200">Submit your project details and our team will respond with pricing and availability.</p>
          </div>
        </section>
        <section className="max-w-4xl mx-auto px-6 py-10">
          {submitted ? (
            <div className="bg-white p-8 rounded-xl shadow text-center">
              <h2 className="text-2xl font-bold mb-4">Quote Submitted</h2>
              <p className="text-gray-600 mb-2">Your Quote ID:</p>
              <div className="text-xl font-mono text-blue-600 mb-4">{quoteId}</div>
              <p className="text-gray-600">We will contact you shortly.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <input name="name" placeholder="Full Name" required onChange={handleChange} className="border p-3 rounded" />
                <input name="company" placeholder="Company" required onChange={handleChange} className="border p-3 rounded" />
                <input name="email" type="email" placeholder="Email" required onChange={handleChange} className="border p-3 rounded" />
                <input name="phone" placeholder="Phone" onChange={handleChange} className="border p-3 rounded" />
              </div>
              <textarea name="details" placeholder="Describe your project, materials needed, quantities, timelines..." rows="6" onChange={handleChange} className="w-full border p-3 rounded" />
              <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded font-semibold hover:bg-blue-700">Submit Quote Request</button>
            </form>
          )}
        </section>
      </main>
      <Footer />
    </>
  )
}
