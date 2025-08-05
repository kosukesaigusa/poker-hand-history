import z from 'zod'
import 'zod-openapi/extend'
import { describeRoute } from 'hono-openapi'
import { resolver, validator } from 'hono-openapi/zod'
import { createFactory } from 'hono/factory'
import { match } from 'ts-pattern'
import type { EnvironmentVariables } from '../../../env'
import { updateTodoStatusUseCase } from '../../../use-case/updateTodoStatusUseCase'
import { ERROR_CODES } from '../../errorCode'
import {
  AppHTTPException,
  getErrorResponseForOpenAPISpec,
} from '../../errorResponse'

/** リクエストボディのスキーマ。 */
const requestSchema = z
  .object({
    isCompleted: z.boolean(),
  })
  .openapi({
    example: {
      isCompleted: true,
    },
  })

/** パスパラメータのスキーマ。 */
const paramsSchema = z
  .object({
    todoId: z.string().min(1),
  })
  .openapi({
    example: {
      todoId: '01HF2K3M4N5P6Q7R8S9T0U1V2W',
    },
  })

/** レスポンスデータのスキーマ。 */
const responseSchema = z
  .object({
    todo: z.object({
      todoId: z.string(),
      userId: z.string(),
      title: z.string(),
      description: z.string().nullable(),
      isCompleted: z.boolean(),
      createdAt: z.string(),
      updatedAt: z.string(),
    }),
  })
  .openapi({
    example: {
      todo: {
        todoId: '01HF2K3M4N5P6Q7R8S9T0U1V2W',
        userId: '01HF2K3M4N5P6Q7R8S9T0U1V2W',
        title: '買い物リストを作成する',
        description: '今週の食材を購入するためのリストを作成',
        isCompleted: true,
        createdAt: '2023-01-01T00:00:00.000Z',
        updatedAt: '2023-01-01T00:00:00.000Z',
      },
    },
  })

/**
 * Todo のステータスを更新する Handler.
 * 
 * @returns 更新された Todo 情報を返却する。
 */
export const updateTodoStatusHandlers = createFactory<EnvironmentVariables>().createHandlers(
  describeRoute({
    tags: ['todos'],
    summary: 'Todo のステータスを更新する',
    responses: {
      200: {
        description: 'Todo のステータス更新に成功',
        content: {
          'application/json': {
            schema: resolver(responseSchema),
          },
        },
      },
      400: getErrorResponseForOpenAPISpec(ERROR_CODES.PATCH_TODO_STATUS),
    },
  }),
  validator('param', paramsSchema),
  validator('json', requestSchema),
  async (c) => {
    // 認証ミドルウェアで設定された userId を Context から取得する。
    const userId = c.get('userId')
    // その他のパラメータはバリデーション済みのリクエストパラメータから取得する。
    const { todoId } = c.req.valid('param')

    // バリデーション済みのリクエストボディを取得する。
    const data = c.req.valid('json')
    
    // UseCase を呼び出す。
    const result = await updateTodoStatusUseCase({
      userId,
      todoId,
      isCompleted: data.isCompleted,
    })
    
    // エラーが発生した場合は、エラーの種類を網羅的にマッチングし、
    // 対応するエラーコード AppHTTPException に設定してスローする。
    if (result.isErr()) {
      const error = result.error
      match(error)
        .with({ type: 'TODO_UPDATE_ERROR' }, () => {
          throw new AppHTTPException(ERROR_CODES.PATCH_TODO_STATUS.UPDATE_ERROR.code)
        })
        .with({ type: 'TODO_NOT_FOUND' }, () => {
          throw new AppHTTPException(ERROR_CODES.PATCH_TODO_STATUS.UPDATE_ERROR.code)
        })
        .exhaustive()
      return
    }

    // レスポンスデータを作成する。
    const responseData = {
      todo: result.value,
    }
    
    // レスポンスデータをバリデーションする。
    const validatedResponse = responseSchema.parse(responseData)

    // レスポンスを生成する。
    return c.json(validatedResponse)
  },
)
