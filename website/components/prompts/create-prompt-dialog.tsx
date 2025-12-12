"use client"

import { useState, useTransition } from "react"
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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Plus } from "lucide-react"
import { createSystemPrompt, createCustomPrompt } from "@/app/actions/prompts"
import { toast } from "sonner"

interface CreatePromptDialogProps {
  type: "system" | "custom"
}

export function CreatePromptDialog({ type }: CreatePromptDialogProps) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState("")
  const [content, setContent] = useState("")
  const [isPending, startTransition] = useTransition()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!name || !content) {
      toast.error("Name and content are required")
      return
    }

    startTransition(async () => {
      const result = type === "system"
        ? await createSystemPrompt(name, content)
        : await createCustomPrompt(name, content)

      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success(`${type === "system" ? "System" : "Custom"} prompt created`)
        setOpen(false)
        setName("")
        setContent("")
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Create {type === "system" ? "System" : "Custom"} Prompt
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create {type === "system" ? "System" : "Custom"} Prompt</DialogTitle>
            <DialogDescription>
              {type === "system"
                ? "Define the AI's role and behavior for question generation."
                : "Provide specific instructions for how questions should be generated."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                placeholder="e.g., Quiz Master, Technical Exam, etc."
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isPending}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="content">Content</Label>
              <Textarea
                id="content"
                placeholder={
                  type === "system"
                    ? "You are an expert quiz master. Your task is to..."
                    : "Generate 10 multiple choice questions that..."
                }
                value={content}
                onChange={(e) => setContent(e.target.value)}
                disabled={isPending}
                rows={8}
                className="resize-none"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isPending}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Creating..." : "Create Prompt"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
