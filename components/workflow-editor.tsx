"use client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { Save, Play } from "lucide-react"
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  type Node,
  type Edge,
  useNodesState,
  useEdgesState,
  addEdge,
  type Connection,
  MarkerType,
} from "reactflow"
import "reactflow/dist/style.css"

const initialNodes: Node[] = [
  {
    id: "1",
    type: "input",
    data: { label: "Router Agent" },
    position: { x: 250, y: 25 },
    style: { background: "#f97316", color: "white" },
  },
  {
    id: "2",
    data: { label: "PRD Agent" },
    position: { x: 100, y: 125 },
    style: { background: "#10b981", color: "white" },
  },
  {
    id: "3",
    data: { label: "Quotation Agent" },
    position: { x: 250, y: 250 },
    style: { background: "#3b82f6", color: "white" },
  },
  {
    id: "4",
    data: { label: "Contract Agent" },
    position: { x: 400, y: 125 },
    style: { background: "#8b5cf6", color: "white" },
  },
]

const initialEdges: Edge[] = [
  { id: "e1-2", source: "1", target: "2", animated: true, markerEnd: { type: MarkerType.Arrow } },
  { id: "e2-3", source: "2", target: "3", animated: true, markerEnd: { type: MarkerType.Arrow } },
  { id: "e3-4", source: "3", target: "4", animated: true, markerEnd: { type: MarkerType.Arrow } },
]

export function WorkflowEditor() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)
  const { toast } = useToast()

  const onConnect = (params: Connection) => {
    setEdges((eds) => addEdge({ ...params, animated: true, markerEnd: { type: MarkerType.Arrow } }, eds))
  }

  const handleSaveWorkflow = () => {
    toast({
      title: "Workflow saved",
      description: "The agent workflow has been saved successfully",
    })
  }

  const handleTestWorkflow = () => {
    toast({
      title: "Testing workflow",
      description: "The workflow test has been initiated",
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Agent Workflow</h3>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleTestWorkflow}>
            <Play className="h-4 w-4 mr-2" />
            Test Workflow
          </Button>
          <Button onClick={handleSaveWorkflow}>
            <Save className="h-4 w-4 mr-2" />
            Save Workflow
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Workflow Editor</CardTitle>
          <CardDescription>Configure the flow between different agents by connecting nodes</CardDescription>
        </CardHeader>
        <CardContent>
          <div style={{ height: 500 }}>
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              fitView
            >
              <Controls />
              <MiniMap />
              <Background />
            </ReactFlow>
          </div>
        </CardContent>
        <CardFooter>
          <p className="text-sm text-gray-500">
            Drag to reposition nodes. Connect nodes by dragging from one node's handle to another.
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}
