
import { useState, useEffect } from 'react';
import { Vehicle, Salesman, VehicleTrip } from '@/types';

// Initial dummy data
const initialVehicles: Vehicle[] = [];
const initialSalesmen: Salesman[] = [];
const initialVehicleTrips: VehicleTrip[] = [];

export function useVehicleSalesmanState() {
  // Vehicle state
  const [vehicles, setVehicles] = useState<Vehicle[]>(() => {
    const saved = localStorage.getItem('vehicles');
    return saved ? JSON.parse(saved) : initialVehicles;
  });

  // Salesman state
  const [salesmen, setSalesmen] = useState<Salesman[]>(() => {
    const saved = localStorage.getItem('salesmen');
    return saved ? JSON.parse(saved) : initialSalesmen;
  });
  
  // Vehicle trips state
  const [vehicleTrips, setVehicleTrips] = useState<VehicleTrip[]>(() => {
    const saved = localStorage.getItem('vehicleTrips');
    return saved ? JSON.parse(saved) : initialVehicleTrips;
  });

  // Save to localStorage when state changes
  useEffect(() => {
    localStorage.setItem('vehicles', JSON.stringify(vehicles));
  }, [vehicles]);

  useEffect(() => {
    localStorage.setItem('salesmen', JSON.stringify(salesmen));
  }, [salesmen]);
  
  useEffect(() => {
    localStorage.setItem('vehicleTrips', JSON.stringify(vehicleTrips));
  }, [vehicleTrips]);

  // Vehicle CRUD operations
  const addVehicle = (vehicle: Omit<Vehicle, 'id'>) => {
    const newVehicle = {
      ...vehicle,
      id: `v-${Date.now()}`
    };
    setVehicles([...vehicles, newVehicle]);
    return newVehicle;
  };

  const updateVehicle = (id: string, vehicleData: Partial<Vehicle>) => {
    setVehicles(
      vehicles.map(vehicle => 
        vehicle.id === id ? { ...vehicle, ...vehicleData } : vehicle
      )
    );
  };

  const deleteVehicle = (id: string) => {
    setVehicles(vehicles.filter(vehicle => vehicle.id !== id));
  };

  // Salesman CRUD operations
  const addSalesman = (salesman: Omit<Salesman, 'id'>) => {
    const newSalesman = {
      ...salesman,
      id: `s-${Date.now()}`
    };
    setSalesmen([...salesmen, newSalesman]);
    return newSalesman;
  };

  const updateSalesman = (id: string, salesmanData: Partial<Salesman>) => {
    setSalesmen(
      salesmen.map(salesman =>
        salesman.id === id ? { ...salesman, ...salesmanData } : salesman
      )
    );
  };

  const deleteSalesman = (id: string) => {
    setSalesmen(salesmen.filter(salesman => salesman.id !== id));
  };
  
  // Vehicle trip operations
  const addVehicleTrip = (trip: Omit<VehicleTrip, 'id'>) => {
    const newTrip = {
      ...trip,
      id: `trip-${Date.now()}`
    };
    setVehicleTrips([...vehicleTrips, newTrip]);
    return newTrip;
  };

  return {
    vehicles,
    addVehicle,
    updateVehicle,
    deleteVehicle,
    salesmen,
    addSalesman,
    updateSalesman,
    deleteSalesman,
    vehicleTrips,
    addVehicleTrip
  };
}
