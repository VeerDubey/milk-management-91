
import React, { useState } from 'react';
import { useData } from '@/contexts/data/DataContext';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Input } from "@/components/ui/input";
import { Search, Calendar, Filter, Download, Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format } from 'date-fns';
import { generateTrackSheetPdf } from '@/utils/trackSheetUtils';

interface TrackSheetHistoryProps {}

const TrackSheetHistory: React.FC<TrackSheetHistoryProps> = () => {
  const { trackSheets, vehicles, salesmen } = useData();
  
  // State for filters
  const [filters, setFilters] = useState({
    searchTerm: '',
    vehicleId: '',
    salesmanId: '',
    dateRange: ''
  });
  
  // Filter track sheets
  const filteredTrackSheets = trackSheets.filter(sheet => {
    // Search filter
    if (filters.searchTerm && 
        !sheet.title.toLowerCase().includes(filters.searchTerm.toLowerCase())) {
      return false;
    }
    
    // Vehicle filter
    if (filters.vehicleId && sheet.vehicleId !== filters.vehicleId) {
      return false;
    }
    
    // Salesman filter
    if (filters.salesmanId && sheet.salesmanId !== filters.salesmanId) {
      return false;
    }
    
    // Date range filter
    if (filters.dateRange) {
      const today = new Date();
      const sheetDate = new Date(sheet.date);
      
      if (filters.dateRange === 'today' && 
          sheetDate.getDate() !== today.getDate()) {
        return false;
      }
      
      if (filters.dateRange === 'week' && 
          sheetDate < new Date(today.setDate(today.getDate() - 7))) {
        return false;
      }
      
      if (filters.dateRange === 'month' && 
          sheetDate < new Date(today.setMonth(today.getMonth() - 1))) {
        return false;
      }
    }
    
    return true;
  });
  
  // Download track sheet as PDF
  const handleDownload = (sheet) => {
    generateTrackSheetPdf(
      sheet.title,
      new Date(sheet.date),
      sheet.rows,
      sheet.productNames,
      [
        { label: 'Vehicle', value: vehicles.find(v => v.id === sheet.vehicleId)?.name || 'N/A' },
        { label: 'Salesman', value: salesmen.find(s => s.id === sheet.salesmanId)?.name || 'N/A' }
      ]
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Track Sheet History</h1>
        <p className="text-muted-foreground">
          View and download previously generated track sheets
        </p>
      </div>
      
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="mr-2 h-5 w-5" />
            Filter Track Sheets
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search track sheets..." 
                value={filters.searchTerm}
                onChange={(e) => setFilters({...filters, searchTerm: e.target.value})}
                className="flex-1"
              />
            </div>
            
            <Select 
              value={filters.vehicleId} 
              onValueChange={(value) => setFilters({...filters, vehicleId: value})}
            >
              <SelectTrigger className="w-full">
                <div className="flex items-center gap-2">
                  <span>
                    {filters.vehicleId ? 
                      'Vehicle: ' + (vehicles.find(v => v.id === filters.vehicleId)?.name || 'Selected') : 
                      'All Vehicles'}
                  </span>
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Vehicles</SelectItem>
                {vehicles.map(vehicle => (
                  <SelectItem key={vehicle.id} value={vehicle.id}>
                    {vehicle.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select 
              value={filters.salesmanId} 
              onValueChange={(value) => setFilters({...filters, salesmanId: value})}
            >
              <SelectTrigger className="w-full">
                <div className="flex items-center gap-2">
                  <span>
                    {filters.salesmanId ? 
                      'Salesman: ' + (salesmen.find(s => s.id === filters.salesmanId)?.name || 'Selected') : 
                      'All Salesmen'}
                  </span>
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Salesmen</SelectItem>
                {salesmen.map(salesman => (
                  <SelectItem key={salesman.id} value={salesman.id}>
                    {salesman.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select 
              value={filters.dateRange} 
              onValueChange={(value) => setFilters({...filters, dateRange: value})}
            >
              <SelectTrigger className="w-full">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>
                    {filters.dateRange === 'today' ? 'Today' : 
                     filters.dateRange === 'week' ? 'This Week' : 
                     filters.dateRange === 'month' ? 'This Month' : 
                     'All Time'}
                  </span>
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Time</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
      
      {/* Track Sheets Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            Track Sheets ({filteredTrackSheets.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredTrackSheets.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Vehicle</TableHead>
                  <TableHead>Salesman</TableHead>
                  <TableHead>Products</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTrackSheets.map((sheet) => {
                  const vehicle = vehicles.find(v => v.id === sheet.vehicleId);
                  const salesman = salesmen.find(s => s.id === sheet.salesmanId);
                  
                  return (
                    <TableRow key={sheet.id}>
                      <TableCell>{sheet.title}</TableCell>
                      <TableCell>{format(new Date(sheet.date), 'dd/MM/yyyy')}</TableCell>
                      <TableCell>{vehicle?.name || 'Not assigned'}</TableCell>
                      <TableCell>{salesman?.name || 'Not assigned'}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {sheet.productNames.map((product, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {product}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button 
                            variant="outline"
                            size="sm" 
                            onClick={() => handleDownload(sheet)}
                          >
                            <Download className="h-4 w-4 mr-1" />
                            PDF
                          </Button>
                          <Button 
                            variant="outline"
                            size="sm"
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No track sheets found matching your filters.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TrackSheetHistory;
