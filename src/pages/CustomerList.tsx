
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  Plus, 
  Search, 
  Filter, 
  ArrowUpDown,
  Trash2,
  Edit,
  Eye,
  Phone, 
  MapPin 
} from 'lucide-react';
import { useData } from '@/contexts/data/DataContext';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { OfflineStorageService } from '@/services/OfflineStorageService';

export default function CustomerList() {
  const { customers, deleteCustomer } = useData();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortDirection('asc');
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this customer?')) {
      deleteCustomer(id);
      
      // Queue action for offline sync
      if (!OfflineStorageService.isOnline()) {
        OfflineStorageService.queueOfflineAction({
          type: 'DELETE',
          entity: 'customer',
          data: { id },
          timestamp: new Date().toISOString(),
        });
      }
    }
  };

  const filteredCustomers = customers
    ? customers.filter(
        (customer) =>
          customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (customer.area && customer.area.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (customer.phone && customer.phone.includes(searchTerm))
      )
    : [];

  // Sort customers if sortBy is set
  const sortedCustomers = [...filteredCustomers].sort((a, b) => {
    if (!sortBy) return 0;
    
    const fieldA = a[sortBy as keyof typeof a];
    const fieldB = b[sortBy as keyof typeof b];
    
    if (fieldA === fieldB) return 0;
    
    // Handle null/undefined values
    if (fieldA == null) return sortDirection === 'asc' ? -1 : 1;
    if (fieldB == null) return sortDirection === 'asc' ? 1 : -1;
    
    if (typeof fieldA === 'string' && typeof fieldB === 'string') {
      return sortDirection === 'asc' 
        ? fieldA.localeCompare(fieldB)
        : fieldB.localeCompare(fieldA);
    } else {
      return sortDirection === 'asc'
        ? Number(fieldA) - Number(fieldB)
        : Number(fieldB) - Number(fieldA);
    }
  });

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Customer List</h1>
          <p className="text-muted-foreground">Manage your customers</p>
        </div>
        <Button onClick={() => navigate('/customers')}>
          <Plus className="mr-2 h-4 w-4" /> Add Customer
        </Button>
      </div>

      <Card className="p-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search customers..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Filter className="mr-2 h-4 w-4" />
                Filter
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>Filter by Area</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setSearchTerm('')}>
                All Areas
              </DropdownMenuItem>
              {Array.from(
                new Set(customers?.map((customer) => customer.area).filter(Boolean))
              ).map((area) => (
                <DropdownMenuItem 
                  key={area as React.Key} 
                  onClick={() => setSearchTerm(area as string)}
                >
                  {area}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          
          {searchTerm && (
            <Badge variant="outline" className="gap-1">
              {searchTerm}
              <button 
                className="ml-1 rounded-full hover:bg-muted p-0.5"
                onClick={() => setSearchTerm('')}
              >
                ×
              </button>
            </Badge>
          )}
          
          <div className="ml-auto text-sm text-muted-foreground">
            {sortedCustomers.length} customers
          </div>
        </div>
      </Card>
      
      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead 
                className="cursor-pointer hover:bg-muted/80 transition-colors"
                onClick={() => handleSort('name')}
              >
                <div className="flex items-center">
                  Name
                  {sortBy === 'name' && (
                    <ArrowUpDown className={`ml-2 h-4 w-4 ${sortDirection === 'desc' ? 'rotate-180' : ''} transition-transform`} />
                  )}
                </div>
              </TableHead>
              <TableHead 
                className="cursor-pointer hover:bg-muted/80 transition-colors"
              >
                <div className="flex items-center">
                  Contact
                </div>
              </TableHead>
              <TableHead 
                className="cursor-pointer hover:bg-muted/80 transition-colors"
                onClick={() => handleSort('area')}
              >
                <div className="flex items-center">
                  Area
                  {sortBy === 'area' && (
                    <ArrowUpDown className={`ml-2 h-4 w-4 ${sortDirection === 'desc' ? 'rotate-180' : ''} transition-transform`} />
                  )}
                </div>
              </TableHead>
              <TableHead 
                className="cursor-pointer hover:bg-muted/80 transition-colors"
                onClick={() => handleSort('outstandingAmount')}
              >
                <div className="flex items-center">
                  Outstanding
                  {sortBy === 'outstandingAmount' && (
                    <ArrowUpDown className={`ml-2 h-4 w-4 ${sortDirection === 'desc' ? 'rotate-180' : ''} transition-transform`} />
                  )}
                </div>
              </TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedCustomers.length > 0 ? (
              sortedCustomers.map((customer) => (
                <TableRow key={customer.id} className="hover:bg-muted/30 transition-colors">
                  <TableCell className="font-medium">{customer.name}</TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                      {customer.phone || 'N/A'}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                      {customer.area || 'N/A'}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <span>₹{customer.outstandingAmount?.toFixed(2) || '0.00'}</span>
                      {(customer.outstandingAmount || 0) > 1000 && (
                        <Badge variant="destructive" className="ml-2 px-1.5 py-0 text-xs">High</Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/customer/${customer.id}`)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/customer/${customer.id}`)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                        onClick={() => handleDelete(customer.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center h-24">
                  {searchTerm 
                    ? "No customers match your search criteria."
                    : "No customers found. Add your first customer to get started."}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
