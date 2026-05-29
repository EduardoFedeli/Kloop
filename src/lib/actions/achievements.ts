import { db } from '@/lib/db'

// Definição de todas as conquistas disponíveis no app.
// Para adicionar novas, basta inserir aqui — sem alterar o banco.
export const ACHIEVEMENTS = [
  {
    id: 'first_5_listings',
    title: 'Primeiros 5 anúncios',
    description: 'Anuncie 5 produtos no Kloop e ganhe R$ 30 de cashback.',
    rewardCents: 3000,
    rewardLabel: 'R$ 30,00 cashback',
    icon: '🏷️',
    type: 'listings_published' as const,
    threshold: 5,
  },
] satisfies AchievementDef[]

export type AchievementDef = {
  id: string
  title: string
  description: string
  rewardCents: number
  rewardLabel: string
  icon: string
  type: 'listings_published'
  threshold: number
}

// Verifica e concede conquistas pendentes para o usuário.
// Anti-gaming: contamos listings com status != DRAFT (inclui pausados/expirados).
// Deleção não existe no sistema, mas pausar/expirar não reverte progresso.
export async function checkAndGrantAchievements(userId: string): Promise<void> {
  const alreadyEarned = await db.userAchievement.findMany({
    where: { userId },
    select: { achievementId: true },
  })
  const earnedIds = new Set(alreadyEarned.map((a) => a.achievementId))

  for (const achievement of ACHIEVEMENTS) {
    if (earnedIds.has(achievement.id)) continue

    if (achievement.type === 'listings_published') {
      const publishedCount = await db.listing.count({
        where: { sellerId: userId, status: { not: 'DRAFT' } },
      })

      if (publishedCount >= achievement.threshold) {
        await db.$transaction(async (tx) => {
          await tx.userAchievement.create({
            data: { userId, achievementId: achievement.id },
          })
          await tx.cashbackTransaction.create({
            data: {
              userId,
              type: 'CREDIT_SELLER',
              amountCents: achievement.rewardCents,
              description: `Recompensa: ${achievement.title}`,
              expiresAt: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000),
            },
          })
        })
      }
    }
  }
}

// Retorna o progresso de todas as conquistas para um usuário.
export async function getUserAchievementsData(userId: string) {
  const [earned, publishedCount] = await Promise.all([
    db.userAchievement.findMany({
      where: { userId },
      select: { achievementId: true, earnedAt: true },
    }),
    db.listing.count({
      where: { sellerId: userId, status: { not: 'DRAFT' } },
    }),
  ])

  const earnedMap = new Map(earned.map((a) => [a.achievementId, a.earnedAt]))

  return ACHIEVEMENTS.map((a) => {
    const isEarned = earnedMap.has(a.id)
    const progress = a.type === 'listings_published' ? Math.min(publishedCount, a.threshold) : 0
    return {
      ...a,
      isEarned,
      earnedAt: isEarned ? earnedMap.get(a.id)! : null,
      progress,
    }
  })
}
