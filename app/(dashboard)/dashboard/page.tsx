import { KpiCards } from "@/components/kpi-cards"
import { Card } from "@/components/ui/card"

export default function DashboardPage() {
  // Default stats
  const stats = {
    total_leads: 120,
    qualified_leads: 78,
    prds_generated: 45,
    contracts_sent: 32,
    contracts_signed: 28,
    conversion_rate: 23,
    avg_time_to_close: 14,
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Bienvenido, test@tdx.co</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KpiCards stats={stats} />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="col-span-2">
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">Actividad Reciente</h2>
            <p className="text-sm text-muted-foreground">
              Las actividades recientes aparecerán aquí cuando haya interacciones con clientes o cambios en proyectos.
            </p>
          </div>
        </Card>

        <Card className="col-span-2">
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">Conversión de Leads</h2>
            <p className="text-sm text-muted-foreground">Estadísticas de conversión de leads en el último mes.</p>
          </div>
        </Card>
      </div>
    </div>
  )
}
