
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer, Area, AreaChart 
} from 'recharts';
import { 
  Download, FileText, TrendingUp, TrendingDown, DollarSign, 
  Package, Users, Calendar, Filter, RefreshCw 
} from 'lucide-react';
import { useData } from '@/contexts/data/DataContext';
import { reportingService, SalesReport, FinancialReport, InventoryReport } from '@/services/ReportingService';
import { format, subDays, subMonths } from 'date-fns';
import { toast } from 'sonner';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export function ReportingDashboard() {
  const { customers, products, orders, payments } = useData();
  const [selectedPeriod, setSelectedPeriod] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('monthly');
  const [salesReport, setSalesReport] = useState<SalesReport | null>(null);
  const [financialReport, setFinancialReport] = useState<FinancialReport | null>(null);
  const [inventoryReport, setInventoryReport] = useState<InventoryReport | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    generateReports();
  }, [selectedPeriod, customers, products, orders, payments]);

  const generateReports = async () => {
    setIsLoading(true);
    try {
      const sales = reportingService.generateSalesReport(customers, products, orders, selectedPeriod);
      const financial = reportingService.generateFinancialReport(customers, orders, payments, selectedPeriod as any);
      const inventory = reportingService.generateInventoryReport(products);
      
      setSalesReport(sales);
      setFinancialReport(financial);
      setInventoryReport(inventory);
    } catch (error) {
      console.error('Error generating reports:', error);
      toast.error('Failed to generate reports');
    } finally {
      setIsLoading(false);
    }
  };

  const exportReport = (reportType: string, data: any) => {
    try {
      reportingService.exportReport(data, `${reportType}_report`);
      toast.success(`${reportType} report exported successfully`);
    } catch (error) {
      toast.error(`Failed to export ${reportType} report`);
    }
  };

  const MetricCard = ({ title, value, change, icon: Icon, color = "text-foreground" }: {
    title: string;
    value: string | number;
    change?: number;
    icon: any;
    color?: string;
  }) => (
    <Card className="neo-noir-card">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="neo-noir-text-muted text-sm font-medium">{title}</p>
            <p className={`text-2xl font-bold ${color}`}>{value}</p>
            {change !== undefined && (
              <div className="flex items-center mt-1">
                {change >= 0 ? (
                  <TrendingUp className="h-4 w-4 text-green-400 mr-1" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-400 mr-1" />
                )}
                <span className={`text-sm ${change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {Math.abs(change)}%
                </span>
              </div>
            )}
          </div>
          <Icon className={`h-8 w-8 ${color}`} />
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold neo-noir-text">Advanced Reports & Analytics</h1>
          <p className="neo-noir-text-muted">Comprehensive business intelligence dashboard</p>
        </div>
        <div className="flex items-center gap-4">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod as any}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">Daily</SelectItem>
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
              <SelectItem value="yearly">Yearly</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={generateReports} disabled={isLoading} variant="outline">
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      {salesReport && financialReport && inventoryReport && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            title="Total Sales"
            value={`₹${salesReport.totalSales.toFixed(2)}`}
            icon={DollarSign}
            color="text-green-400"
          />
          <MetricCard
            title="Total Orders"
            value={salesReport.totalOrders}
            icon={Package}
            color="text-blue-400"
          />
          <MetricCard
            title="Active Customers"
            value={customers.length}
            icon={Users}
            color="text-purple-400"
          />
          <MetricCard
            title="Stock Value"
            value={`₹${inventoryReport.totalStockValue.toFixed(2)}`}
            icon={Package}
            color="text-orange-400"
          />
        </div>
      )}

      {/* Reports Tabs */}
      <Tabs defaultValue="sales" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="sales">Sales Analytics</TabsTrigger>
          <TabsTrigger value="financial">Financial Reports</TabsTrigger>
          <TabsTrigger value="inventory">Inventory Analysis</TabsTrigger>
        </TabsList>

        {/* Sales Analytics */}
        <TabsContent value="sales" className="space-y-6">
          {salesReport && (
            <>
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold neo-noir-text">Sales Analytics</h2>
                <Button onClick={() => exportReport('sales', salesReport)} variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Export Sales Report
                </Button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Daily Sales Trend */}
                <Card className="neo-noir-card">
                  <CardHeader>
                    <CardTitle className="neo-noir-text">Daily Sales Trend</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <AreaChart data={salesReport.dailyBreakdown}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis dataKey="date" stroke="#9CA3AF" />
                        <YAxis stroke="#9CA3AF" />
                        <Tooltip 
                          contentStyle={{
                            backgroundColor: '#1F2937',
                            border: '1px solid #374151',
                            borderRadius: '8px',
                            color: '#F9FAFB'
                          }}
                        />
                        <Area type="monotone" dataKey="sales" stroke="#10B981" fill="#10B981" fillOpacity={0.2} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Top Products */}
                <Card className="neo-noir-card">
                  <CardHeader>
                    <CardTitle className="neo-noir-text">Top Selling Products</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {salesReport.topProducts.slice(0, 5).map((product, index) => (
                        <div key={product.productId} className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Badge variant="outline" className="w-8 h-8 rounded-full flex items-center justify-center">
                              {index + 1}
                            </Badge>
                            <div>
                              <p className="font-medium neo-noir-text">{product.productName}</p>
                              <p className="text-sm neo-noir-text-muted">{product.quantitySold} units sold</p>
                            </div>
                          </div>
                          <p className="font-medium text-green-400">₹{product.revenue.toFixed(2)}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Top Customers */}
              <Card className="neo-noir-card">
                <CardHeader>
                  <CardTitle className="neo-noir-text">Top Customers by Revenue</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={salesReport.topCustomers.slice(0, 10)}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="customerName" stroke="#9CA3AF" />
                      <YAxis stroke="#9CA3AF" />
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: '#1F2937',
                          border: '1px solid #374151',
                          borderRadius: '8px',
                          color: '#F9FAFB'
                        }}
                      />
                      <Bar dataKey="totalSpent" fill="#3B82F6" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        {/* Financial Reports */}
        <TabsContent value="financial" className="space-y-6">
          {financialReport && (
            <>
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold neo-noir-text">Financial Analysis</h2>
                <Button onClick={() => exportReport('financial', financialReport)} variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Export Financial Report
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <MetricCard
                  title="Total Revenue"
                  value={`₹${financialReport.totalRevenue.toFixed(2)}`}
                  icon={DollarSign}
                  color="text-green-400"
                />
                <MetricCard
                  title="Payments Received"
                  value={`₹${financialReport.totalPayments.toFixed(2)}`}
                  icon={DollarSign}
                  color="text-blue-400"
                />
                <MetricCard
                  title="Outstanding Amount"
                  value={`₹${financialReport.outstandingAmount.toFixed(2)}`}
                  icon={DollarSign}
                  color="text-orange-400"
                />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Cash Flow */}
                <Card className="neo-noir-card">
                  <CardHeader>
                    <CardTitle className="neo-noir-text">Cash Flow Analysis</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={financialReport.cashFlow}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis dataKey="date" stroke="#9CA3AF" />
                        <YAxis stroke="#9CA3AF" />
                        <Tooltip 
                          contentStyle={{
                            backgroundColor: '#1F2937',
                            border: '1px solid #374151',
                            borderRadius: '8px',
                            color: '#F9FAFB'
                          }}
                        />
                        <Line type="monotone" dataKey="income" stroke="#10B981" name="Income" />
                        <Line type="monotone" dataKey="expenses" stroke="#EF4444" name="Expenses" />
                        <Line type="monotone" dataKey="netFlow" stroke="#3B82F6" name="Net Flow" />
                        <Legend />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Ageing Analysis */}
                <Card className="neo-noir-card">
                  <CardHeader>
                    <CardTitle className="neo-noir-text">Outstanding Ageing Analysis</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={[
                            { name: 'Current', value: financialReport.ageingAnalysis.current },
                            { name: '1-30 Days', value: financialReport.ageingAnalysis.days30 },
                            { name: '31-60 Days', value: financialReport.ageingAnalysis.days60 },
                            { name: '60+ Days', value: financialReport.ageingAnalysis.days90Plus },
                          ]}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {COLORS.map((color, index) => (
                            <Cell key={`cell-${index}`} fill={color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </TabsContent>

        {/* Inventory Analysis */}
        <TabsContent value="inventory" className="space-y-6">
          {inventoryReport && (
            <>
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold neo-noir-text">Inventory Analysis</h2>
                <Button onClick={() => exportReport('inventory', inventoryReport)} variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Export Inventory Report
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <MetricCard
                  title="Total Stock Value"
                  value={`₹${inventoryReport.totalStockValue.toFixed(2)}`}
                  icon={Package}
                  color="text-blue-400"
                />
                <MetricCard
                  title="Low Stock Items"
                  value={inventoryReport.lowStockItems}
                  icon={TrendingDown}
                  color="text-orange-400"
                />
                <MetricCard
                  title="Expiring Soon"
                  value={inventoryReport.expiringItems}
                  icon={Calendar}
                  color="text-red-400"
                />
                <MetricCard
                  title="Stock Turnover"
                  value={inventoryReport.stockTurnover.toFixed(2)}
                  icon={RefreshCw}
                  color="text-green-400"
                />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Brand-wise Stock Distribution */}
                <Card className="neo-noir-card">
                  <CardHeader>
                    <CardTitle className="neo-noir-text">Stock Distribution by Brand</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={inventoryReport.brandWiseStock}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ brand, percent }) => `${brand} ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="totalValue"
                        >
                          {inventoryReport.brandWiseStock.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Stock Movement Analysis */}
                <Card className="neo-noir-card">
                  <CardHeader>
                    <CardTitle className="neo-noir-text">Top Stock Movements</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4 max-h-80 overflow-y-auto">
                      {inventoryReport.movementAnalysis.slice(0, 10).map((item, index) => (
                        <div key={item.productId} className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                          <div>
                            <p className="font-medium neo-noir-text">{item.productName}</p>
                            <p className="text-sm neo-noir-text-muted">
                              Sold: {item.sold} | Closing: {item.closing}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium text-blue-400">
                              {(item.turnoverRate * 100).toFixed(1)}%
                            </p>
                            <p className="text-xs neo-noir-text-muted">Turnover Rate</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
