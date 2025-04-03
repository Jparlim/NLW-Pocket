import postgres from 'postgres'
import { drizzle } from 'drizzle-orm/postgres-js'
import * as schema from './schema'
import { Env } from '../env'

export const client = postgres(Env.DATABASE_URL)
export const db = drizzle(client, { schema, logger: true })
