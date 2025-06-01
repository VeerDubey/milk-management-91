
import { useState, useEffect } from 'react';
import { Salesman } from '@/types';

export function useSalesmanState() {
  const [salesmen, setSalesmen] = useState<Salesman[]>(() => {
    const saved = localStorage.getItem("salesmen");
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem("salesmen", JSON.stringify(salesmen));
  }, [salesmen]);

  const addSalesman = (salesman: Omit<Salesman, "id">) => {
    const newSalesman = {
      ...salesman,
      id: `s${Date.now()}`
    };
    setSalesmen([...salesmen, newSalesman]);
    return newSalesman;
  };

  const updateSalesman = (id: string, salesmanData: Partial<Salesman>) => {
    setSalesmen(
      salesmen.map((salesman) =>
        salesman.id === id ? { ...salesman, ...salesmanData } : salesman
      )
    );
  };

  const deleteSalesman = (id: string) => {
    setSalesmen(salesmen.filter((salesman) => salesman.id !== id));
  };

  return {
    salesmen,
    addSalesman,
    updateSalesman,
    deleteSalesman
  };
}
