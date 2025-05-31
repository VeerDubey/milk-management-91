
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Building2, Plus, TrendingUp, TrendingDown, Package, CreditCard } from 'lucide-react';
import { toast } from 'sonner';

interface Purchase {
  id: string;
  supplierId: string;
  supplierName: string;
  products: PurchaseItem[];
  totalAmount: number;
  paidAmount: number;
  balance: number;
  date: string;
  status: 'paid' | 'partial' | 'pending';
}

interface PurchaseItem {
  product: string;
  quantity: number;
  rate: number;
  amount: number;
}

interface SupplierLedger {
  supplierId: string;
  supplierName: string;
  totalPurchases: number;
  totalPaid: number;
  balanceDue: number;
  lastPurchaseDate: string;
}

export function PurchaseTracker() {
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState('');

  // Mock data
  const supplierLedgers: SupplierLedger[] = [
    { supplierId: '1', supplierName: 'MOTHER DAIRY SUPPLIER', totalPurchases: 150000, totalPaid: 140000, balanceDue: 10000, lastPurchaseDate: '2025-05-29' },
    { supplierId: '2', supplierName: 'FRESH FARM DAIRY', totalPurchases: 85000, totalPaid: 85000, balanceDue: 0, lastPurchaseDate: '2025-05-28' },
    { supplierId: '3', supplierName: 'GOLDEN MILK SUPPLIER', totalPurchases: 120000, totalPaid: 100000, balanceDue: 20000, lastPurchaseDate: '2025-05-30' },
  ];

  const recentPurchases: Purchase[] = [
    {
      id: '1',
      supplierId: '1',
      supplierName: 'MOTHER DAIRY SUPPLIER',
      products: [
        { product: 'Full Cream Milk', quantity: 500, rate: 50, amount: 25000 },
        { product: 'Toned Milk', quantity: 300, rate: 40, amount: 12000 }
      ],
      totalAmount: 37000,
      paidAmount: 30000,
      balance: 7000,
      date: '2025-05-30',
      status: 'partial'
    },
    {
      id: '2',
      supplierId: '2',
      supplierName: 'FRESH FARM DAIRY',
      products: [
        { product: 'Buffalo Milk', quantity: 200, rate: 60, amount: 12000 }
      ],
      totalAmount: 12000,
      paidAmount: 12000,
      balance: 0,
      date: '2025-05-29',
      status: 'paid'
    }
  ];

  const totalOutstanding = supplierLedgers.reduce((sum, ledger) => sum + ledger.balanceDue, 0);
  const totalPurchases = supplierLedgers.reduce((sum, ledger) => sum + ledger.totalPurchases, 0);

  return (
    <div className="space-y-6">
      {/* Purchase Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="neo-noir-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="neo-noir-text-muted text-sm font-medium">Total Purchases</p>
                <p className="text-2xl font-bold text-blue-400">₹{totalPurchases.toLocaleString()}</p>
              </div>
              <Package className="h-8 w-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="neo-noir-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="neo-noir-text-muted text-sm font-medium">Outstanding to Suppliers</p>
                <p className="text-2xl font-bold text-orange-400">₹{totalOutstanding.toLocaleString()}</p>
              </div>
              <TrendingDown className="h-8 w-8 text-orange-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="neo-noir-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="neo-noir-text-muted text-sm font-medium">Active Suppliers</p>
                <p className="text-2xl font-bold text-green-400">{supplierLedgers.length}</p>
              </div>
              <Building2 className="h-8 w-8 text-green-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Supplier Ledger */}
      <Card className="neo-noir-card">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="neo-noir-text">Supplier Ledger</CardTitle>
              <CardDescription className="neo-noir-text-muted">
                Track supplier balances and purchase history
              </CardDescription>
            </div>
            <Button 
              onClick={() => setShowPurchaseModal(true)}
              className="neo-noir-button-accent"
            >
              <Plus className="mr-2 h-4 w-4" />
              New Purchase
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table className="neo-noir-table">
            <TableHeader>
              <TableRow className="neo-noir-table-header">
                <TableHead>Supplier</TableHead>
                <TableHead className="text-right">Total Purchases</TableHead>
                <TableHead className="text-right">Total Paid</TableHead>
                <TableHead className="text-right">Balance Due</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="text-center">Last Purchase</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {supplierLedgers.map((ledger) => (
                <TableRow key={ledger.supplierId} className="neo-noir-table-row">
                  <TableCell className="font-medium">{ledger.supplierName}</TableCell>
                  <TableCell className="text-right">₹{ledger.totalPurchases.toLocaleString()}</TableCell>
                  <TableCell className="text-right text-green-400">₹{ledger.totalPaid.toLocaleString()}</TableCell>
                  <TableCell className="text-right text-orange-400">₹{ledger.balanceDue.toLocaleString()}</TableCell>
                  <TableCell className="text-center">
                    <Badge variant={ledger.balanceDue === 0 ? "default" : "destructive"}>
                      {ledger.balanceDue === 0 ? 'Clear' : 'Outstanding'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">{ledger.lastPurchaseDate}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Recent Purchases */}
      <Card className="neo-noir-card">
        <CardHeader>
          <CardTitle className="neo-noir-text">Recent Purchases</CardTitle>
          <CardDescription className="neo-noir-text-muted">
            Latest purchase transactions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table className="neo-noir-table">
            <TableHeader>
              <TableRow className="neo-noir-table-header">
                <TableHead>Supplier</TableHead>
                <TableHead>Products</TableHead>
                <TableHead className="text-right">Total Amount</TableHead>
                <TableHead className="text-right">Paid</TableHead>
                <TableHead className="text-right">Balance</TableHead>
                <TableHead className="text-center">Date</TableHead>
                <TableHead className="text-center">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentPurchases.map((purchase) => (
                <TableRow key={purchase.id} className="neo-noir-table-row">
                  <TableCell className="font-medium">{purchase.supplierName}</TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      {purchase.products.map((item, index) => (
                        <div key={index} className="text-sm">
                          {item.product} ({item.quantity}L @ ₹{item.rate})
                        </div>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">₹{purchase.totalAmount.toLocaleString()}</TableCell>
                  <TableCell className="text-right text-green-400">₹{purchase.paidAmount.toLocaleString()}</TableCell>
                  <TableCell className="text-right text-orange-400">₹{purchase.balance.toLocaleString()}</TableCell>
                  <TableCell className="text-center">{purchase.date}</TableCell>
                  <TableCell className="text-center">
                    <Badge variant={
                      purchase.status === 'paid' ? "default" : 
                      purchase.status === 'partial' ? "secondary" : "destructive"
                    }>
                      {purchase.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
