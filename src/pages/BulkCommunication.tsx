
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { 
  Mail, 
  MessageSquare, 
  Users, 
  Search, 
  Filter, 
  Send, 
  FileSpreadsheet, 
  CheckCircle,
  Upload,
  Calendar,
  AlarmCheck,
  FileUp
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { useData } from "@/contexts/data/DataContext";
import { toast } from "sonner";

const BulkCommunication = () => {
  const { customers } = useData();
  const [selectedCustomers, setSelectedCustomers] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [messageContent, setMessageContent] = useState("");
  const [emailSubject, setEmailSubject] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [scheduleEnabled, setScheduleEnabled] = useState(false);
  const [scheduledDate, setScheduledDate] = useState("");
  const [messageType, setMessageType] = useState<"email" | "sms" | "whatsapp">("email");

  // Filter customers based on search and filter
  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = 
      customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (customer.phone && customer.phone.includes(searchQuery)) ||
      (customer.email && customer.email.toLowerCase().includes(searchQuery.toLowerCase()));
    
    if (!matchesSearch) return false;
    
    if (filter === "all") return true;
    if (filter === "withEmail") return !!customer.email;
    if (filter === "withPhone") return !!customer.phone;
    if (filter === "active") return customer.isActive;
    
    return true;
  });

  // Sample templates
  const templates = {
    email: [
      { id: "e1", name: "Payment Reminder", subject: "Payment Reminder" },
      { id: "e2", name: "Order Confirmation", subject: "Your Order Confirmed" },
      { id: "e3", name: "Monthly Statement", subject: "Monthly Statement" }
    ],
    sms: [
      { id: "s1", name: "Payment Reminder" },
      { id: "s2", name: "Delivery Notification" },
      { id: "s3", name: "New Offer" }
    ],
    whatsapp: [
      { id: "w1", name: "Payment Reminder" },
      { id: "w2", name: "Delivery Update" },
      { id: "w3", name: "Welcome Message" }
    ]
  };

  const handleSelectAll = () => {
    if (selectedCustomers.length === filteredCustomers.length) {
      setSelectedCustomers([]);
    } else {
      setSelectedCustomers(filteredCustomers.map(c => c.id));
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
    setSelectedTemplate(templateId);
    
    // Set appropriate content based on template type and ID
    if (messageType === "email") {
      const template = templates.email.find(t => t.id === templateId);
      if (template) {
        setEmailSubject(template.subject);
        if (templateId === "e1") {
          setMessageContent("Dear [Customer Name],\n\nThis is a reminder that your payment of Rs.[Amount] is due on [Due Date].\n\nPlease arrange for payment at your earliest convenience.\n\nThank you,\nVikas Milk Center");
        } else if (templateId === "e2") {
          setMessageContent("Dear [Customer Name],\n\nYour order has been confirmed and will be delivered on [Delivery Date].\n\nOrder Details:\n[Order Details]\n\nThank you for your business.\n\nRegards,\nVikas Milk Center");
        } else if (templateId === "e3") {
          setMessageContent("Dear [Customer Name],\n\nPlease find attached your monthly statement for [Month].\n\nOutstanding Amount: Rs.[Amount]\n\nKindly settle the amount at your earliest.\n\nRegards,\nVikas Milk Center");
        }
      }
    } else if (messageType === "sms") {
      if (templateId === "s1") {
        setMessageContent("Dear [Customer], your payment of Rs.[Amount] is due. Please settle at your earliest. Thanks, Vikas Milk Center");
      } else if (templateId === "s2") {
        setMessageContent("Dear [Customer], your order will be delivered today. Thank you for your business. - Vikas Milk Center");
      } else if (templateId === "s3") {
        setMessageContent("Vikas Milk Center: Special offer! Get 10% off on all orders placed before [Date]. Call us now!");
      }
    } else if (messageType === "whatsapp") {
      if (templateId === "w1") {
        setMessageContent("Dear [Customer Name],\n\nThis is a gentle reminder about your pending payment of Rs.[Amount]. Please settle this at your earliest convenience.\n\nThank you,\nVikas Milk Center");
      } else if (templateId === "w2") {
        setMessageContent("Dear [Customer Name],\n\nYour order is out for delivery and will arrive today between [Time Range].\n\nThank you for your business.\n\nVikas Milk Center");
      } else if (templateId === "w3") {
        setMessageContent("Dear [Customer Name],\n\nWelcome to Vikas Milk Center! We're delighted to have you as our customer. Feel free to contact us anytime for your dairy product needs.\n\nBest regards,\nVikas Milk Center Team");
      }
    }
    
    toast.success("Template loaded successfully");
  };

  const handleSendMessage = () => {
    if (selectedCustomers.length === 0) {
      toast.error("Please select at least one recipient");
      return;
    }

    if (messageType === "email" && !emailSubject) {
      toast.error("Please enter an email subject");
      return;
    }

    if (!messageContent) {
      toast.error("Please enter message content");
      return;
    }

    if (scheduleEnabled && !scheduledDate) {
      toast.error("Please select a date and time for scheduling");
      return;
    }

    const recipientCount = selectedCustomers.length;
    
    if (scheduleEnabled) {
      toast.success(`${messageType.toUpperCase()} scheduled to be sent to ${recipientCount} customer(s) on ${new Date(scheduledDate).toLocaleString()}`);
    } else {
      toast.success(`${messageType.toUpperCase()} sent to ${recipientCount} customer(s) successfully`);
    }
    
    // Reset form
    setMessageContent("");
    setEmailSubject("");
    setSelectedTemplate("");
    setScheduleEnabled(false);
    setScheduledDate("");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Bulk Communication</h1>
        <p className="text-muted-foreground">
          Send messages to multiple customers at once
        </p>
      </div>

      <Tabs defaultValue="email" className="space-y-4" onValueChange={(value) => setMessageType(value as any)}>
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="email" className="flex items-center gap-2">
            <Mail className="h-4 w-4" /> Email
          </TabsTrigger>
          <TabsTrigger value="sms" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" /> SMS
          </TabsTrigger>
          <TabsTrigger value="whatsapp" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" /> WhatsApp
          </TabsTrigger>
        </TabsList>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          <Card className="md:col-span-4">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Select Recipients
              </CardTitle>
              <CardDescription>
                Choose customers to send messages to
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search..."
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                <Select value={filter} onValueChange={setFilter}>
                  <SelectTrigger className="w-[130px]">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Filter" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="withEmail">With Email</SelectItem>
                    <SelectItem value="withPhone">With Phone</SelectItem>
                    <SelectItem value="active">Active Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSelectAll}
                >
                  {selectedCustomers.length === filteredCustomers.length
                    ? "Deselect All"
                    : "Select All"}
                </Button>
                <span className="text-sm text-muted-foreground">
                  {selectedCustomers.length} selected
                </span>
              </div>

              <div className="border rounded-md h-[400px] overflow-y-auto">
                {filteredCustomers.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-4">
                    <Users className="h-8 w-8 mb-2 opacity-50" />
                    <p>No customers found</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-10"></TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Contact</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredCustomers.map((customer) => (
                        <TableRow key={customer.id} className="cursor-pointer" onClick={() => handleSelectCustomer(customer.id)}>
                          <TableCell className="p-2">
                            <Checkbox
                              checked={selectedCustomers.includes(customer.id)}
                              onCheckedChange={() => handleSelectCustomer(customer.id)}
                              className="pointer-events-none"
                            />
                          </TableCell>
                          <TableCell>{customer.name}</TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              {customer.email && <span className="text-xs">{customer.email}</span>}
                              {customer.phone && <span className="text-xs">{customer.phone}</span>}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </div>

              <div className="flex justify-between items-center">
                <Button variant="outline" size="sm" className="flex items-center gap-2">
                  <FileSpreadsheet className="h-4 w-4" />
                  Import CSV
                </Button>
                
                <Button variant="outline" size="sm" className="flex items-center gap-2">
                  <Upload className="h-4 w-4" />
                  Export List
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="md:col-span-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {messageType === "email" ? (
                  <Mail className="h-5 w-5" />
                ) : messageType === "sms" ? (
                  <MessageSquare className="h-5 w-5" />
                ) : (
                  <MessageSquare className="h-5 w-5" />
                )}
                Compose {messageType === "email" ? "Email" : messageType === "sms" ? "SMS" : "WhatsApp Message"}
              </CardTitle>
              <CardDescription>
                Create your message and send to selected customers
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Label>Template:</Label>
                  <Select
                    value={selectedTemplate}
                    onValueChange={handleLoadTemplate}
                  >
                    <SelectTrigger className="w-[220px]">
                      <SelectValue placeholder="Select template" />
                    </SelectTrigger>
                    <SelectContent>
                      {messageType === "email" ? (
                        templates.email.map((template) => (
                          <SelectItem key={template.id} value={template.id}>
                            {template.name}
                          </SelectItem>
                        ))
                      ) : messageType === "sms" ? (
                        templates.sms.map((template) => (
                          <SelectItem key={template.id} value={template.id}>
                            {template.name}
                          </SelectItem>
                        ))
                      ) : (
                        templates.whatsapp.map((template) => (
                          <SelectItem key={template.id} value={template.id}>
                            {template.name}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-center gap-2">
                  <Label htmlFor="schedule" className="text-right">Schedule:</Label>
                  <Switch
                    id="schedule"
                    checked={scheduleEnabled}
                    onCheckedChange={setScheduleEnabled}
                  />
                </div>
              </div>

              {scheduleEnabled && (
                <div className="flex items-center space-x-4 bg-muted p-3 rounded-md">
                  <Calendar className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                  <div className="flex-1">
                    <Label htmlFor="scheduled-date">Scheduled Date & Time</Label>
                    <Input
                      id="scheduled-date"
                      type="datetime-local"
                      value={scheduledDate}
                      onChange={(e) => setScheduledDate(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                </div>
              )}

              {messageType === "email" && (
                <div>
                  <Label htmlFor="subject">Subject</Label>
                  <Input
                    id="subject"
                    value={emailSubject}
                    onChange={(e) => setEmailSubject(e.target.value)}
                    placeholder="Enter email subject"
                    className="mt-1"
                  />
                </div>
              )}

              <div>
                <Label htmlFor="content">Message Content</Label>
                <Textarea
                  id="content"
                  value={messageContent}
                  onChange={(e) => setMessageContent(e.target.value)}
                  placeholder={`Write your ${messageType} content here...`}
                  className="min-h-[200px] mt-1"
                />
                {messageType === "sms" && (
                  <div className="flex justify-between mt-1 text-xs text-muted-foreground">
                    <span>{messageContent.length} characters</span>
                    <span>Messages: {Math.ceil(messageContent.length / 160) || 1}</span>
                  </div>
                )}
              </div>

              <div className="bg-muted p-3 rounded-md">
                <p className="text-sm font-medium mb-1">Message will be sent to:</p>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{selectedCustomers.length} customers selected</Badge>
                  {messageType === "email" && (
                    <Badge variant="outline" className="bg-blue-100">Via Email</Badge>
                  )}
                  {messageType === "sms" && (
                    <Badge variant="outline" className="bg-green-100">Via SMS</Badge>
                  )}
                  {messageType === "whatsapp" && (
                    <Badge variant="outline" className="bg-green-100">Via WhatsApp</Badge>
                  )}
                  {scheduleEnabled && (
                    <Badge variant="outline" className="bg-amber-100 flex items-center gap-1">
                      <AlarmCheck className="h-3 w-3" /> Scheduled
                    </Badge>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => {
                  setMessageContent("");
                  setEmailSubject("");
                  setSelectedTemplate("");
                }}>
                  Clear
                </Button>
                <Button 
                  onClick={handleSendMessage}
                  className="gap-2"
                  disabled={selectedCustomers.length === 0 || !messageContent || (messageType === "email" && !emailSubject)}
                >
                  {scheduleEnabled ? (
                    <>
                      <Calendar className="h-4 w-4" />
                      Schedule
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      Send Now
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </Tabs>
    </div>
  );
};

export default BulkCommunication;
