
import { useState, useEffect } from 'react';
import { Vehicle, Salesman } from '@/types';

export function useVehicleSalesmanState() {
  const [vehicles, setVehicles] = useState<Vehicle[]>(() => {
    const saved = localStorage.getItem("vehicles");
    return saved ? JSON.parse(saved) : [];
  });
  
  const [salesmen, setSalesmen] = useState<Salesman[]>(() => {
    const saved = localStorage.getItem("salesmen");
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem("vehicles", JSON.stringify(vehicles));
  }, [vehicles]);
  
  useEffect(() => {
    localStorage.setItem("salesmen", JSON.stringify(salesmen));
  }, [salesmen]);

  const addVehicle = (vehicle: Omit<Vehicle, "id">) => {
    const newVehicle = {
      ...vehicle,
      id: `v${Date.now()}`
    };
    setVehicles([...vehicles, newVehicle]);
    return newVehicle; // Return the newly created vehicle
  };
  
  const updateVehicle = (id: string, vehicleData: Partial<Vehicle>) => {
    setVehicles(
      vehicles.map((vehicle) =>
        vehicle.id === id ? { ...vehicle, ...vehicleData } : vehicle
      )
    );
  };
  
  const deleteVehicle = (id: string) => {
    setVehicles(vehicles.filter((vehicle) => vehicle.id !== id));
  };
  
  const addSalesman = (salesman: Omit<Salesman, "id">) => {
    const newSalesman = {
      ...salesman,
      id: `sm${Date.now()}`
    };
    setSalesmen([...salesmen, newSalesman]);
    return newSalesman; // Return the newly created salesman
  };
  
  const updateSalesman = (id: string, salesmanData: Partial<Salesman>) => {
    setSalesmen(
      salesmen.map((salesman) =>
        salesman.id === id ? { ...salesman, ...salesmanData } : salesman
      )
    );
  };
  
  const deleteSalesman = (id: string) => {
    setSalesmen(salesmen.filter((salesman) => salesman.id !== id));
  };

  return {
    vehicles,
    salesmen,
    addVehicle,
    updateVehicle,
    deleteVehicle,
    addSalesman,
    updateSalesman,
    deleteSalesman
  };
}
