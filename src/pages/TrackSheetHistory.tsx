
import { useState } from "react";
import { useData } from "@/contexts/data/DataContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { DatePicker } from "@/components/ui/date-picker";
import {
  Search,
  Filter,
  Calendar,
  FileText,
  Download,
  Eye,
  Truck,
  User
} from "lucide-react";
import { format, isWithinInterval, parseISO, subDays } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";

const DELIVERY_STATUS = {
  DELIVERED: "delivered",
  PARTIALLY_DELIVERED: "partially_delivered",
  NOT_DELIVERED: "not_delivered",
  RETURNED: "returned"
};

const TIME_FILTERS = {
  TODAY: "today",
  YESTERDAY: "yesterday",
  LAST_7_DAYS: "last_7_days",
  LAST_30_DAYS: "last_30_days",
  CUSTOM: "custom"
};

interface DeliveryHistoryItem {
  id: string;
  date: string;
  route: string;
  driver: string;
  salesman: string;
  totalOrders: number;
  deliveredOrders: number;
  returnedOrders: number;
  status: string;
  totalAmount: number;
  collectedAmount: number;
}

// Mock data for delivery history
const mockDeliveryHistory: DeliveryHistoryItem[] = [
  {
    id: "DEL-001",
    date: new Date().toISOString(),
    route: "North Mumbai",
    driver: "Rakesh Kumar",
    salesman: "Amit Singh",
    totalOrders: 35,
    deliveredOrders: 32,
    returnedOrders: 3,
    status: DELIVERY_STATUS.PARTIALLY_DELIVERED,
    totalAmount: 25600,
    collectedAmount: 24100
  },
  {
    id: "DEL-002",
    date: subDays(new Date(), 1).toISOString(),
    route: "South Mumbai",
    driver: "Vijay Shah",
    salesman: "Rajesh Patel",
    totalOrders: 28,
    deliveredOrders: 28,
    returnedOrders: 0,
    status: DELIVERY_STATUS.DELIVERED,
    totalAmount: 18450,
    collectedAmount: 18450
  },
  {
    id: "DEL-003",
    date: subDays(new Date(), 2).toISOString(),
    route: "East Mumbai",
    driver: "Sunil Verma",
    salesman: "Prakash Joshi",
    totalOrders: 40,
    deliveredOrders: 38,
    returnedOrders: 2,
    status: DELIVERY_STATUS.PARTIALLY_DELIVERED,
    totalAmount: 32100,
    collectedAmount: 30500
  },
  {
    id: "DEL-004",
    date: subDays(new Date(), 3).toISOString(),
    route: "West Mumbai",
    driver: "Manoj Tiwari",
    salesman: "Dinesh Shah",
    totalOrders: 25,
    deliveredOrders: 15,
    returnedOrders: 10,
    status: DELIVERY_STATUS.PARTIALLY_DELIVERED,
    totalAmount: 18000,
    collectedAmount: 12000
  },
  {
    id: "DEL-005",
    date: subDays(new Date(), 6).toISOString(),
    route: "Central Mumbai",
    driver: "Ramesh Singh",
    salesman: "Karan Malhotra",
    totalOrders: 30,
    deliveredOrders: 30,
    returnedOrders: 0,
    status: DELIVERY_STATUS.DELIVERED,
    totalAmount: 24500,
    collectedAmount: 24500
  }
];

