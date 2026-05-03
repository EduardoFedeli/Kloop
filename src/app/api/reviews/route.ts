import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { NextResponse } from 'next/server'
import { z } from 'zod'

const reviewSchema = z.object({
  transactionId: z.string(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(500).optional(),
  tags: z.array(z.string().max(50)).max(7).optional(),
})

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const body = await req.json()
    const parsed = reviewSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Dados inválidos' }, { status: 400 })
    }

    const { transactionId, rating, comment, tags } = parsed.data

    const transaction = await db.transaction.findUnique({
      where: { id: transactionId },
      select: {
        buyerId: true,
        sellerId: true,
        status: true,
        review: { select: { id: true } },
      },
    })

    if (!transaction) {
      return NextResponse.json({ error: 'Transação não encontrada' }, { status: 404 })
    }
    if (transaction.buyerId !== session.user.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 403 })
    }
    if (transaction.status !== 'COMPLETED') {
      // Como o MVP simula o fluxo, garanta que a transação esteja como COMPLETED antes de testar
      return NextResponse.json({ error: 'Transação ainda não concluída' }, { status: 400 })
    }
    if (transaction.review) {
      return NextResponse.json({ error: 'Avaliação já realizada' }, { status: 409 })
    }

    // TRUQUE PARA O MVP: Como não temos a coluna 'tags' na tabela Review do DB,
    // vamos concatenar as tags no próprio texto do comentário! 
    // Ex: "[Envio rápido, capricho] - Muito bom"
    const finalComment = tags && tags.length > 0
      ? `[${tags.join(', ')}] ${comment ? `- ${comment}` : ''}`
      : comment || null;

    const review = await db.review.create({
      data: {
        transactionId,
        reviewerId: session.user.id,
        reviewedId: transaction.sellerId,
        rating,
        comment: finalComment,
        // tags: tags ?? [], <-- REMOVIDO: Era isso que explodia o Prisma!
      },
    })

    return NextResponse.json({ review }, { status: 201 })
    
  } catch (error) {
    console.error('[REVIEW_ERROR]', error)
    // Agora o frontend recebe um JSON bonitinho mesmo se algo explodir
    return NextResponse.json({ error: 'Erro interno ao processar a avaliação.' }, { status: 500 })
  }
}