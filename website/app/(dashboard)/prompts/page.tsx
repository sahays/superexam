import { getSystemPrompts } from "@/lib/db/prompts"
import { Separator } from "@/components/ui/separator"
import { PromptCard } from "@/components/prompts/prompt-card"
import { CreatePromptDialog } from "@/components/prompts/create-prompt-dialog"
import { RefreshButton } from "@/components/refresh-button"

export const dynamic = "force-dynamic";

export default async function PromptsPage() {
  const systemPrompts = await getSystemPrompts()

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Prompts</h1>
          <p className="text-muted-foreground">
            Manage prompts for AI explanations and question generation.
          </p>
        </div>
        <RefreshButton />
      </div>

      <Separator />

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <p className="text-sm text-muted-foreground">
            Prompts define the AI's role and behavior for generating explanations.
          </p>
          <CreatePromptDialog type="system" />
        </div>

        {systemPrompts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center border-2 border-dashed border-border rounded-[10px] bg-card">
            <h3 className="text-lg font-semibold">No prompts yet</h3>
            <p className="mb-6 text-sm text-muted-foreground max-w-sm">
              Create your first prompt to guide AI behavior.
            </p>
            <CreatePromptDialog type="system" />
          </div>
        ) : (
          <div className="grid gap-4 md:gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {systemPrompts.map((prompt) => (
              <PromptCard key={prompt.id} prompt={prompt} type="system" />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
