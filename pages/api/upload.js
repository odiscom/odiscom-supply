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

  const { fileName, company, customerEmail, notes } = req.body || {}

  if (!fileName) {
    return res.status(400).json({ success: false, message: 'fileName is required' })
  }

  return res.status(200).json({
    success: true,
    message: 'Upload metadata received. Connect Supabase Storage or SharePoint next for real file storage.',
    upload: {
      fileName,
      company: company || '',
      customerEmail: customerEmail || '',
      notes: notes || '',
      status: 'new',
    },
  })
}
