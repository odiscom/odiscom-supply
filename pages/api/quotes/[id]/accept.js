import nodemailer from 'nodemailer'
import { createSupabaseAdmin } from '../../../../lib/supabaseAdmin'
export default async function handler(req,res) {
 if (req.method !== 'POST') return res.status(405).json({success:false,message:'Method not allowed'})
 const token = req.query.id
 if (typeof token !== 'string' || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(token)) return res.status(400).json({success:false,message:'Invalid acceptance link'})
 try {
  const {data,error} = await createSupabaseAdmin().rpc('accept_quote',{p_acceptance_token:token})
  if (error) return res.status(409).json({success:false,message:'This quote cannot be accepted. It may be unpriced, already accepted, or require administrator review.'})
  if (!data?.orderNumber) return res.status(500).json({success:false,message:'Order confirmation was unavailable. Contact Odiscom before retrying.'})
  let notificationSent=false
  if(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
   try {
    const transport=nodemailer.createTransport({host:process.env.SMTP_HOST,port:Number(process.env.SMTP_PORT || 587),secure:false,auth:{user:process.env.SMTP_USER,pass:process.env.SMTP_PASS}})
    await transport.sendMail({from:'Odiscom Supply <sales@odiscom.com>',to:process.env.NOTIFY_EMAIL || 'sales@odiscom.com',subject:'Accepted order: '+data.orderNumber,text:'Order '+data.orderNumber+' was saved with its line items. Review fulfillment and supplier costs in Odiscom Supply Admin. Total: $'+data.total})
    notificationSent=true
   } catch { notificationSent=false }
  }
  return res.status(200).json({success:true,...data,notificationSent})
 } catch { return res.status(503).json({success:false,message:'Quote acceptance is unavailable. No order has been confirmed.'}) }
}
