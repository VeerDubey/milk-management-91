
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function SupplierRates() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold tracking-tight mb-6">Supplier Rates</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Supplier Rates</CardTitle>
          <CardDescription>Manage pricing from your suppliers</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Supplier Rates functionality will be implemented here</p>
        </CardContent>
      </Card>
    </div>
  );
}
