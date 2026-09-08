import PDFDocument from 'pdfkit'
import path from 'path'

import { money, totalFor, lineTotal, canIssueQuote } from './pricing'

export function buildProfessionalQuotePdf(quote, items = []) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'LETTER', margin: 40 })
    const chunks = []

    doc.on('data', chunk => chunks.push(chunk))
    doc.on('end', () => resolve(Buffer.concat(chunks)))
    doc.on('error', reject)

    const pageWidth = doc.page.width
    const left = 40
    const quoteDate = quote.quoted_at || quote.created_at
    const dateLabel = quoteDate ? new Date(quoteDate).toLocaleDateString() : 'Not recorded'
    const total = canIssueQuote(items) ? totalFor(items) : null
    const logoPath = path.join(process.cwd(), 'public', 'logo.png')

    doc.rect(0, 0, pageWidth, 92).fill('#0f172a')

    try {
      doc.image(logoPath, left, 22, { width: 140 })
    } catch {
      doc.fillColor('#ffffff').font('Helvetica-Bold').fontSize(24).text('Odiscom Supply', left, 28)
    }

    doc.font('Helvetica-Bold').fontSize(18).fillColor('#ffffff').text('QUOTE', 430, 30, { width: 140, align: 'right' })
    doc.font('Helvetica').fontSize(9).fillColor('#cbd5e1').text(quote.quote_id || '', 430, 56, { width: 140, align: 'right' })

    doc.roundedRect(left, 118, 250, 108, 8).fillAndStroke('#ffffff', '#e5e7eb')
    doc.roundedRect(322, 118, 250, 108, 8).fillAndStroke('#ffffff', '#e5e7eb')

    doc.font('Helvetica-Bold').fontSize(10).fillColor('#0f172a').text('Prepared For', 56, 134)
    doc.font('Helvetica').fontSize(9).fillColor('#374151')
    doc.text(quote.company || '-', 56, 154)
    doc.text(quote.name || '-', 56, 170)
    doc.text(quote.email || '-', 56, 186)
    if (quote.phone) doc.text(quote.phone, 56, 202)

    doc.font('Helvetica-Bold').fontSize(10).fillColor('#0f172a').text('Quote Summary', 338, 134)
    doc.font('Helvetica').fontSize(9).fillColor('#374151')
    doc.text(`Quote Date: ${dateLabel}`, 338, 154)
    doc.text(`Status: ${(quote.status || 'pending').toUpperCase()}`, 338, 170)
    doc.text('Validity: Subject to availability', 338, 186)

    let y = 304
    doc.rect(left, y - 6, 532, 24).fill('#e5e7eb')
    doc.font('Helvetica-Bold').fontSize(9).fillColor('#0f172a')
    doc.text('Item', 52, y, { width: 250 })
    doc.text('Qty', 314, y, { width: 50, align: 'right' })
    doc.text('Unit Price', 386, y, { width: 80, align: 'right' })
    doc.text('Line Total', 486, y, { width: 70, align: 'right' })

    y += 30

    items.forEach((item, index) => {
      if (y > 690) { doc.addPage(); y = 60 }
      const fill = index % 2 === 0 ? '#ffffff' : '#f8fafc'
      doc.rect(left, y - 8, 532, 34).fillAndStroke(fill, '#e5e7eb')
      doc.font('Helvetica').fontSize(9).fillColor('#111827')
      doc.text(item.product_name || '-', 52, y, { width: 250 })
      doc.text(String(item.quantity || 0), 314, y, { width: 50, align: 'right' })
      doc.text(money(Number(item.unit_price)>0 ? item.unit_price : null), 386, y, { width: 80, align: 'right' })
      doc.text(money(Number(item.unit_price)>0 ? lineTotal(item) : null), 486, y, { width: 70, align: 'right' })
      y += 34
    })

    y += 16
    doc.roundedRect(360, y, 212, 54, 8).fillAndStroke('#0f172a', '#0f172a')
    doc.font('Helvetica').fontSize(10).fillColor('#cbd5e1').text('Quote Total', 378, y + 12)
    doc.font('Helvetica-Bold').fontSize(18).fillColor('#ffffff').text(money(total), 430, y + 29, { width: 124, align: 'right' })

    y += 86
    if (y > 680) { doc.addPage(); y = 60 }
    doc.font('Helvetica-Bold').fontSize(10).fillColor('#0f172a').text('Terms & Conditions', left, y)
    doc.font('Helvetica').fontSize(8).fillColor('#4b5563').text(
      'Pricing is subject to final availability, lead time, taxes, freight, and written acceptance. Special-order, private-label, custom cable, trailer, and bulk items may require deposit or full payment before procurement.',
      left, y + 16, { width: 532 }
    )

    doc.fontSize(8).fillColor('#64748b')
    doc.text('OdiscomSupply.com | sales@odiscom.com | Telecom infrastructure supply', left, 742, { width: 532, align: 'center' })

    doc.end()
  })
}
