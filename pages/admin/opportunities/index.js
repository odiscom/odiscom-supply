import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import AdminShell from '../../../components/AdminShell'
import { supabase } from '../../../lib/supabase'
import { recordTotal, margins } from '../../../lib/pricing'

const emptyOpportunity = {
  solicitation_number: '',
  title: '',
  agency: '',
  contracting_office: '',
  notice_type: 'Request for Quote',
  naics: '',
  psc: '',
  set_aside: '',
  response_deadline: '',
  source_url: '',
  delivery_locations: '',
  scope_summary: '',
  bidding_entity: 'Odiscom LLC',
  stage: 'discovered',
  priority: 'normal',
  fit_score: '',
  estimated_value: '',
  target_revenue: '',
  estimated_cost: '',
  assigned_to: 'Jeff Johnson',
  next_action: '',
  next_action_due: '',
  submission_method: '',
  submission_contact: '',
  notes: '',
}

const closedStages = new Set(['awarded', 'lost', 'no_bid'])

function money(value) {
  if (value === null || value === undefined || value === '') return '—'
  return `$${Number(value).toLocaleString('en-US', { maximumFractionDigits: 0 })}`
}

function Badge({ children, tone = 'slate' }) {
  const tones = {
    red: 'bg-red-50 text-red-700',
    amber: 'bg-amber-50 text-amber-700',
    blue: 'bg-blue-50 text-blue-700',
    green: 'bg-green-50 text-green-700',
    slate: 'bg-slate-100 text-slate-700',
  }
  return <span className={`rounded-full px-3 py-1 text-xs font-semibold ${tones[tone] || tones.slate}`}>{children}</span>
}

