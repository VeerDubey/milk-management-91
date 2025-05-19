
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  BarChart,
  LineChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  Users,
  ShoppingCart,
  Package,
  FileText,
  CreditCard,
  Truck,
  BarChart3,
  Calendar,
  Clock,
  Settings,
  DollarSign,
} from "lucide-react";

const salesData = [
  { name: "Mon", sales: 4000 },
  { name: "Tue", sales: 3000 },
  { name: "Wed", sales: 5000 },
  { name: "Thu", sales: 2780 },
  { name: "Fri", sales: 1890 },
  { name: "Sat", sales: 2390 },
  { name: "Sun", sales: 3490 },
];

const paymentData = [
  { name: "Week 1", received: 5000, pending: 2400 },
  { name: "Week 2", received: 3000, pending: 1398 },
  { name: "Week 3", received: 2000, pending: 9800 },
  { name: "Week 4", received: 2780, pending: 3908 },
];

const Dashboard = () => {
  const navigate = useNavigate();
  const [activeChart, setActiveChart] = useState("daily");

  const navigationCards = [
    {
      title: "Customers",
      description: "Manage customer information",
      icon: Users,
      path: "/customers",
      color: "bg-blue-100 dark:bg-blue-900",
      textColor: "text-blue-700 dark:text-blue-300",
    },
    {
      title: "Orders",
      description: "Process and track orders",
      icon: ShoppingCart,
      path: "/orders",
      color: "bg-green-100 dark:bg-green-900",
      textColor: "text-green-700 dark:text-green-300",
    },
    {
      title: "Products",
      description: "Manage your inventory",
      icon: Package,
      path: "/inventory",
      color: "bg-purple-100 dark:bg-purple-900",
      textColor: "text-purple-700 dark:text-purple-300",
    },
    {
      title: "Invoices",
      description: "Create and manage invoices",
      icon: FileText,
      path: "/invoices",
      color: "bg-yellow-100 dark:bg-yellow-900",
      textColor: "text-yellow-700 dark:text-yellow-300",
    },
    {
      title: "Payments",
      description: "Track payments and dues",
      icon: CreditCard,
      path: "/payments",
      color: "bg-pink-100 dark:bg-pink-900",
      textColor: "text-pink-700 dark:text-pink-300",
    },
    {
      title: "Delivery",
      description: "Track vehicles and routes",
      icon: Truck,
      path: "/vehicle-tracking",
      color: "bg-indigo-100 dark:bg-indigo-900",
      textColor: "text-indigo-700 dark:text-indigo-300",
    },
    {
      title: "Reports",
      description: "View business analytics",
      icon: BarChart3,
      path: "/reports",
      color: "bg-red-100 dark:bg-red-900",
      textColor: "text-red-700 dark:text-red-300",
    },
    {
      title: "Outstanding",
      description: "Check outstanding amounts",
      icon: Clock,
      path: "/outstanding",
      color: "bg-amber-100 dark:bg-amber-900",
      textColor: "text-amber-700 dark:text-amber-300",
    },
    {
      title: "Tax Settings",
      description: "Configure tax rates",
      icon: DollarSign,
      path: "/tax-settings",
      color: "bg-emerald-100 dark:bg-emerald-900",
      textColor: "text-emerald-700 dark:text-emerald-300",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Welcome to Vikas Milk Centre management system.</p>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹45,231.89</div>
            <p className="text-xs text-muted-foreground">+20.1% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Outstanding</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹12,234.59</div>
            <p className="text-xs text-muted-foreground">+4.3% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+573</div>
            <p className="text-xs text-muted-foreground">+12 new this week</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Products in Stock</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">28</div>
            <p className="text-xs text-muted-foreground">2 low on inventory</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Sales Overview</CardTitle>
            <CardDescription>Daily sales performance</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="sales"
                  stroke="#8884d8"
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Payment Status</CardTitle>
            <CardDescription>Weekly payment statistics</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={paymentData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="received" fill="#4ade80" />
                <Bar dataKey="pending" fill="#f87171" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Navigation Cards */}
      <div>
        <h2 className="text-2xl font-semibold mb-4">Quick Access</h2>
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
          {navigationCards.map((card) => (
            <Card key={card.title} className="overflow-hidden hover:shadow-md transition-shadow">
              <CardHeader className={`${card.color} ${card.textColor}`}>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{card.title}</CardTitle>
                  <card.icon className="h-5 w-5" />
                </div>
                <CardDescription className="text-foreground/70">
                  {card.description}
                </CardDescription>
              </CardHeader>
              <CardFooter className="pt-4">
                <Button variant="outline" className="w-full" onClick={() => navigate(card.path)}>
                  Go to {card.title}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
