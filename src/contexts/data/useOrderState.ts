
import { useState, useEffect } from 'react';
import { Order } from '@/types';
import { initialOrders } from '@/data/initialData';
import { toast } from 'sonner';

export function useOrderState() {
  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem("orders");
    try {
      return saved ? JSON.parse(saved) : initialOrders;
    } catch (error) {
      console.error("Error parsing orders from localStorage:", error);
      toast.error("Failed to load order data");
      return initialOrders;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem("orders", JSON.stringify(orders));
    } catch (error) {
      console.error("Error saving orders to localStorage:", error);
      toast.error("Failed to save order data");
    }
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

  // Duplicate an existing order with optional new date
  const duplicateOrder = (orderId: string, newDate?: string): Order | null => {
    const existingOrder = orders.find(order => order.id === orderId);
    if (!existingOrder) {
      toast.error("Order not found");
      return null;
    }

    const duplicatedOrder: Omit<Order, "id"> = {
      ...existingOrder,
      id: undefined as any, // Will be replaced in addOrder function
      date: newDate || new Date().toISOString(),
      status: 'pending',
      paymentStatus: 'pending',
    };

    const newOrder = addOrder(duplicatedOrder);
    toast.success("Order duplicated successfully");
    
    return newOrder;
  };

  const updateOrder = (id: string, orderData: Partial<Order>) => {
    try {
      let updated = false;
      
      setOrders(
        orders.map((order) => {
          if (order.id === id) {
            updated = true;
            return { ...order, ...orderData };
          }
          return order;
        })
      );
      
      if (!updated) {
        console.warn(`Order with ID ${id} not found for update`);
      }
    } catch (error) {
      console.error("Error updating order:", error);
      toast.error("Failed to update order");
    }
  };

  const deleteOrder = (id: string) => {
    try {
      setOrders(orders.filter((order) => order.id !== id));
      toast.success("Order deleted successfully");
    } catch (error) {
      console.error("Error deleting order:", error);
      toast.error("Failed to delete order");
    }
  };

  return {
    orders,
    addOrder,
    updateOrder,
    deleteOrder,
    addBatchOrders,
    duplicateOrder
  };
}
