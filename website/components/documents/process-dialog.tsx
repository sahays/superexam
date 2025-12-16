"use client"

import { useState, useEffect } from "react"
import { Bot, Loader2, Plus, MessageSquare } from "lucide-react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { processDocument } from "@/app/actions/documents"
import { createSystemPrompt, createCustomPrompt, getAllPrompts } from "@/app/actions/prompts"
import { SystemPrompt, CustomPrompt } from "@/lib/types"

interface ProcessDocumentDialogProps {
  docId: string
  docTitle: string
  buttonText?: string
}

export function ProcessDocumentDialog({ docId, docTitle, buttonText = "Process with AI" }: ProcessDocumentDialogProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [isLoadingPrompts, setIsLoadingPrompts] = useState(false)

  // Prompt lists
  const [systemPrompts, setSystemPrompts] = useState<SystemPrompt[]>([])
  const [customPrompts, setCustomPrompts] = useState<CustomPrompt[]>([])

  // Selected prompts
  const [selectedSystemPrompt, setSelectedSystemPrompt] = useState<string>("")
  const [selectedCustomPrompt, setSelectedCustomPrompt] = useState<string>("")

  // Inline creation mode
  const [creatingSystemPrompt, setCreatingSystemPrompt] = useState(false)
  const [creatingCustomPrompt, setCreatingCustomPrompt] = useState(false)

  // New prompt fields
  const [newSystemPromptName, setNewSystemPromptName] = useState("")
  const [newSystemPromptContent, setNewSystemPromptContent] = useState("")
  const [newCustomPromptName, setNewCustomPromptName] = useState("")
  const [newCustomPromptContent, setNewCustomPromptContent] = useState("")


  // Load prompts when dialog opens
  useEffect(() => {
    if (open) {
      loadPrompts()
    }
  }, [open])

  const loadPrompts = async () => {
    setIsLoadingPrompts(true)
    try {
      const result = await getAllPrompts()
      if (result.error) {
        toast.error(result.error)
      } else {
        setSystemPrompts(result.systemPrompts || [])
        setCustomPrompts(result.customPrompts || [])
      }
    } catch (error) {
      console.error("Error loading prompts:", error)
      toast.error("Failed to load prompts")
    } finally {
      setIsLoadingPrompts(false)
    }
  }


  const handleCreateSystemPrompt = async () => {
    if (!newSystemPromptName.trim() || !newSystemPromptContent.trim()) {
      toast.error("Name and content are required")
      return
    }

    try {
      const result = await createSystemPrompt(newSystemPromptName, newSystemPromptContent)
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success("System prompt created")
        await loadPrompts()
        setSelectedSystemPrompt(result.id!)
        setCreatingSystemPrompt(false)
        setNewSystemPromptName("")
        setNewSystemPromptContent("")
      }
    } catch (error) {
      toast.error("Failed to create system prompt")
      console.error(error)
    }
  }

  const handleCreateCustomPrompt = async () => {
    if (!newCustomPromptName.trim() || !newCustomPromptContent.trim()) {
      toast.error("Name and content are required")
      return
    }

    try {
      const result = await createCustomPrompt(newCustomPromptName, newCustomPromptContent)
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success("Custom prompt created")
        await loadPrompts()
        setSelectedCustomPrompt(result.id!)
        setCreatingCustomPrompt(false)
        setNewCustomPromptName("")
        setNewCustomPromptContent("")
      }
    } catch (error) {
      toast.error("Failed to create custom prompt")
      console.error(error)
    }
  }

  const handleProcess = async () => {
    if (!selectedSystemPrompt || !selectedCustomPrompt) {
      toast.error("Please select both system and custom prompts")
      return
    }

    setIsProcessing(true)

    try {
      const result = await processDocument(docId, selectedSystemPrompt, selectedCustomPrompt)

      if (result.error) {
        toast.error(result.error)
      } else {
        setOpen(false)
        toast.success("Processing started! Watch the card for updates.")
        // Small delay to ensure DB write propagates before refresh
        setTimeout(() => {
          router.refresh()
        }, 500)
        
        // Reset selection
        setSelectedSystemPrompt("")
        setSelectedCustomPrompt("")
      }
    } catch (error) {
      toast.error("An unexpected error occurred.")
      console.error(error)
    } finally {
      setIsProcessing(false)
    }
  }

  const resetDialog = () => {
    setCreatingSystemPrompt(false)
    setCreatingCustomPrompt(false)
    setNewSystemPromptName("")
    setNewSystemPromptContent("")
    setNewCustomPromptName("")
    setNewCustomPromptContent("")
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      setOpen(isOpen)
      if (!isOpen) resetDialog()
    }}>
      <DialogTrigger asChild>
        <Button className="w-full">
          <Bot className="mr-2 h-4 w-4" />
          {buttonText}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Process Document</DialogTitle>
          <DialogDescription>
            Generate questions for <strong>{docTitle}</strong>. Select or create prompts to guide the AI.
          </DialogDescription>
        </DialogHeader>

        {isLoadingPrompts ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="grid gap-6 py-4">
            {/* System Prompt Section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="system-prompt" className="text-base font-semibold">
                  System Prompt
                </Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setCreatingSystemPrompt(!creatingSystemPrompt)}
                >
                  <Plus className="mr-2 h-3 w-3" />
                  {creatingSystemPrompt ? "Cancel" : "Create New"}
                </Button>
              </div>

              {creatingSystemPrompt ? (
                <div className="space-y-3 p-4 border rounded-lg bg-muted/50">
                  <div className="space-y-2">
                    <Label htmlFor="new-system-name">Name</Label>
                    <Input
                      id="new-system-name"
                      placeholder="e.g., Quiz Master"
                      value={newSystemPromptName}
                      onChange={(e) => setNewSystemPromptName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new-system-content">Content</Label>
                    <Textarea
                      id="new-system-content"
                      placeholder="You are an expert quiz master. Your task is to..."
                      value={newSystemPromptContent}
                      onChange={(e) => setNewSystemPromptContent(e.target.value)}
                      rows={5}
                    />
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    onClick={handleCreateSystemPrompt}
                    className="w-full"
                  >
                    Create System Prompt
                  </Button>
                </div>
              ) : (
                <Select value={selectedSystemPrompt} onValueChange={setSelectedSystemPrompt}>
                  <SelectTrigger id="system-prompt">
                    <SelectValue placeholder="Select a system prompt..." />
                  </SelectTrigger>
                  <SelectContent>
                    {systemPrompts.length === 0 ? (
                      <div className="py-6 text-center text-sm text-muted-foreground">
                        No system prompts found. Create one above.
                      </div>
                    ) : (
                      systemPrompts.map((prompt) => (
                        <SelectItem key={prompt.id} value={prompt.id}>
                          <div className="flex items-center gap-2">
                            <MessageSquare className="h-3 w-3" />
                            {prompt.name}
                          </div>
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              )}
            </div>

            {/* Custom Prompt Section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="custom-prompt" className="text-base font-semibold">
                  Custom Prompt
                </Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setCreatingCustomPrompt(!creatingCustomPrompt)}
                >
                  <Plus className="mr-2 h-3 w-3" />
                  {creatingCustomPrompt ? "Cancel" : "Create New"}
                </Button>
              </div>

              {creatingCustomPrompt ? (
                <div className="space-y-3 p-4 border rounded-lg bg-muted/50">
                  <div className="space-y-2">
                    <Label htmlFor="new-custom-name">Name</Label>
                    <Input
                      id="new-custom-name"
                      placeholder="e.g., Technical Exam"
                      value={newCustomPromptName}
                      onChange={(e) => setNewCustomPromptName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new-custom-content">Content</Label>
                    <Textarea
                      id="new-custom-content"
                      placeholder="Generate 10 multiple choice questions that..."
                      value={newCustomPromptContent}
                      onChange={(e) => setNewCustomPromptContent(e.target.value)}
                      rows={5}
                    />
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    onClick={handleCreateCustomPrompt}
                    className="w-full"
                  >
                    Create Custom Prompt
                  </Button>
                </div>
              ) : (
                <Select value={selectedCustomPrompt} onValueChange={setSelectedCustomPrompt}>
                  <SelectTrigger id="custom-prompt">
                    <SelectValue placeholder="Select a custom prompt..." />
                  </SelectTrigger>
                  <SelectContent>
                    {customPrompts.length === 0 ? (
                      <div className="py-6 text-center text-sm text-muted-foreground">
                        No custom prompts found. Create one above.
                      </div>
                    ) : (
                      customPrompts.map((prompt) => (
                        <SelectItem key={prompt.id} value={prompt.id}>
                          <div className="flex items-center gap-2">
                            <MessageSquare className="h-3 w-3" />
                            {prompt.name}
                          </div>
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              )}
            </div>

          </div>
        )}

        <DialogFooter>
          <Button
            onClick={handleProcess}
            disabled={!selectedSystemPrompt || !selectedCustomPrompt || isProcessing || isLoadingPrompts}
            className="w-full sm:w-auto"
          >
            {isProcessing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Starting...
              </>
            ) : (
              'Start Processing'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
