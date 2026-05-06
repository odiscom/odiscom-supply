import { useEffect, useState } from 'react'
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
}

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState([])
  const [form, setForm] = useState(emptySupplier)
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')

  useEffect(() => {
    loadSuppliers()
  }, [])

  async function loadSuppliers() {
    const { data, error } = await supabase
      .from('suppliers')
      .select('*')
      .order('created_at', { ascending: false })

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

  return (
    <AdminShell title="Suppliers">
      <div className="grid lg:grid-cols-3 gap-6">
        <form onSubmit={saveSupplier} className="bg-white rounded-xl shadow border p-6 space-y-4 lg:col-span-1">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Add Supplier</h2>
            <p className="text-sm text-gray-500 mt-1">Track cable, connectors, tools, splicers, trailers, and infrastructure vendors.</p>
          </div>

          {message && <div className="bg-blue-50 border border-blue-200 text-blue-800 rounded-lg p-3 text-sm">{message}</div>}

          <input required value={form.name} onChange={(e) => updateField('name', e.target.value)} placeholder="Supplier name" className="w-full border rounded-lg p-3" />
          <input value={form.contact_name} onChange={(e) => updateField('contact_name', e.target.value)} placeholder="Contact name" className="w-full border rounded-lg p-3" />
          <input type="email" value={form.email} onChange={(e) => updateField('email', e.target.value)} placeholder="Email" className="w-full border rounded-lg p-3" />
          <input value={form.phone} onChange={(e) => updateField('phone', e.target.value)} placeholder="Phone" className="w-full border rounded-lg p-3" />
          <input value={form.website} onChange={(e) => updateField('website', e.target.value)} placeholder="Website" className="w-full border rounded-lg p-3" />
          <input value={form.product_categories} onChange={(e) => updateField('product_categories', e.target.value)} placeholder="Product categories" className="w-full border rounded-lg p-3" />
          <div className="grid grid-cols-2 gap-3">
            <input value={form.payment_terms} onChange={(e) => updateField('payment_terms', e.target.value)} placeholder="Terms" className="w-full border rounded-lg p-3" />
            <input value={form.lead_time} onChange={(e) => updateField('lead_time', e.target.value)} placeholder="Lead time" className="w-full border rounded-lg p-3" />
          </div>
          <textarea value={form.notes} onChange={(e) => updateField('notes', e.target.value)} placeholder="Notes" rows="4" className="w-full border rounded-lg p-3" />
          <button className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-lg py-3 font-semibold">Add Supplier</button>
        </form>

        <div className="lg:col-span-2 bg-white rounded-xl shadow border overflow-hidden">
          <div className="px-6 py-4 border-b">
            <h2 className="font-bold text-slate-900">Supplier Directory</h2>
            <p className="text-sm text-gray-500">Internal vendor database for sourcing, pricing, and lead-time tracking.</p>
          </div>

          {loading ? (
            <div className="p-8 text-gray-600">Loading suppliers...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-100 text-gray-700">
                  <tr>
                    <th className="text-left px-4 py-3">Supplier</th>
                    <th className="text-left px-4 py-3">Contact</th>
                    <th className="text-left px-4 py-3">Categories</th>
                    <th className="text-left px-4 py-3">Terms</th>
                    <th className="text-left px-4 py-3">Lead Time</th>
                  </tr>
                </thead>
                <tbody>
                  {suppliers.length === 0 && <tr><td colSpan="5" className="text-center p-8 text-gray-500">No suppliers yet.</td></tr>}
                  {suppliers.map((supplier) => (
                    <tr key={supplier.id} className="border-t hover:bg-gray-50 align-top">
                      <td className="px-4 py-4">
                        <div className="font-semibold text-slate-900">{supplier.name}</div>
                        <div className="text-xs text-gray-500">{supplier.website || ''}</div>
                      </td>
                      <td className="px-4 py-4">
                        <div>{supplier.contact_name || '-'}</div>
                        <div className="text-xs text-gray-500">{supplier.email || ''}</div>
                        <div className="text-xs text-gray-500">{supplier.phone || ''}</div>
                      </td>
                      <td className="px-4 py-4">{supplier.product_categories || '-'}</td>
                      <td className="px-4 py-4">{supplier.payment_terms || '-'}</td>
                      <td className="px-4 py-4">{supplier.lead_time || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AdminShell>
  )
}
