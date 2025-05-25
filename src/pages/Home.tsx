
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  FileText, 
  Users, 
  Package, 
  BarChart3, 
  CreditCard, 
  Building2,
  Receipt,
  TrendingUp,
  Calendar,
  DollarSign
} from 'lucide-react';

const Home = () => {
  const quickActions = [
    {
      title: 'Order Entry',
      description: 'Create new orders and manage daily entries',
      icon: FileText,
      path: '/order-entry',
      color: 'bg-blue-500'
    },
    {
      title: 'Track Sheet',
      description: 'Monitor delivery status and routes',
      icon: FileText,
      path: '/track-sheet',
      color: 'bg-green-500'
    },
    {
      title: 'Customers',
      description: 'Manage customer information and records',
      icon: Users,
      path: '/customers',
      color: 'bg-purple-500'
    },
    {
      title: 'Products',
      description: 'Handle product catalog and inventory',
      icon: Package,
      path: '/products',
      color: 'bg-orange-500'
    },
    {
      title: 'Payments',
      description: 'Process payments and track transactions',
      icon: CreditCard,
      path: '/payments',
      color: 'bg-red-500'
    },
    {
      title: 'Analytics',
      description: 'View reports and business insights',
      icon: BarChart3,
      path: '/analytics',
      color: 'bg-indigo-500'
    }
  ];

  const stats = [
    {
      title: 'Today\'s Orders',
      value: '0',
      icon: FileText,
      change: '+0%'
    },
    {
      title: 'Active Customers',
      value: '0',
      icon: Users,
      change: '+0%'
    },
    {
      title: 'Revenue',
      value: '₹0',
      icon: DollarSign,
      change: '+0%'
    },
    {
      title: 'Products',
      value: '0',
      icon: Package,
      change: '+0%'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-2">Welcome to your Milk Center Management System</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    {stat.title}
                  </CardTitle>
                  <Icon className="h-4 w-4 text-gray-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <p className="text-xs text-gray-600 flex items-center">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    {stat.change} from last month
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader>
                    <div className="flex items-center space-x-3">
                      <div className={`${action.color} p-2 rounded-lg`}>
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{action.title}</CardTitle>
                        <CardDescription>{action.description}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Button asChild className="w-full">
                      <Link to={action.path}>
                        Get Started
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="h-5 w-5" />
                <span>Recent Orders</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No recent orders</p>
                <Button asChild className="mt-4">
                  <Link to="/order-entry">Create Order</Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5" />
                <span>Quick Stats</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total Customers</span>
                  <span className="font-semibold">0</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Active Products</span>
                  <span className="font-semibold">0</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Pending Payments</span>
                  <span className="font-semibold">₹0</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">This Month Revenue</span>
                  <span className="font-semibold">₹0</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Home;
