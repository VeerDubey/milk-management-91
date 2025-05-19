
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
      <CardHeader>
        <CardTitle>Track Sheet Details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {format(date, "PPP")}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={onDateChange}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="route">Route Name</Label>
            <Input
              id="route"
              placeholder="Morning Route"
              value={routeName}
              onChange={(e) => onRouteNameChange(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label>Actions</Label>
            <div className="flex space-x-2">
              <Button 
                variant="secondary" 
                className="flex-1"
                onClick={onGenerateTemplate}
              >
                Generate Sample
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
