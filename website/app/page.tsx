import { FileText, MessageSquare, BookOpen, ArrowRight } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

export default async function WelcomePage() {
  // TODO: Fetch real stats from Firestore
  const stats = {
    documents: 0,
    prompts: 0,
    exams: 0,
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <section className="flex-1 flex flex-col items-center justify-center px-4 py-16 md:py-24">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="space-y-4">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
              Welcome to <span className="text-primary">SuperExam</span>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
              Transform your PDF documents into interactive exams using AI-powered question generation.
            </p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6 mt-12">
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Documents</p>
                  <p className="text-3xl font-bold mt-1">{stats.documents}</p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <FileText className="h-6 w-6" />
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Prompts</p>
                  <p className="text-3xl font-bold mt-1">{stats.prompts}</p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-success/10 text-success">
                  <MessageSquare className="h-6 w-6" />
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Exams Taken</p>
                  <p className="text-3xl font-bold mt-1">{stats.exams}</p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-warning/10 text-warning">
                  <BookOpen className="h-6 w-6" />
                </div>
              </div>
            </Card>
          </div>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-12">
            <Button asChild size="lg" className="gap-2">
              <Link href="/documents">
                <FileText className="h-5 w-5" />
                Upload Document
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="gap-2">
              <Link href="/prompts">
                <MessageSquare className="h-5 w-5" />
                Create Prompt
              </Link>
            </Button>
            <Button asChild size="lg" variant="secondary" className="gap-2">
              <Link href="/exams">
                <BookOpen className="h-5 w-5" />
                Take Exam
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="border-t bg-card/50 backdrop-blur-sm px-4 py-12">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-12">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center space-y-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary mx-auto">
                <span className="text-2xl font-bold">1</span>
              </div>
              <h3 className="text-xl font-semibold">Upload Documents</h3>
              <p className="text-muted-foreground">
                Upload your PDF study materials and educational content.
              </p>
            </div>

            <div className="text-center space-y-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-success/10 text-success mx-auto">
                <span className="text-2xl font-bold">2</span>
              </div>
              <h3 className="text-xl font-semibold">Process with AI</h3>
              <p className="text-muted-foreground">
                Select or create custom prompts to guide AI question generation.
              </p>
            </div>

            <div className="text-center space-y-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-warning/10 text-warning mx-auto">
                <span className="text-2xl font-bold">3</span>
              </div>
              <h3 className="text-xl font-semibold">Take Exams</h3>
              <p className="text-muted-foreground">
                Practice with AI-generated questions and track your progress.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
