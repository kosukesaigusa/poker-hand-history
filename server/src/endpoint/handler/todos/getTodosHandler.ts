import z from 'zod'
import 'zod-openapi/extend'
import { describeRoute } from 'hono-openapi'
import { resolver } from 'hono-openapi/zod'
import { createFactory } from 'hono/factory'
import { match } from 'ts-pattern'
import type { EnvironmentVariables } from '../../../env'
import { getTodosUseCase } from '../../../use-case/getTodosUseCase'
import { ERROR_CODES } from '../../errorCode'
import { AppHTTPException, getErrorResponseForOpenAPISpec } from '../../errorResponse'
import { ENDPOINT_DEVELOPMENT_STATUS } from '../util/developmentStatus'

/** レスポンスデータのスキーマ。 */
const responseSchema = z
  .object({
    todos: z.array(
      z.object({
        todoId: z.string(),
        userId: z.string(),
        title: z.string(),
        description: z.string().nullable(),
        isCompleted: z.boolean(),
        createdAt: z.string(),
        updatedAt: z.string(),
      })
    ),
  })
  .openapi({
    example: {
      todos: [
        {
          todoId: '01HF2K3M4N5P6Q7R8S9T0U1V2W',
          userId: 'user123',
          title: '買い物リストを作成する',
          description: '今週の食材を購入するためのリストを作成',
          isCompleted: false,
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z',
        },
      ],
    },
  })

/**
 * Todo一覧を取得するハンドラー。
 * @returns Todo一覧を返却する。
 */
export const getTodosHandlers = createFactory<EnvironmentVariables>().createHandlers(
  describeRoute({
    tags: ['todos'],
    summary: 'Todo一覧を取得する',
    description: ENDPOINT_DEVELOPMENT_STATUS.IMPLEMENTED.displayText,
    responses: {
      200: {
        description: 'Todo一覧の取得に成功',
        content: {
          'application/json': {
            schema: resolver(responseSchema),
          },
        },
      },
      400: getErrorResponseForOpenAPISpec(ERROR_CODES.GET_TODOS),
    },
  }),
  async (c) => {
    const userId = c.get('userId')

    // Todo一覧を取得する。
    const result = await getTodosUseCase({ userId })

    // Todo一覧の取得に失敗した場合は、AppHTTPException をスローする。
    if (result.isErr()) {
      const error = result.error
      match(error)
        .with({ type: 'FETCH_ERROR' }, () => {
          throw new AppHTTPException(ERROR_CODES.GET_TODOS.FETCH_ERROR.code)
        })
        .exhaustive()
      return
    }

    // レスポンスデータを生成する。
    const responseData = {
      todos: result.value,
    }

    // レスポンスデータをバリデーションする。
    const validatedResponse = responseSchema.parse(responseData)

    return c.json(validatedResponse)
  }
)