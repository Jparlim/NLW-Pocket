import { db } from '../db'
import dayjs from 'dayjs'
import weekOfyear from 'dayjs/plugin/weekOfyear'
import { and, count, eq, gte, lte, sql } from 'drizzle-orm'
import { goals, goalsCompletions } from '../db/schema'
import { number } from 'zod'

dayjs.extend(weekOfyear)

//SEMPRE QUE FOR USAR COMMON TABLE EXPRESSION, QUANDO FOR USAR AGREGAÇOES PRECISA DAR UM NOME A ELAS, NO CASO DE AGORA É O "COUNT"

export async function getweekpendingsgoals() {
  const lastdayofweek = dayjs().endOf('week').toDate()

  const createduptoweek = db.$with('get-week-pending-goals').as(
    db
      .select({
        id: goals.id,
        title: goals.title,
        desiredweeklyfrequecy: goals.desiredweeklyfrequecy,
        createdAt: goals.createdAt,
      })
      .from(goals)
      .where(lte(goals.createdAt, lastdayofweek))
    // lte = menor ou igual ao ultimo dia da semana, primeira condicional é oq vai ser comparado, segunda é "a base da comparação"
  )

  const firstdayofweek = dayjs().startOf('week').toDate()

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
          lte(goalsCompletions.createdAt, lastdayofweek)
          //   gte = maior ou igual
        )
      )
      .groupBy(goalsCompletions.goalId)
  )

  const goalspending = await db
    .with(createduptoweek, countgoalscomoletions)
    .select({
      id: createduptoweek.id,
      title: createduptoweek.title,
      desiredweeklyfrequecy: createduptoweek.desiredweeklyfrequecy,
      completionscount: sql`
        COALESCE(${countgoalscomoletions.completionscount}, 0)`.mapWith(Number),
    })
    .from(createduptoweek)
    .leftJoin(
      countgoalscomoletions,
      eq(countgoalscomoletions.goalId, createduptoweek.id)
    )

  return { goalspending }
}
