const currency = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0,
});

const thousands = new Intl.NumberFormat('pt-BR');

/**
 * Formats a value in reais, e.g. 450000 becomes "R$ 450.000".
 */
export function formatCurrency(value: number) {
    return currency.format(value);
}

/**
 * Formats the digits of a price for display while typing, e.g. "1500000"
 * becomes "1.500.000".
 */
export function formatThousands(digits: string) {
    return digits ? thousands.format(Number(digits)) : '';
}

/**
 * Keeps only the digits of a typed price, e.g. "1.500.000" becomes "1500000".
 */
export function priceDigits(value: string) {
    return value.replace(/\D/g, '').replace(/^0+/, '').slice(0, 12);
}

/**
 * Formats a listing price, adding "/mês" to rents.
 */
export function formatListingPrice(price: number, deal: string | null) {
    return deal === 'aluguel'
        ? `${formatCurrency(price)}/mês`
        : formatCurrency(price);
}
