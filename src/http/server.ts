import fastify from 'fastify'
import z from 'zod'
import { createGoals } from '../functions/createGoals'

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

App.get('/goals-pendings', async () => {
  const sql = await getweekpendingsgoals()

  return sql
})

App.listen({ port: 3333 }, () => console.log('server is running'))
