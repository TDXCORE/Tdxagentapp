"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { useToast } from "@/hooks/use-toast"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Calendar as CalendarIcon, Video, Edit, Trash } from "lucide-react"

export default function MeetingsPage() {
  const [date, setDate] = useState<Date | undefined>(new Date())
  const { toast } = useToast()

  const handleScheduleMeeting = () => {
    toast({
      title: "Reunión Programada",
      description: "La reunión ha sido programada exitosamente",
    })
  }

  // Datos de ejemplo para reuniones
  const meetings = [
    {
      id: "1",
      client: "Juan Pérez",
      project: "Tienda de Ropa JP",
      date: "2023-05-10T14:00:00Z",
      duration: 60,
      status: "scheduled",
      platform: "Microsoft Teams",
    },
    {
      id: "2",
      client: "María López",
      project: "Restaurante El Sabor",
      date: "2023-05-12T10:30:00Z",
      duration: 45,
      status: "scheduled",
      platform: "Microsoft Teams",
    },
    {
      id: "3",
      client: "Carlos Rodríguez",
      project: "Consultora CR",
      date: "2023-05-15T16:00:00Z",
      duration: 30,
      status: "scheduled",
      platform: "Microsoft Teams",
    },
  ]

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold">Reuniones</h1>

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-4">
          <Card>
            <CardHeader>
              <CardTitle>Calendario</CardTitle>
              <CardDescription>Ver y programar reuniones</CardDescription>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                className="rounded-md border"
              />
            </CardContent>
            <CardFooter>
              <Button onClick={handleScheduleMeeting} className="w-full">
                <Plus className="mr-2 h-4 w-4" />
                Programar Reunión
              </Button>
            </CardFooter>
          </Card>
        </div>

        <div className="col-span-8">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Próximas Reuniones</CardTitle>
                  <CardDescription>Reuniones programadas con clientes</CardDescription>
                </div>
                <Button variant="outline">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  Sincronizar con Calendario
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Proyecto</TableHead>
                    <TableHead>Fecha y Hora</TableHead>
                    <TableHead>Duración</TableHead>
                    <TableHead>Plataforma</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {meetings.map((meeting) => (
                    <TableRow key={meeting.id}>
                      <TableCell>{meeting.client}</TableCell>
                      <TableCell>{meeting.project}</TableCell>
                      <TableCell>{new Date(meeting.date).toLocaleString()}</TableCell>
                      <TableCell>{meeting.duration} min</TableCell>
                      <TableCell>{meeting.platform}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm">
                            <Video className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Historial de Reuniones</CardTitle>
              <CardDescription>Reuniones pasadas con clientes</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Proyecto</TableHead>
                    <TableHead>Fecha y Hora</TableHead>
                    <TableHead>Duración</TableHead>
                    <TableHead>Estado</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>Ana Martínez</TableCell>
                    <TableCell>Portal Web AM</TableCell>
                    <TableCell>2023-04-28 15:00</TableCell>
                    <TableCell>45 min</TableCell>
                    <TableCell>Completada</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Pedro Sánchez</TableCell>
                    <TableCell>App Móvil PS</TableCell>
                    <TableCell>2023-04-25 10:30</TableCell>
                    <TableCell>60 min</TableCell>
                    <TableCell>Completada</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}