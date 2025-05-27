
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  CreditCard, 
  Calendar,
  Download,
  Users,
  BarChart3
} from 'lucide-react';

export const PaymentAnalytics = () => {
  const analytics = [
    {
      title: 'Total Revenue',
      value: '₹2,45,680',
      change: '+15.2%',
      trend: 'up',
      icon: DollarSign,
      color: 'success'
    },
    {
      title: 'Payment Success Rate',
      value: '98.5%',
      change: '+2.1%',
      trend: 'up',
      icon: CreditCard,
      color: 'primary'
    },
    {
      title: 'Average Transaction',
      value: '₹856',
      change: '-3.4%',
      trend: 'down',
      icon: BarChart3,
      color: 'warning'
    },
    {
      title: 'Active Customers',
      value: '287',
      change: '+8.7%',
      trend: 'up',
      icon: Users,
      color: 'secondary'
    }
  ];

  const paymentMethods = [
    { method: 'UPI', percentage: 45, amount: '₹1,10,556', color: 'bg-gradient-to-r from-violet-500 to-purple-500' },
    { method: 'Cash', percentage: 35, amount: '₹86,088', color: 'bg-gradient-to-r from-emerald-500 to-teal-500' },
    { method: 'Card', percentage: 15, amount: '₹36,852', color: 'bg-gradient-to-r from-blue-500 to-cyan-500' },
    { method: 'Bank Transfer', percentage: 5, amount: '₹12,284', color: 'bg-gradient-to-r from-orange-500 to-red-500' }
  ];

  return (
    <div className="space-y-6">
      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {analytics.map((metric) => {
          const IconComponent = metric.icon;
          const TrendIcon = metric.trend === 'up' ? TrendingUp : TrendingDown;
          
          return (
            <Card key={metric.title} className="bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700 hover:shadow-2xl transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <p className="text-sm text-slate-400">{metric.title}</p>
                    <p className="text-2xl font-bold text-white">{metric.value}</p>
                    <div className="flex items-center space-x-1">
                      <TrendIcon className={`h-4 w-4 ${metric.trend === 'up' ? 'text-emerald-400' : 'text-red-400'}`} />
                      <span className={`text-sm ${metric.trend === 'up' ? 'text-emerald-400' : 'text-red-400'}`}>
                        {metric.change}
                      </span>
                    </div>
                  </div>
                  <div className={`p-3 rounded-full bg-gradient-to-r from-violet-500 to-purple-500`}>
                    <IconComponent className="h-6 w-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Payment Methods Breakdown */}
      <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center justify-between">
            Payment Methods Breakdown
            <Button variant="outline" size="sm" className="border-slate-600 text-slate-300 hover:bg-slate-700">
              <Download className="mr-2 h-4 w-4" />
              Export Report
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {paymentMethods.map((method, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-slate-300 font-medium">{method.method}</span>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className="border-slate-600 text-slate-300">
                      {method.percentage}%
                    </Badge>
                    <span className="text-white font-bold">{method.amount}</span>
                  </div>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${method.color}`}
                    style={{ width: `${method.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Transactions */}
      <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Recent High-Value Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { customer: 'Rajesh Kumar', amount: '₹15,650', method: 'UPI', time: '2 hours ago', status: 'completed' },
              { customer: 'Priya Sharma', amount: '₹12,400', method: 'Cash', time: '4 hours ago', status: 'completed' },
              { customer: 'Amit Patel', amount: '₹8,900', method: 'Card', time: '6 hours ago', status: 'pending' },
              { customer: 'Sunita Devi', amount: '₹7,650', method: 'Bank Transfer', time: '8 hours ago', status: 'completed' }
            ].map((transaction, index) => (
              <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-slate-800 border border-slate-700">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-violet-500 to-purple-500 flex items-center justify-center">
                    <span className="text-white font-bold text-sm">
                      {transaction.customer.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <p className="text-white font-medium">{transaction.customer}</p>
                    <p className="text-slate-400 text-sm">{transaction.time}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-white font-bold">{transaction.amount}</p>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className="border-slate-600 text-slate-300 text-xs">
                      {transaction.method}
                    </Badge>
                    <Badge 
                      className={`text-xs ${
                        transaction.status === 'completed' 
                          ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' 
                          : 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                      }`}
                    >
                      {transaction.status}
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
