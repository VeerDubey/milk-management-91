
import { useState, useEffect } from 'react';
import { Vehicle } from '@/types';

export function useVehicleState() {
  const [vehicles, setVehicles] = useState<Vehicle[]>(() => {
    const saved = localStorage.getItem("vehicles");
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem("vehicles", JSON.stringify(vehicles));
  }, [vehicles]);

  const addVehicle = (vehicle: Omit<Vehicle, "id">) => {
    const newVehicle = {
      ...vehicle,
      id: `v${Date.now()}`
    };
    setVehicles([...vehicles, newVehicle]);
    return newVehicle;
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

  return {
    vehicles,
    addVehicle,
    updateVehicle,
    deleteVehicle
  };
}
