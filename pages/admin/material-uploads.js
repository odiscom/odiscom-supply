import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import AdminShell from '../../components/AdminShell'
import { supabase } from '../../lib/supabase'

function Badge({ children, tone = 'blue' }) {
  const tones = {
    blue: 'bg-blue-50 text-blue-700',
    green: 'bg-green-50 text-green-700',
    amber: 'bg-amber-50 text-amber-700',
    red: 'bg-red-50 text-red-700',
    slate: 'bg-slate-100 text-slate-700',
  }
  return <span className={`rounded-full px-3 py-1 text-xs font-semibold ${tones[tone] || tones.blue}`}>{children}</span>
}

function statusTone(status) {
  if (status === 'converted') return 'green'
  if (status === 'closed') return 'slate'
  if (status === 'reviewing') return 'blue'
  return 'amber'
}

export default function MaterialUploadsAdmin() {
  const [uploads, setUploads] = useState([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [message, setMessage] = useState('')

  useEffect(() => { loadUploads() }, [])

  async function loadUploads() {
    const { data, error } = await supabase.from('material_uploads').select('*').order('created_at', { ascending: false })
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

  async function deleteUpload(upload) {
    if (!confirm(`Delete material upload from ${upload.company}?`)) return
    const { error } = await supabase.from('material_uploads').delete().eq('id', upload.id)
    if (error) return setMessage(error.message)
    setMessage('Material upload deleted.')
    loadUploads()
  }

  const filteredUploads = useMemo(() => {
    const query = search.toLowerCase().trim()
    return uploads.filter((upload) => {
      const matchesStatus = statusFilter === 'all' || upload.status === statusFilter
      const matchesSearch = !query || [upload.company, upload.customer_email, upload.file_name, upload.file_url, upload.notes].join(' ').toLowerCase().includes(query)
      return matchesStatus && matchesSearch
    })
  }, [uploads, statusFilter, search])

  const newCount = uploads.filter((u) => u.status === 'new').length
  const reviewingCount = uploads.filter((u) => u.status === 'reviewing').length
  const convertedCount = uploads.filter((u) => u.status === 'converted').length
  const closedCount = uploads.filter((u) => u.status === 'closed').length

  return (
    <AdminShell title="Material Uploads">
      <div className="space-y-6">
        <div className="rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 p-8 text-white shadow-sm">
          <div className="max-w-3xl">
            <div className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-blue-200">BOM Intake Queue</div>
            <h2 className="text-3xl font-bold">Review uploaded BOMs, spreadsheets, plan lists, and material requests.</h2>
            <p className="mt-3 text-sm leading-6 text-slate-300">Move customer material uploads through review, convert them into quotes, and keep sourcing workflow organized.</p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <div className="rounded-3xl border bg-white p-6 shadow-sm"><div className="text-sm text-slate-500">New</div><div className="mt-2 text-3xl font-bold text-amber-700">{newCount}</div></div>
          <div className="rounded-3xl border bg-white p-6 shadow-sm"><div className="text-sm text-slate-500">Reviewing</div><div className="mt-2 text-3xl font-bold text-blue-700">{reviewingCount}</div></div>
          <div className="rounded-3xl border bg-white p-6 shadow-sm"><div className="text-sm text-slate-500">Converted</div><div className="mt-2 text-3xl font-bold text-green-700">{convertedCount}</div></div>
          <div className="rounded-3xl border bg-white p-6 shadow-sm"><div className="text-sm text-slate-500">Closed</div><div className="mt-2 text-3xl font-bold text-slate-700">{closedCount}</div></div>
        </div>

        {message && <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800">{message}</div>}

        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="grid gap-3 md:grid-cols-[1fr_220px]">
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search company, email, file name, notes..." className="rounded-2xl border bg-slate-50 px-4 py-3 text-sm" />
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="rounded-2xl border bg-slate-50 px-4 py-3 text-sm">
              <option value="all">All statuses</option>
              <option value="new">New</option>
              <option value="reviewing">Reviewing</option>
              <option value="converted">Converted</option>
              <option value="closed">Closed</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="rounded-3xl bg-white p-10 text-slate-600 shadow-sm">Loading uploads...</div>
        ) : (
          <div className="grid gap-4">
            {filteredUploads.length === 0 && <div className="rounded-3xl bg-white p-10 text-center text-slate-500 shadow-sm">No material uploads found.</div>}
            {filteredUploads.map((upload) => (
              <div key={upload.id} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-3">
                      <h3 className="text-xl font-bold text-slate-950">{upload.company}</h3>
                      <Badge tone={statusTone(upload.status)}>{upload.status}</Badge>
                    </div>
                    <div className="mt-3 grid gap-2 text-sm text-slate-600 md:grid-cols-2">
                      <div><strong>Email:</strong> {upload.customer_email}</div>
                      <div><strong>File:</strong> {upload.file_name}</div>
                      <div><strong>Submitted:</strong> {upload.created_at ? new Date(upload.created_at).toLocaleString() : ''}</div>
                      <div>{upload.file_url ? <a href={upload.file_url} target="_blank" className="font-semibold text-blue-700">Open shared file</a> : <span className="text-slate-400">No shared link</span>}</div>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <select value={upload.status} onChange={(e) => updateStatus(upload, e.target.value)} className="rounded-xl border px-3 py-2 text-sm">
                      <option value="new">New</option>
                      <option value="reviewing">Reviewing</option>
                      <option value="converted">Converted</option>
                      <option value="closed">Closed</option>
                    </select>
                    <button onClick={() => createQuote(upload)} className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">Convert to Quote</button>
                    <button onClick={() => deleteUpload(upload)} className="rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700">Delete</button>
                  </div>
                </div>
                <div className="mt-5 whitespace-pre-wrap rounded-2xl border border-slate-200 bg-slate-50 p-5 text-sm leading-6 text-slate-700">{upload.notes || 'No notes.'}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminShell>
  )
}
