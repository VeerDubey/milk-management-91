
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useData } from "@/contexts/DataContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  Edit, Eye, Truck, Plus, Search, Trash, ArrowUpDown, Phone, Mail
} from "lucide-react";
import { toast } from "sonner";

export default function SupplierList() {
  const navigate = useNavigate();
  const { suppliers, addSupplier, updateSupplier, deleteSupplier } = useData();
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<string | null>("name");
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [isNewSupplierDialogOpen, setIsNewSupplierDialogOpen] = useState(false);
  const [newSupplier, setNewSupplier] = useState({
    name: "",
    contactPerson: "",
    phone: "",
    email: "",
    address: "",
    gstNumber: "",
    notes: "",
    category: "",
  });

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortDirection('asc');
    }
  };

  // Filter suppliers based on search term
  const filteredSuppliers = suppliers.filter(
    (supplier) =>
      supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier.contactPerson?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier.phone?.includes(searchTerm) ||
      supplier.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Sort the filtered suppliers
  const sortedSuppliers = [...filteredSuppliers].sort((a, b) => {
    if (!sortBy) return 0;
    
    const fieldA = a[sortBy as keyof typeof a];
    const fieldB = b[sortBy as keyof typeof b];
    
    if (typeof fieldA === 'string' && typeof fieldB === 'string') {
      return sortDirection === 'asc' 
        ? fieldA.localeCompare(fieldB)
        : fieldB.localeCompare(fieldA);
    } else if (typeof fieldA === 'number' && typeof fieldB === 'number') {
      return sortDirection === 'asc'
        ? fieldA - fieldB
        : fieldB - fieldA;
    }
    return 0;
  });

  const resetNewSupplierForm = () => {
    setNewSupplier({
      name: "",
      contactPerson: "",
      phone: "",
      email: "",
      address: "",
      gstNumber: "",
      notes: "",
      category: "",
    });
  };

  const handleNewSupplierSubmit = () => {
    if (!newSupplier.name || !newSupplier.phone || !newSupplier.address) {
      toast.error("Name, phone, and address are required");
      return;
    }

    try {
      addSupplier({
        name: newSupplier.name,
        contactPerson: newSupplier.contactPerson,
        phone: newSupplier.phone,
        email: newSupplier.email,
        address: newSupplier.address,
        gstNumber: newSupplier.gstNumber,
        notes: newSupplier.notes,
        category: newSupplier.category || "General",
        outstandingBalance: 0,
      });

      toast.success("Supplier added successfully!");
      resetNewSupplierForm();
      setIsNewSupplierDialogOpen(false);
    } catch (error) {
      toast.error("Failed to add supplier");
      console.error(error);
    }
  };

  const handleViewSupplier = (supplierId: string) => {
    navigate(`/supplier/${supplierId}`);
  };

  const handleDeleteSupplier = (supplierId: string) => {
    if (window.confirm("Are you sure you want to delete this supplier?")) {
      deleteSupplier(supplierId);
      toast.success("Supplier deleted successfully!");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Suppliers</h1>
          <p className="text-muted-foreground">
            Manage your suppliers and vendors
          </p>
        </div>
        <Button onClick={() => setIsNewSupplierDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Supplier
        </Button>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center">
          <div className="space-y-1">
            <CardTitle>Supplier Directory</CardTitle>
            <CardDescription>
              View and manage your suppliers
            </CardDescription>
          </div>
          <div className="ml-auto w-64 relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search suppliers..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
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
                    <div className="flex items-center">
                      Supplier Name
                      {sortBy === 'name' && (
                        <ArrowUpDown className={`ml-2 h-4 w-4 ${sortDirection === 'desc' ? 'rotate-180' : ''} transition-transform`} />
                      )}
                    </div>
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer"
                    onClick={() => handleSort('category')}
                  >
                    <div className="flex items-center">
                      Category
                      {sortBy === 'category' && (
                        <ArrowUpDown className={`ml-2 h-4 w-4 ${sortDirection === 'desc' ? 'rotate-180' : ''} transition-transform`} />
                      )}
                    </div>
                  </TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead 
                    className="cursor-pointer text-right"
                    onClick={() => handleSort('outstandingBalance')}
                  >
                    <div className="flex items-center justify-end">
                      Outstanding Balance
                      {sortBy === 'outstandingBalance' && (
                        <ArrowUpDown className={`ml-2 h-4 w-4 ${sortDirection === 'desc' ? 'rotate-180' : ''} transition-transform`} />
                      )}
                    </div>
                  </TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedSuppliers.length > 0 ? (
                  sortedSuppliers.map((supplier) => (
                    <TableRow key={supplier.id}>
                      <TableCell>
                        <div className="flex items-center">
                          <Truck className="mr-2 h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{supplier.name}</span>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {supplier.contactPerson && `Contact: ${supplier.contactPerson}`}
                        </div>
                      </TableCell>
                      <TableCell>{supplier.category || "General"}</TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <div className="flex items-center">
                            <Phone className="mr-1 h-3 w-3 text-muted-foreground" />
                            <span className="text-sm">{supplier.phone}</span>
                          </div>
                          {supplier.email && (
                            <div className="flex items-center mt-1">
                              <Mail className="mr-1 h-3 w-3 text-muted-foreground" />
                              <span className="text-sm">{supplier.email}</span>
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="font-medium">
                          ₹{(supplier.outstandingBalance || 0).toFixed(2)}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleViewSupplier(supplier.id)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => navigate(`/supplier-edit/${supplier.id}`)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleDeleteSupplier(supplier.id)}
                          >
                            <Trash className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-4">
                      No suppliers found. Add some suppliers to get started.
                    </TableCell>
                  </TableRow>
                )}
                
                {filteredSuppliers.length === 0 && suppliers.length > 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-4">
                      No suppliers match your search criteria.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* New Supplier Dialog */}
      <Dialog open={isNewSupplierDialogOpen} onOpenChange={setIsNewSupplierDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New Supplier</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Supplier Name*</Label>
                <Input
                  id="name"
                  value={newSupplier.name}
                  onChange={(e) => 
                    setNewSupplier({ ...newSupplier, name: e.target.value })
                  }
                  placeholder="Enter supplier name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contactPerson">Contact Person</Label>
                <Input
                  id="contactPerson"
                  value={newSupplier.contactPerson}
                  onChange={(e) =>
                    setNewSupplier({ ...newSupplier, contactPerson: e.target.value })
                  }
                  placeholder="Primary contact person"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number*</Label>
                <Input
                  id="phone"
                  value={newSupplier.phone}
                  onChange={(e) =>
                    setNewSupplier({ ...newSupplier, phone: e.target.value })
                  }
                  placeholder="Contact number"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={newSupplier.email}
                  onChange={(e) =>
                    setNewSupplier({ ...newSupplier, email: e.target.value })
                  }
                  placeholder="Email address"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Input
                  id="category"
                  value={newSupplier.category}
                  onChange={(e) =>
                    setNewSupplier({ ...newSupplier, category: e.target.value })
                  }
                  placeholder="e.g., Dairy, Vegetables, etc."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gstNumber">GST Number</Label>
                <Input
                  id="gstNumber"
                  value={newSupplier.gstNumber}
                  onChange={(e) =>
                    setNewSupplier({ ...newSupplier, gstNumber: e.target.value })
                  }
                  placeholder="GST registration number"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Address*</Label>
              <Textarea
                id="address"
                value={newSupplier.address}
                onChange={(e) =>
                  setNewSupplier({ ...newSupplier, address: e.target.value })
                }
                placeholder="Full address"
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={newSupplier.notes}
                onChange={(e) =>
                  setNewSupplier({ ...newSupplier, notes: e.target.value })
                }
                placeholder="Additional notes about this supplier"
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                resetNewSupplierForm();
                setIsNewSupplierDialogOpen(false);
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleNewSupplierSubmit}>Add Supplier</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
