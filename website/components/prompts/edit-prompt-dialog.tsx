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
import { Edit2 } from "lucide-react"
import { updateSystemPrompt, updateCustomPrompt } from "@/app/actions/prompts"
import { toast } from "sonner"
import { SystemPrompt, CustomPrompt } from "@/lib/types"

interface EditPromptDialogProps {
  prompt: SystemPrompt | CustomPrompt
  type: "system" | "custom"
}

export function EditPromptDialog({ prompt, type }: EditPromptDialogProps) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState(prompt.name)
  const [content, setContent] = useState(prompt.content)
  const [isPending, startTransition] = useTransition()

  // Reset form when dialog opens
  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen)
    if (isOpen) {
      setName(prompt.name)
      setContent(prompt.content)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!name || !content) {
      toast.error("Name and content are required")
      return
    }

    startTransition(async () => {
      const result = type === "system"
        ? await updateSystemPrompt(prompt.id, { name, content })
        : await updateCustomPrompt(prompt.id, { name, content })

      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success(`${type === "system" ? "System" : "Custom"} prompt updated`)
        setOpen(false)
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="flex-1">
          <Edit2 className="mr-2 h-4 w-4" />
          Edit
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Edit {type === "system" ? "System" : "Custom"} Prompt</DialogTitle>
            <DialogDescription>
              {type === "system"
                ? "Update the AI's role and behavior for question generation."
                : "Update specific instructions for how questions should be generated."}
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
              {isPending ? "Updating..." : "Update Prompt"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
