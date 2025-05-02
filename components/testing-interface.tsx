"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { Play, Save, Download, RefreshCw, MessageSquare } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

interface TestingInterfaceProps {
  agentName: string
}

export function TestingInterface({ agentName }: TestingInterfaceProps) {
  console.log("TestingInterface rendering with agentName:", agentName);
  const [testConfig, setTestConfig] = useState({
    testMode: "interactive",
    testScenario: "default",
    customScenario: "",
    expectedResponse: "",
    maxTurns: 5,
    evaluationCriteria: ["accuracy", "helpfulness", "safety"]
  })

  const [conversation, setConversation] = useState<Array<{ role: string; content: string; timestamp: string }>>([])
  const [userInput, setUserInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [testResults, setTestResults] = useState<any>(null)
  const [savedTests, setSavedTests] = useState<Array<any>>([])

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()
  const supabase = createClient()

  // Scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [conversation])

  // Load saved tests
  useEffect(() => {
    const fetchSavedTests = async () => {
      try {
        console.log("Fetching saved tests for agent:", agentName);
        const { data } = await supabase
          .from("agent_tests")
          .select("*")
          .eq("agent_name", agentName)
          .order("created_at", { ascending: false })

        console.log("Fetched saved tests:", data);
        if (data) {
          setSavedTests(data)
        }
      } catch (error) {
        console.error("Error fetching saved tests:", error)
      }
    }

    if (agentName) {
      fetchSavedTests()
    }
  }, [agentName, supabase])

  const handleSendMessage = async () => {
    if (!userInput.trim()) return

    const newMessage = {
      role: "user",
      content: userInput,
      timestamp: new Date().toISOString()
    }

    setConversation([...conversation, newMessage])
    setUserInput("")
    setIsLoading(true)

    // Simulate agent response
    setTimeout(() => {
      let responseContent = ""

      // Generate different responses based on the agent type
      switch (agentName) {
        case "router_agent":
          responseContent = "Gracias por contactarnos. ¿Podría proporcionarme más detalles sobre su proyecto para dirigirlo al especialista adecuado?"
          break
        case "prd_agent":
          responseContent = "Entiendo que está interesado en desarrollar un proyecto. Para crear un PRD completo, necesitaré hacerle algunas preguntas sobre sus objetivos de negocio y requisitos técnicos."
          break
        case "quotation_agent":
          responseContent = "Basado en la información proporcionada, puedo ayudarle a crear una cotización. ¿Podría especificar el alcance del proyecto y las funcionalidades principales que necesita?"
          break
        case "contract_agent":
          responseContent = "Para preparar un contrato, necesitaré información sobre los términos acordados. ¿Podría confirmar el alcance del trabajo, plazos y presupuesto?"
          break
        default:
          responseContent = "Soy un asistente de TDX. ¿En qué puedo ayudarle hoy?"
      }

      const agentResponse = {
        role: "assistant",
        content: responseContent,
        timestamp: new Date().toISOString()
      }

      setConversation(prev => [...prev, agentResponse])
      setIsLoading(false)
    }, 1500)
  }

  const handleStartTest = () => {
    setConversation([])
    setTestResults(null)

    // Add system message based on test scenario
    let initialMessage = ""

    switch (testConfig.testScenario) {
      case "default":
        initialMessage = "Iniciando prueba estándar para el agente."
        break
      case "edge_case":
        initialMessage = "Iniciando prueba de caso extremo para el agente."
        break
      case "error_handling":
        initialMessage = "Iniciando prueba de manejo de errores para el agente."
        break
      case "custom":
        initialMessage = testConfig.customScenario || "Iniciando prueba personalizada para el agente."
        break
    }

    const systemMessage = {
      role: "system",
      content: initialMessage,
      timestamp: new Date().toISOString()
    }

    setConversation([systemMessage])

    toast({
      title: "Test started",
      description: `Testing ${agentName} with ${testConfig.testScenario} scenario`,
    })
  }

  const handleRunAutomatedTest = () => {
    setConversation([])
    setTestResults(null)
    setIsLoading(true)

    // Simulate automated test
    setTimeout(() => {
      const results = {
        passed: Math.random() > 0.3,
        score: Math.floor(Math.random() * 100),
        metrics: {
          accuracy: Math.random() * 100,
          helpfulness: Math.random() * 100,
          safety: Math.random() * 100,
          speed: Math.random() * 100
        },
        issues: Math.random() > 0.7 ? ["Respuesta incompleta", "Falta de contexto"] : [],
        recommendations: ["Mejorar el manejo de preguntas ambiguas", "Añadir más ejemplos de entrenamiento"]
      }

      setTestResults(results)
      setIsLoading(false)

      toast({
        title: results.passed ? "Test passed" : "Test failed",
        description: `Score: ${results.score}/100`,
        variant: results.passed ? "default" : "destructive",
      })
    }, 3000)
  }

  const handleSaveTest = async () => {
    try {
      const testData = {
        agent_name: agentName,
        test_config: testConfig,
        conversation,
        results: testResults,
        created_at: new Date().toISOString()
      }

      const { error } = await supabase
        .from("agent_tests")
        .insert(testData)

      if (error) throw error

      setSavedTests([testData, ...savedTests])

      toast({
        title: "Test saved",
        description: "The test has been saved successfully",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save test",
        variant: "destructive",
      })
    }
  }

  const handleLoadTest = (test: any) => {
    setTestConfig(test.test_config)
    setConversation(test.conversation)
    setTestResults(test.results)

    toast({
      title: "Test loaded",
      description: "The saved test has been loaded",
    })
  }

  const handleExportResults = () => {
    const data = {
      agent: agentName,
      config: testConfig,
      conversation,
      results: testResults,
      timestamp: new Date().toISOString()
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${agentName}-test-${new Date().toISOString().slice(0, 10)}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    toast({
      title: "Results exported",
      description: "Test results have been exported as JSON",
    })
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="interactive" className="space-y-4">
        <TabsList className="grid grid-cols-2 gap-2">
          <TabsTrigger 
            value="interactive" 
            onClick={() => setTestConfig({ ...testConfig, testMode: "interactive" })}
          >
            Interactive Testing
          </TabsTrigger>
          <TabsTrigger 
            value="automated" 
            onClick={() => setTestConfig({ ...testConfig, testMode: "automated" })}
          >
            Automated Testing
          </TabsTrigger>
        </TabsList>

        <TabsContent value="interactive" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Test Configuration</CardTitle>
              <CardDescription>Configure the interactive test for the agent</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="testScenario">Test Scenario</Label>
                <Select
                  value={testConfig.testScenario}
                  onValueChange={(value) => setTestConfig({ ...testConfig, testScenario: value })}
                >
                  <SelectTrigger id="testScenario">
                    <SelectValue placeholder="Select test scenario" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default">Default Scenario</SelectItem>
                    <SelectItem value="edge_case">Edge Case</SelectItem>
                    <SelectItem value="error_handling">Error Handling</SelectItem>
                    <SelectItem value="custom">Custom Scenario</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {testConfig.testScenario === "custom" && (
                <div className="space-y-2">
                  <Label htmlFor="customScenario">Custom Scenario Description</Label>
                  <Textarea
                    id="customScenario"
                    placeholder="Describe the custom test scenario..."
                    value={testConfig.customScenario}
                    onChange={(e) => setTestConfig({ ...testConfig, customScenario: e.target.value })}
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="maxTurns">Maximum Conversation Turns</Label>
                <Input
                  id="maxTurns"
                  type="number"
                  min={1}
                  max={20}
                  value={testConfig.maxTurns}
                  onChange={(e) => setTestConfig({ ...testConfig, maxTurns: parseInt(e.target.value) })}
                />
              </div>

              <Button onClick={handleStartTest}>
                <Play className="h-4 w-4 mr-2" />
                Start Interactive Test
              </Button>
            </CardContent>
          </Card>

          <Card className="h-[500px] flex flex-col">
            <CardHeader className="pb-2">
              <CardTitle>Test Conversation</CardTitle>
              <CardDescription>Interact with the agent to test its behavior</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
              {conversation.length === 0 ? (
                <div className="h-full flex items-center justify-center text-gray-500">
                  <p>Start a test to begin the conversation</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {conversation.map((message, index) => (
                    <div
                      key={index}
                      className={`flex ${
                        message.role === "user" ? "justify-end" : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-[80%] rounded-lg p-3 ${
                          message.role === "user"
                            ? "bg-primary text-primary-foreground"
                            : message.role === "system"
                            ? "bg-gray-100 dark:bg-gray-800 text-gray-500 italic"
                            : "bg-gray-100 dark:bg-gray-800"
                        }`}
                      >
                        <p>{message.content}</p>
                        <p className="text-xs opacity-70 mt-1">
                          {new Date(message.timestamp).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </CardContent>
            <CardFooter className="border-t p-4">
              <div className="flex w-full items-center space-x-2">
                <Input
                  placeholder="Type your message..."
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                  disabled={isLoading || conversation.length === 0}
                />
                <Button 
                  onClick={handleSendMessage} 
                  disabled={isLoading || conversation.length === 0}
                >
                  <MessageSquare className="h-4 w-4" />
                </Button>
              </div>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="automated" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Automated Test Configuration</CardTitle>
              <CardDescription>Configure automated tests for the agent</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="testScenarioAuto">Test Scenario</Label>
                <Select
                  value={testConfig.testScenario}
                  onValueChange={(value) => setTestConfig({ ...testConfig, testScenario: value })}
                >
                  <SelectTrigger id="testScenarioAuto">
                    <SelectValue placeholder="Select test scenario" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default">Default Scenario</SelectItem>
                    <SelectItem value="edge_case">Edge Case</SelectItem>
                    <SelectItem value="error_handling">Error Handling</SelectItem>
                    <SelectItem value="custom">Custom Scenario</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {testConfig.testScenario === "custom" && (
                <div className="space-y-2">
                  <Label htmlFor="customScenarioAuto">Custom Scenario Description</Label>
                  <Textarea
                    id="customScenarioAuto"
                    placeholder="Describe the custom test scenario..."
                    value={testConfig.customScenario}
                    onChange={(e) => setTestConfig({ ...testConfig, customScenario: e.target.value })}
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="expectedResponse">Expected Response (optional)</Label>
                <Textarea
                  id="expectedResponse"
                  placeholder="Enter the expected response from the agent..."
                  value={testConfig.expectedResponse}
                  onChange={(e) => setTestConfig({ ...testConfig, expectedResponse: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>Evaluation Criteria</Label>
                <div className="grid grid-cols-2 gap-2">
                  {["accuracy", "helpfulness", "safety", "speed"].map((criterion) => (
                    <div key={criterion} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={criterion}
                        checked={testConfig.evaluationCriteria.includes(criterion)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setTestConfig({
                              ...testConfig,
                              evaluationCriteria: [...testConfig.evaluationCriteria, criterion]
                            })
                          } else {
                            setTestConfig({
                              ...testConfig,
                              evaluationCriteria: testConfig.evaluationCriteria.filter(c => c !== criterion)
                            })
                          }
                        }}
                      />
                      <Label htmlFor={criterion} className="capitalize">{criterion}</Label>
                    </div>
                  ))}
                </div>
              </div>

              <Button onClick={handleRunAutomatedTest} disabled={isLoading}>
                {isLoading ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Running Test...
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    Run Automated Test
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {testResults && (
            <Card>
              <CardHeader>
                <CardTitle>Test Results</CardTitle>
                <CardDescription>
                  {testResults.passed ? "Test passed successfully" : "Test failed"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-medium">Overall Score:</span>
                  <span className={`text-lg font-bold ${
                    testResults.score >= 70 ? "text-green-500" : 
                    testResults.score >= 50 ? "text-yellow-500" : "text-red-500"
                  }`}>
                    {testResults.score}/100
                  </span>
                </div>

                <div className="space-y-2">
                  <h3 className="font-medium">Metrics:</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {Object.entries(testResults.metrics).map(([key, value]) => (
                      <div key={key} className="space-y-1">
                        <div className="flex justify-between">
                          <span className="text-sm capitalize">{key}:</span>
                          <span className="text-sm font-medium">{Math.round(value as number)}%</span>
                        </div>
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className={`h-full ${
                              (value as number) >= 70 ? "bg-green-500" : 
                              (value as number) >= 50 ? "bg-yellow-500" : "bg-red-500"
                            }`}
                            style={{ width: `${value}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {testResults.issues.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="font-medium">Issues Detected:</h3>
                    <ul className="list-disc pl-5 space-y-1">
                      {testResults.issues.map((issue: string, index: number) => (
                        <li key={index} className="text-sm">{issue}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {testResults.recommendations.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="font-medium">Recommendations:</h3>
                    <ul className="list-disc pl-5 space-y-1">
                      {testResults.recommendations.map((rec: string, index: number) => (
                        <li key={index} className="text-sm">{rec}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={handleExportResults}>
                  <Download className="h-4 w-4 mr-2" />
                  Export Results
                </Button>
                <Button onClick={handleSaveTest}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Test
                </Button>
              </CardFooter>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {savedTests.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Saved Tests</CardTitle>
            <CardDescription>Previously saved tests for this agent</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {savedTests.slice(0, 5).map((test, index) => (
                <div key={index} className="flex items-center justify-between bg-gray-100 dark:bg-gray-800 p-3 rounded">
                  <div>
                    <p className="font-medium">
                      {test.test_config.testScenario.charAt(0).toUpperCase() + test.test_config.testScenario.slice(1)} Test
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(test.created_at).toLocaleString()}
                    </p>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => handleLoadTest(test)}>
                    Load
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}