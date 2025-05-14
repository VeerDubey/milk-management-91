
import { useState, useEffect } from 'react';
import { Order } from '@/types';
import { initialOrders } from '@/data/initialData';

export function useOrderState() {
  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem("orders");
    return saved ? JSON.parse(saved) : initialOrders;
  });

  useEffect(() => {
    localStorage.setItem("orders", JSON.stringify(orders));
  }, [orders]);

  const addOrder = (order: Omit<Order, "id">) => {
    const newOrder = {
      ...order,
      id: `o${Date.now()}`
    };
    
    setOrders(prev => [...prev, newOrder]);
    
    return newOrder;
  };

  // Batch add multiple orders
  const addBatchOrders = (newOrders: Omit<Order, "id">[]) => {
    const createdOrders = newOrders.map(order => ({
      ...order,
      id: `o${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
    }));
    
    setOrders(prev => [...prev, ...createdOrders]);
    
    return createdOrders;
  };

  const updateOrder = (id: string, orderData: Partial<Order>) => {
    setOrders(
      orders.map((order) =>
        order.id === id ? { ...order, ...orderData } : order
      )
    );
  };

  const deleteOrder = (id: string) => {
    setOrders(orders.filter((order) => order.id !== id));
  };

  return {
    orders,
    addOrder,
    updateOrder,
    deleteOrder,
    addBatchOrders
  };
}