export default function TrackSheetHistory() {
  const { orders, customers } = useData();
  const [searchQuery, setSearchQuery] = useState("");
  const [timeFilter, setTimeFilter] = useState(TIME_FILTERS.LAST_7_DAYS);
  const [startDate, setStartDate] = useState<Date>(subDays(new Date(), 7));
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedDelivery, setSelectedDelivery] = useState<DeliveryHistoryItem | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  
  // In a real app, this data would come from the backend
  const deliveryHistory = mockDeliveryHistory;
  
  // Handle time filter changes
  const handleTimeFilterChange = (value: string) => {
    setTimeFilter(value);
    const today = new Date();
    
    switch (value) {
      case TIME_FILTERS.TODAY:
        setStartDate(today);
        setEndDate(today);
        break;
      case TIME_FILTERS.YESTERDAY:
        const yesterday = subDays(today, 1);
        setStartDate(yesterday);
        setEndDate(yesterday);
        break;
      case TIME_FILTERS.LAST_7_DAYS:
        setStartDate(subDays(today, 7));
        setEndDate(today);
        break;
      case TIME_FILTERS.LAST_30_DAYS:
        setStartDate(subDays(today, 30));
        setEndDate(today);
        break;
      // For custom, we don't change the dates
    }
  };
  
  // Filter delivery history based on search, dates, and status
  const filteredDeliveries = deliveryHistory.filter(delivery => {
    const deliveryDate = parseISO(delivery.date);
    const matchesSearch = 
      delivery.route.toLowerCase().includes(searchQuery.toLowerCase()) ||
      delivery.driver.toLowerCase().includes(searchQuery.toLowerCase()) ||
      delivery.salesman.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesDateRange = isWithinInterval(deliveryDate, { start: startDate, end: endDate });
    
    const matchesStatus = statusFilter === 'all' || delivery.status === statusFilter;
    
    return matchesSearch && matchesDateRange && matchesStatus;
  });
  
  // Calculate summary statistics
  const totalDeliveries = filteredDeliveries.length;
  const totalOrders = filteredDeliveries.reduce((sum, delivery) => sum + delivery.totalOrders, 0);
  const deliveredOrders = filteredDeliveries.reduce((sum, delivery) => sum + delivery.deliveredOrders, 0);
  const returnedOrders = filteredDeliveries.reduce((sum, delivery) => sum + delivery.returnedOrders, 0);
  const deliveryRate = totalOrders > 0 ? (deliveredOrders / totalOrders) * 100 : 0;
  const totalAmount = filteredDeliveries.reduce((sum, delivery) => sum + delivery.totalAmount, 0);
  const collectedAmount = filteredDeliveries.reduce((sum, delivery) => sum + delivery.collectedAmount, 0);
  const collectionRate = totalAmount > 0 ? (collectedAmount / totalAmount) * 100 : 0;
  
  // Handle view details
  const handleViewDetails = (delivery: DeliveryHistoryItem) => {
    setSelectedDelivery(delivery);
    setIsViewDialogOpen(true);
  };
  
  // Mock function for generating reports
  const generateReport = (deliveryId: string | null) => {
    if (deliveryId) {
      toast.success(`Report for delivery ${deliveryId} downloaded`);
    } else {
      toast.success("Summary report downloaded");
    }
  };
  
  // Get status badge based on delivery status
  const getStatusBadge = (status: string) => {
    switch (status) {
      case DELIVERY_STATUS.DELIVERED:
        return <Badge variant="success">Delivered</Badge>;
      case DELIVERY_STATUS.PARTIALLY_DELIVERED:
        return <Badge variant="warning">Partially Delivered</Badge>;
      case DELIVERY_STATUS.NOT_DELIVERED:
        return <Badge variant="destructive">Not Delivered</Badge>;
      case DELIVERY_STATUS.RETURNED:
        return <Badge variant="outline">Returned</Badge>;
      default:
        return <Badge>Unknown</Badge>;
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Track Sheet History</h1>
          <p className="text-muted-foreground">
            View past delivery track sheets and performance metrics
          </p>
        </div>
        <Button onClick={() => generateReport(null)} variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Download Report
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Delivery Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{deliveryRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              {deliveredOrders} of {totalOrders} orders delivered
            </p>
            <div className="mt-2 h-2 w-full bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-green-500 rounded-full"
                style={{ width: `${deliveryRate}%` }}
              ></div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Collection Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{collectionRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              ₹{collectedAmount.toLocaleString()} of ₹{totalAmount.toLocaleString()}
            </p>
            <div className="mt-2 h-2 w-full bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 rounded-full"
                style={{ width: `${collectionRate}%` }}
              ></div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Deliveries</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalDeliveries}</div>
            <p className="text-xs text-muted-foreground">
              In selected time period
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Returned Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{returnedOrders}</div>
            <p className="text-xs text-muted-foreground">
              {totalOrders > 0 ? ((returnedOrders / totalOrders) * 100).toFixed(1) : 0}% return rate
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Delivery History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex flex-col gap-4 md:flex-row">
              <div className="flex-1 md:flex-initial md:w-[250px]">
                <Select value={timeFilter} onValueChange={handleTimeFilterChange}>
                  <SelectTrigger>
                    <Calendar className="mr-2 h-4 w-4" />
                    <SelectValue placeholder="Select time period" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={TIME_FILTERS.TODAY}>Today</SelectItem>
                    <SelectItem value={TIME_FILTERS.YESTERDAY}>Yesterday</SelectItem>
                    <SelectItem value={TIME_FILTERS.LAST_7_DAYS}>Last 7 Days</SelectItem>
                    <SelectItem value={TIME_FILTERS.LAST_30_DAYS}>Last 30 Days</SelectItem>
                    <SelectItem value={TIME_FILTERS.CUSTOM}>Custom Range</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {timeFilter === TIME_FILTERS.CUSTOM && (
                <>
                  <div className="flex items-center gap-2">
                    <span className="text-sm">From:</span>
                    <DatePicker date={startDate} setDate={setStartDate} />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm">To:</span>
                    <DatePicker date={endDate} setDate={setEndDate} />
                  </div>
                </>
              )}
              
              <div className="flex-1 relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by route, driver, or salesman..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value={DELIVERY_STATUS.DELIVERED}>Delivered</SelectItem>
                  <SelectItem value={DELIVERY_STATUS.PARTIALLY_DELIVERED}>Partially Delivered</SelectItem>
                  <SelectItem value={DELIVERY_STATUS.NOT_DELIVERED}>Not Delivered</SelectItem>
                  <SelectItem value={DELIVERY_STATUS.RETURNED}>Returned</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Route</TableHead>
                    <TableHead>Driver/Salesman</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Orders</TableHead>
                    <TableHead className="text-right">Amount (₹)</TableHead>
                    <TableHead className="text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDeliveries.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8">
                        No delivery records found for the selected criteria
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredDeliveries.map((delivery) => (
                      <TableRow key={delivery.id}>
                        <TableCell className="font-medium">{delivery.id}</TableCell>
                        <TableCell>{format(parseISO(delivery.date), "MMM dd, yyyy")}</TableCell>
                        <TableCell>{delivery.route}</TableCell>
                        <TableCell>
                          <div className="flex flex-col text-sm">
                            <div className="flex items-center gap-1">
                              <Truck className="h-3 w-3 text-muted-foreground" />
                              <span>{delivery.driver}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <User className="h-3 w-3 text-muted-foreground" />
                              <span>{delivery.salesman}</span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(delivery.status)}</TableCell>
                        <TableCell className="text-right">
                          <span className="font-medium">{delivery.deliveredOrders}/{delivery.totalOrders}</span>
                          {delivery.returnedOrders > 0 && (
                            <span className="text-xs text-red-600 block">
                              {delivery.returnedOrders} returned
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <span className="font-medium">₹{delivery.collectedAmount.toLocaleString()}</span>
                          <span className="text-xs text-muted-foreground block">
                            of ₹{delivery.totalAmount.toLocaleString()}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex justify-center space-x-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleViewDetails(delivery)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => generateReport(delivery.id)}
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* View Delivery Details Dialog */}
      {selectedDelivery && (
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="sm:max-w-[700px]">
            <DialogHeader>
              <DialogTitle>Delivery Details - {selectedDelivery.id}</DialogTitle>
            </DialogHeader>
            <div className="space-y-6 py-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2">Delivery Information</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Date:</span>
                      <span className="text-sm font-medium">
                        {format(parseISO(selectedDelivery.date), "MMM dd, yyyy")}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Route:</span>
                      <span className="text-sm font-medium">{selectedDelivery.route}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Driver:</span>
                      <span className="text-sm font-medium">{selectedDelivery.driver}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Salesman:</span>
                      <span className="text-sm font-medium">{selectedDelivery.salesman}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Status:</span>
                      <span>{getStatusBadge(selectedDelivery.status)}</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Order Summary</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Total Orders:</span>
                      <span className="text-sm font-medium">{selectedDelivery.totalOrders}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Delivered:</span>
                      <span className="text-sm font-medium text-green-600">
                        {selectedDelivery.deliveredOrders}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Returned:</span>
                      <span className="text-sm font-medium text-red-600">
                        {selectedDelivery.returnedOrders}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Total Amount:</span>
                      <span className="text-sm font-medium">
                        ₹{selectedDelivery.totalAmount.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Collected Amount:</span>
                      <span className="text-sm font-medium">
                        ₹{selectedDelivery.collectedAmount.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">Order Details</h4>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Customer</TableHead>
                        <TableHead>Items</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Amount (₹)</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {/* In a real app, you would map over the actual order details */}
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-6 text-muted-foreground">
                          Detailed order information would appear here
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-semibold">Notes</h4>
                <p className="text-sm text-muted-foreground">
                  {selectedDelivery.status === DELIVERY_STATUS.PARTIALLY_DELIVERED 
                    ? "Some orders could not be delivered due to customer unavailability."
                    : selectedDelivery.status === DELIVERY_STATUS.DELIVERED
                    ? "All orders successfully delivered."
                    : "No delivery notes available."}
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => generateReport(selectedDelivery.id)}>
                <Download className="mr-2 h-4 w-4" />
                Download Report
              </Button>
              <Button onClick={() => setIsViewDialogOpen(false)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
