
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { User, MapPin, Phone, Mail } from 'lucide-react';
import { useInvoiceForm } from './InvoiceFormContext';

export default function BillToSection() {
  const { formData, updateFormData } = useInvoiceForm();

  return (
    <Card className="modern-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-gradient">
          <User className="h-5 w-5" />
          Bill To
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="customerName" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Customer Name *
          </Label>
          <Input
            id="customerName"
            value={formData.customerName}
            onChange={(e) => updateFormData({ customerName: e.target.value })}
            placeholder="Enter customer name"
            className="modern-input"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="customerAddress" className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Billing Address *
          </Label>
          <Textarea
            id="customerAddress"
            value={formData.customerAddress}
            onChange={(e) => updateFormData({ customerAddress: e.target.value })}
            placeholder="Enter complete billing address"
            className="modern-input min-h-[80px]"
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="customerPhone" className="flex items-center gap-2">
              <Phone className="h-4 w-4" />
              Phone Number *
            </Label>
            <Input
              id="customerPhone"
              value={formData.customerPhone}
              onChange={(e) => updateFormData({ customerPhone: e.target.value })}
              placeholder="+91 98765 43210"
              className="modern-input"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="customerEmail" className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Email (Optional)
            </Label>
            <Input
              id="customerEmail"
              type="email"
              value={formData.customerEmail}
              onChange={(e) => updateFormData({ customerEmail: e.target.value })}
              placeholder="customer@email.com"
              className="modern-input"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
