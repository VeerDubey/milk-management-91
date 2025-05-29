
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';
import { TrendingUp, TrendingDown, Users, Package, DollarSign, ShoppingCart, Clock, AlertCircle } from 'lucide-react';

interface AnalyticsData {
  totalRevenue: number;
  totalOrders: number;
  totalCustomers: number;
  totalProducts: number;
  revenueGrowth: number;
  orderGrowth: number;
  customerGrowth: number;
  productGrowth: number;
  recentActivity: Array<{
    id: string;
    type: 'order' | 'payment' | 'customer';
    description: string;
    amount?: number;
    timestamp: Date;
  }>;
  salesTrend: Array<{
    date: string;
    revenue: number;
    orders: number;
  }>;
  topProducts: Array<{
    name: string;
    sales: number;
    revenue: number;
  }>;
  customerSegments: Array<{
    name: string;
    value: number;
    color: string;
  }>;
}

export const RealTimeAnalytics = () => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    totalRevenue: 0,
    totalOrders: 0,
    totalCustomers: 0,
    totalProducts: 0,
    revenueGrowth: 0,
    orderGrowth: 0,
    customerGrowth: 0,
    productGrowth: 0,
    recentActivity: [],
    salesTrend: [],
    topProducts: [],
    customerSegments: []
  });

  const [isLoading, setIsLoading] = useState(true);

  // Simulate real-time data updates
  useEffect(() => {
    const generateMockData = (): AnalyticsData => ({
      totalRevenue: 125000 + Math.random() * 10000,
      totalOrders: 1250 + Math.floor(Math.random() * 100),
      totalCustomers: 450 + Math.floor(Math.random() * 20),
      totalProducts: 85,
      revenueGrowth: 12.5 + Math.random() * 5,
      orderGrowth: 8.3 + Math.random() * 3,
      customerGrowth: 15.2 + Math.random() * 4,
      productGrowth: 5.1,
      recentActivity: [
        {
          id: '1',
          type: 'order',
          description: 'New order from Shamim Dairy',
          amount: 2784,
          timestamp: new Date(Date.now() - Math.random() * 3600000)
        },
        {
          id: '2',
          type: 'payment',
          description: 'Payment received from India Dairy',
          amount: 1092,
          timestamp: new Date(Date.now() - Math.random() * 3600000)
        },
        {
          id: '3',
          type: 'customer',
          description: 'New customer registration: Vikas Dairy',
          timestamp: new Date(Date.now() - Math.random() * 3600000)
        }
      ],
      salesTrend: Array.from({ length: 7 }, (_, i) => ({
        date: new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000).toLocaleDateString(),
        revenue: 15000 + Math.random() * 10000,
        orders: 120 + Math.random() * 50
      })),
      topProducts: [
        { name: 'GGH', sales: 60, revenue: 15000 },
        { name: 'GGH450', sales: 84, revenue: 12000 },
        { name: 'GTSF', sales: 95, revenue: 18000 },
        { name: 'GSD1KG', sales: 60, revenue: 9000 },
        { name: 'F&L', sales: 24, revenue: 6000 }
      ],
      customerSegments: [
        { name: 'Regular', value: 45, color: '#3b82f6' },
        { name: 'Premium', value: 30, color: '#8b5cf6' },
        { name: 'New', value: 15, color: '#10b981' },
        { name: 'Inactive', value: 10, color: '#f59e0b' }
      ]
    });

    const updateData = () => {
      setAnalyticsData(generateMockData());
      setIsLoading(false);
    };

    updateData();
    const interval = setInterval(updateData, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const StatCard = ({ title, value, growth, icon: Icon, prefix = '', suffix = '' }: any) => (
    <Card className="glass-card border-slate-700 hover-lift">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-400">{title}</p>
            <p className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              {prefix}{typeof value === 'number' ? value.toLocaleString() : value}{suffix}
            </p>
            <div className="flex items-center mt-2">
              {growth >= 0 ? (
                <TrendingUp className="h-4 w-4 text-green-400 mr-1" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-400 mr-1" />
              )}
              <span className={`text-sm font-medium ${growth >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {Math.abs(growth).toFixed(1)}%
              </span>
              <span className="text-slate-400 text-sm ml-1">vs last month</span>
            </div>
          </div>
          <Icon className={`h-12 w-12 ${growth >= 0 ? 'text-green-400' : 'text-red-400'}`} />
        </div>
      </CardContent>
    </Card>
  );

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="glass-card border-slate-700">
            <CardContent className="p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-slate-600 rounded w-24 mb-2"></div>
                <div className="h-8 bg-slate-600 rounded w-32 mb-2"></div>
                <div className="h-4 bg-slate-600 rounded w-20"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Revenue"
          value={analyticsData.totalRevenue}
          growth={analyticsData.revenueGrowth}
          icon={DollarSign}
          prefix="₹"
        />
        <StatCard
          title="Total Orders"
          value={analyticsData.totalOrders}
          growth={analyticsData.orderGrowth}
          icon={ShoppingCart}
        />
        <StatCard
          title="Total Customers"
          value={analyticsData.totalCustomers}
          growth={analyticsData.customerGrowth}
          icon={Users}
        />
        <StatCard
          title="Products"
          value={analyticsData.totalProducts}
          growth={analyticsData.productGrowth}
          icon={Package}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Trend */}
        <Card className="glass-card border-slate-700">
          <CardHeader>
            <CardTitle className="gradient-text">Sales Trend (7 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analyticsData.salesTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="date" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    border: '1px solid #374151',
                    borderRadius: '8px'
                  }}
                />
                <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={3} />
                <Line type="monotone" dataKey="orders" stroke="#8b5cf6" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Customer Segments */}
        <Card className="glass-card border-slate-700">
          <CardHeader>
            <CardTitle className="gradient-text">Customer Segments</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={analyticsData.customerSegments}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}%`}
                >
                  {analyticsData.customerSegments.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products */}
        <Card className="glass-card border-slate-700">
          <CardHeader>
            <CardTitle className="gradient-text">Top Products</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analyticsData.topProducts}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="name" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    border: '1px solid #374151',
                    borderRadius: '8px'
                  }}
                />
                <Bar dataKey="revenue" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="glass-card border-slate-700">
          <CardHeader>
            <CardTitle className="gradient-text flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analyticsData.recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    {activity.type === 'order' && <ShoppingCart className="h-5 w-5 text-blue-400" />}
                    {activity.type === 'payment' && <DollarSign className="h-5 w-5 text-green-400" />}
                    {activity.type === 'customer' && <Users className="h-5 w-5 text-purple-400" />}
                    <div>
                      <p className="text-sm font-medium text-white">{activity.description}</p>
                      <p className="text-xs text-slate-400">
                        {activity.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                  {activity.amount && (
                    <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                      ₹{activity.amount.toLocaleString()}
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
