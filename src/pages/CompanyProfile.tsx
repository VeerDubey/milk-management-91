
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Building, MapPin, Phone, Mail, FileText, AtSign, CreditCard } from "lucide-react";
import { toast } from "sonner";

const companyFormSchema = z.object({
  companyName: z.string().min(2, { message: "Company name is required" }),
  address: z.string().min(2, { message: "Address is required" }),
  city: z.string().min(2, { message: "City is required" }),
  state: z.string().min(2, { message: "State is required" }),
  pincode: z.string().min(6, { message: "Valid pincode is required" }),
  contactNumber: z.string().min(10, { message: "Valid contact number is required" }),
  email: z.string().email({ message: "Valid email address is required" }),
  website: z.string().url({ message: "Valid website URL is required" }).optional().or(z.literal("")),
  gstNumber: z.string().min(15, { message: "Valid GST number is required" }).max(15),
  panNumber: z.string().min(10, { message: "Valid PAN is required" }).max(10),
});

const bankFormSchema = z.object({
  bankName: z.string().min(2, { message: "Bank name is required" }),
  accountNumber: z.string().min(5, { message: "Account number is required" }),
  ifscCode: z.string().min(11, { message: "Valid IFSC code is required" }).max(11),
  accountType: z.string().min(1, { message: "Account type is required" }),
  branchName: z.string().min(2, { message: "Branch name is required" }),
  upiId: z.string().optional(),
});

const documentFormSchema = z.object({
  businessRegistrationNumber: z.string().optional(),
  fssaiLicenseNumber: z.string().optional(),
  tradeLicenseNumber: z.string().optional(),
  incorporationDate: z.string().optional(),
});

