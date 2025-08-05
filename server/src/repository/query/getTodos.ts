import { desc, eq } from 'drizzle-orm'
import { getContext } from 'hono/context-storage'
import { type Result, err, ok } from 'neverthrow'
import type { EnvironmentVariables } from '../../env'
import { todos } from '../../schema'

/** Todo一覧を取得する際のパラメータ。 */
type RepositoryParams = {
  userId: string
}

/** Todo一覧の取得結果。 */
type RepositoryResult = {
  todoId: string
  userId: string
  title: string
  description: string | null
  isCompleted: boolean
  createdAt: string
  updatedAt: string
}[]

/**
 * 指定したユーザーのTodo一覧を取得する。
 * @param params - パラメータ。
 * @returns Todo一覧。
 */
export const getTodos = async (
  params: RepositoryParams,
): Promise<Result<RepositoryResult, Error>> => {
  const c = getContext<EnvironmentVariables>()
  const db = c.var.db
  const logger = c.get('logger')

  try {
    // Todo一覧を取得する。
    const result = await db
      .select({
        todoId: todos.todoId,
        userId: todos.userId,
        title: todos.title,
        description: todos.description,
        isCompleted: todos.isCompleted,
        createdAt: todos.createdAt,
        updatedAt: todos.updatedAt,
      })
      .from(todos)
      .where(eq(todos.userId, params.userId))
      .orderBy(desc(todos.createdAt))

    // 取得結果を返す。
    return ok(result)
  } catch (e) {
    if (e instanceof Error) {
      logger.error(`Repository Error: ${e}`, e)
      return err(e)
    }
    return err(new Error('Todo一覧の取得に失敗しました'))
  }
}
