
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function SupplierLedger() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold tracking-tight mb-6">Supplier Ledger</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Supplier Ledger</CardTitle>
          <CardDescription>Track financial transactions with suppliers</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Supplier Ledger functionality will be implemented here</p>
        </CardContent>
      </Card>
    </div>
  );
}
