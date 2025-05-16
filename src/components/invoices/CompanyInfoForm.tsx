
import React from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Save, Upload } from 'lucide-react';
import { useInvoices } from '@/contexts/InvoiceContext';
import { toast } from 'sonner';

interface CompanyInfoFormProps {
  onSave?: (data: any) => void;
}

export default function CompanyInfoForm({ onSave }: CompanyInfoFormProps) {
  const { companyInfo, updateCompanyInfo } = useInvoices();
  
  const { register, handleSubmit, formState: { isDirty, isValid } } = useForm({
    defaultValues: companyInfo
  });
  
  const onSubmit = (data: any) => {
    updateCompanyInfo(data);
    if (onSave) {
      onSave(data);
    }
  };
  
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="company-name">Company Name</Label>
          <Input id="company-name" {...register("companyName", { required: true })} />
        </div>
        <div>
          <Label htmlFor="gst-number">GST Number</Label>
          <Input id="gst-number" {...register("gstNumber")} />
        </div>
      </div>
      <div>
        <Label htmlFor="address">Address</Label>
        <Input id="address" {...register("address")} />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="contact-number">Contact Number</Label>
          <Input id="contact-number" {...register("contactNumber")} />
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" {...register("email")} type="email" />
        </div>
      </div>
      <div>
        <Label htmlFor="bank-details">Bank Details</Label>
        <Textarea 
          id="bank-details" 
          {...register("bankDetails")} 
          className="min-h-[100px]"
        />
      </div>
      
      <div className="mt-4">
        <Label>Company Logo</Label>
        <div className="mt-2 border-2 border-dashed rounded-md p-6 flex flex-col items-center justify-center">
          {companyInfo.logoUrl ? (
            <div className="w-32 h-32 relative">
              <img 
                src={companyInfo.logoUrl} 
                alt="Company logo" 
                className="w-full h-full object-contain"
              />
              <Button 
                variant="destructive" 
                size="sm" 
                className="absolute -top-2 -right-2"
                onClick={() => {
                  updateCompanyInfo({ ...companyInfo, logoUrl: undefined });
                  toast.success("Logo removed");
                }}
              >
                Remove
              </Button>
            </div>
          ) : (
            <div className="w-32 h-32 bg-muted/50 rounded-md flex items-center justify-center">
              <span className="text-muted-foreground">No logo uploaded</span>
            </div>
          )}
          <Button className="mt-4" variant="outline" type="button">
            <Upload className="h-4 w-4 mr-2" />
            Upload Logo
          </Button>
          <p className="text-xs text-muted-foreground mt-2">Recommended size: 200x200px, PNG or JPG</p>
        </div>
      </div>
      
      <div className="flex justify-end">
        <Button type="submit" disabled={!isDirty || !isValid}>
          <Save className="h-4 w-4 mr-2" />
          Save Company Information
        </Button>
      </div>
    </form>
  );
}
