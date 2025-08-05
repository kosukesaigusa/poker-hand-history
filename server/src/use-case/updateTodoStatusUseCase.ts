import { type Result, err, ok } from 'neverthrow'
import { updateTodoStatus } from '../repository/mutation/updateTodoStatus'

/** UseCase で発生するエラー型の定義。 */
type UseCaseError =
  | {
      type: 'TODO_UPDATE_ERROR'
      message: 'Todoのステータス更新に失敗しました'
    }
  | {
      type: 'TODO_NOT_FOUND'
      message: 'Todoが見つかりませんでした'
    }

/** UseCase のパラメータ型の定義。 */
type UseCaseParams = {
  userId: string
  todoId: string
  isCompleted: boolean
}

/** UseCase の戻り値の型の定義。 */
type UseCaseResult = {
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
 * @param params - パラメータ。
 * @returns 更新結果。
 */
export const updateTodoStatusUseCase = async (
  params: UseCaseParams,
): Promise<Result<UseCaseResult, UseCaseError>> => {
  // Todoのステータスを更新する。
  const result = await updateTodoStatus({
    userId: params.userId,
    todoId: params.todoId,
    isCompleted: params.isCompleted,
  })

  if (result.isErr()) {
    return err({
      type: 'TODO_UPDATE_ERROR' as const,
      message: 'Todoのステータス更新に失敗しました' as const,
    })
  }

  return ok({
    todoId: result.value.todoId,
    userId: result.value.userId,
    title: result.value.title,
    description: result.value.description,
    isCompleted: result.value.isCompleted,
    createdAt: result.value.createdAt,
    updatedAt: result.value.updatedAt,
  })
}
