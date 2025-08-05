import type { DatabaseForSeed } from './databaseForSeed'
import { seedTodoBaseData } from './seedTodoBaseData'

/**
 * 一通りのシードデータを挿入するためのパラメータ。
 */
type SeedAllDataParam = {
  /** データベースインスタンス。 */
  db: DatabaseForSeed

  /** ユーザー ID を Firebase Auth に存在するユーザーで上書きするかどうか。 */
  overrideUserId?: boolean
}

/**
 * 一通りのシードデータを挿入する。
 *
 * @param param.db データベースインスタンス。
 * @param param.overrideUserId ユーザー ID を Firebase Auth に存在するユーザーで上書きするかどうか。
 */
export const seedAllData = async (param: SeedAllDataParam) => {
  const { db, overrideUserId } = param
  try {
    // Todo および関連データをシードする。
    await seedTodoBaseData({ db, overrideUserId: overrideUserId ?? false })
  } catch (e) {
    console.error('シードデータの挿入に失敗しました:', e)
    throw e
  }
}
