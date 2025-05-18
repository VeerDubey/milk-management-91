
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { 
  Home, 
  Users, 
  ClipboardList, 
  CreditCard, 
  BarChart3, 
  FileText, 
  TruckIcon, 
  DollarSign, 
  Tag, 
  Warehouse, 
  Package, 
  ShoppingBag, 
  FileSpreadsheet, 
  Database, 
  Settings, 
  UserRound, 
  Truck, 
  Receipt, 
  Menu, 
  MapPin, 
  Bell,
  ChevronRight,
  Calendar,
  Milk
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

const Index = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleOrderEntry = () => {
    navigate("/order-entry");
    toast({
      title: "Order Entry",
      description: "Opening order entry form",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome to Fresh Milk Network - Your daily milk order management system
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={handleOrderEntry}>New Order</Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-md hover:shadow-lg transition-all">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹12,450</div>
            <p className="text-xs text-muted-foreground">
              +15% from last month
            </p>
          </CardContent>
        </Card>
        <Card className="shadow-md hover:shadow-lg transition-all">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">28</div>
            <p className="text-xs text-muted-foreground">
              +2 new this month
            </p>
          </CardContent>
        </Card>
        <Card className="shadow-md hover:shadow-lg transition-all">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <Milk className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">425 L</div>
            <p className="text-xs text-muted-foreground">
              Daily average: 14.2 L
            </p>
          </CardContent>
        </Card>
        <Card className="shadow-md hover:shadow-lg transition-all">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Outstanding</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹4,550</div>
            <p className="text-xs text-muted-foreground">
              -₹1,200 from last week
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3 lg:w-auto">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="recent">Recent Activity</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card className="shadow-md hover:shadow-lg transition-all">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button 
                  variant="outline" 
                  className="w-full justify-start" 
                  onClick={handleOrderEntry}
                >
                  <Milk className="mr-2 h-4 w-4" />
                  New Order Entry
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => navigate("/customers")}
                >
                  <Users className="mr-2 h-4 w-4" />
                  Manage Customers
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => navigate("/payments")}
                >
                  <CreditCard className="mr-2 h-4 w-4" />
                  Record Payment
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => navigate("/track-sheet")}
                >
                  <Truck className="mr-2 h-4 w-4" />
                  View Track Sheet
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => navigate("/master")}
                >
                  <Database className="mr-2 h-4 w-4" />
                  Master Module
                </Button>
              </CardContent>
            </Card>
            <Card className="shadow-md hover:shadow-lg transition-all">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Recent Orders</CardTitle>
                <Button variant="ghost" size="sm" className="gap-1" onClick={() => navigate("/orders")}>
                  View All <ChevronRight className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex items-center justify-between border-b pb-2">
                      <div>
                        <div className="font-medium">Customer {i + 1}</div>
                        <div className="text-xs text-muted-foreground">{new Date().toLocaleDateString()}</div>
                      </div>
                      <div className="text-sm font-medium">₹{Math.floor(Math.random() * 1000)}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            <Card className="shadow-md hover:shadow-lg transition-all">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Calendar</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => toast({ title: "Calendar", description: "Calendar feature coming soon" })}>
                  <Calendar className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent className="flex justify-center items-center min-h-[180px]">
                <div className="text-center">
                  <Calendar className="h-16 w-16 text-muted-foreground mx-auto mb-2" />
                  <div className="text-xl font-bold">{new Date().getDate()}</div>
                  <div className="text-sm text-muted-foreground">{new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</div>
                </div>
              </CardContent>
            </Card>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="col-span-1 shadow-md hover:shadow-lg transition-all">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Outstanding Payments</CardTitle>
                <Button variant="ghost" size="sm" className="gap-1" onClick={() => navigate("/outstanding")}>
                  View All <ChevronRight className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { name: "Customer 1", amount: "₹1,200" },
                    { name: "Customer 2", amount: "₹950" },
                    { name: "Customer 3", amount: "₹780" },
                  ].map((customer, i) => (
                    <div key={i} className="flex items-center justify-between border-b pb-2">
                      <div className="text-sm font-medium">{customer.name}</div>
                      <div className="text-sm font-bold text-red-500">{customer.amount}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            <Card className="col-span-1 shadow-md hover:shadow-lg transition-all">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Sales Overview</CardTitle>
                <Button variant="ghost" size="sm" className="gap-1" onClick={() => navigate("/reports")}>
                  Reports <ChevronRight className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent className="flex justify-center items-center h-[200px]">
                <div className="text-center">
                  <BarChart3 className="h-24 w-24 text-muted-foreground" />
                  <p className="mt-2 text-sm text-muted-foreground">
                    View detailed sales reports in the Reports section
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="analytics" className="space-y-4">
          <Card className="shadow-md hover:shadow-lg transition-all">
            <CardHeader>
              <CardTitle>Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-8">
                <BarChart3 className="h-32 w-32 text-muted-foreground mb-4" />
                <p className="text-muted-foreground text-center max-w-md">
                  Analytics data will be displayed here as you begin using the system.
                  Track your sales, customer growth, and inventory trends.
                </p>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => navigate("/reports")}
                >
                  Go to Reports
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="recent" className="space-y-4">
          <Card className="shadow-md hover:shadow-lg transition-all">
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex gap-3 items-start border-b pb-3">
                    <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                      {i % 3 === 0 ? <Users className="h-4 w-4" /> : 
                       i % 3 === 1 ? <CreditCard className="h-4 w-4" /> : 
                       <Milk className="h-4 w-4" />}
                    </div>
                    <div>
                      <p className="font-medium">
                        {i % 3 === 0 ? "New customer added" : 
                         i % 3 === 1 ? "Payment received" : 
                         "Order placed"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(Date.now() - i * 3600000).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Index;
