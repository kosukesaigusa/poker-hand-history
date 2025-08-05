import { getContext } from 'hono/context-storage'
import { type Result, err, ok } from 'neverthrow'
import type { EnvironmentVariables } from '../../env'
import { todos } from '../../schema'
import { getULID } from '../../util/ulid'

/**
 * Todo作成のパラメータ。
 */
export type CreateTodoParams = {
  /**
   * ユーザーID。権限境界パラメータ。
   */
  userId: string
  /**
   * Todoのタイトル。
   */
  title: string
  /**
   * Todoの説明。
   */
  description?: string
}

/**
 * 新しいTodoを作成する。
 */
export const createTodo = async (
  params: CreateTodoParams,
): Promise<Result<typeof todos.$inferSelect, Error>> => {
  const c = getContext<EnvironmentVariables>()
  const db = c.var.db
  const logger = c.get('logger')

  try {
    const now = new Date()
    const todoId = getULID()

    const result = await db
      .insert(todos)
      .values({
        todoId,
        userId: params.userId,
        title: params.title,
        description: params.description || null,
        isCompleted: false,
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
      })
      .returning()

    const createdTodo = result[0]
    if (!createdTodo) {
      return err(new Error('Todoの作成に失敗しました'))
    }

    return ok(createdTodo)
  } catch (e) {
    if (e instanceof Error) {
      logger.error(`Repository Error: ${e}`, e)
      return err(e)
    }
    return err(new Error('Todoの作成に失敗しました'))
  }
}
