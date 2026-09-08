# Result-integrity audit — 2026-09-08

Baseline: OdiscomLLC/odiscom-supply main ed082ab55b824940169678337a3df1da7f948145. Reviewed all 64 tracked files, including public catalog, supplier/admin screens, financial calculations, BOM intake, quote PDFs, email issuance and order acceptance. This review does not certify supplier prices or qualifications.

## Corrections

- Unimplemented invoicing reports 503 and performs no operation; it cannot return `success: true`.
- Public product/category pages consistently retain the request-for-quote model. The request catalog describes materials to request, not inventory. Removed an unused fabricated product/specification list.
- Unknown prices and costs remain nullable. Defaults no longer turn missing amounts into zero. Explicit zero cost is supported when staff confirms it; incomplete or unconfirmed costs suppress margins.
- Dashboard totals refer to the records actually loaded; recent-order cost sums use those same orders. No line items or unconfirmed costs cannot produce a gross margin.
- Supplier material/freight/other costs require an explicit confirmation before ranking landed cost or reporting margin. Status selection records staff activity; it does not send RFQs.
- PDFs use the saved quote date and show unpriced amounts explicitly. PDF downloads require administrator authentication.
- Quote issuance rejects unpriced/empty/nonpositive lines, stores a UUID acceptance token before emailing, and checks the status write. Issuance locks the priced snapshot before rendering; quoted/accepted line items cannot change. Repricing requires returning the quote to pending and reissuing it. A delivery/status failure is distinct from a successful send. Sender: sales@odiscom.com.
- Quote acceptance uses a service-only PostgreSQL transaction with row locking. It requires an issued, priced quote, copies all line items, preserves unknown costs, and prevents repeated conversion. Email failure after acceptance does not erase the order or claim that acceptance failed.
- Order detail flags the pre-existing empty order for review. Its source quote also contains no items; no line items were invented or reconstructed.
- Saved intake and notification outcomes are distinguished so SMTP errors do not encourage duplicate RFQs.

## Validation evidence

- Pricing regression tests exercise missing/invalid amounts, explicit confirmed zero cost, partial supplier costs, complete totals and issuance prerequisites.
- Production build passed locally.
- Database migration applied: evidence_based_quote_amounts; unknown_product_amounts; freeze_issued_quote_prices.
- Transaction test in the live database used a rollback-only test quote: unpriced rejection, no partial order, correct priced total, one saved item, unknown cost preserved, repeated acceptance rejected, public RPC privileges denied. Rollback succeeded. Follow-up counts: 2 original quotes, 1 original order, 0 order items, 0 retained audit test quotes.
- No test email was sent and no new commercial order was retained.

## Operational limits

Supplier status, quote references, delivery dates and compliance fields are staff-entered records; this patch does not turn them into manufacturer verification. The invoice integration is unavailable. The existing empty order requires review against external records before fulfillment. Existing zero/default cost values remain unconfirmed until reviewed; stored customer records were preserved.
