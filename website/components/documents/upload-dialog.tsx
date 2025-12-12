"use client"

import { useState, useCallback } from "react"
import { useDropzone } from "react-dropzone"
import { Upload, X, FileText, Loader2, AlertCircle, AlertTriangle } from "lucide-react"
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
import { uploadDocument } from "@/app/actions/documents"

export function UploadDocumentDialog() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [documentName, setDocumentName] = useState("")
  const [isUploading, setIsUploading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [warningMessage, setWarningMessage] = useState<string | null>(null)

  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
    // Clear any previous messages
    setErrorMessage(null)
    setWarningMessage(null)

    // Handle rejected files
    if (rejectedFiles.length > 0) {
      const rejection = rejectedFiles[0]
      let errorMsg = "File upload failed. Please try again."

      if (rejection.errors[0]?.code === 'file-too-large') {
        errorMsg = `File is too large (${(rejection.file.size / 1024 / 1024).toFixed(2)} MB). Maximum size is 25 MB.`
      } else if (rejection.errors[0]?.code === 'file-invalid-type') {
        errorMsg = "Invalid file type. Please upload a PDF file."
      }

      setErrorMessage(errorMsg)
      toast.error(errorMsg)
      return
    }

    if (acceptedFiles.length > 0) {
      const uploadedFile = acceptedFiles[0]
      const maxSize = 25 * 1024 * 1024 // 25 MB hard limit
      const warningSize = 10 * 1024 * 1024 // 10 MB warning threshold

      // Check hard limit
      if (uploadedFile.size > maxSize) {
        const errorMsg = `File is too large (${(uploadedFile.size / 1024 / 1024).toFixed(2)} MB). Maximum size is 25 MB.`
        setErrorMessage(errorMsg)
        toast.error(errorMsg)
        return
      }

      // Show warning for files over 10 MB but under 25 MB
      if (uploadedFile.size > warningSize) {
        const warningMsg = `Large file detected (${(uploadedFile.size / 1024 / 1024).toFixed(2)} MB). Processing may take longer than usual.`
        setWarningMessage(warningMsg)
        toast.warning(warningMsg)
      }

      setFile(uploadedFile)
      // Auto-populate name from filename without extension
      if (!documentName) {
        const nameWithoutExt = uploadedFile.name.replace(/\.[^/.]+$/, "")
        setDocumentName(nameWithoutExt)
      }
    }
  }, [documentName])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf']
    },
    maxFiles: 1,
    multiple: false,
    maxSize: 25 * 1024 * 1024, // 25 MB
  })

  const handleUpload = async () => {
    if (!file || !documentName.trim()) {
      toast.error("Please provide a document name")
      return
    }

    // Final validation before upload
    const maxSize = 25 * 1024 * 1024 // 25 MB
    if (file.size > maxSize) {
      toast.error("File is too large. Maximum size is 25 MB.")
      return
    }

    setIsUploading(true)
    const formData = new FormData()
    formData.append('file', file)
    formData.append('name', documentName.trim())

    try {
      const result = await uploadDocument(formData)

      if (result.error) {
        toast.error(result.error)
        setIsUploading(false)
      } else {
        toast.success("Document uploaded successfully! Click 'Process' to generate questions.")
        setFile(null)
        setDocumentName("")
        setOpen(false)
        setIsUploading(false)
        router.refresh() // Refresh the page to show the new document
      }
    } catch (error) {
      toast.error("An unexpected error occurred.")
      console.error(error)
      setIsUploading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      setOpen(isOpen)
      if (!isOpen) {
        setErrorMessage(null)
        setWarningMessage(null)
      }
    }}>
      <DialogTrigger asChild>
        <Button>
          <Upload className="mr-2 h-4 w-4" />
          Upload PDF
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Upload Document</DialogTitle>
          <DialogDescription>
            Upload a PDF document. You can process it later to generate exam questions.
          </DialogDescription>
        </DialogHeader>

        {errorMessage && (
          <div className="flex items-start gap-3 rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
            <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="font-semibold">Upload Failed</p>
              <p className="mt-1 text-destructive/90">{errorMessage}</p>
            </div>
            <button
              onClick={() => setErrorMessage(null)}
              className="text-destructive/70 hover:text-destructive"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {warningMessage && (
          <div className="flex items-start gap-3 rounded-lg border border-warning/50 bg-warning/10 p-4 text-sm text-warning">
            <AlertTriangle className="h-5 w-5 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="font-semibold">Large File Warning</p>
              <p className="mt-1 text-warning/90">{warningMessage}</p>
            </div>
            <button
              onClick={() => setWarningMessage(null)}
              className="text-warning/70 hover:text-warning"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <label htmlFor="document-name" className="text-sm font-medium">
              Document Name
            </label>
            <input
              id="document-name"
              type="text"
              placeholder="e.g., Chapter 5: Algorithms"
              value={documentName}
              onChange={(e) => setDocumentName(e.target.value)}
              disabled={isUploading}
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-medium">
              PDF File
            </label>
          {!file ? (
            <div
              {...getRootProps()}
              className={`
                border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
                ${isDragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:border-primary/50'}
              `}
            >
              <input {...getInputProps()} />
              <div className="flex flex-col items-center gap-2 text-muted-foreground">
                <Upload className="h-8 w-8" />
                {isDragActive ? (
                  <p>Drop the PDF here...</p>
                ) : (
                  <p>Drag & drop a PDF here, or click to select</p>
                )}
                <span className="text-xs">Max 25 MB (files over 10 MB may take longer to process)</span>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/50">
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="p-2 bg-background rounded border">
                  <FileText className="h-4 w-4 text-primary" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-sm font-medium truncate max-w-[200px]">{file.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </span>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                onClick={(e) => {
                  e.stopPropagation()
                  setFile(null)
                  setDocumentName("")
                }}
                disabled={isUploading}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}
          </div>
        </div>

        <DialogFooter>
          <Button
            onClick={handleUpload}
            disabled={!file || isUploading}
            className="w-full sm:w-auto"
          >
            {isUploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : (
              'Upload Document'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
