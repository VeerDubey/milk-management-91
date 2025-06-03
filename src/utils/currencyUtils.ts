
import { Currency } from '@/types/invoice';

export const formatCurrency = (amount: number, currency: Currency): string => {
  const formatter = new Intl.NumberFormat(
    currency.code === 'INR' ? 'en-IN' : 'en-US',
    {
      style: 'currency',
      currency: currency.code,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }
  );
  
  return formatter.format(amount);
};

export const formatNumber = (amount: number, currency: Currency): string => {
  if (currency.code === 'INR') {
    // Indian number formatting with lakhs and crores
    return new Intl.NumberFormat('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  } else {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  }
};

export const parseCurrencyInput = (value: string, currency: Currency): number => {
  // Remove currency symbols and format characters
  const cleanValue = value.replace(/[₹$,\s]/g, '');
  return parseFloat(cleanValue) || 0;
};
