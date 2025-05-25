
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  ShoppingCart, 
  FileText, 
  Users, 
  Package, 
  BarChart3, 
  CreditCard,
  Receipt,
  Truck
} from 'lucide-react';

const Home = () => {
  const quickActions = [
    {
      title: 'Order Entry',
      description: 'Create new orders for customers',
      icon: ShoppingCart,
      path: '/order-entry',
      color: 'bg-blue-500'
    },
    {
      title: 'Track Sheet',
      description: 'View and manage daily deliveries',
      icon: FileText,
      path: '/track-sheet',
      color: 'bg-green-500'
    },
    {
      title: 'Customers',
      description: 'Manage customer information',
      icon: Users,
      path: '/customers',
      color: 'bg-purple-500'
    },
    {
      title: 'Products',
      description: 'Manage products and pricing',
      icon: Package,
      path: '/products',
      color: 'bg-orange-500'
    },
    {
      title: 'Analytics',
      description: 'View sales and performance data',
      icon: BarChart3,
      path: '/analytics',
      color: 'bg-indigo-500'
    },
    {
      title: 'Payments',
      description: 'Record and track payments',
      icon: CreditCard,
      path: '/payments',
      color: 'bg-teal-500'
    },
    {
      title: 'Expenses',
      description: 'Track business expenses',
      icon: Receipt,
      path: '/expenses',
      color: 'bg-red-500'
    },
    {
      title: 'Suppliers',
      description: 'Manage supplier directory',
      icon: Truck,
      path: '/suppliers',
      color: 'bg-yellow-500'
    }
  ];

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight">
          Welcome to Milk Center
        </h1>
        <p className="text-xl text-muted-foreground mt-2">
          Manage your dairy business efficiently
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {quickActions.map((action) => {
          const Icon = action.icon;
          return (
            <Card key={action.path} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className={`w-12 h-12 rounded-lg ${action.color} flex items-center justify-center mb-2`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-lg">{action.title}</CardTitle>
                <CardDescription>{action.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild className="w-full">
                  <Link to={action.path}>Open</Link>
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Quick Stats</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Today's Orders</span>
                <span className="font-semibold">--</span>
              </div>
              <div className="flex justify-between">
                <span>Active Customers</span>
                <span className="font-semibold">--</span>
              </div>
              <div className="flex justify-between">
                <span>Revenue Today</span>
                <span className="font-semibold">₹--</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">No recent activity</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm">System Online</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm">Data Synced</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Home;
