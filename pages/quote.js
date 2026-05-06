import { useMemo, useState } from 'react'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { broadbandCatalog } from '../data/broadbandCatalog'

export default function QuotePage() {
  const [form, setForm] = useState({ name: '', company: '', email: '', phone: '', details: '' })
  const [selectedItems, setSelectedItems] = useState({})
  const [search, setSearch] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [quoteId, setQuoteId] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  function updateItem(category, name, quantity) {
    const key = `${category}::${name}`
    const qty = Number(quantity || 0)
    const nextItems = { ...selectedItems }

    if (qty > 0) {
      nextItems[key] = { category, product_name: name, quantity: qty, unit: 'each' }
    } else {
      delete nextItems[key]
    }

    setSelectedItems(nextItems)
  }

  const filteredCatalog = useMemo(() => {
    const query = search.toLowerCase().trim()
    if (!query) return broadbandCatalog

    return broadbandCatalog
      .map((group) => ({
        ...group,
        items: group.items.filter((item) => `${group.category} ${item}`.toLowerCase().includes(query)),
      }))
      .filter((group) => group.items.length > 0)
  }, [search])

  const selectedList = Object.values(selectedItems)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const res = await fetch('/api/quote', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, selectedItems: selectedList }),
    })

    const data = await res.json()
    setLoading(false)

    if (data.success) {
      setSubmitted(true)
      setQuoteId(data.quoteId)
    } else {
      setError(data.error || data.message || 'Error submitting quote')
    }
  }

  return (
    <>
      <Header />
      <main className="bg-gray-50 min-h-screen">
        <section className="bg-slate-900 text-white">
          <div className="max-w-7xl mx-auto px-6 py-14">
            <h1 className="text-4xl font-bold">Request a Construction Supply Quote</h1>
            <p className="mt-4 text-slate-200 max-w-3xl">Select fiber broadband, OSP, tower, wireless, power, grounding, tools, trailers, or civil materials. Pricing is not shown publicly; submit quantities and Odiscom Supply will quote availability, lead time, and project pricing.</p>
          </div>
        </section>
        <section className="max-w-7xl mx-auto px-6 py-10">
          {submitted ? (
            <div className="bg-white p-8 rounded-xl shadow text-center">
              <h2 className="text-2xl font-bold mb-4">Quote Submitted</h2>
              <p className="text-gray-600 mb-2">Your Quote ID:</p>
              <div className="text-xl font-mono text-blue-600 mb-4">{quoteId}</div>
              <p className="text-gray-600">We will review your selected materials and contact you shortly.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-white p-6 rounded-xl shadow border">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-5">
                    <div>
                      <h2 className="text-2xl font-bold text-slate-900">Select Materials</h2>
                      <p className="text-sm text-gray-600 mt-1">Enter quantities only. Odiscom Supply will provide pricing after review.</p>
                    </div>
                    <div className="bg-blue-50 text-blue-800 rounded-lg px-4 py-2 text-sm font-semibold">{selectedList.length} selected</div>
                  </div>
                  <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search fiber, conduit, tower mounts, grounding, testing tools..." className="w-full border rounded-lg p-3 mb-6" />

                  <div className="space-y-6 max-h-[900px] overflow-y-auto pr-2">
                    {filteredCatalog.map((group) => (
                      <div key={group.category} className="border rounded-xl overflow-hidden">
                        <div className="bg-slate-100 px-4 py-3 font-bold text-slate-900">{group.category}</div>
                        <div className="divide-y">
                          {group.items.map((item) => {
                            const key = `${group.category}::${item}`
                            return (
                              <div key={item} className="grid grid-cols-1 md:grid-cols-[1fr_130px] gap-3 px-4 py-3 items-center">
                                <div>
                                  <div className="font-semibold text-slate-900">{item}</div>
                                  <div className="text-xs text-gray-500">{group.category}</div>
                                </div>
                                <input type="number" min="0" value={selectedItems[key]?.quantity || ''} onChange={(e) => updateItem(group.category, item, e.target.value)} placeholder="Qty" className="border rounded-lg p-2 text-right" />
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <aside className="space-y-6">
                <div className="bg-white p-6 rounded-xl shadow border sticky top-24">
                  <h2 className="text-xl font-bold mb-4">Contact Info</h2>
                  {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 text-sm mb-4">{error}</div>}
                  <div className="space-y-4">
                    <input name="name" placeholder="Full Name" required onChange={handleChange} className="w-full border p-3 rounded-lg" />
                    <input name="company" placeholder="Company" required onChange={handleChange} className="w-full border p-3 rounded-lg" />
                    <input name="email" type="email" placeholder="Email" required onChange={handleChange} className="w-full border p-3 rounded-lg" />
                    <input name="phone" placeholder="Phone" onChange={handleChange} className="w-full border p-3 rounded-lg" />
                    <textarea name="details" placeholder="Project location, delivery needs, deadlines, brand preferences, alternates, notes..." rows="6" onChange={handleChange} className="w-full border p-3 rounded-lg" />
                  </div>

                  <div className="mt-5 border rounded-lg p-4 bg-gray-50 max-h-56 overflow-y-auto">
                    <div className="font-bold text-sm mb-2">Selected Items</div>
                    {selectedList.length === 0 ? (
                      <p className="text-sm text-gray-500">No material quantities selected yet.</p>
                    ) : (
                      <ul className="space-y-2 text-sm">
                        {selectedList.map((item) => <li key={`${item.category}-${item.product_name}`}><strong>{item.quantity}</strong> × {item.product_name}</li>)}
                      </ul>
                    )}
                  </div>

                  <button type="submit" disabled={loading} className="mt-5 w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-60">{loading ? 'Submitting...' : 'Submit Quote Request'}</button>
                  <p className="text-xs text-gray-500 mt-3">No pricing is shown online. All requests are reviewed for project pricing, lead times, freight, availability, and quantity breaks.</p>
                </div>
              </aside>
            </form>
          )}
        </section>
      </main>
      <Footer />
    </>
  )
}
