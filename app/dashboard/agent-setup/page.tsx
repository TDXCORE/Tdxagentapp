"use client"

import { useState, useEffect } from "react"
import { 
  Card, 
  CardContent
} from "@/components/ui/card"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { useToast } from "@/hooks/use-toast"
import { createClient } from "@/lib/supabase/client"
import {
  Settings,
  Save,
  Plus,
  Trash2,
  FileText,
  Code,
  SquareTerminal,
  Info,
  MoreVertical,
  Copy
} from "lucide-react"

// Lista de agentes predefinidos
const predefinedAgents = [
  "contract_agent",
  "evaluator",
  "meeting_scheduler",
  "orchestrator_agent",
  "prd_agent",
  "quotation_agent",
  "router_agent"
];

export default function AgentSetupPage() {
  const [selectedAgent, setSelectedAgent] = useState<string>("")
  const [agentName, setAgentName] = useState<string>("")
  const [assistantId, setAssistantId] = useState<string>("asst_rcIWGFmCLCk6oh9CV7dFqqRi")
  const [systemInstructions, setSystemInstructions] = useState<string>("You are a helpful assistant...")
  const [model, setModel] = useState<string>("gpt-4o")
  const [fileSearch, setFileSearch] = useState<boolean>(false)
  const [codeInterpreter, setCodeInterpreter] = useState<boolean>(false)
  const [functions, setFunctions] = useState<boolean>(false)
  const [responseFormat, setResponseFormat] = useState<string>("text")
  const [temperature, setTemperature] = useState<number>(1.0)
  const [topP, setTopP] = useState<number>(1.0)
  const [apiVersion, setApiVersion] = useState<string>("Latest")
  const [functionDefinitions, setFunctionDefinitions] = useState<any[]>([])
  const [newFunctionJson, setNewFunctionJson] = useState<string>(`{
  "name": "get_stock_price",
  "description": "Get the current stock price",
  "parameters": {
    "type": "object",
    "properties": {
      "symbol": {
        "type": "string",
        "description": "The stock symbol"
      }
    },
    "additionalProperties": false,
    "required": [
      "symbol"
    ]
  }
}`)
  const [isAddFunctionOpen, setIsAddFunctionOpen] = useState<boolean>(false)
  const [isAddFileOpen, setIsAddFileOpen] = useState<boolean>(false)
  const [lastUpdated, setLastUpdated] = useState<string>("4/9, 2:15 PM")
  
  // Estado para el chat
  const [messages, setMessages] = useState<{role: string, content: string}[]>([])
  const [inputMessage, setInputMessage] = useState<string>("")
  const [isLoading, setIsLoading] = useState<boolean>(false)
  
  const { toast } = useToast()
  const supabase = createClient()

  // Seleccionar el primer agente por defecto
  useEffect(() => {
    if (predefinedAgents.length > 0 && !selectedAgent) {
      setSelectedAgent(predefinedAgents[0])
      loadAgentSettings(predefinedAgents[0])
    }
  }, [])

  // Cargar la configuración del agente seleccionado
  const loadAgentSettings = async (agentName: string) => {
    try {
      setAgentName(agentName)
      
      // Establecer valores predeterminados primero
      setAssistantId("asst_rcIWGFmCLCk6oh9CV7dFqqRi");
      setSystemInstructions(getDefaultInstructions(agentName));
      setModel("gpt-4o");
      setFileSearch(false);
      setCodeInterpreter(false);
      setFunctions(false);
      setResponseFormat("text");
      setTemperature(1.0);
      setTopP(1.0);
      setFunctionDefinitions([]);
      setApiVersion("Latest");
      setLastUpdated("4/9, 2:15 PM");
      
      // Buscar la configuración del agente en la base de datos
      try {
        // Primero intentamos obtener solo system_instructions y agent_type
        // que son las columnas más importantes y que probablemente existan
        const { data: basicConfig, error: basicError } = await supabase
          .from("agent_settings")
          .select("agent_type, system_instructions, updated_at")
          .eq("agent_type", agentName)
          .maybeSingle();
        
        if (basicError && basicError.code !== 'PGRST116') {
          console.error("Error al cargar la configuración básica del agente:", basicError);
        } else if (basicConfig) {
          // Si encontramos la configuración básica, la usamos
          if (basicConfig.system_instructions) {
            setSystemInstructions(basicConfig.system_instructions);
          }
          
          if (basicConfig.updated_at) {
            setLastUpdated(formatDate(new Date(basicConfig.updated_at)));
          }
          
          // Ahora intentamos cargar el resto de la configuración
          try {
            const { data: fullConfig, error: fullError } = await supabase
              .from("agent_settings")
              .select("*")
              .eq("agent_type", agentName)
              .single();
            
            if (fullError) {
              console.warn("Advertencia al cargar la configuración completa:", fullError);
            } else if (fullConfig) {
              // Cargar cada campo individualmente para manejar posibles campos faltantes
              if (fullConfig.assistant_id) setAssistantId(fullConfig.assistant_id);
              if (fullConfig.model) setModel(fullConfig.model);
              if (fullConfig.file_search !== undefined) setFileSearch(fullConfig.file_search);
              if (fullConfig.code_interpreter !== undefined) setCodeInterpreter(fullConfig.code_interpreter);
              if (fullConfig.functions_enabled !== undefined) setFunctions(fullConfig.functions_enabled);
              if (fullConfig.response_format) setResponseFormat(fullConfig.response_format);
              if (fullConfig.temperature !== undefined) setTemperature(fullConfig.temperature);
              if (fullConfig.top_p !== undefined) setTopP(fullConfig.top_p);
              if (fullConfig.api_version) setApiVersion(fullConfig.api_version);
              
              // Convertir function_definitions de string a objeto si es necesario
              if (fullConfig.function_definitions) {
                try {
                  let functionDefs = [];
                  if (typeof fullConfig.function_definitions === 'string') {
                    functionDefs = JSON.parse(fullConfig.function_definitions);
                  } else {
                    functionDefs = fullConfig.function_definitions;
                  }
                  setFunctionDefinitions(functionDefs);
                } catch (e) {
                  console.error("Error al parsear function_definitions:", e);
                }
              }
            }
          } catch (e) {
            console.warn("Error al cargar la configuración completa:", e);
          }
        } else {
          // Si no encontramos la configuración, creamos una nueva con valores predeterminados
          try {
            const newAgentData = {
              agent_type: agentName,
              system_instructions: getDefaultInstructions(agentName),
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            };
            
            const { error: insertError } = await supabase
              .from("agent_settings")
              .insert([newAgentData]);
            
            if (insertError) {
              console.warn("Error al crear configuración predeterminada:", insertError);
            }
          } catch (e) {
            console.warn("Error al crear configuración predeterminada:", e);
          }
        }
      } catch (e) {
        console.warn("Error general al cargar la configuración:", e);
      }
      
    } catch (error) {
      console.error("Error al cargar la configuración del agente:", error)
      toast({
        title: "Error",
        description: "No se pudo cargar la configuración del agente",
        variant: "destructive",
      })
    }
  }

  // Manejar el cambio de agente seleccionado
  const handleAgentChange = (value: string) => {
    setSelectedAgent(value)
    loadAgentSettings(value)
  }

  // Función auxiliar para formatear la fecha
  const formatDate = (date: Date) => {
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const formattedHours = hours % 12 || 12;
    const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
    
    return `${month}/${day}, ${formattedHours}:${formattedMinutes} ${ampm}`;
  };
  
  // Función para obtener las instrucciones predeterminadas según el tipo de agente
  const getDefaultInstructions = (agentType: string) => {
    switch (agentType) {
      case "contract_agent":
        return "Eres un especialista en contratos para TDX. Tu función es explicar términos contractuales, responder preguntas legales y ayudar en la fase de contratación. Debes asegurarte de que todos los contratos cumplan con la normativa legal vigente y protejan los intereses de todas las partes involucradas.";
      case "evaluator":
        return "Eres un especialista en evaluación para TDX. Tu función es validar la calidad y completitud de la información, asegurar la consistencia entre documentos y verificar que se cumplan todos los requisitos. Debes ser meticuloso en la revisión de documentos y detectar cualquier inconsistencia o falta de información.";
      case "meeting_scheduler":
        return "Eres un asistente de programación para TDX. Tu función es ayudar a programar reuniones entre clientes y miembros del equipo de TDX, encontrando horarios adecuados para todas las partes. Debes ser eficiente en la gestión del tiempo y considerar las zonas horarias y disponibilidad de todos los participantes.";
      case "orchestrator_agent":
        return "Eres el gerente de orquestación para TDX. Tu función es coordinar el flujo entre diferentes agentes especializados, asegurando una experiencia fluida para el cliente durante todo el proceso. Debes tomar decisiones sobre qué agente debe intervenir en cada momento y garantizar que la información fluya correctamente entre todos los componentes del sistema.";
      case "prd_agent":
        return "Eres un especialista en recopilación de requisitos para TDX. Tu trabajo es hacer preguntas detalladas sobre el proyecto del cliente para crear un PRD completo. Concéntrate en comprender sus objetivos comerciales, requisitos técnicos, historias de usuario y restricciones. Debes ser exhaustivo en la recopilación de información y asegurarte de que todos los aspectos del proyecto estén documentados.";
      case "quotation_agent":
        return "Eres un especialista en precios para TDX. Basándote en los requisitos del proyecto, estimas el esfuerzo, el cronograma y el costo. Haces preguntas aclaratorias sobre el alcance del proyecto, la complejidad y cualquier tecnología o integración específica requerida. Debes ser preciso en tus estimaciones y considerar todos los factores que pueden afectar al costo y tiempo de desarrollo.";
      case "router_agent":
        return "Eres un asistente útil para TDX, una empresa de desarrollo tecnológico. Tu función es saludar al cliente, comprender sus necesidades y dirigirlos al agente especializado adecuado. Pregunta por su nombre, empresa y una breve descripción de lo que están buscando. Debes ser amable, profesional y eficiente en la identificación de las necesidades del cliente.";
      default:
        return "Eres un asistente especializado para TDX, una empresa de desarrollo tecnológico. Tu objetivo es proporcionar información precisa y útil a los clientes y ayudarles a resolver sus dudas o problemas relacionados con nuestros servicios.";
    }
  };

  // Manejar el envío del formulario
  const handleSaveConfiguration = async () => {
    try {
      const now = new Date();
      
      // Convertir function_definitions a JSON string para evitar problemas de serialización
      let functionDefsString = null;
      if (functionDefinitions && functionDefinitions.length > 0) {
        try {
          functionDefsString = JSON.stringify(functionDefinitions);
        } catch (e) {
          console.error("Error al serializar function_definitions:", e);
        }
      }
      
      // Preparar los datos básicos para guardar en la base de datos
      const baseData = {
        agent_type: selectedAgent,
        system_instructions: systemInstructions,
        updated_at: now.toISOString()
      };
      
      // Intentar guardar primero solo los datos básicos
      try {
        const { error: basicError } = await supabase
          .from("agent_settings")
          .upsert(baseData, {
            onConflict: 'agent_type'
          });
        
        if (basicError) {
          console.error("Error al guardar datos básicos:", basicError);
          throw basicError;
        }
        
        // Si los datos básicos se guardaron correctamente, intentar guardar los datos adicionales
        // Hacemos esto en pasos separados para manejar el caso en que algunas columnas no existan
        try {
          const additionalData = {
            agent_type: selectedAgent,
            assistant_id: assistantId,
            model: model,
            file_search: fileSearch,
            code_interpreter: codeInterpreter,
            functions_enabled: functions,
            response_format: responseFormat,
            temperature: temperature,
            top_p: topP,
            function_definitions: functionDefsString
          };
          
          const { error: additionalError } = await supabase
            .from("agent_settings")
            .update(additionalData)
            .eq("agent_type", selectedAgent);
          
          if (additionalError) {
            console.warn("Advertencia al guardar datos adicionales:", additionalError);
            // No lanzamos error aquí, ya que los datos básicos se guardaron correctamente
          }
          
          // Intentar guardar api_version por separado
          try {
            const apiVersionData = {
              agent_type: selectedAgent,
              api_version: apiVersion
            };
            
            const { error: apiVersionError } = await supabase
              .from("agent_settings")
              .update(apiVersionData)
              .eq("agent_type", selectedAgent);
            
            if (apiVersionError) {
              console.warn("Advertencia al guardar api_version:", apiVersionError);
              // No lanzamos error aquí
            }
          } catch (e) {
            console.warn("Error al guardar api_version:", e);
          }
        } catch (e) {
          console.warn("Error al guardar datos adicionales:", e);
        }
      } catch (error) {
        // Si falla el upsert, intentar insertar y actualizar por separado
        console.warn("Error en upsert, intentando insertar/actualizar por separado:", error);
        
        // Verificar si ya existe una configuración para este agente
        const { data: existingConfig, error: checkError } = await supabase
          .from("agent_settings")
          .select("agent_type")
          .eq("agent_type", selectedAgent)
          .maybeSingle();
        
        if (checkError) {
          console.error("Error al verificar si existe configuración:", checkError);
          throw checkError;
        }
        
        if (existingConfig) {
          // Si existe, actualizamos
          const { error: updateError } = await supabase
            .from("agent_settings")
            .update({ system_instructions: systemInstructions })
            .eq("agent_type", selectedAgent);
          
          if (updateError) {
            console.error("Error al actualizar:", updateError);
            throw updateError;
          }
        } else {
          // Si no existe, insertamos
          const { error: insertError } = await supabase
            .from("agent_settings")
            .insert([{ agent_type: selectedAgent, system_instructions: systemInstructions }]);
          
          if (insertError) {
            console.error("Error al insertar:", insertError);
            throw insertError;
          }
        }
      }
      
      toast({
        title: "Configuración guardada",
        description: "La configuración del agente ha sido guardada exitosamente en la base de datos",
      });
      
      // Actualizar la fecha de última actualización
      const formattedDate = formatDate(now);
      setLastUpdated(formattedDate);
      
    } catch (error) {
      console.error("Error al guardar la configuración:", error)
      toast({
        title: "Error",
        description: "No se pudo guardar la configuración del agente",
        variant: "destructive",
      })
    }
  }

  // Enviar mensaje al agente usando la API de OpenAI
  const sendMessage = async () => {
    if (!inputMessage.trim()) return;
    
    // Añadir el mensaje del usuario al chat
    const userMessage = { role: "user", content: inputMessage };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInputMessage("");
    setIsLoading(true);
    
    try {
      // Usar las instrucciones personalizadas del agente
      let systemPrompt = systemInstructions;
      
      // Si no hay instrucciones personalizadas, usar valores predeterminados según el agente
      if (!systemPrompt || systemPrompt === "You are a helpful assistant...") {
        switch (selectedAgent) {
          case "contract_agent":
            systemPrompt = "Eres un especialista en contratos para TDX. Tu función es explicar términos contractuales, responder preguntas legales y ayudar en la fase de contratación.";
            break;
          case "evaluator":
            systemPrompt = "Eres un especialista en evaluación para TDX. Tu función es validar la calidad y completitud de la información, asegurar la consistencia entre documentos y verificar que se cumplan todos los requisitos.";
            break;
          case "meeting_scheduler":
            systemPrompt = "Eres un asistente de programación para TDX. Tu función es ayudar a programar reuniones entre clientes y miembros del equipo de TDX, encontrando horarios adecuados para todas las partes.";
            break;
          case "orchestrator_agent":
            systemPrompt = "Eres el gerente de orquestación para TDX. Tu función es coordinar el flujo entre diferentes agentes especializados, asegurando una experiencia fluida para el cliente durante todo el proceso.";
            break;
          case "prd_agent":
            systemPrompt = "Eres un especialista en recopilación de requisitos para TDX. Tu trabajo es hacer preguntas detalladas sobre el proyecto del cliente para crear un PRD completo. Concéntrate en comprender sus objetivos comerciales, requisitos técnicos, historias de usuario y restricciones.";
            break;
          case "quotation_agent":
            systemPrompt = "Eres un especialista en precios para TDX. Basándote en los requisitos del proyecto, estimas el esfuerzo, el cronograma y el costo. Haces preguntas aclaratorias sobre el alcance del proyecto, la complejidad y cualquier tecnología o integración específica requerida.";
            break;
          case "router_agent":
            systemPrompt = "Eres un asistente útil para TDX, una empresa de desarrollo tecnológico. Tu función es saludar al cliente, comprender sus necesidades y dirigirlos al agente especializado adecuado. Pregunta por su nombre, empresa y una breve descripción de lo que están buscando.";
            break;
          default:
            systemPrompt = "Eres un asistente especializado para TDX, una empresa de desarrollo tecnológico.";
        }
      }
      
      // Crear el mensaje del sistema
      const systemMessage = { role: "system", content: systemPrompt };
      
      // Preparar los mensajes para la API
      const apiMessages = [systemMessage, ...updatedMessages];
      
      // Llamar a la API de OpenAI
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: apiMessages,
          model: model,
          temperature: temperature,
          top_p: topP,
          functions: functions ? functionDefinitions : undefined
        })
      });
      
      if (!response.ok) {
        throw new Error(`Error en la API: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log("Respuesta de la API:", data);
      
      // Añadir la respuesta del asistente al chat
      let assistantContent = "No se pudo obtener una respuesta del agente.";
      
      // Verificar la estructura de la respuesta
      if (data && data.choices && data.choices.length > 0 && data.choices[0].message) {
        assistantContent = data.choices[0].message.content || assistantContent;
      }
      
      const assistantMessage = {
        role: "assistant",
        content: assistantContent
      };
      
      setMessages([...updatedMessages, assistantMessage]);
      setIsLoading(false);
    } catch (error) {
      console.error("Error al enviar mensaje:", error);
      setIsLoading(false);
      toast({
        title: "Error",
        description: "No se pudo enviar el mensaje",
        variant: "destructive",
      });
    }
  };

  // Manejar la adición de una nueva función
  const handleAddFunction = () => {
    try {
      const functionObj = JSON.parse(newFunctionJson)
      setFunctionDefinitions([...functionDefinitions, functionObj])
      setFunctions(true)
      setIsAddFunctionOpen(false)
      
      toast({
        title: "Función añadida",
        description: "La función ha sido añadida exitosamente",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "JSON inválido. Por favor, verifica el formato.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Assistants</h1>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Info className="h-4 w-4 mr-2" />
            Learn more
          </Button>
          <Button variant="outline" size="sm">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Panel lateral */}
        <div className="md:col-span-1">
          <Card className="mb-4">
            <CardContent className="pt-6 pb-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                  <Settings className="h-4 w-4 text-gray-600" />
                </div>
                <div className="flex-1">
                  <Select value={selectedAgent} onValueChange={handleAgentChange}>
                    <SelectTrigger className="border-0 p-0 h-auto font-medium text-base focus:ring-0">
                      <SelectValue placeholder="Seleccionar agente" />
                    </SelectTrigger>
                    <SelectContent>
                      {predefinedAgents.map((agent) => (
                        <SelectItem key={agent} value={agent}>
                          {agent}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-medium mb-2">Model</h3>
                  <Select value={model} onValueChange={setModel}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select model" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gpt-4o">gpt-4o</SelectItem>
                      <SelectItem value="gpt-4">gpt-4</SelectItem>
                      <SelectItem value="gpt-3.5-turbo">gpt-3.5-turbo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <h3 className="text-sm font-medium uppercase mb-2">Tools</h3>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-gray-500" />
                        <span>File Search</span>
                        <Info className="h-3 w-3 text-gray-400" />
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch 
                          checked={fileSearch} 
                          onCheckedChange={setFileSearch} 
                        />
                        <Dialog open={isAddFileOpen} onOpenChange={setIsAddFileOpen}>
                          <DialogTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-6 w-6 p-0"
                              onClick={() => setIsAddFileOpen(true)}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-[600px]">
                            <DialogHeader>
                              <DialogTitle>Attach files to file search</DialogTitle>
                            </DialogHeader>
                            <div className="py-6 flex flex-col items-center justify-center border-2 border-dashed rounded-lg">
                              <FileText className="h-10 w-10 text-gray-300 mb-4" />
                              <p className="text-lg font-medium mb-1">Drag your files here or click to upload</p>
                              <p className="text-sm text-gray-500">Information in attached files will be available to this assistant.</p>
                              <Button className="mt-4 bg-teal-500 hover:bg-teal-600">Upload</Button>
                            </div>
                            <DialogFooter>
                              <Button variant="outline" onClick={() => setIsAddFileOpen(false)}>
                                Cancel
                              </Button>
                              <Button>Attach</Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Code className="h-4 w-4 text-gray-500" />
                        <span>Code interpreter</span>
                        <Info className="h-3 w-3 text-gray-400" />
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch 
                          checked={codeInterpreter} 
                          onCheckedChange={setCodeInterpreter} 
                        />
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-6 w-6 p-0"
                          disabled
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <SquareTerminal className="h-4 w-4 text-gray-500" />
                        <span>Functions</span>
                        <Info className="h-3 w-3 text-gray-400" />
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch 
                          checked={functions} 
                          onCheckedChange={setFunctions} 
                        />
                        <Dialog open={isAddFunctionOpen} onOpenChange={setIsAddFunctionOpen}>
                          <DialogTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-6 w-6 p-0"
                              onClick={() => setIsAddFunctionOpen(true)}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-[600px]">
                            <DialogHeader>
                              <DialogTitle>Add function</DialogTitle>
                              <DialogDescription>
                                The model will intelligently decide to call functions based on input it receives from the user.
                              </DialogDescription>
                            </DialogHeader>
                            <div className="py-4">
                              <div className="flex justify-between items-center mb-2">
                                <h4 className="font-medium">Definition</h4>
                                <div className="flex gap-2">
                                  <Button variant="outline" size="sm">Generate</Button>
                                  <Button variant="outline" size="sm">Examples</Button>
                                </div>
                              </div>
                              <Textarea 
                                value={newFunctionJson}
                                onChange={(e) => setNewFunctionJson(e.target.value)}
                                className="font-mono text-sm h-[300px]"
                              />
                              <div className="mt-2 text-sm flex items-center">
                                <Button variant="link" className="p-0 h-auto text-sm text-blue-500">
                                  Add <code>"strict": true</code> to ensure the model's response always follows this schema.
                                </Button>
                              </div>
                            </div>
                            <DialogFooter>
                              <Button variant="outline" onClick={() => setIsAddFunctionOpen(false)}>
                                Cancel
                              </Button>
                              <Button onClick={handleAddFunction}>Save</Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium uppercase mb-2">Instructions</h3>
                  <div className="mb-2">
                    <Textarea
                      placeholder="Enter detailed instructions for the agent..."
                      className="min-h-[150px] text-sm"
                      value={systemInstructions}
                      onChange={(e) => setSystemInstructions(e.target.value)}
                    />
                    <div className="mt-2 text-xs text-gray-500">
                      These instructions will guide the agent's behavior and responses.
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={handleSaveConfiguration}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Save Instructions
                  </Button>
                </div>

                <div>
                  <h3 className="text-sm font-medium uppercase mb-2">Model Configuration</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm mb-2">Response format</h4>
                      <Select value={responseFormat} onValueChange={setResponseFormat}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select format" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="text">text</SelectItem>
                          <SelectItem value="markdown">markdown</SelectItem>
                          <SelectItem value="json">json</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <div className="flex justify-between mb-1">
                        <h4 className="text-sm">Temperature</h4>
                        <span className="text-sm">{temperature.toFixed(2)}</span>
                      </div>
                      <Slider
                        min={0}
                        max={1}
                        step={0.01}
                        value={[temperature]}
                        onValueChange={(value) => setTemperature(value[0])}
                      />
                    </div>
                    
                    <div>
                      <div className="flex justify-between mb-1">
                        <h4 className="text-sm">Top P</h4>
                        <span className="text-sm">{topP.toFixed(2)}</span>
                      </div>
                      <Slider
                        min={0}
                        max={1}
                        step={0.01}
                        value={[topP]}
                        onValueChange={(value) => setTopP(value[0])}
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium uppercase mb-2">API Version</h3>
                  <div className="flex items-center gap-2">
                    <span className="text-sm">Latest</span>
                    <Info className="h-3 w-3 text-gray-400" />
                  </div>
                </div>

                <div className="pt-4 flex justify-between items-center">
                  <div className="text-sm text-gray-500">
                    Updated {lastUpdated}
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-8 p-2 flex items-center">
                      <Copy className="h-4 w-4 mr-1" />
                      <span>Clone</span>
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Contenido principal - Área de chat */}
        <div className="md:col-span-3">
          <div className="border rounded-lg h-[600px] flex flex-col">
            <div className="p-4 border-b flex justify-between items-center">
              <div className="font-medium">THREAD</div>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <Settings className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <FileText className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" className="h-8 p-2 flex items-center">
                  <span>Logs</span>
                </Button>
              </div>
            </div>
            
            <div className="flex-1 p-4 flex flex-col justify-end overflow-y-auto">
              {messages.length === 0 ? (
                <div className="text-center text-gray-500 my-auto">
                  Envía un mensaje para comenzar una conversación con el agente
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((message, index) => (
                    <div
                      key={index}
                      className={`p-3 rounded-lg max-w-[80%] ${
                        message.role === "user"
                          ? "bg-blue-100 ml-auto"
                          : "bg-gray-100"
                      }`}
                    >
                      {message.content}
                    </div>
                  ))}
                  {isLoading && (
                    <div className="bg-gray-100 p-3 rounded-lg max-w-[80%] animate-pulse">
                      El agente está escribiendo...
                    </div>
                  )}
                </div>
              )}
            </div>
            
            <div className="p-4 border-t">
              <div className="border rounded-lg p-2 flex items-center">
                <Input
                  placeholder="Enter your message..."
                  className="border-0 focus-visible:ring-0 flex-1"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage();
                    }
                  }}
                />
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <FileText className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <Code className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <SquareTerminal className="h-4 w-4" />
                  </Button>
                  <Button
                    className="ml-2"
                    onClick={sendMessage}
                    disabled={isLoading || !inputMessage.trim()}
                  >
                    Run
                  </Button>
                </div>
              </div>
              <div className="text-xs text-gray-500 mt-2 text-center">
                Playground messages can be viewed by anyone at your organization using the API.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}