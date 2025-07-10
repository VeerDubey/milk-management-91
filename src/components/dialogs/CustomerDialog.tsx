import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useData } from '@/contexts/data/DataContext';
import { toast } from 'sonner';
import { Plus, Edit } from 'lucide-react';

interface CustomerDialogProps {
  customer?: any;
  children?: React.ReactNode;
}

export function CustomerDialog({ customer, children }: CustomerDialogProps) {
  const { addCustomer, updateCustomer } = useData();
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: customer?.name || '',
    phone: customer?.phone || '',
    email: customer?.email || '',
    address: customer?.address || '',
    notes: customer?.notes || ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error('Customer name is required');
      return;
    }

    try {
      if (customer) {
        updateCustomer(customer.id, formData);
        toast.success('Customer updated successfully');
      } else {
        const customerData = {
          name: formData.name,
          phone: formData.phone,
          email: formData.email,
          address: formData.address,
          notes: formData.notes,
          isActive: true,
          outstandingBalance: 0,
          balance: 0,
          createdAt: new Date().toISOString()
        };
        addCustomer(customerData);
        toast.success('Customer added successfully');
      }
      setOpen(false);
      setFormData({ name: '', phone: '', email: '', address: '', notes: '' });
    } catch (error) {
      toast.error('Failed to save customer');
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button>
            {customer ? <Edit className="mr-2 h-4 w-4" /> : <Plus className="mr-2 h-4 w-4" />}
            {customer ? 'Edit Customer' : 'Add Customer'}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{customer ? 'Edit Customer' : 'Add New Customer'}</DialogTitle>
          <DialogDescription>
            {customer ? 'Update customer information below.' : 'Enter customer details to add them to your system.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Customer name"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
              placeholder="Phone number"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              placeholder="Email address"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Textarea
              id="address"
              value={formData.address}
              onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
              placeholder="Customer address"
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Additional notes"
              rows={2}
            />
          </div>
          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">
              {customer ? 'Update Customer' : 'Add Customer'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
