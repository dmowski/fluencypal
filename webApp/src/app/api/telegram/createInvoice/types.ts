export interface CreateTelegramInvoiceRequest {
  monthCount: number;
}

export interface CreateTelegramInvoiceResponse {
  ok: boolean;
  invoice_link: string | null;
  // Echo basic info for client UX
  amount_stars: number;
  monthCount: number;
  payload: string | null;
  error?: { code: string; message: string };
}
