
import { useState, useEffect } from 'react';
import { Product } from '@/types';
import { initialProducts } from '@/data/initialData';

export function useProductState() {
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem("products");
    return saved ? JSON.parse(saved) : initialProducts;
  });

  useEffect(() => {
    localStorage.setItem("products", JSON.stringify(products));
  }, [products]);

  const addProduct = (product: Omit<Product, "id">) => {
    const newProduct = {
      ...product,
      id: `p${Date.now()}`
    };
    setProducts([...products, newProduct]);
    return newProduct; // Return the newly created product to match the type
  };

  const updateProduct = (id: string, productData: Partial<Product>) => {
    setProducts(
      products.map((product) =>
        product.id === id ? { ...product, ...productData } : product
      )
    );
  };
  
  const updateProductMinStock = (id: string, minStockLevel: number) => {
    setProducts(
      products.map((product) =>
        product.id === id ? { ...product, minStockLevel } : product
      )
    );
  };

  const deleteProduct = (id: string) => {
    setProducts(products.filter((product) => product.id !== id));
  };

  return {
    products,
    addProduct,
    updateProduct,
    updateProductMinStock,
    deleteProduct
  };
}
