import { desc, eq } from 'drizzle-orm'
import { getContext } from 'hono/context-storage'
import { type Result, err, ok } from 'neverthrow'
import type { EnvironmentVariables } from '../../env'
import { todos } from '../../schema'

/**
 * Todo一覧取得のパラメータ。
 */
export type GetTodosParams = {
  /**
   * ユーザーID。権限境界パラメータ。
   */
  userId: string
}

/**
 * 指定ユーザーのTodo一覧を取得する。
 * 作成日時の降順でソートして返す。
 */
export const getTodos = async (
  params: GetTodosParams,
): Promise<Result<(typeof todos.$inferSelect)[], Error>> => {
  const c = getContext<EnvironmentVariables>()
  const db = c.var.db
  const logger = c.get('logger')

  try {
    const result = await db
      .select()
      .from(todos)
      .where(eq(todos.userId, params.userId))
      .orderBy(desc(todos.createdAt))

    return ok(result)
  } catch (e) {
    if (e instanceof Error) {
      logger.error(`Repository Error: ${e}`, e)
      return err(e)
    }
    return err(new Error('Todo一覧の取得に失敗しました'))
  }
}
