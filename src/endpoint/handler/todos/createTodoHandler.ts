import z from 'zod'
import 'zod-openapi/extend'
import { describeRoute } from 'hono-openapi'
import { resolver, validator } from 'hono-openapi/zod'
import { createFactory } from 'hono/factory'
import { match } from 'ts-pattern'
import type { EnvironmentVariables } from '../../../env'
import { createTodoUseCase } from '../../../use-case/createTodoUseCase'
import { ERROR_CODES } from '../../errorCode'
import { AppHTTPException, getErrorResponseForOpenAPISpec } from '../../errorResponse'
import { ENDPOINT_DEVELOPMENT_STATUS } from '../util/developmentStatus'

/** リクエストボディのスキーマ。 */
const requestSchema = z
  .object({
    title: z.string().min(1).max(100),
    description: z.string().max(500).optional(),
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
        userId: 'user123',
        title: '買い物リストを作成する',
        description: '今週の食材を購入するためのリストを作成',
        isCompleted: false,
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      },
    },
  })

/**
 * Todoを作成するハンドラー。
 * @returns 作成されたTodo情報を返却する。
 */
export const createTodoHandlers = createFactory<EnvironmentVariables>().createHandlers(
  describeRoute({
    tags: ['todos'],
    summary: 'Todoを作成する',
    description: ENDPOINT_DEVELOPMENT_STATUS.IMPLEMENTED.displayText,
    responses: {
      201: {
        description: 'Todoの作成に成功',
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
    // 認証済みユーザーIDを取得する。
    const userId = c.get('userId')

    // バリデーション済みのリクエストボディを取得する。
    const data = c.req.valid('json')

    // UseCaseを呼び出す。
    const result = await createTodoUseCase({
      userId,
      title: data.title,
      description: data.description,
    })

    // エラーが発生した場合は、エラーの種類を網羅的にマッチングし、
    // 対応するエラーコードAppHTTPExceptionに設定してスローする。
    if (result.isErr()) {
      const error = result.error
      match(error)
        .with({ type: 'VALIDATION_ERROR' }, () => {
          throw new AppHTTPException(ERROR_CODES.POST_TODO.VALIDATION_ERROR.code)
        })
        .with({ type: 'CREATE_ERROR' }, () => {
          throw new AppHTTPException(ERROR_CODES.POST_TODO.CREATE_ERROR.code)
        })
        .exhaustive()
      return
    }

    // レスポンスデータを生成する。
    const responseData = {
      todo: result.value,
    }

    // レスポンスデータをバリデーションする。
    const validatedResponse = responseSchema.parse(responseData)

    return c.json(validatedResponse, 201)
  }
)