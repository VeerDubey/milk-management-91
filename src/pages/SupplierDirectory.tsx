
import React, { useState } from 'react';
import { useData } from '@/contexts/data/DataContext';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Truck, Phone, Mail, MapPin, Plus, Search, UserPlus, FileText, Edit, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Supplier } from '@/types';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Define schema for supplier form
const supplierFormSchema = z.object({
  name: z.string().min(2, { message: "Name is required" }),
  contactPerson: z.string().optional(),
  phone: z.string().min(5, { message: "Phone number is required" }),
  email: z.string().email("Invalid email format").optional().or(z.literal('')),
  address: z.string().min(5, { message: "Address is required" }),
  gstNumber: z.string().optional(),
  notes: z.string().optional(),
  category: z.string().optional()
});

type SupplierFormValues = z.infer<typeof supplierFormSchema>;

const SupplierDirectory = () => {
  const { suppliers, addSupplier, updateSupplier, deleteSupplier } = useData();
  const [open, setOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [viewingSupplier, setViewingSupplier] = useState<Supplier | null>(null);
  
  // Create categories from suppliers
  const categories = React.useMemo(() => {
    const uniqueCategories = [...new Set(suppliers.map(s => s.category || 'Uncategorized'))];
    return ['all', ...uniqueCategories];
  }, [suppliers]);

  const form = useForm<SupplierFormValues>({
    resolver: zodResolver(supplierFormSchema),
    defaultValues: {
      name: '',
      contactPerson: '',
      phone: '',
      email: '',
      address: '',
      gstNumber: '',
      notes: '',
      category: ''
    }
  });

  // Filter suppliers based on search query and category
  const filteredSuppliers = React.useMemo(() => {
    return suppliers.filter(supplier => {
      const matchesSearch = searchQuery === '' || 
        supplier.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        (supplier.contactPerson && supplier.contactPerson.toLowerCase().includes(searchQuery.toLowerCase())) ||
        supplier.phone.includes(searchQuery);
        
      const matchesCategory = selectedCategory === 'all' || 
        (supplier.category || 'Uncategorized') === selectedCategory;
        
      return matchesSearch && matchesCategory;
    });
  }, [suppliers, searchQuery, selectedCategory]);

  const openAddDialog = () => {
    setEditingSupplier(null);
    form.reset({
      name: '',
      contactPerson: '',
      phone: '',
      email: '',
      address: '',
      gstNumber: '',
      notes: '',
      category: ''
    });
    setOpen(true);
  };

  const openEditDialog = (supplier: Supplier) => {
    setEditingSupplier(supplier);
    form.reset({
      name: supplier.name,
      contactPerson: supplier.contactPerson || '',
      phone: supplier.phone,
      email: supplier.email || '',
      address: supplier.address,
      gstNumber: supplier.gstNumber || '',
      notes: supplier.notes || '',
      category: supplier.category || ''
    });
    setOpen(true);
  };

  const openViewDialog = (supplier: Supplier) => {
    setViewingSupplier(supplier);
  };

  const handleDeleteSupplier = (id: string) => {
    if (confirm('Are you sure you want to delete this supplier?')) {
      deleteSupplier(id);
      toast.success('Supplier deleted successfully');
    }
  };

  const onSubmit = (data: SupplierFormValues) => {
    if (editingSupplier) {
      updateSupplier(editingSupplier.id, data);
      toast.success('Supplier updated successfully');
    } else {
      // Make sure to pass all required fields from the Supplier type
      addSupplier({
        name: data.name, // Explicitly required
        phone: data.phone, // Explicitly required
        address: data.address, // Explicitly required
        contactPerson: data.contactPerson,
        email: data.email || '',
        gstNumber: data.gstNumber,
        notes: data.notes,
        category: data.category,
        outstandingBalance: 0 // Required field with default value
      });
      toast.success('Supplier added successfully');
    }
    setOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Supplier Directory</h1>
          <p className="text-muted-foreground">
            Manage your suppliers and their contact information
          </p>
        </div>
        <Button onClick={openAddDialog}>
          <Plus className="mr-2 h-4 w-4" />
          Add Supplier
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search suppliers..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-full sm:w-auto">
          <TabsList className="w-full sm:w-auto overflow-auto">
            {categories.map(category => (
              <TabsTrigger key={category} value={category} className="capitalize">
                {category === 'all' ? 'All Suppliers' : category}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredSuppliers.length > 0 ? filteredSuppliers.map((supplier) => (
          <Card key={supplier.id} className="overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-indigo-800 to-purple-800 text-white">
              <CardTitle className="flex items-center justify-between">
                <span>{supplier.name}</span>
                <Truck className="h-5 w-5" />
              </CardTitle>
              <p className="text-sm text-gray-200">{supplier.category || 'Uncategorized'}</p>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="space-y-2">
                <p className="font-medium">Contact Person</p>
                <p className="text-sm text-muted-foreground">{supplier.contactPerson || 'Not specified'}</p>
              </div>
              <div className="grid grid-cols-1 gap-2">
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{supplier.phone}</span>
                </div>
                {supplier.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{supplier.email}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{supplier.address}</span>
                </div>
              </div>
              <div className="flex justify-end space-x-2 pt-4">
                <Button size="sm" variant="outline" onClick={() => openViewDialog(supplier)}>Details</Button>
                <Button size="sm" variant="outline" onClick={() => openEditDialog(supplier)}>
                  <Edit className="h-4 w-4 mr-1" />
                  Edit
                </Button>
                <Button size="sm" variant="destructive" onClick={() => handleDeleteSupplier(supplier.id)}>
                  <Trash2 className="h-4 w-4 mr-1" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )) : (
          <div className="col-span-full flex flex-col items-center justify-center p-8 text-center">
            <Truck className="h-12 w-12 text-muted-foreground" />
            <h2 className="mt-4 text-lg font-medium">No suppliers found</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {searchQuery ? 'Try changing your search query' : 'Add a supplier to get started'}
            </p>
            <Button className="mt-4" onClick={openAddDialog}>
              <Plus className="mr-2 h-4 w-4" />
              Add Supplier
            </Button>
          </div>
        )}
      </div>

      {/* Add/Edit Supplier Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingSupplier ? 'Edit Supplier' : 'Add New Supplier'}</DialogTitle>
            <DialogDescription>
              {editingSupplier ? 'Update supplier details' : 'Enter supplier information below'}
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Supplier Name*</FormLabel>
                    <FormControl>
                      <Input placeholder="Dairy Fresh Co." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="contactPerson"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contact Person</FormLabel>
                    <FormControl>
                      <Input placeholder="John Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number*</FormLabel>
                      <FormControl>
                        <Input placeholder="+91 98765 43210" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="contact@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address*</FormLabel>
                    <FormControl>
                      <Input placeholder="123 Main St, City" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="gstNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>GST Number</FormLabel>
                      <FormControl>
                        <Input placeholder="22AAAAA0000A1Z5" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <FormControl>
                        <Input placeholder="Dairy, Produce, etc." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Input placeholder="Additional details..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingSupplier ? 'Update Supplier' : 'Add Supplier'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* View Supplier Dialog */}
      {viewingSupplier && (
        <Dialog open={!!viewingSupplier} onOpenChange={() => setViewingSupplier(null)}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{viewingSupplier.name}</DialogTitle>
              <DialogDescription>
                Supplier details and information
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Contact Person</h3>
                  <p>{viewingSupplier.contactPerson || 'Not specified'}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Phone</h3>
                  <p>{viewingSupplier.phone}</p>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Email</h3>
                <p>{viewingSupplier.email || 'Not specified'}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Address</h3>
                <p>{viewingSupplier.address}</p>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">GST Number</h3>
                  <p>{viewingSupplier.gstNumber || 'Not specified'}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Category</h3>
                  <p>{viewingSupplier.category || 'Uncategorized'}</p>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Outstanding Balance</h3>
                <p className="text-lg font-semibold">
                  ₹{viewingSupplier.outstandingBalance?.toFixed(2) || '0.00'}
                </p>
              </div>

              {viewingSupplier.notes && (
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Notes</h3>
                  <p>{viewingSupplier.notes}</p>
                </div>
              )}
              
              <DialogFooter>
                <Button 
                  variant="outline" 
                  onClick={() => openEditDialog(viewingSupplier)}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
                <Button onClick={() => setViewingSupplier(null)}>
                  Close
                </Button>
              </DialogFooter>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default SupplierDirectory;
