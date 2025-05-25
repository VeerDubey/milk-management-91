
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function TaxSettings() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold tracking-tight mb-6">Tax Settings</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Tax Settings</CardTitle>
          <CardDescription>Configure tax rates and settings</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Tax Settings functionality will be implemented here</p>
        </CardContent>
      </Card>
    </div>
  );
}
