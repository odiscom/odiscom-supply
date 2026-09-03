import { createSupabaseAdmin } from '../../lib/supabaseAdmin'

const MAX_FILE_SIZE = 20 * 1024 * 1024
const ALLOWED_EXTENSIONS = new Set(['xlsx', 'xls', 'csv', 'pdf', 'doc', 'docx', 'txt', 'png', 'jpg', 'jpeg', 'zip'])

function safeFileName(name) {
  return String(name || 'material-list').toLowerCase().replace(/[^a-z0-9._-]+/g, '-').replace(/-+/g, '-').replace(/^-+|-+$/g, '')
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ success: false, message: 'Method not allowed' })
  const { fileName, fileSize, company } = req.body || {}
  const extension = String(fileName || '').split('.').pop().toLowerCase()
  if (!fileName || !company || !ALLOWED_EXTENSIONS.has(extension)) return res.status(400).json({ success: false, message: 'Unsupported file type.' })
  if (!Number(fileSize) || Number(fileSize) > MAX_FILE_SIZE) return res.status(400).json({ success: false, message: 'Files must be 20 MB or smaller.' })

  try {
    const path = `${Date.now()}-${safeFileName(company)}-${safeFileName(fileName)}`
    const admin = createSupabaseAdmin()
    const { data, error } = await admin.storage.from('material-uploads').createSignedUploadUrl(path)
    if (error) throw error
    return res.status(200).json({ success: true, path, token: data.token })
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message })
  }
}
