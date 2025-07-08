import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Mail, MessageSquare, Users, Send, Filter, Search } from 'lucide-react';
import { toast } from 'sonner';
import { useData } from '@/contexts/data/DataContext';

export default function BulkCommunication() {
  const { customers } = useData();
  const [selectedCustomers, setSelectedCustomers] = useState<string[]>([]);
  const [communicationType, setCommunicationType] = useState<'email' | 'sms'>('email');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all');

  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         customer.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         customer.phone?.includes(searchQuery);
    
    const matchesFilter = filter === 'all' || 
                         (filter === 'with-outstanding' && customer.outstandingBalance && customer.outstandingBalance > 0) ||
                         (filter === 'active' && customer.isActive);
    
    return matchesSearch && matchesFilter;
  });

  const handleSelectAll = () => {
    if (selectedCustomers.length === filteredCustomers.length) {
      setSelectedCustomers([]);
    } else {
      setSelectedCustomers(filteredCustomers.map(c => c.id));
    }
  };

  const handleSelectCustomer = (customerId: string) => {
    setSelectedCustomers(prev => 
      prev.includes(customerId) 
        ? prev.filter(id => id !== customerId)
        : [...prev, customerId]
    );
  };

  const handleSendCommunication = () => {
    if (selectedCustomers.length === 0) {
      toast.error('Please select at least one customer');
      return;
    }

    if (!message.trim()) {
      toast.error('Please enter a message');
      return;
    }

    if (communicationType === 'email' && !subject.trim()) {
      toast.error('Please enter an email subject');
      return;
    }

    // Simulate sending
    toast.success(`${communicationType === 'email' ? 'Emails' : 'SMS messages'} sent to ${selectedCustomers.length} customers successfully!`);
    
    // Reset form
    setSelectedCustomers([]);
    setSubject('');
    setMessage('');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gradient-aurora">
            Bulk Communication
          </h1>
          <p className="text-muted-foreground">Send emails or SMS to multiple customers at once</p>
        </div>
        <Button onClick={handleSendCommunication} className="aurora-button">
          <Send className="mr-2 h-4 w-4" />
          Send to {selectedCustomers.length} Customer{selectedCustomers.length !== 1 ? 's' : ''}
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="aurora-card">
          <CardHeader>
            <CardTitle>Message Details</CardTitle>
            <CardDescription>Compose your message for bulk sending</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Communication Type</Label>
              <Select value={communicationType} onValueChange={(value: any) => setCommunicationType(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="email">
                    <div className="flex items-center">
                      <Mail className="mr-2 h-4 w-4" />
                      Email
                    </div>
                  </SelectItem>
                  <SelectItem value="sms">
                    <div className="flex items-center">
                      <MessageSquare className="mr-2 h-4 w-4" />
                      SMS
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {communicationType === 'email' && (
              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Enter email subject"
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={`Enter your ${communicationType} message...`}
                rows={communicationType === 'email' ? 8 : 4}
              />
              <p className="text-sm text-muted-foreground">
                You can use variables like {`{{customerName}}, {{outstandingBalance}}`}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="aurora-card">
          <CardHeader>
            <CardTitle>Recipients Summary</CardTitle>
            <CardDescription>Overview of selected customers</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-primary/10 rounded-lg">
                  <div className="text-2xl font-bold text-primary">{selectedCustomers.length}</div>
                  <div className="text-sm text-muted-foreground">Selected</div>
                </div>
                <div className="text-center p-4 bg-secondary/10 rounded-lg">
                  <div className="text-2xl font-bold text-secondary">{filteredCustomers.length}</div>
                  <div className="text-sm text-muted-foreground">Total Customers</div>
                </div>
              </div>
              
              {selectedCustomers.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium">Selected Customers:</h4>
                  <div className="max-h-32 overflow-y-auto space-y-1">
                    {selectedCustomers.slice(0, 5).map(id => {
                      const customer = customers.find(c => c.id === id);
                      return customer ? (
                        <div key={id} className="text-sm bg-muted p-2 rounded">
                          {customer.name}
                        </div>
                      ) : null;
                    })}
                    {selectedCustomers.length > 5 && (
                      <div className="text-sm text-muted-foreground">
                        +{selectedCustomers.length - 5} more...
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="aurora-card">
        <CardHeader>
          <CardTitle>Select Customers</CardTitle>
          <CardDescription>Choose customers to send your message to</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search customers..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Select value={filter} onValueChange={setFilter}>
                <SelectTrigger className="w-48">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Customers</SelectItem>
                  <SelectItem value="active">Active Only</SelectItem>
                  <SelectItem value="with-outstanding">With Outstanding</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Table className="aurora-table">
              <TableHeader>
                <TableRow className="aurora-table-header">
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selectedCustomers.length === filteredCustomers.length && filteredCustomers.length > 0}
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Outstanding</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCustomers.map((customer) => (
                  <TableRow key={customer.id} className="aurora-table-row">
                    <TableCell>
                      <Checkbox
                        checked={selectedCustomers.includes(customer.id)}
                        onCheckedChange={() => handleSelectCustomer(customer.id)}
                      />
                    </TableCell>
                    <TableCell className="font-medium">{customer.name}</TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {customer.email && <div className="text-sm">{customer.email}</div>}
                        {customer.phone && <div className="text-sm text-muted-foreground">{customer.phone}</div>}
                      </div>
                    </TableCell>
                    <TableCell>
                      {customer.outstandingBalance ? (
                        <span className="font-medium text-orange-500">
                          ₹{customer.outstandingBalance.toFixed(2)}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">₹0.00</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={customer.isActive ? "default" : "secondary"}>
                        {customer.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}