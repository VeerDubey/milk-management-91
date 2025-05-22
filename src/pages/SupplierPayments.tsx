
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function SupplierPayments() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold tracking-tight mb-6">Supplier Payments</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Supplier Payments</CardTitle>
          <CardDescription>Manage payments to suppliers</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Supplier Payments functionality will be implemented here</p>
        </CardContent>
      </Card>
    </div>
  );
}
