import { useEffect, useState } from 'react'
import AdminShell from '../../components/AdminShell'
import { supabase } from '../../lib/supabase'

export default function MaterialUploadsAdmin() {
  const [uploads, setUploads] = useState([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('all')
  const [message, setMessage] = useState('')

  useEffect(() => {
    loadUploads()
  }, [])

  async function loadUploads() {
    const { data, error } = await supabase
      .from('material_uploads')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) setMessage(error.message)
    setUploads(data || [])
    setLoading(false)
  }

  async function updateStatus(upload, status) {
    const { error } = await supabase.from('material_uploads').update({ status }).eq('id', upload.id)
    if (error) return setMessage(error.message)
    setMessage('Upload status updated.')
    loadUploads()
  }

  async function createQuote(upload) {
    const quoteId = `OSQ-${Date.now()}`
    const { data, error } = await supabase.from('quotes').insert([
      {
        quote_id: quoteId,
        name: upload.customer_email,
        company: upload.company,
        email: upload.customer_email,
        phone: '',
        details: `Material Upload: ${upload.file_name}\nLink: ${upload.file_url || 'N/A'}\n\n${upload.notes || ''}`,
        status: 'pending',
        source: 'material_upload',
      },
    ]).select().single()

    if (error) return setMessage(error.message)

    await supabase.from('material_uploads').update({ status: 'converted' }).eq('id', upload.id)
    setMessage(`Quote created: ${data.quote_id}`)
    loadUploads()
  }

  const filteredUploads = statusFilter === 'all'
    ? uploads
    : uploads.filter((upload) => upload.status === statusFilter)

  return (
    <AdminShell title="Material Uploads">
      <div className="space-y-6">
        {message && <div className="bg-blue-50 border border-blue-200 text-blue-800 rounded-xl p-4 text-sm">{message}</div>}

        <div className="bg-white border rounded-xl shadow p-4 flex flex-wrap justify-between gap-3 items-center">
          <div>
            <h2 className="font-bold text-slate-900">Uploaded BOMs and Material Lists</h2>
            <p className="text-sm text-gray-500">Review customer material upload requests and convert them into quote records.</p>
          </div>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="border rounded-lg px-3 py-2 text-sm">
            <option value="all">All statuses</option>
            <option value="new">New</option>
            <option value="reviewing">Reviewing</option>
            <option value="converted">Converted</option>
            <option value="closed">Closed</option>
          </select>
        </div>

        {loading ? (
          <div className="bg-white rounded-xl shadow p-8 text-gray-600">Loading uploads...</div>
        ) : (
          <div className="grid gap-4">
            {filteredUploads.length === 0 && <div className="bg-white rounded-xl shadow p-8 text-gray-500">No material uploads found.</div>}
            {filteredUploads.map((upload) => (
              <div key={upload.id} className="bg-white rounded-xl shadow border p-6">
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                  <div>
                    <div className="flex flex-wrap gap-2 items-center mb-2">
                      <h3 className="text-xl font-bold text-slate-900">{upload.company}</h3>
                      <span className="text-xs font-semibold bg-blue-50 text-blue-700 px-2 py-1 rounded-full">{upload.status}</span>
                    </div>
                    <p className="text-sm text-gray-600"><strong>Email:</strong> {upload.customer_email}</p>
                    <p className="text-sm text-gray-600"><strong>File:</strong> {upload.file_name}</p>
                    {upload.file_url && <p className="text-sm text-blue-700"><a href={upload.file_url} target="_blank">Open shared file</a></p>}
                    <p className="text-xs text-gray-500 mt-2">Submitted: {upload.created_at ? new Date(upload.created_at).toLocaleString() : ''}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <select value={upload.status} onChange={(e) => updateStatus(upload, e.target.value)} className="border rounded-lg px-3 py-2 text-sm">
                      <option value="new">New</option>
                      <option value="reviewing">Reviewing</option>
                      <option value="converted">Converted</option>
                      <option value="closed">Closed</option>
                    </select>
                    <button onClick={() => createQuote(upload)} className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 py-2 text-sm font-semibold">
                      Convert to Quote
                    </button>
                  </div>
                </div>
                <div className="mt-4 bg-gray-50 border rounded-lg p-4 whitespace-pre-wrap text-sm text-gray-700">{upload.notes || 'No notes.'}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminShell>
  )
}
