
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useData } from '@/contexts/data/DataContext';

export default function OutstandingAmounts() {
  const { customers } = useData();
  
  // Filter customers with outstanding balances
  const customersWithOutstanding = customers.filter(
    customer => customer.outstandingBalance && customer.outstandingBalance > 0
  );
  
  // Calculate total outstanding amount
  const totalOutstanding = customersWithOutstanding.reduce(
    (total, customer) => total + (customer.outstandingBalance || 0), 
    0
  );

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold tracking-tight mb-6">Outstanding Amounts</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Outstanding
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{totalOutstanding.toFixed(2)}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Customers with Dues
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{customersWithOutstanding.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Average Outstanding
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₹{customersWithOutstanding.length > 0 
                ? (totalOutstanding / customersWithOutstanding.length).toFixed(2) 
                : '0.00'}
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Outstanding Amounts</CardTitle>
          <CardDescription>Summary of all outstanding amounts from customers</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative w-full overflow-auto">
            <table className="w-full caption-bottom text-sm">
              <thead>
                <tr className="border-b">
                  <th className="h-12 px-4 text-left align-middle font-medium">Customer</th>
                  <th className="h-12 px-4 text-left align-middle font-medium">Outstanding Amount</th>
                  <th className="h-12 px-4 text-left align-middle font-medium">Last Payment</th>
                  <th className="h-12 px-4 text-left align-middle font-medium">Days Overdue</th>
                </tr>
              </thead>
              <tbody>
                {customersWithOutstanding.length > 0 ? (
                  customersWithOutstanding.map(customer => (
                    <tr key={customer.id} className="border-b">
                      <td className="p-4 align-middle font-medium">{customer.name}</td>
                      <td className="p-4 align-middle">₹{customer.outstandingBalance?.toFixed(2)}</td>
                      <td className="p-4 align-middle">
                        {customer.lastPaymentDate 
                          ? new Date(customer.lastPaymentDate).toLocaleDateString() 
                          : 'No payments'}
                      </td>
                      <td className="p-4 align-middle">
                        {customer.lastPaymentDate 
                          ? Math.floor((Date.now() - new Date(customer.lastPaymentDate).getTime()) / (1000 * 60 * 60 * 24))
                          : 'N/A'}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="p-4 text-center text-muted-foreground">
                      No outstanding amounts found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
