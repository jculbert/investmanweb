export interface SymbolItem {
  name: string;
  description: string | null;
  last_price: number | null;
  last_price_date: string | null;
  reviewed_date: string | null;
  review_result: string | null;
  notes: string | null;
}
