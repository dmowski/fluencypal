import { envConfig } from "../config/envConfig";

import { TonApiClient } from "@ton-api/client";
import { Address } from "@ton/core";

// Initialize the TonApi
const ta = new TonApiClient({
  baseUrl: "https://tonapi.io",
  apiKey: envConfig.tonApiKey,
});

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const isCryptoPaid = async (comment: string): Promise<boolean> => {
  const address = Address.parse(envConfig.merchantTonAddress);
  console.log("isCryptoPaid comment=", comment);

  ta.events.getEvent;

  await sleep(1000);
  return false;
};
