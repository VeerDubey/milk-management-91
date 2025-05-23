
import * as React from "react"
import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"
import { DateRange } from "react-day-picker"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

export interface DateRangePickerProps {
  date?: DateRange | undefined;
  value?: DateRange | undefined;
  onDateChange?: (date: DateRange | undefined) => void;
  onChange?: (date: DateRange | undefined) => void;
  onValueChange?: (date: DateRange | undefined) => void;
  setDate?: (date: DateRange | undefined) => void;
  className?: string;
  align?: string;
}

export function DatePickerWithRange({
  date,
  value,
  onDateChange,
  onChange,
  onValueChange,
  setDate,
  className,
  align = "center",
}: DateRangePickerProps) {
  // Use value prop if date is not provided
  const dateValue = date || value;
  
  const handleDateChange = (range: DateRange | undefined) => {
    if (onDateChange) onDateChange(range);
    if (onChange) onChange(range);
    if (onValueChange) onValueChange(range);
    if (setDate) setDate(range);
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
              !dateValue && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {dateValue?.from ? (
              dateValue.to ? (
                <>
                  {format(dateValue.from, "LLL dd, y")} - {format(dateValue.to, "LLL dd, y")}
                </>
              ) : (
                format(dateValue.from, "LLL dd, y")
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
            defaultMonth={dateValue?.from}
            selected={dateValue}
            onSelect={handleDateChange}
            numberOfMonths={2}
            className="pointer-events-auto"
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}

// For backward compatibility
export const DateRangePicker = DatePickerWithRange;
