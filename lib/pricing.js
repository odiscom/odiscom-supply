/** Unknown amounts stay unknown; an explicit zero is a valid amount. */
export function amount(value) {
  if (value === null || value === undefined || value === '' || typeof value === 'boolean') return null
  const result = Number(value)
  return Number.isFinite(result) && result >= 0 ? result : null
}
export function money(value) {
  const valueNumber = value === null || value === undefined || value === '' || !Number.isFinite(Number(value)) ? null : Number(value)
  return valueNumber === null ? 'Not priced' : `$${valueNumber.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}
export function lineTotal(item, field = 'unit_price') {
  const price = amount(item[field]), qty = amount(item.quantity)
  return price === null || qty === null || qty <= 0 ? null : Math.round(price * qty * 100) / 100
}
export function totalFor(items, field = 'unit_price') {
  if (!items.length) return null
  const values = items.map(item => field === 'unit_cost' && !item.cost_confirmed ? null : lineTotal(item, field))
  return values.some(value => value === null) ? null : values.reduce((sum, value) => sum + value, 0)
}
export function margins(sell, cost) {
  const grossProfit = sell === null || cost === null ? null : sell - cost
  return { grossProfit, margin: grossProfit === null || sell <= 0 ? null : grossProfit / sell * 100 }
}
export function supplierMetrics(quote) {
  const costs = [quote.material_cost,quote.freight_cost,quote.other_cost].map(amount)
  const totalCost = !quote.costs_confirmed || costs.some(cost => cost === null) ? null : costs.reduce((sum,cost) => sum + cost,0)
  return {...quote,totalCost,...margins(amount(quote.sell_price),totalCost)}
}
export function canIssueQuote(items) { return totalFor(items) !== null && items.every(item => amount(item.unit_price) > 0) }
