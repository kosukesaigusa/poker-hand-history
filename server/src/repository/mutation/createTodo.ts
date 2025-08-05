import { getContext } from 'hono/context-storage'
import { type Result, err, ok } from 'neverthrow'
import { ulid } from 'ulidx'
import type { EnvironmentVariables } from '../../env'
import { todos } from '../../schema'

/** Todoを作成する際のパラメータ。 */
type RepositoryParams = {
  userId: string
  title: string
  description?: string
}

/** Todoを作成した結果。 */
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
 * Todoを作成する。
 * @param params - パラメータ。
 * @returns 作成したTodo情報。
 */
export const createTodo = async (
  params: RepositoryParams,
): Promise<Result<RepositoryResult, Error>> => {
  const c = getContext<EnvironmentVariables>()
  const db = c.var.db
  const logger = c.get('logger')

  try {
    // Todo ID を生成する。
    const todoId = ulid()
    const now = new Date()
    
    // Todoを作成する。
    await db.insert(todos).values({
      todoId,
      userId: params.userId,
      title: params.title,
      description: params.description || null,
      isCompleted: false,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    })

    // 作成したTodo情報を返す。
    return ok({
      todoId,
      userId: params.userId,
      title: params.title,
      description: params.description || null,
      isCompleted: false,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    })
  } catch (e) {
    if (e instanceof Error) {
      logger.error(`Repository Error: ${e}`, e)
      return err(e)
    }
    return err(new Error('Todoの作成に失敗しました'))
  }
}
