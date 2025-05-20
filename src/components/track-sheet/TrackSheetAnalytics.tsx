
import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrackSheetRow } from '@/types';
import { calculateProductTotals, calculateTotals } from '@/utils/trackSheetUtils';

// Import charts if you have recharts
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface TrackSheetAnalyticsProps {
  rows: TrackSheetRow[];
  products: string[];
}

interface ProductAnalysis {
  name: string;
  totalQty: number;
  percentage: number;
}

export function TrackSheetAnalytics({ rows, products }: TrackSheetAnalyticsProps) {
  const productTotals = useMemo(() => calculateProductTotals(rows, products), [rows, products]);
  const { totalQuantity, totalAmount } = useMemo(() => calculateTotals(rows), [rows]);
  
  // Calculate product breakdown
  const productBreakdown = useMemo<ProductAnalysis[]>(() => {
    if (totalQuantity === 0) return [];
    
    return Object.entries(productTotals)
      .map(([name, qty]) => ({
        name,
        totalQty: (qty || 0) as number, // Ensure it's a number
        percentage: totalQuantity > 0 ? ((qty || 0) / totalQuantity) * 100 : 0
      }))
      .sort((a, b) => b.totalQty - a.totalQty);
  }, [productTotals, totalQuantity]);
  
  // Format data for charts
  const chartData = useMemo(() => 
    productBreakdown.map(item => ({
      name: item.name,
      quantity: item.totalQty
    }))
  , [productBreakdown]);
  
  // Data for customer chart
  const customerChartData = useMemo(() => 
    rows
      .filter(row => row.total > 0)
      .map(row => ({
        name: row.name || 'Unknown',
        quantity: row.total,
        amount: row.amount || 0
      }))
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 10) // Take top 10 customers only
  , [rows]);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalQuantity}</div>
            <p className="text-xs text-muted-foreground">Total quantity across all products</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Amount</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{totalAmount.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Total value of all products</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active Customers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{rows.filter(r => r.total > 0).length}</div>
            <p className="text-xs text-muted-foreground">Customers with product quantities</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Product Distribution Chart */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Product Distribution</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            {chartData.length > 0 ? (
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 30 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="name" 
                      angle={-45} 
                      textAnchor="end"
                      height={70}
                      interval={0}
                    />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="quantity" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                No data to display
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Customers Chart */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Top Customers</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            {customerChartData.length > 0 ? (
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={customerChartData} margin={{ top: 10, right: 10, left: 0, bottom: 30 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="name" 
                      angle={-45} 
                      textAnchor="end"
                      height={70}
                      interval={0}
                    />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="quantity" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                No data to display
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Product Breakdown Table */}
      <Card>
        <CardHeader>
          <CardTitle>Product Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs uppercase bg-muted">
                <tr>
                  <th scope="col" className="px-4 py-3">Product</th>
                  <th scope="col" className="px-4 py-3 text-right">Quantity</th>
                  <th scope="col" className="px-4 py-3 text-right">Percentage</th>
                </tr>
              </thead>
              <tbody>
                {productBreakdown.map((product) => (
                  <tr key={product.name} className="border-b">
                    <td className="px-4 py-4">{product.name}</td>
                    <td className="px-4 py-4 text-right">{product.totalQty}</td>
                    <td className="px-4 py-4 text-right">{product.percentage.toFixed(1)}%</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="font-semibold">
                  <td className="px-4 py-3">Total</td>
                  <td className="px-4 py-3 text-right">{totalQuantity}</td>
                  <td className="px-4 py-3 text-right">100%</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
