
import { useState } from "react";
import { useData } from "@/contexts/data/DataContext";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import {
  FileText,
  Plus,
  Check,
  ChevronsUpDown,
  Palette,
  Copy,
  Trash,
  Edit,
  Eye,
  Settings,
  SaveIcon
} from "lucide-react";
import { InvoiceTemplate } from "@/types";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";

const fontOptions = [
  { label: "Arial", value: "Arial, sans-serif" },
  { label: "Helvetica", value: "Helvetica, sans-serif" },
  { label: "Times New Roman", value: "Times New Roman, serif" },
  { label: "Georgia", value: "Georgia, serif" },
  { label: "Courier New", value: "Courier New, monospace" },
  { label: "Verdana", value: "Verdana, sans-serif" },
  { label: "Tahoma", value: "Tahoma, sans-serif" },
];

const colorOptions = [
  { label: "Blue", value: "#1E40AF" },
  { label: "Green", value: "#15803D" },
  { label: "Purple", value: "#7E22CE" },
  { label: "Red", value: "#B91C1C" },
  { label: "Orange", value: "#C2410C" },
  { label: "Pink", value: "#BE185D" },
  { label: "Gray", value: "#4B5563" },
  { label: "Teal", value: "#0F766E" },
];

type TemplateType = "standard" | "modern" | "minimalist" | "professional" | "classic";

