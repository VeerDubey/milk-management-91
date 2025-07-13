
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { 
  Upload, 
  Download, 
  Percent, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Package,
  DollarSign,
  Calendar
} from 'lucide-react';

interface RateUpdate {
  id: string;
  type: 'product' | 'customer';
  name: string;
  currentRate: number;
  newRate: number;
  change: number;
  changePercent: number;
}

const mockRateData: RateUpdate[] = [
  { id: '1', type: 'product', name: 'Whole Milk (1L)', currentRate: 65, newRate: 68, change: 3, changePercent: 4.6 },
  { id: '2', type: 'product', name: 'Toned Milk (1L)', currentRate: 58, newRate: 60, change: 2, changePercent: 3.4 },
  { id: '3', type: 'customer', name: 'Rajesh Kumar', currentRate: 60, newRate: 62, change: 2, changePercent: 3.3 },
  { id: '4', type: 'customer', name: 'Priya Sharma', currentRate: 65, newRate: 67, change: 2, changePercent: 3.1 },
];

export default function BulkRates() {
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [updateType, setUpdateType] = useState<'percentage' | 'fixed'>('percentage');
  const [updateValue, setUpdateValue] = useState('');
  const [effectiveDate, setEffectiveDate] = useState('');

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedItems(mockRateData.map(item => item.id));
    } else {
      setSelectedItems([]);
    }
  };

  const handleSelectItem = (itemId: string, checked: boolean) => {
    if (checked) {
      setSelectedItems(prev => [...prev, itemId]);
    } else {
      setSelectedItems(prev => prev.filter(id => id !== itemId));
    }
  };

  const handleBulkUpdate = () => {
    if (selectedItems.length === 0) {
      toast.error('Please select items to update');
      return;
    }
    if (!updateValue) {
      toast.error('Please enter update value');
      return;
    }

    toast.success(`Updated rates for ${selectedItems.length} items`);
    setSelectedItems([]);
    setUpdateValue('');
  };

  const exportRates = () => {
    toast.success('Rate data exported successfully');
  };

  const importRates = () => {
    toast.success('Rate data imported successfully');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Bulk Rate Management</h1>
          <p className="text-muted-foreground">
            Update multiple product and customer rates efficiently
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={importRates}>
            <Upload className="mr-2 h-4 w-4" />
            Import Rates
          </Button>
          <Button variant="outline" onClick={exportRates}>
            <Download className="mr-2 h-4 w-4" />
            Export Rates
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">45</div>
            <p className="text-xs text-muted-foreground">
              Available for rate updates
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Customer Rates</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,247</div>
            <p className="text-xs text-muted-foreground">
              Custom pricing rules
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Updates</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">
              Scheduled for tomorrow
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Rate Change</CardTitle>
            <Percent className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+3.2%</div>
            <p className="text-xs text-muted-foreground">
              Last month
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="bulk-update" className="space-y-4">
        <TabsList>
          <TabsTrigger value="bulk-update">Bulk Update</TabsTrigger>
          <TabsTrigger value="scheduled">Scheduled Updates</TabsTrigger>
          <TabsTrigger value="history">Update History</TabsTrigger>
        </TabsList>

        <TabsContent value="bulk-update" className="space-y-4">
          {/* Bulk Update Controls */}
          <Card>
            <CardHeader>
              <CardTitle>Bulk Rate Update</CardTitle>
              <CardDescription>
                Apply rate changes to multiple products or customers at once
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label>Update Type</Label>
                  <Select value={updateType} onValueChange={(value: 'percentage' | 'fixed') => setUpdateType(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage">Percentage Change</SelectItem>
                      <SelectItem value="fixed">Fixed Amount</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Update Value</Label>
                  <Input
                    type="number"
                    placeholder={updateType === 'percentage' ? '5' : '2.50'}
                    value={updateValue}
                    onChange={(e) => setUpdateValue(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Effective Date</Label>
                  <Input
                    type="date"
                    value={effectiveDate}
                    onChange={(e) => setEffectiveDate(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>&nbsp;</Label>
                  <Button onClick={handleBulkUpdate} className="w-full">
                    <DollarSign className="mr-2 h-4 w-4" />
                    Apply Updates
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Rate Data Table */}
          <Card>
            <CardHeader>
              <CardTitle>Rate Preview</CardTitle>
              <CardDescription>
                Select items and preview rate changes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={selectedItems.length === mockRateData.length}
                        onCheckedChange={handleSelectAll}
                      />
                    </TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead className="text-right">Current Rate</TableHead>
                    <TableHead className="text-right">New Rate</TableHead>
                    <TableHead className="text-right">Change</TableHead>
                    <TableHead className="text-center">% Change</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockRateData.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedItems.includes(item.id)}
                          onCheckedChange={(checked) => handleSelectItem(item.id, checked as boolean)}
                        />
                      </TableCell>
                      <TableCell>
                        <Badge variant={item.type === 'product' ? 'default' : 'secondary'}>
                          {item.type === 'product' ? 'Product' : 'Customer'}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <TableCell className="text-right">₹{item.currentRate.toFixed(2)}</TableCell>
                      <TableCell className="text-right">₹{item.newRate.toFixed(2)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          {item.change > 0 ? (
                            <TrendingUp className="h-3 w-3 text-green-600" />
                          ) : (
                            <TrendingDown className="h-3 w-3 text-red-600" />
                          )}
                          ₹{Math.abs(item.change).toFixed(2)}
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant={item.changePercent > 0 ? 'default' : 'destructive'}>
                          {item.changePercent > 0 ? '+' : ''}{item.changePercent.toFixed(1)}%
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="scheduled" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Scheduled Rate Updates</CardTitle>
              <CardDescription>
                View and manage future rate changes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                No scheduled updates found
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Rate Update History</CardTitle>
              <CardDescription>
                Track all past rate changes and their impact
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                No update history available
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
