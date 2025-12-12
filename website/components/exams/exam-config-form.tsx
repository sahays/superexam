"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Play } from "lucide-react"
import { createExamSession } from "@/app/actions/exams"
import { toast } from "sonner"

interface ExamConfigFormProps {
  documentId: string
  totalQuestions: number
}

export function ExamConfigForm({ documentId, totalQuestions }: ExamConfigFormProps) {
  const router = useRouter()
  const [questionCount, setQuestionCount] = useState(Math.min(10, totalQuestions))
  const [timerEnabled, setTimerEnabled] = useState(false)
  const [timerMinutes, setTimerMinutes] = useState(15)
  const [randomize, setRandomize] = useState(true)
  const [isStarting, setIsStarting] = useState(false)

  const handleStartExam = async () => {
    setIsStarting(true)

    try {
      const result = await createExamSession({
        documentId,
        questionCount: Number(questionCount),
        timerEnabled,
        timerMinutes: timerEnabled ? Number(timerMinutes) : undefined,
        randomize
      })

      if (result.error) {
        toast.error(result.error)
        setIsStarting(false)
        return
      }

      if (result.sessionId) {
        toast.success("Exam started!")
        router.push(`/exams/${documentId}/session/${result.sessionId}`)
      }
    } catch (error) {
      toast.error("Failed to start exam")
      setIsStarting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Exam Settings</CardTitle>
        <CardDescription>
          Configure your exam preferences before starting
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Number of Questions */}
        <div className="space-y-2">
          <Label htmlFor="questionCount">
            Number of Questions ({totalQuestions} available)
          </Label>
          <Input
            id="questionCount"
            type="number"
            min={1}
            max={totalQuestions}
            value={questionCount}
            onChange={(e) => setQuestionCount(Math.min(Number(e.target.value), totalQuestions))}
          />
        </div>

        {/* Timer */}
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="timer"
              checked={timerEnabled}
              onCheckedChange={(checked) => setTimerEnabled(checked as boolean)}
            />
            <Label htmlFor="timer" className="font-normal cursor-pointer">
              Enable timer
            </Label>
          </div>

          {timerEnabled && (
            <div className="ml-6 space-y-2">
              <Label htmlFor="timerMinutes">Duration (minutes)</Label>
              <Input
                id="timerMinutes"
                type="number"
                min={1}
                max={180}
                value={timerMinutes}
                onChange={(e) => setTimerMinutes(Number(e.target.value))}
              />
            </div>
          )}
        </div>

        {/* Randomize */}
        <div className="flex items-center space-x-2">
          <Checkbox
            id="randomize"
            checked={randomize}
            onCheckedChange={(checked) => setRandomize(checked as boolean)}
          />
          <Label htmlFor="randomize" className="font-normal cursor-pointer">
            Randomize question order
          </Label>
        </div>

        <Button
          className="w-full"
          size="lg"
          onClick={handleStartExam}
          disabled={isStarting}
        >
          <Play className="mr-2 h-4 w-4" />
          {isStarting ? "Starting..." : "Start Exam"}
        </Button>
      </CardContent>
    </Card>
  )
}
