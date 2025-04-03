import { db } from '../db'
import { goals } from '../db/schema'

interface goalsRequest {
  title: string
  desiredweeklyfrequecy: number
}

export async function createGoals({ title, desiredweeklyfrequecy }: goalsRequest) {
  const result = await db
    .insert(goals)
    .values({
      title,
      desiredweeklyfrequecy,
    })
    .returning()

  const goal = result[0]

  return goal
}
