import { createSupabaseAdmin } from '../../lib/supabaseAdmin'
import nodemailer from 'nodemailer'

function buildItemSummary(items = []) {
  if (!items.length) return 'No catalog items selected.'
  return items
    .map((item) => `- ${item.product_name || item.name} | Qty: ${item.quantity || 1} ${item.unit || ''}${item.notes ? ` | Notes: ${item.notes}` : ''}`)
    .join('\n')
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ success: false, message: 'Method not allowed' })

  const { name, company, email, phone, details, selectedItems = [] } = req.body

  if (!name || !company || !email) {
    return res.status(400).json({ success: false, message: 'Name, company, and email are required.' })
  }

  const quoteId = `OSQ-${Date.now()}`
  const supabase = createSupabaseAdmin()
  const itemSummary = buildItemSummary(selectedItems)
  const quoteDetails = `${details || ''}\n\nRequested Catalog Items:\n${itemSummary}`.trim()

  const { data: quote, error } = await supabase
    .from('quotes')
    .insert([{ quote_id: quoteId, name, company, email, phone, details: quoteDetails, status: 'pending', source: 'website_catalog' }])
    .select()
    .single()

  if (error) return res.status(500).json({ success: false, error: error.message })

  const validItems = (selectedItems || []).filter((item) => Number(item.quantity || 0) > 0)

  if (validItems.length) {
    const { error: itemError } = await supabase.from('quote_items').insert(
      validItems.map((item) => ({
        quote_id: quote.id,
        product_slug: item.product_slug || item.slug || item.product_id || item.id || 'catalog-item',
        product_name: item.product_name || item.name || 'Catalog Item',
        quantity: Number(item.quantity || 1),
        unit: item.unit || 'each',
        unit_price: 0,
        unit_cost: 0,
        supplier_name: null,
        notes: item.notes || null,
      }))
    )

    if (itemError) return res.status(500).json({ success: false, error: itemError.message })
  }

  if (process.env.SMTP_HOST) {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: false,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
    })
    await transporter.sendMail({
      from: `Odiscom Supply <${process.env.SMTP_USER}>`,
      to: process.env.NOTIFY_EMAIL,
      subject: `New Quote Request: ${quoteId}`,
      text: `Company: ${company}\nName: ${name}\nEmail: ${email}\nPhone: ${phone || 'N/A'}\n\nDetails:\n${quoteDetails}`
    })
    await transporter.sendMail({
      from: `Odiscom Supply <${process.env.SMTP_USER}>`,
      to: email,
      subject: `Quote Request Received (${quoteId})`,
      text: `Thanks for your request. Your quote ID is ${quoteId}. We will review the selected materials and contact you shortly.`
    })
  }

  return res.status(200).json({ success: true, quoteId })
}
