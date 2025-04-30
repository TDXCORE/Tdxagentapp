"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useToast } from "@/hooks/use-toast"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Download, FileText, Mail, Save } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export default function ContractsPage() {
  const [clientName, setClientName] = useState("")
  const [projectName, setProjectName] = useState("")
  const [contractType, setContractType] = useState("standard")
  const [loading, setLoading] = useState(false)
  const [contract, setContract] = useState<any>(null)
  const { toast } = useToast()

  const handleGenerateContract = async () => {
    if (!clientName || !projectName) {
      toast({
        title: "Missing information",
        description: "Please provide client name and project name",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      // Simulate contract generation
      setTimeout(() => {
        const generatedContract = {
          id: `CNT-${Math.floor(Math.random() * 10000)}`,
          client: clientName,
          project: projectName,
          type: contractType,
          date: new Date().toISOString(),
          status: "draft",
          content: `
# SERVICE AGREEMENT

This Service Agreement (the "Agreement") is entered into as of ${new Date().toLocaleDateString()} by and between:

**TDX** ("Service Provider"), a technology development company, and

**${clientName}** ("Client")

## 1. SERVICES

Service Provider agrees to provide Client with software development services for the project "${projectName}" as described in the attached Project Requirements Document.

## 2. PAYMENT

Client agrees to pay Service Provider according to the payment schedule outlined in the attached Quotation.

## 3. TERM

This Agreement shall commence on the date of execution and shall continue until all services have been provided, unless earlier terminated.

## 4. INTELLECTUAL PROPERTY

Upon receipt of full payment, Service Provider assigns to Client all rights, title, and interest in the deliverables.

## 5. CONFIDENTIALITY

Both parties agree to maintain the confidentiality of any proprietary information shared during the course of this Agreement.

## 6. TERMINATION

Either party may terminate this Agreement with 30 days written notice.

## 7. GOVERNING LAW

This Agreement shall be governed by the laws of [Jurisdiction].

## 8. SIGNATURES

**Service Provider:**
TDX
_____________________
Date: ${new Date().toLocaleDateString()}

**Client:**
${clientName}
_____________________
Date: ________________
          `,
        }

        setContract(generatedContract)
        setLoading(false)

        toast({
          title: "Contract Generated",
          description: "Contract has been successfully generated",
        })
      }, 1500)

      // In the actual implementation, we would call the Contract agent API here
      // const response = await fetch("/api/generate-contract", {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify({
      //     clientName,
      //     projectName,
      //     contractType
      //   }),
      // });
      // const data = await response.json();
      // setContract(data.contract);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate contract",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSaveContract = async () => {
    toast({
      title: "Contract Saved",
      description: "Contract has been saved to the database",
    })
  }

  const handleSendContract = async () => {
    toast({
      title: "Contract Sent",
      description: "Contract has been sent to the client for signature",
    })
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold">Contract Generator</h1>

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-4">
          <Card>
            <CardHeader>
              <CardTitle>Contract Information</CardTitle>
              <CardDescription>Enter the details to generate a contract</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="clientName">Client Name</Label>
                <Input
                  id="clientName"
                  placeholder="Enter client name"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="projectName">Project Name</Label>
                <Input
                  id="projectName"
                  placeholder="Enter project name"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contractType">Contract Type</Label>
                <Select value={contractType} onValueChange={setContractType}>
                  <SelectTrigger id="contractType">
                    <SelectValue placeholder="Select contract type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="standard">Standard Agreement</SelectItem>
                    <SelectItem value="nda">Non-Disclosure Agreement</SelectItem>
                    <SelectItem value="msa">Master Service Agreement</SelectItem>
                    <SelectItem value="sow">Statement of Work</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleGenerateContract} disabled={loading} className="w-full">
                {loading ? "Generating..." : "Generate Contract"}
              </Button>
            </CardFooter>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Contract Templates</CardTitle>
              <CardDescription>Select a template to start with</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Button variant="outline" className="w-full justify-start">
                  <FileText className="mr-2 h-4 w-4" />
                  Standard Service Agreement
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <FileText className="mr-2 h-4 w-4" />
                  Non-Disclosure Agreement
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <FileText className="mr-2 h-4 w-4" />
                  Master Service Agreement
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="col-span-8">
          <Card className="h-[calc(100vh-220px)] flex flex-col">
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Contract Preview</CardTitle>
                  <CardDescription>Preview and send the generated contract</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={handleSaveContract} disabled={!contract}>
                    <Save className="mr-2 h-4 w-4" />
                    Save
                  </Button>
                  <Button variant="outline" onClick={handleSendContract} disabled={!contract}>
                    <Mail className="mr-2 h-4 w-4" />
                    Send for Signature
                  </Button>
                  <Button variant="outline" disabled={!contract}>
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex-1 overflow-hidden">
              <Tabs defaultValue="preview" className="h-full">
                <TabsList className="grid grid-cols-2">
                  <TabsTrigger value="preview">Preview</TabsTrigger>
                  <TabsTrigger value="history">History</TabsTrigger>
                </TabsList>
                <TabsContent value="preview" className="h-[calc(100%-40px)]">
                  <ScrollArea className="h-full pr-4">
                    {contract ? (
                      <div className="prose dark:prose-invert max-w-none">
                        <pre className="whitespace-pre-wrap">{contract.content}</pre>
                      </div>
                    ) : (
                      <div className="h-full flex items-center justify-center text-gray-500">
                        <p>Generate a contract to see the preview</p>
                      </div>
                    )}
                  </ScrollArea>
                </TabsContent>
                <TabsContent value="history" className="h-[calc(100%-40px)]">
                  <ScrollArea className="h-full pr-4">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Contract ID</TableHead>
                          <TableHead>Client</TableHead>
                          <TableHead>Project</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <TableRow>
                          <TableCell>CNT-1234</TableCell>
                          <TableCell>Acme Inc.</TableCell>
                          <TableCell>Customer Portal</TableCell>
                          <TableCell>2023-06-15</TableCell>
                          <TableCell>Signed</TableCell>
                          <TableCell>
                            <Button variant="ghost" size="sm">
                              <Download className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>CNT-1235</TableCell>
                          <TableCell>TechCorp</TableCell>
                          <TableCell>Mobile App</TableCell>
                          <TableCell>2023-06-20</TableCell>
                          <TableCell>Draft</TableCell>
                          <TableCell>
                            <Button variant="ghost" size="sm">
                              <Download className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </ScrollArea>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
