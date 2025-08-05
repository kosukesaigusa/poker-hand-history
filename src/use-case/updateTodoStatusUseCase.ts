import { err, ok, type Result } from 'neverthrow'
import {
  type UpdateTodoStatusParams,
  updateTodoStatus,
} from '../repository/mutation/updateTodoStatus'
import type { todos } from '../schema'

/** UseCase で発生するエラー型の定義。 */
type UseCaseError = {
  type: 'UPDATE_ERROR'
  message: 'Todoの更新に失敗しました'
}

/**
 * Todo完了状態更新UseCaseのパラメータ。
 */
export type UpdateTodoStatusUseCaseParams = UpdateTodoStatusParams

/**
 * Todo完了状態更新UseCase。
 */
export const updateTodoStatusUseCase = async (
  params: UpdateTodoStatusUseCaseParams,
): Promise<Result<typeof todos.$inferSelect, UseCaseError>> => {
  const result = await updateTodoStatus(params)
  
  if (result.isErr()) {
    return err({
      type: 'UPDATE_ERROR' as const,
      message: 'Todoの更新に失敗しました' as const,
    })
  }
  
  return ok(result.value)
}
