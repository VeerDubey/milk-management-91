
import React, { useState } from "react";
import { useData } from "@/contexts/data/DataContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Search, 
  Plus, 
  Phone, 
  Mail, 
  Edit, 
  Trash,
  FileText,
  Store
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

const SupplierDirectory = () => {
  const { suppliers, addSupplier, updateSupplier, deleteSupplier } = useData();
  const [searchTerm, setSearchTerm] = useState("");
  const [newSupplier, setNewSupplier] = useState({
    name: "",
    contactPerson: "",
    phone: "",
    email: "",
    address: "",
    notes: "",
    isActive: true
  });
  const [editingSupplier, setEditingSupplier] = useState<any>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [supplierToDelete, setSupplierToDelete] = useState<any>(null);

  const filteredSuppliers = suppliers?.filter(supplier => 
    supplier.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    supplier.contactPerson?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    supplier.phone?.includes(searchTerm) ||
    supplier.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    supplier.address?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const handleCreateSupplier = () => {
    if (!newSupplier.name) {
      toast.error("Supplier name is required");
      return;
    }

    addSupplier({
      ...newSupplier,
      id: `sup-${Date.now()}`
    });
    
    setNewSupplier({
      name: "",
      contactPerson: "",
      phone: "",
      email: "",
      address: "",
      notes: "",
      isActive: true
    });
    
    setIsAddDialogOpen(false);
    toast.success("Supplier created successfully");
  };

  const handleUpdateSupplier = () => {
    if (!editingSupplier?.name) {
      toast.error("Supplier name is required");
      return;
    }

    updateSupplier(editingSupplier.id, editingSupplier);
    setIsEditDialogOpen(false);
    toast.success("Supplier updated successfully");
  };

  const handleDeleteSupplier = () => {
    if (supplierToDelete) {
      deleteSupplier(supplierToDelete.id);
      setIsDeleteDialogOpen(false);
      toast.success("Supplier deleted successfully");
    }
  };

  const startEdit = (supplier: any) => {
    setEditingSupplier({...supplier});
    setIsEditDialogOpen(true);
  };

  const confirmDelete = (supplier: any) => {
    setSupplierToDelete(supplier);
    setIsDeleteDialogOpen(true);
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Supplier Directory</h1>
          <p className="text-muted-foreground">Manage your suppliers and their contact information</p>
        </div>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search suppliers..."
              className="pl-8 min-w-[250px]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Supplier
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[525px]">
              <DialogHeader>
                <DialogTitle>Add New Supplier</DialogTitle>
                <DialogDescription>
                  Enter the details of the new supplier. Click save when you're done.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Supplier Name *</Label>
                    <Input
                      id="name"
                      value={newSupplier.name}
                      onChange={(e) => setNewSupplier({...newSupplier, name: e.target.value})}
                      placeholder="Enter supplier name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contactPerson">Contact Person</Label>
                    <Input
                      id="contactPerson"
                      value={newSupplier.contactPerson}
                      onChange={(e) => setNewSupplier({...newSupplier, contactPerson: e.target.value})}
                      placeholder="Primary contact name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      value={newSupplier.phone}
                      onChange={(e) => setNewSupplier({...newSupplier, phone: e.target.value})}
                      placeholder="Phone number"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={newSupplier.email}
                      onChange={(e) => setNewSupplier({...newSupplier, email: e.target.value})}
                      placeholder="Email address"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Textarea
                    id="address"
                    value={newSupplier.address}
                    onChange={(e) => setNewSupplier({...newSupplier, address: e.target.value})}
                    placeholder="Full address"
                    rows={2}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={newSupplier.notes}
                    onChange={(e) => setNewSupplier({...newSupplier, notes: e.target.value})}
                    placeholder="Additional notes"
                    rows={3}
                  />
                </div>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Cancel</Button>
                </DialogClose>
                <Button onClick={handleCreateSupplier}>Save Supplier</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-xl flex items-center">
            <Store className="mr-2 h-5 w-5" />
            Suppliers
          </CardTitle>
          <CardDescription>
            You have {filteredSuppliers.length} supplier{filteredSuppliers.length !== 1 ? 's' : ''} in your directory
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredSuppliers.length === 0 ? (
            <div className="text-center py-10">
              <Store className="mx-auto h-12 w-12 text-muted-foreground opacity-30" />
              <h3 className="mt-4 text-lg font-semibold">No suppliers found</h3>
              <p className="text-muted-foreground mt-2">
                {searchTerm ? "Try adjusting your search" : "Add your first supplier to get started"}
              </p>
              {searchTerm && (
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => setSearchTerm("")}
                >
                  Clear search
                </Button>
              )}
            </div>
          ) : (
            <div className="rounded-md border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Supplier Name</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Address</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSuppliers.map((supplier) => (
                    <TableRow key={supplier.id}>
                      <TableCell className="font-medium">
                        <div className="font-medium">{supplier.name}</div>
                        {supplier.contactPerson && (
                          <div className="text-sm text-muted-foreground">{supplier.contactPerson}</div>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          {supplier.phone && (
                            <div className="flex items-center text-sm">
                              <Phone className="mr-2 h-3 w-3 text-muted-foreground" />
                              {supplier.phone}
                            </div>
                          )}
                          {supplier.email && (
                            <div className="flex items-center text-sm">
                              <Mail className="mr-2 h-3 w-3 text-muted-foreground" />
                              {supplier.email}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-xs truncate">{supplier.address}</div>
                      </TableCell>
                      <TableCell>
                        {supplier.isActive !== false ? (
                          <Badge variant="outline" className="bg-green-50 text-green-700 hover:bg-green-50 border-green-200">Active</Badge>
                        ) : (
                          <Badge variant="outline" className="bg-gray-50 text-gray-700 hover:bg-gray-50 border-gray-200">Inactive</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" onClick={() => startEdit(supplier)}>
                            <Edit className="h-4 w-4" />
                            <span className="sr-only">Edit</span>
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => confirmDelete(supplier)}>
                            <Trash className="h-4 w-4" />
                            <span className="sr-only">Delete</span>
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

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>Edit Supplier</DialogTitle>
            <DialogDescription>
              Update the supplier details. Click save when you're done.
            </DialogDescription>
          </DialogHeader>
          {editingSupplier && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-name">Supplier Name *</Label>
                  <Input
                    id="edit-name"
                    value={editingSupplier.name}
                    onChange={(e) => setEditingSupplier({...editingSupplier, name: e.target.value})}
                    placeholder="Enter supplier name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-contactPerson">Contact Person</Label>
                  <Input
                    id="edit-contactPerson"
                    value={editingSupplier.contactPerson || ''}
                    onChange={(e) => setEditingSupplier({...editingSupplier, contactPerson: e.target.value})}
                    placeholder="Primary contact name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-phone">Phone Number</Label>
                  <Input
                    id="edit-phone"
                    value={editingSupplier.phone || ''}
                    onChange={(e) => setEditingSupplier({...editingSupplier, phone: e.target.value})}
                    placeholder="Phone number"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-email">Email Address</Label>
                  <Input
                    id="edit-email"
                    type="email"
                    value={editingSupplier.email || ''}
                    onChange={(e) => setEditingSupplier({...editingSupplier, email: e.target.value})}
                    placeholder="Email address"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-address">Address</Label>
                <Textarea
                  id="edit-address"
                  value={editingSupplier.address || ''}
                  onChange={(e) => setEditingSupplier({...editingSupplier, address: e.target.value})}
                  placeholder="Full address"
                  rows={2}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-notes">Notes</Label>
                <Textarea
                  id="edit-notes"
                  value={editingSupplier.notes || ''}
                  onChange={(e) => setEditingSupplier({...editingSupplier, notes: e.target.value})}
                  placeholder="Additional notes"
                  rows={3}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={handleUpdateSupplier}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Supplier</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {supplierToDelete?.name}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button variant="destructive" onClick={handleDeleteSupplier}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SupplierDirectory;