export default function CompanyProfile() {
  const [activeTab, setActiveTab] = useState("company");
  
  // Company Form
  const companyForm = useForm<z.infer<typeof companyFormSchema>>({
    resolver: zodResolver(companyFormSchema),
    defaultValues: {
      companyName: "Milk Center",
      address: "123 Dairy Lane",
      city: "Milk City",
      state: "Karnataka",
      pincode: "560001",
      contactNumber: "+91 9876543210",
      email: "info@milkcenter.com",
      website: "https://milkcenter.com",
      gstNumber: "29ABCDE1234F1Z5",
      panNumber: "ABCDE1234F",
    }
  });

  // Bank Form  
  const bankForm = useForm<z.infer<typeof bankFormSchema>>({
    resolver: zodResolver(bankFormSchema),
    defaultValues: {
      bankName: "State Bank of India",
      accountNumber: "1234567890",
      ifscCode: "SBIN0000123",
      accountType: "Current",
      branchName: "Milk City Branch",
      upiId: "milkcenter@sbi",
    }
  });

  // Documents Form
  const documentForm = useForm<z.infer<typeof documentFormSchema>>({
    resolver: zodResolver(documentFormSchema),
    defaultValues: {
      businessRegistrationNumber: "UDYAM-KA-12-0012345",
      fssaiLicenseNumber: "10023456789012",
      tradeLicenseNumber: "TLIC/KA/2023/12345",
      incorporationDate: "2020-01-01",
    }
  });

  // Load data from localStorage on mount
  useEffect(() => {
    try {
      // Load company info
      const savedCompanyInfo = localStorage.getItem("companyInfo");
      if (savedCompanyInfo) {
        const parsedData = JSON.parse(savedCompanyInfo);
        // Map saved data to form fields
        companyForm.reset({
          companyName: parsedData.companyName || "",
          address: parsedData.address || "",
          city: parsedData.city || "",
          state: parsedData.state || "",
          pincode: parsedData.pincode || "",
          contactNumber: parsedData.contactNumber || "",
          email: parsedData.email || "",
          website: parsedData.website || "",
          gstNumber: parsedData.gstNumber || "",
          panNumber: parsedData.panNumber || "",
        });
      }

      // Load bank info
      const savedBankInfo = localStorage.getItem("bankInfo");
      if (savedBankInfo) {
        const parsedData = JSON.parse(savedBankInfo);
        bankForm.reset(parsedData);
      }

      // Load document info
      const savedDocumentInfo = localStorage.getItem("documentInfo");
      if (savedDocumentInfo) {
        const parsedData = JSON.parse(savedDocumentInfo);
        documentForm.reset(parsedData);
      }
    } catch (error) {
      console.error("Error loading saved company profile:", error);
    }
  }, []);

  const onCompanySubmit = (data: z.infer<typeof companyFormSchema>) => {
    try {
      // Combine address fields for invoice compatibility
      const companyInfo = {
        ...data,
        // Formatted address for invoice display
        fullAddress: `${data.address}, ${data.city}, ${data.state} - ${data.pincode}`
      };
      
      // Save to localStorage
      localStorage.setItem("companyInfo", JSON.stringify(companyInfo));
      toast.success("Company information saved successfully");
    } catch (error) {
      console.error("Error saving company info:", error);
      toast.error("Failed to save company information");
    }
  };

  const onBankSubmit = (data: z.infer<typeof bankFormSchema>) => {
    try {
      // Save to localStorage
      localStorage.setItem("bankInfo", JSON.stringify(data));
      
      // Format bank details for invoices
      const bankDetailsForInvoice = 
        `Bank Name: ${data.bankName}\n` +
        `Account Number: ${data.accountNumber}\n` +
        `IFSC Code: ${data.ifscCode}\n` +
        `Branch: ${data.branchName}\n` +
        `UPI: ${data.upiId || 'N/A'}`;
      
      // Update existing company info with bank details for invoice
      const companyInfo = JSON.parse(localStorage.getItem("companyInfo") || "{}");
      companyInfo.bankDetails = bankDetailsForInvoice;
      localStorage.setItem("companyInfo", JSON.stringify(companyInfo));
      
      toast.success("Bank information saved successfully");
    } catch (error) {
      console.error("Error saving bank info:", error);
      toast.error("Failed to save bank information");
    }
  };

  const onDocumentSubmit = (data: z.infer<typeof documentFormSchema>) => {
    try {
      // Save to localStorage
      localStorage.setItem("documentInfo", JSON.stringify(data));
      toast.success("Document information saved successfully");
    } catch (error) {
      console.error("Error saving document info:", error);
      toast.error("Failed to save document information");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Company Profile</h1>
        <p className="text-muted-foreground">
          Manage your company information, bank details, and documents
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="company">Company Details</TabsTrigger>
          <TabsTrigger value="banking">Banking Information</TabsTrigger>
          <TabsTrigger value="documents">Documents & Licenses</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
        </TabsList>
        
        <TabsContent value="company">
          <Card>
            <CardHeader>
              <CardTitle>Company Information</CardTitle>
              <CardDescription>
                Update your company details. This information will be used on invoices and reports.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...companyForm}>
                <form onSubmit={companyForm.handleSubmit(onCompanySubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <FormField
                      control={companyForm.control}
                      name="companyName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Company Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter company name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={companyForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter email address" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={companyForm.control}
                      name="contactNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Contact Number</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter contact number" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={companyForm.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Address</FormLabel>
                          <FormControl>
                            <Textarea placeholder="Enter address" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={companyForm.control}
                      name="city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>City</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter city" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={companyForm.control}
                      name="state"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>State</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter state" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={companyForm.control}
                      name="pincode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>PIN Code</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter PIN code" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={companyForm.control}
                      name="website"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Website (Optional)</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter website URL" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={companyForm.control}
                      name="gstNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>GST Number</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter 15-digit GST number" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={companyForm.control}
                      name="panNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>PAN Number</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter 10-character PAN" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <Button type="submit" className="mt-4">Save Company Information</Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="banking">
          <Card>
            <CardHeader>
              <CardTitle>Banking Details</CardTitle>
              <CardDescription>
                Update your banking information. This will appear on your invoices for payments.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...bankForm}>
                <form onSubmit={bankForm.handleSubmit(onBankSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <FormField
                      control={bankForm.control}
                      name="bankName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Bank Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter bank name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={bankForm.control}
                      name="accountNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Account Number</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter account number" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={bankForm.control}
                      name="ifscCode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>IFSC Code</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter 11-character IFSC code" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={bankForm.control}
                      name="accountType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Account Type</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter account type" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={bankForm.control}
                      name="branchName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Branch Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter branch name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={bankForm.control}
                      name="upiId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>UPI ID (Optional)</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter UPI ID" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <Button type="submit" className="mt-4">Save Banking Details</Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents">
          <Card>
            <CardHeader>
              <CardTitle>Documents & Licenses</CardTitle>
              <CardDescription>
                Update your business documents and license information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...documentForm}>
                <form onSubmit={documentForm.handleSubmit(onDocumentSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <FormField
                      control={documentForm.control}
                      name="businessRegistrationNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Business Registration Number</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., UDYAM-XX-XX-XXXXXXX" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={documentForm.control}
                      name="fssaiLicenseNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>FSSAI License Number</FormLabel>
                          <FormControl>
                            <Input placeholder="Food Safety License Number" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={documentForm.control}
                      name="tradeLicenseNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Trade License Number</FormLabel>
                          <FormControl>
                            <Input placeholder="Municipal Trade License Number" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={documentForm.control}
                      name="incorporationDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Date of Incorporation</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <Button type="submit" className="mt-4">Save Document Information</Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preview">
          <Card>
            <CardHeader>
              <CardTitle>Company Profile Preview</CardTitle>
              <CardDescription>
                Preview how your company information will appear
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-8">
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold">
                    {companyForm.getValues().companyName}
                  </h3>
                  <div className="flex items-start space-x-2 text-muted-foreground">
                    <MapPin className="h-4 w-4 mt-0.5" />
                    <div>
                      {companyForm.getValues().address}, {companyForm.getValues().city},<br />
                      {companyForm.getValues().state} - {companyForm.getValues().pincode}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 text-muted-foreground">
                    <Phone className="h-4 w-4" />
                    <span>{companyForm.getValues().contactNumber}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-muted-foreground">
                    <Mail className="h-4 w-4" />
                    <span>{companyForm.getValues().email}</span>
                  </div>
                  {companyForm.getValues().website && (
                    <div className="flex items-center space-x-2 text-muted-foreground">
                      <AtSign className="h-4 w-4" />
                      <span>{companyForm.getValues().website}</span>
                    </div>
                  )}
                  <div className="flex items-center space-x-2 text-muted-foreground">
                    <FileText className="h-4 w-4" />
                    <span>GST: {companyForm.getValues().gstNumber}</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <h3 className="font-semibold">Banking Information</h3>
                  <div className="flex items-center space-x-2 text-muted-foreground">
                    <Building className="h-4 w-4" />
                    <span>{bankForm.getValues().bankName}, {bankForm.getValues().branchName}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-muted-foreground">
                    <CreditCard className="h-4 w-4" />
                    <span>A/C: {bankForm.getValues().accountNumber} ({bankForm.getValues().accountType})</span>
                  </div>
                  <div className="flex items-center space-x-2 text-muted-foreground">
                    <FileText className="h-4 w-4" />
                    <span>IFSC: {bankForm.getValues().ifscCode}</span>
                  </div>
                  {bankForm.getValues().upiId && (
                    <div className="flex items-center space-x-2 text-muted-foreground">
                      <CreditCard className="h-4 w-4" />
                      <span>UPI: {bankForm.getValues().upiId}</span>
                    </div>
                  )}
                </div>

                <div className="space-y-1">
                  <h3 className="font-semibold">Business Documents</h3>
                  <div className="grid grid-cols-2 gap-2 text-muted-foreground text-sm">
                    <div>Business Registration:</div>
                    <div>{documentForm.getValues().businessRegistrationNumber || "Not specified"}</div>
                    
                    <div>FSSAI License:</div>
                    <div>{documentForm.getValues().fssaiLicenseNumber || "Not specified"}</div>
                    
                    <div>Trade License:</div>
                    <div>{documentForm.getValues().tradeLicenseNumber || "Not specified"}</div>
                    
                    <div>Incorporation Date:</div>
                    <div>
                      {documentForm.getValues().incorporationDate 
                        ? new Date(documentForm.getValues().incorporationDate).toLocaleDateString() 
                        : "Not specified"}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
