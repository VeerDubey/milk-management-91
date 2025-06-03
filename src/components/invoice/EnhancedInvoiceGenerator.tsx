
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  FileText, 
  Download, 
  Printer, 
  RotateCcw, 
  TestTube, 
  Building, 
  Calendar,
  Receipt,
  Eye,
  Palette
} from 'lucide-react';
import { toast } from 'sonner';
import { InvoiceFormProvider, useInvoiceForm } from './InvoiceFormContext';
import BillToSection from './BillToSection';
import ShipToSection from './ShipToSection';
import ItemDetailsSection from './ItemDetailsSection';
import { INVOICE_TEMPLATES, CURRENCIES, PRESET_NOTES, DEFAULT_TERMS } from '@/utils/invoiceTemplates';
import { formatCurrency } from '@/utils/currencyUtils';

const InvoiceGeneratorContent = () => {
  const { formData, updateFormData, resetForm, fillDummyData } = useInvoiceForm();
  const [receiptMode, setReceiptMode] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);

  const handleGeneratePDF = () => {
    if (!formData.customerName || formData.items.length === 0) {
      toast.error('Please fill customer details and add at least one item');
      return;
    }
    
    // PDF generation logic will be implemented separately
    toast.success('PDF generation feature coming soon!');
  };

  const handlePrint = () => {
    if (!formData.customerName || formData.items.length === 0) {
      toast.error('Please fill customer details and add at least one item');
      return;
    }
    
    window.print();
    toast.success('Print dialog opened');
  };

  const selectedTemplate = INVOICE_TEMPLATES.find(t => t.id === formData.templateId) || INVOICE_TEMPLATES[0];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <Card className="modern-card">
          <CardHeader>
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <CardTitle className="text-2xl text-gradient flex items-center gap-2">
                  <FileText className="h-6 w-6" />
                  Enhanced Invoice Generator
                </CardTitle>
                <p className="text-muted-foreground mt-1">
                  Create professional invoices for your milk delivery business
                </p>
              </div>
              
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-gradient-to-r from-green-100 to-blue-100">
                  {formData.currency.symbol} {formData.currency.code}
                </Badge>
                <Badge variant="outline" className="bg-gradient-to-r from-purple-100 to-pink-100">
                  {selectedTemplate.name}
                </Badge>
                <Badge variant={receiptMode ? "default" : "outline"}>
                  {receiptMode ? "Receipt Mode" : "Invoice Mode"}
                </Badge>
              </div>
            </div>
          </CardHeader>
          
          <CardContent>
            <div className="flex flex-wrap gap-2">
              <Button onClick={fillDummyData} variant="outline" size="sm">
                <TestTube className="h-4 w-4 mr-2" />
                Fill Demo Data
              </Button>
              <Button onClick={resetForm} variant="outline" size="sm">
                <RotateCcw className="h-4 w-4 mr-2" />
                Clear Form
              </Button>
              <Button 
                onClick={() => setReceiptMode(!receiptMode)} 
                variant="outline" 
                size="sm"
              >
                <Receipt className="h-4 w-4 mr-2" />
                {receiptMode ? "Invoice Mode" : "Receipt Mode"}
              </Button>
              <Button 
                onClick={() => setPreviewMode(!previewMode)} 
                variant="outline" 
                size="sm"
              >
                <Eye className="h-4 w-4 mr-2" />
                {previewMode ? "Edit Mode" : "Preview"}
              </Button>
              <Button onClick={handleGeneratePDF} className="modern-button" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Download PDF
              </Button>
              <Button onClick={handlePrint} variant="outline" size="sm">
                <Printer className="h-4 w-4 mr-2" />
                Print
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Panel - Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Business Information */}
            <Card className="modern-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gradient">
                  <Building className="h-5 w-5" />
                  Business Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Company Name *</Label>
                    <Input
                      value={formData.companyName}
                      onChange={(e) => updateFormData({ companyName: e.target.value })}
                      className="modern-input"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>GST Number</Label>
                    <Input
                      value={formData.companyGST}
                      onChange={(e) => updateFormData({ companyGST: e.target.value })}
                      placeholder="27AABCV1234F1Z5"
                      className="modern-input"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Company Address *</Label>
                  <Textarea
                    value={formData.companyAddress}
                    onChange={(e) => updateFormData({ companyAddress: e.target.value })}
                    className="modern-input"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Phone *</Label>
                    <Input
                      value={formData.companyPhone}
                      onChange={(e) => updateFormData({ companyPhone: e.target.value })}
                      className="modern-input"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input
                      type="email"
                      value={formData.companyEmail}
                      onChange={(e) => updateFormData({ companyEmail: e.target.value })}
                      className="modern-input"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Invoice Details */}
            <Card className="modern-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gradient">
                  <Calendar className="h-5 w-5" />
                  Invoice Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Invoice Number *</Label>
                    <Input
                      value={formData.invoiceNumber}
                      onChange={(e) => updateFormData({ invoiceNumber: e.target.value })}
                      className="modern-input"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Invoice Date *</Label>
                    <Input
                      type="date"
                      value={formData.invoiceDate}
                      onChange={(e) => updateFormData({ invoiceDate: e.target.value })}
                      className="modern-input"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Due Date *</Label>
                    <Input
                      type="date"
                      value={formData.dueDate}
                      onChange={(e) => updateFormData({ dueDate: e.target.value })}
                      className="modern-input"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <Label>Currency</Label>
                  <RadioGroup
                    value={formData.currency.code}
                    onValueChange={(value) => {
                      const currency = CURRENCIES.find(c => c.code === value);
                      if (currency) updateFormData({ currency });
                    }}
                  >
                    <div className="flex gap-6">
                      {CURRENCIES.map(currency => (
                        <div key={currency.code} className="flex items-center space-x-2">
                          <RadioGroupItem value={currency.code} id={currency.code} />
                          <Label htmlFor={currency.code} className="flex items-center gap-2">
                            <span className="text-lg">{currency.symbol}</span>
                            {currency.name}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </RadioGroup>
                </div>
              </CardContent>
            </Card>

            {/* Customer and Delivery Information */}
            <BillToSection />
            <ShipToSection />
            <ItemDetailsSection />

            {/* Notes and Terms */}
            <Card className="modern-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gradient">
                  <FileText className="h-5 w-5" />
                  Additional Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Notes</Label>
                  <Select value={formData.notes} onValueChange={(value) => updateFormData({ notes: value })}>
                    <SelectTrigger className="modern-input">
                      <SelectValue placeholder="Select a preset note or type custom" />
                    </SelectTrigger>
                    <SelectContent className="modern-card">
                      {PRESET_NOTES.map((note, index) => (
                        <SelectItem key={index} value={note}>
                          {note.substring(0, 50)}...
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Textarea
                    value={formData.notes}
                    onChange={(e) => updateFormData({ notes: e.target.value })}
                    placeholder="Add custom notes..."
                    className="modern-input"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Terms & Conditions</Label>
                  <Textarea
                    value={formData.terms}
                    onChange={(e) => updateFormData({ terms: e.target.value })}
                    placeholder={DEFAULT_TERMS}
                    className="modern-input min-h-[100px]"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Panel - Template Selection & Summary */}
          <div className="space-y-6">
            {/* Template Selection */}
            <Card className="modern-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gradient">
                  <Palette className="h-5 w-5" />
                  Template Selection
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {INVOICE_TEMPLATES.slice(0, 6).map(template => (
                    <div
                      key={template.id}
                      className={`p-3 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
                        formData.templateId === template.id 
                          ? 'border-primary bg-primary/5 shadow-md' 
                          : 'border-border hover:border-primary/50'
                      }`}
                      onClick={() => updateFormData({ templateId: template.id })}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">{template.name}</div>
                          <div className="text-xs text-muted-foreground">{template.description}</div>
                        </div>
                        <div 
                          className="w-4 h-4 rounded-full border-2"
                          style={{ backgroundColor: template.primaryColor }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Invoice Summary */}
            {formData.items.length > 0 && (
              <Card className="modern-card">
                <CardHeader>
                  <CardTitle className="text-gradient">Invoice Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Items:</span>
                      <span>{formData.items.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span>{formatCurrency(formData.subtotal, formData.currency)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tax ({formData.taxPercentage}%):</span>
                      <span>{formatCurrency(formData.taxAmount, formData.currency)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Discount:</span>
                      <span>-{formatCurrency(formData.discountAmount, formData.currency)}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between text-lg font-bold text-primary">
                      <span>Total:</span>
                      <span>{formatCurrency(formData.grandTotal, formData.currency)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Quick Actions */}
            <Card className="modern-card">
              <CardHeader>
                <CardTitle className="text-gradient">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button onClick={handleGeneratePDF} className="modern-button w-full">
                  <Download className="h-4 w-4 mr-2" />
                  Generate PDF
                </Button>
                <Button onClick={handlePrint} variant="outline" className="w-full">
                  <Printer className="h-4 w-4 mr-2" />
                  Print Invoice
                </Button>
                <Button 
                  onClick={() => setReceiptMode(!receiptMode)} 
                  variant="outline" 
                  className="w-full"
                >
                  <Receipt className="h-4 w-4 mr-2" />
                  {receiptMode ? "Switch to Invoice" : "Receipt Mode"}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function EnhancedInvoiceGenerator() {
  return (
    <InvoiceFormProvider>
      <InvoiceGeneratorContent />
    </InvoiceFormProvider>
  );
}
