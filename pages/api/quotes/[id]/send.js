import nodemailer from 'nodemailer'
import { createSupabaseAdmin, requireAdmin } from '../../../../lib/supabaseAdmin'
import { buildProfessionalQuotePdf } from '../../../../lib/quotePdf'
export default async function handler(req,res) {
 if(req.method !== 'POST') return res.status(405).json({success:false,message:'Method not allowed'})
 if(!(await requireAdmin(req))) return res.status(403).json({success:false,message:'Administrator access required'})
 if(!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) return res.status(503).json({success:false,message:'Email delivery is not configured. Quote was not sent.'})
 const supabase=createSupabaseAdmin()
 const {data,error}=await supabase.rpc('prepare_quote_issue',{p_quote_id:req.query.id})
 if(error || !data?.quote || !data?.items?.length) return res.status(422).json({success:false,message:'Quote could not be prepared. Confirm every selling price and quantity and check that it is not already accepted. Email was not sent.'})
 const {quote,items}=data
 try {
  const pdf=await buildProfessionalQuotePdf(quote,items)
  const siteUrl=process.env.NEXT_PUBLIC_SITE_URL || 'https://www.odiscomsupply.com'
  const link=`${siteUrl}/quote/accept/${quote.acceptance_token}`
  const transport=nodemailer.createTransport({host:process.env.SMTP_HOST,port:Number(process.env.SMTP_PORT || 587),secure:false,auth:{user:process.env.SMTP_USER,pass:process.env.SMTP_PASS}})
  await transport.sendMail({from:'Odiscom Supply <sales@odiscom.com>',to:quote.email,cc:process.env.NOTIFY_EMAIL || undefined,subject:`Odiscom Supply Quote ${quote.quote_id}`,text:`Hello ${quote.name},\n\nAttached is quote ${quote.quote_id}.\n\nAccept this quote: ${link}\n\nThank you,\nOdiscom Supply`,attachments:[{filename:`quote-${quote.quote_id}.pdf`,content:pdf,contentType:'application/pdf'}]})
  return res.status(200).json({success:true,message:'Quote PDF sent'})
 } catch {
  // Keep the issued price snapshot intact. Never claim delivery or invite an unqualified retry.
  return res.status(502).json({success:false,quotePrepared:true,message:'Quote pricing and its acceptance link were saved, but email delivery was not confirmed. Review delivery before resending.'})
 }
}
