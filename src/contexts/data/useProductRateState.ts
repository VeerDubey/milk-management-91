import { useState, useEffect } from 'react';
import { CustomerProductRate, SupplierProductRate, Product } from '@/types';

export function useProductRateState(products: Product[]) {
  const [customerProductRates, setCustomerProductRates] = useState<CustomerProductRate[]>(() => {
    const saved = localStorage.getItem("customerProductRates");
    return saved ? JSON.parse(saved) : [];
  });
  
  const [supplierProductRates, setSupplierProductRates] = useState<SupplierProductRate[]>(() => {
    const saved = localStorage.getItem("supplierProductRates");
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem("customerProductRates", JSON.stringify(customerProductRates));
  }, [customerProductRates]);
  
  useEffect(() => {
    localStorage.setItem("supplierProductRates", JSON.stringify(supplierProductRates));
  }, [supplierProductRates]);

  // Customer product rates
  const addCustomerProductRate = (rate: Omit<CustomerProductRate, "id">) => {
    const newRate = {
      ...rate,
      id: `cpr${Date.now()}`
    };
    setCustomerProductRates([...customerProductRates, newRate]);
    return newRate; // Return the newly created rate object
  };

  const updateCustomerProductRate = (id: string, rateData: Partial<CustomerProductRate>) => {
    setCustomerProductRates(
      customerProductRates.map((rate) =>
        rate.id === id ? { ...rate, ...rateData } : rate
      )
    );
  };

  const deleteCustomerProductRate = (id: string) => {
    setCustomerProductRates(customerProductRates.filter((rate) => rate.id !== id));
  };
  
  const getCustomerProductRates = (customerId: string) => {
    return customerProductRates.filter(rate => rate.customerId === customerId);
  };
  
  const getProductRateForCustomer = (customerId: string, productId: string) => {
    const customRate = customerProductRates.find(
      rate => rate.customerId === customerId && rate.productId === productId
    );
    
    if (customRate) {
      return customRate.rate;
    }
    
    const product = products.find(p => p.id === productId);
    return product ? product.price : 0;
  };

  // Supplier product rates
  const addSupplierProductRate = (rate: Omit<SupplierProductRate, "id">) => {
    const newRate = {
      ...rate,
      id: `spr${Date.now()}`
    };
    setSupplierProductRates([...supplierProductRates, newRate]);
    return newRate; // Return the newly created rate object
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
  
  const getSupplierProductRates = (supplierId: string) => {
    return supplierProductRates.filter(rate => 
      rate.supplierId === supplierId && rate.isActive
    );
  };
  
  const getProductRateForSupplier = (supplierId: string, productId: string) => {
    const supplierRates = supplierProductRates
      .filter(rate => 
        rate.supplierId === supplierId && 
        rate.productId === productId && 
        rate.isActive
      )
      .sort((a, b) => 
        new Date(b.effectiveDate).getTime() - new Date(a.effectiveDate).getTime()
      );
    
    if (supplierRates.length > 0) {
      return supplierRates[0].rate;
    }
    
    return null;
  };
  
  const getSupplierRateHistory = (supplierId: string, productId: string) => {
    return supplierProductRates
      .filter(rate => rate.supplierId === supplierId && rate.productId === productId)
      .sort((a, b) => new Date(b.effectiveDate).getTime() - new Date(a.effectiveDate).getTime());
  };

  return {
    customerProductRates,
    supplierProductRates,
    addCustomerProductRate,
    updateCustomerProductRate,
    deleteCustomerProductRate,
    getCustomerProductRates,
    getProductRateForCustomer,
    addSupplierProductRate,
    updateSupplierProductRate,
    deleteSupplierProductRate,
    getSupplierProductRates,
    getProductRateForSupplier,
    getSupplierRateHistory
  };
}
