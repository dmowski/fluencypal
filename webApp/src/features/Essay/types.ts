export interface Essay {
  id: string;
  title: string;
  context: string;
  text: string;
  createdAtIso: string;
  updatedAtIso: string;
  analysis: string | null;
}
