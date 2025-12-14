import { UploadDocumentDialog } from "@/components/documents/upload-dialog"
import { DocumentCard } from "@/components/documents/document-card"
import { getDocuments } from "@/lib/db/documents"
import { Separator } from "@/components/ui/separator"

export const dynamic = "force-dynamic";

export default async function DocumentsPage() {
  const documents = await getDocuments()

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Documents</h1>
          <p className="text-muted-foreground">
            Manage your study materials and generate exams.
          </p>
        </div>
        <UploadDocumentDialog />
      </div>
      
      <Separator />

      {documents.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center border-2 border-dashed border-border rounded-[10px] bg-card">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>
          </div>
          <h3 className="text-lg font-semibold">No documents yet</h3>
          <p className="mb-6 text-sm text-muted-foreground max-w-sm">
            Upload your first PDF to get started generating exams.
          </p>
          <UploadDocumentDialog />
        </div>
      ) : (
        <div className="grid gap-4 md:gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {documents.map((doc) => (
            <DocumentCard key={doc.id} doc={doc} />
          ))}
        </div>
      )}
    </div>
  )
}
