export function isToday(date: Date): boolean {
  const today = new Date()
  return date.toDateString() === today.toDateString()
}

export function isYesterday(date: Date): boolean {
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  return date.toDateString() === yesterday.toDateString()
}

export function isInRange(date: Date, start: Date, end: Date): boolean {
  return date >= start && date <= end
}

export function formatDate(date: Date, format?: string): string {
  if (!format) {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }
  // Add more format options as needed
  return date.toLocaleDateString('en-US')
}

export function getStartOfDay(date: Date): Date {
  const start = new Date(date)
  start.setHours(0, 0, 0, 0)
  return start
}

export function getEndOfDay(date: Date): Date {
  const end = new Date(date)
  end.setHours(23, 59, 59, 999)
  return end
}

export function getDaysAgo(days: number): Date {
  const date = new Date()
  date.setDate(date.getDate() - days)
  return date
}

export function parseGamePlanDate(dateString: string): Date {
  // GamePlan dates are typically in ISO format or similar
  return new Date(dateString)
}

