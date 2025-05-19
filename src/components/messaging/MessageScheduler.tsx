
import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { useMessaging } from "@/contexts/MessagingContext";
import { CalendarIcon, Clock, Plus, X } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ScheduledMessage {
  id: string;
  recipientName: string;
  recipientPhone?: string;
  recipientEmail?: string;
  content: string;
  channels: string[];
  scheduledDate: Date;
  scheduledTime: string;
  status: "pending" | "sent" | "failed";
}

export function MessageScheduler() {
  const { templates } = useMessaging();
  const [scheduledMessages, setScheduledMessages] = useState<ScheduledMessage[]>([]);
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [time, setTime] = useState("09:00");
  const [recipientName, setRecipientName] = useState("");
  const [recipientPhone, setRecipientPhone] = useState("");
  const [recipientEmail, setRecipientEmail] = useState("");
  const [selectedTemplateId, setSelectedTemplateId] = useState("");
  const [messageContent, setMessageContent] = useState("");
  const [selectedChannels, setSelectedChannels] = useState<string[]>(["sms"]);

  const handleAddSchedule = () => {
    if (!date || !time || !recipientName || selectedChannels.length === 0 || !messageContent) {
      toast.error("Please fill all required fields");
      return;
    }

    const newSchedule: ScheduledMessage = {
      id: Math.random().toString(36).substring(2, 9),
      recipientName,
      recipientPhone,
      recipientEmail,
      content: messageContent,
      channels: selectedChannels,
      scheduledDate: date,
      scheduledTime: time,
      status: "pending"
    };

    setScheduledMessages([...scheduledMessages, newSchedule]);
    toast.success("Message scheduled successfully");

    // Reset form
    setDate(new Date());
    setTime("09:00");
    setRecipientName("");
    setRecipientPhone("");
    setRecipientEmail("");
    setSelectedTemplateId("");
    setMessageContent("");
  };

  const handleDeleteSchedule = (id: string) => {
    setScheduledMessages(scheduledMessages.filter(msg => msg.id !== id));
    toast.success("Schedule removed");
  };

  const handleTemplateChange = (templateId: string) => {
    setSelectedTemplateId(templateId);
    const template = templates.find(t => t.id === templateId);
    if (template) {
      setMessageContent(template.content);
    }
  };

  const toggleChannel = (channel: string) => {
    if (selectedChannels.includes(channel)) {
      setSelectedChannels(selectedChannels.filter(c => c !== channel));
    } else {
      setSelectedChannels([...selectedChannels, channel]);
    }
  };

  return (
    <Tabs defaultValue="create">
      <TabsList className="mb-4">
        <TabsTrigger value="create">Schedule Message</TabsTrigger>
        <TabsTrigger value="scheduled">Scheduled Messages</TabsTrigger>
      </TabsList>
      
      <TabsContent value="create">
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Schedule a Message</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="recipient-name">Recipient Name</Label>
                  <Input
                    id="recipient-name"
                    value={recipientName}
                    onChange={(e) => setRecipientName(e.target.value)}
                    placeholder="John Smith"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="recipient-phone">Recipient Phone</Label>
                  <Input
                    id="recipient-phone"
                    value={recipientPhone}
                    onChange={(e) => setRecipientPhone(e.target.value)}
                    placeholder="+1 123 456 7890"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="recipient-email">Recipient Email</Label>
                  <Input
                    id="recipient-email"
                    type="email"
                    value={recipientEmail}
                    onChange={(e) => setRecipientEmail(e.target.value)}
                    placeholder="john@example.com"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Template</Label>
                  <Select value={selectedTemplateId} onValueChange={handleTemplateChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a template" />
                    </SelectTrigger>
                    <SelectContent>
                      {templates.map(template => (
                        <SelectItem key={template.id} value={template.id}>
                          {template.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Message Channels</Label>
                <div className="flex flex-wrap gap-2">
                  <Button 
                    type="button" 
                    variant={selectedChannels.includes("sms") ? "default" : "outline"}
                    size="sm"
                    onClick={() => toggleChannel("sms")}
                  >
                    SMS
                  </Button>
                  <Button 
                    type="button" 
                    variant={selectedChannels.includes("whatsapp") ? "default" : "outline"}
                    size="sm"
                    onClick={() => toggleChannel("whatsapp")}
                  >
                    WhatsApp
                  </Button>
                  <Button 
                    type="button" 
                    variant={selectedChannels.includes("email") ? "default" : "outline"}
                    size="sm"
                    onClick={() => toggleChannel("email")}
                  >
                    Email
                  </Button>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Schedule Date & Time</Label>
                <div className="flex space-x-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full md:w-[240px] justify-start text-left">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date ? format(date, "PPP") : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={date}
                        onSelect={setDate}
                        initialFocus
                        disabled={(date) => date < new Date()}
                      />
                    </PopoverContent>
                  </Popover>
                  
                  <div className="relative flex items-center">
                    <Clock className="absolute left-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="time"
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="message-content">Message Content</Label>
                <textarea
                  id="message-content"
                  value={messageContent}
                  onChange={(e) => setMessageContent(e.target.value)}
                  className="w-full h-32 p-2 border rounded-md resize-y"
                  placeholder="Enter your message here"
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleAddSchedule}>Schedule Message</Button>
            </CardFooter>
          </Card>
        </div>
      </TabsContent>
      
      <TabsContent value="scheduled">
        <Card>
          <CardHeader>
            <CardTitle>Scheduled Messages</CardTitle>
          </CardHeader>
          <CardContent>
            {scheduledMessages.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground">
                <p>No scheduled messages</p>
              </div>
            ) : (
              <div className="space-y-4">
                {scheduledMessages.map((message) => (
                  <div key={message.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium">{message.recipientName}</h3>
                        <div className="text-sm text-muted-foreground">
                          {message.recipientPhone && <div>Phone: {message.recipientPhone}</div>}
                          {message.recipientEmail && <div>Email: {message.recipientEmail}</div>}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-sm">
                          <span className="font-medium">{format(message.scheduledDate, "MMM d, yyyy")}</span>
                          <span> at </span>
                          <span className="font-medium">{message.scheduledTime}</span>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 w-8 p-0" 
                          onClick={() => handleDeleteSchedule(message.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="mt-2">
                      <div className="text-sm bg-muted p-3 rounded-md whitespace-pre-wrap">
                        {message.content}
                      </div>
                    </div>
                    <div className="mt-2 flex justify-between">
                      <div className="flex gap-1">
                        {message.channels.map(channel => (
                          <span key={channel} className="bg-primary/10 text-primary text-xs px-2 py-1 rounded">
                            {channel}
                          </span>
                        ))}
                      </div>
                      <span className="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded">
                        {message.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
