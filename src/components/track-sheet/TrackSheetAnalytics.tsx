
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

// Type for TrackSheet data
interface TrackSheetRow {
  name: string;
  quantities: Record<string, string | number>;
  total: number;
  amount: number;
}

interface TrackSheetAnalyticsProps {
  rows: TrackSheetRow[];
  products: string[];
}

// Colors for charts
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

export function TrackSheetAnalytics({ rows, products }: TrackSheetAnalyticsProps) {
  const [chartType, setChartType] = useState<string>("products");
  
  // Prepare data for product distribution chart
  const productData = products.map(product => {
    const totalQuantity = rows.reduce((sum, row) => {
      const qty = row.quantities[product];
      return sum + (typeof qty === 'number' ? qty : 0);
    }, 0);
    
    return {
      name: product,
      value: totalQuantity
    };
  });
  
  // Prepare data for customer distribution chart
  const customerData = rows.map(row => ({
    name: row.name || "Unknown",
    value: row.total
  })).filter(item => item.value > 0);
  
  // Prepare data for product comparison chart
  const comparisonData = rows
    .filter(row => row.name) // Only include rows with customer names
    .map(row => {
      const data: any = { name: row.name };
      products.forEach(product => {
        data[product] = typeof row.quantities[product] === 'number' ? row.quantities[product] : 0;
      });
      return data;
    });
  
  // Calculate total sales
  const totalSales = rows.reduce((sum, row) => sum + row.amount, 0);
  
  // Calculate average order value
  const validOrderCount = rows.filter(row => row.amount > 0).length;
  const averageOrderValue = validOrderCount > 0 
    ? Math.round((totalSales / validOrderCount) * 100) / 100
    : 0;
  
  // Find best selling product
  let bestSellingProduct = { name: "None", quantity: 0 };
  products.forEach(product => {
    const totalQty = rows.reduce((sum, row) => {
      const qty = row.quantities[product];
      return sum + (typeof qty === 'number' ? qty : 0);
    }, 0);
    
    if (totalQty > bestSellingProduct.quantity) {
      bestSellingProduct = { name: product, quantity: totalQty };
    }
  });
  
  // Find top customer
  let topCustomer = { name: "None", amount: 0 };
  rows.forEach(row => {
    if (row.name && row.amount > topCustomer.amount) {
      topCustomer = { name: row.name, amount: row.amount };
    }
  });
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Track Sheet Analytics</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Sales</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">₹{totalSales}</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Avg. Order Value</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">₹{averageOrderValue}</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Best Selling Product</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{bestSellingProduct.name}</p>
              <p className="text-sm text-muted-foreground">{bestSellingProduct.quantity} units</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Top Customer</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{topCustomer.name}</p>
              <p className="text-sm text-muted-foreground">₹{topCustomer.amount}</p>
            </CardContent>
          </Card>
        </div>
        
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Sales Distribution</h3>
            <div className="flex items-center space-x-2">
              <Label htmlFor="chart-type" className="mr-2">Chart Type:</Label>
              <Select value={chartType} onValueChange={setChartType}>
                <SelectTrigger id="chart-type" className="w-[180px]">
                  <SelectValue placeholder="Select chart type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="products">Product Distribution</SelectItem>
                  <SelectItem value="customers">Customer Distribution</SelectItem>
                  <SelectItem value="comparison">Customer-Product Comparison</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="h-80 w-full">
            {chartType === "products" && productData.length > 0 && (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={productData}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {productData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Legend />
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
            
            {chartType === "customers" && customerData.length > 0 && (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={customerData}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {customerData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Legend />
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
            
            {chartType === "comparison" && comparisonData.length > 0 && (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={comparisonData}
                  margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  {products.map((product, index) => (
                    <Bar 
                      key={product} 
                      dataKey={product} 
                      fill={COLORS[index % COLORS.length]} 
                    />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            )}
            
            {((chartType === "products" && productData.length === 0) ||
              (chartType === "customers" && customerData.length === 0) ||
              (chartType === "comparison" && comparisonData.length === 0)) && (
              <div className="h-full flex items-center justify-center">
                <p className="text-muted-foreground">Not enough data to display chart</p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
