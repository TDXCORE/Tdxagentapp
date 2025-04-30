"use client"

import type React from "react"

import { useState } from "react"
import { format, parse, isValid } from "date-fns"
import { Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"

interface DatePickerProps {
  value?: Date
  onChange: (date?: Date) => void
  placeholder?: string
  className?: string
  disabled?: boolean
}

export function SimpleDatePicker({
  value,
  onChange,
  placeholder = "Seleccionar fecha",
  className,
  disabled,
}: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [inputValue, setInputValue] = useState(value ? format(value, "dd/MM/yyyy") : "")

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setInputValue(val)

    // Try to parse the date
    if (val) {
      const parsed = parse(val, "dd/MM/yyyy", new Date())
      if (isValid(parsed)) {
        onChange(parsed)
      }
    } else {
      onChange(undefined)
    }
  }

  const handleDateSelect = (day: number, month: number, year: number) => {
    const newDate = new Date(year, month, day)
    onChange(newDate)
    setInputValue(format(newDate, "dd/MM/yyyy"))
    setIsOpen(false)
  }

  // Generate calendar for current month
  const generateCalendar = () => {
    const today = new Date()
    const currentMonth = value ? value.getMonth() : today.getMonth()
    const currentYear = value ? value.getFullYear() : today.getFullYear()

    const firstDay = new Date(currentYear, currentMonth, 1).getDay()
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate()

    const days = []
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-8 w-8"></div>)
    }

    // Add days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      const isSelected =
        value && value.getDate() === i && value.getMonth() === currentMonth && value.getFullYear() === currentYear
      days.push(
        <Button
          key={i}
          variant={isSelected ? "default" : "ghost"}
          className={cn("h-8 w-8", isSelected && "bg-primary text-primary-foreground")}
          onClick={() => handleDateSelect(i, currentMonth, currentYear)}
        >
          {i}
        </Button>,
      )
    }

    return days
  }

  return (
    <div className={cn("relative", className)}>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn("w-full justify-start text-left font-normal", !value && "text-muted-foreground")}
            disabled={disabled}
          >
            <Calendar className="mr-2 h-4 w-4" />
            {value ? format(value, "dd/MM/yyyy") : <span>{placeholder}</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <div className="p-3">
            <div className="grid grid-cols-7 gap-1 text-center text-sm">
              <div className="font-medium">D</div>
              <div className="font-medium">L</div>
              <div className="font-medium">M</div>
              <div className="font-medium">X</div>
              <div className="font-medium">J</div>
              <div className="font-medium">V</div>
              <div className="font-medium">S</div>
              {generateCalendar()}
            </div>
          </div>
        </PopoverContent>
      </Popover>
      <Input
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        placeholder={placeholder}
        className="hidden"
        disabled={disabled}
      />
    </div>
  )
}
