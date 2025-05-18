
import { useState } from "react";
import { useData } from "@/contexts/data/DataContext";
import { format, subDays, isWithinInterval, parseISO } from "date-fns";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription,
  CardFooter 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { DatePickerWithRange } from "@/components/ui/date-picker-with-range";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  FileText, 
  Download, 
  Filter, 
  Search,
  Truck, 
  Calendar,
  User,
  Eye,
  ArrowUpDown
} from "lucide-react";
import { toast } from "sonner";
import { DateRange } from "react-day-picker";
import { Order } from "@/types";

const TrackSheetHistory = () => {
  const { orders, vehicles, salesmen } = useData();
  const [searchQuery, setSearchQuery] = useState("");
  const [vehicleFilter, setVehicleFilter] = useState<string>("all");
  const [salesmanFilter, setSalesmanFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subDays(new Date(), 30),
    to: new Date()
  });
  const [sortConfig, setSortConfig] = useState<{ key: keyof Order | ""; direction: 'asc' | 'desc' }>({
    key: "date",
    direction: "desc"
  });

  // Filter orders based on search, date range, and filters
  const filteredOrders = orders.filter(order => {
    // Date range filter
    const isDateInRange = dateRange && dateRange.from && dateRange.to 
      ? isWithinInterval(new Date(order.date), {
          start: dateRange.from,
          end: dateRange.to
        })
      : true;
      
    // Search filter
    const matchesSearch = searchQuery
      ? order.customerName.toLowerCase().includes(searchQuery.toLowerCase())
      : true;
      
    // Vehicle filter
    const matchesVehicle = vehicleFilter !== "all" 
      ? order.vehicleId === vehicleFilter 
      : true;
      
    // Salesman filter
    const matchesSalesman = salesmanFilter !== "all" 
      ? order.salesmanId === salesmanFilter 
      : true;
      
    // Status filter
    const matchesStatus = statusFilter !== "all" 
      ? order.status === statusFilter 
      : true;
    
    return isDateInRange && matchesSearch && matchesVehicle && matchesSalesman && matchesStatus;
  });
  
  // Sort orders
  const sortedOrders = [...filteredOrders].sort((a, b) => {
    if (!sortConfig.key) return 0;
    
    let aValue, bValue;
    
    if (sortConfig.key === 'date') {
      aValue = new Date(a.date).getTime();
      bValue = new Date(b.date).getTime();
    } else {
      aValue = a[sortConfig.key as keyof Order] || '';
      bValue = b[sortConfig.key as keyof Order] || '';
    }
    
    if (aValue < bValue) {
      return sortConfig.direction === 'asc' ? -1 : 1;
    }
    if (aValue > bValue) {
      return sortConfig.direction === 'asc' ? 1 : -1;
    }
    return 0;
  });
  
  // Handle sort
  const handleSort = (key: keyof Order) => {
    setSortConfig({
      key,
      direction: sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc'
    });
  };
  
  // Export handlers
  const handleExport = (type: string) => {
    toast.success(`Exporting ${sortedOrders.length} records as ${type}`);
  };
  
  // Get vehicle or salesman name by ID
  const getVehicleName = (id: string | undefined) => {
    if (!id) return "Not Assigned";
    const vehicle = vehicles.find(v => v.id === id);
    return vehicle ? vehicle.name : "Unknown";
  };
  
  const getSalesmanName = (id: string | undefined) => {
    if (!id) return "Not Assigned";
    const salesman = salesmen.find(s => s.id === id);
    return salesman ? salesman.name : "Unknown";
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Track Sheet History</h1>
          <p className="text-muted-foreground">
            View and analyze delivery history across all dates
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => handleExport("CSV")}>
            <FileText className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
          <Button onClick={() => handleExport("PDF")}>
            <Download className="mr-2 h-4 w-4" />
            Export PDF
          </Button>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Filter Options</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Date Range</label>
              <DatePickerWithRange date={dateRange} setDate={setDateRange} />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Search Customer</label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search by customer name" 
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Vehicle</label>
              <Select value={vehicleFilter} onValueChange={setVehicleFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Vehicles" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Vehicles</SelectItem>
                  {vehicles.map(vehicle => (
                    <SelectItem key={vehicle.id} value={vehicle.id}>
                      {vehicle.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Salesman</label>
              <Select value={salesmanFilter} onValueChange={setSalesmanFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Salesmen" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Salesmen</SelectItem>
                  {salesmen.map(salesman => (
                    <SelectItem key={salesman.id} value={salesman.id}>
                      {salesman.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="mt-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <div className="flex flex-wrap gap-2">
                <Button 
                  variant={statusFilter === "all" ? "default" : "outline"} 
                  size="sm"
                  onClick={() => setStatusFilter("all")}
                >
                  All
                </Button>
                <Button 
                  variant={statusFilter === "delivered" ? "default" : "outline"} 
                  size="sm"
                  onClick={() => setStatusFilter("delivered")}
                  className={statusFilter === "delivered" ? "bg-green-600 hover:bg-green-700" : ""}
                >
                  Delivered
                </Button>
                <Button 
                  variant={statusFilter === "pending" ? "default" : "outline"} 
                  size="sm"
                  onClick={() => setStatusFilter("pending")}
                  className={statusFilter === "pending" ? "bg-amber-500 hover:bg-amber-600" : ""}
                >
                  Pending
                </Button>
                <Button 
                  variant={statusFilter === "cancelled" ? "default" : "outline"} 
                  size="sm"
                  onClick={() => setStatusFilter("cancelled")}
                  className={statusFilter === "cancelled" ? "bg-red-500 hover:bg-red-600" : ""}
                >
                  Cancelled
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Delivery History</CardTitle>
            <Badge variant="outline">{sortedOrders.length} Records</Badge>
          </div>
        </CardHeader>
        <CardContent>
          {sortedOrders.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-muted-foreground">No delivery records found matching your filters</p>
              <Button className="mt-4" variant="outline" onClick={() => {
                setSearchQuery("");
                setVehicleFilter("all");
                setSalesmanFilter("all");
                setStatusFilter("all");
              }}>
                <Filter className="mr-2 h-4 w-4" />
                Clear Filters
              </Button>
            </div>
          ) : (
            <div className="rounded-md border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="cursor-pointer w-[120px]" onClick={() => handleSort('date')}>
                      <div className="flex items-center justify-between">
                        Date
                        <ArrowUpDown className="h-4 w-4" />
                      </div>
                    </TableHead>
                    <TableHead className="cursor-pointer" onClick={() => handleSort('customerName')}>
                      <div className="flex items-center justify-between">
                        Customer
                        <ArrowUpDown className="h-4 w-4" />
                      </div>
                    </TableHead>
                    <TableHead>Products</TableHead>
                    <TableHead className="cursor-pointer" onClick={() => handleSort('vehicleId')}>Vehicle</TableHead>
                    <TableHead className="cursor-pointer" onClick={() => handleSort('salesmanId')}>Salesman</TableHead>
                    <TableHead className="text-right cursor-pointer" onClick={() => handleSort('total')}>
                      <div className="flex items-center justify-end">
                        Amount
                        <ArrowUpDown className="h-4 w-4 ml-2" />
                      </div>
                    </TableHead>
                    <TableHead className="cursor-pointer" onClick={() => handleSort('status')}>
                      <div className="flex items-center justify-between">
                        Status
                        <ArrowUpDown className="h-4 w-4" />
                      </div>
                    </TableHead>
                    <TableHead className="w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">
                        <div className="flex flex-col">
                          <span>{format(new Date(order.date), "dd MMM yyyy")}</span>
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(order.date), "EEEE")}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>{order.customerName}</TableCell>
                      <TableCell>
                        <div className="max-h-[80px] overflow-y-auto">
                          {order.items.map((item, idx) => (
                            <div key={item.id || idx} className="text-sm">
                              {item.quantity} {item.unit} {item.productName}
                            </div>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Truck className="h-4 w-4 mr-2 text-muted-foreground" />
                          {getVehicleName(order.vehicleId)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <User className="h-4 w-4 mr-2 text-muted-foreground" />
                          {getSalesmanName(order.salesmanId)}
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        ₹{order.total.toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <Badge className={
                          order.status === "delivered" 
                            ? "bg-green-100 text-green-800 hover:bg-green-200" 
                            : order.status === "pending" 
                            ? "bg-amber-100 text-amber-800 hover:bg-amber-200" 
                            : "bg-red-100 text-red-800 hover:bg-red-200"
                        }>
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm" className="w-9 p-0">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
        <CardFooter className="justify-between border-t p-4">
          <div className="text-sm text-muted-foreground">
            Showing {sortedOrders.length} out of {orders.length} total records
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => toast.success("Feature will be implemented soon")}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => toast.success("Feature will be implemented soon")}
            >
              Next
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default TrackSheetHistory;
