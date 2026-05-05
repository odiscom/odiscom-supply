import { supabase } from '../../../../lib/supabase'
import { buildProfessionalQuotePdf } from '../../../../lib/quotePdf'

export default async function handler(req, res) {
  const { id } = req.query

  const { data: quote, error } = await supabase.from('quotes').select('*').eq('id', id).single()
  if (error || !quote) return res.status(404).json({ success: false, message: 'Quote not found' })

  const { data: items } = await supabase.from('quote_items').select('*').eq('quote_id', id)
  const buffer = await buildProfessionalQuotePdf(quote, items || [])

  res.setHeader('Content-Type', 'application/pdf')
  res.setHeader('Content-Disposition', `inline; filename=quote-${quote.quote_id}.pdf`)
  res.send(buffer)
}
