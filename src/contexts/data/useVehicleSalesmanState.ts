
import { useState, useEffect, useCallback } from 'react';
import { Vehicle, Salesman } from '@/types';
import { toast } from 'sonner';

export interface VehicleCreateData {
  registrationNumber: string;
  model: string;
  type: string;
  capacity: number;
  driverName?: string;
  driverContactNumber?: string;
  status: 'Available' | 'In Use' | 'Under Maintenance';
  notes?: string;
}

export interface SalesmanCreateData {
  name: string;
  contactNumber: string;
  email?: string;
  address?: string;
  joiningDate: string;
  status: 'Active' | 'Inactive' | 'On Leave';
  targetAmount?: number;
  commission?: number;
  notes?: string;
}

export function useVehicleSalesmanState() {
  const [vehicles, setVehicles] = useState<Vehicle[]>(() => {
    const saved = localStorage.getItem("vehicles");
    try {
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error("Error parsing vehicles from localStorage:", error);
      return [];
    }
  });
  
  const [salesmen, setSalesmen] = useState<Salesman[]>(() => {
    const saved = localStorage.getItem("salesmen");
    try {
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error("Error parsing salesmen from localStorage:", error);
      return [];
    }
  });

  // Save vehicles to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem("vehicles", JSON.stringify(vehicles));
    } catch (error) {
      console.error("Error saving vehicles to localStorage:", error);
      toast.error("Failed to save vehicles data");
    }
  }, [vehicles]);
  
  // Save salesmen to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem("salesmen", JSON.stringify(salesmen));
    } catch (error) {
      console.error("Error saving salesmen to localStorage:", error);
      toast.error("Failed to save salesmen data");
    }
  }, [salesmen]);

  // Vehicle CRUD Operations
  const addVehicle = useCallback((vehicleData: VehicleCreateData): Vehicle => {
    try {
      // Check if vehicle with same registration number already exists
      if (vehicles.some(v => v.registrationNumber === vehicleData.registrationNumber)) {
        throw new Error("A vehicle with this registration number already exists");
      }
      
      const newVehicle: Vehicle = {
        ...vehicleData,
        id: `v${Date.now()}`,
        createdAt: new Date().toISOString(),
        lastMaintenanceDate: null,
        trips: []
      };
      
      setVehicles(prev => [...prev, newVehicle]);
      return newVehicle;
    } catch (error) {
      console.error("Error adding vehicle:", error);
      toast.error(error instanceof Error ? error.message : "Failed to add vehicle");
      throw error;
    }
  }, [vehicles]);
  
  const updateVehicle = useCallback((id: string, vehicleData: Partial<Vehicle>): boolean => {
    try {
      let updated = false;
      
      // Check if registration number is being changed and already exists
      if (vehicleData.registrationNumber) {
        const exists = vehicles.some(v => 
          v.id !== id && v.registrationNumber === vehicleData.registrationNumber
        );
        
        if (exists) {
          throw new Error("A vehicle with this registration number already exists");
        }
      }
      
      setVehicles(prev => {
        const index = prev.findIndex(vehicle => vehicle.id === id);
        if (index === -1) return prev;
        
        updated = true;
        const updatedVehicles = [...prev];
        updatedVehicles[index] = { 
          ...updatedVehicles[index], 
          ...vehicleData,
          updatedAt: new Date().toISOString()
        };
        
        return updatedVehicles;
      });
      
      return updated;
    } catch (error) {
      console.error("Error updating vehicle:", error);
      toast.error(error instanceof Error ? error.message : "Failed to update vehicle");
      return false;
    }
  }, [vehicles]);
  
  const deleteVehicle = useCallback((id: string): boolean => {
    try {
      let deleted = false;
      
      setVehicles(prev => {
        const index = prev.findIndex(vehicle => vehicle.id === id);
        if (index === -1) return prev;
        
        deleted = true;
        const updatedVehicles = [...prev];
        updatedVehicles.splice(index, 1);
        
        return updatedVehicles;
      });
      
      return deleted;
    } catch (error) {
      console.error("Error deleting vehicle:", error);
      toast.error("Failed to delete vehicle");
      return false;
    }
  }, []);
  
  const getVehicleById = useCallback((id: string): Vehicle | undefined => {
    return vehicles.find(vehicle => vehicle.id === id);
  }, [vehicles]);
  
  const getVehicleByRegistration = useCallback((registrationNumber: string): Vehicle | undefined => {
    return vehicles.find(vehicle => vehicle.registrationNumber === registrationNumber);
  }, [vehicles]);
  
  const getAvailableVehicles = useCallback((): Vehicle[] => {
    return vehicles.filter(vehicle => vehicle.status === 'Available');
  }, [vehicles]);
  
  // Add vehicle trip
  const addVehicleTrip = useCallback((vehicleId: string, tripData: any): boolean => {
    try {
      let updated = false;
      
      setVehicles(prev => {
        const index = prev.findIndex(vehicle => vehicle.id === vehicleId);
        if (index === -1) return prev;
        
        updated = true;
        const updatedVehicles = [...prev];
        const vehicle = updatedVehicles[index];
        
        const newTrip = {
          ...tripData,
          id: `trip${Date.now()}`,
          date: tripData.date || new Date().toISOString(),
        };
        
        updatedVehicles[index] = {
          ...vehicle,
          trips: [...(vehicle.trips || []), newTrip],
          updatedAt: new Date().toISOString()
        };
        
        return updatedVehicles;
      });
      
      return updated;
    } catch (error) {
      console.error("Error adding vehicle trip:", error);
      toast.error("Failed to add trip");
      return false;
    }
  }, []);
  
  // Salesman CRUD Operations
  const addSalesman = useCallback((salesmanData: SalesmanCreateData): Salesman => {
    try {
      const newSalesman: Salesman = {
        ...salesmanData,
        id: `sm${Date.now()}`,
        createdAt: new Date().toISOString(),
        orders: [],
        achievements: []
      };
      
      setSalesmen(prev => [...prev, newSalesman]);
      return newSalesman;
    } catch (error) {
      console.error("Error adding salesman:", error);
      toast.error("Failed to add salesman");
      throw error;
    }
  }, []);
  
  const updateSalesman = useCallback((id: string, salesmanData: Partial<Salesman>): boolean => {
    try {
      let updated = false;
      
      setSalesmen(prev => {
        const index = prev.findIndex(salesman => salesman.id === id);
        if (index === -1) return prev;
        
        updated = true;
        const updatedSalesmen = [...prev];
        updatedSalesmen[index] = { 
          ...updatedSalesmen[index], 
          ...salesmanData,
          updatedAt: new Date().toISOString()
        };
        
        return updatedSalesmen;
      });
      
      return updated;
    } catch (error) {
      console.error("Error updating salesman:", error);
      toast.error("Failed to update salesman");
      return false;
    }
  }, []);
  
  const deleteSalesman = useCallback((id: string): boolean => {
    try {
      let deleted = false;
      
      setSalesmen(prev => {
        const index = prev.findIndex(salesman => salesman.id === id);
        if (index === -1) return prev;
        
        deleted = true;
        const updatedSalesmen = [...prev];
        updatedSalesmen.splice(index, 1);
        
        return updatedSalesmen;
      });
      
      return deleted;
    } catch (error) {
      console.error("Error deleting salesman:", error);
      toast.error("Failed to delete salesman");
      return false;
    }
  }, []);
  
  const getSalesmanById = useCallback((id: string): Salesman | undefined => {
    return salesmen.find(salesman => salesman.id === id);
  }, [salesmen]);
  
  const getActiveSalesmen = useCallback((): Salesman[] => {
    return salesmen.filter(salesman => salesman.status === 'Active');
  }, [salesmen]);
  
  // Add order to salesman
  const addSalesmanOrder = useCallback((salesmanId: string, orderData: any): boolean => {
    try {
      let updated = false;
      
      setSalesmen(prev => {
        const index = prev.findIndex(salesman => salesman.id === salesmanId);
        if (index === -1) return prev;
        
        updated = true;
        const updatedSalesmen = [...prev];
        const salesman = updatedSalesmen[index];
        
        updatedSalesmen[index] = {
          ...salesman,
          orders: [...(salesman.orders || []), orderData],
          updatedAt: new Date().toISOString()
        };
        
        return updatedSalesmen;
      });
      
      return updated;
    } catch (error) {
      console.error("Error adding salesman order:", error);
      toast.error("Failed to add order to salesman");
      return false;
    }
  }, []);

  return {
    // Vehicles
    vehicles,
    addVehicle,
    updateVehicle,
    deleteVehicle,
    getVehicleById,
    getVehicleByRegistration,
    getAvailableVehicles,
    addVehicleTrip,
    
    // Salesmen
    salesmen,
    addSalesman,
    updateSalesman,
    deleteSalesman,
    getSalesmanById,
    getActiveSalesmen,
    addSalesmanOrder
  };
}
