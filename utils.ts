
import { Project, ProjectMetrics } from './types';

export const calculateMetrics = (project: Project): ProjectMetrics => {
  const totalIncome = project.transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
    
  const totalExpense = project.transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
    
  const profit = totalIncome - totalExpense;
  const profitMargin = totalIncome > 0 ? (profit / totalIncome) * 100 : 0;
  const roi = totalExpense > 0 ? (totalIncome / totalExpense) * 100 : 0;
  
  return {
    totalIncome,
    totalExpense,
    profit,
    profitMargin,
    roi
  };
};

export const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('zh-TW', {
    style: 'currency',
    currency: 'TWD',
    minimumFractionDigits: 0
  }).format(value);
};

export const generateId = () => Math.random().toString(36).substring(2, 9);
