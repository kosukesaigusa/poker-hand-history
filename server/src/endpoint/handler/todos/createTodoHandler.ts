import z from 'zod'
import 'zod-openapi/extend'
import { describeRoute } from 'hono-openapi'
import { resolver, validator } from 'hono-openapi/zod'
import { createFactory } from 'hono/factory'
import { match } from 'ts-pattern'
import type { EnvironmentVariables } from '../../../env'
import { createTodoUseCase } from '../../../use-case/createTodoUseCase'
import { ERROR_CODES } from '../../errorCode'
import {
  AppHTTPException,
  getErrorResponseForOpenAPISpec,
} from '../../errorResponse'

/** リクエストボディのスキーマ。 */
const requestSchema = z
  .object({
    title: z.string(),
    description: z.string().optional(),
  })
  .openapi({
    example: {
      title: '買い物リストを作成する',
      description: '今週の食材を購入するためのリストを作成',
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
        isCompleted: false,
        createdAt: '2023-01-01T00:00:00.000Z',
        updatedAt: '2023-01-01T00:00:00.000Z',
      },
    },
  })

/**
 * Todo を作成する Handler.
 * 
 * @returns 作成された Todo 情報を返却する。
 */
export const createTodoHandlers = createFactory<EnvironmentVariables>().createHandlers(
  describeRoute({
    tags: ['todos'],
    summary: 'Todo を作成する',
    responses: {
      200: {
        description: 'Todo の作成に成功',
        content: {
          'application/json': {
            schema: resolver(responseSchema),
          },
        },
      },
      400: getErrorResponseForOpenAPISpec(ERROR_CODES.POST_TODO),
    },
  }),
  validator('json', requestSchema),
  async (c) => {
    // 認証ミドルウェアで設定された userId を Context から取得する。
    const userId = c.get('userId')

    // バリデーション済みのリクエストボディを取得する。
    const data = c.req.valid('json')
    
    // UseCase を呼び出す。
    const result = await createTodoUseCase({
      userId,
      title: data.title,
      description: data.description,
    })
    
    // エラーが発生した場合は、エラーの種類を網羅的にマッチングし、
    // 対応するエラーコード AppHTTPException に設定してスローする。
    if (result.isErr()) {
      const error = result.error
      match(error)
        .with({ type: 'TODO_TITLE_EMPTY' }, () => {
          throw new AppHTTPException(ERROR_CODES.POST_TODO.VALIDATION_ERROR.code)
        })
        .with({ type: 'TODO_TITLE_TOO_LONG' }, () => {
          throw new AppHTTPException(ERROR_CODES.POST_TODO.VALIDATION_ERROR.code)
        })
        .with({ type: 'TODO_DESCRIPTION_TOO_LONG' }, () => {
          throw new AppHTTPException(ERROR_CODES.POST_TODO.VALIDATION_ERROR.code)
        })
        .with({ type: 'TODO_CREATE_ERROR' }, () => {
          throw new AppHTTPException(ERROR_CODES.POST_TODO.CREATE_ERROR.code)
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
