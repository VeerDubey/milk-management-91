
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function OutstandingDues() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold tracking-tight mb-6">Outstanding Dues</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Outstanding Dues</CardTitle>
          <CardDescription>Track and manage customer outstanding dues</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Outstanding Dues management functionality will be implemented here</p>
        </CardContent>
      </Card>
    </div>
  );
}
