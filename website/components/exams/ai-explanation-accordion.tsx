"use client"

import { useState, useTransition, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Sparkles, Plus, Loader2, Check } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { createSystemPrompt, createCustomPrompt, getAllPrompts } from "@/app/actions/prompts"
import { toast } from "sonner"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import remarkMath from "remark-math"
import rehypeKatex from "rehype-katex"
import "katex/dist/katex.min.css"
import { Question } from "@/lib/types"

interface AIExplanationAccordionProps {
  question: Question
  documentId: string
  onExplanationGenerated: (explanation: any) => void
  existingExplanation?: any
}

type GenerationStatus = 'idle' | 'thinking' | 'generating' | 'complete'

export function AIExplanationAccordion({
  question,
  documentId,
  onExplanationGenerated,
  existingExplanation
}: AIExplanationAccordionProps) {
  const [accordionValue, setAccordionValue] = useState<string>("")
  const [promptType, setPromptType] = useState<'system' | 'custom'>('system')
  const [selectedPromptId, setSelectedPromptId] = useState<string>('')
  const [systemPrompts, setSystemPrompts] = useState<any[]>([])
  const [customPrompts, setCustomPrompts] = useState<any[]>([])
  const [isCreatingPrompt, setIsCreatingPrompt] = useState(false)
  const [newPromptName, setNewPromptName] = useState('')
  const [newPromptContent, setNewPromptContent] = useState('')
  const [generationStatus, setGenerationStatus] = useState<GenerationStatus>('idle')
  const [streamingContent, setStreamingContent] = useState('')
  const [displayedContent, setDisplayedContent] = useState('')
  const [thinkingDots, setThinkingDots] = useState(0)
  const [isPending, startTransition] = useTransition()
  const [promptsLoaded, setPromptsLoaded] = useState(false)
  const streamingContainerRef = useRef<HTMLDivElement>(null)
  const animationFrameRef = useRef<number | undefined>(undefined)

  // Reset and load explanation when question changes
  useEffect(() => {
    // Reset all state when question changes
    setGenerationStatus('idle')
    setSelectedPromptId('')
    setIsCreatingPrompt(false)
    setThinkingDots(0)

    // Load existing explanation if it exists
    if (existingExplanation?.content) {
      setDisplayedContent(existingExplanation.content)
      setStreamingContent(existingExplanation.content)
    } else {
      // Clear content if no existing explanation
      setDisplayedContent('')
      setStreamingContent('')
    }
  }, [question.id, existingExplanation])

  // Load prompts when accordion opens
  useEffect(() => {
    if (accordionValue === "explanation" && !promptsLoaded) {
      loadPrompts()
    }
  }, [accordionValue, promptsLoaded])

  const loadPrompts = async () => {
    const result = await getAllPrompts()
    if (result.success) {
      setSystemPrompts(result.systemPrompts || [])
      setCustomPrompts(result.customPrompts || [])
      setPromptsLoaded(true)
    }
  }

  // Animated thinking dots (●○○ → ○●○ → ○○●)
  useEffect(() => {
    if (generationStatus !== 'thinking') return

    const interval = setInterval(() => {
      setThinkingDots(prev => (prev + 1) % 3)
    }, 500)

    return () => clearInterval(interval)
  }, [generationStatus])

  // Smooth character-by-character reveal animation
  useEffect(() => {
    if (generationStatus !== 'generating') {
      setDisplayedContent(streamingContent)
      return
    }

    if (displayedContent.length >= streamingContent.length) {
      return
    }

    const revealNextChars = () => {
      setDisplayedContent(prev => {
        const remaining = streamingContent.slice(prev.length)
        const charsToReveal = Math.min(3, remaining.length)
        return streamingContent.slice(0, prev.length + charsToReveal)
      })

      animationFrameRef.current = requestAnimationFrame(revealNextChars)
    }

    const timeout = setTimeout(() => {
      animationFrameRef.current = requestAnimationFrame(revealNextChars)
    }, 16)

    return () => {
      clearTimeout(timeout)
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [streamingContent, displayedContent, generationStatus])

  // Auto-scroll to bottom when displayed content updates
  useEffect(() => {
    if (generationStatus === 'generating' && streamingContainerRef.current) {
      streamingContainerRef.current.scrollTop = streamingContainerRef.current.scrollHeight
    }
  }, [displayedContent, generationStatus])

  // Auto-hide "Complete!" status after 2 seconds
  useEffect(() => {
    if (generationStatus === 'complete') {
      const timeout = setTimeout(() => {
        setGenerationStatus('idle')
      }, 2000)
      return () => clearTimeout(timeout)
    }
  }, [generationStatus])

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

    setGenerationStatus('thinking')
    setStreamingContent('')
    setDisplayedContent('')
    setThinkingDots(0)

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
      let hasReceivedFirstChunk = false

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
              setGenerationStatus('idle')
              return
            }

            if (data.chunk) {
              if (!hasReceivedFirstChunk) {
                setGenerationStatus('generating')
                hasReceivedFirstChunk = true
              }
              fullContent += data.chunk
              setStreamingContent(fullContent)
            }

            if (data.done) {
              const prompts = promptType === 'system' ? systemPrompts : customPrompts
              const prompt = prompts.find(p => p.id === selectedPromptId)

              setDisplayedContent(fullContent)
              setGenerationStatus('complete')

              onExplanationGenerated({
                content: fullContent,
                promptId: selectedPromptId,
                promptName: prompt?.name || 'Unknown',
                promptType,
                generatedAt: Date.now()
              })

              toast.success("Explanation generated!")
            }
          }
        }
      }
    } catch (error) {
      console.error('Generation error:', error)
      toast.error("Failed to generate explanation")
      setGenerationStatus('idle')
    }
  }

  const currentPrompts = promptType === 'system' ? systemPrompts : customPrompts

  const renderThinkingDots = () => {
    const dots = ['○', '○', '○']
    dots[thinkingDots] = '●'
    return dots.join('')
  }

  const renderStatusMessage = () => {
    if (generationStatus === 'thinking') {
      return (
        <div className="flex items-center gap-2 text-sm font-medium text-primary mb-3">
          <span className="text-lg leading-none">{renderThinkingDots()}</span>
          <span>Thinking...</span>
        </div>
      )
    }
    if (generationStatus === 'generating') {
      return (
        <div className="flex items-center gap-2 text-sm font-medium text-primary mb-3">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Generating explanation...</span>
        </div>
      )
    }
    if (generationStatus === 'complete') {
      return (
        <div className="flex items-center gap-2 text-sm font-medium text-green-600 dark:text-green-400 mb-3">
          <Check className="h-4 w-4" />
          <span>Complete!</span>
        </div>
      )
    }
    return null
  }

  return (
    <Accordion
      type="single"
      collapsible
      value={accordionValue}
      onValueChange={setAccordionValue}
      className="w-full"
    >
      <AccordionItem value="explanation" className="border rounded-lg px-4">
        <AccordionTrigger className="hover:no-underline">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="font-medium">Ask AI for Explanation</span>
          </div>
        </AccordionTrigger>
        <AccordionContent className="pt-4 pb-6">
          <div className="space-y-4">
            {/* Response Section */}
            {(displayedContent || generationStatus !== 'idle') && (
              <div className="space-y-3">
                {renderStatusMessage()}

                <div
                  ref={streamingContainerRef}
                  className="prose prose-sm dark:prose-invert max-w-none p-4 rounded-md border bg-muted/30 max-h-[400px] overflow-y-auto scroll-smooth"
                >
                  {displayedContent ? (
                    <div className="streaming-text">
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm, remarkMath]}
                        rehypePlugins={[rehypeKatex]}
                      >
                        {displayedContent}
                      </ReactMarkdown>
                      {generationStatus === 'generating' && (
                        <span className="typing-cursor inline-block w-[2px] h-4 bg-primary ml-1 animate-pulse" />
                      )}
                    </div>
                  ) : (
                    <div className="text-muted-foreground text-sm italic">
                      Waiting for response...
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Separator */}
            {(displayedContent || generationStatus !== 'idle') && (
              <Separator className="my-4" />
            )}

            {/* Prompt Selection Form */}
            <div className="max-w-lg mx-auto space-y-4">
              <Tabs value={promptType} onValueChange={(v) => setPromptType(v as 'system' | 'custom')}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="system">System Prompts</TabsTrigger>
                  <TabsTrigger value="custom">Custom Prompts</TabsTrigger>
                </TabsList>
              </Tabs>

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
                    onClick={() => setIsCreatingPrompt(true)}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Create New {promptType === 'system' ? 'System' : 'Custom'} Prompt
                  </Button>

                  <Button
                    onClick={handleGenerate}
                    disabled={!selectedPromptId || generationStatus === 'thinking' || generationStatus === 'generating'}
                  >
                    <Sparkles className="mr-2 h-4 w-4" />
                    Generate Explanation
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
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  )
}
