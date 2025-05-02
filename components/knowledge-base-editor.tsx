"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"
import { Save, Upload, Trash2, FileText, Database, Link as LinkIcon } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

interface KnowledgeBaseEditorProps {
  agentName: string
  initialKnowledge?: any
}

export function KnowledgeBaseEditor({ agentName, initialKnowledge = {} }: KnowledgeBaseEditorProps) {
  console.log("KnowledgeBaseEditor rendering with agentName:", agentName);
  console.log("initialKnowledge:", initialKnowledge);
  const [knowledge, setKnowledge] = useState({
    ragEnabled: initialKnowledge.ragEnabled !== false,
    embeddingsModel: initialKnowledge.embeddingsModel || "text-embedding-ada-002",
    sources: initialKnowledge.sources || [],
    contextInstructions: initialKnowledge.contextInstructions || "",
    maxChunkSize: initialKnowledge.maxChunkSize || 1000,
    maxChunks: initialKnowledge.maxChunks || 5,
    similarityThreshold: initialKnowledge.similarityThreshold || 0.7
  })

  const [newSource, setNewSource] = useState({
    type: "text",
    name: "",
    content: "",
    url: ""
  })

  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()
  const supabase = createClient()

  // Update knowledge when agent changes
  useEffect(() => {
    const fetchAgentKnowledge = async () => {
      try {
        console.log("Fetching knowledge for agent:", agentName);
        const { data } = await supabase
          .from("agent_settings")
          .select("knowledge")
          .eq("agent_name", agentName)
          .single()

        console.log("Fetched knowledge data:", data);
        if (data && data.knowledge) {
          setKnowledge({
            ragEnabled: data.knowledge.ragEnabled !== false,
            embeddingsModel: data.knowledge.embeddingsModel || "text-embedding-ada-002",
            sources: data.knowledge.sources || [],
            contextInstructions: data.knowledge.contextInstructions || "",
            maxChunkSize: data.knowledge.maxChunkSize || 1000,
            maxChunks: data.knowledge.maxChunks || 5,
            similarityThreshold: data.knowledge.similarityThreshold || 0.7
          })
        }
      } catch (error) {
        console.error("Error fetching agent knowledge:", error)
      }
    }

    if (agentName) {
      fetchAgentKnowledge()
    }
  }, [agentName, supabase])

  const handleSaveKnowledge = async () => {
    try {
      console.log("Saving knowledge:", knowledge);
      const { error } = await supabase
        .from("agent_settings")
        .update({ knowledge })
        .eq("agent_name", agentName)

      if (error) throw error

      toast({
        title: "Knowledge base saved",
        description: "Agent knowledge base settings have been saved successfully",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save knowledge base settings",
        variant: "destructive",
      })
    }
  }

  const handleAddSource = () => {
    if (newSource.type === "text" && !newSource.content) {
      toast({
        title: "Missing content",
        description: "Please enter content for the text source",
        variant: "destructive",
      })
      return
    }

    if (newSource.type === "url" && !newSource.url) {
      toast({
        title: "Missing URL",
        description: "Please enter a URL for the web source",
        variant: "destructive",
      })
      return
    }

    if (!newSource.name) {
      toast({
        title: "Missing name",
        description: "Please enter a name for the source",
        variant: "destructive",
      })
      return
    }

    const source = {
      id: Date.now().toString(),
      name: newSource.name,
      type: newSource.type,
      content: newSource.type === "text" ? newSource.content : "",
      url: newSource.type === "url" ? newSource.url : "",
      createdAt: new Date().toISOString()
    }

    setKnowledge({
      ...knowledge,
      sources: [...knowledge.sources, source]
    })

    setNewSource({
      type: "text",
      name: "",
      content: "",
      url: ""
    })

    toast({
      title: "Source added",
      description: `${newSource.name} has been added to the knowledge base`,
    })
  }

  const handleRemoveSource = (id: string) => {
    setKnowledge({
      ...knowledge,
      sources: knowledge.sources.filter((source: any) => source.id !== id)
    })

    toast({
      title: "Source removed",
      description: "The source has been removed from the knowledge base",
    })
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // In a real implementation, you would upload the file to storage
    // and then process it for embeddings
    // For now, we'll just add it as a source

    const reader = new FileReader()
    reader.onload = () => {
      const source = {
        id: Date.now().toString(),
        name: file.name,
        type: "file",
        content: "",
        url: "",
        fileType: file.type,
        fileSize: file.size,
        createdAt: new Date().toISOString()
      }

      setKnowledge({
        ...knowledge,
        sources: [...knowledge.sources, source]
      })

      toast({
        title: "File added",
        description: `${file.name} has been added to the knowledge base`,
      })
    }

    reader.readAsText(file)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>RAG Configuration</CardTitle>
              <CardDescription>Configure Retrieval Augmented Generation for the agent</CardDescription>
            </div>
            <Switch
              checked={knowledge.ragEnabled}
              onCheckedChange={(checked) => setKnowledge({ ...knowledge, ragEnabled: checked })}
            />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="embeddingsModel">Embeddings Model</Label>
            <Input
              id="embeddingsModel"
              placeholder="text-embedding-ada-002"
              value={knowledge.embeddingsModel}
              onChange={(e) => setKnowledge({ ...knowledge, embeddingsModel: e.target.value })}
              disabled={!knowledge.ragEnabled}
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="maxChunkSize">Max Chunk Size</Label>
              <Input
                id="maxChunkSize"
                type="number"
                min={100}
                max={4000}
                value={knowledge.maxChunkSize}
                onChange={(e) => setKnowledge({ ...knowledge, maxChunkSize: parseInt(e.target.value) })}
                disabled={!knowledge.ragEnabled}
              />
              <p className="text-xs text-gray-500">Characters per chunk</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxChunks">Max Chunks</Label>
              <Input
                id="maxChunks"
                type="number"
                min={1}
                max={20}
                value={knowledge.maxChunks}
                onChange={(e) => setKnowledge({ ...knowledge, maxChunks: parseInt(e.target.value) })}
                disabled={!knowledge.ragEnabled}
              />
              <p className="text-xs text-gray-500">Chunks to retrieve</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="similarityThreshold">Similarity Threshold</Label>
              <Input
                id="similarityThreshold"
                type="number"
                min={0.1}
                max={1}
                step={0.1}
                value={knowledge.similarityThreshold}
                onChange={(e) => setKnowledge({ ...knowledge, similarityThreshold: parseFloat(e.target.value) })}
                disabled={!knowledge.ragEnabled}
              />
              <p className="text-xs text-gray-500">Minimum similarity score</p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="contextInstructions">Context Instructions</Label>
            <Textarea
              id="contextInstructions"
              placeholder="Instructions for how the agent should use the retrieved context..."
              className="min-h-[100px]"
              value={knowledge.contextInstructions}
              onChange={(e) => setKnowledge({ ...knowledge, contextInstructions: e.target.value })}
              disabled={!knowledge.ragEnabled}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Knowledge Sources</CardTitle>
          <CardDescription>Add and manage knowledge sources for the agent</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Tabs defaultValue="text" className="space-y-4">
            <TabsList className="grid grid-cols-3 gap-2">
              <TabsTrigger value="text">Text</TabsTrigger>
              <TabsTrigger value="url">URL</TabsTrigger>
              <TabsTrigger value="file">File Upload</TabsTrigger>
            </TabsList>

            <TabsContent value="text" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="sourceName">Source Name</Label>
                <Input
                  id="sourceName"
                  placeholder="Company FAQ"
                  value={newSource.name}
                  onChange={(e) => setNewSource({ ...newSource, name: e.target.value, type: "text" })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="sourceContent">Content</Label>
                <Textarea
                  id="sourceContent"
                  placeholder="Enter text content..."
                  className="min-h-[200px]"
                  value={newSource.content}
                  onChange={(e) => setNewSource({ ...newSource, content: e.target.value })}
                />
              </div>

              <Button onClick={handleAddSource}>
                <FileText className="h-4 w-4 mr-2" />
                Add Text Source
              </Button>
            </TabsContent>

            <TabsContent value="url" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="sourceNameUrl">Source Name</Label>
                <Input
                  id="sourceNameUrl"
                  placeholder="Company Website"
                  value={newSource.name}
                  onChange={(e) => setNewSource({ ...newSource, name: e.target.value, type: "url" })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="sourceUrl">URL</Label>
                <Input
                  id="sourceUrl"
                  placeholder="https://example.com/docs"
                  value={newSource.url}
                  onChange={(e) => setNewSource({ ...newSource, url: e.target.value })}
                />
              </div>

              <Button onClick={handleAddSource}>
                <LinkIcon className="h-4 w-4 mr-2" />
                Add URL Source
              </Button>
            </TabsContent>

            <TabsContent value="file" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fileUpload">Upload File</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="fileUpload"
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                  <Button
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full h-24 border-dashed"
                  >
                    <div className="flex flex-col items-center">
                      <Upload className="h-6 w-6 mb-2" />
                      <span>Click to upload file</span>
                      <span className="text-xs text-gray-500 mt-1">PDF, DOCX, TXT, CSV, etc.</span>
                    </div>
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <div className="space-y-2">
            <h3 className="text-lg font-medium">Current Sources</h3>
            {knowledge.sources.length === 0 ? (
              <p className="text-sm text-gray-500">No sources added yet</p>
            ) : (
              <div className="space-y-2">
                {knowledge.sources.map((source: any) => (
                  <div key={source.id} className="flex items-center justify-between bg-gray-100 dark:bg-gray-800 p-3 rounded">
                    <div className="flex items-center">
                      {source.type === "text" && <FileText className="h-4 w-4 mr-2" />}
                      {source.type === "url" && <LinkIcon className="h-4 w-4 mr-2" />}
                      {source.type === "file" && <Database className="h-4 w-4 mr-2" />}
                      <div>
                        <p className="font-medium">{source.name}</p>
                        <p className="text-xs text-gray-500">
                          {source.type === "text" && "Text Source"}
                          {source.type === "url" && source.url}
                          {source.type === "file" && `File (${source.fileType})`}
                        </p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => handleRemoveSource(source.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleSaveKnowledge} className="ml-auto">
            <Save className="h-4 w-4 mr-2" />
            Save Knowledge Base
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}