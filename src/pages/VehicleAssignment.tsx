
import React, { useState } from 'react';
import { useData } from '@/contexts/DataContext';
import { VehicleAssignment } from '@/components/track-sheet/VehicleAssignment';
import { Customer, TrackSheet as TrackSheetType, TrackSheetRow } from '@/types';
import { format } from 'date-fns';
import { toast } from 'sonner';

export default function VehicleAssignmentPage() {
  const { 
    customers, 
    vehicles, 
    salesmen, 
    products,
    addTrackSheet 
  } = useData();

  const handleGenerateTrackSheet = (vehicleId: string, salesmanId: string, assignedCustomers: any[]) => {
    // Get vehicle and salesman details
    const vehicle = vehicles.find(v => v.id === vehicleId);
    const salesman = salesmen.find(s => s.id === salesmanId);
    
    if (!vehicle) {
      toast.error("Vehicle not found");
      return;
    }
    
    // Get active products
    const activeProducts = products.filter(p => p.isActive);
    const productNames = activeProducts.map(p => p.name);
    
    // Create rows for the track sheet
    const rows: TrackSheetRow[] = assignedCustomers.map(customer => ({
      name: customer.name,
      customerId: customer.id,
      quantities: productNames.reduce((acc, productName) => {
        acc[productName] = '';
        return acc;
      }, {} as Record<string, string | number>),
      total: 0,
      amount: 0,
      products: productNames
    }));
    
    // Create the track sheet
    const trackSheet: Omit<TrackSheetType, 'id'> = {
      date: format(new Date(), 'yyyy-MM-dd'),
      vehicleId,
      vehicleName: vehicle.name,
      salesmanId: salesmanId || undefined,
      salesmanName: salesman?.name,
      routeName: `${vehicle.name} Route - ${format(new Date(), 'MMM d')}`,
      name: `${vehicle.name} Track Sheet - ${format(new Date(), 'yyyy-MM-dd')}`,
      rows,
      createdAt: new Date().toISOString(),
      // Store delivery details in the sheet metadata
      deliveryDetails: assignedCustomers.reduce((acc, customer) => {
        acc[customer.id] = {
          time: customer.deliveryTime || '',
          notes: customer.deliveryNotes || ''
        };
        return acc;
      }, {})
    };
    
    // Save the track sheet
    const newSheet = addTrackSheet(trackSheet);
    
    // Check if newSheet exists and has an id before redirecting
    if (newSheet && 'id' in newSheet) {
      // Redirect to edit the newly created track sheet
      window.location.href = `/track-sheet?id=${newSheet.id}`;
    } else {
      toast.error("Failed to create track sheet");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Vehicle Assignment</h1>
        <p className="text-muted-foreground">
          Assign customers to vehicles and generate track sheets
        </p>
      </div>
      
      <VehicleAssignment 
        vehicles={vehicles}
        salesmen={salesmen}
        customers={customers}
        onGenerateTrackSheet={handleGenerateTrackSheet}
      />
    </div>
  );
}
