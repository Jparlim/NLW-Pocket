import { and, count, eq, gte, lte, sql } from 'drizzle-orm'
import { db } from '../db'
import { goals, goalsCompletions } from '../db/schema'
import dayjs from 'dayjs'

interface creategoalsrequest {
  goalId: string
}

export async function createGoalCompletions({ goalId }: creategoalsrequest) {
  const firstdayofweek = dayjs().startOf('week').toDate()
  const lastdayofweek = dayjs().endOf('week').toDate()

  const countgoalscomoletions = db.$with('count-goals-comopletions').as(
    db
      .select({
        goalId: goalsCompletions.goalId,
        completionscount: count(goalsCompletions.id).as('completionscount'),
      })
      .from(goalsCompletions)
      .where(
        and(
          gte(goalsCompletions.createdAt, firstdayofweek),
          lte(goalsCompletions.createdAt, lastdayofweek),
          eq(goalsCompletions.goalId, goalId)
          //   gte = maior ou igual
        )
      )
      .groupBy(goalsCompletions.goalId)
  )

  const result = await db
    .with(countgoalscomoletions)
    .select({
      desiredweeklyfrequecy: goals.desiredweeklyfrequecy,
      completionscount: sql`
        COALESCE(${countgoalscomoletions.completionscount}, 0)`.mapWith(Number),
    })
    .from(goals)
    .leftJoin(countgoalscomoletions, eq(countgoalscomoletions.goalId, goals.id))
    .where(eq(goals.id, goalId))
    .limit(1)

  const { completionscount, desiredweeklyfrequecy } = result[0]

  if (completionscount >= desiredweeklyfrequecy) {
    throw new Error('goals ready completed this week')
  }

  const sla = await db.insert(goalsCompletions).values({ goalId }).returning()
  const metacompleta = sla[0]

  return {
    metacompleta,
  }
}
