import { UploadDocumentDialog } from "@/components/documents/upload-dialog"
import { DocumentCard } from "@/components/documents/document-card"
import { getDocuments } from "@/lib/db/documents"
import { Separator } from "@/components/ui/separator"

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
        <div className="flex flex-col items-center justify-center py-12 text-center border-2 border-dashed rounded-lg bg-muted/10">
          <h3 className="mt-4 text-lg font-semibold">No documents yet</h3>
          <p className="mb-4 text-sm text-muted-foreground">
            Upload your first PDF to get started generating exams.
          </p>
          <UploadDocumentDialog />
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {documents.map((doc) => (
            <DocumentCard key={doc.id} doc={doc} />
          ))}
        </div>
      )}
    </div>
  )
}
