
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { BarChart4, FileChart, Users } from "lucide-react";
import SalesReport from "./Reports/SalesReport";
import CustomerReport from "./Reports/CustomerReport";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

export default function Reports() {
  const [reportType, setReportType] = useState<string>("overview");

  const renderReportContent = () => {
    switch(reportType) {
      case "sales":
        return <SalesReport />;
      case "customers":
        return <CustomerReport />;
      default:
        return (
          <div className="space-y-8">
            <div className="grid gap-6 md:grid-cols-3">
              <Card 
                className="cursor-pointer hover:border-primary transition-colors"
                onClick={() => setReportType("sales")}
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Sales Reports</CardTitle>
                    <BarChart4 className="h-8 w-8 text-primary" />
                  </div>
                  <CardDescription>Sales data and performance metrics</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-sm">
                    <p>Analyze sales trends, revenue, and product performance.</p>
                    <Button variant="link" className="p-0 mt-2">View Reports →</Button>
                  </div>
                </CardContent>
              </Card>
              
              <Card 
                className="cursor-pointer hover:border-primary transition-colors"
                onClick={() => setReportType("customers")}
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Customer Reports</CardTitle>
                    <Users className="h-8 w-8 text-primary" />
                  </div>
                  <CardDescription>Customer analytics and insights</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-sm">
                    <p>View customer acquisition, retention, and spending patterns.</p>
                    <Button variant="link" className="p-0 mt-2">View Reports →</Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:border-primary transition-colors">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Financial Reports</CardTitle>
                    <FileChart className="h-8 w-8 text-primary" />
                  </div>
                  <CardDescription>Financial performance data</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-sm">
                    <p>Track revenue, expenses, profits, and other financial metrics.</p>
                    <Button variant="link" className="p-0 mt-2">View Reports →</Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Report Templates</CardTitle>
                  <CardDescription>Quick access to common reports</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-2">
                    <Button variant="outline" className="justify-start" onClick={() => setReportType("sales")}>
                      <BarChart4 className="mr-2 h-4 w-4" />
                      Daily Sales Report
                    </Button>
                    <Button variant="outline" className="justify-start" onClick={() => setReportType("customers")}>
                      <Users className="mr-2 h-4 w-4" />
                      Customer Activity Report
                    </Button>
                    <Button variant="outline" className="justify-start">
                      <FileChart className="mr-2 h-4 w-4" />
                      Inventory Status Report
                    </Button>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Getting Started</CardTitle>
                  <CardDescription>Tips for using reports effectively</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4 text-sm">
                    <div>
                      <h4 className="font-medium">1. Choose the right report</h4>
                      <p className="text-muted-foreground">Select the report type based on the insights you need.</p>
                    </div>
                    <div>
                      <h4 className="font-medium">2. Filter your data</h4>
                      <p className="text-muted-foreground">Use date ranges and filters to focus on relevant information.</p>
                    </div>
                    <div>
                      <h4 className="font-medium">3. Export and share</h4>
                      <p className="text-muted-foreground">Export reports as PDF for team meetings or presentations.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
          <p className="text-muted-foreground">
            Analytics and insights for your business
          </p>
        </div>
        {reportType !== "overview" && (
          <Button variant="outline" onClick={() => setReportType("overview")}>
            Back to Overview
          </Button>
        )}
      </div>

      {renderReportContent()}
    </div>
  );
}
