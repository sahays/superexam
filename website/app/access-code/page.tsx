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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Lock className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-2xl">SuperExam Access</CardTitle>
          <CardDescription>
            Enter your access code to continue
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="code">Access Code</Label>
              <Input
                id="code"
                type="text"
                placeholder="Enter your code"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                disabled={isPending}
                className="text-center text-lg tracking-wider font-mono"
                autoFocus
              />
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={isPending}
            >
              {isPending ? 'Validating...' : 'Access'}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            <p>Access codes grant 12-hour sessions</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
