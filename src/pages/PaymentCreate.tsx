
import React from 'react';
import { useData } from '@/contexts/data/DataContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function PaymentCreate() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold tracking-tight mb-6">Create Payment</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Create New Payment</CardTitle>
          <CardDescription>Record a new payment from customer</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Payment creation form will be implemented here</p>
        </CardContent>
      </Card>
    </div>
  );
}
