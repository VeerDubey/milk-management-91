
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Mail, 
  MessageSquare, 
  Send, 
  Users, 
  CheckCircle, 
  Clock, 
  Calendar, 
  Bell, 
  UploadCloud
} from "lucide-react";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useData } from "@/contexts/data/DataContext";

const Communication = () => {
  const { customers } = useData();
  const [emailSubject, setEmailSubject] = useState("");
  const [emailContent, setEmailContent] = useState("");
  const [selectedCustomers, setSelectedCustomers] = useState<string[]>([]);
  const [emailTemplate, setEmailTemplate] = useState("");
  const [scheduleEnabled, setScheduleEnabled] = useState(false);
  const [scheduledDate, setScheduledDate] = useState("");

  // Email templates
  const emailTemplates = [
    { id: "1", name: "Payment Reminder", subject: "Payment Reminder for Invoice #[INVOICE_NUMBER]" },
    { id: "2", name: "Order Confirmation", subject: "Your Order has been confirmed" },
    { id: "3", name: "Monthly Statement", subject: "Your Monthly Statement" },
    { id: "4", name: "Seasonal Greetings", subject: "Season's Greetings from Vikas Milk Center" },
  ];

  const handleSelectAll = () => {
    if (selectedCustomers.length === customers.length) {
      setSelectedCustomers([]);
    } else {
      setSelectedCustomers(customers.map(c => c.id));
    }
  };

  const handleSelectCustomer = (customerId: string) => {
    if (selectedCustomers.includes(customerId)) {
      setSelectedCustomers(selectedCustomers.filter(id => id !== customerId));
    } else {
      setSelectedCustomers([...selectedCustomers, customerId]);
    }
  };

  const handleLoadTemplate = (templateId: string) => {
    const template = emailTemplates.find(t => t.id === templateId);
    if (template) {
      setEmailSubject(template.subject);
      setEmailTemplate(templateId);
      
      // Set template content based on which template was selected
      switch(templateId) {
        case "1":
          setEmailContent("Dear [Customer Name],\n\nThis is a reminder that invoice #[INVOICE_NUMBER] for Rs.[AMOUNT] is due on [DUE_DATE].\n\nPlease arrange for payment at your earliest convenience.\n\nThank you,\nVikas Milk Center");
          break;
        case "2":
          setEmailContent("Dear [Customer Name],\n\nYour order #[ORDER_NUMBER] has been confirmed and will be delivered on [DELIVERY_DATE].\n\nOrder Details:\n[ORDER_DETAILS]\n\nThank you for your business.\n\nRegards,\nVikas Milk Center");
          break;
        case "3":
          setEmailContent("Dear [Customer Name],\n\nPlease find attached your monthly statement for the period of [START_DATE] to [END_DATE].\n\nTotal amount: Rs.[TOTAL_AMOUNT]\nPaid: Rs.[PAID_AMOUNT]\nOutstanding: Rs.[OUTSTANDING_AMOUNT]\n\nPlease contact us if you have any questions.\n\nRegards,\nVikas Milk Center");
          break;
        case "4":
          setEmailContent("Dear [Customer Name],\n\nWe would like to wish you and your family a joyous and prosperous festival season.\n\nThank you for your continued support.\n\nWarm Regards,\nVikas Milk Center");
          break;
        default:
          setEmailContent("");
      }
      
      toast.success(`Template "${template.name}" loaded`);
    }
  };

  const handleSendEmail = () => {
    if (selectedCustomers.length === 0) {
      toast.error("Please select at least one recipient");
      return;
    }

    if (!emailSubject.trim()) {
      toast.error("Please enter an email subject");
      return;
    }

    if (!emailContent.trim()) {
      toast.error("Please enter email content");
      return;
    }

    if (scheduleEnabled && !scheduledDate) {
      toast.error("Please select a date and time for the scheduled email");
      return;
    }

    const selectedCustomerNames = customers
      .filter(c => selectedCustomers.includes(c.id))
      .map(c => c.name)
      .join(", ");

    if (scheduleEnabled) {
      toast.success(`Email scheduled to be sent to ${selectedCustomers.length} customer(s) on ${new Date(scheduledDate).toLocaleString()}`);
    } else {
      toast.success(`Email sent to ${selectedCustomers.length} customer(s)`);
    }
    
    // Reset form
    setEmailContent("");
    setEmailSubject("");
    setSelectedCustomers([]);
    setEmailTemplate("");
    setScheduleEnabled(false);
    setScheduledDate("");
  };

  const handleSendSMS = () => {
    if (selectedCustomers.length === 0) {
      toast.error("Please select at least one recipient");
      return;
    }

    if (!emailContent.trim()) {
      toast.error("Please enter SMS content");
      return;
    }

    toast.success(`SMS sent to ${selectedCustomers.length} customer(s)`);
    // Reset form
    setEmailContent("");
    setSelectedCustomers([]);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Communication Center</h1>
        <p className="text-muted-foreground">Manage communications with your customers</p>
      </div>

      <Tabs defaultValue="email" className="space-y-4">
        <TabsList className="grid grid-cols-3 w-full max-w-md">
          <TabsTrigger value="email" className="flex items-center gap-2">
            <Mail className="h-4 w-4" /> Email
          </TabsTrigger>
          <TabsTrigger value="sms" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" /> SMS
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <Clock className="h-4 w-4" /> History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="email" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="md:col-span-2 bg-gradient-to-br from-blue-900 to-indigo-800 text-white border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Mail className="h-5 w-5" /> 
                  Compose Email
                </CardTitle>
                <CardDescription className="text-gray-300">
                  Create and send emails to your customers
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Label htmlFor="template" className="text-white">Template:</Label>
                      <Select value={emailTemplate} onValueChange={handleLoadTemplate}>
                        <SelectTrigger className="w-[220px] bg-white/10 text-white border-gray-600">
                          <SelectValue placeholder="Select template" />
                        </SelectTrigger>
                        <SelectContent>
                          {emailTemplates.map(template => (
                            <SelectItem key={template.id} value={template.id}>
                              {template.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" className="bg-white/10 hover:bg-white/20 text-white">
                          Manage Templates
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Email Templates</DialogTitle>
                          <DialogDescription>
                            Manage your email templates for quick communications.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="py-4">
                          <div className="space-y-4">
                            {emailTemplates.map(template => (
                              <div key={template.id} className="flex items-center justify-between p-2 border rounded-md">
                                <div>
                                  <p className="font-medium">{template.name}</p>
                                  <p className="text-sm text-muted-foreground">{template.subject}</p>
                                </div>
                                <div className="flex gap-2">
                                  <Button size="sm" variant="ghost">Edit</Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                        <DialogFooter>
                          <Button variant="outline">Add New Template</Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                  
                  <div>
                    <Label htmlFor="subject" className="text-white">Subject:</Label>
                    <Input 
                      id="subject" 
                      value={emailSubject} 
                      onChange={e => setEmailSubject(e.target.value)}
                      placeholder="Enter email subject" 
                      className="bg-white/10 text-white border-gray-600 mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="content" className="text-white">Email Content:</Label>
                    <Textarea 
                      id="content" 
                      value={emailContent} 
                      onChange={e => setEmailContent(e.target.value)} 
                      placeholder="Write your email content here..."
                      className="min-h-[200px] bg-white/10 text-white border-gray-600 mt-1"
                    />
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="schedule"
                      checked={scheduleEnabled}
                      onCheckedChange={setScheduleEnabled}
                    />
                    <Label htmlFor="schedule" className="text-white">Schedule for later</Label>
                    
                    {scheduleEnabled && (
                      <div className="flex items-center ml-4 space-x-2">
                        <Input
                          type="datetime-local"
                          value={scheduledDate}
                          onChange={(e) => setScheduledDate(e.target.value)}
                          className="bg-white/10 text-white border-gray-600"
                        />
                      </div>
                    )}
                  </div>
                  
                  <Button 
                    onClick={handleSendEmail}
                    className="w-full mt-2 bg-green-600 hover:bg-green-700"
                  >
                    <Send className="mr-2 h-4 w-4" />
                    {scheduleEnabled ? "Schedule Email" : "Send Email"}
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-gray-900 to-gray-800 text-white border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" /> 
                  Recipients
                </CardTitle>
                <CardDescription className="text-gray-300">
                  Select customers to send to
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between mb-3">
                    <Button 
                      onClick={handleSelectAll}
                      variant="outline" 
                      size="sm"
                      className="bg-white/10 hover:bg-white/20 text-white"
                    >
                      {selectedCustomers.length === customers.length ? "Deselect All" : "Select All"}
                    </Button>
                  </div>
                  
                  <div className="bg-black/20 rounded-md p-2 max-h-[300px] overflow-y-auto scrollbar-thin">
                    {customers.map(customer => (
                      <div 
                        key={customer.id}
                        onClick={() => handleSelectCustomer(customer.id)}
                        className={`flex items-center justify-between p-2 rounded-md cursor-pointer mb-1 ${
                          selectedCustomers.includes(customer.id) 
                            ? "bg-blue-500/20" 
                            : "hover:bg-white/10"
                        }`}
                      >
                        <div className="flex items-center">
                          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-green-400 to-cyan-500 flex items-center justify-center text-white font-medium">
                            {customer.name.charAt(0)}
                          </div>
                          <div className="ml-3">
                            <p className="font-medium">{customer.name}</p>
                            <p className="text-xs text-gray-400">{customer.email || 'No email'}</p>
                          </div>
                        </div>
                        
                        {selectedCustomers.includes(customer.id) && (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        )}
                      </div>
                    ))}

                    {customers.length === 0 && (
                      <div className="p-4 text-center text-muted-foreground">
                        No customers found
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-4 pt-2 border-t border-gray-700">
                    <p className="text-sm text-white">
                      <span className="font-medium">{selectedCustomers.length}</span> of {customers.length} customers selected
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="sms" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="md:col-span-2 bg-gradient-to-br from-gray-900 to-gray-800 text-white border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" /> 
                  Compose SMS
                </CardTitle>
                <CardDescription className="text-gray-300">
                  Create and send SMS messages to your customers
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="sms-content" className="text-white">Message Content:</Label>
                  <Textarea 
                    id="sms-content" 
                    value={emailContent} 
                    onChange={e => setEmailContent(e.target.value)} 
                    placeholder="Write your SMS content here (160 characters max for standard SMS)"
                    className="min-h-[150px] bg-white/10 text-white border-gray-600 mt-1"
                  />
                  <div className="flex justify-between mt-1">
                    <p className="text-xs text-gray-400">
                      {emailContent.length} / 160 characters
                    </p>
                    <p className="text-xs text-gray-400">
                      Messages: {Math.ceil(emailContent.length / 160) || 1}
                    </p>
                  </div>
                </div>
                
                <Button 
                  onClick={handleSendSMS}
                  className="w-full mt-2 bg-green-600 hover:bg-green-700"
                >
                  <Send className="mr-2 h-4 w-4" />
                  Send SMS
                </Button>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-indigo-900/90 to-purple-900/90 text-white border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" /> 
                  Recipients
                </CardTitle>
                <CardDescription className="text-gray-300">
                  Select customers to send to
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between mb-3">
                    <Button 
                      onClick={handleSelectAll}
                      variant="outline" 
                      size="sm"
                      className="bg-white/10 hover:bg-white/20 text-white"
                    >
                      {selectedCustomers.length === customers.length ? "Deselect All" : "Select All"}
                    </Button>
                  </div>
                  
                  <div className="bg-black/20 rounded-md p-2 max-h-[300px] overflow-y-auto scrollbar-thin">
                    {customers.map(customer => (
                      <div 
                        key={customer.id}
                        onClick={() => handleSelectCustomer(customer.id)}
                        className={`flex items-center justify-between p-2 rounded-md cursor-pointer mb-1 ${
                          selectedCustomers.includes(customer.id) 
                            ? "bg-blue-500/20" 
                            : "hover:bg-white/10"
                        }`}
                      >
                        <div className="flex items-center">
                          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-green-400 to-cyan-500 flex items-center justify-center text-white font-medium">
                            {customer.name.charAt(0)}
                          </div>
                          <div className="ml-3">
                            <p className="font-medium">{customer.name}</p>
                            <p className="text-xs text-gray-400">{customer.phone || 'No phone'}</p>
                          </div>
                        </div>
                        
                        {selectedCustomers.includes(customer.id) && (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        )}
                      </div>
                    ))}

                    {customers.length === 0 && (
                      <div className="p-4 text-center text-muted-foreground">
                        No customers found
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-4 pt-2 border-t border-gray-700">
                    <p className="text-sm text-white">
                      <span className="font-medium">{selectedCustomers.length}</span> of {customers.length} customers selected
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card className="bg-gradient-to-br from-gray-900 to-gray-800 text-white border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" /> 
                Communication History
              </CardTitle>
              <CardDescription className="text-gray-300">
                View past emails and SMS sent to your customers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex space-x-2">
                    <Button variant="outline" className="bg-white/10 hover:bg-white/20 text-white">
                      All
                    </Button>
                    <Button variant="outline" className="bg-white/10 hover:bg-white/20 text-white">
                      Email
                    </Button>
                    <Button variant="outline" className="bg-white/10 hover:bg-white/20 text-white">
                      SMS
                    </Button>
                  </div>
                </div>
                
                <div className="rounded-md overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-black/20">
                      <tr>
                        <th className="py-3 px-4 text-left text-sm text-white font-medium">Date & Time</th>
                        <th className="py-3 px-4 text-left text-sm text-white font-medium">Type</th>
                        <th className="py-3 px-4 text-left text-sm text-white font-medium">Recipients</th>
                        <th className="py-3 px-4 text-left text-sm text-white font-medium">Subject/Content</th>
                        <th className="py-3 px-4 text-left text-sm text-white font-medium">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700">
                      <tr className="bg-white/5 hover:bg-white/10">
                        <td className="py-3 px-4 text-sm text-white">2025-05-15 09:30</td>
                        <td className="py-3 px-4">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-500/20 text-blue-400">
                            <Mail className="h-3 w-3 mr-1" /> Email
                          </span>
                        </td>
                        <td className="py-3 px-4 text-sm text-white">12 customers</td>
                        <td className="py-3 px-4 text-sm text-white">Payment Reminder - May</td>
                        <td className="py-3 px-4">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-500/20 text-green-400">
                            <CheckCircle className="h-3 w-3 mr-1" /> Sent
                          </span>
                        </td>
                      </tr>
                      <tr className="bg-white/5 hover:bg-white/10">
                        <td className="py-3 px-4 text-sm text-white">2025-05-14 14:15</td>
                        <td className="py-3 px-4">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-500/20 text-purple-400">
                            <MessageSquare className="h-3 w-3 mr-1" /> SMS
                          </span>
                        </td>
                        <td className="py-3 px-4 text-sm text-white">5 customers</td>
                        <td className="py-3 px-4 text-sm text-white">Order delivery notification</td>
                        <td className="py-3 px-4">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-500/20 text-green-400">
                            <CheckCircle className="h-3 w-3 mr-1" /> Sent
                          </span>
                        </td>
                      </tr>
                      <tr className="bg-white/5 hover:bg-white/10">
                        <td className="py-3 px-4 text-sm text-white">2025-05-20 11:45</td>
                        <td className="py-3 px-4">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-500/20 text-blue-400">
                            <Mail className="h-3 w-3 mr-1" /> Email
                          </span>
                        </td>
                        <td className="py-3 px-4 text-sm text-white">All customers</td>
                        <td className="py-3 px-4 text-sm text-white">Monthly newsletter</td>
                        <td className="py-3 px-4">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-500/20 text-amber-400">
                            <Clock className="h-3 w-3 mr-1" /> Scheduled
                          </span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Communication;
