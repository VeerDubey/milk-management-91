
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  MessageSquare, 
  Mail, 
  Phone, 
  Send, 
  Users, 
  FileText,
  Plus,
  Filter
} from 'lucide-react';
import { useData } from '@/contexts/data/DataContext';
import MessageComposer from '@/components/messaging/MessageComposer';
import { toast } from 'sonner';

export default function Messaging() {
  const { customers } = useData();
  const [composerOpen, setComposerOpen] = useState(false);
  const [selectedChannel, setSelectedChannel] = useState<'sms' | 'whatsapp' | 'email'>('sms');
  const [preselectedCustomer, setPreselectedCustomer] = useState<string | undefined>();

  const handleQuickMessage = (customerId: string, channel: 'sms' | 'whatsapp' | 'email') => {
    const customer = customers.find(c => c.id === customerId);
    if (!customer) {
      toast.error('Customer not found');
      return;
    }

    if (channel === 'sms' || channel === 'whatsapp') {
      if (!customer.phone) {
        toast.error('Customer phone number not available');
        return;
      }
    } else if (channel === 'email') {
      if (!customer.email) {
        toast.error('Customer email not available');
        return;
      }
    }

    setPreselectedCustomer(customerId);
    setSelectedChannel(channel);
    setComposerOpen(true);
  };

  const handleBulkMessage = (channel: 'sms' | 'whatsapp' | 'email') => {
    setPreselectedCustomer(undefined);
    setSelectedChannel(channel);
    setComposerOpen(true);
  };

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case 'whatsapp': return <MessageSquare className="h-4 w-4" />;
      case 'email': return <Mail className="h-4 w-4" />;
      case 'sms': return <Phone className="h-4 w-4" />;
      default: return <MessageSquare className="h-4 w-4" />;
    }
  };

  const customersWithContact = customers.filter(c => c.phone || c.email);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Messaging</h1>
          <p className="text-muted-foreground">Send SMS, WhatsApp, and email messages to customers</p>
        </div>
        <Button onClick={() => handleBulkMessage('sms')}>
          <Plus className="mr-2 h-4 w-4" />
          New Message
        </Button>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => handleBulkMessage('sms')}>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Phone className="h-5 w-5" />
              SMS
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-2">Send SMS messages</p>
            <Badge variant="secondary">160 characters</Badge>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => handleBulkMessage('whatsapp')}>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <MessageSquare className="h-5 w-5" />
              WhatsApp
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-2">Send WhatsApp messages</p>
            <Badge variant="secondary">Rich content</Badge>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => handleBulkMessage('email')}>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Mail className="h-5 w-5" />
              Email
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-2">Send email messages</p>
            <Badge variant="secondary">Full format</Badge>
          </CardContent>
        </Card>
      </div>

      {/* Customer List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Customers
              </CardTitle>
              <CardDescription>
                Send messages to individual customers
              </CardDescription>
            </div>
            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {customersWithContact.map((customer) => (
              <div 
                key={customer.id} 
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50"
              >
                <div className="flex-1">
                  <h4 className="font-medium">{customer.name}</h4>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    {customer.phone && (
                      <span className="flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        {customer.phone}
                      </span>
                    )}
                    {customer.email && (
                      <span className="flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        {customer.email}
                      </span>
                    )}
                    {customer.outstandingBalance && customer.outstandingBalance > 0 && (
                      <Badge variant="destructive" className="text-xs">
                        Outstanding: ₹{customer.outstandingBalance.toFixed(2)}
                      </Badge>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {customer.phone && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleQuickMessage(customer.id, 'sms')}
                      >
                        <Phone className="h-4 w-4 mr-1" />
                        SMS
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleQuickMessage(customer.id, 'whatsapp')}
                      >
                        <MessageSquare className="h-4 w-4 mr-1" />
                        WhatsApp
                      </Button>
                    </>
                  )}
                  {customer.email && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleQuickMessage(customer.id, 'email')}
                    >
                      <Mail className="h-4 w-4 mr-1" />
                      Email
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Message Composer */}
      <MessageComposer
        isOpen={composerOpen}
        onClose={() => {
          setComposerOpen(false);
          setPreselectedCustomer(undefined);
        }}
        preselectedCustomer={preselectedCustomer}
        channel={selectedChannel}
      />
    </div>
  );
}
