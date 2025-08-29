export interface Order {
  id: string;

  amount: number;
  currency: string;
  status: "pending" | "paid" | "failed";

  userId: string;

  createdAtIso: string;
  updatedAtIso: string;
}
