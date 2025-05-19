
import { useState, useEffect } from "react";
import { format } from "date-fns";
import { useData } from "@/contexts/data/DataContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { CalendarIcon, Save, Download, FileText, Search, Printer, Plus } from "lucide-react";
import { toast } from "sonner";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { generateTrackSheetPdf, createTrackSheetTemplate, TrackSheetRow, createEmptyTrackSheetRows } from "@/utils/trackSheetUtils";
import { exportToExcel } from "@/utils/excelUtils";
import { useLocation, useNavigate } from "react-router-dom";
import { TrackSheetAnalytics } from "@/components/track-sheet/TrackSheetAnalytics";
import { TrackSheetHeader } from "@/components/track-sheet/TrackSheetHeader";
import { TrackSheetDetails } from "@/components/track-sheet/TrackSheetDetails";
import { SaveTemplateDialog } from "@/components/track-sheet/SaveTemplateDialog";

interface SavedTrackSheet {
  id: string;
  name: string;
  date: Date;
  routeName: string;
  rows: TrackSheetRow[];
  createdAt: Date;
}

export default function TrackSheet() {
  const navigate = useNavigate();
  const location = useLocation();
  const { products, customers } = useData();
  const [date, setDate] = useState<Date>(new Date());
  const [routeName, setRouteName] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [rows, setRows] = useState<TrackSheetRow[]>([]);
  const [productNames, setProductNames] = useState<string[]>([]);
  const [savedTemplates, setSavedTemplates] = useState<SavedTrackSheet[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [newTemplateName, setNewTemplateName] = useState<string>("");
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>("editor");

  // Get product names for column headers
  useEffect(() => {
    const names = products.map(p => p.name);
    setProductNames(names);
    
    // Initialize with empty template
    if (rows.length === 0) {
      const emptyRows = createEmptyTrackSheetRows(names);
      setRows(emptyRows);
    }
  }, [products]);

  // Handle incoming template data from history page
  useEffect(() => {
    if (location.state?.templateData) {
      const template = location.state.templateData;
      setDate(new Date(template.date));
      setRouteName(template.routeName);
      setRows([...template.rows]);
      setSelectedTemplate(template.id);
      setNewTemplateName(template.name);
      
      // Clear the location state to prevent reapplying on refresh
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  // Load saved templates from local storage
  useEffect(() => {
    const savedData = localStorage.getItem('savedTrackSheets');
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        // Convert string dates back to Date objects
        const templatesWithDates = parsedData.map((template: any) => ({
          ...template,
          date: new Date(template.date),
          createdAt: new Date(template.createdAt)
        }));
        setSavedTemplates(templatesWithDates);
      } catch (error) {
        console.error("Error loading saved track sheets:", error);
      }
    }
  }, []);

  // Save templates to local storage when they change
  useEffect(() => {
    if (savedTemplates.length > 0) {
      localStorage.setItem('savedTrackSheets', JSON.stringify(savedTemplates));
    }
  }, [savedTemplates]);

  // Filter customers based on search query
  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Generate template with sample data
  const generateTemplate = () => {
    const template = createTrackSheetTemplate(productNames, date, routeName);
    setRows(template);
    toast.success("Sample template generated");
  };

  // Handle quantity change - Fixed TypeScript issues
  const handleQuantityChange = (rowIndex: number, productName: string, value: string) => {
    const newRows = [...rows];
    
    // Update the quantity for this product
    const numValue = value === "" ? "" : parseFloat(value);
    newRows[rowIndex].quantities[productName] = numValue;
    
    // Recalculate totals for this row
    let total = 0;
    let amount = 0;
    
    Object.entries(newRows[rowIndex].quantities).forEach(([, qty]) => {
      if (typeof qty === 'number') {
        total += qty;
      }
    });
    
    // Calculate amount (assuming a simple calculation for now)
    amount = total * 50; // Assuming ₹50 per unit
    
    newRows[rowIndex].total = total;
    newRows[rowIndex].amount = amount;
    
    setRows(newRows);
  };

  // Add a new row
  const addRow = () => {
    const newRow: TrackSheetRow = {
      name: "",
      quantities: {},
      total: 0,
      amount: 0
    };
    
    // Initialize quantities for each product
    productNames.forEach(product => {
      newRow.quantities[product] = "";
    });
    
    setRows([...rows, newRow]);
  };

  // Remove a row
  const removeRow = (index: number) => {
    const newRows = [...rows];
    newRows.splice(index, 1);
    setRows(newRows);
  };

  // Update customer name
  const handleNameChange = (index: number, name: string) => {
    const newRows = [...rows];
    newRows[index].name = name;
    setRows(newRows);
  };

  // Export to Excel - Fixed TypeScript issues
  const exportAsExcel = () => {
    const headers = ["Customer", ...productNames, "Total", "Amount"];
    
    const data = rows.map(row => {
      const rowData = [row.name];
      
      productNames.forEach(product => {
        // Convert any number values to strings for Excel export
        const value = row.quantities[product];
        rowData.push(value === "" ? "" : String(value));
      });
      
      // Convert numeric values to strings
      rowData.push(String(row.total));
      rowData.push(`₹${row.amount}`);
      
      return rowData;
    });
    
    const filename = `track-sheet-${format(date, "yyyy-MM-dd")}${routeName ? '-' + routeName : ''}`;
    exportToExcel(headers, data, filename);
    toast.success("Track sheet exported to Excel");
  };

  // Generate PDF
  const exportAsPdf = () => {
    const title = `Daily Track Sheet${routeName ? ' - ' + routeName : ''}`;
    
    const additionalInfo = [
      { label: "Route", value: routeName || "All Routes" }
    ];
    
    generateTrackSheetPdf(title, date, rows, productNames, additionalInfo);
    toast.success("Track sheet exported to PDF");
  };

  // Print track sheet
  const printTrackSheet = () => {
    window.print();
  };

  // Save current template
  const saveTemplate = () => {
    if (!newTemplateName.trim()) {
      toast.error("Please enter a template name");
      return;
    }

    // Check if we're updating an existing template
    if (selectedTemplate) {
      const updatedTemplates = savedTemplates.map(t => 
        t.id === selectedTemplate 
          ? {
              ...t,
              name: newTemplateName,
              date: date,
              routeName: routeName,
              rows: [...rows],
            }
          : t
      );
      
      setSavedTemplates(updatedTemplates);
      toast.success(`Template "${newTemplateName}" updated`);
    } else {
      // Create new template
      const newTemplate: SavedTrackSheet = {
        id: Math.random().toString(36).substr(2, 9),
        name: newTemplateName,
        date: date,
        routeName: routeName,
        rows: [...rows],
        createdAt: new Date()
      };

      setSavedTemplates([...savedTemplates, newTemplate]);
      setSelectedTemplate(newTemplate.id);
      toast.success(`Template "${newTemplateName}" saved`);
    }
    
    setIsSaveDialogOpen(false);
  };

  // Load a saved template
  const loadTemplate = (templateId: string) => {
    const template = savedTemplates.find(t => t.id === templateId);
    if (template) {
      setDate(new Date(template.date));
      setRouteName(template.routeName);
      setRows([...template.rows]);
      setSelectedTemplate(templateId);
      setNewTemplateName(template.name);
      toast.success(`Template "${template.name}" loaded`);
    }
  };

  // Delete a saved template
  const deleteTemplate = (templateId: string) => {
    const updatedTemplates = savedTemplates.filter(t => t.id !== templateId);
    setSavedTemplates(updatedTemplates);
    if (selectedTemplate === templateId) {
      setSelectedTemplate(null);
      setNewTemplateName("");
    }
    toast.success("Template deleted");
  };

  return (
    <div className="space-y-6 print:p-4">
      <TrackSheetHeader 
        selectedTemplate={selectedTemplate}
        onOpenSaveDialog={() => setIsSaveDialogOpen(true)}
        onExportExcel={exportAsExcel}
        onExportPdf={exportAsPdf}
        onPrint={printTrackSheet}
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="print:hidden">
          <TabsTrigger value="editor">Editor</TabsTrigger>
          <TabsTrigger value="templates">Saved Templates</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>
        
        <TabsContent value="editor" className="space-y-4">
          <TrackSheetDetails
            date={date}
            routeName={routeName}
            onDateChange={(date) => date && setDate(date)}
            onRouteNameChange={setRouteName}
            onGenerateTemplate={generateTemplate}
          />

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Track Sheet Data</CardTitle>
              <div className="flex items-center gap-2">
                <div className="relative w-64">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search customers..."
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Button size="sm" onClick={addRow}>
                  <Plus className="h-4 w-4 mr-1" />
                  Add Row
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border overflow-hidden">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[200px]">Customer</TableHead>
                        {productNames.map((product) => (
                          <TableHead key={product} className="w-[100px]">{product}</TableHead>
                        ))}
                        <TableHead className="w-[100px]">Total</TableHead>
                        <TableHead className="w-[100px]">Amount</TableHead>
                        <TableHead className="w-[60px]"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {rows.map((row, rowIndex) => (
                        <TableRow key={rowIndex}>
                          <TableCell>
                            <Select
                              value={row.name || ""}
                              onValueChange={(value) => handleNameChange(rowIndex, value)}
                            >
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select customer" />
                              </SelectTrigger>
                              <SelectContent>
                                {filteredCustomers.map((customer) => (
                                  <SelectItem key={customer.id} value={customer.name}>
                                    {customer.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </TableCell>
                          {productNames.map((product) => (
                            <TableCell key={product}>
                              <Input
                                type="number"
                                min="0"
                                value={row.quantities[product] === "" ? "" : String(row.quantities[product])}
                                onChange={(e) => handleQuantityChange(rowIndex, product, e.target.value)}
                                className="w-full"
                              />
                            </TableCell>
                          ))}
                          <TableCell className="font-medium">{row.total}</TableCell>
                          <TableCell className="font-medium">₹{row.amount}</TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={() => removeRow(rowIndex)}
                            >
                              &times;
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                      
                      {/* Totals row */}
                      <TableRow className="bg-muted/50">
                        <TableCell className="font-medium">TOTAL</TableCell>
                        {productNames.map((product) => (
                          <TableCell key={product} className="font-medium">
                            {rows.reduce((sum, row) => {
                              const qty = row.quantities[product];
                              return sum + (typeof qty === 'number' ? qty : 0);
                            }, 0)}
                          </TableCell>
                        ))}
                        <TableCell className="font-medium">
                          {rows.reduce((sum, row) => sum + row.total, 0)}
                        </TableCell>
                        <TableCell className="font-medium">
                          ₹{rows.reduce((sum, row) => sum + row.amount, 0)}
                        </TableCell>
                        <TableCell></TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="templates" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Saved Track Sheet Templates</CardTitle>
            </CardHeader>
            <CardContent>
              {savedTemplates.length > 0 ? (
                <div className="rounded-md border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Template Name</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Route</TableHead>
                        <TableHead>Created On</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {savedTemplates.map((template) => (
                        <TableRow key={template.id} className={selectedTemplate === template.id ? "bg-muted" : ""}>
                          <TableCell className="font-medium">{template.name}</TableCell>
                          <TableCell>{format(new Date(template.date), "PPP")}</TableCell>
                          <TableCell>{template.routeName || "—"}</TableCell>
                          <TableCell>{format(new Date(template.createdAt), "PPP")}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => loadTemplate(template.id)}
                              >
                                Load
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => deleteTemplate(template.id)}
                              >
                                Delete
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No saved templates yet</p>
                  <p className="text-sm">Save your track sheets to reuse them later</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <TrackSheetAnalytics rows={rows} products={productNames} />
        </TabsContent>
      </Tabs>

      <SaveTemplateDialog
        open={isSaveDialogOpen}
        onOpenChange={setIsSaveDialogOpen}
        templateName={newTemplateName}
        onTemplateNameChange={setNewTemplateName}
        onSave={saveTemplate}
        isUpdate={Boolean(selectedTemplate)}
      />
    </div>
  );
}
