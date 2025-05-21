
import { useState, useEffect } from 'react';
import { Supplier, SupplierProductRate, SupplierPayment } from '@/types';

export function useSupplierState() {
  const [suppliers, setSuppliers] = useState<Supplier[]>(() => {
    const saved = localStorage.getItem("suppliers");
    return saved ? JSON.parse(saved) : [];
  });

  const [supplierProductRates, setSupplierProductRates] = useState<SupplierProductRate[]>(() => {
    const saved = localStorage.getItem("supplierProductRates");
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
    localStorage.setItem("supplierProductRates", JSON.stringify(supplierProductRates));
  }, [supplierProductRates]);
  
  useEffect(() => {
    localStorage.setItem("supplierPayments", JSON.stringify(supplierPayments));
  }, [supplierPayments]);

  const addSupplier = (supplier: Omit<Supplier, "id">) => {
    const newSupplier = {
      ...supplier,
      id: `supplier-${Date.now()}`
    };
    setSuppliers([...suppliers, newSupplier]);
    return newSupplier;
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

  const addSupplierProductRate = (rate: Omit<SupplierProductRate, "id">) => {
    const newRate = {
      ...rate,
      id: `spr-${Date.now()}`
    };
    setSupplierProductRates([...supplierProductRates, newRate]);
    return newRate;
  };

  const updateSupplierProductRate = (id: string, rateData: Partial<SupplierProductRate>) => {
    setSupplierProductRates(
      supplierProductRates.map((rate) =>
        rate.id === id ? { ...rate, ...rateData } : rate
      )
    );
  };

  const deleteSupplierProductRate = (id: string) => {
    setSupplierProductRates(supplierProductRates.filter((rate) => rate.id !== id));
  };
  
  // Supplier payment functions
  const addSupplierPayment = (payment: Omit<SupplierPayment, "id">) => {
    const newPayment = {
      ...payment,
      id: `sp-${Date.now()}`
    };
    setSupplierPayments([...supplierPayments, newPayment]);
    
    // Update supplier outstanding balance if applicable
    if (payment.supplierId) {
      const supplier = suppliers.find(s => s.id === payment.supplierId);
      if (supplier && supplier.outstandingBalance !== undefined) {
        updateSupplier(payment.supplierId, {
          outstandingBalance: supplier.outstandingBalance - payment.amount
        });
      }
    }
    
    return newPayment;
  };

  const updateSupplierPayment = (id: string, paymentData: Partial<SupplierPayment>) => {
    const oldPayment = supplierPayments.find(p => p.id === id);
    
    setSupplierPayments(
      supplierPayments.map((payment) =>
        payment.id === id ? { ...payment, ...paymentData } : payment
      )
    );
    
    // Update supplier outstanding balance if amount changed
    if (oldPayment && paymentData.amount !== undefined && oldPayment.amount !== paymentData.amount) {
      const supplier = suppliers.find(s => s.id === oldPayment.supplierId);
      if (supplier && supplier.outstandingBalance !== undefined) {
        const amountDiff = paymentData.amount - oldPayment.amount;
        updateSupplier(oldPayment.supplierId, {
          outstandingBalance: supplier.outstandingBalance - amountDiff
        });
      }
    }
  };

  const deleteSupplierPayment = (id: string) => {
    const payment = supplierPayments.find(p => p.id === id);
    
    setSupplierPayments(supplierPayments.filter((payment) => payment.id !== id));
    
    // Update supplier outstanding balance
    if (payment) {
      const supplier = suppliers.find(s => s.id === payment.supplierId);
      if (supplier && supplier.outstandingBalance !== undefined) {
        updateSupplier(payment.supplierId, {
          outstandingBalance: supplier.outstandingBalance + payment.amount
        });
      }
    }
  };

  return {
    suppliers,
    addSupplier,
    updateSupplier,
    deleteSupplier,
    supplierProductRates,
    addSupplierProductRate,
    updateSupplierProductRate,
    deleteSupplierProductRate,
    supplierPayments,
    addSupplierPayment,
    updateSupplierPayment,
    deleteSupplierPayment
  };
}
