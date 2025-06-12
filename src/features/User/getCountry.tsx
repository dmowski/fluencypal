const localStorageCurrencyKey = "country_ipapi";
const getFromLocalStorage = () => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(localStorageCurrencyKey);
};
const setToLocalStorage = (currency: string) => {
  if (typeof window === "undefined") return;
  localStorage.setItem(localStorageCurrencyKey, currency);
};

export async function getCountryByIP(): Promise<string | null> {
  try {
    const isWindow = typeof window !== "undefined";
    if (!isWindow) {
      return null; // If not in a browser environment, return null
    }

    const localCurrency = getFromLocalStorage();
    if (localCurrency) {
      return localCurrency;
    }

    console.log("getCurrencyByIP");
    const res = await fetch(`https://ipapi.co/country/`);
    if (!res.ok) throw new Error("Failed to fetch currency from IP");
    const data = (await res.text()).trim();
    console.log("data", data);

    if (data) {
      setToLocalStorage(data);
    }

    return data;
  } catch (error) {
    console.error("Error fetching country by IP:", error);
    return null; // Default to US if there's an error
  }
}
