const currencyFormatter = new Intl.NumberFormat('ro-RO', {
  style: 'currency',
  currency: 'RON',
  minimumFractionDigits: 2
})

const dateFormatter = new Intl.DateTimeFormat('ro-RO')

export function formatCurrency(value) {
  return currencyFormatter.format(value)
}

export function formatDate(value) {
  if (!value) return ''
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return dateFormatter.format(date)
}

export function statusMeta(status) {
  const map = {
    paid: { label: 'Plătită', tone: 'success' },
    unpaid: { label: 'Neplătită', tone: 'danger' }
  }

  return map[status] ?? { label: status, tone: 'neutral' }
}
