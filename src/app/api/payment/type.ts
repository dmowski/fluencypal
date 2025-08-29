export interface Invoice {
  id: string;
  amount: number;
  currency: string;
  userId: string;
  status: "pending" | "paid" | "failed";
  createdAtIso: string;
  updatedAtIso: string;
}
