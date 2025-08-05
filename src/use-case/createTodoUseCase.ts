import { type Result, err, ok } from 'neverthrow'
import {
  type CreateTodoParams,
  createTodo,
} from '../repository/mutation/createTodo'
import type { todos } from '../schema'

/** UseCase で発生するエラー型の定義。 */
type UseCaseError = {
  type: 'CREATE_ERROR' | 'VALIDATION_ERROR'
  message: string
}

/**
 * Todo作成UseCaseのパラメータ。
 */
export type CreateTodoUseCaseParams = CreateTodoParams

/**
 * Todo作成UseCase。
 * バリデーションとビジネスロジックを実行する。
 */
export const createTodoUseCase = async (
  params: CreateTodoUseCaseParams,
): Promise<Result<typeof todos.$inferSelect, UseCaseError>> => {
  const { title, description } = params

  // バリデーション
  if (!title || title.trim().length === 0) {
    return err({
      type: 'VALIDATION_ERROR' as const,
      message: 'タイトルは必須です' as const,
    })
  }

  if (title.length > 100) {
    return err({
      type: 'VALIDATION_ERROR' as const,
      message: 'タイトルは100文字以内で入力してください' as const,
    })
  }

  if (description && description.length > 500) {
    return err({
      type: 'VALIDATION_ERROR' as const,
      message: '説明は500文字以内で入力してください' as const,
    })
  }

  // Repository呼び出し
  const result = await createTodo(params)

  if (result.isErr()) {
    return err({
      type: 'CREATE_ERROR' as const,
      message: 'Todoの作成に失敗しました' as const,
    })
  }

  return ok(result.value)
}
