
import { useState, useEffect } from 'react';
import { Customer, Product } from '@/types';
import { productsList } from '@/data/productsList';
import { customersList } from '@/data/customersList';

export function useInitialData() {
  const [hasLoadedInitialData, setHasLoadedInitialData] = useState(false);

  const loadInitialProducts = (currentProducts: Product[], addProduct: (product: Omit<Product, 'id'>) => Product) => {
    productsList.forEach(productData => {
      const exists = currentProducts.find(p => p.name === productData.name);
      if (!exists) {
        addProduct(productData);
      }
    });
  };

  const loadInitialCustomers = (currentCustomers: Customer[], addCustomer: (customer: Omit<Customer, 'id'>) => Customer) => {
    customersList.forEach(customerData => {
      const exists = currentCustomers.find(c => c.name === customerData.name);
      if (!exists) {
        addCustomer(customerData);
      }
    });
  };

  useEffect(() => {
    const initialDataLoaded = localStorage.getItem('initial-data-loaded');
    setHasLoadedInitialData(!!initialDataLoaded);
  }, []);

  const markInitialDataAsLoaded = () => {
    localStorage.setItem('initial-data-loaded', 'true');
    setHasLoadedInitialData(true);
  };

  return {
    hasLoadedInitialData,
    loadInitialProducts,
    loadInitialCustomers,
    markInitialDataAsLoaded
  };
}
