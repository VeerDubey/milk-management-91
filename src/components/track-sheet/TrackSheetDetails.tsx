
import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, BarChart3, HelpCircle } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface TrackSheetDetailsProps {
  date: Date;
  routeName: string;
  onDateChange: (date: Date | undefined) => void;
  onRouteNameChange: (routeName: string) => void;
  onGenerateTemplate: () => void;
}

export function TrackSheetDetails({
  date,
  routeName,
  onDateChange,
  onRouteNameChange,
  onGenerateTemplate
}: TrackSheetDetailsProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Track Sheet Details</h3>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onGenerateTemplate}
          >
            <BarChart3 className="mr-2 h-4 w-4" />
            Generate Sample Data
          </Button>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon">
                <HelpCircle className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 text-sm" align="end">
              <div className="space-y-2">
                <p>
                  <strong>Track Sheet</strong> helps you record daily product distribution 
                  per customer.
                </p>
                <p>
                  1. Set the date and route for this sheet
                </p>
                <p>
                  2. Enter quantities for each product per customer
                </p>
                <p>
                  3. Use the sample data generator to quickly see how it works
                </p>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="date"
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={onDateChange}
                  initialFocus
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>
          <div className="space-y-2">
            <Label htmlFor="route">Route Name (Optional)</Label>
            <Input
              id="route"
              value={routeName}
              onChange={(e) => onRouteNameChange(e.target.value)}
              placeholder="e.g., North City Route"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
