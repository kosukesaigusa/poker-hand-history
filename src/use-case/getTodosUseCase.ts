import { type Result, err, ok } from 'neverthrow'
import { type GetTodosParams, getTodos } from '../repository/query/getTodos'
import type { todos } from '../schema'

/** UseCase で発生するエラー型の定義。 */
type UseCaseError = {
  type: 'FETCH_ERROR'
  message: 'Todo一覧の取得に失敗しました'
}

/**
 * Todo一覧取得UseCaseのパラメータ。
 */
export type GetTodosUseCaseParams = GetTodosParams

/**
 * Todo一覧取得UseCase。
 */
export const getTodosUseCase = async (
  params: GetTodosUseCaseParams,
): Promise<Result<(typeof todos.$inferSelect)[], UseCaseError>> => {
  const result = await getTodos(params)
  
  if (result.isErr()) {
    return err({
      type: 'FETCH_ERROR' as const,
      message: 'Todo一覧の取得に失敗しました' as const,
    })
  }
  
  return ok(result.value)
}
