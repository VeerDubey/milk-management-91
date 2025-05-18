
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Truck, Phone, Mail, MapPin, Plus } from "lucide-react";

const SupplierDirectory = () => {
  // Sample data - in a real app, this would come from the data context
  const suppliers = [
    {
      id: "sup1",
      name: "Farmfresh Dairy",
      contact: "John Smith",
      phone: "+91 98765 43210",
      email: "contact@farmfreshdairy.com",
      address: "123 Rural Area, Milk County",
      status: "Active"
    },
    {
      id: "sup2",
      name: "Organic Milk Co.",
      contact: "Sarah Johnson",
      phone: "+91 87654 32109",
      email: "info@organicmilk.com",
      address: "456 Green Pastures, Dairy District",
      status: "Active"
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Supplier Directory</h1>
          <p className="text-muted-foreground">
            Manage your suppliers and their contact information
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Supplier
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {suppliers.map((supplier) => (
          <Card key={supplier.id} className="overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-indigo-800 to-purple-800 text-white">
              <CardTitle className="flex items-center justify-between">
                <span>{supplier.name}</span>
                <Truck className="h-5 w-5" />
              </CardTitle>
              <p className="text-sm text-gray-200">{supplier.status}</p>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="space-y-2">
                <p className="font-medium">Contact Person</p>
                <p className="text-sm text-muted-foreground">{supplier.contact}</p>
              </div>
              <div className="grid grid-cols-1 gap-2">
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{supplier.phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{supplier.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{supplier.address}</span>
                </div>
              </div>
              <div className="flex justify-end space-x-2 pt-4">
                <Button size="sm" variant="outline">Details</Button>
                <Button size="sm">Contact</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default SupplierDirectory;
