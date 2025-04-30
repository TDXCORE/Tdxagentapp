import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function InboxLoading() {
  return (
    <div className="flex flex-col h-full gap-4">
      <h1 className="text-3xl font-bold">Inbox</h1>

      <Tabs defaultValue="all" className="flex-1">
        <TabsList>
          <TabsTrigger value="all">Todos</TabsTrigger>
          <TabsTrigger value="new">Nuevos</TabsTrigger>
          <TabsTrigger value="assigned">Asignados</TabsTrigger>
          <TabsTrigger value="resolved">Resueltos</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="flex-1">
          <div className="grid grid-cols-12 gap-4 h-[calc(100vh-220px)]">
            <div className="col-span-3 overflow-y-auto border rounded-lg p-4">
              <div className="space-y-4">
                {Array(5)
                  .fill(0)
                  .map((_, i) => (
                    <div key={i} className="space-y-2">
                      <Skeleton className="h-5 w-3/4" />
                      <Skeleton className="h-4 w-full" />
                    </div>
                  ))}
              </div>
            </div>

            <div className="col-span-6 border rounded-lg flex flex-col p-4">
              <div className="flex-1 space-y-4">
                <Skeleton className="h-10 w-full" />
                <div className="space-y-2">
                  {Array(8)
                    .fill(0)
                    .map((_, i) => (
                      <Skeleton key={i} className="h-16 w-full" />
                    ))}
                </div>
              </div>
            </div>

            <div className="col-span-3 border rounded-lg overflow-y-auto p-4">
              <div className="space-y-4">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-20 w-full" />
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
