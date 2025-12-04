import type { ReactNode } from 'react';

export interface Supplier {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
}

export type TransactionType = 'SALE' | 'PAYMENT';

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  date: string;
  note?: string;
}

export interface Client {
  id: string;
  name: string;
  supplierId: string; // Link to a supplier
  transactions: Transaction[];
  // Derived properties helpers
  totalCredit?: number; 
  totalPaid?: number;
  currentBalance?: number;
}

export type Screen = 'DASHBOARD' | 'SUPPLIERS' | 'CLIENTS';

export interface StatCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  colorClass?: string;
}