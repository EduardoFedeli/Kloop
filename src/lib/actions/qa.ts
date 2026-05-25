'use server'

import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { revalidatePath } from 'next/cache'
import { notifyUser } from '@/lib/notify'

export async function createQuestion(listingId: string, body: string) {
  const session = await auth()
  if (!session?.user?.id) return { error: 'unauthenticated' }

  const trimmed = body.trim()
  if (!trimmed || trimmed.length < 5) return { error: 'too_short' }
  if (trimmed.length > 500) return { error: 'too_long' }

  const listing = await db.listing.findUnique({
    where: { id: listingId },
    select: { id: true, status: true, sellerId: true, slug: true },
  })
  if (!listing || listing.status !== 'ACTIVE') return { error: 'listing_unavailable' }
  if (listing.sellerId === session.user.id) return { error: 'cannot_ask_own' }

  // Enforce max 3 active (non-deleted) questions per buyer per listing
  const activeCount = await db.question.count({
    where: { listingId, askerId: session.user.id, isDeleted: false },
  })
  if (activeCount >= 3) return { error: 'limit_reached' }

  const question = await db.question.create({
    data: { listingId, askerId: session.user.id, body: trimmed },
  })

  await notifyUser({
    userId: listing.sellerId,
    type: 'QUESTION',
    title: 'nova pergunta no seu anúncio',
    content: trimmed.slice(0, 100),
    actionUrl: `/listing/${listing.slug}`,
  })

  revalidatePath(`/listing/${listing.slug}`)
  return { questionId: question.id }
}

export async function deleteQuestion(questionId: string) {
  const session = await auth()
  if (!session?.user?.id) return { error: 'unauthenticated' }

  const question = await db.question.findUnique({
    where: { id: questionId },
    select: { askerId: true, listing: { select: { slug: true } } },
  })
  if (!question) return { error: 'not_found' }
  if (question.askerId !== session.user.id) return { error: 'forbidden' }

  await db.question.update({ where: { id: questionId }, data: { isDeleted: true } })

  revalidatePath(`/listing/${question.listing.slug}`)
  return { ok: true }
}

export async function createAnswer(questionId: string, body: string) {
  const session = await auth()
  if (!session?.user?.id) return { error: 'unauthenticated' }

  const trimmed = body.trim()
  if (!trimmed || trimmed.length < 2) return { error: 'too_short' }
  if (trimmed.length > 1000) return { error: 'too_long' }

  const question = await db.question.findUnique({
    where: { id: questionId },
    select: {
      id: true,
      isDeleted: true,
      askerId: true,
      listing: { select: { sellerId: true, slug: true } },
      answer: { select: { id: true } },
    },
  })
  if (!question || question.isDeleted) return { error: 'not_found' }
  if (question.listing.sellerId !== session.user.id) return { error: 'forbidden' }
  if (question.answer) return { error: 'already_answered' }

  await db.answer.create({ data: { questionId, body: trimmed } })

  await notifyUser({
    userId: question.askerId,
    type: 'ANSWER',
    title: 'sua pergunta foi respondida',
    content: trimmed.slice(0, 100),
    actionUrl: `/listing/${question.listing.slug}`,
  })

  revalidatePath(`/listing/${question.listing.slug}`)
  return { ok: true }
}
