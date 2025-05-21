
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { useData } from '@/contexts/DataContext';
import { TrackSheetRow } from '@/types';
import { toast } from '@/components/ui/use-toast';

const OrderHistory = () => {
  const navigate = useNavigate();
  const { orders, customers, products, addTrackSheet } = useData();
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  
  // Fix the problematic code in OrderHistory.tsx
  // Adjust the handleCreateTrackSheet function

  // Add type checking for the return value of addTrackSheet
  const handleCreateTrackSheet = () => {
    if (!selectedOrders.length) {
      toast({
        title: "Error",
        description: "Please select at least one order",
        variant: "destructive",
      });
      return;
    }

    // Create track sheet rows from orders
    const trackSheetRows = selectedOrders.map((orderId) => {
      const order = orders.find((o) => o.id === orderId);
      if (!order) return null;

      const customer = customers.find((c) => c.id === order.customerId);
      if (!customer) return null;

      // Map order items to quantities
      const quantities: Record<string, number | string> = {};
      order.items.forEach((item) => {
        const product = products.find((p) => p.id === item.productId);
        if (product) {
          quantities[product.name] = item.quantity;
        }
      });

      return {
        name: customer.name,
        customerId: customer.id,
        quantities,
        total: order.total || 0,
        amount: order.total || 0,
      };
    }).filter(Boolean) as TrackSheetRow[];

    // Create track sheet with the tracksheet data
    const trackSheetData = {
      name: `Track Sheet - ${format(new Date(), "dd/MM/yyyy")}`,
      date: format(new Date(), "yyyy-MM-dd"),
      rows: trackSheetRows,
      notes: "Created from orders",
    };

    const newTrackSheet = addTrackSheet(trackSheetData);
    
    if (newTrackSheet && newTrackSheet.id) {
      toast({
        title: "Success",
        description: "Track sheet created successfully",
      });
      navigate(`/track-sheet/${newTrackSheet.id}`);
    } else {
      toast({
        title: "Error",
        description: "Failed to create track sheet",
        variant: "destructive",
      });
    }
  };
  
  // Add the rest of the component
  return (
    <div>
      <h1>Order History</h1>
      {/* Add the rest of your component here */}
    </div>
  );
};

export default OrderHistory;
