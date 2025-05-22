
import { useState, useEffect, useCallback } from 'react';
import { Expense } from '@/types';
import { initialExpenses } from '@/data/initialData';
import { toast } from 'sonner';

export type ExpenseCategory = 
  | "Utilities" 
  | "Maintenance" 
  | "Salaries" 
  | "Equipment" 
  | "Inventory" 
  | "Transportation"
  | "Marketing" 
  | "Rent" 
  | "Insurance" 
  | "Taxes" 
  | "Miscellaneous";

export type ExpensePaymentMethod = 
  | "Cash" 
  | "Credit Card" 
  | "Bank Transfer" 
  | "UPI" 
  | "Check" 
  | "Online Payment";

export interface ExpenseCreateData {
  title: string;
  amount: number;
  date: string;
  category: string; // Changed from ExpenseCategory to string for flexibility
  paymentMethod?: ExpensePaymentMethod | string; // Made more flexible
  reference?: string;
  notes?: string;
  receipt?: string;
  description?: string;
  recurring?: boolean;
}

export function useExpenseState() {
  const [expenses, setExpenses] = useState<Expense[]>(() => {
    const saved = localStorage.getItem("expenses");
    try {
      const parsed = saved ? JSON.parse(saved) : initialExpenses;
      return Array.isArray(parsed) ? parsed : initialExpenses;
    } catch (error) {
      console.error("Error parsing expenses from localStorage:", error);
      return initialExpenses;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem("expenses", JSON.stringify(expenses));
    } catch (error) {
      console.error("Error saving expenses to localStorage:", error);
      toast.error("Failed to save expenses data");
    }
  }, [expenses]);

  const addExpense = useCallback((expenseData: ExpenseCreateData): Expense => {
    try {
      const newExpense: Expense = {
        ...expenseData,
        id: `exp${Date.now()}`,
        description: expenseData.description || expenseData.notes || '',
        recurring: expenseData.recurring || false,
        paymentMethod: expenseData.paymentMethod || 'Cash',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      setExpenses(prev => [...prev, newExpense]);
      toast.success("Expense added successfully");
      return newExpense;
    } catch (error) {
      console.error("Error adding expense:", error);
      toast.error("Failed to add expense");
      throw error;
    }
  }, []);

  const updateExpense = useCallback((id: string, expenseData: Partial<Expense>): boolean => {
    try {
      let updated = false;
      
      setExpenses(prev => {
        const index = prev.findIndex(expense => expense.id === id);
        if (index === -1) return prev;
        
        updated = true;
        const updatedExpenses = [...prev];
        updatedExpenses[index] = { 
          ...updatedExpenses[index], 
          ...expenseData,
          updatedAt: new Date().toISOString() 
        };
        
        return updatedExpenses;
      });
      
      if (updated) {
        toast.success("Expense updated successfully");
      }
      return updated;
    } catch (error) {
      console.error("Error updating expense:", error);
      toast.error("Failed to update expense");
      return false;
    }
  }, []);

  const deleteExpense = useCallback((id: string): boolean => {
    try {
      let deleted = false;
      
      setExpenses(prev => {
        const index = prev.findIndex(expense => expense.id === id);
        if (index === -1) return prev;
        
        deleted = true;
        const updatedExpenses = [...prev];
        updatedExpenses.splice(index, 1);
        
        return updatedExpenses;
      });
      
      if (deleted) {
        toast.success("Expense deleted successfully");
      }
      return deleted;
    } catch (error) {
      console.error("Error deleting expense:", error);
      toast.error("Failed to delete expense");
      return false;
    }
  }, []);
  
  const getExpenseById = useCallback((id: string): Expense | undefined => {
    return expenses.find(expense => expense.id === id);
  }, [expenses]);
  
  const getExpensesByCategory = useCallback((category: string): Expense[] => {
    return expenses.filter(expense => expense.category === category);
  }, [expenses]);
  
  const getExpensesByDateRange = useCallback((startDate: string, endDate: string): Expense[] => {
    return expenses.filter(expense => {
      const expenseDate = new Date(expense.date).getTime();
      const start = new Date(startDate).getTime();
      const end = new Date(endDate).getTime();
      
      return expenseDate >= start && expenseDate <= end;
    });
  }, [expenses]);
  
  const getTotalExpenses = useCallback((startDate?: string, endDate?: string): number => {
    if (startDate && endDate) {
      const filteredExpenses = getExpensesByDateRange(startDate, endDate);
      return filteredExpenses.reduce((total, expense) => total + expense.amount, 0);
    }
    
    return expenses.reduce((total, expense) => total + expense.amount, 0);
  }, [expenses, getExpensesByDateRange]);
  
  const getExpenseStatsByCategory = useCallback((): Record<string, number> => {
    const stats: Record<string, number> = {};
    
    expenses.forEach(expense => {
      const category = expense.category || "Miscellaneous";
      stats[category] = (stats[category] || 0) + expense.amount;
    });
    
    return stats;
  }, [expenses]);
  
  return {
    expenses,
    addExpense,
    updateExpense,
    deleteExpense,
    getExpenseById,
    getExpensesByCategory,
    getExpensesByDateRange,
    getTotalExpenses,
    getExpenseStatsByCategory
  };
}
