import fastify from 'fastify'
import z, { string } from 'zod'
import { createGoals } from '../functions/createGoals'
import { createGoalCompletions } from '../functions/create-goals-completions'

import { getweekpendingsgoals } from '../functions/get-week-pwndings'

import {
  serializerCompiler,
  validatorCompiler,
  type ZodTypeProvider,
} from 'fastify-type-provider-zod'

const App = fastify().withTypeProvider<ZodTypeProvider>()

App.setValidatorCompiler(validatorCompiler)
App.setSerializerCompiler(serializerCompiler)

App.post(
  '/goals',
  {
    schema: {
      body: z.object({
        title: z.string(),
        desiredweeklyfrequecy: z.number().int().min(1).max(7),
      }),
    },
  },
  async request => {
    const { title, desiredweeklyfrequecy } = request.body

    await createGoals({
      title,
      desiredweeklyfrequecy,
    })
  }
)

App.post(
  '/completions',
  {
    schema: {
      body: z.object({
        goalId: z.string(),
      }),
    },
  },
  async request => {
    const { goalId } = request.body

    await createGoalCompletions({
      goalId,
    })
  }
)

App.get('/goals-pendings', async () => {
  const { goalspending } = await getweekpendingsgoals()

  return goalspending
})

App.listen({ port: 3333 }, () => console.log('server is running'))
