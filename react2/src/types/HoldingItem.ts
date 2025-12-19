import type { SymbolItem } from './SymbolItem';

export interface HoldingItem {
  symbol: SymbolItem;
  quantity: number;
  amount: number;
  us_amount: number | null;
  accounts: string[];
}
