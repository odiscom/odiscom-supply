import { supabase } from '../../lib/supabase'
import nodemailer from 'nodemailer'

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' })
  }

  const { fileName, fileUrl, storagePath, company, contactName, customerEmail, phone, notes } = req.body || {}

  if (!fileName || !company || !customerEmail || !notes) {
    return res.status(400).json({ success: false, message: 'Company, email, file name, and notes are required.' })
  }

  const combinedNotes = `Contact: ${contactName || 'N/A'}\nPhone: ${phone || 'N/A'}\nStorage Path: ${storagePath || 'N/A'}\n\n${notes}`

  const { data, error } = await supabase.from('material_uploads').insert([
    {
      file_name: fileName,
      file_url: fileUrl || '',
      company,
      customer_email: customerEmail,
      notes: combinedNotes,
      status: 'new',
    },
  ]).select().single()

  if (error) {
    return res.status(500).json({ success: false, message: error.message })
  }

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
      subject: `New Material Upload: ${company}`,
      text: `A new material upload request was submitted.\n\nCompany: ${company}\nContact: ${contactName || 'N/A'}\nEmail: ${customerEmail}\nPhone: ${phone || 'N/A'}\nFile: ${fileName}\nLink: ${fileUrl || 'N/A'}\nStorage Path: ${storagePath || 'N/A'}\n\nNotes:\n${notes}`,
    })
  }

  return res.status(200).json({
    success: true,
    message: 'Material upload request received.',
    upload: data,
  })
}
