export type DividendItem = {
  symbol: string;
  amount: number;
  us_amount: number | null;
};

export type SymbolDividendEntry = {
  date: string;
  account: string;
  amount: number;
};

export type SymbolDividendsResponse = {
  growths: Array<number | null>;
  yeeld: number | null;
  dividends: SymbolDividendEntry[];
};
