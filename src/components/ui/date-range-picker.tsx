
import * as React from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { DateRange } from "react-day-picker";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export type DateRangePickerValue = DateRange;

interface DateRangePickerProps {
  value?: DateRangePickerValue;
  onValueChange?: (value: DateRangePickerValue) => void;
  onChange?: (value: DateRangePickerValue) => void;
  className?: string;
  align?: string;
}

export function DateRangePicker({
  value,
  onValueChange,
  onChange,
  className,
  align = "start",
}: DateRangePickerProps) {
  const [date, setDate] = React.useState<DateRangePickerValue>(
    value || { from: undefined, to: undefined }
  );

  // Keep internal state in sync with props
  React.useEffect(() => {
    if (value) {
      setDate(value);
    }
  }, [value]);

  const handleDateChange = (selectedDate: DateRangePickerValue) => {
    setDate(selectedDate);
    if (onValueChange) {
      onValueChange(selectedDate);
    }
    if (onChange) {
      onChange(selectedDate);
    }
  };

  return (
    <div className={cn("grid gap-2", className)}>
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
            {date?.from ? (
              date.to ? (
                <>
                  {format(date.from, "LLL dd, y")} -{" "}
                  {format(date.to, "LLL dd, y")}
                </>
              ) : (
                format(date.from, "LLL dd, y")
              )
            ) : (
              <span>Pick a date range</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align={align as any}>
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={date?.from}
            selected={date}
            onSelect={handleDateChange}
            numberOfMonths={2}
            className={cn("p-3 pointer-events-auto")}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
