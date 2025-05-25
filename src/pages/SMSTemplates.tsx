
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function SMSTemplates() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold tracking-tight mb-6">SMS Templates</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>SMS Templates</CardTitle>
          <CardDescription>Create and manage SMS templates for communication</CardDescription>
        </CardHeader>
        <CardContent>
          <p>SMS Templates management will be implemented here</p>
        </CardContent>
      </Card>
    </div>
  );
}
