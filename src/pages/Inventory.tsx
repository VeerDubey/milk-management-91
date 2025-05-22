
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Package, BarChart3, Settings, FileText, List, Database } from 'lucide-react';
import { useData } from '@/contexts/data/DataContext';

export default function Inventory() {
  const navigate = useNavigate();
  const { products, stockEntries, stockTransactions } = useData();

  const inventoryModules = [
    {
      title: "Product List",
      description: "Manage your product catalog",
      icon: Package,
      path: "/product-list",
      count: products.length,
      color: "text-blue-500"
    },
    {
      title: "Product Rates",
      description: "Set and manage product pricing",
      icon: BarChart3,
      path: "/product-rates",
      count: null,
      color: "text-purple-500"
    },
    {
      title: "Stock Management",
      description: "Monitor and manage your inventory",
      icon: Database,
      path: "/stock-management",
      count: stockEntries?.length || 0,
      color: "text-green-500"
    },
    {
      title: "Stock Settings",
      description: "Configure inventory settings",
      icon: Settings,
      path: "/stock-settings",
      count: null,
      color: "text-amber-500"
    },
    {
      title: "Product Categories",
      description: "Organize products by categories",
      icon: List,
      path: "/product-categories",
      count: null,
      color: "text-indigo-500"
    },
    {
      title: "Stock Transactions",
      description: "View stock movement history",
      icon: FileText,
      path: "/stock-transactions",
      count: stockTransactions?.length || 0,
      color: "text-rose-500"
    }
  ];

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Inventory Management</h1>
        <p className="text-muted-foreground mt-2">
          Manage your products, stock, pricing and inventory settings
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {inventoryModules.map((module) => (
          <Card key={module.path} className="overflow-hidden transition-all hover:shadow-md">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <module.icon className={`h-8 w-8 ${module.color}`} />
                {module.count !== null && (
                  <div className="bg-muted text-muted-foreground text-sm px-2 py-1 rounded-md">
                    {module.count} {module.count === 1 ? 'item' : 'items'}
                  </div>
                )}
              </div>
              <CardTitle className="text-xl mt-4">{module.title}</CardTitle>
              <CardDescription>{module.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                className="w-full" 
                onClick={() => navigate(module.path)}
              >
                Manage {module.title}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
