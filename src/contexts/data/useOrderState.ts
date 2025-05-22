
import { useState, useEffect } from 'react';
import { Order, OrderItem } from '@/types';
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

  // Calculate total for an order
  const calculateOrderTotal = (items: OrderItem[]): number => {
    return items.reduce((sum, item) => {
      // Ensure item.quantity and item.unitPrice are numbers and not null
      const quantity = typeof item.quantity === 'number' ? item.quantity : 0;
      const unitPrice = typeof item.unitPrice === 'number' ? item.unitPrice : 0;
      return sum + (quantity * unitPrice);
    }, 0);
  };

  const addOrder = (order: Omit<Order, "id">) => {
    // Calculate total if not provided
    const total = order.total || calculateOrderTotal(order.items);
    
    const newOrder = {
      ...order,
      id: `o${Date.now()}`,
      total: total
    };
    
    setOrders(prev => [...prev, newOrder]);
    
    return newOrder;
  };

  // Batch add multiple orders
  const addBatchOrders = (newOrders: Omit<Order, "id">[]) => {
    const createdOrders = newOrders.map(order => {
      // Calculate total if not provided
      const total = order.total || calculateOrderTotal(order.items);
      
      return {
        ...order,
        id: `o${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        total: total
      };
    });
    
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

    // Use type casting to ensure the status is correctly typed
    const status: "pending" | "processing" | "completed" | "cancelled" = "pending";
    const paymentStatus: "pending" | "partial" | "paid" | "overdue" = "pending";
    
    const duplicatedOrderData: Omit<Order, "id"> = {
      ...existingOrder,
      date: newDate || new Date().toISOString(),
      status: status,
      paymentStatus: paymentStatus,
      // Only include the fields that are in Omit<Order, "id">
      items: [...existingOrder.items],
      vehicleId: existingOrder.vehicleId,
      salesmanId: existingOrder.salesmanId,
      customerId: existingOrder.customerId,
      total: existingOrder.total,
      customerName: existingOrder.customerName,
      totalAmount: existingOrder.totalAmount
    };
    
    const newOrder = addOrder(duplicatedOrderData);
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
            // If items were updated, recalculate the total
            const updatedItems = orderData.items || order.items;
            const total = orderData.total !== undefined ? 
              orderData.total : 
              calculateOrderTotal(updatedItems);
            
            return { 
              ...order, 
              ...orderData, 
              total: total,
              items: updatedItems
            };
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
    duplicateOrder,
    calculateOrderTotal
  };
}
