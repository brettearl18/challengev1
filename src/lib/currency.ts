export type Currency = 'USD' | 'AUD' | 'CAD' | 'GBP'

export const CURRENCY_SYMBOLS: Record<Currency, string> = {
  USD: '$',
  AUD: 'A$',
  CAD: 'C$',
  GBP: '£'
}

export const CURRENCY_NAMES: Record<Currency, string> = {
  USD: 'US Dollar',
  AUD: 'Australian Dollar',
  CAD: 'Canadian Dollar',
  GBP: 'British Pound'
}

export const CURRENCY_FORMATS: Record<Currency, Intl.NumberFormat> = {
  USD: new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }),
  AUD: new Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD' }),
  CAD: new Intl.NumberFormat('en-CA', { style: 'currency', currency: 'CAD' }),
  GBP: new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' })
}

/**
 * Convert dollars to cents
 */
export const dollarsToCents = (dollars: number): number => {
  return Math.round(dollars * 100)
}

/**
 * Convert cents to dollars
 */
export const centsToDollars = (cents: number): number => {
  return cents / 100
}

/**
 * Format cents as currency string
 */
export const formatCents = (cents: number, currency: Currency | undefined): string => {
  if (!currency || !CURRENCY_FORMATS[currency]) {
    // Default to USD if currency is invalid or undefined
    currency = 'USD'
  }
  const dollars = centsToDollars(cents)
  return CURRENCY_FORMATS[currency].format(dollars)
}

/**
 * Format dollars as currency string
 */
export const formatDollars = (dollars: number, currency: Currency | undefined): string => {
  if (!currency || !CURRENCY_FORMATS[currency]) {
    // Default to USD if currency is invalid or undefined
    currency = 'USD'
  }
  return CURRENCY_FORMATS[currency].format(dollars)
}

/**
 * Get currency symbol
 */
export const getCurrencySymbol = (currency: Currency | undefined): string => {
  if (!currency || !CURRENCY_SYMBOLS[currency]) {
    return '$' // Default to USD symbol
  }
  return CURRENCY_SYMBOLS[currency]
}

/**
 * Get currency name
 */
export const getCurrencyName = (currency: Currency | undefined): string => {
  if (!currency || !CURRENCY_NAMES[currency]) {
    return 'US Dollar' // Default to USD name
  }
  return CURRENCY_NAMES[currency]
}

/**
 * Validate currency input and convert to cents
 */
export const parseCurrencyInput = (input: string, currency: Currency | undefined): number => {
  if (!currency || !CURRENCY_FORMATS[currency]) {
    currency = 'USD' // Default to USD
  }
  
  // Remove currency symbols and commas
  const cleanInput = input.replace(/[$,£]/g, '').replace(/,/g, '')
  const dollars = parseFloat(cleanInput)
  
  if (isNaN(dollars) || dollars < 0) {
    return 0
  }
  
  return dollarsToCents(dollars)
}

/**
 * Get currency options for select dropdowns
 */
export const getCurrencyOptions = () => {
  return Object.entries(CURRENCY_NAMES).map(([code, name]) => ({
    value: code as Currency,
    label: `${CURRENCY_SYMBOLS[code as Currency]} ${name}`,
    symbol: CURRENCY_SYMBOLS[code as Currency]
  }))
}

/**
 * Validate if a currency is valid
 */
export const isValidCurrency = (currency: any): currency is Currency => {
  return currency && typeof currency === 'string' && currency in CURRENCY_SYMBOLS
}
