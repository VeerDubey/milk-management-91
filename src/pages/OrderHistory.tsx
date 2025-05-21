
// Fix the problematic code in OrderHistory.tsx
// Adjust the handleCreateTrackSheet function

// Add type checking for the return value of addTrackSheet
const handleCreateTrackSheet = () => {
  if (!selectedOrders.length) {
    toast.error("Please select at least one order");
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
  }).filter(Boolean);

  // Create track sheet with the tracksheet data
  const trackSheetData = {
    name: `Track Sheet - ${format(new Date(), "dd/MM/yyyy")}`,
    date: format(new Date(), "yyyy-MM-dd"),
    rows: trackSheetRows as TrackSheetRow[],
    notes: "Created from orders",
  };

  const newTrackSheet = addTrackSheet(trackSheetData);
  
  if (newTrackSheet) {
    toast.success("Track sheet created successfully");
    navigate(`/track-sheet/${newTrackSheet.id}`);
  } else {
    toast.error("Failed to create track sheet");
  }
};
