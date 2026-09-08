import { supplierMetrics, lineTotal, margins } from '../../../lib/pricing'
import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import AdminShell from '../../../components/AdminShell'
import { supabase } from '../../../lib/supabase'

const emptySupplierQuote = {
  costs_confirmed: false, supplier_id: '', status: 'target', response_due_at: '', material_cost: '', freight_cost: '', other_cost: '', sell_price: '', lead_time: '', compliance_status: 'unknown', domestic_status: '', quote_reference: '', quote_url: '', contact_name: '', contact_email: '', notes: '',
}

const emptyItem = {
  line_number: '', site_name: '', clin_number: '', source_item_number: '', description: '', manufacturer_description: '', quantity: '1', unit: 'EA', unit_quantity: '1', preferred_manufacturer: '', preferred_part_number: '', brand_name_or_equal: true, taa_required: false, baba_required: false, domestic_source_required: false, unit_cost: '', sell_unit_price: '', lead_time: '', compliance_notes: '',
}

function money(value) {
  if (value === null || value === undefined || value === '') return '—'
  return `$${Number(value).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

function numberOrNull(value) {
  return value === '' || value === null || value === undefined ? null : Number(value)
}

function Badge({ children, tone = 'slate' }) {
  const tones = { red: 'bg-red-50 text-red-700', amber: 'bg-amber-50 text-amber-700', blue: 'bg-blue-50 text-blue-700', green: 'bg-green-50 text-green-700', slate: 'bg-slate-100 text-slate-700' }
  return <span className={`rounded-full px-3 py-1 text-xs font-semibold ${tones[tone] || tones.slate}`}>{children}</span>
}

export default function HardwareOpportunityDetailPage() {
  const router = useRouter()
  const { id } = router.query
  const [opportunity, setOpportunity] = useState(null)
  const [suppliers, setSuppliers] = useState([])
  const [supplierQuotes, setSupplierQuotes] = useState([])
  const [items, setItems] = useState([])
  const [supplierForm, setSupplierForm] = useState(emptySupplierQuote)
  const [itemForm, setItemForm] = useState(emptyItem)
  const [siteFilter, setSiteFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')

  useEffect(() => { if (id) loadData() }, [id])

  async function loadData() {
    setLoading(true)
    const [opportunityRes, supplierRes, quoteRes, itemRes] = await Promise.all([
      supabase.from('hardware_opportunities').select('*').eq('id', id).single(),
      supabase.from('suppliers').select('*').order('name'),
      supabase.from('opportunity_supplier_quotes').select('*, suppliers(name, application_url)').eq('opportunity_id', id).order('created_at'),
      supabase.from('hardware_opportunity_items').select('*').eq('opportunity_id', id).order('line_number'),
    ])
    const failed = [opportunityRes,supplierRes,quoteRes,itemRes].find(result => result.error)
    if (failed) { setMessage('Sourcing data could not be loaded. '+failed.error.message); setLoading(false); return }
    setOpportunity(opportunityRes.data || null)
    setSuppliers(supplierRes.data || [])
    setSupplierQuotes(quoteRes.data || [])
    setItems(itemRes.data || [])
    setLoading(false)
  }

  function updateOpportunity(field, value) {
    setOpportunity((current) => ({ ...current, [field]: value }))
  }

  async function saveOpportunity(event) {
    event.preventDefault()
    const payload = {
      title: opportunity.title,
      agency: opportunity.agency,
      contracting_office: opportunity.contracting_office,
      stage: opportunity.stage,
      priority: opportunity.priority,
      response_deadline: opportunity.response_deadline || null,
      source_url: opportunity.source_url,
      scope_summary: opportunity.scope_summary,
      bidding_entity: 'Odiscom LLC',
      fit_score: numberOrNull(opportunity.fit_score),
      estimated_value: numberOrNull(opportunity.estimated_value),
      target_revenue: numberOrNull(opportunity.target_revenue),
      estimated_cost: numberOrNull(opportunity.estimated_cost),
      assigned_to: opportunity.assigned_to,
      next_action: opportunity.next_action,
      next_action_due: opportunity.next_action_due || null,
      submission_method: opportunity.submission_method,
      submission_contact: opportunity.submission_contact,
      notes: opportunity.notes,
      updated_at: new Date().toISOString(),
    }
    const { error } = await supabase.from('hardware_opportunities').update(payload).eq('id', id)
    setMessage(error ? error.message : 'Opportunity saved.')
    if (!error) loadData()
  }

  async function saveSupplierQuote(event) {
    event.preventDefault()
    const payload = {
      opportunity_id: id,
      ...supplierForm,
      response_due_at: supplierForm.response_due_at ? new Date(supplierForm.response_due_at).toISOString() : null,
      material_cost: numberOrNull(supplierForm.material_cost),
      freight_cost: numberOrNull(supplierForm.freight_cost),
      other_cost: numberOrNull(supplierForm.other_cost),
      sell_price: numberOrNull(supplierForm.sell_price),
      updated_at: new Date().toISOString(),
    }
    if (supplierForm.status === 'requested') payload.rfq_sent_at = new Date().toISOString()
    if (supplierForm.status === 'received') payload.received_at = new Date().toISOString()
    const { error } = await supabase.from('opportunity_supplier_quotes').upsert(payload, { onConflict: 'opportunity_id,supplier_id' })
    setMessage(error ? error.message : 'Supplier sourcing record saved.')
    if (!error) { setSupplierForm(emptySupplierQuote); loadData() }
  }

  async function saveItem(event) {
    event.preventDefault()
    const payload = {
      opportunity_id: id,
      ...itemForm,
      quantity: Number(itemForm.quantity),
      unit_cost: numberOrNull(itemForm.unit_cost),
      sell_unit_price: numberOrNull(itemForm.sell_unit_price),
    }
    const { error } = await supabase.from('hardware_opportunity_items').insert([payload])
    setMessage(error ? error.message : 'BOM line added.')
    if (!error) { setItemForm(emptyItem); loadData() }
  }

  async function updateSupplierQuote(quote, field, value) {
    const payload = { [field]: value, updated_at: new Date().toISOString() }
    if (field === 'status' && value === 'received' && !quote.received_at) payload.received_at = new Date().toISOString()
    if (field === 'status' && value === 'requested' && !quote.rfq_sent_at) payload.rfq_sent_at = new Date().toISOString()
    const { error } = await supabase.from('opportunity_supplier_quotes').update(payload).eq('id', quote.id)
    setMessage(error ? error.message : 'Supplier status updated.')
    if (!error) loadData()
  }

  async function deleteItem(item) {
    if (!confirm(`Delete BOM line ${item.line_number || item.description}?`)) return
    const { error } = await supabase.from('hardware_opportunity_items').delete().eq('id', item.id)
    setMessage(error ? error.message : 'BOM line deleted.')
    if (!error) loadData()
  }

  const quoteMetrics = useMemo(() => supplierQuotes.map(supplierMetrics), [supplierQuotes])

  const bestReceived = quoteMetrics.filter((quote) => quote.status === 'received' && quote.totalCost !== null).sort((a, b) => a.totalCost - b.totalCost)[0]
  const sites = useMemo(() => [...new Set(items.map((item) => item.site_name).filter(Boolean))].sort(), [items])
  const visibleItems = useMemo(() => siteFilter === 'all' ? items : items.filter((item) => item.site_name === siteFilter), [items, siteFilter])
  const unresolvedQuantities = useMemo(() => items.filter((item) => item.quantity_status !== 'verified').length, [items])

  if (loading) return <AdminShell title="Hardware Bid"><div className="rounded-3xl bg-white p-10 text-slate-600">Loading sourcing workspace...</div></AdminShell>
  if (!opportunity) return <AdminShell title="Hardware Bid"><div role="alert">{message || 'Opportunity not found.'}</div></AdminShell>

  return (
    <AdminShell title={opportunity.solicitation_number}>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 p-8 text-white shadow-sm lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-4xl"><Link href="/admin/opportunities" className="text-sm font-semibold text-blue-200">← Hardware bids</Link><h2 className="mt-3 text-3xl font-bold">{opportunity.title}</h2><p className="mt-3 text-sm text-slate-300">Offeror: <strong className="text-white">Odiscom LLC</strong> · Sourcing engine: Odiscom Supply</p></div>
          <div className="flex gap-2"><Badge tone={opportunity.priority === 'critical' ? 'red' : 'amber'}>{opportunity.priority}</Badge><Badge tone="blue">{String(opportunity.stage).replaceAll('_', ' ')}</Badge></div>
        </div>

        {message && <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800">{message}</div>}

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          <div className="rounded-3xl border bg-white p-5 shadow-sm"><div className="text-sm text-slate-500">Deadline</div><div className="mt-2 text-xl font-bold">{opportunity.response_deadline ? new Date(opportunity.response_deadline).toLocaleString() : 'Not set'}</div></div>
          <div className="rounded-3xl border bg-white p-5 shadow-sm"><div className="text-sm text-slate-500">Supplier Targets / Records</div><div className="mt-2 text-3xl font-bold text-blue-700">{supplierQuotes.length}</div></div>
          <div className="rounded-3xl border bg-white p-5 shadow-sm"><div className="text-sm text-slate-500">BOM Lines</div><div className="mt-2 text-3xl font-bold">{items.length}</div></div>
          <div className="rounded-3xl border bg-white p-5 shadow-sm"><div className="text-sm text-slate-500">Quantity Clarifications</div><div className={`mt-2 text-3xl font-bold ${unresolvedQuantities ? 'text-amber-700' : 'text-green-700'}`}>{unresolvedQuantities}</div></div>
          <div className="rounded-3xl border bg-white p-5 shadow-sm"><div className="text-sm text-slate-500">Best Received Cost</div><div className="mt-2 text-2xl font-bold text-green-700">{bestReceived ? money(bestReceived.totalCost) : '—'}</div></div>
        </div>

        <form onSubmit={saveOpportunity} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5"><h3 className="text-xl font-bold text-slate-950">Bid control</h3><p className="mt-1 text-sm text-slate-600">Deadline, value, stage, owner, and submission instructions for Odiscom LLC.</p></div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <label className="text-sm font-semibold text-slate-700">Stage<select value={opportunity.stage} onChange={(event) => updateOpportunity('stage', event.target.value)} className="mt-1 w-full rounded-xl border p-3 font-normal"><option value="discovered">Discovered</option><option value="reviewing">Reviewing</option><option value="bid_decision">Bid decision</option><option value="sourcing">Sourcing</option><option value="pricing">Pricing</option><option value="preparing">Preparing</option><option value="submitted">Submitted</option><option value="awarded">Awarded</option><option value="lost">Lost</option><option value="no_bid">No bid</option></select></label>
            <label className="text-sm font-semibold text-slate-700">Priority<select value={opportunity.priority} onChange={(event) => updateOpportunity('priority', event.target.value)} className="mt-1 w-full rounded-xl border p-3 font-normal"><option value="critical">Critical</option><option value="high">High</option><option value="normal">Normal</option><option value="low">Low</option></select></label>
            <label className="text-sm font-semibold text-slate-700">Target revenue<input type="number" step="0.01" value={opportunity.target_revenue || ''} onChange={(event) => updateOpportunity('target_revenue', event.target.value)} className="mt-1 w-full rounded-xl border p-3 font-normal" /></label>
            <label className="text-sm font-semibold text-slate-700">Estimated cost<input type="number" step="0.01" value={opportunity.estimated_cost || ''} onChange={(event) => updateOpportunity('estimated_cost', event.target.value)} className="mt-1 w-full rounded-xl border p-3 font-normal" /></label>
            <label className="text-sm font-semibold text-slate-700">Assigned to<input value={opportunity.assigned_to || ''} onChange={(event) => updateOpportunity('assigned_to', event.target.value)} className="mt-1 w-full rounded-xl border p-3 font-normal" /></label>
            <label className="text-sm font-semibold text-slate-700">Next action due<input type="date" value={opportunity.next_action_due || ''} onChange={(event) => updateOpportunity('next_action_due', event.target.value)} className="mt-1 w-full rounded-xl border p-3 font-normal" /></label>
            <label className="text-sm font-semibold text-slate-700">Submission method<input value={opportunity.submission_method || ''} onChange={(event) => updateOpportunity('submission_method', event.target.value)} className="mt-1 w-full rounded-xl border p-3 font-normal" /></label>
            <label className="text-sm font-semibold text-slate-700">Submission contact<input value={opportunity.submission_contact || ''} onChange={(event) => updateOpportunity('submission_contact', event.target.value)} className="mt-1 w-full rounded-xl border p-3 font-normal" /></label>
            <label className="text-sm font-semibold text-slate-700 md:col-span-2 xl:col-span-4">Next action<input value={opportunity.next_action || ''} onChange={(event) => updateOpportunity('next_action', event.target.value)} className="mt-1 w-full rounded-xl border p-3 font-normal" /></label>
            <label className="text-sm font-semibold text-slate-700 md:col-span-2 xl:col-span-4">Internal notes<textarea value={opportunity.notes || ''} onChange={(event) => updateOpportunity('notes', event.target.value)} rows="3" className="mt-1 w-full rounded-xl border p-3 font-normal" /></label>
          </div>
          <div className="mt-5 flex flex-wrap gap-3"><button className="rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white">Save bid control</button>{opportunity.source_url && <a href={opportunity.source_url} target="_blank" rel="noreferrer" className="rounded-xl border border-slate-300 px-5 py-3 font-semibold text-slate-700">Open official notice</a>}</div>
        </form>

        <div className="grid gap-6 xl:grid-cols-[420px_1fr]">
          <p className="text-sm text-slate-600">Statuses record staff activity; changing a status does not send an RFQ. Mark costs confirmed only after checking a supplier quote including freight and other costs.</p>
        <form onSubmit={saveSupplierQuote} className="space-y-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
<label className="block p-3 text-sm"><input type="checkbox" checked={supplierForm.costs_confirmed} onChange={e => setSupplierForm({...supplierForm,costs_confirmed:e.target.checked})} /> Material, freight, and other costs confirmed from supplier quote</label>
            <div><h3 className="text-xl font-bold text-slate-950">Add supplier to this bid</h3><p className="mt-1 text-sm text-slate-600">Record supplier RFQ status, landed cost, sell price, lead time, and compliance.</p></div>
            <select required value={supplierForm.supplier_id} onChange={(event) => setSupplierForm({ ...supplierForm, supplier_id: event.target.value })} className="w-full rounded-xl border p-3"><option value="">Select supplier</option>{suppliers.map((supplier) => <option key={supplier.id} value={supplier.id}>{supplier.name}</option>)}</select>
            <div className="grid grid-cols-2 gap-3"><select value={supplierForm.status} onChange={(event) => setSupplierForm({ ...supplierForm, status: event.target.value })} className="rounded-xl border p-3"><option value="target">Target</option><option value="requested">RFQ requested</option><option value="received">Quote received</option><option value="declined">Declined</option><option value="unresponsive">Unresponsive</option><option value="selected">Selected</option></select><select value={supplierForm.compliance_status} onChange={(event) => setSupplierForm({ ...supplierForm, compliance_status: event.target.value })} className="rounded-xl border p-3"><option value="unknown">Compliance unknown</option><option value="reviewing">Reviewing</option><option value="compliant">Compliant</option><option value="exceptions">Exceptions</option><option value="noncompliant">Noncompliant</option></select></div>
            <label className="block text-sm font-semibold text-slate-700">Supplier response due<input type="datetime-local" value={supplierForm.response_due_at} onChange={(event) => setSupplierForm({ ...supplierForm, response_due_at: event.target.value })} className="mt-1 w-full rounded-xl border p-3 font-normal" /></label>
            <div className="grid grid-cols-2 gap-3"><input type="number" step="0.01" value={supplierForm.material_cost} onChange={(event) => setSupplierForm({ ...supplierForm, material_cost: event.target.value })} placeholder="Material cost" className="rounded-xl border p-3" /><input type="number" step="0.01" value={supplierForm.freight_cost} onChange={(event) => setSupplierForm({ ...supplierForm, freight_cost: event.target.value })} placeholder="Freight" className="rounded-xl border p-3" /></div>
            <div className="grid grid-cols-2 gap-3"><input type="number" step="0.01" value={supplierForm.other_cost} onChange={(event) => setSupplierForm({ ...supplierForm, other_cost: event.target.value })} placeholder="Other cost" className="rounded-xl border p-3" /><input type="number" step="0.01" value={supplierForm.sell_price} onChange={(event) => setSupplierForm({ ...supplierForm, sell_price: event.target.value })} placeholder="Odiscom sell price" className="rounded-xl border p-3" /></div>
            <input value={supplierForm.lead_time} onChange={(event) => setSupplierForm({ ...supplierForm, lead_time: event.target.value })} placeholder="Lead time / availability" className="w-full rounded-xl border p-3" />
            <input value={supplierForm.domestic_status} onChange={(event) => setSupplierForm({ ...supplierForm, domestic_status: event.target.value })} placeholder="TAA / BABA / country-of-origin status" className="w-full rounded-xl border p-3" />
            <input value={supplierForm.quote_reference} onChange={(event) => setSupplierForm({ ...supplierForm, quote_reference: event.target.value })} placeholder="Supplier quote number" className="w-full rounded-xl border p-3" />
            <textarea value={supplierForm.notes} onChange={(event) => setSupplierForm({ ...supplierForm, notes: event.target.value })} placeholder="Exceptions, freight assumptions, substitutions, contact notes..." rows="4" className="w-full rounded-xl border p-3" />
            <button className="w-full rounded-xl bg-blue-600 py-3 font-semibold text-white">Save supplier sourcing record</button>
          </form>

          <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b p-5"><h3 className="font-bold text-slate-950">Supplier pricing matrix</h3><p className="mt-1 text-sm text-slate-500">Compare landed acquisition cost, proposed sell price, gross profit, margin, and compliance.</p></div>
            <div className="overflow-x-auto"><table className="min-w-full text-sm"><thead className="bg-slate-50 text-slate-600"><tr><th className="px-4 py-3 text-left">Supplier</th><th className="px-4 py-3 text-left">Status</th><th className="px-4 py-3 text-right">Landed cost</th><th className="px-4 py-3 text-right">Sell price</th><th className="px-4 py-3 text-right">GP / Margin</th><th className="px-4 py-3 text-left">Compliance</th></tr></thead><tbody>{quoteMetrics.length === 0 && <tr><td colSpan="6" className="p-10 text-center text-slate-500">No suppliers linked yet.</td></tr>}{quoteMetrics.map((quote) => <tr key={quote.id} className="border-t align-top"><td className="px-4 py-4"><div className="font-semibold text-slate-950">{quote.suppliers?.name}</div><div className="mt-1 text-xs text-slate-500">{quote.lead_time || 'Lead time not recorded'}</div></td><td className="px-4 py-4"><select value={quote.status} onChange={(event) => updateSupplierQuote(quote, 'status', event.target.value)} className="rounded-lg border p-2 text-xs"><option value="target">Target</option><option value="requested">Requested</option><option value="received">Received</option><option value="declined">Declined</option><option value="unresponsive">Unresponsive</option><option value="selected">Selected</option></select></td><td className="px-4 py-4 text-right font-semibold">{money(quote.totalCost)}</td><td className="px-4 py-4 text-right">{money(quote.sell_price)}</td><td className="px-4 py-4 text-right"><div className={quote.grossProfit > 0 ? 'font-bold text-green-700' : 'font-bold text-slate-600'}>{quote.sell_price ? money(quote.grossProfit) : '—'}</div><div className="text-xs text-slate-500">{quote.sell_price ? `${quote.margin == null ? 'Not established' : quote.margin.toFixed(1)}%` : ''}</div></td><td className="px-4 py-4"><Badge tone={quote.compliance_status === 'compliant' ? 'green' : quote.compliance_status === 'noncompliant' ? 'red' : 'amber'}>{quote.compliance_status}</Badge><div className="mt-2 max-w-xs text-xs text-slate-500">{quote.domestic_status || ''}</div></td></tr>)}</tbody></table></div>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[420px_1fr]">
          <form onSubmit={saveItem} className="space-y-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div><h3 className="text-xl font-bold text-slate-950">Add BOM line</h3><p className="mt-1 text-sm text-slate-600">Capture the exact manufacturer, part number, quantity, compliance, cost, and bid price.</p></div>
            <div className="grid grid-cols-2 gap-3"><input value={itemForm.site_name} onChange={(event) => setItemForm({ ...itemForm, site_name: event.target.value })} placeholder="Site" className="rounded-xl border p-3" /><input value={itemForm.clin_number} onChange={(event) => setItemForm({ ...itemForm, clin_number: event.target.value })} placeholder="CLIN" className="rounded-xl border p-3" /></div>
            <div className="grid grid-cols-3 gap-3"><input value={itemForm.line_number} onChange={(event) => setItemForm({ ...itemForm, line_number: event.target.value })} placeholder="Line" className="rounded-xl border p-3" /><input required type="number" min="0.001" step="0.001" value={itemForm.quantity} onChange={(event) => setItemForm({ ...itemForm, quantity: event.target.value })} placeholder="Qty" className="rounded-xl border p-3" /><input value={itemForm.unit} onChange={(event) => setItemForm({ ...itemForm, unit: event.target.value })} placeholder="Unit" className="rounded-xl border p-3" /></div>
            <textarea required value={itemForm.description} onChange={(event) => setItemForm({ ...itemForm, description: event.target.value })} placeholder="Item description" rows="3" className="w-full rounded-xl border p-3" />
            <div className="grid grid-cols-2 gap-3"><input value={itemForm.preferred_manufacturer} onChange={(event) => setItemForm({ ...itemForm, preferred_manufacturer: event.target.value })} placeholder="Manufacturer" className="rounded-xl border p-3" /><input value={itemForm.preferred_part_number} onChange={(event) => setItemForm({ ...itemForm, preferred_part_number: event.target.value })} placeholder="Part number" className="rounded-xl border p-3" /></div>
            <div className="grid grid-cols-2 gap-3"><input type="number" step="0.0001" value={itemForm.unit_cost} onChange={(event) => setItemForm({ ...itemForm, unit_cost: event.target.value })} placeholder="Unit cost" className="rounded-xl border p-3" /><input type="number" step="0.0001" value={itemForm.sell_unit_price} onChange={(event) => setItemForm({ ...itemForm, sell_unit_price: event.target.value })} placeholder="Sell unit price" className="rounded-xl border p-3" /></div>
            <div className="grid grid-cols-2 gap-3 text-sm"><label className="flex items-center gap-2"><input type="checkbox" checked={itemForm.taa_required} onChange={(event) => setItemForm({ ...itemForm, taa_required: event.target.checked })} /> TAA required</label><label className="flex items-center gap-2"><input type="checkbox" checked={itemForm.baba_required} onChange={(event) => setItemForm({ ...itemForm, baba_required: event.target.checked })} /> BABA required</label><label className="flex items-center gap-2"><input type="checkbox" checked={itemForm.domestic_source_required} onChange={(event) => setItemForm({ ...itemForm, domestic_source_required: event.target.checked })} /> Domestic source</label><label className="flex items-center gap-2"><input type="checkbox" checked={itemForm.brand_name_or_equal} onChange={(event) => setItemForm({ ...itemForm, brand_name_or_equal: event.target.checked })} /> Brand name or equal</label></div>
            <button className="w-full rounded-xl bg-slate-950 py-3 font-semibold text-white">Add BOM line</button>
          </form>

          <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="flex flex-col gap-3 border-b p-5 sm:flex-row sm:items-end sm:justify-between"><div><h3 className="font-bold text-slate-950">Bid BOM and pricing</h3><p className="mt-1 text-sm text-slate-500">Line-item pricing basis for the Odiscom LLC submission.</p></div><label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Site<select value={siteFilter} onChange={(event) => setSiteFilter(event.target.value)} className="mt-1 block min-w-64 rounded-xl border p-2 text-sm font-normal normal-case text-slate-800"><option value="all">All sites ({items.length})</option>{sites.map((site) => <option key={site} value={site}>{site} ({items.filter((item) => item.site_name === site).length})</option>)}</select></label></div>
            <div className="overflow-x-auto"><table className="min-w-full text-sm"><thead className="bg-slate-50 text-slate-600"><tr><th className="px-4 py-3 text-left">Site / Line</th><th className="px-4 py-3 text-left">Requirement</th><th className="px-4 py-3 text-right">Qty</th><th className="px-4 py-3 text-right">Unit cost</th><th className="px-4 py-3 text-right">Sell price</th><th className="px-4 py-3 text-right">Extended GP</th><th className="px-4 py-3"></th></tr></thead><tbody>{visibleItems.length === 0 && <tr><td colSpan="7" className="p-10 text-center text-slate-500">No BOM lines entered yet.</td></tr>}{visibleItems.map((item) => { const gp = Number(item.quantity) * (Number(item.sell_unit_price || 0) - Number(item.unit_cost || 0)); return <tr key={item.id} className={`border-t align-top ${item.quantity_status !== 'verified' ? 'bg-amber-50' : ''}`}><td className="px-4 py-4"><div className="font-semibold text-slate-900">{item.site_name || 'Unassigned site'}</div><div className="mt-1 font-mono text-xs text-blue-700">{item.clin_number ? `CLIN ${item.clin_number} · ` : ''}{item.source_item_number || item.line_number || '—'}</div></td><td className="px-4 py-4"><div className="max-w-md font-semibold text-slate-950">{item.description}</div><div className="mt-1 max-w-xl text-xs text-slate-600">{item.manufacturer_description}</div><div className="mt-1 text-xs text-slate-500">{[item.preferred_manufacturer, item.preferred_part_number].filter(Boolean).join(' · ')}</div><div className="mt-2 flex flex-wrap gap-1">{item.quantity_status !== 'verified' && <Badge tone="amber">Quantity clarification</Badge>}{item.taa_required && <Badge tone="amber">TAA</Badge>}{item.baba_required && <Badge tone="amber">BABA</Badge>}{item.domestic_source_required && <Badge tone="amber">Domestic</Badge>}</div></td><td className="px-4 py-4 text-right">{item.quantity ?? 'TBD'} {item.unit}</td><td className="px-4 py-4 text-right">{money(item.unit_cost)}</td><td className="px-4 py-4 text-right">{money(item.sell_unit_price)}</td><td className="px-4 py-4 text-right font-bold text-green-700">{item.sell_unit_price ? money(gp) : '—'}</td><td className="px-4 py-4 text-right"><button type="button" onClick={() => deleteItem(item)} className="text-xs font-semibold text-red-700">Delete</button></td></tr> })}</tbody></table></div>
          </div>
        </div>
      </div>
    </AdminShell>
  )
}
