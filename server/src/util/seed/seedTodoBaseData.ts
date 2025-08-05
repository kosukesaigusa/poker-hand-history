import * as schema from '../../schema'
import { TODO_SEED_DATA } from './data/todoData'
import { USER_SEED_DATA, getUserId } from './data/userIds'
import type { DatabaseForSeed } from './databaseForSeed'

/**
 * Todo の基本データをシードするためのパラメータ。
 */
type SeedTodoBaseDataParam = {
  /** シードデータを挿入するデータベース。 */
  db: DatabaseForSeed

  /** マッピングを使用してユーザー ID を上書きするかどうか。 */
  overrideUserId: boolean
}

/**
 * Todo の基本データをシードする。
 *
 * ユーザーと Todo のデータを作成する。
 *
 * @param param.db シードデータを挿入するデータベース。
 * @param param.overrideUserId マッピングを使用してユーザー ID を上書きするかどうか。
 */
export const seedTodoBaseData = async (param: SeedTodoBaseDataParam) => {
  const { db } = param

  // ユーザーデータをシードする。
  await seedUserData(param)

  // Todo データをシードする。
  await seedTodoData(param)
}

/**
 * ユーザーの基本データをシードする。
 *
 * Firebase Auth のユーザー ID と連携させる場合は getUserId() を使用して
 * 実際のユーザー ID を取得する。
 *
 * @param param.db シードデータを挿入するデータベース。
 * @param param.overrideUserId マッピングを使用してユーザー ID を上書きするかどうか。
 */
const seedUserData = async (param: SeedTodoBaseDataParam) => {
  const { db, overrideUserId } = param

  // ユーザーデータを作成する。
  const userData = USER_SEED_DATA.map((user) => ({
    userId: getUserId({ defaultId: user.userId, overrideUserId }),
  }))

  await db.insert(schema.users).values(userData)
}

/**
 * Todo データをシードする。
 *
 * 各ユーザーに紐づく Todo を作成する。
 *
 * @param param.db シードデータを挿入するデータベース。
 * @param param.overrideUserId マッピングを使用してユーザー ID を上書きするかどうか。
 */
const seedTodoData = async (param: SeedTodoBaseDataParam) => {
  const { db, overrideUserId } = param

  // Todo データを作成する。
  const todoData = TODO_SEED_DATA.map((todo) => ({
    ...todo,
    userId: getUserId({ defaultId: todo.userId, overrideUserId }),
  }))

  // 一度に挿入すると D1 の変数制限に抵触するため、1件ずつ挿入する。
  for (const todo of todoData) {
    await db.insert(schema.todos).values(todo)
  }
}