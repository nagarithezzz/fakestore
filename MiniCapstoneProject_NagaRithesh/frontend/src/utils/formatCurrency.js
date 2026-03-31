export function formatCurrency(amount) {
  if (amount == null || Number.isNaN(Number(amount))) return "—";
  return `₹${Number(amount).toFixed(2)}`;
}
