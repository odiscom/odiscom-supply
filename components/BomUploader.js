import { useState } from 'react'

const emptyForm = {
  company: '',
  contactName: '',
  customerEmail: '',
  phone: '',
  fileName: '',
  fileUrl: '',
  notes: '',
}

export default function BomUploader() {
  const [form, setForm] = useState(emptyForm)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  function updateField(field, value) {
    setForm({ ...form, [field]: value })
  }

  async function submitUpload(e) {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    const res = await fetch('/api/upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })

    const data = await res.json()
    setLoading(false)

    if (!data.success) {
      setMessage(data.message || 'Upload request failed.')
      return
    }

    setForm(emptyForm)
    setMessage('Material upload request received. Our team will review it and prepare a quote.')
  }

  return (
    <div className="bg-white rounded-2xl shadow border p-6 md:p-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-900">Project Material Upload</h2>
        <p className="text-gray-600 mt-2">
          Enter your project information and provide a file name, shared link, or notes for the BOM, spreadsheet, plan set, or material list.
        </p>
      </div>

      {message && <div className="bg-blue-50 border border-blue-200 text-blue-800 rounded-lg p-4 mb-5 text-sm">{message}</div>}

      <form onSubmit={submitUpload} className="space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <input required value={form.company} onChange={(e) => updateField('company', e.target.value)} placeholder="Company" className="border rounded-lg p-3" />
          <input value={form.contactName} onChange={(e) => updateField('contactName', e.target.value)} placeholder="Contact name" className="border rounded-lg p-3" />
          <input required type="email" value={form.customerEmail} onChange={(e) => updateField('customerEmail', e.target.value)} placeholder="Email" className="border rounded-lg p-3" />
          <input value={form.phone} onChange={(e) => updateField('phone', e.target.value)} placeholder="Phone" className="border rounded-lg p-3" />
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <input required value={form.fileName} onChange={(e) => updateField('fileName', e.target.value)} placeholder="File name, e.g. Project-BOM.xlsx" className="border rounded-lg p-3" />
          <input value={form.fileUrl} onChange={(e) => updateField('fileUrl', e.target.value)} placeholder="Shared file link, if available" className="border rounded-lg p-3" />
        </div>

        <textarea required value={form.notes} onChange={(e) => updateField('notes', e.target.value)} rows="7" placeholder="Describe the project, needed materials, brands, quantities, deadlines, delivery location, and any alternates you want quoted." className="w-full border rounded-lg p-3" />

        <button disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-lg py-3 font-semibold disabled:opacity-60">
          {loading ? 'Submitting...' : 'Submit Material Upload Request'}
        </button>
      </form>

      <div className="mt-6 grid md:grid-cols-3 gap-3 text-sm text-gray-600">
        <div className="bg-gray-50 border rounded-lg p-4"><strong>Accepted:</strong> XLSX, CSV, PDF, plan sheets, material lists, and shared links.</div>
        <div className="bg-gray-50 border rounded-lg p-4"><strong>Use cases:</strong> Fiber BOMs, wireless site builds, splice kits, tools, reels, and trailers.</div>
        <div className="bg-gray-50 border rounded-lg p-4"><strong>Next step:</strong> Odiscom Supply reviews your list and prepares pricing.</div>
      </div>
    </div>
  )
}
