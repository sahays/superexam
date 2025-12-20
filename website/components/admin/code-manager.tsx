"use client"

import { useState, useTransition } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Plus, Trash2, Power, PowerOff } from "lucide-react"
import { createAccessCode, toggleCodeStatus, removeAccessCode } from "@/app/actions/auth"
import { toast } from "sonner"
import type { AccessCode } from "@/lib/db/access-codes"

interface CodeManagerProps {
  initialCodes: AccessCode[]
}

export function CodeManager({ initialCodes }: CodeManagerProps) {
  const [codes, setCodes] = useState<AccessCode[]>(initialCodes)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newCode, setNewCode] = useState({
    code: '',
    daysValid: 30,
    maxUses: 100,
    isAdmin: false,
    description: ''
  })
  const [isPending, startTransition] = useTransition()

  const handleCreate = () => {
    if (!newCode.code.trim()) {
      toast.error('Code cannot be empty')
      return
    }

    startTransition(async () => {
      const result = await createAccessCode(newCode)

      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success('Access code created')
        setCodes(prev => [result.code!, ...prev])
        setNewCode({ code: '', daysValid: 30, maxUses: 100, isAdmin: false, description: '' })
        setShowCreateForm(false)
      }
    })
  }

  const handleToggle = (id: string, active: boolean) => {
    startTransition(async () => {
      const result = await toggleCodeStatus(id, !active)

      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success(active ? 'Code disabled' : 'Code enabled')
        setCodes(prev => prev.map(c => c.id === id ? { ...c, active: !active } : c))
      }
    })
  }

  const handleDelete = (id: string) => {
    if (!confirm('Are you sure you want to delete this code?')) return

    startTransition(async () => {
      const result = await removeAccessCode(id)

      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success('Code deleted')
        setCodes(prev => prev.filter(c => c.id !== id))
      }
    })
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  return (
    <div className="space-y-6">
      {/* Create Form */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Create New Code</CardTitle>
              <CardDescription>Generate a new access code</CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowCreateForm(!showCreateForm)}
            >
              <Plus className="mr-2 h-4 w-4" />
              {showCreateForm ? 'Cancel' : 'New Code'}
            </Button>
          </div>
        </CardHeader>

        {showCreateForm && (
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="code">Code</Label>
                <Input
                  id="code"
                  placeholder="BETA2024"
                  value={newCode.code}
                  onChange={(e) => setNewCode({ ...newCode, code: e.target.value.toUpperCase() })}
                  disabled={isPending}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description (optional)</Label>
                <Input
                  id="description"
                  placeholder="Beta access - January"
                  value={newCode.description}
                  onChange={(e) => setNewCode({ ...newCode, description: e.target.value })}
                  disabled={isPending}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="days">Valid for (days)</Label>
                <Input
                  id="days"
                  type="number"
                  min="1"
                  value={newCode.daysValid}
                  onChange={(e) => setNewCode({ ...newCode, daysValid: parseInt(e.target.value) || 30 })}
                  disabled={isPending}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="uses">Max uses</Label>
                <Input
                  id="uses"
                  type="number"
                  min="1"
                  value={newCode.maxUses}
                  onChange={(e) => setNewCode({ ...newCode, maxUses: parseInt(e.target.value) || 100 })}
                  disabled={isPending}
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                id="isAdmin"
                type="checkbox"
                checked={newCode.isAdmin}
                onChange={(e) => setNewCode({ ...newCode, isAdmin: e.target.checked })}
                disabled={isPending}
                className="h-4 w-4 rounded border-border"
              />
              <Label htmlFor="isAdmin" className="cursor-pointer">
                Admin privileges (access to this dashboard)
              </Label>
            </div>

            <Button onClick={handleCreate} disabled={isPending}>
              Create Code
            </Button>
          </CardContent>
        )}
      </Card>

      <Separator />

      {/* Codes List */}
      <Card>
        <CardHeader>
          <CardTitle>Active Codes ({codes.length})</CardTitle>
          <CardDescription>Manage existing access codes</CardDescription>
        </CardHeader>
        <CardContent>
          {codes.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p>No access codes yet</p>
              <p className="text-sm">Create your first code to get started</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Usage</TableHead>
                  <TableHead>Expires</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {codes.map((code) => (
                  <TableRow key={code.id}>
                    <TableCell className="font-mono font-semibold">
                      {code.code}
                      {code.isAdmin && (
                        <Badge variant="secondary" className="ml-2">Admin</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {code.description || '-'}
                    </TableCell>
                    <TableCell>
                      <span className={code.currentUses >= code.maxUses ? 'text-destructive font-medium' : ''}>
                        {code.currentUses} / {code.maxUses}
                      </span>
                    </TableCell>
                    <TableCell>
                      {formatDate(code.expiresAt)}
                    </TableCell>
                    <TableCell>
                      {code.active ? (
                        <Badge className="bg-success/10 text-success hover:bg-success/20 border-success/20">
                          Active
                        </Badge>
                      ) : (
                        <Badge variant="secondary">Disabled</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleToggle(code.id, code.active)}
                          disabled={isPending}
                        >
                          {code.active ? (
                            <PowerOff className="h-4 w-4" />
                          ) : (
                            <Power className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(code.id)}
                          disabled={isPending}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
