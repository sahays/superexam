"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Lock } from "lucide-react"
import { validateAccessCode } from "@/app/actions/auth"

export default function AccessCodePage() {
  const router = useRouter()
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [isPending, startTransition] = useTransition()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!code.trim()) {
      setError('Please enter an access code')
      return
    }

    startTransition(async () => {
      const result = await validateAccessCode(code.trim())

      if (result.error) {
        setError(result.error)
      } else {
        // Redirect to dashboard or admin
        if (result.isAdmin) {
          router.push('/admin/codes')
        } else {
          router.push('/')
        }
        router.refresh()
      }
    })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0F1117] via-[#1C1F26] to-[#0F1117] p-4">
      <Card className="w-full max-w-md border-primary/20 bg-gradient-to-b from-card/95 to-card shadow-2xl shadow-primary/10">
        <CardHeader className="text-center space-y-6 pb-8">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-primary via-primary/80 to-primary/60 shadow-lg shadow-primary/50 animate-pulse">
            <Lock className="h-10 w-10 text-primary-foreground" />
          </div>
          <div className="space-y-2">
            <CardTitle className="text-4xl font-bold bg-gradient-to-r from-primary via-purple-400 to-primary bg-clip-text text-transparent">
              What&apos;s Your Code?
            </CardTitle>
            <CardDescription className="text-base text-muted-foreground/80">
              Show us you&apos;re on the list 🎯
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-3">
              <Input
                id="code"
                type="text"
                placeholder="Enter the secret code..."
                value={code}
                onChange={(e) => setCode(e.target.value)}
                disabled={isPending}
                className="text-center text-2xl tracking-widest font-mono h-14 bg-background/50 border-primary/30 focus:border-primary transition-all"
                autoFocus
              />
            </div>

            {error && (
              <Alert variant="destructive" className="border-destructive/50 bg-destructive/10">
                <AlertDescription className="text-center">
                  ❌ {error}
                </AlertDescription>
              </Alert>
            )}

            <Button
              type="submit"
              className="w-full h-12 text-lg font-semibold bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg shadow-primary/30 transition-all"
              disabled={isPending}
            >
              {isPending ? '🔍 Checking...' : '✨ Get In'}
            </Button>
          </form>

          <div className="pt-4 text-center space-y-1">
            <p className="text-sm text-muted-foreground/60">
              🎫 Valid for 12 hours after entry
            </p>
            <p className="text-xs text-muted-foreground/40">
              No code? Contact the club owner
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
