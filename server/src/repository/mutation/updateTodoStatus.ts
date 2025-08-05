import { and, eq } from 'drizzle-orm'
import { getContext } from 'hono/context-storage'
import { type Result, err, ok } from 'neverthrow'
import type { EnvironmentVariables } from '../../env'
import { todos } from '../../schema'

/**
 * Todo完了状態更新のパラメータ。
 */
export type UpdateTodoStatusParams = {
  /**
   * ユーザーID。権限境界パラメータ。
   */
  userId: string
  /**
   * TodoのID。
   */
  todoId: string
  /**
   * 完了状態。
   */
  isCompleted: boolean
}

/**
 * Todoの完了状態を更新する。
 */
export const updateTodoStatus = async (
  params: UpdateTodoStatusParams,
): Promise<Result<typeof todos.$inferSelect, Error>> => {
  const c = getContext<EnvironmentVariables>()
  const db = c.var.db
  const logger = c.get('logger')

  try {
    const now = new Date()

    const result = await db
      .update(todos)
      .set({ 
        isCompleted: params.isCompleted,
        updatedAt: now.toISOString(),
      })
      .where(and(eq(todos.todoId, params.todoId), eq(todos.userId, params.userId)))
      .returning()

    const updatedTodo = result[0]
    if (!updatedTodo) {
      return err(new Error('Todoが見つかりませんでした'))
    }

    return ok(updatedTodo)
  } catch (e) {
    if (e instanceof Error) {
      logger.error(`Repository Error: ${e}`, e)
      return err(e)
    }
    return err(new Error('Todoの更新に失敗しました'))
  }
}
