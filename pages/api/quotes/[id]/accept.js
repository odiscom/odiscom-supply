import { supabase } from '../../../../lib/supabase'
import nodemailer from 'nodemailer'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ success: false, message: 'Method not allowed' })

  const { id } = req.query

  const { data: quote, error: quoteError } = await supabase.from('quotes').select('*').eq('id', id).single()
  if (quoteError || !quote) return res.status(404).json({ success: false, message: 'Quote not found' })

  const { data: items } = await supabase.from('quote_items').select('*').eq('quote_id', id)
  const total = (items || []).reduce((sum, item) => sum + Number(item.total_price || 0), 0)
  const estimatedCost = (items || []).reduce((sum, item) => sum + Number(item.quantity || 0) * Number(item.unit_cost || 0), 0)
  const grossMargin = total - estimatedCost

  const { data: order, error: orderError } = await supabase.from('orders').insert([{
    quote_id: id,
    order_number: `ORD-${Date.now()}`,
    company: quote.company,
    contact_name: quote.name,
    email: quote.email,
    phone: quote.phone,
    total,
    status: 'new'
  }]).select().single()

  if (orderError) return res.status(500).json({ success: false, message: orderError.message })

  if (items?.length) {
    await supabase.from('order_items').insert(items.map(item => ({
      order_id: order.id,
      product_name: item.product_name,
      quantity: item.quantity,
      unit_price: item.unit_price,
      unit_cost: item.unit_cost || 0,
      supplier_name: item.supplier_name || null,
      total_price: item.total_price
    })))
  }

  await supabase.from('quotes').update({ status: 'accepted' }).eq('id', id)

  if (process.env.SMTP_HOST && process.env.NOTIFY_EMAIL) {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: false,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    })
    await transporter.sendMail({
      from: `Odiscom Supply <${process.env.SMTP_USER}>`,
      to: process.env.NOTIFY_EMAIL,
      subject: `New Accepted Order: ${order.order_number}`,
      text: `A quote has been accepted and converted to an order.\n\nOrder: ${order.order_number}\nCompany: ${order.company}\nTotal: $${total.toFixed(2)}\nEstimated Cost: $${estimatedCost.toFixed(2)}\nGross Margin: $${grossMargin.toFixed(2)}`
    })
  }

  return res.status(200).json({ success: true, orderId: order.id, orderNumber: order.order_number, total, estimatedCost, grossMargin })
}
