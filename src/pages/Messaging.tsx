
import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TemplateManager } from "@/components/messaging/TemplateManager";
import { MessageSender } from "@/components/messaging/MessageSender";
import { MessageScheduler } from "@/components/messaging/MessageScheduler";
import { useData } from '@/contexts/data/DataContext';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Download, Search, UserSearch, Filter } from "lucide-react";
import { MessagingProvider } from "@/contexts/MessagingContext";
import { exportToExcel } from "@/utils/excelUtils";

const Messaging = () => {
  const { customers } = useData();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);

  const filteredCustomers = customers.filter(customer => 
    customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (customer.phone && customer.phone.includes(searchQuery)) ||
    (customer.email && customer.email.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const selectedCustomer = selectedCustomerId 
    ? customers.find(c => c.id === selectedCustomerId) 
    : null;

  const exportCustomerContacts = () => {
    const headers = ["Name", "Phone", "Email"];
    const data = filteredCustomers.map(customer => [
      customer.name,
      customer.phone || "",
      customer.email || ""
    ]);
    exportToExcel(headers, data, "customer_contacts.xlsx");
  };

  return (
    <MessagingProvider>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Messaging</h1>
            <p className="text-muted-foreground">
              Send messages to customers via SMS, WhatsApp, and Email
            </p>
          </div>
          <Button 
            variant="outline" 
            size="sm"
            onClick={exportCustomerContacts}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Export Contacts
          </Button>
        </div>

        <Tabs defaultValue="messages" className="space-y-4">
          <TabsList>
            <TabsTrigger value="messages">Send Messages</TabsTrigger>
            <TabsTrigger value="scheduler">Schedule Messages</TabsTrigger>
            <TabsTrigger value="templates">Manage Templates</TabsTrigger>
          </TabsList>
          
          <TabsContent value="messages" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="md:col-span-1">
                <CardHeader>
                  <CardTitle>Select Customer</CardTitle>
                  <CardDescription>
                    Choose a customer to message
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      className="pl-8"
                      placeholder="Search customers..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  
                  <div className="border rounded-md overflow-hidden max-h-[400px] overflow-y-auto">
                    {filteredCustomers.length === 0 ? (
                      <div className="p-4 text-center text-muted-foreground">
                        No customers found
                      </div>
                    ) : (
                      <div className="divide-y">
                        {filteredCustomers.map((customer) => (
                          <div
                            key={customer.id}
                            className={`p-3 cursor-pointer transition-colors ${
                              selectedCustomerId === customer.id
                                ? "bg-primary text-primary-foreground"
                                : "hover:bg-muted"
                            }`}
                            onClick={() => setSelectedCustomerId(customer.id)}
                          >
                            <div className="font-medium">{customer.name}</div>
                            <div className="text-sm opacity-80">
                              {customer.phone && (
                                <div>{customer.phone}</div>
                              )}
                              {customer.email && (
                                <div>{customer.email}</div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <div className="md:col-span-2">
                {selectedCustomer ? (
                  <MessageSender
                    recipient={{
                      name: selectedCustomer.name,
                      phone: selectedCustomer.phone,
                      email: selectedCustomer.email,
                    }}
                  />
                ) : (
                  <Card className="h-full flex items-center justify-center text-center p-8">
                    <div className="space-y-3">
                      <UserSearch className="h-12 w-12 mx-auto text-muted-foreground" />
                      <h3 className="text-lg font-medium">No Customer Selected</h3>
                      <p className="text-muted-foreground">
                        Select a customer from the list to compose a message
                      </p>
                    </div>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="scheduler">
            <MessageScheduler />
          </TabsContent>
          
          <TabsContent value="templates">
            <TemplateManager />
          </TabsContent>
        </Tabs>
      </div>
    </MessagingProvider>
  );
};

export default Messaging;
