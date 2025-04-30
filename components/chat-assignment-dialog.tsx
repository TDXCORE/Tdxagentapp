"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { UserCheck } from "lucide-react"

export function ChatAssignmentDialog() {
  const [agent, setAgent] = useState("")
  const [open, setOpen] = useState(false)
  const { toast } = useToast()

  const handleAssign = () => {
    if (!agent) {
      toast({
        title: "Error",
        description: "Por favor seleccione un agente",
        variant: "destructive",
      })
      return
    }

    toast({
      title: "Conversación asignada",
      description: `La conversación ha sido asignada a ${agent}`,
    })
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <UserCheck className="mr-2 h-4 w-4" />
          Asignar
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Asignar conversación</DialogTitle>
          <DialogDescription>Seleccione un agente humano para asignar esta conversación.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="agent" className="text-right">
              Agente
            </Label>
            <Select value={agent} onValueChange={setAgent}>
              <SelectTrigger id="agent" className="col-span-3">
                <SelectValue placeholder="Seleccione un agente" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="juan">Juan Pérez</SelectItem>
                <SelectItem value="maria">María González</SelectItem>
                <SelectItem value="carlos">Carlos Rodríguez</SelectItem>
                <SelectItem value="ana">Ana Martínez</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button type="submit" onClick={handleAssign}>
            Asignar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
