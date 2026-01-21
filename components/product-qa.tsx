"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ThumbsUp, MessageCircle } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

interface Answer {
  id: string
  answer: string
  is_official: boolean
  helpful_count: number
  created_at: string
  user: {
    full_name: string
    is_admin: boolean
  }
}

interface Question {
  id: string
  question: string
  is_answered: boolean
  created_at: string
  user: {
    full_name: string
  } | null
  guest_name: string | null
  answers: Answer[]
}

interface ProductQAProps {
  productId: string
  canAnswer: boolean
}

export function ProductQA({ productId, canAnswer }: ProductQAProps) {
  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(true)
  const [showQuestionForm, setShowQuestionForm] = useState(false)
  const [showAnswerForm, setShowAnswerForm] = useState<string | null>(null)
  
  // Question form state
  const [question, setQuestion] = useState("")
  const [guestName, setGuestName] = useState("")
  const [guestEmail, setGuestEmail] = useState("")
  const [submittingQuestion, setSubmittingQuestion] = useState(false)
  
  // Answer form state
  const [answer, setAnswer] = useState("")
  const [submittingAnswer, setSubmittingAnswer] = useState(false)

  useEffect(() => {
    loadQuestions()
  }, [productId])

  const loadQuestions = async () => {
    try {
      const response = await fetch(`/api/questions?product_id=${productId}`)
      if (response.ok) {
        const data = await response.json()
        setQuestions(data.questions || [])
      }
    } catch (error) {
      console.error("Failed to load questions:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitQuestion = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmittingQuestion(true)

    try {
      const response = await fetch("/api/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product_id: productId,
          question,
          guest_name: guestName || undefined,
          guest_email: guestEmail || undefined,
        }),
      })

      if (response.ok) {
        setQuestion("")
        setGuestName("")
        setGuestEmail("")
        setShowQuestionForm(false)
        loadQuestions()
      }
    } catch (error) {
      console.error("Failed to submit question:", error)
    } finally {
      setSubmittingQuestion(false)
    }
  }

  const handleSubmitAnswer = async (questionId: string) => {
    setSubmittingAnswer(true)

    try {
      const response = await fetch("/api/answers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question_id: questionId,
          answer,
        }),
      })

      if (response.ok) {
        setAnswer("")
        setShowAnswerForm(null)
        loadQuestions()
      }
    } catch (error) {
      console.error("Failed to submit answer:", error)
    } finally {
      setSubmittingAnswer(false)
    }
  }

  const handleHelpful = async (answerId: string) => {
    try {
      await fetch("/api/answers/helpful", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answer_id: answerId }),
      })
      loadQuestions()
    } catch (error) {
      console.error("Failed to mark as helpful:", error)
    }
  }

  if (loading) {
    return <div className="text-center py-8">Loading questions...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Questions & Answers</h2>
        {!showQuestionForm && (
          <Button onClick={() => setShowQuestionForm(true)}>
            Ask a Question
          </Button>
        )}
      </div>

      {showQuestionForm && (
        <Card>
          <CardHeader>
            <CardTitle>Ask Your Question</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmitQuestion} className="space-y-4">
              <div>
                <Label htmlFor="question">Question *</Label>
                <Textarea
                  id="question"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="What would you like to know about this product?"
                  rows={3}
                  required
                />
              </div>

              {!canAnswer && (
                <>
                  <div>
                    <Label htmlFor="guestName">Your Name *</Label>
                    <Input
                      id="guestName"
                      value={guestName}
                      onChange={(e) => setGuestName(e.target.value)}
                      placeholder="John Doe"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="guestEmail">Your Email *</Label>
                    <Input
                      id="guestEmail"
                      type="email"
                      value={guestEmail}
                      onChange={(e) => setGuestEmail(e.target.value)}
                      placeholder="your@email.com"
                      required
                    />
                  </div>
                </>
              )}

              <div className="flex gap-2">
                <Button type="submit" disabled={submittingQuestion}>
                  {submittingQuestion ? "Submitting..." : "Submit Question"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowQuestionForm(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="space-y-6">
        {questions.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              <MessageCircle className="mx-auto h-12 w-12 mb-4 opacity-50" />
              <p>No questions yet. Be the first to ask!</p>
            </CardContent>
          </Card>
        ) : (
          questions.map((q) => (
            <Card key={q.id}>
              <CardContent className="pt-6 space-y-4">
                {/* Question */}
                <div>
                  <div className="flex items-start gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>
                        {(q.user?.full_name || q.guest_name || "?")[0].toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-sm">
                          {q.user?.full_name || q.guest_name}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(q.created_at).toLocaleDateString()}
                        </span>
                        {q.is_answered && (
                          <Badge variant="secondary" className="text-xs">
                            Answered
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm font-medium">{q.question}</p>
                    </div>
                  </div>
                </div>

                {/* Answers */}
                {q.answers && q.answers.length > 0 && (
                  <div className="ml-11 space-y-4">
                    <Separator />
                    {q.answers.map((ans) => (
                      <div key={ans.id} className="space-y-2">
                        <div className="flex items-start gap-3">
                          <Avatar className="h-7 w-7">
                            <AvatarFallback className="text-xs">
                              {ans.user.full_name[0].toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-semibold text-sm">
                                {ans.user.full_name}
                              </span>
                              {ans.is_official && (
                                <Badge className="text-xs">Official Answer</Badge>
                              )}
                              <span className="text-xs text-muted-foreground">
                                {new Date(ans.created_at).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground">{ans.answer}</p>
                            <button
                              onClick={() => handleHelpful(ans.id)}
                              className="mt-2 flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition"
                            >
                              <ThumbsUp className="h-3 w-3" />
                              Helpful ({ans.helpful_count})
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Answer Form */}
                {canAnswer && (
                  <div className="ml-11">
                    {showAnswerForm === q.id ? (
                      <div className="space-y-3 pt-2">
                        <Textarea
                          value={answer}
                          onChange={(e) => setAnswer(e.target.value)}
                          placeholder="Write your answer..."
                          rows={3}
                        />
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleSubmitAnswer(q.id)}
                            disabled={submittingAnswer || !answer.trim()}
                          >
                            {submittingAnswer ? "Submitting..." : "Submit Answer"}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setShowAnswerForm(null)
                              setAnswer("")
                            }}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setShowAnswerForm(q.id)}
                      >
                        Answer this question
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}