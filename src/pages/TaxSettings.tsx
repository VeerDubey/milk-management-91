
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Plus, Edit, Trash2, Calculator } from 'lucide-react';
import { toast } from 'sonner';

interface TaxSetting {
  id: string;
  name: string;
  rate: number;
  isActive: boolean;
  isDefault: boolean;
}

export default function TaxSettings() {
  const [taxSettings, setTaxSettings] = useState<TaxSetting[]>([
    { id: '1', name: 'GST 18%', rate: 18, isActive: true, isDefault: true },
    { id: '2', name: 'GST 12%', rate: 12, isActive: true, isDefault: false },
    { id: '3', name: 'GST 5%', rate: 5, isActive: true, isDefault: false },
    { id: '4', name: 'No Tax', rate: 0, isActive: true, isDefault: false },
  ]);
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTax, setEditingTax] = useState<TaxSetting | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    rate: 0,
    isActive: true,
    isDefault: false
  });

  const handleAddNew = () => {
    setEditingTax(null);
    setFormData({ name: '', rate: 0, isActive: true, isDefault: false });
    setDialogOpen(true);
  };

  const handleEdit = (tax: TaxSetting) => {
    setEditingTax(tax);
    setFormData({
      name: tax.name,
      rate: tax.rate,
      isActive: tax.isActive,
      isDefault: tax.isDefault
    });
    setDialogOpen(true);
  };

  const handleSubmit = () => {
    if (!formData.name.trim()) {
      toast.error('Tax name is required');
      return;
    }

    if (formData.rate < 0) {
      toast.error('Tax rate cannot be negative');
      return;
    }

    if (editingTax) {
      // Update existing
      setTaxSettings(prev => prev.map(tax => 
        tax.id === editingTax.id 
          ? { ...tax, ...formData }
          : formData.isDefault ? { ...tax, isDefault: false } : tax
      ));
      toast.success('Tax setting updated successfully');
    } else {
      // Add new
      const newTax: TaxSetting = {
        id: Date.now().toString(),
        ...formData
      };
      
      setTaxSettings(prev => {
        if (formData.isDefault) {
          // Make all others non-default
          return [...prev.map(tax => ({ ...tax, isDefault: false })), newTax];
        }
        return [...prev, newTax];
      });
      toast.success('Tax setting added successfully');
    }

    setDialogOpen(false);
  };

  const handleDelete = (id: string) => {
    const taxToDelete = taxSettings.find(t => t.id === id);
    
    if (taxToDelete?.isDefault) {
      toast.error('Cannot delete the default tax setting');
      return;
    }

    setTaxSettings(prev => prev.filter(tax => tax.id !== id));
    toast.success('Tax setting deleted successfully');
  };

  const handleToggleActive = (id: string) => {
    setTaxSettings(prev => prev.map(tax => 
      tax.id === id ? { ...tax, isActive: !tax.isActive } : tax
    ));
  };

  const handleSetDefault = (id: string) => {
    setTaxSettings(prev => prev.map(tax => 
      tax.id === id 
        ? { ...tax, isDefault: true }
        : { ...tax, isDefault: false }
    ));
    toast.success('Default tax setting updated');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tax Settings</h1>
          <p className="text-muted-foreground">Configure tax rates and settings</p>
        </div>
        <Button onClick={handleAddNew}>
          <Plus className="mr-2 h-4 w-4" />
          Add Tax Setting
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Tax Configuration
          </CardTitle>
          <CardDescription>
            Manage tax rates for your products and services
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tax Name</TableHead>
                <TableHead className="text-center">Rate (%)</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="text-center">Default</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {taxSettings.map((tax) => (
                <TableRow key={tax.id}>
                  <TableCell className="font-medium">{tax.name}</TableCell>
                  <TableCell className="text-center">{tax.rate}%</TableCell>
                  <TableCell className="text-center">
                    <Switch
                      checked={tax.isActive}
                      onCheckedChange={() => handleToggleActive(tax.id)}
                    />
                  </TableCell>
                  <TableCell className="text-center">
                    {tax.isDefault ? (
                      <span className="text-green-600 font-medium">Default</span>
                    ) : (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleSetDefault(tax.id)}
                      >
                        Set Default
                      </Button>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(tax)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(tax.id)}
                        disabled={tax.isDefault}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingTax ? 'Edit Tax Setting' : 'Add Tax Setting'}
            </DialogTitle>
            <DialogDescription>
              {editingTax ? 'Update the tax setting details' : 'Create a new tax setting'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="taxName">Tax Name</Label>
              <Input
                id="taxName"
                placeholder="e.g., GST 18%"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="taxRate">Tax Rate (%)</Label>
              <Input
                id="taxRate"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={formData.rate}
                onChange={(e) => setFormData(prev => ({ ...prev, rate: parseFloat(e.target.value) || 0 }))}
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
              />
              <Label htmlFor="isActive">Active</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="isDefault"
                checked={formData.isDefault}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isDefault: checked }))}
              />
              <Label htmlFor="isDefault">Set as Default</Label>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>
              {editingTax ? 'Update' : 'Add'} Tax Setting
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
