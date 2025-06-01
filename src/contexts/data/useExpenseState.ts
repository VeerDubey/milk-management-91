
import { useState, useEffect } from 'react';
import { Expense } from '@/types';

export function useExpenseState() {
  const [expenses, setExpenses] = useState<Expense[]>(() => {
    const saved = localStorage.getItem("expenses");
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem("expenses", JSON.stringify(expenses));
  }, [expenses]);

  const addExpense = (expense: Omit<Expense, "id">) => {
    const newExpense = {
      ...expense,
      id: `exp${Date.now()}`
    };
    setExpenses([...expenses, newExpense]);
    return newExpense;
  };

  const updateExpense = (id: string, expenseData: Partial<Expense>) => {
    setExpenses(
      expenses.map((expense) =>
        expense.id === id ? { ...expense, ...expenseData } : expense
      )
    );
  };

  const deleteExpense = (id: string) => {
    setExpenses(expenses.filter((expense) => expense.id !== id));
  };

  return {
    expenses,
    addExpense,
    updateExpense,
    deleteExpense
  };
}
