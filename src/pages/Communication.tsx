import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Mail, MessageSquare, Send, Users, Calendar, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useData } from '@/contexts/data/DataContext';

interface CommunicationRecord {
  id: string;
  type: 'email' | 'sms';
  subject?: string;
  message: string;
  recipientCount: number;
  status: 'sent' | 'pending' | 'failed';
  sentAt: string;
  sentBy: string;
}

export default function Communication() {
  const { customers } = useData();
  const [records, setRecords] = useState<CommunicationRecord[]>([
    {
      id: '1',
      type: 'email',
      subject: 'Monthly Newsletter - March 2024',
      message: 'Dear customers, here are our latest updates...',
      recipientCount: 156,
      status: 'sent',
      sentAt: '2024-03-15T10:30:00',
      sentBy: 'Admin'
    },
    {
      id: '2',
      type: 'sms',
      message: 'Your order has been delivered. Thank you!',
      recipientCount: 45,
      status: 'sent',
      sentAt: '2024-03-14T16:45:00',
      sentBy: 'System'
    },
    {
      id: '3',
      type: 'email',
      subject: 'Payment Reminder',
      message: 'This is a friendly reminder about your pending payment...',
      recipientCount: 23,
      status: 'pending',
      sentAt: '2024-03-14T09:00:00',
      sentBy: 'Admin'
    }
  ]);

  const [activeTab, setActiveTab] = useState<'compose' | 'history'>('compose');
  const [formData, setFormData] = useState({
    type: 'email' as 'email' | 'sms',
    subject: '',
    message: '',
    recipientType: 'all' as 'all' | 'outstanding' | 'active'
  });

  const getRecipientCount = () => {
    switch (formData.recipientType) {
      case 'outstanding':
        return customers.filter(c => c.outstandingBalance && c.outstandingBalance > 0).length;
      case 'active':
        return customers.filter(c => c.isActive).length;
      default:
        return customers.length;
    }
  };

  const handleSendMessage = () => {
    if (!formData.message.trim()) {
      toast.error('Please enter a message');
      return;
    }

    if (formData.type === 'email' && !formData.subject.trim()) {
      toast.error('Please enter an email subject');
      return;
    }

    const newRecord: CommunicationRecord = {
      id: Date.now().toString(),
      type: formData.type,
      subject: formData.type === 'email' ? formData.subject : undefined,
      message: formData.message,
      recipientCount: getRecipientCount(),
      status: 'sent',
      sentAt: new Date().toISOString(),
      sentBy: 'Admin'
    };

    setRecords([newRecord, ...records]);
    setFormData({ type: 'email', subject: '', message: '', recipientType: 'all' });
    toast.success(`${formData.type === 'email' ? 'Email' : 'SMS'} sent successfully to ${getRecipientCount()} customers!`);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'pending':
        return <Calendar className="h-4 w-4 text-yellow-500" />;
      case 'failed':
        return <Mail className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gradient-aurora">
            Communication Center
          </h1>
          <p className="text-muted-foreground">Send messages and track communication history</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant={activeTab === 'compose' ? 'default' : 'outline'}
            onClick={() => setActiveTab('compose')}
          >
            <Send className="mr-2 h-4 w-4" />
            Compose
          </Button>
          <Button 
            variant={activeTab === 'history' ? 'default' : 'outline'}
            onClick={() => setActiveTab('history')}
          >
            <Calendar className="mr-2 h-4 w-4" />
            History
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        <Card className="aurora-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Customers</p>
                <p className="text-2xl font-bold text-primary">{customers.length}</p>
              </div>
              <Users className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="aurora-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Emails Sent</p>
                <p className="text-2xl font-bold text-blue-500">
                  {records.filter(r => r.type === 'email' && r.status === 'sent').length}
                </p>
              </div>
              <Mail className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="aurora-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">SMS Sent</p>
                <p className="text-2xl font-bold text-green-500">
                  {records.filter(r => r.type === 'sms' && r.status === 'sent').length}
                </p>
              </div>
              <MessageSquare className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="aurora-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Recipients</p>
                <p className="text-2xl font-bold text-orange-500">
                  {records.reduce((sum, record) => sum + record.recipientCount, 0)}
                </p>
              </div>
              <Users className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {activeTab === 'compose' ? (
        <Card className="aurora-card">
          <CardHeader>
            <CardTitle>Compose Message</CardTitle>
            <CardDescription>Send emails or SMS to your customers</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Message Type</Label>
                <Select value={formData.type} onValueChange={(value: any) => setFormData({...formData, type: value})}>
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

              <div className="space-y-2">
                <Label>Recipients</Label>
                <Select value={formData.recipientType} onValueChange={(value: any) => setFormData({...formData, recipientType: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Customers ({customers.length})</SelectItem>
                    <SelectItem value="active">Active Customers ({customers.filter(c => c.isActive).length})</SelectItem>
                    <SelectItem value="outstanding">
                      With Outstanding ({customers.filter(c => c.outstandingBalance && c.outstandingBalance > 0).length})
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {formData.type === 'email' && (
              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  value={formData.subject}
                  onChange={(e) => setFormData({...formData, subject: e.target.value})}
                  placeholder="Enter email subject"
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                value={formData.message}
                onChange={(e) => setFormData({...formData, message: e.target.value})}
                placeholder={`Enter your ${formData.type} message...`}
                rows={formData.type === 'email' ? 6 : 3}
              />
              <p className="text-sm text-muted-foreground">
                Recipients: {getRecipientCount()} customers
              </p>
            </div>

            <Button onClick={handleSendMessage} className="aurora-button">
              <Send className="mr-2 h-4 w-4" />
              Send {formData.type === 'email' ? 'Email' : 'SMS'} to {getRecipientCount()} Customer{getRecipientCount() !== 1 ? 's' : ''}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card className="aurora-card">
          <CardHeader>
            <CardTitle>Communication History</CardTitle>
            <CardDescription>View all sent messages and their status</CardDescription>
          </CardHeader>
          <CardContent>
            <Table className="aurora-table">
              <TableHeader>
                <TableRow className="aurora-table-header">
                  <TableHead>Type</TableHead>
                  <TableHead>Subject/Message</TableHead>
                  <TableHead>Recipients</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Sent Date</TableHead>
                  <TableHead>Sent By</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {records.map((record) => (
                  <TableRow key={record.id} className="aurora-table-row">
                    <TableCell>
                      <div className="flex items-center">
                        {record.type === 'email' ? <Mail className="mr-2 h-4 w-4" /> : <MessageSquare className="mr-2 h-4 w-4" />}
                        <Badge variant="outline">{record.type.toUpperCase()}</Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        {record.subject && <div className="font-medium">{record.subject}</div>}
                        <div className="text-sm text-muted-foreground truncate max-w-xs">
                          {record.message}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{record.recipientCount}</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        {getStatusIcon(record.status)}
                        <Badge variant={record.status === 'sent' ? 'default' : record.status === 'pending' ? 'secondary' : 'destructive'} className="ml-2">
                          {record.status}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>{formatDate(record.sentAt)}</TableCell>
                    <TableCell>{record.sentBy}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}