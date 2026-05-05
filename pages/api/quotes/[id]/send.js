import nodemailer from 'nodemailer'
import { supabase } from '../../../../lib/supabase'
import { buildProfessionalQuotePdf } from '../../../../lib/quotePdf'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ success: false, message: 'Method not allowed' })

  const { id } = req.query
  const { data: quote, error: quoteError } = await supabase.from('quotes').select('*').eq('id', id).single()
  if (quoteError || !quote) return res.status(404).json({ success: false, message: 'Quote not found' })

  const { data: items, error: itemsError } = await supabase.from('quote_items').select('*').eq('quote_id', id)
  if (itemsError) return res.status(500).json({ success: false, message: itemsError.message })
  if (!process.env.SMTP_HOST) return res.status(500).json({ success: false, message: 'SMTP is not configured' })

  const pdfBuffer = await buildProfessionalQuotePdf(quote, items || [])
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  const acceptLink = `${siteUrl}/quote/accept/${id}`

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: false,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  })

  await transporter.sendMail({
    from: `Odiscom Supply <${process.env.SMTP_USER}>`,
    to: quote.email,
    cc: process.env.NOTIFY_EMAIL || undefined,
    subject: `Odiscom Supply Quote ${quote.quote_id}`,
    text: `Hello ${quote.name},\n\nAttached is your quote ${quote.quote_id}.\n\nTo approve and begin fulfillment, click below:\n${acceptLink}\n\nThank you,\nOdiscom Supply`,
    attachments: [{ filename: `quote-${quote.quote_id}.pdf`, content: pdfBuffer, contentType: 'application/pdf' }]
  })

  await supabase.from('quotes').update({ status: 'quoted' }).eq('id', id)
  return res.status(200).json({ success: true, message: 'Quote PDF sent' })
}
