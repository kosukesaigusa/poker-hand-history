// https://orm.drizzle.team/docs/kit-overview#how-to-migrate-to-0210

import type { Config } from 'drizzle-kit'

export default {
  schema: './src/schema.ts',
  out: './drizzle/migrations',
  driver: 'd1-http',
  dialect: 'sqlite',
  dbCredentials: {
    accountId: '9a3e9be19443f3e69e9f69529912446c',
    databaseId: 'd54b4615-3bc9-4ed2-a7f9-45f4f76fccd3',
    token: '...',
  },
} satisfies Config
