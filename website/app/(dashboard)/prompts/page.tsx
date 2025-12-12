import { getSystemPrompts, getCustomPrompts } from "@/lib/db/prompts"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PromptCard } from "@/components/prompts/prompt-card"
import { CreatePromptDialog } from "@/components/prompts/create-prompt-dialog"

export default async function PromptsPage() {
  const systemPrompts = await getSystemPrompts()
  const customPrompts = await getCustomPrompts()

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Prompts</h1>
          <p className="text-muted-foreground">
            Manage system and custom prompts for AI question generation.
          </p>
        </div>
      </div>

      <Separator />

      <Tabs defaultValue="system" className="space-y-6">
        <TabsList>
          <TabsTrigger value="system">System Prompts</TabsTrigger>
          <TabsTrigger value="custom">Custom Prompts</TabsTrigger>
        </TabsList>

        <TabsContent value="system" className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground">
              System prompts define the AI's role and behavior.
            </p>
            <CreatePromptDialog type="system" />
          </div>

          {systemPrompts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center border-2 border-dashed border-border rounded-[10px] bg-card">
              <h3 className="text-lg font-semibold">No system prompts yet</h3>
              <p className="mb-6 text-sm text-muted-foreground max-w-sm">
                Create your first system prompt to guide AI behavior.
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
        </TabsContent>

        <TabsContent value="custom" className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground">
              Custom prompts provide specific instructions for question generation.
            </p>
            <CreatePromptDialog type="custom" />
          </div>

          {customPrompts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center border-2 border-dashed border-border rounded-[10px] bg-card">
              <h3 className="text-lg font-semibold">No custom prompts yet</h3>
              <p className="mb-6 text-sm text-muted-foreground max-w-sm">
                Create your first custom prompt for question generation.
              </p>
              <CreatePromptDialog type="custom" />
            </div>
          ) : (
            <div className="grid gap-4 md:gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {customPrompts.map((prompt) => (
                <PromptCard key={prompt.id} prompt={prompt} type="custom" />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
