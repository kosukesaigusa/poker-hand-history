import type { DrizzleD1Database } from 'drizzle-orm/d1'
import type { AppLogger } from './util/logger'

/** 環境の種類。 */
type EnvType = 'development' | 'production'

/** アプリケーションの環境変数の型定義。 */
export type EnvironmentVariables = {
  Bindings: {
    ENV_TYPE: EnvType
    FIREBASE_PROJECT_ID: string
    FIREBASE_PRIVATE_KEY_ID: string
    FIREBASE_PRIVATE_KEY: string
    FIREBASE_CLIENT_EMAIL: string
    FIREBASE_CLIENT_ID: string
    DB: D1Database
  }
  Variables: {
    db: DrizzleD1Database
    logger: AppLogger
    userId: string
  }
}
