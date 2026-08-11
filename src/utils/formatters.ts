export function formatRp(amount: number, showSign: boolean = false): string {
  const isNegative = amount < 0;
  const absVal = Math.abs(amount);
  const formatted = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
  }).format(absVal);

  if (isNegative) {
    return `- ${formatted}`;
  }
  if (showSign && amount > 0) {
    return `+ ${formatted}`;
  }
  return formatted;
}

export function formatRpShort(amount: number): string {
  const absVal = Math.abs(amount);
  const sign = amount < 0 ? '-' : '';
  if (absVal >= 1_000_000_000) {
    return `${sign}Rp ${(absVal / 1_000_000_000).toFixed(1)}M`;
  }
  if (absVal >= 1_000_000) {
    return `${sign}Rp ${(absVal / 1_000_000).toFixed(1)}Jt`;
  }
  if (absVal >= 1_000) {
    return `${sign}Rp ${(absVal / 1_000).toFixed(0)}rb`;
  }
  return `${sign}Rp ${absVal}`;
}

export function formatDateID(dateString: string): string {
  if (!dateString) return '';
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return dateString;
  
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  
  return `${day}/${month}/${year}`;
}

export function formatDateFullID(dateString: string): string {
  if (!dateString) return '';
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return dateString;
  
  return d.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
}

export function parseRp(input: string): number {
  if (!input) return 0;
  const cleaned = input.replace(/[^0-9-]/g, '');
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
}

export function formatPercentage(val: number): string {
  return `${val >= 0 ? '+' : ''}${val.toFixed(1)}%`;
}

export function generateId(prefix: string = 'id'): string {
  return `${prefix}_${Math.random().toString(36).substring(2, 9)}_${Date.now()}`;
}
