const monthYear = new Intl.DateTimeFormat('en', { month: 'long', year: 'numeric', timeZone: 'UTC' });
const fullDate = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });

export function formatMonthYear(value: string): string {
  return monthYear.format(new Date(`${value}-01T00:00:00Z`));
}

export function formatFullDate(value: string): string {
  return fullDate.format(new Date(`${value}T00:00:00Z`));
}
