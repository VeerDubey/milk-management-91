
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DuesTable } from '@/components/outstanding-dues/DuesTable';
import { DuesFilters } from '@/components/outstanding-dues/DuesFilters';
import { DuesStatCards } from '@/components/outstanding-dues/DuesStatCards';

export default function OutstandingDues() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold tracking-tight mb-6">Outstanding Dues</h1>
      
      <DuesStatCards />
      
      <Card>
        <CardHeader>
          <CardTitle>Outstanding Customer Dues</CardTitle>
          <CardDescription>Track and manage customer outstanding payments</CardDescription>
        </CardHeader>
        <CardContent>
          <DuesFilters />
          <DuesTable />
        </CardContent>
      </Card>
    </div>
  );
}
