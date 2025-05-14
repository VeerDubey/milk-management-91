
import { useState, useEffect } from 'react';
import { Supplier, SupplierPayment } from '@/types';

export function useSupplierState() {
  const [suppliers, setSuppliers] = useState<Supplier[]>(() => {
    const saved = localStorage.getItem("suppliers");
    return saved ? JSON.parse(saved) : [];
  });

  const [supplierPayments, setSupplierPayments] = useState<SupplierPayment[]>(() => {
    const saved = localStorage.getItem("supplierPayments");
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem("suppliers", JSON.stringify(suppliers));
  }, [suppliers]);

  useEffect(() => {
    localStorage.setItem("supplierPayments", JSON.stringify(supplierPayments));
  }, [supplierPayments]);

  const addSupplier = (supplier: Omit<Supplier, "id">) => {
    const newSupplier = {
      ...supplier,
      id: `s${Date.now()}`
    };
    setSuppliers([...suppliers, newSupplier]);
  };

  const updateSupplier = (id: string, supplierData: Partial<Supplier>) => {
    setSuppliers(
      suppliers.map((supplier) =>
        supplier.id === id ? { ...supplier, ...supplierData } : supplier
      )
    );
  };

  const deleteSupplier = (id: string) => {
    setSuppliers(suppliers.filter((supplier) => supplier.id !== id));
  };

  const addSupplierPayment = (payment: Omit<SupplierPayment, "id">) => {
    const newPayment = {
      ...payment,
      id: `sp${Date.now()}`
    };
    setSupplierPayments([...supplierPayments, newPayment]);
    
    const supplier = suppliers.find(s => s.id === payment.supplierId);
    if (supplier && supplier.outstandingBalance !== undefined) {
      updateSupplier(supplier.id, {
        outstandingBalance: supplier.outstandingBalance - payment.amount
      });
    }
  };

  const updateSupplierPayment = (id: string, paymentData: Partial<SupplierPayment>) => {
    const oldPayment = supplierPayments.find(p => p.id === id);
    
    setSupplierPayments(
      supplierPayments.map((payment) =>
        payment.id === id ? { ...payment, ...paymentData } : payment
      )
    );
    
    if (oldPayment && paymentData.amount && oldPayment.amount !== paymentData.amount) {
      const supplier = suppliers.find(s => s.id === oldPayment.supplierId);
      if (supplier && supplier.outstandingBalance !== undefined) {
        const difference = paymentData.amount - oldPayment.amount;
        updateSupplier(supplier.id, {
          outstandingBalance: supplier.outstandingBalance - difference
        });
      }
    }
  };

  const deleteSupplierPayment = (id: string) => {
    const payment = supplierPayments.find(p => p.id === id);
    
    if (payment) {
      const supplier = suppliers.find(s => s.id === payment.supplierId);
      if (supplier && supplier.outstandingBalance !== undefined) {
        updateSupplier(supplier.id, {
          outstandingBalance: supplier.outstandingBalance + payment.amount
        });
      }
    }
    
    setSupplierPayments(supplierPayments.filter((payment) => payment.id !== id));
  };

  return {
    suppliers,
    supplierPayments,
    addSupplier,
    updateSupplier,
    deleteSupplier,
    addSupplierPayment,
    updateSupplierPayment,
    deleteSupplierPayment
  };
}
