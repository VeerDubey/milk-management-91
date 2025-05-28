
import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DatePicker } from '@/components/ui/date-picker';
import { Download, FileSpreadsheet, Calendar, BarChart3 } from 'lucide-react';
import { format, isWithinInterval, parseISO } from 'date-fns';
import { toast } from 'sonner';
import { useData } from '@/contexts/DataContext';
import { exportToExcel } from '@/utils/excelUtils';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Extend jsPDF type
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => void;
  }
}

interface ProductSummary {
  productName: string;
  totalQuantity: number;
  unit: string;
  totalOrders: number;
  averageQuantity: number;
}

export default function OrderSummarySheet() {
  const { orders, products } = useData();
  const [startDate, setStartDate] = useState<Date | undefined>(new Date());
  const [endDate, setEndDate] = useState<Date | undefined>(new Date());
  const [singleDate, setSingleDate] = useState<Date | undefined>(new Date());
  const [dateMode, setDateMode] = useState<'single' | 'range'>('single');
  
  // Calculate product summary based on selected date(s)
  const productSummary = useMemo(() => {
    let filteredOrders = orders;
    
    // Filter orders by date
    if (dateMode === 'single' && singleDate) {
      const targetDate = format(singleDate, 'yyyy-MM-dd');
      filteredOrders = orders.filter(order => order.date === targetDate);
    } else if (dateMode === 'range' && startDate && endDate) {
      filteredOrders = orders.filter(order => {
        const orderDate = parseISO(order.date);
        return isWithinInterval(orderDate, { start: startDate, end: endDate });
      });
    }
    
    // Aggregate product data
    const productMap = new Map<string, ProductSummary>();
    
    filteredOrders.forEach(order => {
      order.items.forEach(item => {
        const product = products.find(p => p.id === item.productId);
        const productName = item.productName || product?.name || 'Unknown Product';
        const unit = item.unit || product?.unit || 'unit';
        
        if (productMap.has(productName)) {
          const existing = productMap.get(productName)!;
          existing.totalQuantity += item.quantity;
          existing.totalOrders += 1;
          existing.averageQuantity = existing.totalQuantity / existing.totalOrders;
        } else {
          productMap.set(productName, {
            productName,
            totalQuantity: item.quantity,
            unit,
            totalOrders: 1,
            averageQuantity: item.quantity
          });
        }
      });
    });
    
    return Array.from(productMap.values()).sort((a, b) => b.totalQuantity - a.totalQuantity);
  }, [orders, products, singleDate, startDate, endDate, dateMode]);
  
  const totalQuantity = productSummary.reduce((sum, item) => sum + item.totalQuantity, 0);
  const totalProducts = productSummary.length;
  
  const handleExportPdf = () => {
    try {
      const doc = new jsPDF();
      (doc as any).autoTable = autoTable.bind(doc);
      
      // Header
      doc.setFontSize(20);
      doc.setTextColor(139, 92, 246);
      doc.text('Order Summary Report', 20, 20);
      
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      
      let dateText = '';
      if (dateMode === 'single' && singleDate) {
        dateText = `Date: ${format(singleDate, 'PPP')}`;
      } else if (dateMode === 'range' && startDate && endDate) {
        dateText = `Period: ${format(startDate, 'PPP')} - ${format(endDate, 'PPP')}`;
      }
      
      doc.text(dateText, 20, 35);
      doc.text(`Generated on: ${format(new Date(), 'PPP')}`, 20, 45);
      
      // Summary stats
      doc.text(`Total Products: ${totalProducts}`, 20, 60);
      doc.text(`Total Quantity: ${totalQuantity}`, 20, 70);
      
      // Table data
      const headers = ['Product Name', 'Total Quantity', 'Unit', 'Total Orders', 'Avg Quantity'];
      const data = productSummary.map(item => [
        item.productName,
        item.totalQuantity.toString(),
        item.unit,
        item.totalOrders.toString(),
        item.averageQuantity.toFixed(2)
      ]);
      
      (doc as any).autoTable({
        head: [headers],
        body: data,
        startY: 80,
        theme: 'grid',
        headStyles: {
          fillColor: [139, 92, 246],
          textColor: [255, 255, 255],
          fontSize: 10,
          fontStyle: 'bold'
        },
        bodyStyles: {
          fontSize: 9,
          textColor: [0, 0, 0]
        },
        alternateRowStyles: {
          fillColor: [248, 249, 250]
        }
      });
      
      const filename = `order-summary-${format(new Date(), 'yyyy-MM-dd')}.pdf`;
      doc.save(filename);
      toast.success('PDF exported successfully');
    } catch (error) {
      console.error('Error exporting PDF:', error);
      toast.error('Failed to export PDF');
    }
  };
  
  const handleExportExcel = () => {
    try {
      const headers = ['Product Name', 'Total Quantity', 'Unit', 'Total Orders', 'Average Quantity'];
      const data = productSummary.map(item => [
        item.productName,
        item.totalQuantity,
        item.unit,
        item.totalOrders,
        Number(item.averageQuantity.toFixed(2))
      ]);
      
      const filename = `order-summary-${format(new Date(), 'yyyy-MM-dd')}`;
      exportToExcel(headers, data, filename);
      toast.success('Excel file exported successfully');
    } catch (error) {
      console.error('Error exporting Excel:', error);
      toast.error('Failed to export Excel');
    }
  };
  
  return (
    <div className="space-y-6">
      <Card className="modern-card">
        <CardHeader>
          <CardTitle className="text-gradient flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Order Summary Sheet
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Date Selection */}
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <Label>Date Selection:</Label>
              <div className="flex gap-2">
                <Button
                  variant={dateMode === 'single' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setDateMode('single')}
                >
                  Single Date
                </Button>
                <Button
                  variant={dateMode === 'range' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setDateMode('range')}
                >
                  Date Range
                </Button>
              </div>
            </div>
            
            {dateMode === 'single' ? (
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <DatePicker
                  date={singleDate}
                  setDate={setSingleDate}
                  placeholderText="Select date"
                />
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Label>From:</Label>
                  <DatePicker
                    date={startDate}
                    setDate={setStartDate}
                    placeholderText="Start date"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Label>To:</Label>
                  <DatePicker
                    date={endDate}
                    setDate={setEndDate}
                    placeholderText="End date"
                  />
                </div>
              </div>
            )}
          </div>
          
          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="glass-card p-4 text-center">
              <div className="text-2xl font-bold text-gradient">{totalProducts}</div>
              <div className="text-sm text-muted-foreground">Total Products</div>
            </div>
            <div className="glass-card p-4 text-center">
              <div className="text-2xl font-bold text-gradient">{totalQuantity}</div>
              <div className="text-sm text-muted-foreground">Total Quantity</div>
            </div>
            <div className="glass-card p-4 text-center">
              <div className="text-2xl font-bold text-gradient">
                {productSummary.reduce((sum, item) => sum + item.totalOrders, 0)}
              </div>
              <div className="text-sm text-muted-foreground">Total Orders</div>
            </div>
          </div>
          
          {/* Export Buttons */}
          <div className="flex gap-2">
            <Button onClick={handleExportPdf} className="modern-button">
              <Download className="h-4 w-4 mr-2" />
              Export PDF
            </Button>
            <Button onClick={handleExportExcel} variant="outline">
              <FileSpreadsheet className="h-4 w-4 mr-2" />
              Export Excel
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {/* Summary Table */}
      <Card className="modern-card">
        <CardHeader>
          <CardTitle>Product Summary</CardTitle>
        </CardHeader>
        <CardContent>
          {productSummary.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No orders found for the selected date(s)
            </div>
          ) : (
            <Table className="modern-table">
              <TableHeader className="modern-table-header">
                <TableRow>
                  <TableHead>Product Name</TableHead>
                  <TableHead className="text-right">Total Quantity</TableHead>
                  <TableHead>Unit</TableHead>
                  <TableHead className="text-right">Total Orders</TableHead>
                  <TableHead className="text-right">Avg Quantity</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {productSummary.map((item, index) => (
                  <TableRow key={index} className="modern-table-row">
                    <TableCell className="font-medium">{item.productName}</TableCell>
                    <TableCell className="text-right">{item.totalQuantity}</TableCell>
                    <TableCell>{item.unit}</TableCell>
                    <TableCell className="text-right">{item.totalOrders}</TableCell>
                    <TableCell className="text-right">{item.averageQuantity.toFixed(2)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
