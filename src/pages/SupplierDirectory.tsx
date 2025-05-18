
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Truck, Phone, Mail, MapPin, Plus, Search, Edit, Trash } from "lucide-react";
import { useData } from "@/contexts/data/DataContext";
import { toast } from "sonner";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogTrigger 
} from "@/components/ui/dialog";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Supplier } from "@/types";

interface SupplierFormData {
  id?: string;
  name: string;
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
  status: string;
  outstandingBalance: number;
}

const SupplierDirectory = () => {
  const { suppliers, addSupplier, updateSupplier, deleteSupplier } = useData();
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<string | null>(null);
  const [formData, setFormData] = useState<SupplierFormData>({
    name: '',
    contactPerson: '',
    phone: '',
    email: '',
    address: '',
    status: 'Active',
    outstandingBalance: 0
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'outstandingBalance' ? parseFloat(value) || 0 : value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingSupplier) {
        updateSupplier(editingSupplier, formData);
        toast.success("Supplier updated successfully");
      } else {
        addSupplier(formData);
        toast.success("Supplier added successfully");
      }
      
      handleCloseDialog();
    } catch (error) {
      toast.error("An error occurred while saving the supplier");
      console.error(error);
    }
  };

  const handleEdit = (supplier: Supplier) => {
    setFormData({
      name: supplier.name,
      contactPerson: supplier.contactPerson || supplier.contact || '',
      phone: supplier.phone,
      email: supplier.email || '',
      address: supplier.address,
      status: supplier.status || 'Active',
      outstandingBalance: supplier.outstandingBalance || 0
    });
    setEditingSupplier(supplier.id);
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this supplier?")) {
      try {
        deleteSupplier(id);
        toast.success("Supplier deleted successfully");
      } catch (error) {
        toast.error("Failed to delete supplier");
        console.error(error);
      }
    }
  };

  const handleCloseDialog = () => {
    setFormData({
      name: '',
      contactPerson: '',
      phone: '',
      email: '',
      address: '',
      status: 'Active',
      outstandingBalance: 0
    });
    setEditingSupplier(null);
    setIsDialogOpen(false);
  };

  const filteredSuppliers = searchQuery.trim() === '' 
    ? suppliers 
    : suppliers.filter(supplier => 
        supplier.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        supplier.phone.includes(searchQuery) ||
        (supplier.email && supplier.email.toLowerCase().includes(searchQuery.toLowerCase()))
      );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Supplier Directory</h1>
          <p className="text-muted-foreground">
            Manage your suppliers and their contact information
          </p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              setEditingSupplier(null);
              setFormData({
                name: '',
                contactPerson: '',
                phone: '',
                email: '',
                address: '',
                status: 'Active',
                outstandingBalance: 0
              });
            }}>
              <Plus className="mr-2 h-4 w-4" />
              Add Supplier
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[550px]">
            <DialogHeader>
              <DialogTitle>
                {editingSupplier ? 'Edit Supplier' : 'Add New Supplier'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Supplier Name</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contactPerson">Contact Person</Label>
                  <Input
                    id="contactPerson"
                    name="contactPerson"
                    value={formData.contactPerson}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
              
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Input
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="outstandingBalance">Outstanding Balance</Label>
                  <Input
                    id="outstandingBalance"
                    name="outstandingBalance"
                    type="number"
                    value={formData.outstandingBalance.toString()}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              
              <DialogFooter>
                <Button type="button" variant="outline" onClick={handleCloseDialog}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingSupplier ? 'Update Supplier' : 'Add Supplier'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>All Suppliers</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search suppliers..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredSuppliers.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-muted-foreground">No suppliers found</p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => setIsDialogOpen(true)}
              >
                Add your first supplier
              </Button>
            </div>
          ) : (
            <div className="rounded-md border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Supplier Name</TableHead>
                    <TableHead>Contact Person</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Balance</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSuppliers.map((supplier) => (
                    <TableRow key={supplier.id}>
                      <TableCell className="font-medium">{supplier.name}</TableCell>
                      <TableCell>{supplier.contactPerson || supplier.contact || '-'}</TableCell>
                      <TableCell>{supplier.phone}</TableCell>
                      <TableCell>{supplier.email || '-'}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          supplier.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {supplier.status || 'Active'}
                        </span>
                      </TableCell>
                      <TableCell>₹{supplier.outstandingBalance?.toFixed(2) || '0.00'}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="sm" onClick={() => handleEdit(supplier)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDelete(supplier.id)}>
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredSuppliers.slice(0, 3).map((supplier) => (
          <Card key={supplier.id} className="overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-indigo-800 to-purple-800 text-white">
              <CardTitle className="flex items-center justify-between">
                <span>{supplier.name}</span>
                <Truck className="h-5 w-5" />
              </CardTitle>
              <p className="text-sm text-gray-200">{supplier.status || 'Active'}</p>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="space-y-2">
                <p className="font-medium">Contact Person</p>
                <p className="text-sm text-muted-foreground">{supplier.contactPerson || supplier.contact || '-'}</p>
              </div>
              <div className="grid grid-cols-1 gap-2">
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{supplier.phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{supplier.email || '-'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{supplier.address}</span>
                </div>
              </div>
              <div className="flex justify-end space-x-2 pt-4">
                <Button size="sm" variant="outline" onClick={() => handleEdit(supplier)}>Edit</Button>
                <Button size="sm">Contact</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default SupplierDirectory;
