import React from 'react';
import { TrackSheet } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Download, Printer } from 'lucide-react';
import { calculateProductTotals } from '@/utils/trackSheetUtils';

interface TrackSheetDetailsProps {
  trackSheet: TrackSheet;
}

export function TrackSheetDetails({ trackSheet }: TrackSheetDetailsProps) {
  // Extract product names from the first row's quantities
  const productNames = trackSheet.rows.length > 0 
    ? Object.keys(trackSheet.rows[0].quantities) 
    : [];
  
  // Calculate product totals
  const productTotals = calculateProductTotals(trackSheet.rows, productNames);
  
  // Calculate grand totals
  const totalQuantity = trackSheet.rows.reduce((sum, row) => sum + row.total, 0);
  const totalAmount = trackSheet.rows.reduce((sum, row) => sum + row.amount, 0);
  
  const handlePrint = () => {
    window.print();
  };
  
  const handleDownload = () => {
    // This would be implemented in a real app
    console.log('Download functionality would be implemented here');
  };

  return (
    <div className="space-y-6 print:p-10">
      <div className="flex justify-between items-center print:hidden">
        <h2 className="text-2xl font-bold">{trackSheet.name}</h2>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" onClick={handlePrint}>
            <Printer className="mr-2 h-4 w-4" />
            Print
          </Button>
          <Button variant="outline" size="sm" onClick={handleDownload}>
            <Download className="mr-2 h-4 w-4" />
            Download
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Date</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{format(new Date(trackSheet.date), 'PPP')}</p>
          </CardContent>
        </Card>
        
        {trackSheet.vehicleName && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Vehicle</CardTitle>
            </CardHeader>
            <CardContent>
              <p>{trackSheet.vehicleName}</p>
            </CardContent>
          </Card>
        )}
        
        {trackSheet.salesmanName && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Salesman</CardTitle>
            </CardHeader>
            <CardContent>
              <p>{trackSheet.salesmanName}</p>
            </CardContent>
          </Card>
        )}
        
        {trackSheet.routeName && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Route</CardTitle>
            </CardHeader>
            <CardContent>
              <p>{trackSheet.routeName}</p>
            </CardContent>
          </Card>
        )}
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Distribution Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  {productNames.map(product => (
                    <TableHead key={product} className="text-center">{product}</TableHead>
                  ))}
                  <TableHead className="text-center">Total</TableHead>
                  <TableHead className="text-center">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {trackSheet.rows.map((row, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{row.name}</TableCell>
                    {productNames.map(product => (
                      <TableCell key={product} className="text-center">
                        {row.quantities[product] || ''}
                      </TableCell>
                    ))}
                    <TableCell className="text-center">{row.total}</TableCell>
                    <TableCell className="text-center">₹{row.amount}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
              <tfoot>
                <TableRow>
                  <TableCell className="font-bold">Total</TableCell>
                  {productNames.map(product => (
                    <TableCell key={product} className="text-center font-bold">
                      {productTotals[product] || 0}
                    </TableCell>
                  ))}
                  <TableCell className="text-center font-bold">{totalQuantity}</TableCell>
                  <TableCell className="text-center font-bold">₹{totalAmount}</TableCell>
                </TableRow>
              </tfoot>
            </Table>
          </div>
        </CardContent>
      </Card>
      
      {trackSheet.createdAt && (
        <div className="text-sm text-muted-foreground text-right print:hidden">
          Created: {format(new Date(trackSheet.createdAt), 'PPP p')}
          {trackSheet.savedAt && ` • Last saved: ${format(new Date(trackSheet.savedAt), 'PPP p')}`}
        </div>
      )}
    </div>
  );
}
