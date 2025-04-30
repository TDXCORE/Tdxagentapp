"use client"
import { SimpleDatePicker } from "./simple-date-picker"
import { Label } from "@/components/ui/label"

interface DateRange {
  from?: Date
  to?: Date
}

interface DateRangePickerProps {
  value: DateRange
  onChange: (range: DateRange) => void
  startLabel?: string
  endLabel?: string
  className?: string
}

export function SimpleDateRangePicker({
  value,
  onChange,
  startLabel = "Fecha de inicio",
  endLabel = "Fecha de fin",
  className,
}: DateRangePickerProps) {
  const handleFromChange = (date?: Date) => {
    onChange({ ...value, from: date })
  }

  const handleToChange = (date?: Date) => {
    onChange({ ...value, to: date })
  }

  return (
    <div className="grid gap-4">
      <div className="grid gap-2">
        <Label>{startLabel}</Label>
        <SimpleDatePicker value={value.from} onChange={handleFromChange} placeholder="Seleccionar fecha de inicio" />
      </div>
      <div className="grid gap-2">
        <Label>{endLabel}</Label>
        <SimpleDatePicker value={value.to} onChange={handleToChange} placeholder="Seleccionar fecha de fin" />
      </div>
    </div>
  )
}
