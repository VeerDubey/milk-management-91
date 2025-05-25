
import { useState, useEffect } from 'react';

interface Supplier {
  id: string;
  name: string;
  category: string;
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
  website: string;
  notes: string;
  paymentTerms: string;
  taxId: string;
  bankDetails: string;
  creditLimit: number;
  rating: number;
  createdAt: string;
  updatedAt: string;
}

export function useSuppliers() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);

  useEffect(() => {
    // Load suppliers from localStorage
    const saved = localStorage.getItem('suppliers');
    if (saved) {
      try {
        setSuppliers(JSON.parse(saved));
      } catch (error) {
        console.error('Failed to load suppliers:', error);
      }
    }
  }, []);

  const saveSuppliers = (suppliersData: Supplier[]) => {
    localStorage.setItem('suppliers', JSON.stringify(suppliersData));
    setSuppliers(suppliersData);
  };

  const addSupplier = async (supplierData: Omit<Supplier, 'id'>) => {
    const newSupplier: Supplier = {
      ...supplierData,
      id: Date.now().toString(),
    };
    
    const updatedSuppliers = [...suppliers, newSupplier];
    saveSuppliers(updatedSuppliers);
    return newSupplier;
  };

  const updateSupplier = async (id: string, supplierData: Partial<Supplier>) => {
    const updatedSuppliers = suppliers.map(supplier =>
      supplier.id === id ? { ...supplier, ...supplierData } : supplier
    );
    saveSuppliers(updatedSuppliers);
  };

  const deleteSupplier = async (id: string) => {
    const updatedSuppliers = suppliers.filter(supplier => supplier.id !== id);
    saveSuppliers(updatedSuppliers);
  };

  return {
    suppliers,
    addSupplier,
    updateSupplier,
    deleteSupplier,
  };
}
