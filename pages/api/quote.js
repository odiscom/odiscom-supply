import { supabase } from '../../lib/supabase'
import nodemailer from 'nodemailer'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method not allowed' })

  const { name, company, email, phone, details } = req.body
  const quoteId = `OSQ-${Date.now()}`

  const { error } = await supabase.from('quotes').insert([{ quote_id: quoteId, name, company, email, phone, details, status: 'pending' }])
  if (error) return res.status(500).json({ success: false, error: error.message })

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
      text: `Company: ${company}\nName: ${name}\nEmail: ${email}\nPhone: ${phone}\n\nDetails:\n${details}`
    })
    await transporter.sendMail({
      from: `Odiscom Supply <${process.env.SMTP_USER}>`,
      to: email,
      subject: `Quote Request Received (${quoteId})`,
      text: `Thanks for your request. Your quote ID is ${quoteId}. We will contact you shortly.`
    })
  }

  return res.status(200).json({ success: true, quoteId })
}
