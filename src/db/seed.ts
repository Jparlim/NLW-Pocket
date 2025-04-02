import dayjs from 'dayjs'
import { db, client } from '.'
import { goals, goalsCompletions } from './schema'

async function Seed() {
  await db.delete(goalsCompletions)
  await db.delete(goals)

  const result = await db
    .insert(goals)
    .values([
      { title: 'acordar cedo', desiredweeklyfrequecy: 5 },
      { title: 'me exercitar', desiredweeklyfrequecy: 3 },
      { title: 'meditar', desiredweeklyfrequecy: 1 },
    ])
    .returning()

  const firstdayofweek = dayjs().startOf('week')

  await db.insert(goalsCompletions).values([
    { goalId: result[0].id, createdAt: firstdayofweek.toDate() },
    { goalId: result[1].id, createdAt: firstdayofweek.add(1, 'day').toDate() },
  ])
}

Seed().finally(() => {
  client.end()
})
