
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function OutstandingAmounts() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold tracking-tight mb-6">Outstanding Amounts</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Outstanding Amounts</CardTitle>
          <CardDescription>Overview of all outstanding payment amounts</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Outstanding Amounts functionality will be implemented here</p>
        </CardContent>
      </Card>
    </div>
  );
}
