export interface Order {
  id: string;

  amount: number;
  currency: string;
  monthCount: number | null;
  status: "pending" | "paid" | "failed";

  comment: string;

  userId: string;

  createdAtIso: string;
  updatedAtIso: string;
}
