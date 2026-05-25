'use client'

import { useState, useTransition } from 'react'
import { HelpCircle, ChevronDown, ChevronUp, Send, Trash2, MessageSquare } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { createQuestion, deleteQuestion, createAnswer } from '@/lib/actions/qa'

type Answer = {
  id: string
  body: string
  createdAt: string
}

type Question = {
  id: string
  body: string
  askerId: string
  createdAt: string
  answer: Answer | null
}

type Props = {
  listingId: string
  questions: Question[]
  currentUserId?: string
  isOwner: boolean
}

const ERROR_MESSAGES: Record<string, string> = {
  unauthenticated: 'Faça login para perguntar.',
  too_short: 'Pergunta muito curta.',
  too_long: 'Pergunta muito longa (máx. 500 caracteres).',
  listing_unavailable: 'Este anúncio não está mais disponível.',
  cannot_ask_own: 'Você não pode perguntar no seu próprio anúncio.',
  limit_reached: 'Você já tem 3 perguntas ativas neste anúncio.',
  already_answered: 'Esta pergunta já foi respondida.',
  forbidden: 'Ação não permitida.',
}

export function QASection({ listingId, questions, currentUserId, isOwner }: Props) {
  const [body, setBody] = useState('')
  const [answerBody, setAnswerBody] = useState<Record<string, string>>({})
  const [expandedAnswer, setExpandedAnswer] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleSubmitQuestion() {
    if (!body.trim()) return
    startTransition(async () => {
      const result = await createQuestion(listingId, body) as { error?: string; questionId?: string }
      if (result.error) {
        toast.error(ERROR_MESSAGES[result.error] ?? 'Erro ao enviar pergunta.')
        return
      }
      setBody('')
      toast.success('Pergunta enviada!')
    })
  }

  function handleDeleteQuestion(questionId: string) {
    startTransition(async () => {
      const result = await deleteQuestion(questionId) as { error?: string; ok?: boolean }
      if (result.error) {
        toast.error(ERROR_MESSAGES[result.error] ?? 'Erro ao remover pergunta.')
        return
      }
      toast.success('Pergunta removida.')
    })
  }

  function handleSubmitAnswer(questionId: string) {
    const text = answerBody[questionId] ?? ''
    if (!text.trim()) return
    startTransition(async () => {
      const result = await createAnswer(questionId, text) as { error?: string; ok?: boolean }
      if (result.error) {
        toast.error(ERROR_MESSAGES[result.error] ?? 'Erro ao enviar resposta.')
        return
      }
      setAnswerBody((prev) => ({ ...prev, [questionId]: '' }))
      toast.success('Resposta publicada!')
    })
  }

  return (
    <section>
      <div className="flex items-center gap-2 mb-4">
        <div className="w-6 h-6 rounded-full bg-[var(--color-teal)] flex items-center justify-center flex-shrink-0">
          <HelpCircle size={13} className="text-white" />
        </div>
        <h2 className="text-[17px] font-black text-[var(--foreground)] tracking-tight">
          perguntas e respostas
        </h2>
      </div>

      {/* Ask a question — only for logged-in non-owners */}
      {currentUserId && !isOwner && (
        <div className="mb-6">
          <div className="flex gap-2">
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="faça uma pergunta..."
              rows={2}
              maxLength={500}
              className="flex-1 resize-none rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[var(--color-forest)] text-[14px] text-[var(--foreground)] placeholder-gray-400 dark:placeholder-gray-500 px-4 py-3 focus:outline-none focus:border-[var(--color-teal)] dark:focus:border-[var(--color-celadon)] transition-colors"
            />
            <button
              onClick={handleSubmitQuestion}
              disabled={isPending || !body.trim()}
              className={cn(
                'flex-shrink-0 w-10 h-10 self-end rounded-full flex items-center justify-center transition-colors',
                body.trim() && !isPending
                  ? 'bg-[var(--color-teal)] text-white hover:bg-[var(--color-emerald)]'
                  : 'bg-gray-100 dark:bg-white/5 text-gray-300 cursor-not-allowed'
              )}
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      )}

      {!currentUserId && (
        <p className="text-[13px] text-gray-400 dark:text-[var(--color-sage)] mb-5">
          <a href="/login" className="text-[var(--color-teal)] font-bold hover:underline">entre</a> para fazer uma pergunta
        </p>
      )}

      {/* Questions list */}
      {questions.length === 0 ? (
        <p className="text-[13px] text-gray-400 dark:text-[var(--color-sage)]">
          nenhuma pergunta ainda. seja o primeiro a perguntar!
        </p>
      ) : (
        <div className="space-y-4">
          {questions.map((q) => (
            <div
              key={q.id}
              className="rounded-2xl border border-gray-100 dark:border-white/5 bg-white dark:bg-[var(--color-forest)] overflow-hidden"
            >
              {/* Question */}
              <div className="px-4 pt-4 pb-3">
                <div className="flex items-start gap-2">
                  <div className="flex-1">
                    <p className="text-[12px] text-gray-400 dark:text-[var(--color-sage)] mb-1">
                      {currentUserId === q.askerId ? 'você perguntou:' : 'um comprador perguntou:'}
                    </p>
                    <p className="text-[14px] text-[var(--foreground)] leading-snug">{q.body}</p>
                  </div>
                  {currentUserId === q.askerId && !q.answer && (
                    <button
                      onClick={() => handleDeleteQuestion(q.id)}
                      disabled={isPending}
                      className="flex-shrink-0 p-1.5 text-gray-300 hover:text-red-400 transition-colors rounded-full"
                      title="remover pergunta"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </div>

              {/* Answer — if exists, collapsible */}
              {q.answer && (
                <>
                  <button
                    onClick={() => setExpandedAnswer(expandedAnswer === q.id ? null : q.id)}
                    className="w-full flex items-center gap-2 px-4 py-2 bg-[var(--color-teal)]/5 dark:bg-[var(--color-celadon)]/5 text-left text-[13px] font-bold text-[var(--color-teal)] dark:text-[var(--color-celadon)] hover:bg-[var(--color-teal)]/10 transition-colors"
                  >
                    <MessageSquare size={13} />
                    ver resposta
                    {expandedAnswer === q.id
                      ? <ChevronUp size={13} className="ml-auto" />
                      : <ChevronDown size={13} className="ml-auto" />}
                  </button>
                  {expandedAnswer === q.id && (
                    <div className="px-4 py-3 border-t border-gray-50 dark:border-white/5">
                      <p className="text-[12px] text-gray-400 dark:text-[var(--color-sage)] mb-1">resposta do vendedor:</p>
                      <p className="text-[14px] text-[var(--foreground)] leading-snug">{q.answer.body}</p>
                    </div>
                  )}
                </>
              )}

              {/* Answer input — only for owner, on unanswered questions */}
              {isOwner && !q.answer && (
                <div className="px-4 pb-4 pt-2 border-t border-gray-50 dark:border-white/5">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={answerBody[q.id] ?? ''}
                      onChange={(e) => setAnswerBody((prev) => ({ ...prev, [q.id]: e.target.value }))}
                      placeholder="responder..."
                      maxLength={1000}
                      className="flex-1 rounded-xl border border-gray-200 dark:border-white/10 bg-[var(--background)] text-[13px] text-[var(--foreground)] placeholder-gray-400 px-3 py-2 focus:outline-none focus:border-[var(--color-teal)] transition-colors"
                    />
                    <button
                      onClick={() => handleSubmitAnswer(q.id)}
                      disabled={isPending || !(answerBody[q.id] ?? '').trim()}
                      className={cn(
                        'flex-shrink-0 px-3 py-2 rounded-xl text-[12px] font-bold transition-colors',
                        (answerBody[q.id] ?? '').trim() && !isPending
                          ? 'bg-[var(--color-teal)] text-white hover:bg-[var(--color-emerald)]'
                          : 'bg-gray-100 dark:bg-white/5 text-gray-300 cursor-not-allowed'
                      )}
                    >
                      responder
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
