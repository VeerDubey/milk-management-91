import { useState } from "react";
import { useData } from "@/contexts/data/DataContext";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import { TaxSetting } from "@/types";

export default function TaxSettings() {
  const { uiSettings } = useData();

  const [taxes, setTaxes] = useState<TaxSetting[]>(() => {
    const saved = localStorage.getItem("taxSettings");
    return saved
      ? JSON.parse(saved)
      : [
          {
            id: "tax-gst",
            name: "GST",
            rate: 5,
            isActive: true,
            applicableOn: ["all"],
            isDefault: true,
            appliedTo: ["all"]
          },
          {
            id: "tax-cgst",
            name: "CGST",
            rate: 2.5,
            isActive: true,
            applicableOn: ["milk", "curd"],
            isDefault: false,
            appliedTo: ["invoices"]
          },
          {
            id: "tax-sgst",
            name: "SGST",
            rate: 2.5,
            isActive: true,
            applicableOn: ["milk", "curd"],
            isDefault: false,
            appliedTo: ["invoices"]
          }
        ];
  });

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTax, setEditingTax] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<{
    name: string;
    rate: number;
    isActive: boolean;
    applicableOn: string[];
    isDefault: boolean;
    appliedTo: string[];
  }>({
    name: "",
    rate: 0,
    isActive: true,
    applicableOn: ["all"],
    isDefault: false,
    appliedTo: ["all"]
  });

  const handleEdit = (tax: TaxSetting) => {
    setFormData({
      name: tax.name,
      rate: tax.rate,
      isActive: tax.isActive || false,
      applicableOn: tax.applicableOn || ["all"],
      isDefault: tax.isDefault,
      appliedTo: tax.appliedTo || ["all"]
    });
    setEditingTax(tax.id);
    setIsDialogOpen(true);
  };

  const handleAdd = () => {
    setFormData({
      name: "",
      rate: 0,
      isActive: true,
      applicableOn: ["all"],
      isDefault: false,
      appliedTo: ["all"]
    });
    setEditingTax(null);
    setIsDialogOpen(true);
  };

  const handleSubmit = () => {
    if (!formData.name.trim()) {
      toast.error("Please enter a name for the tax");
      return;
    }

    if (formData.rate <= 0) {
      toast.error("Please enter a valid tax rate");
      return;
    }

    const newTax = {
      id: editingTax || `tax-${Date.now()}`,
      name: formData.name,
      rate: formData.rate,
      isActive: formData.isActive,
      applicableOn: formData.applicableOn,
      isDefault: formData.isDefault,
      appliedTo: formData.appliedTo
    };

    // If setting a new default, remove default from others
    if (newTax.isDefault) {
      setTaxes(prevTaxes => 
        prevTaxes.map(tax => 
          tax.id !== newTax.id ? { ...tax, isDefault: false } : tax
        )
      );
    }

    if (editingTax) {
      setTaxes(prevTaxes =>
        prevTaxes.map(tax => (tax.id === editingTax ? newTax : tax))
      );
      toast.success("Tax updated successfully");
    } else {
      setTaxes(prevTaxes => [...prevTaxes, newTax]);
      toast.success("Tax added successfully");
    }

    // Save to localStorage
    localStorage.setItem("taxSettings", JSON.stringify(
      editingTax 
        ? taxes.map(tax => (tax.id === editingTax ? newTax : tax)) 
        : [...taxes, newTax]
    ));

    setIsDialogOpen(false);
  };

  const handleDelete = (id: string) => {
    const tax = taxes.find(t => t.id === id);
    
    if (tax?.isDefault) {
      toast.error("Cannot delete the default tax. Please set another tax as default first.");
      return;
    }
    
    setTaxes(taxes.filter(tax => tax.id !== id));
    localStorage.setItem("taxSettings", JSON.stringify(taxes.filter(tax => tax.id !== id)));
    toast.success("Tax deleted successfully");
  };

  const handleToggleActive = (id: string) => {
    setTaxes(prevTaxes =>
      prevTaxes.map(tax => {
        if (tax.id === id) {
          // Don't allow deactivating the default tax
          if (tax.isDefault && tax.isActive) {
            toast.error("Cannot deactivate the default tax. Please set another tax as default first.");
            return tax;
          }
          return { ...tax, isActive: !tax.isActive };
        }
        return tax;
      })
    );

    // Save to localStorage after updating
    localStorage.setItem(
      "taxSettings",
      JSON.stringify(
        taxes.map(tax => {
          if (tax.id === id) {
            if (tax.isDefault && tax.isActive) return tax;
            return { ...tax, isActive: !tax.isActive };
          }
          return tax;
        })
      )
    );
  };

  const handleMakeDefault = (id: string) => {
    setTaxes(prevTaxes =>
      prevTaxes.map(tax => ({
        ...tax,
        isDefault: tax.id === id
      }))
    );

    // Save to localStorage after updating
    localStorage.setItem(
      "taxSettings",
      JSON.stringify(
        taxes.map(tax => ({
          ...tax,
          isDefault: tax.id === id
        }))
      )
    );

    toast.success(`${taxes.find(t => t.id === id)?.name} set as default tax`);
  };

  return (
    <div className="container space-y-6 py-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tax Settings</h1>
          <p className="text-muted-foreground">
            Manage tax configurations for your business
          </p>
        </div>
        <Button onClick={handleAdd}>Add New Tax</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Tax Rates</CardTitle>
          <CardDescription>Configure tax rates for different product categories</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">Status</TableHead>
                <TableHead>Name</TableHead>
                <TableHead className="text-right">Rate</TableHead>
                <TableHead>Default</TableHead>
                <TableHead>Applicable On</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {taxes.map((tax) => (
                <TableRow key={tax.id}>
                  <TableCell>
                    <Switch
                      checked={tax.isActive}
                      onCheckedChange={() => handleToggleActive(tax.id)}
                      aria-label="Toggle tax status"
                    />
                  </TableCell>
                  <TableCell className="font-medium">{tax.name}</TableCell>
                  <TableCell className="text-right">{tax.rate}%</TableCell>
                  <TableCell>
                    {tax.isDefault ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-800/30 dark:text-green-500">
                        Default
                      </span>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleMakeDefault(tax.id)}
                      >
                        Set Default
                      </Button>
                    )}
                  </TableCell>
                  <TableCell>
                    {tax.applicableOn && tax.applicableOn.includes("all") 
                      ? "All Products" 
                      : tax.applicableOn && tax.applicableOn.join(", ")}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(tax)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(tax.id)}
                        disabled={tax.isDefault}
                      >
                        Delete
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingTax ? "Edit Tax" : "Add New Tax"}</DialogTitle>
            <DialogDescription>
              {editingTax
                ? "Update the tax configuration"
                : "Add a new tax to your system"}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Tax Name</Label>
              <Input
                id="name"
                placeholder="GST"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="rate">Tax Rate (%)</Label>
              <Input
                id="rate"
                type="number"
                placeholder="5"
                value={formData.rate}
                onChange={(e) =>
                  setFormData({ ...formData, rate: parseFloat(e.target.value) || 0 })
                }
              />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) =>
                  setFormData({
                    ...formData,
                    isActive: checked === true,
                  })
                }
              />
              <label
                htmlFor="isActive"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Active
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="isDefault"
                checked={formData.isDefault}
                onCheckedChange={(checked) =>
                  setFormData({
                    ...formData,
                    isDefault: checked === true,
                  })
                }
              />
              <label
                htmlFor="isDefault"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Set as Default Tax
              </label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>
              {editingTax ? "Update" : "Add"} Tax
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
