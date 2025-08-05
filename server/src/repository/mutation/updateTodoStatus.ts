import { and, eq } from 'drizzle-orm'
import { getContext } from 'hono/context-storage'
import { type Result, err, ok } from 'neverthrow'
import type { EnvironmentVariables } from '../../env'
import { todos } from '../../schema'

/** Todoのステータスを更新する際のパラメータ。 */
type RepositoryParams = {
  userId: string
  todoId: string
  isCompleted: boolean
}

/** Todoのステータスを更新した結果。 */
type RepositoryResult = {
  todoId: string
  userId: string
  title: string
  description: string | null
  isCompleted: boolean
  createdAt: string
  updatedAt: string
}

/**
 * Todoのステータスを更新する。
 * @param params - 更新パラメータ。
 * @returns 更新したTodo情報。
 */
export const updateTodoStatus = async (
  params: RepositoryParams,
): Promise<Result<RepositoryResult, Error>> => {
  const c = getContext<EnvironmentVariables>()
  const db = c.var.db
  const logger = c.get('logger')

  try {
    // 更新データを準備する。
    const now = new Date()
    
    // Todoを更新する。
    await db
      .update(todos)
      .set({
        isCompleted: params.isCompleted,
        updatedAt: now.toISOString(),
      })
      .where(
        and(
          eq(todos.userId, params.userId),  // 権限制御
          eq(todos.todoId, params.todoId),
        ),
      )

    // 更新後のTodo情報を取得する。
    const updatedTodo = await db
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
      .where(
        and(
          eq(todos.userId, params.userId),  // 権限制御
          eq(todos.todoId, params.todoId),
        ),
      )
      .get()

    // 結果がない場合はエラーを返す。
    if (!updatedTodo) {
      return err(new Error(`Todoの更新に失敗しました: ${params.todoId}`))
    }

    // 更新したTodo情報を返す。
    return ok({
      ...updatedTodo,
      createdAt: updatedTodo.createdAt,
      updatedAt: updatedTodo.updatedAt,
    })
  } catch (e) {
    if (e instanceof Error) {
      logger.error(`Repository Error: ${e}`, e)
      return err(e)
    }
    return err(new Error('Todoの更新に失敗しました'))
  }
}
