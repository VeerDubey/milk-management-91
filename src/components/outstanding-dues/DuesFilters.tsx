
import { DateRange } from 'react-day-picker';
import { DatePickerWithRange } from '@/components/ui/date-picker-with-range';
import { Input } from '@/components/ui/input';
import { Search, Filter } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Download, Mail } from 'lucide-react';

type DuesFiltersProps = {
  dateRange: DateRange | undefined;
  setDateRange: (range: DateRange | undefined) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filterOverdue: string;
  setFilterOverdue: (filter: string) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
};

export const DuesActionBar = ({ activeTab, setActiveTab }: Pick<DuesFiltersProps, 'activeTab' | 'setActiveTab'>) => {
  return (
    <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full md:w-auto">
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="current">Current</TabsTrigger>
          <TabsTrigger value="overdue">Overdue</TabsTrigger>
          <TabsTrigger value="critical">Critical</TabsTrigger>
        </TabsList>
      </Tabs>
      
      <div className="flex gap-2">
        <Button variant="outline" onClick={() => toast.success('Generating report...')}>
          <Download className="mr-2 h-4 w-4" />
          Export
        </Button>
        
        <Button onClick={() => toast.success('Sending batch reminders...')}>
          <Mail className="mr-2 h-4 w-4" />
          Send Batch Reminders
        </Button>
      </div>
    </div>
  );
};

export const DuesFilterCard = ({
  dateRange,
  setDateRange,
  searchQuery,
  setSearchQuery,
  filterOverdue,
  setFilterOverdue
}: DuesFiltersProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Filter Options</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <label className="text-sm font-medium">Invoice Date Range</label>
            <DatePickerWithRange date={dateRange} setDate={setDateRange} />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Search Customer</label>
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Name or phone number"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Overdue Status</label>
            <Select value={filterOverdue} onValueChange={setFilterOverdue}>
              <SelectTrigger>
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="current">Current (&lt;30 days)</SelectItem>
                <SelectItem value="overdue-30">30-60 days</SelectItem>
                <SelectItem value="overdue-60">60-90 days</SelectItem>
                <SelectItem value="critical">&gt;90 days (Critical)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
