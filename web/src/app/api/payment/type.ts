export type OrderStatus = 'pending' | 'paid' | 'failed' | 'outdated';

export interface Order {
  id: string;

  amount: number;
  currency: string;
  monthCount: number | null;
  status: OrderStatus;

  comment: string;

  userId: string;

  createdAtIso: string;
  updatedAtIso: string;
}

export interface SetupIntentRequest {}

export interface SetupIntentResponse {
  clientSecret: string;
}
