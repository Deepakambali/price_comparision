export function formatINR(amount: number): string {
  // Indian numbering system: e.g., 1,00,000 instead of 100,000
  const parts = amount.toFixed(2).split('.');
  let intPart = parts[0];
  const decPart = parts[1];

  // Apply Indian grouping: last 3 digits, then groups of 2
  const lastThree = intPart.slice(-3);
  const rest = intPart.slice(0, -3);
  if (rest !== '') {
    intPart = rest.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + ',' + lastThree;
  }

  return `Rs.${intPart}.${decPart}`;
}

export function formatINRShort(amount: number): string {
  if (amount >= 10000000) {
    return `Rs.${(amount / 10000000).toFixed(1)}Cr`;
  }
  if (amount >= 100000) {
    return `Rs.${(amount / 100000).toFixed(1)}L`;
  }
  if (amount >= 1000) {
    return `Rs.${(amount / 1000).toFixed(1)}K`;
  }
  return `Rs.${amount.toFixed(0)}`;
}
