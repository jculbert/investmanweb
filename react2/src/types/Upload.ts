export interface Upload {
  id: number;
  date: string; // ISO date string
  file_name: string;
  num_transactions: number;
  result: string;
  notes?: string;
  content?: string;
}
