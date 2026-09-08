import { requireAdmin } from '../../../lib/supabaseAdmin'
export default async function handler(req, res) {
 if (req.method !== 'POST') return res.status(405).json({success:false,message:'Method not allowed'})
 if (!(await requireAdmin(req))) return res.status(403).json({success:false,message:'Administrator access required'})
 return res.status(503).json({success:false,code:'INVOICING_UNAVAILABLE',message:'Invoice integration is not configured. No invoice was created.'})
}
