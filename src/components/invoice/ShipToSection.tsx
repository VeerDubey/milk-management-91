
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Truck, MapPin, Clock } from 'lucide-react';
import { useInvoiceForm } from './InvoiceFormContext';

export default function ShipToSection() {
  const { formData, updateFormData } = useInvoiceForm();
  const [sameAsBilling, setSameAsBilling] = useState(false);

  const handleSameAsBillingChange = (checked: boolean) => {
    setSameAsBilling(checked);
    if (checked) {
      updateFormData({ deliveryAddress: formData.customerAddress });
    } else {
      updateFormData({ deliveryAddress: '' });
    }
  };

  return (
    <Card className="modern-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-gradient">
          <Truck className="h-5 w-5" />
          Delivery Information
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="sameAsBilling"
            checked={sameAsBilling}
            onCheckedChange={handleSameAsBillingChange}
          />
          <Label htmlFor="sameAsBilling" className="text-sm">
            Same as billing address
          </Label>
        </div>

        <div className="space-y-2">
          <Label htmlFor="deliveryAddress" className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Delivery Address *
          </Label>
          <Textarea
            id="deliveryAddress"
            value={formData.deliveryAddress}
            onChange={(e) => updateFormData({ deliveryAddress: e.target.value })}
            placeholder="Enter delivery address if different from billing"
            className="modern-input min-h-[80px]"
            disabled={sameAsBilling}
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="deliveryDate" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Delivery Date *
            </Label>
            <Input
              id="deliveryDate"
              type="date"
              value={formData.deliveryDate}
              onChange={(e) => updateFormData({ deliveryDate: e.target.value })}
              className="modern-input"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="deliveryTime" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Preferred Time
            </Label>
            <Input
              id="deliveryTime"
              type="time"
              value={formData.deliveryTime}
              onChange={(e) => updateFormData({ deliveryTime: e.target.value })}
              className="modern-input"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
