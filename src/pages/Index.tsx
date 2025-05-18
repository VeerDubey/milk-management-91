
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Building, FileText, Truck, Users, CreditCard, Box } from "lucide-react";

const Index = () => {
  const menuItems = [
    {
      title: "Supplier Directory",
      description: "Manage suppliers and their information",
      icon: <Building className="h-8 w-8 text-primary" />,
      link: "/supplier-directory"
    },
    {
      title: "Invoice Generator",
      description: "Create and manage invoices",
      icon: <FileText className="h-8 w-8 text-primary" />,
      link: "/invoice-generator"
    },
    {
      title: "Track Sheet",
      description: "Track delivery and routes",
      icon: <Truck className="h-8 w-8 text-primary" />,
      link: "/track-sheet-history"
    },
    {
      title: "Outstanding Dues",
      description: "View and manage customer dues",
      icon: <CreditCard className="h-8 w-8 text-primary" />,
      link: "/outstanding-dues"
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Milk Center Management</h1>
        <p className="text-muted-foreground">
          Select a module to manage your dairy business
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {menuItems.map((item, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <Link to={item.link} className="block h-full">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg font-medium">{item.title}</CardTitle>
                {item.icon}
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </CardContent>
            </Link>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Index;
