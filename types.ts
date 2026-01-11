
export interface Transaction {
  id: string;
  amount: number;
  description: string;
  date: string;
  type: 'income' | 'expense';
}

export interface Project {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  transactions: Transaction[];
}

export interface ProjectMetrics {
  totalIncome: number;
  totalExpense: number;
  profit: number;
  profitMargin: number;
  roi: number; // Return on Investment
}
