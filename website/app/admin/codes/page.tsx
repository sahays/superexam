import { getAccessCodes } from "@/app/actions/auth"
import { CodeManager } from "@/components/admin/code-manager"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export const dynamic = "force-dynamic"

export default async function AdminCodesPage() {
  const result = await getAccessCodes()
  const codes = result.success ? result.codes : []

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto p-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Access Code Management</h1>
          <p className="text-muted-foreground">
            Create and manage access codes for SuperExam
          </p>
        </div>
      </div>

      <CodeManager initialCodes={codes} />
    </div>
  )
}
