"use client"

import { useRouter, usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { RotateCw } from "lucide-react"
import { refreshRoute } from "@/app/actions/common"
import { useTransition } from "react"

export function RefreshButton() {
  const router = useRouter()
  const pathname = usePathname()
  const [isPending, startTransition] = useTransition()

  const handleRefresh = () => {
    startTransition(async () => {
      await refreshRoute(pathname)
      router.refresh()
    })
  }

  return (
    <Button 
      variant="outline" 
      size="icon" 
      onClick={handleRefresh}
      disabled={isPending}
      title="Refresh data"
    >
      <RotateCw className={`h-4 w-4 ${isPending ? 'animate-spin' : ''}`} />
      <span className="sr-only">Refresh</span>
    </Button>
  )
}
