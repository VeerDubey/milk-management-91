
import React, { useState } from 'react';
import { useData } from '@/contexts/data/DataContext';
import { 
  Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter 
} from '@/components/ui/card';
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Search, Plus, Pencil, Trash2, Mail, Phone, ExternalLink,
  FileText, ArrowUpDown 
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { ElectronService } from '@/services/ElectronService';
import { useToast } from '@/components/ui/use-toast';
import { useMessaging } from '@/contexts/MessagingContext';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

export default function SupplierDirectory() {
  const { toast } = useToast();
  const { sendMessage } = useMessaging();
  const { suppliers, addSupplier, updateSupplier, deleteSupplier } = useData();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [sortColumn, setSortColumn] = useState<string>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [selectedSupplier, setSelectedSupplier] = useState<any | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({
    id: '',
    name: '',
    phone: '',
    email: '',
    address: '',
    contactPerson: '',
    gstin: '',
    paymentTerms: '',
    notes: '',
    outstandingBalance: 0
  });

  // Filter suppliers based on search term
  const filteredSuppliers = suppliers.filter(supplier => {
    if (!searchTerm) return true;
    
    const search = searchTerm.toLowerCase();
    return (
      supplier.name?.toLowerCase().includes(search) ||
      supplier.contactPerson?.toLowerCase().includes(search) ||
      supplier.phone?.toLowerCase().includes(search) ||
      supplier.email?.toLowerCase().includes(search) ||
      supplier.address?.toLowerCase().includes(search)
    );
  });

  // Sort suppliers
  const sortedSuppliers = [...filteredSuppliers].sort((a, b) => {
    let valueA, valueB;
    
    switch (sortColumn) {
      case 'name':
        valueA = a.name?.toLowerCase() || '';
        valueB = b.name?.toLowerCase() || '';
        break;
      case 'contactPerson':
        valueA = a.contactPerson?.toLowerCase() || '';
        valueB = b.contactPerson?.toLowerCase() || '';
        break;
      case 'outstandingBalance':
        valueA = a.outstandingBalance || 0;
        valueB = b.outstandingBalance || 0;
        break;
      default:
        valueA = a.name?.toLowerCase() || '';
        valueB = b.name?.toLowerCase() || '';
    }
    
    if (sortDirection === 'asc') {
      return valueA > valueB ? 1 : -1;
    } else {
      return valueA < valueB ? 1 : -1;
    }
  });

  // Function to handle sorting
  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  // Function to handle delete
  const handleDelete = () => {
    if (selectedSupplier) {
      deleteSupplier(selectedSupplier.id);
      toast({
        title: "Supplier Deleted",
        description: `${selectedSupplier.name} has been removed from your suppliers.`
      });
      setIsDeleteDialogOpen(false);
      setSelectedSupplier(null);
    }
  };

  // Functions for edit dialog
  const openEditDialog = (supplier: any) => {
    setEditFormData({
      id: supplier.id,
      name: supplier.name || '',
      phone: supplier.phone || '',
      email: supplier.email || '',
      address: supplier.address || '',
      contactPerson: supplier.contactPerson || '',
      gstin: supplier.gstin || '',
      paymentTerms: supplier.paymentTerms || '',
      notes: supplier.notes || '',
      outstandingBalance: supplier.outstandingBalance || 0
    });
    setIsEditDialogOpen(true);
  };

  const handleEditFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditFormData({
      ...editFormData,
      [name]: name === 'outstandingBalance' ? parseFloat(value) || 0 : value
    });
  };

  const handleEditSubmit = () => {
    if (editFormData.id) {
      // Update existing supplier
      const updateData = {
        name: editFormData.name,
        phone: editFormData.phone,
        email: editFormData.email,
        address: editFormData.address,
        contactPerson: editFormData.contactPerson,
        contactName: editFormData.contactPerson,
        gstin: editFormData.gstin,
        paymentTerms: editFormData.paymentTerms,
        notes: editFormData.notes,
        outstandingBalance: editFormData.outstandingBalance,
        isActive: true,
        products: []
      };
      updateSupplier(editFormData.id, updateData);
      toast({
        title: "Supplier Updated",
        description: `${editFormData.name} information has been updated.`
      });
    } else {
      // Add new supplier
      const supplierData = {
        name: editFormData.name,
        phone: editFormData.phone,
        email: editFormData.email,
        address: editFormData.address,
        contactPerson: editFormData.contactPerson,
        contactName: editFormData.contactPerson,
        gstin: editFormData.gstin,
        paymentTerms: editFormData.paymentTerms,
        notes: editFormData.notes,
        outstandingBalance: editFormData.outstandingBalance,
        isActive: true,
        products: []
      };
      addSupplier(supplierData);
      toast({
        title: "Supplier Added",
        description: `${editFormData.name} has been added to your suppliers.`
      });
    }
    setIsEditDialogOpen(false);
  };

  // Function to create a new supplier
  const handleAddNew = () => {
    setEditFormData({
      id: '',
      name: '',
      phone: '',
      email: '',
      address: '',
      contactPerson: '',
      gstin: '',
      paymentTerms: '',
      notes: '',
      outstandingBalance: 0
    });
    setIsEditDialogOpen(true);
  };

  // Function to send message to supplier
  const handleSendMessage = async (supplier: any, messageType: 'email' | 'sms' | 'whatsapp') => {
    if (!supplier) return;
    
    // Check if supplier has required contact information
    if ((messageType === 'email' && !supplier.email) || 
        ((messageType === 'sms' || messageType === 'whatsapp') && !supplier.phone)) {
      toast({
        title: "Cannot Send Message",
        description: `Missing ${messageType === 'email' ? 'email address' : 'phone number'} for ${supplier.name}`,
        variant: "destructive"
      });
      return;
    }
    
    // Create message content
    const content = `Hello ${supplier.contactPerson || supplier.name},\n\nThis is a message from Vikas Milk Centre regarding your account. Your current outstanding balance is ₹${(supplier.outstandingBalance || 0).toFixed(2)}.\n\nPlease contact us if you have any questions.\n\nRegards,\nVikas Milk Centre`;
    
    try {
      const success = await sendMessage(
        { 
          name: supplier.contactPerson || supplier.name, 
          phone: supplier.phone, 
          email: supplier.email 
        },
        content,
        [messageType]
      );
      
      if (success) {
        toast({
          title: "Message Sent",
          description: `${messageType.charAt(0).toUpperCase() + messageType.slice(1)} sent to ${supplier.name}`
        });
      } else {
        toast({
          title: "Message Failed",
          description: `Failed to send ${messageType} to ${supplier.name}`,
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: "Message Failed",
        description: "An error occurred while sending the message",
        variant: "destructive"
      });
    }
  };

  // Function to handle opening URL
  const handleOpenWebsite = async (website: string) => {
    if (!website) return;
    
    // Ensure website has http/https prefix
    let url = website;
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }
    
    try {
      await ElectronService.system.openExternal(url);
    } catch (error) {
      console.error("Error opening website:", error);
      toast({
        title: "Error",
        description: "Could not open website",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold tracking-tight mb-6">Supplier Directory</h1>
      
      <div className="flex flex-col space-y-6">
        {/* Search and add */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search suppliers..."
              className="w-full pl-8" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button onClick={handleAddNew}>
            <Plus className="mr-2 h-4 w-4" />
            Add New Supplier
          </Button>
        </div>

        {/* Suppliers table */}
        <Card>
          <CardHeader>
            <CardTitle>Suppliers</CardTitle>
            <CardDescription>Manage your suppliers and vendor information</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead 
                      className="cursor-pointer"
                      onClick={() => handleSort('name')}
                    >
                      Company Name
                      {sortColumn === 'name' && (
                        <ArrowUpDown className="ml-2 h-4 w-4 inline" />
                      )}
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer"
                      onClick={() => handleSort('contactPerson')}
                    >
                      Contact Person
                      {sortColumn === 'contactPerson' && (
                        <ArrowUpDown className="ml-2 h-4 w-4 inline" />
                      )}
                    </TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead 
                      className="cursor-pointer text-right"
                      onClick={() => handleSort('outstandingBalance')}
                    >
                      Outstanding
                      {sortColumn === 'outstandingBalance' && (
                        <ArrowUpDown className="ml-2 h-4 w-4 inline" />
                      )}
                    </TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedSuppliers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8">
                        No suppliers found. Add a new supplier to get started.
                      </TableCell>
                    </TableRow>
                  ) : (
                    sortedSuppliers.map((supplier) => (
                      <TableRow key={supplier.id}>
                        <TableCell>
                          <div className="font-medium">{supplier.name}</div>
                          {supplier.gstin && (
                            <div className="text-sm text-muted-foreground">
                              GSTIN: {supplier.gstin}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          {supplier.contactPerson || '-'}
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            {supplier.phone && (
                              <div className="text-sm flex items-center">
                                <Phone className="mr-2 h-3 w-3" />
                                {supplier.phone}
                              </div>
                            )}
                            {supplier.email && (
                              <div className="text-sm flex items-center">
                                <Mail className="mr-2 h-3 w-3" />
                                {supplier.email}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <span className={supplier.outstandingBalance > 0 ? 'text-red-500' : ''}>
                            ₹{(supplier.outstandingBalance || 0).toFixed(2)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              size="icon"
                              title="Edit Supplier"
                              onClick={() => openEditDialog(supplier)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="icon"
                              title="Delete Supplier"
                              onClick={() => {
                                setSelectedSupplier(supplier);
                                setIsDeleteDialogOpen(true);
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="icon"
                              title="Send Email"
                              disabled={!supplier.email}
                              onClick={() => handleSendMessage(supplier, 'email')}
                            >
                              <Mail className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <div>
              <span className="text-sm text-muted-foreground">
                {sortedSuppliers.length} suppliers
              </span>
            </div>
          </CardFooter>
        </Card>
      </div>

      {/* Delete confirmation dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete {selectedSupplier?.name} from your suppliers.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-500 hover:bg-red-600">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit/Create supplier dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>{editFormData.id ? 'Edit Supplier' : 'Add New Supplier'}</DialogTitle>
            <DialogDescription>
              {editFormData.id ? 'Update the supplier information below.' : 'Enter the supplier details below.'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label htmlFor="name">Company Name</Label>
                <Input
                  id="name"
                  name="name"
                  value={editFormData.name}
                  onChange={handleEditFormChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="contactPerson">Contact Person</Label>
                <Input
                  id="contactPerson"
                  name="contactPerson"
                  value={editFormData.contactPerson}
                  onChange={handleEditFormChange}
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  name="phone"
                  value={editFormData.phone}
                  onChange={handleEditFormChange}
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={editFormData.email}
                  onChange={handleEditFormChange}
                />
              </div>
              <div>
                <Label htmlFor="gstin">GSTIN</Label>
                <Input
                  id="gstin"
                  name="gstin"
                  value={editFormData.gstin}
                  onChange={handleEditFormChange}
                />
              </div>
              <div className="col-span-2">
                <Label htmlFor="address">Address</Label>
                <Textarea
                  id="address"
                  name="address"
                  value={editFormData.address}
                  onChange={handleEditFormChange}
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="paymentTerms">Payment Terms</Label>
                <Input
                  id="paymentTerms"
                  name="paymentTerms"
                  value={editFormData.paymentTerms}
                  onChange={handleEditFormChange}
                />
              </div>
              <div>
                <Label htmlFor="outstandingBalance">Outstanding Balance (₹)</Label>
                <Input
                  id="outstandingBalance"
                  name="outstandingBalance"
                  type="number"
                  value={editFormData.outstandingBalance}
                  onChange={handleEditFormChange}
                />
              </div>
              <div className="col-span-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  name="notes"
                  value={editFormData.notes}
                  onChange={handleEditFormChange}
                  rows={3}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
            <Button type="submit" onClick={handleEditSubmit}>
              {editFormData.id ? 'Update Supplier' : 'Add Supplier'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
