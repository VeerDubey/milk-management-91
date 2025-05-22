
import React from 'react';
import { useData } from '@/contexts/DataContext';
import { format } from 'date-fns';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Printer, Download, FileText } from 'lucide-react';
import { generateTrackSheetPdf, savePdf } from '@/utils/trackSheetUtils';

interface TrackSheetDetailsProps {
  trackSheet: any;
}

export const TrackSheetDetails = ({ trackSheet }: TrackSheetDetailsProps) => {
  const { products, vehicles, salesmen } = useData();
  
  const vehicle = vehicles.find(v => v.id === trackSheet.vehicleId);
  const salesman = salesmen.find(s => s.id === trackSheet.salesmanId);
  
  // Get all product names used in the track sheet
  const usedProductNames = new Set<string>();
  trackSheet.rows.forEach((row: any) => {
    if (row.quantities) {
      Object.keys(row.quantities).forEach(productName => {
        if (row.quantities[productName] !== '' && row.quantities[productName] !== 0) {
          usedProductNames.add(productName);
        }
      });
    }
  });
  
  const productNames = Array.from(usedProductNames);
  
  // Calculate totals
  const productTotals: Record<string, number> = {};
  productNames.forEach(name => {
    productTotals[name] = 0;
  });
  
  trackSheet.rows.forEach((row: any) => {
    if (row.quantities) {
      productNames.forEach(name => {
        const qty = row.quantities[name];
        if (qty !== '' && qty !== undefined) {
          productTotals[name] += Number(qty);
        }
      });
    }
  });
  
  const totalQuantity = Object.values(productTotals).reduce((sum, val) => sum + Number(val), 0);
  
  // Handle printing
  const handlePrint = () => {
    const doc = generateTrackSheetPdf(trackSheet, productNames, []);
    doc.autoPrint();
    savePdf(doc, `tracksheet-${format(new Date(trackSheet.date), 'yyyy-MM-dd')}.pdf`);
  };
  
  // Handle download
  const handleDownload = () => {
    const doc = generateTrackSheetPdf(trackSheet, productNames, []);
    savePdf(doc, `tracksheet-${format(new Date(trackSheet.date), 'yyyy-MM-dd')}.pdf`);
  };
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">{trackSheet.name || 'Track Sheet'}</h3>
          <p className="text-sm text-muted-foreground">
            {trackSheet.date && format(new Date(trackSheet.date), 'PP')}
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" onClick={handlePrint}>
            <Printer className="mr-2 h-4 w-4" />
            Print
          </Button>
          <Button variant="outline" size="sm" onClick={handleDownload}>
            <Download className="mr-2 h-4 w-4" />
            Download PDF
          </Button>
        </div>
      </div>
      
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <p className="text-sm font-medium">Vehicle</p>
              <p>{vehicle?.name || 'Not assigned'}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Salesman</p>
              <p>{salesman?.name || 'Not assigned'}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Route</p>
              <p>{trackSheet.routeName || 'Not specified'}</p>
            </div>
          </div>
          
          {trackSheet.notes && (
            <div className="mb-4">
              <p className="text-sm font-medium">Notes</p>
              <p className="text-sm">{trackSheet.notes}</p>
            </div>
          )}
        </CardContent>
      </Card>
      
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Customer</TableHead>
              {productNames.map((name, idx) => (
                <TableHead key={idx}>{name}</TableHead>
              ))}
              <TableHead>Total</TableHead>
              <TableHead>Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {trackSheet.rows.map((row: any, idx: number) => (
              <TableRow key={idx}>
                <TableCell className="font-medium">{row.name}</TableCell>
                {productNames.map((name, productIdx) => (
                  <TableCell key={productIdx}>
                    {row.quantities && row.quantities[name] !== '' ? (
                      <Badge variant="outline">
                        {row.quantities[name]}
                      </Badge>
                    ) : (
                      '-'
                    )}
                  </TableCell>
                ))}
                <TableCell>{row.total}</TableCell>
                <TableCell>₹{row.amount?.toFixed(2) || '0.00'}</TableCell>
              </TableRow>
            ))}
            <TableRow className="font-semibold bg-muted/50">
              <TableCell>TOTAL</TableCell>
              {productNames.map((name, productIdx) => (
                <TableCell key={productIdx}>
                  <Badge>{productTotals[name] || 0}</Badge>
                </TableCell>
              ))}
              <TableCell>{totalQuantity}</TableCell>
              <TableCell>
                ₹{trackSheet.rows.reduce((sum: number, row: any) => sum + (row.amount || 0), 0).toFixed(2)}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
