
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { 
  Truck, 
  Plus, 
  Eye, 
  Edit, 
  Download, 
  MapPin, 
  Clock, 
  Package,
  Route,
  CheckCircle,
  AlertCircle,
  Users
} from 'lucide-react';

interface LoadSheet {
  id: string;
  vehicleNumber: string;
  driverName: string;
  route: string;
  totalOrders: number;
  totalQuantity: number;
  status: 'pending' | 'loaded' | 'in-transit' | 'delivered';
  createdAt: string;
  estimatedDelivery: string;
}

const mockLoadSheets: LoadSheet[] = [
  {
    id: 'LS001',
    vehicleNumber: 'MH-12-AB-1234',
    driverName: 'Ramesh Kumar',
    route: 'Route A - Sector 1-5',
    totalOrders: 45,
    totalQuantity: 320,
    status: 'in-transit',
    createdAt: '2024-01-15T08:30:00',
    estimatedDelivery: '2024-01-15T12:00:00'
  },
  {
    id: 'LS002',
    vehicleNumber: 'MH-12-CD-5678',
    driverName: 'Suresh Patel',
    route: 'Route B - Sector 6-10',
    totalOrders: 38,
    totalQuantity: 275,
    status: 'loaded',
    createdAt: '2024-01-15T09:00:00',
    estimatedDelivery: '2024-01-15T13:30:00'
  },
  {
    id: 'LS003',
    vehicleNumber: 'MH-12-EF-9012',
    driverName: 'Mahesh Singh',
    route: 'Route C - Sector 11-15',
    totalOrders: 52,
    totalQuantity: 410,
    status: 'delivered',
    createdAt: '2024-01-15T07:45:00',
    estimatedDelivery: '2024-01-15T11:15:00'
  }
];

export default function LoadSheetManagement() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'secondary';
      case 'loaded': return 'default';
      case 'in-transit': return 'default';
      case 'delivered': return 'default';
      default: return 'secondary';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'loaded': return <Package className="h-4 w-4" />;
      case 'in-transit': return <Truck className="h-4 w-4" />;
      case 'delivered': return <CheckCircle className="h-4 w-4" />;
      default: return <AlertCircle className="h-4 w-4" />;
    }
  };

  const handleCreateLoadSheet = () => {
    toast.success('Load sheet created successfully');
    setIsCreateDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Load Sheet Management</h1>
          <p className="text-muted-foreground">
            Manage vehicle load sheets and delivery operations
          </p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create Load Sheet
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Load Sheet</DialogTitle>
                <DialogDescription>
                  Generate a new load sheet for vehicle delivery operations
                </DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-4 py-4">
                <div className="space-y-2">
                  <Label>Vehicle Number</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select vehicle" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="vehicle1">MH-12-AB-1234</SelectItem>
                      <SelectItem value="vehicle2">MH-12-CD-5678</SelectItem>
                      <SelectItem value="vehicle3">MH-12-EF-9012</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Driver Name</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select driver" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="driver1">Ramesh Kumar</SelectItem>
                      <SelectItem value="driver2">Suresh Patel</SelectItem>
                      <SelectItem value="driver3">Mahesh Singh</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Route</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select route" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="route1">Route A - Sector 1-5</SelectItem>
                      <SelectItem value="route2">Route B - Sector 6-10</SelectItem>
                      <SelectItem value="route3">Route C - Sector 11-15</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Delivery Date</Label>
                  <Input type="date" defaultValue={selectedDate} />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateLoadSheet}>
                  Create Load Sheet
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Vehicles</CardTitle>
            <Truck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">
              Currently on routes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">135</div>
            <p className="text-xs text-muted-foreground">
              Today's deliveries
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Drivers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">
              Available drivers
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Routes</CardTitle>
            <Route className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">15</div>
            <p className="text-xs text-muted-foreground">
              Delivery routes
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="active" className="space-y-4">
        <TabsList>
          <TabsTrigger value="active">Active Load Sheets</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="routes">Route Planning</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Today's Load Sheets</CardTitle>
                  <CardDescription>
                    Active delivery operations for {new Date().toLocaleDateString()}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Label>Date:</Label>
                  <Input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-40"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Load Sheet ID</TableHead>
                    <TableHead>Vehicle</TableHead>
                    <TableHead>Driver</TableHead>
                    <TableHead>Route</TableHead>
                    <TableHead className="text-center">Orders</TableHead>
                    <TableHead className="text-center">Quantity (L)</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockLoadSheets.map((sheet) => (
                    <TableRow key={sheet.id}>
                      <TableCell className="font-medium">{sheet.id}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Truck className="h-4 w-4 text-muted-foreground" />
                          {sheet.vehicleNumber}
                        </div>
                      </TableCell>
                      <TableCell>{sheet.driverName}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          {sheet.route}
                        </div>
                      </TableCell>
                      <TableCell className="text-center">{sheet.totalOrders}</TableCell>
                      <TableCell className="text-center">{sheet.totalQuantity}L</TableCell>
                      <TableCell>
                        <Badge variant={getStatusColor(sheet.status)} className="flex items-center gap-1 w-fit">
                          {getStatusIcon(sheet.status)}
                          {sheet.status.charAt(0).toUpperCase() + sheet.status.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-center gap-2">
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Completed Load Sheets</CardTitle>
              <CardDescription>
                Historical delivery records and performance metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                No completed load sheets for selected date
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="routes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Route Planning & Optimization</CardTitle>
              <CardDescription>
                Plan and optimize delivery routes for maximum efficiency
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Route Efficiency</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Route A</span>
                        <Badge variant="default">92% Efficient</Badge>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Route B</span>
                        <Badge variant="secondary">87% Efficient</Badge>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Route C</span>
                        <Badge variant="default">95% Efficient</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Optimization Suggestions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span>Consolidate Route B stops</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 text-yellow-500" />
                        <span>Peak hour traffic on Route A</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span>Route C performing optimally</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
