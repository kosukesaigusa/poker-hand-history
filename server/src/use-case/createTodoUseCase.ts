import { type Result, err, ok } from 'neverthrow'
import { createTodo } from '../repository/mutation/createTodo'

/** UseCase で発生するエラー型の定義。 */
type UseCaseError =
  | {
      type: 'TODO_TITLE_EMPTY'
      message: 'Todoのタイトルが空です'
    }
  | {
      type: 'TODO_TITLE_TOO_LONG'
      message: 'Todoのタイトルが長すぎます'
    }
  | {
      type: 'TODO_DESCRIPTION_TOO_LONG'
      message: 'Todoの説明が長すぎます'
    }
  | {
      type: 'TODO_CREATE_ERROR'
      message: 'Todoの作成に失敗しました'
    }

/** UseCase のパラメータ型の定義。 */
type UseCaseParams = {
  userId: string
  title: string
  description?: string
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
 * Todoを作成する。
 * @param params - パラメータ。
 * @returns 作成結果。
 */
export const createTodoUseCase = async (
  params: UseCaseParams,
): Promise<Result<UseCaseResult, UseCaseError>> => {
  // タイトルの空チェックを行う。
  if (!params.title || params.title.trim().length === 0) {
    return err({
      type: 'TODO_TITLE_EMPTY' as const,
      message: 'Todoのタイトルが空です' as const,
    })
  }

  // タイトルの長さチェックを行う。
  if (params.title.length > 100) {
    return err({
      type: 'TODO_TITLE_TOO_LONG' as const,
      message: 'Todoのタイトルが長すぎます' as const,
    })
  }

  // 説明の長さチェックを行う。
  if (params.description && params.description.length > 500) {
    return err({
      type: 'TODO_DESCRIPTION_TOO_LONG' as const,
      message: 'Todoの説明が長すぎます' as const,
    })
  }

  // Todoを作成する。
  const result = await createTodo({
    userId: params.userId,
    title: params.title,
    description: params.description,
  })

  if (result.isErr()) {
    return err({
      type: 'TODO_CREATE_ERROR' as const,
      message: 'Todoの作成に失敗しました' as const,
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
