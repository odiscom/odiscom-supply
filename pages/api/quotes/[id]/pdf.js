import { createSupabaseAdmin, requireAdmin } from '../../../../lib/supabaseAdmin'
import { buildProfessionalQuotePdf } from '../../../../lib/quotePdf'
export default async function handler(req,res) {
 if (req.method !== 'GET') return res.status(405).end()
 if (!(await requireAdmin(req))) return res.status(403).json({success:false,message:'Administrator access required'})
 const supabase = createSupabaseAdmin()
 const {data:quote,error} = await supabase.from('quotes').select('*').eq('id',req.query.id).single()
 if (error || !quote) return res.status(404).json({success:false,message:'Quote not found'})
 const {data:items,error:itemsError} = await supabase.from('quote_items').select('*').eq('quote_id',quote.id)
 if (itemsError) return res.status(503).json({success:false,message:'Quote items could not be loaded'})
 const buffer = await buildProfessionalQuotePdf(quote,items || [])
 res.setHeader('Cache-Control','private, no-store')
 res.setHeader('Content-Type','application/pdf')
 res.setHeader('Content-Disposition','inline; filename=quote.pdf')
 res.send(buffer)
}
