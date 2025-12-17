"use client"

import { useState, useTransition, useRef, useEffect } from "react"
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
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Sparkles, Plus, Loader2 } from "lucide-react"
import { createSystemPrompt, createCustomPrompt, getAllPrompts } from "@/app/actions/prompts"
import { toast } from "sonner"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { Question } from "@/lib/types"

interface AskAIDialogProps {
  question: Question
  documentId: string
  onExplanationGenerated: (explanation: any) => void
}

export function AskAIDialog({ question, documentId, onExplanationGenerated }: AskAIDialogProps) {
  const [open, setOpen] = useState(false)
  const [promptType, setPromptType] = useState<'system' | 'custom'>('system')
  const [selectedPromptId, setSelectedPromptId] = useState<string>('')
  const [systemPrompts, setSystemPrompts] = useState<any[]>([])
  const [customPrompts, setCustomPrompts] = useState<any[]>([])
  const [isCreatingPrompt, setIsCreatingPrompt] = useState(false)
  const [newPromptName, setNewPromptName] = useState('')
  const [newPromptContent, setNewPromptContent] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [streamingContent, setStreamingContent] = useState('')
  const [displayedContent, setDisplayedContent] = useState('')
  const [isPending, startTransition] = useTransition()
  const streamingContainerRef = useRef<HTMLDivElement>(null)
  const animationFrameRef = useRef<number | undefined>(undefined)

  // Smooth character-by-character reveal animation
  useEffect(() => {
    if (!isGenerating) {
      setDisplayedContent(streamingContent)
      return
    }

    if (displayedContent.length >= streamingContent.length) {
      return
    }

    const revealNextChars = () => {
      setDisplayedContent(prev => {
        const remaining = streamingContent.slice(prev.length)
        // Reveal 2-4 characters at a time for smooth but fast streaming
        const charsToReveal = Math.min(3, remaining.length)
        return streamingContent.slice(0, prev.length + charsToReveal)
      })

      // Continue animation
      animationFrameRef.current = requestAnimationFrame(revealNextChars)
    }

    // Start or continue the reveal animation with a slight delay for smoothness
    const timeout = setTimeout(() => {
      animationFrameRef.current = requestAnimationFrame(revealNextChars)
    }, 16) // ~60fps

    return () => {
      clearTimeout(timeout)
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [streamingContent, displayedContent, isGenerating])

  // Auto-scroll to bottom when displayed content updates
  useEffect(() => {
    if (isGenerating && streamingContainerRef.current) {
      streamingContainerRef.current.scrollTop = streamingContainerRef.current.scrollHeight
    }
  }, [displayedContent, isGenerating])

  // Load prompts when dialog opens
  const handleOpenChange = async (isOpen: boolean) => {
    setOpen(isOpen)
    if (isOpen && systemPrompts.length === 0 && customPrompts.length === 0) {
      const result = await getAllPrompts()
      if (result.success) {
        setSystemPrompts(result.systemPrompts || [])
        setCustomPrompts(result.customPrompts || [])
      }
    }
  }

  const handleCreatePrompt = () => {
    if (!newPromptName || !newPromptContent) {
      toast.error("Prompt name and content are required")
      return
    }

    startTransition(async () => {
      const result = promptType === 'system'
        ? await createSystemPrompt(newPromptName, newPromptContent)
        : await createCustomPrompt(newPromptName, newPromptContent)

      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success("Prompt created")
        setIsCreatingPrompt(false)
        setNewPromptName('')
        setNewPromptContent('')

        // Reload prompts
        const updatedPrompts = await getAllPrompts()
        if (updatedPrompts.success) {
          setSystemPrompts(updatedPrompts.systemPrompts || [])
          setCustomPrompts(updatedPrompts.customPrompts || [])
          if (result.id) {
            setSelectedPromptId(result.id)
          }
        }
      }
    })
  }

  const handleGenerate = async () => {
    if (!selectedPromptId) {
      toast.error("Please select a prompt")
      return
    }

    setIsGenerating(true)
    setStreamingContent('')
    setDisplayedContent('')

    try {
      const response = await fetch('/api/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentId,
          questionId: question.id,
          promptId: selectedPromptId,
          promptType
        })
      })

      if (!response.ok) {
        throw new Error('Failed to generate explanation')
      }

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()

      if (!reader) {
        throw new Error('No response body')
      }

      let fullContent = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value)
        const lines = chunk.split('\n')

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = JSON.parse(line.slice(6))

            if (data.error) {
              toast.error(data.error)
              setIsGenerating(false)
              return
            }

            if (data.chunk) {
              fullContent += data.chunk
              setStreamingContent(fullContent)
            }

            if (data.done) {
              // Get prompt name
              const prompts = promptType === 'system' ? systemPrompts : customPrompts
              const prompt = prompts.find(p => p.id === selectedPromptId)

              // Immediately show all content (stop animation)
              setDisplayedContent(fullContent)
              setIsGenerating(false)

              onExplanationGenerated({
                content: fullContent,
                promptId: selectedPromptId,
                promptName: prompt?.name || 'Unknown',
                promptType,
                generatedAt: Date.now()
              })

              toast.success("Explanation generated!")

              // Wait a moment for user to see completion, then close
              setTimeout(() => {
                setOpen(false)
              }, 1500)
            }
          }
        }
      }
    } catch (error) {
      console.error('Generation error:', error)
      toast.error("Failed to generate explanation")
      setIsGenerating(false)
    }
  }

  const currentPrompts = promptType === 'system' ? systemPrompts : customPrompts

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Sparkles className="mr-2 h-4 w-4" />
          Ask AI
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Ask AI for Explanation</DialogTitle>
          <DialogDescription>
            Select a prompt to generate an explanation for this question.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {!isGenerating ? (
            <>
              {/* Prompt Type Selection */}
              <Tabs value={promptType} onValueChange={(v) => setPromptType(v as 'system' | 'custom')}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="system">System Prompts</TabsTrigger>
                  <TabsTrigger value="custom">Custom Prompts</TabsTrigger>
                </TabsList>
              </Tabs>

              {/* Prompt Selection or Creation */}
              {!isCreatingPrompt ? (
                <div className="space-y-4">
                  <div className="grid gap-2">
                    <Label>Select Prompt</Label>
                    <Select value={selectedPromptId} onValueChange={setSelectedPromptId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a prompt..." />
                      </SelectTrigger>
                      <SelectContent>
                        {currentPrompts.map((prompt) => (
                          <SelectItem key={prompt.id} value={prompt.id}>
                            {prompt.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => setIsCreatingPrompt(true)}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Create New {promptType === 'system' ? 'System' : 'Custom'} Prompt
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid gap-2">
                    <Label>Prompt Name</Label>
                    <Input
                      placeholder="e.g., Detailed Explanation"
                      value={newPromptName}
                      onChange={(e) => setNewPromptName(e.target.value)}
                      disabled={isPending}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>Prompt Content</Label>
                    <Textarea
                      placeholder="Provide a detailed explanation that..."
                      value={newPromptContent}
                      onChange={(e) => setNewPromptContent(e.target.value)}
                      disabled={isPending}
                      rows={6}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setIsCreatingPrompt(false)}
                      disabled={isPending}
                    >
                      Cancel
                    </Button>
                    <Button onClick={handleCreatePrompt} disabled={isPending} className="flex-1">
                      {isPending ? "Creating..." : "Create & Use"}
                    </Button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Generating explanation...
              </div>
              <div
                ref={streamingContainerRef}
                className="prose prose-sm dark:prose-invert max-w-none p-4 rounded-md border bg-muted/30 max-h-[400px] overflow-y-auto scroll-smooth"
              >
                <div className="streaming-text">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {displayedContent || "*Thinking...*"}
                  </ReactMarkdown>
                  {isGenerating && <span className="typing-cursor inline-block w-[2px] h-4 bg-primary ml-1 animate-pulse" />}
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={isGenerating}
          >
            Cancel
          </Button>
          {!isGenerating && !isCreatingPrompt && (
            <Button onClick={handleGenerate} disabled={!selectedPromptId}>
              <Sparkles className="mr-2 h-4 w-4" />
              Generate Explanation
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
