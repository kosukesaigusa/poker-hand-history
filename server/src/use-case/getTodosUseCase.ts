import { type Result, err, ok } from 'neverthrow'
import { getTodos } from '../repository/query/getTodos'

/** UseCase で発生するエラー型の定義。 */
type UseCaseError = {
  type: 'TODO_FETCH_ERROR'
  message: 'Todo一覧の取得に失敗しました'
}

/** UseCase のパラメータ型の定義。 */
type UseCaseParams = {
  userId: string
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
}[]

/**
 * Todo一覧を取得する。
 * @param params - パラメータ。
 * @returns Todo一覧。
 */
export const fetchTodosUseCase = async (
  params: UseCaseParams,
): Promise<Result<UseCaseResult, UseCaseError>> => {
  // Todo一覧を取得する。
  const result = await getTodos(params)

  if (result.isErr()) {
    return err({
      type: 'TODO_FETCH_ERROR' as const,
      message: 'Todo一覧の取得に失敗しました' as const,
    })
  }

  return ok(
    result.value.map((todo) => ({
      todoId: todo.todoId,
      userId: todo.userId,
      title: todo.title,
      description: todo.description,
      isCompleted: todo.isCompleted,
      createdAt: todo.createdAt,
      updatedAt: todo.updatedAt,
    })),
  )
}
