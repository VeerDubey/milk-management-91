
import { useState } from "react";
import { useData } from "@/contexts/data/DataContext";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DollarSign,
  PlusCircle,
  Trash,
  Edit,
  AlertCircle,
  CheckCircle2
} from "lucide-react";
import { toast } from "sonner";
import { TaxSetting } from "@/types";

const TaxSettings = () => {
  // This would come from the DataContext in a real implementation
  const [taxSettings, setTaxSettings] = useState<TaxSetting[]>([
    {
      id: "1",
      name: "CGST",
      rate: 9,
      isActive: true,
      applicableOn: ["all"],
      isDefault: true,
      appliedTo: ["all"]
    },
    {
      id: "2",
      name: "SGST",
      rate: 9,
      isActive: true,
      applicableOn: ["all"],
      isDefault: false,
      appliedTo: ["all"]
    },
    {
      id: "3",
      name: "IGST",
      rate: 18,
      isActive: false,
      applicableOn: ["all"],
      isDefault: false,
      appliedTo: ["all"]
    }
  ]);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingTax, setEditingTax] = useState<string | null>(null);
  const [deletingTax, setDeletingTax] = useState<string | null>(null);
  const [formData, setFormData] = useState({
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
      appliedTo: tax.appliedTo
    });
    setEditingTax(tax.id);
    setIsDialogOpen(true);
  };

  const handleDelete = (taxId: string) => {
    setDeletingTax(taxId);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (deletingTax) {
      // Filter out the tax to be deleted
      setTaxSettings(taxSettings.filter(tax => tax.id !== deletingTax));
      toast.success("Tax setting deleted successfully");
      setIsDeleteDialogOpen(false);
      setDeletingTax(null);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error("Tax name cannot be empty");
      return;
    }

    if (isNaN(formData.rate) || formData.rate < 0) {
      toast.error("Tax rate must be a positive number");
      return;
    }

    if (editingTax) {
      // Update existing tax
      setTaxSettings(taxSettings.map(tax => 
        tax.id === editingTax 
          ? { ...tax, ...formData } 
          : tax
      ));
      toast.success("Tax setting updated successfully");
    } else {
      // Add new tax
      const newTax: TaxSetting = {
        id: `tax-${Date.now()}`,
        ...formData
      };
      setTaxSettings([...taxSettings, newTax]);
      toast.success("Tax setting added successfully");
    }

    handleCloseDialog();
  };

  const handleCloseDialog = () => {
    setFormData({
      name: "",
      rate: 0,
      isActive: true,
      applicableOn: ["all"],
      isDefault: false,
      appliedTo: ["all"]
    });
    setEditingTax(null);
    setIsDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tax Settings</h1>
          <p className="text-muted-foreground">
            Configure tax rates and settings for invoices
          </p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              setEditingTax(null);
              setFormData({
                name: "",
                rate: 0,
                isActive: true,
                applicableOn: ["all"]
              });
            }}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Tax
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>{editingTax ? "Edit Tax Setting" : "Add Tax Setting"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Tax Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., GST, VAT, Sales Tax"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="rate">Tax Rate (%)</Label>
                <Input
                  id="rate"
                  type="number"
                  value={formData.rate}
                  onChange={e => setFormData({ ...formData, rate: parseFloat(e.target.value) })}
                  step="0.01"
                  min="0"
                  required
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={checked => setFormData({ ...formData, isActive: checked })}
                />
                <Label htmlFor="isActive">Active</Label>
              </div>
              
              <DialogFooter>
                <Button type="button" variant="outline" onClick={handleCloseDialog}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingTax ? "Update" : "Add"} Tax
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>GST Configuration</CardTitle>
            <CardDescription>Configure GST settings for invoices</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="gstType">GST Type</Label>
              <select
                id="gstType"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="regular">Regular GST</option>
                <option value="composite">Composition Scheme</option>
                <option value="exempt">GST Exempt</option>
              </select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="gstNumber">GST Number</Label>
              <Input id="gstNumber" placeholder="e.g., 22AAAAA0000A1Z5" />
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch id="showGstInInvoice" defaultChecked={true} />
              <Label htmlFor="showGstInInvoice">Show GST details in invoice</Label>
            </div>
            
            <Button className="w-full">Save GST Settings</Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Invoice Tax Settings</CardTitle>
            <CardDescription>Configure how taxes appear on invoices</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="taxCalculation">Tax Calculation</Label>
              <select
                id="taxCalculation"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="exclusive">Tax Exclusive (Add to subtotal)</option>
                <option value="inclusive">Tax Inclusive (Included in price)</option>
              </select>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch id="itemWiseTax" defaultChecked={false} />
              <Label htmlFor="itemWiseTax">Enable item-wise tax rates</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch id="showTaxBreakdown" defaultChecked={true} />
              <Label htmlFor="showTaxBreakdown">Show tax breakdown in invoice</Label>
            </div>
            
            <Button className="w-full">Save Invoice Settings</Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Default Tax Rates</CardTitle>
            <CardDescription>Configure default tax rates for new products</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="defaultTaxCategory">Default Tax Category</Label>
              <select
                id="defaultTaxCategory"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="standard">Standard Rate (18%)</option>
                <option value="reduced">Reduced Rate (12%)</option>
                <option value="special">Special Rate (5%)</option>
                <option value="exempt">Tax Exempt (0%)</option>
              </select>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch id="applyDefaultToAll" defaultChecked={true} />
              <Label htmlFor="applyDefaultToAll">Apply default to all new products</Label>
            </div>
            
            <Button className="w-full">Save Default Settings</Button>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Tax Rates</CardTitle>
          <CardDescription>Manage your tax rates and their applicability</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Rate (%)</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Applied To</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {taxSettings.map(tax => (
                <TableRow key={tax.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center">
                      <DollarSign className="h-4 w-4 mr-2 text-muted-foreground" />
                      {tax.name}
                    </div>
                  </TableCell>
                  <TableCell>{tax.rate}%</TableCell>
                  <TableCell>
                    {tax.isActive ? (
                      <span className="flex items-center text-green-600">
                        <CheckCircle2 className="h-4 w-4 mr-1" /> Active
                      </span>
                    ) : (
                      <span className="flex items-center text-amber-600">
                        <AlertCircle className="h-4 w-4 mr-1" /> Inactive
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    {tax.applicableOn.includes("all") 
                      ? "All Products" 
                      : tax.applicableOn.join(", ")}
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
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Delete Tax Setting</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>Are you sure you want to delete this tax setting? This action cannot be undone.</p>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={confirmDelete}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TaxSettings;
