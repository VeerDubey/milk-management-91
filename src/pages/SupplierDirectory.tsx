
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function SupplierDirectory() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold tracking-tight mb-6">Supplier Directory</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Supplier Directory</CardTitle>
          <CardDescription>Manage your suppliers and vendor information</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Supplier Directory functionality will be implemented here</p>
        </CardContent>
      </Card>
    </div>
  );
}
