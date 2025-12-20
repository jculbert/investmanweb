export type TransactionItem = {
  id: number;
  date: string; // ISO date or YYYY-MM-DD
  type: string;
  quantity: number | null;
  price: number | null;
  amount: number | null;
  fee: number | null;
  capital_return: number | null;
  capital_gain: number | null;
  acb: number | null;
  symbol: string;
  account: string;
  upload_id: number | null;
  note: string | null;
};