const InvoiceTemplates = () => {
  // In a real app, these would come from useData context
  const [templates, setTemplates] = useState<InvoiceTemplate[]>([
    {
      id: "1",
      name: "Standard Template",
      description: "Default invoice template",
      fontFamily: "Arial, sans-serif",
      primaryColor: "#1E40AF",
    },
    {
      id: "2",
      name: "Modern Blue",
      description: "Clean modern design with blue accents",
      fontFamily: "Helvetica, sans-serif",
      primaryColor: "#0F766E",
    },
    {
      id: "3",
      name: "Professional Gray",
      description: "Professional template for business",
      fontFamily: "Georgia, serif",
      primaryColor: "#4B5563",
    },
  ]);

  const [activeTab, setActiveTab] = useState<string>("gallery");
  const [activeTemplate, setActiveTemplate] = useState<string>("1");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deletingTemplateId, setDeletingTemplateId] = useState<string | null>(null);
  const [newTemplate, setNewTemplate] = useState<Partial<InvoiceTemplate>>({
    name: "",
    description: "",
    fontFamily: "Arial, sans-serif",
    primaryColor: "#1E40AF",
  });
  const [selectedTemplateType, setSelectedTemplateType] = useState<TemplateType>("standard");

  const handleDeleteTemplate = (id: string) => {
    setDeletingTemplateId(id);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (deletingTemplateId) {
      setTemplates(templates.filter(template => template.id !== deletingTemplateId));
      toast.success("Template deleted successfully");
      setIsDeleteDialogOpen(false);
      setDeletingTemplateId(null);
    }
  };

  const handleCreateTemplate = () => {
    if (!newTemplate.name?.trim()) {
      toast.error("Template name is required");
      return;
    }

    const templateToAdd = {
      id: `template-${Date.now()}`,
      name: newTemplate.name,
      description: newTemplate.description || "",
      fontFamily: newTemplate.fontFamily || "Arial, sans-serif",
      primaryColor: newTemplate.primaryColor || "#1E40AF",
    };

    setTemplates([...templates, templateToAdd]);
    toast.success("Template created successfully");
    setIsCreateDialogOpen(false);
    setNewTemplate({
      name: "",
      description: "",
      fontFamily: "Arial, sans-serif",
      primaryColor: "#1E40AF",
    });
  };

  const duplicateTemplate = (template: InvoiceTemplate) => {
    const duplicated = {
      ...template,
      id: `template-${Date.now()}`,
      name: `${template.name} (Copy)`,
    };
    
    setTemplates([...templates, duplicated]);
    toast.success("Template duplicated successfully");
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Invoice Templates</h1>
          <p className="text-muted-foreground">
            Create and manage invoice templates for your business
          </p>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Template
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[625px]">
            <DialogHeader>
              <DialogTitle>Create New Invoice Template</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Name
                </Label>
                <Input
                  id="name"
                  value={newTemplate.name}
                  onChange={(e) => setNewTemplate({ ...newTemplate, name: e.target.value })}
                  className="col-span-3"
                  placeholder="Template Name"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="description" className="text-right">
                  Description
                </Label>
                <Input
                  id="description"
                  value={newTemplate.description}
                  onChange={(e) => setNewTemplate({ ...newTemplate, description: e.target.value })}
                  className="col-span-3"
                  placeholder="Template Description"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="font-family" className="text-right">
                  Font
                </Label>
                <div className="col-span-3">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        className="w-full justify-between"
                      >
                        {fontOptions.find((font) => font.value === newTemplate.fontFamily)?.label || "Select font"}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0">
                      <div className="max-h-[200px] overflow-y-auto">
                        {fontOptions.map((font) => (
                          <div
                            key={font.value}
                            className={`flex items-center justify-between px-4 py-2 cursor-pointer hover:bg-muted ${
                              newTemplate.fontFamily === font.value ? "bg-muted" : ""
                            }`}
                            onClick={() => setNewTemplate({ ...newTemplate, fontFamily: font.value })}
                          >
                            <span style={{ fontFamily: font.value }}>{font.label}</span>
                            {newTemplate.fontFamily === font.value && (
                              <Check className="h-4 w-4" />
                            )}
                          </div>
                        ))}
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="color" className="text-right">
                  Primary Color
                </Label>
                <div className="col-span-3 flex gap-2 flex-wrap">
                  {colorOptions.map((color) => (
                    <button
                      key={color.value}
                      type="button"
                      className={`w-8 h-8 rounded-full border ${
                        newTemplate.primaryColor === color.value
                          ? "ring-2 ring-offset-2 ring-primary"
                          : "border-muted"
                      }`}
                      style={{ backgroundColor: color.value }}
                      onClick={() => setNewTemplate({ ...newTemplate, primaryColor: color.value })}
                      aria-label={`Select ${color.label} color`}
                    />
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Template Type</Label>
                <div className="col-span-3">
                  <RadioGroup 
                    value={selectedTemplateType} 
                    onValueChange={(value) => setSelectedTemplateType(value as TemplateType)}
                    className="grid grid-cols-3 gap-2"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="standard" id="standard" />
                      <Label htmlFor="standard">Standard</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="modern" id="modern" />
                      <Label htmlFor="modern">Modern</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="minimalist" id="minimalist" />
                      <Label htmlFor="minimalist">Minimalist</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="professional" id="professional" />
                      <Label htmlFor="professional">Professional</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="classic" id="classic" />
                      <Label htmlFor="classic">Classic</Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateTemplate}>Create Template</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="gallery" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="gallery">Template Gallery</TabsTrigger>
          <TabsTrigger value="settings">Template Settings</TabsTrigger>
          <TabsTrigger value="editor">Template Editor</TabsTrigger>
        </TabsList>
        
        <TabsContent value="gallery" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {templates.map((template) => (
              <Card 
                key={template.id} 
                className={`overflow-hidden transition-shadow hover:shadow-md ${
                  activeTemplate === template.id ? "ring-2 ring-primary" : ""
                }`}
              >
                <div 
                  className="h-2" 
                  style={{ backgroundColor: template.primaryColor || "#1E40AF" }}
                />
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-lg" style={{ fontFamily: template.fontFamily }}>
                      {template.name}
                    </CardTitle>
                    {activeTemplate === template.id && (
                      <span className="bg-primary text-white text-xs px-2 py-1 rounded-full">
                        Active
                      </span>
                    )}
                  </div>
                  <CardDescription>{template.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-48 border rounded-md p-4 flex items-center justify-center">
                    <div className="text-center">
                      <FileText className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">
                        Preview not available
                      </p>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="justify-between border-t p-4">
                  <Button 
                    variant={activeTemplate === template.id ? "secondary" : "default"} 
                    onClick={() => {
                      setActiveTemplate(template.id);
                      toast.success(`${template.name} set as active template`);
                    }}
                    className="w-full"
                    disabled={activeTemplate === template.id}
                  >
                    {activeTemplate === template.id ? (
                      <>
                        <Check className="mr-2 h-4 w-4" />
                        Active
                      </>
                    ) : (
                      "Set as Active"
                    )}
                  </Button>
                </CardFooter>
                <div className="bg-muted/50 p-2 flex justify-between">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => {
                      setActiveTab("editor");
                      setActiveTemplate(template.id);
                    }}
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                  <div className="flex gap-1">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => duplicateTemplate(template)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleDeleteTemplate(template.id)}
                      disabled={templates.length <= 1 || activeTemplate === template.id}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>PDF Settings</CardTitle>
              <CardDescription>Configure settings for PDF invoice generation</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="paperSize">Paper Size</Label>
                <select
                  id="paperSize"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="A4">A4</option>
                  <option value="Letter">Letter</option>
                  <option value="Legal">Legal</option>
                  <option value="A5">A5</option>
                </select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="orientation">Orientation</Label>
                  <select
                    id="orientation"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="portrait">Portrait</option>
                    <option value="landscape">Landscape</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="unit">Measurement Unit</Label>
                  <select
                    id="unit"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="mm">Millimeters</option>
                    <option value="in">Inches</option>
                    <option value="pt">Points</option>
                  </select>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="marginTop">Top Margin (mm)</Label>
                  <Input id="marginTop" type="number" defaultValue="10" min="0" max="100" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="marginBottom">Bottom Margin (mm)</Label>
                  <Input id="marginBottom" type="number" defaultValue="10" min="0" max="100" />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="marginLeft">Left Margin (mm)</Label>
                  <Input id="marginLeft" type="number" defaultValue="10" min="0" max="100" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="marginRight">Right Margin (mm)</Label>
                  <Input id="marginRight" type="number" defaultValue="10" min="0" max="100" />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="ml-auto">
                <SaveIcon className="mr-2 h-4 w-4" />
                Save PDF Settings
              </Button>
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Invoice Content Settings</CardTitle>
              <CardDescription>Configure what information appears on your invoices</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-base">Company Details</Label>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox id="showLogo" defaultChecked />
                      <label htmlFor="showLogo">Show Logo</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="showCompanyName" defaultChecked />
                      <label htmlFor="showCompanyName">Company Name</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="showCompanyAddress" defaultChecked />
                      <label htmlFor="showCompanyAddress">Company Address</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="showContactInfo" defaultChecked />
                      <label htmlFor="showContactInfo">Contact Information</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="showGST" defaultChecked />
                      <label htmlFor="showGST">GST Number</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="showPAN" defaultChecked />
                      <label htmlFor="showPAN">PAN Number</label>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label className="text-base">Invoice Details</Label>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox id="showInvoiceNumber" defaultChecked />
                      <label htmlFor="showInvoiceNumber">Invoice Number</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="showInvoiceDate" defaultChecked />
                      <label htmlFor="showInvoiceDate">Invoice Date</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="showDueDate" defaultChecked />
                      <label htmlFor="showDueDate">Due Date</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="showPaymentTerms" defaultChecked />
                      <label htmlFor="showPaymentTerms">Payment Terms</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="showPurchaseOrder" />
                      <label htmlFor="showPurchaseOrder">Purchase Order</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="showReferenceNumber" />
                      <label htmlFor="showReferenceNumber">Reference Number</label>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label className="text-base">Item Details</Label>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox id="showItemCode" />
                      <label htmlFor="showItemCode">Item Code</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="showDescription" defaultChecked />
                      <label htmlFor="showDescription">Description</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="showHSNCode" />
                      <label htmlFor="showHSNCode">HSN/SAC Code</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="showUnitPrice" defaultChecked />
                      <label htmlFor="showUnitPrice">Unit Price</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="showQuantity" defaultChecked />
                      <label htmlFor="showQuantity">Quantity</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="showDiscount" />
                      <label htmlFor="showDiscount">Discount</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="showTax" defaultChecked />
                      <label htmlFor="showTax">Tax</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="showAmount" defaultChecked />
                      <label htmlFor="showAmount">Amount</label>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label className="text-base">Footer Details</Label>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox id="showNotes" defaultChecked />
                      <label htmlFor="showNotes">Notes</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="showTerms" defaultChecked />
                      <label htmlFor="showTerms">Terms & Conditions</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="showBankDetails" defaultChecked />
                      <label htmlFor="showBankDetails">Bank Details</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="showSignature" defaultChecked />
                      <label htmlFor="showSignature">Signature</label>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="ml-auto">
                <SaveIcon className="mr-2 h-4 w-4" />
                Save Content Settings
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="editor" className="space-y-4">
          <Card className="mb-4">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Template Editor</CardTitle>
                <div>
                  <Button variant="outline" className="mr-2" onClick={() => setActiveTab("gallery")}>
                    Cancel
                  </Button>
                  <Button onClick={() => {
                    toast.success("Template saved successfully");
                    setActiveTab("gallery");
                  }}>
                    <SaveIcon className="mr-2 h-4 w-4" />
                    Save Template
                  </Button>
                </div>
              </div>
              <CardDescription>
                {templates.find(t => t.id === activeTemplate)?.description || "Edit your invoice template"}
              </CardDescription>
            </CardHeader>
            <CardContent className="border-t pt-4">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="md:w-1/3 space-y-6">
                  <div>
                    <h3 className="text-lg font-medium">General Settings</h3>
                    <div className="mt-4 space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="templateName">Template Name</Label>
                        <Input 
                          id="templateName" 
                          defaultValue={templates.find(t => t.id === activeTemplate)?.name} 
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="templateDescription">Description</Label>
                        <Input 
                          id="templateDescription" 
                          defaultValue={templates.find(t => t.id === activeTemplate)?.description} 
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium flex items-center">
                      <Palette className="mr-2 h-5 w-5" />
                      Design Options
                    </h3>
                    <div className="mt-4 space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="templateFont">Font Family</Label>
                        <select
                          id="templateFont"
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          defaultValue={templates.find(t => t.id === activeTemplate)?.fontFamily}
                        >
                          {fontOptions.map(font => (
                            <option key={font.value} value={font.value}>{font.label}</option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-2">
                        <Label>Primary Color</Label>
                        <div className="flex gap-2 flex-wrap">
                          {colorOptions.map((color) => (
                            <button
                              key={color.value}
                              type="button"
                              className={`w-8 h-8 rounded-full border ${
                                templates.find(t => t.id === activeTemplate)?.primaryColor === color.value
                                  ? "ring-2 ring-offset-2 ring-primary"
                                  : "border-muted"
                              }`}
                              style={{ backgroundColor: color.value }}
                              aria-label={`Select ${color.label} color`}
                            />
                          ))}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="headerStyle">Header Style</Label>
                        <select
                          id="headerStyle"
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          defaultValue="standard"
                        >
                          <option value="standard">Standard</option>
                          <option value="minimal">Minimal</option>
                          <option value="boxed">Boxed</option>
                          <option value="modern">Modern</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="tableStyle">Table Style</Label>
                        <select
                          id="tableStyle"
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          defaultValue="bordered"
                        >
                          <option value="bordered">Bordered</option>
                          <option value="striped">Striped</option>
                          <option value="minimal">Minimal</option>
                          <option value="modern">Modern</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="md:w-2/3 border rounded-md bg-card/50 flex flex-col">
                  <div className="p-4 border-b bg-muted/50 flex justify-between items-center">
                    <h3 className="font-medium">Preview</h3>
                    <div className="space-x-2">
                      <Button variant="outline" size="sm">
                        <Eye className="mr-2 h-4 w-4" />
                        Preview
                      </Button>
                      <Button variant="secondary" size="sm">
                        <Settings className="mr-2 h-4 w-4" />
                        Template Sections
                      </Button>
                    </div>
                  </div>
                  <div className="flex-1 p-6 flex items-center justify-center">
                    <div className="text-center">
                      <FileText className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                      <p className="text-muted-foreground mb-2">
                        Template preview not available in demo mode
                      </p>
                      <Button variant="outline" className="mt-2">
                        Generate Preview
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Delete Template</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>Are you sure you want to delete this template? This action cannot be undone.</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default InvoiceTemplates;
