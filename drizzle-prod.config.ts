// https://orm.drizzle.team/docs/kit-overview#how-to-migrate-to-0210

import type { Config } from 'drizzle-kit'

export default {
  schema: './src/schema.ts',
  out: './drizzle/migrations',
  driver: 'd1-http',
  dialect: 'sqlite',
  dbCredentials: {
    accountId: '...',
    databaseId: '...',
    token: '...',
  },
} satisfies Config
