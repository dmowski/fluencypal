export const getCurrencySymbol = (currency: string) => {
  if (currency === "usd") {
    return "$";
  }
  if (currency === "eur") {
    return "€";
  }
  if (currency === "pln") {
    return "zł";
  }

  return currency.toUpperCase();
};
