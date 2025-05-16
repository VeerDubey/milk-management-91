
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

interface DateRangePickerProps {
  className?: string
  dateRange?: DateRange | undefined
  setDateRange?: React.Dispatch<React.SetStateAction<DateRange | undefined>>
  date?: DateRange | undefined
  onDateChange?: React.Dispatch<React.SetStateAction<DateRange | undefined>> | ((range: DateRange | undefined) => void)
}

export function DateRangePicker({
  className,
  dateRange,
  setDateRange,
  date,
  onDateChange
}: DateRangePickerProps) {
  // Use either dateRange/setDateRange or date/onDateChange
  const selectedDate = dateRange || date;
  const handleDateChange = (newDate: DateRange | undefined) => {
    if (setDateRange) {
      setDateRange(newDate);
    }
    if (onDateChange) {
      onDateChange(newDate);
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
              !selectedDate && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {selectedDate?.from ? (
              selectedDate.to ? (
                <>
                  {format(selectedDate.from, "LLL dd, y")} -{" "}
                  {format(selectedDate.to, "LLL dd, y")}
                </>
              ) : (
                format(selectedDate.from, "LLL dd, y")
              )
            ) : (
              <span>Pick a date range</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={selectedDate?.from}
            selected={selectedDate}
            onSelect={handleDateChange}
            numberOfMonths={2}
            className="pointer-events-auto"
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}

// For backwards compatibility
export const DatePickerWithRange = DateRangePicker;
