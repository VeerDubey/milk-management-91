
import { useState, useEffect } from 'react';
import { TrackSheet, TrackSheetRow } from '@/types';
import { toast } from 'sonner';
import { createTrackSheetTemplate, filterEmptyRows } from '@/utils/trackSheetUtils';

// Initial data if needed
const initialTrackSheets: TrackSheet[] = [];

export function useTrackSheetState() {
  const [trackSheets, setTrackSheets] = useState<TrackSheet[]>(() => {
    const saved = localStorage.getItem("trackSheets");
    try {
      return saved ? JSON.parse(saved) : initialTrackSheets;
    } catch (error) {
      console.error("Error parsing track sheets from localStorage:", error);
      return initialTrackSheets;
    }
  });

  const [trackSheetTemplates, setTrackSheetTemplates] = useState<any[]>(() => {
    const saved = localStorage.getItem("trackSheetTemplates");
    try {
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error("Error parsing track sheet templates from localStorage:", error);
      return [];
    }
  });

  // Save track sheets to localStorage when they change
  useEffect(() => {
    try {
      localStorage.setItem("trackSheets", JSON.stringify(trackSheets));
    } catch (error) {
      console.error("Error saving track sheets to localStorage:", error);
    }
  }, [trackSheets]);

  // Save track sheet templates to localStorage when they change
  useEffect(() => {
    try {
      localStorage.setItem("trackSheetTemplates", JSON.stringify(trackSheetTemplates));
    } catch (error) {
      console.error("Error saving track sheet templates to localStorage:", error);
    }
  }, [trackSheetTemplates]);

  // Add a new track sheet
  const addTrackSheet = (trackSheetData: Omit<TrackSheet, "id">) => {
    try {
      // Filter out empty rows
      const filteredRows = filterEmptyRows(trackSheetData.rows);
      
      if (filteredRows.length === 0) {
        toast.warning("Track sheet has no valid data rows");
        return null;
      }
      
      const newTrackSheet = {
        ...trackSheetData,
        id: `ts-${Date.now()}`,
        rows: filteredRows,
        createdAt: new Date().toISOString()
      };
      
      setTrackSheets(prev => [...prev, newTrackSheet]);
      toast.success("Track sheet created successfully");
      
      return newTrackSheet;
    } catch (error) {
      console.error("Error adding track sheet:", error);
      toast.error("Failed to create track sheet");
      return null;
    }
  };

  // Update an existing track sheet
  const updateTrackSheet = (id: string, updatedData: Partial<TrackSheet>) => {
    try {
      let updated = false;
      
      setTrackSheets(prev => 
        prev.map(sheet => {
          if (sheet.id === id) {
            updated = true;
            return { ...sheet, ...updatedData };
          }
          return sheet;
        })
      );
      
      if (updated) {
        toast.success("Track sheet updated successfully");
      } else {
        toast.error("Track sheet not found");
      }
    } catch (error) {
      console.error("Error updating track sheet:", error);
      toast.error("Failed to update track sheet");
    }
  };

  // Delete a track sheet
  const deleteTrackSheet = (id: string) => {
    try {
      setTrackSheets(prev => prev.filter(sheet => sheet.id !== id));
      toast.success("Track sheet deleted successfully");
    } catch (error) {
      console.error("Error deleting track sheet:", error);
      toast.error("Failed to delete track sheet");
    }
  };

  // Create a template from a track sheet
  const createTemplate = (name: string, rows: TrackSheetRow[]) => {
    try {
      const template = createTrackSheetTemplate(name, rows);
      setTrackSheetTemplates(prev => [...prev, template]);
      toast.success("Track sheet template created successfully");
      return template;
    } catch (error) {
      console.error("Error creating template:", error);
      toast.error("Failed to create template");
      return null;
    }
  };

  // Delete a template
  const deleteTemplate = (id: string) => {
    try {
      setTrackSheetTemplates(prev => prev.filter(template => template.id !== id));
      toast.success("Template deleted successfully");
    } catch (error) {
      console.error("Error deleting template:", error);
      toast.error("Failed to delete template");
    }
  };

  // Create track sheet from order data
  const createTrackSheetFromOrder = (orderData: any, products: any[], customers: any[]) => {
    try {
      if (!orderData || !orderData.items || orderData.items.length === 0) {
        toast.error("No order data available");
        return null;
      }
      
      const customer = customers.find(c => c.id === orderData.customerId);
      if (!customer) {
        toast.error("Customer not found");
        return null;
      }
      
      // Create quantities object from order items
      const quantities: Record<string, number | string> = {};
      orderData.items.forEach((item: any) => {
        const product = products.find(p => p.id === item.productId);
        if (product) {
          quantities[product.name] = item.quantity;
        }
      });
      
      // Create a single row track sheet for this order
      const trackSheetRow: TrackSheetRow = {
        customerId: customer.id,
        name: customer.name,
        quantities,
        total: orderData.items.reduce((sum: number, item: any) => sum + item.quantity, 0),
        amount: orderData.total || 0,
        products: products.map(p => p.name)
      };
      
      const trackSheetData = {
        name: `Track Sheet for Order - ${new Date().toLocaleString()}`,
        date: new Date().toISOString(),
        vehicleId: orderData.vehicleId || '',
        salesmanId: orderData.salesmanId || '',
        routeName: '',
        rows: [trackSheetRow],
        notes: `Created from order: ${orderData.id}`
      };
      
      return addTrackSheet(trackSheetData);
    } catch (error) {
      console.error("Error creating track sheet from order:", error);
      toast.error("Failed to create track sheet from order");
      return null;
    }
  };

  return {
    trackSheets,
    addTrackSheet,
    updateTrackSheet,
    deleteTrackSheet,
    trackSheetTemplates,
    createTemplate,
    deleteTemplate,
    createTrackSheetFromOrder
  };
}