export default function HardwareOpportunitiesPage() {
  const [opportunities, setOpportunities] = useState([])
  const [form, setForm] = useState(emptyOpportunity)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [loadError, setLoadError] = useState('')
  const [search, setSearch] = useState('')
  const [stageFilter, setStageFilter] = useState('active')

  useEffect(() => { loadOpportunities() }, [])

  async function loadOpportunities() {
    setLoading(true)
    setLoadError('')
    const { data, error } = await supabase
      .from('hardware_opportunities')
      .select('*')
      .order('response_deadline', { ascending: true, nullsFirst: false })
    if (error) { setLoadError('Hardware opportunities could not be loaded. Totals are unavailable.'); setLoading(false); return }
    setOpportunities(data || [])
    setLoading(false)
  }

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }))
  }

  async function saveOpportunity(event) {
    event.preventDefault()
    setSaving(true)
    setMessage('')
    const payload = {
      ...form,
      fit_score: form.fit_score === '' ? null : Number(form.fit_score),
      estimated_value: form.estimated_value === '' ? null : Number(form.estimated_value),
      target_revenue: form.target_revenue === '' ? null : Number(form.target_revenue),
      estimated_cost: form.estimated_cost === '' ? null : Number(form.estimated_cost),
      response_deadline: form.response_deadline ? new Date(form.response_deadline).toISOString() : null,
      next_action_due: form.next_action_due || null,
    }
    const { error } = await supabase.from('hardware_opportunities').insert([payload])
    if (error) {
      setMessage(error.message)
    } else {
      setForm(emptyOpportunity)
      setMessage('Hardware opportunity added for Odiscom LLC.')
      await loadOpportunities()
    }
    setSaving(false)
  }

  const filtered = useMemo(() => {
    const query = search.toLowerCase().trim()
    return opportunities.filter((opportunity) => {
      const stageMatch = stageFilter === 'all'
        || (stageFilter === 'active' && !closedStages.has(opportunity.stage))
        || opportunity.stage === stageFilter
      const searchMatch = !query || [
        opportunity.solicitation_number,
        opportunity.title,
        opportunity.agency,
        opportunity.scope_summary,
        opportunity.naics,
        opportunity.psc,
      ].join(' ').toLowerCase().includes(query)
      return stageMatch && searchMatch
    })
  }, [opportunities, search, stageFilter])

  const active = opportunities.filter((item) => !closedStages.has(item.stage))
  const critical = active.filter((item) => item.priority === 'critical').length
  const sourcing = active.filter((item) => ['sourcing', 'pricing'].includes(item.stage)).length
  const targetRevenue = recordTotal(active, 'target_revenue')
  const targetCost = recordTotal(active, 'estimated_cost')

  if (loading || loadError) return <AdminShell title="Hardware Bids"><div role={loadError ? 'alert' : 'status'}>{loadError || 'Loading hardware opportunities...'}</div></AdminShell>

  return (
    <AdminShell title="Hardware Bids">
      <div className="space-y-6">
        <div className="rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 p-8 text-white shadow-sm">
          <div className="max-w-4xl">
            <div className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-blue-200">Odiscom LLC Government Sales Pipeline</div>
            <h2 className="text-3xl font-bold">Turn government hardware requirements into sourced, priced, compliant bids.</h2>
            <p className="mt-3 text-sm leading-6 text-slate-300">Odiscom Supply manages supplier outreach and acquisition pricing. Odiscom LLC remains the offeror shown on the government submission.</p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          <div className="rounded-3xl border bg-white p-5 shadow-sm"><div className="text-sm text-slate-500">Active Pursuits</div><div className="mt-2 text-3xl font-bold">{active.length}</div></div>
          <div className="rounded-3xl border bg-white p-5 shadow-sm"><div className="text-sm text-slate-500">Critical</div><div className="mt-2 text-3xl font-bold text-red-700">{critical}</div></div>
          <div className="rounded-3xl border bg-white p-5 shadow-sm"><div className="text-sm text-slate-500">In Sourcing</div><div className="mt-2 text-3xl font-bold text-amber-700">{sourcing}</div></div>
          <div className="rounded-3xl border bg-white p-5 shadow-sm"><div className="text-sm text-slate-500">Target Revenue</div><div className="mt-2 text-3xl font-bold text-blue-700">{money(targetRevenue)}</div></div>
          <div className="rounded-3xl border bg-white p-5 shadow-sm"><div className="text-sm text-slate-500">Target Gross Profit</div><div className="mt-2 text-3xl font-bold text-green-700">{money(margins(targetRevenue, targetCost).grossProfit)}</div><div className="mt-1 text-xs text-slate-500">Requires revenue and cost estimates for every active pursuit.</div></div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="grid gap-3 md:grid-cols-[1fr_220px]">
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search solicitation, agency, NAICS, PSC, or scope..." className="rounded-2xl border bg-slate-50 px-4 py-3 text-sm" />
            <select value={stageFilter} onChange={(event) => setStageFilter(event.target.value)} className="rounded-2xl border bg-slate-50 px-4 py-3 text-sm">
              <option value="active">All active stages</option><option value="all">All records</option><option value="reviewing">Reviewing</option><option value="bid_decision">Bid decision</option><option value="sourcing">Sourcing</option><option value="pricing">Pricing</option><option value="preparing">Preparing</option><option value="submitted">Submitted</option><option value="awarded">Awarded</option><option value="no_bid">No bid</option>
            </select>
          </div>
        </div>

        {message && <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800">{message}</div>}

        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          {loading ? <div className="p-10 text-slate-600">Loading hardware opportunities...</div> : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-slate-50 text-slate-600"><tr><th className="px-5 py-4 text-left">Solicitation</th><th className="px-5 py-4 text-left">Agency / Scope</th><th className="px-5 py-4 text-left">Stage</th><th className="px-5 py-4 text-left">Deadline</th><th className="px-5 py-4 text-right">Target</th><th className="px-5 py-4 text-right">Action</th></tr></thead>
                <tbody>
                  {filtered.length === 0 && <tr><td colSpan="6" className="p-10 text-center text-slate-500">No hardware opportunities found.</td></tr>}
                  {filtered.map((opportunity) => {
                    const deadline = opportunity.response_deadline ? new Date(opportunity.response_deadline) : null
                    const tone = opportunity.priority === 'critical' ? 'red' : opportunity.priority === 'high' ? 'amber' : 'slate'
                    return <tr key={opportunity.id} className="border-t align-top hover:bg-slate-50">
                      <td className="px-5 py-4"><div className="font-mono font-bold text-blue-700">{opportunity.solicitation_number}</div><div className="mt-2"><Badge tone={tone}>{opportunity.priority}</Badge></div><div className="mt-2 text-xs text-slate-500">{opportunity.naics ? `NAICS ${opportunity.naics}` : ''}{opportunity.psc ? ` · PSC ${opportunity.psc}` : ''}</div></td>
                      <td className="px-5 py-4"><div className="max-w-xl font-semibold text-slate-950">{opportunity.title}</div><div className="mt-1 text-xs text-slate-500">{opportunity.agency}</div><div className="mt-2 max-w-xl text-xs leading-5 text-slate-600">{opportunity.scope_summary}</div></td>
                      <td className="px-5 py-4"><Badge tone="blue">{String(opportunity.stage).replaceAll('_', ' ')}</Badge><div className="mt-3 max-w-xs text-xs text-slate-600">{opportunity.next_action || 'No next action recorded.'}</div></td>
                      <td className="px-5 py-4"><div className="font-semibold text-slate-950">{deadline ? deadline.toLocaleDateString() : '—'}</div><div className="mt-1 text-xs text-slate-500">{deadline ? deadline.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', timeZoneName: 'short' }) : ''}</div></td>
                      <td className="px-5 py-4 text-right"><div className="font-bold text-slate-950">{money(opportunity.target_revenue)}</div><div className="mt-1 text-xs text-slate-500">Cost {money(opportunity.estimated_cost)}</div></td>
                      <td className="px-5 py-4 text-right"><Link href={`/admin/opportunities/${opportunity.id}`} className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700">Source & price</Link></td>
                    </tr>
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <details className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <summary className="cursor-pointer text-lg font-bold text-slate-950">Add another hardware opportunity</summary>
          <form onSubmit={saveOpportunity} className="mt-6 grid gap-4 md:grid-cols-2">
            <label className="text-sm font-semibold text-slate-700">Solicitation number<input required value={form.solicitation_number} onChange={(event) => updateField('solicitation_number', event.target.value)} className="mt-1 w-full rounded-xl border p-3 font-normal" /></label>
            <label className="text-sm font-semibold text-slate-700">Title<input required value={form.title} onChange={(event) => updateField('title', event.target.value)} className="mt-1 w-full rounded-xl border p-3 font-normal" /></label>
            <label className="text-sm font-semibold text-slate-700">Agency<input value={form.agency} onChange={(event) => updateField('agency', event.target.value)} className="mt-1 w-full rounded-xl border p-3 font-normal" /></label>
            <label className="text-sm font-semibold text-slate-700">Contracting office<input value={form.contracting_office} onChange={(event) => updateField('contracting_office', event.target.value)} className="mt-1 w-full rounded-xl border p-3 font-normal" /></label>
            <label className="text-sm font-semibold text-slate-700">Response deadline<input type="datetime-local" value={form.response_deadline} onChange={(event) => updateField('response_deadline', event.target.value)} className="mt-1 w-full rounded-xl border p-3 font-normal" /></label>
            <label className="text-sm font-semibold text-slate-700">Official source URL<input value={form.source_url} onChange={(event) => updateField('source_url', event.target.value)} className="mt-1 w-full rounded-xl border p-3 font-normal" /></label>
            <label className="text-sm font-semibold text-slate-700">NAICS<input value={form.naics} onChange={(event) => updateField('naics', event.target.value)} className="mt-1 w-full rounded-xl border p-3 font-normal" /></label>
            <label className="text-sm font-semibold text-slate-700">PSC<input value={form.psc} onChange={(event) => updateField('psc', event.target.value)} className="mt-1 w-full rounded-xl border p-3 font-normal" /></label>
            <label className="text-sm font-semibold text-slate-700">Priority<select value={form.priority} onChange={(event) => updateField('priority', event.target.value)} className="mt-1 w-full rounded-xl border p-3 font-normal"><option value="critical">Critical</option><option value="high">High</option><option value="normal">Normal</option><option value="low">Low</option></select></label>
            <label className="text-sm font-semibold text-slate-700">Stage<select value={form.stage} onChange={(event) => updateField('stage', event.target.value)} className="mt-1 w-full rounded-xl border p-3 font-normal"><option value="discovered">Discovered</option><option value="reviewing">Reviewing</option><option value="bid_decision">Bid decision</option><option value="sourcing">Sourcing</option><option value="pricing">Pricing</option><option value="preparing">Preparing</option></select></label>
            <label className="text-sm font-semibold text-slate-700">Fit score<input type="number" min="0" max="100" value={form.fit_score} onChange={(event) => updateField('fit_score', event.target.value)} className="mt-1 w-full rounded-xl border p-3 font-normal" /></label>
            <label className="text-sm font-semibold text-slate-700">Set-aside<input value={form.set_aside} onChange={(event) => updateField('set_aside', event.target.value)} className="mt-1 w-full rounded-xl border p-3 font-normal" /></label>
            <label className="text-sm font-semibold text-slate-700 md:col-span-2">Scope summary<textarea value={form.scope_summary} onChange={(event) => updateField('scope_summary', event.target.value)} rows="4" className="mt-1 w-full rounded-xl border p-3 font-normal" /></label>
            <label className="text-sm font-semibold text-slate-700 md:col-span-2">Next action<input value={form.next_action} onChange={(event) => updateField('next_action', event.target.value)} className="mt-1 w-full rounded-xl border p-3 font-normal" /></label>
            <div className="md:col-span-2"><button disabled={saving} className="rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white disabled:opacity-60">{saving ? 'Saving...' : 'Add opportunity'}</button></div>
          </form>
        </details>
      </div>
    </AdminShell>
  )
}
