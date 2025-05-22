
import * as React from "react"
import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

export interface DatePickerProps {
  date: Date | undefined;
  onDateChange?: (date: Date | undefined) => void;
  setDate?: (date: Date | undefined) => void;
  selected?: Date | undefined;
  onChange?: (date: Date | undefined) => void;
  onSelect?: React.Dispatch<React.SetStateAction<Date | undefined>>;
  className?: string;
  id?: string;
  placeholder?: string;
}

export function DatePicker({ 
  date, 
  onDateChange, 
  setDate, 
  selected, 
  onChange, 
  onSelect,
  className, 
  id,
  placeholder = "Pick a date"
}: DatePickerProps) {
  // Support multiple prop patterns for better compatibility
  const selectedDate = date || selected;
  
  const handleDateChange = (selectedDate: Date | undefined) => {
    if (selectedDate) {
      if (onDateChange) onDateChange(selectedDate);
      if (setDate) setDate(selectedDate);
      if (onChange) onChange(selectedDate);
      if (onSelect) onSelect(selectedDate);
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          id={id}
          variant={"outline"}
          className={cn(
            "w-full justify-start text-left font-normal",
            !selectedDate && "text-muted-foreground",
            className
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {selectedDate ? format(selectedDate, "PPP") : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={handleDateChange}
          initialFocus
          className={cn("p-3 pointer-events-auto")}
        />
      </PopoverContent>
    </Popover>
  )
}
