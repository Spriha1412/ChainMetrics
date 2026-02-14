export const formatCurrency = (value) => {
  if (value === null || value === undefined) return "-";

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: value < 1 ? 6 : 2,
  }).format(value);
};

export const formatCompactCurrency = (value) => {
  if (value === null || value === undefined) return "-";

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    notation: "compact",
    maximumFractionDigits: 2,
  }).format(value);
};

export const formatPercent = (value) => {
  if (value === null || value === undefined) return "-";
  return `${value.toFixed(2)}%`;
};

export const formatNumber = (value) => {
  if (value === null || value === undefined) return "-";
  return new Intl.NumberFormat("en-US").format(value);
};
