import { NextRequest, NextResponse } from "next/server";
import { ConvertPriceRequest, ConvertPriceResponse } from "./types";

async function getCurrencyByIP(ip: string): Promise<string> {
  if (ip == "::1") return "PLN"; // Localhost

  const res = await fetch(`https://ipapi.co/${ip}/currency/`);
  if (!res.ok) throw new Error("Failed to fetch currency from IP");
  return (await res.text()).trim();
}

async function getConversionRate(toCurrency: string): Promise<number> {
  const res = await fetch(`https://api.frankfurter.app/latest?from=USD&to=${toCurrency}`);

  if (!res.ok) {
    throw new Error("Failed to fetch conversion rate");
  }

  const data = await res.json();

  const rate = data.rates[toCurrency];

  if (!rate) {
    throw new Error(`Conversion rate for ${toCurrency} not found`);
  }

  return rate as number;
}

// Endpoint handler
export async function POST(request: NextRequest) {
  try {
    const { amountInUsd } = (await request.json()) as ConvertPriceRequest;
    if (amountInUsd < 0) {
      return NextResponse.json({ error: "Amount can't be negative" }, { status: 400 });
    }

    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0] ||
      (request as unknown as { ip: string }).ip ||
      "";
    const currency = await getCurrencyByIP(ip);

    const rate = await getConversionRate(currency);
    const convertedAmount = amountInUsd * rate;

    const formattedAmount = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      maximumFractionDigits: 1,
    }).format(convertedAmount);

    const response: ConvertPriceResponse = {
      convertedAmount,
      currency,
      formattedAmount,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Conversion error:", error);
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
