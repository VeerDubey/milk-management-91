
import { useState } from "react";
import { format } from "date-fns";
import { 
  Calendar, 
  FileText, 
  Download, 
  Printer, 
  TruckIcon, 
  Users, 
  Plus 
} from "lucide-react";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useData } from "@/contexts/data/DataContext";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const TrackSheet = () => {
  const navigate = useNavigate();
  const { orders, vehicles, salesmen } = useData();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [groupingOption, setGroupingOption] = useState<string>("none");
  
  // Filter orders for the selected date
  const filteredOrders = orders.filter(order => {
    const orderDate = new Date(order.date);
    return orderDate.toDateString() === selectedDate.toDateString();
  });
  
  // Group orders by the selected option
  const groupedOrders = () => {
    if (groupingOption === "vehicle" && filteredOrders.length > 0) {
      const groups: Record<string, any[]> = {};
      
      filteredOrders.forEach(order => {
        const vehicleId = order.vehicleId || "unassigned";
        if (!groups[vehicleId]) {
          groups[vehicleId] = [];
        }
        groups[vehicleId].push(order);
      });
      
      return groups;
    } else if (groupingOption === "salesman" && filteredOrders.length > 0) {
      const groups: Record<string, any[]> = {};
      
      filteredOrders.forEach(order => {
        const salesmanId = order.salesmanId || "unassigned";
        if (!groups[salesmanId]) {
          groups[salesmanId] = [];
        }
        groups[salesmanId].push(order);
      });
      
      return groups;
    }
    
    return { all: filteredOrders };
  };
  
  // Get vehicle or salesman name by ID
  const getVehicleName = (id: string) => {
    const vehicle = vehicles.find(v => v.id === id);
    return vehicle ? `${vehicle.name} (${vehicle.regNumber})` : "Unassigned Vehicle";
  };
  
  const getSalesmanName = (id: string) => {
    const salesman = salesmen.find(s => s.id === id);
    return salesman ? salesman.name : "Unassigned Salesman";
  };
  
  // Handle export functions
  const handleExportCSV = () => {
    toast.success("Exporting CSV...");
    // Implement CSV export logic
  };
  
  const handleExportPDF = () => {
    toast.success("Exporting PDF...");
    // Implement PDF export logic
  };
  
  const handlePrint = () => {
    toast.success("Preparing to print...");
    window.print();
  };
  
  const handleCreateOrder = () => {
    navigate('/order-entry', { state: { date: selectedDate } });
  };
  
  const groups = groupedOrders();
  const hasOrders = filteredOrders.length > 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Delivery Track Sheet</h1>
          <p className="text-muted-foreground">
            View and print daily delivery track sheets
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportCSV}>
            <FileText className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
          <Button variant="default" className="bg-teal-600 hover:bg-teal-700" onClick={handleExportPDF}>
            <Download className="mr-2 h-4 w-4" />
            Export PDF
          </Button>
          <Button variant="outline" onClick={handlePrint}>
            <Printer className="mr-2 h-4 w-4" />
            Print
          </Button>
        </div>
      </div>
      
      <Card className="bg-teal-50 border-teal-200 print:shadow-none">
        <CardContent className="pt-6">
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between gap-4">
              <div className="space-y-2">
                <h2 className="text-2xl font-semibold">
                  Delivery Track Sheet - {format(selectedDate, "dd MMM yyyy")}
                </h2>
                <p className="text-muted-foreground">
                  Daily milk delivery track sheet for delivery personnel
                </p>
              </div>
              
              <div className="flex gap-4">
                <div>
                  <DatePicker
                    date={selectedDate}
                    setDate={setSelectedDate}
                    className="w-[200px]"
                  />
                </div>
                
                <Select value={groupingOption} onValueChange={setGroupingOption}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="No grouping" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No grouping</SelectItem>
                    <SelectItem value="vehicle">Group by vehicle</SelectItem>
                    <SelectItem value="salesman">Group by salesman</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {!hasOrders ? (
              <div className="py-20 text-center">
                <p className="text-lg text-muted-foreground mb-6">
                  No order data available for the selected date
                </p>
                <Button onClick={handleCreateOrder} className="bg-teal-600 hover:bg-teal-700">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Order for This Date
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                {Object.entries(groups).map(([groupId, groupOrders]) => (
                  <div key={groupId} className="space-y-2">
                    {groupingOption !== "none" && (
                      <div className="bg-teal-100 p-2 rounded-md">
                        <h3 className="text-lg font-medium flex items-center">
                          {groupingOption === "vehicle" ? (
                            <>
                              <TruckIcon className="h-5 w-5 mr-2" />
                              {getVehicleName(groupId)}
                            </>
                          ) : (
                            <>
                              <Users className="h-5 w-5 mr-2" />
                              {getSalesmanName(groupId)}
                            </>
                          )}
                        </h3>
                      </div>
                    )}
                    
                    <div className="rounded-md border overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Customer</TableHead>
                            <TableHead>Address</TableHead>
                            <TableHead>Products</TableHead>
                            <TableHead className="text-right">Quantity</TableHead>
                            <TableHead className="text-right">Amount (₹)</TableHead>
                            <TableHead>Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {groupOrders.map((order) => (
                            <TableRow key={order.id}>
                              <TableCell className="font-medium">{order.customerName}</TableCell>
                              <TableCell>{order.customerAddress || "-"}</TableCell>
                              <TableCell>
                                <div className="max-w-[250px]">
                                  {order.items.map((item, idx) => (
                                    <div key={item.id || idx} className="text-sm">
                                      {item.productName}
                                    </div>
                                  ))}
                                </div>
                              </TableCell>
                              <TableCell className="text-right">
                                {order.items.map((item, idx) => (
                                  <div key={item.id || idx} className="text-sm">
                                    {item.quantity} {item.unit}
                                  </div>
                                ))}
                              </TableCell>
                              <TableCell className="text-right">
                                ₹{order.total.toFixed(2)}
                              </TableCell>
                              <TableCell>
                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                  order.status === "delivered" 
                                    ? "bg-green-100 text-green-800"
                                    : order.status === "pending" 
                                    ? "bg-yellow-100 text-yellow-800"
                                    : "bg-gray-100 text-gray-800"
                                }`}>
                                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                </span>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      <Card className="bg-teal-900 text-white">
        <CardHeader>
          <CardTitle>Instructions</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-4 list-disc pl-6">
            <li>Select a date to view the track sheet for that day.</li>
            <li>Group by vehicle or salesman to filter the track sheet.</li>
            <li>Use the Export button to download as CSV/PDF or the Print button to print.</li>
            <li>Track sheets show all customer orders for the selected date.</li>
            <li>If no data is available, create an order for the selected date first.</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default TrackSheet;
