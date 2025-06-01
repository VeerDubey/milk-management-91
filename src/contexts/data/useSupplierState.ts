
import { useState, useEffect } from 'react';

export function useSupplierState() {
  const [suppliers, setSuppliers] = useState<any[]>(() => {
    const saved = localStorage.getItem("suppliers");
    return saved ? JSON.parse(saved) : [];
  });

  const [supplierPayments, setSupplierPayments] = useState<any[]>(() => {
    const saved = localStorage.getItem("supplierPayments");
    return saved ? JSON.parse(saved) : [];
  });

  const [stockEntries, setStockEntries] = useState<any[]>(() => {
    const saved = localStorage.getItem("stockEntries");
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem("suppliers", JSON.stringify(suppliers));
  }, [suppliers]);

  useEffect(() => {
    localStorage.setItem("supplierPayments", JSON.stringify(supplierPayments));
  }, [supplierPayments]);

  useEffect(() => {
    localStorage.setItem("stockEntries", JSON.stringify(stockEntries));
  }, [stockEntries]);

  const addSupplier = (supplier: any) => {
    const newSupplier = { ...supplier, id: `sup${Date.now()}` };
    setSuppliers([...suppliers, newSupplier]);
    return newSupplier;
  };

  const updateSupplier = (id: string, supplierData: any) => {
    setSuppliers(suppliers.map(s => s.id === id ? { ...s, ...supplierData } : s));
  };

  const deleteSupplier = (id: string) => {
    setSuppliers(suppliers.filter(s => s.id !== id));
  };

  const addStockEntry = (entry: any) => {
    const newEntry = { ...entry, id: `stock${Date.now()}` };
    setStockEntries([...stockEntries, newEntry]);
    return newEntry;
  };

  const updateStockEntry = (id: string, entryData: any) => {
    setStockEntries(stockEntries.map(e => e.id === id ? { ...e, ...entryData } : e));
  };

  const deleteStockEntry = (id: string) => {
    setStockEntries(stockEntries.filter(e => e.id !== id));
  };

  const addSupplierPayment = (payment: any) => {
    const newPayment = { ...payment, id: `suppay${Date.now()}` };
    setSupplierPayments([...supplierPayments, newPayment]);
    return newPayment;
  };

  const updateSupplierPayment = (id: string, paymentData: any) => {
    setSupplierPayments(supplierPayments.map(p => p.id === id ? { ...p, ...paymentData } : p));
  };

  const deleteSupplierPayment = (id: string) => {
    setSupplierPayments(supplierPayments.filter(p => p.id !== id));
  };

  return {
    suppliers,
    supplierPayments,
    stockEntries,
    addSupplier,
    updateSupplier,
    deleteSupplier,
    addStockEntry,
    updateStockEntry,
    deleteStockEntry,
    addSupplierPayment,
    updateSupplierPayment,
    deleteSupplierPayment
  };
}
