import { useEffect, useMemo, useState } from 'react'
import AdminShell from '../../components/AdminShell'
import { supabase } from '../../lib/supabase'

const emptySupplier = {
  name: '',
  contact_name: '',
  email: '',
  phone: '',
  website: '',
  product_categories: '',
  payment_terms: '',
  lead_time: '',
  notes: '',
  onboarding_status: 'target',
  priority: 'normal',
  next_action: '',
  application_url: '',
}

function Badge({ children, tone = 'blue' }) {
  const tones = {
    blue: 'bg-blue-50 text-blue-700',
    green: 'bg-green-50 text-green-700',
    amber: 'bg-amber-50 text-amber-700',
    slate: 'bg-slate-100 text-slate-700',
  }
  return <span className={`rounded-full px-3 py-1 text-xs font-semibold ${tones[tone] || tones.blue}`}>{children}</span>
}

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState([])
  const [form, setForm] = useState(emptySupplier)
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')

  useEffect(() => { loadSuppliers() }, [])

  async function loadSuppliers() {
    const { data, error } = await supabase.from('suppliers').select('*').order('created_at', { ascending: false })
    if (error) setMessage(error.message)
    setSuppliers(data || [])
    setLoading(false)
  }

  function updateField(field, value) {
    setForm({ ...form, [field]: value })
  }

  async function saveSupplier(e) {
    e.preventDefault()
    setMessage('')
    const { error } = await supabase.from('suppliers').insert([form])
    if (error) return setMessage(error.message)
    setForm(emptySupplier)
    setMessage('Supplier added.')
    loadSuppliers()
  }

  async function deleteSupplier(supplier) {
    if (!confirm(`Delete supplier "${supplier.name}"?`)) return
    const { error } = await supabase.from('suppliers').delete().eq('id', supplier.id)
    if (error) return setMessage(error.message)
    setMessage('Supplier deleted.')
    loadSuppliers()
  }

  const categories = useMemo(() => {
    const values = suppliers.flatMap((supplier) => String(supplier.product_categories || '').split(',').map((cat) => cat.trim()).filter(Boolean))
    return [...new Set(values)]
  }, [suppliers])

  const filteredSuppliers = useMemo(() => {
    const query = search.toLowerCase().trim()
    return suppliers.filter((supplier) => {
      const searchable = [supplier.name, supplier.contact_name, supplier.email, supplier.phone, supplier.website, supplier.product_categories, supplier.payment_terms, supplier.lead_time, supplier.notes].join(' ').toLowerCase()
      const matchesSearch = !query || searchable.includes(query)
      const matchesCategory = categoryFilter === 'all' || String(supplier.product_categories || '').toLowerCase().includes(categoryFilter.toLowerCase())
      return matchesSearch && matchesCategory
    })
  }, [suppliers, search, categoryFilter])

  const withEmail = suppliers.filter((supplier) => supplier.email).length
  const withWebsite = suppliers.filter((supplier) => supplier.website).length

  return (
    <AdminShell title="Suppliers">
      <div className="space-y-6">
        <div className="rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 p-8 text-white shadow-sm">
          <div className="max-w-3xl">
            <div className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-blue-200">Vendor Sourcing Directory</div>
            <h2 className="text-3xl font-bold">Track fiber, tower, OSP, tools, trailer, and infrastructure suppliers.</h2>
            <p className="mt-3 text-sm leading-6 text-slate-300">Use this directory for sourcing, pricing, lead-time comparisons, payment terms, and quote line-item supplier assignment.</p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <div className="rounded-3xl border bg-white p-6 shadow-sm"><div className="text-sm text-slate-500">Suppliers</div><div className="mt-2 text-3xl font-bold">{suppliers.length}</div></div>
          <div className="rounded-3xl border bg-white p-6 shadow-sm"><div className="text-sm text-slate-500">With Email</div><div className="mt-2 text-3xl font-bold text-blue-700">{withEmail}</div></div>
          <div className="rounded-3xl border bg-white p-6 shadow-sm"><div className="text-sm text-slate-500">With Website</div><div className="mt-2 text-3xl font-bold text-green-700">{withWebsite}</div></div>
          <div className="rounded-3xl border bg-white p-6 shadow-sm"><div className="text-sm text-slate-500">Categories</div><div className="mt-2 text-3xl font-bold text-slate-950">{categories.length}</div></div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[420px_1fr]">
          <form onSubmit={saveSupplier} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
            <div><h2 className="text-xl font-bold text-slate-950">Add Supplier</h2><p className="mt-1 text-sm text-slate-600">Track cable, connectors, tools, splicers, trailers, mounts, grounding, and infrastructure vendors.</p></div>
            {message && <div className="rounded-xl border border-blue-200 bg-blue-50 p-3 text-sm text-blue-800">{message}</div>}
            <input required value={form.name} onChange={(e) => updateField('name', e.target.value)} placeholder="Supplier name" className="w-full rounded-xl border p-3" />
            <div className="grid grid-cols-2 gap-3"><input value={form.contact_name} onChange={(e) => updateField('contact_name', e.target.value)} placeholder="Contact name" className="w-full rounded-xl border p-3" /><input value={form.phone} onChange={(e) => updateField('phone', e.target.value)} placeholder="Phone" className="w-full rounded-xl border p-3" /></div>
            <input type="email" value={form.email} onChange={(e) => updateField('email', e.target.value)} placeholder="Email" className="w-full rounded-xl border p-3" />
            <input value={form.website} onChange={(e) => updateField('website', e.target.value)} placeholder="Website" className="w-full rounded-xl border p-3" />
            <input value={form.application_url} onChange={(e) => updateField('application_url', e.target.value)} placeholder="Account / partner application URL" className="w-full rounded-xl border p-3" />
            <input value={form.product_categories} onChange={(e) => updateField('product_categories', e.target.value)} placeholder="Product categories, comma separated" className="w-full rounded-xl border p-3" />
            <div className="grid grid-cols-2 gap-3"><input value={form.payment_terms} onChange={(e) => updateField('payment_terms', e.target.value)} placeholder="Terms" className="w-full rounded-xl border p-3" /><input value={form.lead_time} onChange={(e) => updateField('lead_time', e.target.value)} placeholder="Lead time" className="w-full rounded-xl border p-3" /></div>
            <div className="grid grid-cols-2 gap-3"><select value={form.priority} onChange={(e) => updateField('priority', e.target.value)} className="w-full rounded-xl border p-3"><option value="critical">Critical</option><option value="high">High</option><option value="normal">Normal</option></select><select value={form.onboarding_status} onChange={(e) => updateField('onboarding_status', e.target.value)} className="w-full rounded-xl border p-3"><option value="target">Target</option><option value="applying">Applying</option><option value="submitted">Submitted</option><option value="approved">Approved</option><option value="declined">Declined</option></select></div>
            <input value={form.next_action} onChange={(e) => updateField('next_action', e.target.value)} placeholder="Next action" className="w-full rounded-xl border p-3" />
            <textarea value={form.notes} onChange={(e) => updateField('notes', e.target.value)} placeholder="Notes, pricing preferences, account numbers, reps, limitations..." rows="5" className="w-full rounded-xl border p-3" />
            <button className="w-full rounded-xl bg-blue-600 py-3 font-semibold text-white hover:bg-blue-700">Add Supplier</button>
          </form>

          <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 p-5">
              <div className="grid gap-3 md:grid-cols-[1fr_220px]"><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search suppliers, contacts, categories, notes..." className="rounded-2xl border bg-slate-50 px-4 py-3 text-sm" /><select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="rounded-2xl border bg-slate-50 px-4 py-3 text-sm"><option value="all">All categories</option>{categories.map((category) => <option key={category} value={category}>{category}</option>)}</select></div>
            </div>
            {loading ? <div className="p-10 text-slate-600">Loading suppliers...</div> : <div className="overflow-x-auto"><table className="min-w-full text-sm"><thead className="bg-slate-50 text-slate-600"><tr><th className="px-5 py-4 text-left">Supplier</th><th className="px-5 py-4 text-left">Status</th><th className="px-5 py-4 text-left">Categories</th><th className="px-5 py-4 text-left">Next Action</th><th className="px-5 py-4 text-left">Terms</th><th className="px-5 py-4 text-right">Action</th></tr></thead><tbody>{filteredSuppliers.length === 0 && <tr><td colSpan="6" className="p-10 text-center text-slate-500">No suppliers found.</td></tr>}{filteredSuppliers.map((supplier) => <tr key={supplier.id} className="border-t align-top hover:bg-slate-50"><td className="px-5 py-4"><div className="font-semibold text-slate-950">{supplier.name}</div><div className="mt-2 flex gap-2"><Badge tone={supplier.priority === 'critical' ? 'amber' : 'blue'}>{supplier.priority || 'normal'}</Badge></div>{supplier.application_url && <a href={supplier.application_url} target="_blank" rel="noreferrer" className="mt-3 block text-xs font-semibold text-blue-700">Open application →</a>}<div className="mt-3 max-w-sm whitespace-pre-wrap text-xs text-slate-500">{supplier.notes || ''}</div></td><td className="px-5 py-4"><Badge tone={supplier.onboarding_status === 'approved' ? 'green' : supplier.onboarding_status === 'submitted' ? 'blue' : 'slate'}>{supplier.onboarding_status || 'target'}</Badge></td><td className="px-5 py-4"><div className="flex max-w-xs flex-wrap gap-2">{String(supplier.product_categories || '-').split(',').map((cat) => cat.trim()).filter(Boolean).map((cat) => <Badge key={cat} tone="slate">{cat}</Badge>)}</div></td><td className="px-5 py-4"><div className="max-w-xs text-sm text-slate-700">{supplier.next_action || '-'}</div></td><td className="px-5 py-4">{supplier.payment_terms || '-'}</td><td className="px-5 py-4 text-right"><button type="button" onClick={() => deleteSupplier(supplier)} className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700">Delete</button></td></tr>)}</tbody></table></div>}
          </div>
        </div>
      </div>
    </AdminShell>
  )
}
