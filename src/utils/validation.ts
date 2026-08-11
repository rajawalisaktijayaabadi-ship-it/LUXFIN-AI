import { parseRp } from './formatters';

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export function validateAmount(value: string | number): { isValid: boolean; amount: number; error?: string } {
  const num = typeof value === 'number' ? value : parseRp(value);
  if (isNaN(num) || num <= 0) {
    return { isValid: false, amount: 0, error: 'Nominal harus lebih besar dari 0' };
  }
  if (num > 100_000_000_000) {
    return { isValid: false, amount: num, error: 'Nominal melebihi batas maksimum transaksi' };
  }
  return { isValid: true, amount: num };
}

export function validateLicenseKey(key: string): { isValid: boolean; error?: string } {
  if (!key || key.trim().length < 8) {
    return { isValid: false, error: 'Kode lisensi minimal 8 karakter' };
  }
  const upper = key.trim().toUpperCase();
  if (!upper.startsWith('LUX-')) {
    return { isValid: false, error: 'Format kode lisensi harus diawali LUX-' };
  }
  return { isValid: true };
}

export function validateTransactionInput(data: {
  amount: string | number;
  accountId: string;
  categoryId: string;
  date?: string;
}): ValidationResult {
  const errors: Record<string, string> = {};

  const amountCheck = validateAmount(data.amount);
  if (!amountCheck.isValid) {
    errors.amount = amountCheck.error || 'Nominal tidak valid';
  }

  if (!data.accountId) {
    errors.accountId = 'Rekening sumber wajib dipilih';
  }

  if (!data.categoryId) {
    errors.categoryId = 'Kategori wajib dipilih';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}
