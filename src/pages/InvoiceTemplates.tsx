import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useInvoice, InvoiceTemplate } from '@/contexts/InvoiceContext';
import InvoiceTemplateGallery from '@/components/invoices/InvoiceTemplateGallery';
import { HexColorPicker } from 'react-colorful';
import { toast } from 'sonner';
import { ArrowLeft, Settings, Plus, Check, Eye } from 'lucide-react';

export default function InvoiceTemplates() {
  const { templates, companyInfo, updateCompanyInfo } = useInvoice();
  const [activeTab, setActiveTab] = useState('gallery');
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [primaryColor, setPrimaryColor] = useState('#4F46E5');
  
  const handleUpdateCompanyInfo = (field: string, value: string) => {
    updateCompanyInfo({ [field]: value } as any);
    toast.success(`${field} updated successfully`);
  };
  
  const handleSelectTemplate = (templateId: string) => {
    setSelectedTemplate(templateId);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Invoice Templates</h1>
          <p className="text-muted-foreground">
            Customize your invoice templates and settings
          </p>
        </div>
        <Button onClick={() => setActiveTab('settings')}>
          <Settings className="mr-2 h-4 w-4" />
          Company Settings
        </Button>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="gallery">Template Gallery</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
          <TabsTrigger value="settings">Company Information</TabsTrigger>
        </TabsList>
        
        <TabsContent value="gallery" className="space-y-6">
          <InvoiceTemplateGallery 
            showPreviewOption={true}
            previewInvoiceId="INV-2023-001"
          />
        </TabsContent>
        
        <TabsContent value="preview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Invoice Preview</CardTitle>
              <CardDescription>
                See how your invoice will look with the selected template
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center">
              <div className="border rounded-md p-4 w-full max-w-3xl min-h-[500px] flex items-center justify-center">
                <div className="text-center space-y-4">
                  <Eye className="h-12 w-12 mx-auto text-muted-foreground/50" />
                  <h3 className="text-lg font-medium">Preview Not Available</h3>
                  <p className="text-muted-foreground max-w-md mx-auto">
                    To preview an invoice, please select a template from the Template Gallery tab and click the "Preview With Invoice" button.
                  </p>
                  <Button 
                    variant="outline" 
                    onClick={() => setActiveTab('gallery')}
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Go to Template Gallery
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Company Information</CardTitle>
              <CardDescription>
                These details will appear on your invoices
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="companyName">Company Name</Label>
                  <Input 
                    id="companyName" 
                    value={companyInfo.companyName}
                    onChange={(e) => handleUpdateCompanyInfo('companyName', e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email"
                    type="email"
                    value={companyInfo.email}
                    onChange={(e) => handleUpdateCompanyInfo('email', e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="contactNumber">Contact Number</Label>
                  <Input 
                    id="contactNumber"
                    value={companyInfo.contactNumber}
                    onChange={(e) => handleUpdateCompanyInfo('contactNumber', e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="gstNumber">GST Number</Label>
                  <Input 
                    id="gstNumber"
                    value={companyInfo.gstNumber || ''}
                    onChange={(e) => handleUpdateCompanyInfo('gstNumber', e.target.value)}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input 
                  id="address"
                  value={companyInfo.address}
                  onChange={(e) => handleUpdateCompanyInfo('address', e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="bankDetails">Bank Details</Label>
                <Input 
                  id="bankDetails"
                  value={companyInfo.bankDetails || ''}
                  onChange={(e) => handleUpdateCompanyInfo('bankDetails', e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label>Template Color</Label>
                <div>
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={() => setShowColorPicker(!showColorPicker)}
                    className="mr-2"
                  >
                    <div 
                      className="w-4 h-4 mr-2 rounded-full border" 
                      style={{ backgroundColor: primaryColor }}
                    />
                    {primaryColor}
                  </Button>
                  {showColorPicker && (
                    <div className="absolute z-10 mt-2 p-2 bg-background border rounded-md shadow-md">
                      <HexColorPicker 
                        color={primaryColor}
                        onChange={(color) => setPrimaryColor(color.hex)}
                      />
                      <div className="flex justify-end mt-2">
                        <Button 
                          size="sm" 
                          onClick={() => {
                            setShowColorPicker(false);
                            toast.success("Color updated");
                          }}
                        >
                          <Check className="mr-2 h-3 w-3" />
                          Apply Color
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={() => toast.success("Settings saved successfully")}>
                Save Settings
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
