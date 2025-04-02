import { defineConfig } from 'drizzle-kit'
import { Env } from './src/env'

export default defineConfig({
  dialect: 'postgresql',
  schema: './src/db/schema.ts',
  out: './.migrations',
  dbCredentials: {
    url: Env.DATABASE_URL,
  },
})
