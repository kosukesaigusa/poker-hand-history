import z from 'zod'
import 'zod-openapi/extend'
import { describeRoute } from 'hono-openapi'
import { resolver } from 'hono-openapi/zod'
import { createFactory } from 'hono/factory'
import { match } from 'ts-pattern'
import type { EnvironmentVariables } from '../../../env'
import { fetchTodosUseCase } from '../../../use-case/getTodosUseCase'
import { ERROR_CODES } from '../../errorCode'
import {
  AppHTTPException,
  getErrorResponseForOpenAPISpec,
} from '../../errorResponse'

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
      }),
    ),
  })
  .openapi({
    example: {
      todos: [
        {
          todoId: '01HF2K3M4N5P6Q7R8S9T0U1V2W',
          userId: '01HF2K3M4N5P6Q7R8S9T0U1V2W',
          title: '買い物リストを作成する',
          description: '今週の食材を購入するためのリストを作成',
          isCompleted: false,
          createdAt: '2023-01-01T00:00:00.000Z',
          updatedAt: '2023-01-01T00:00:00.000Z',
        },
      ],
    },
  })

/**
 * Todo 一覧を取得する Handler.
 * 
 * @returns Todo 一覧を返却する。
 */
export const getTodosHandlers = createFactory<EnvironmentVariables>().createHandlers(
  describeRoute({
    tags: ['todos'],
    summary: 'Todo 一覧を取得する',
    responses: {
      200: {
        description: 'Todo 一覧の取得に成功',
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
    // 認証ミドルウェアで設定された userId を Context から取得する。
    const userId = c.get('userId')
    
    // UseCase を呼び出す。
    const result = await fetchTodosUseCase({ userId })
    
    // エラーが発生した場合は、エラーの種類を網羅的にマッチングし、
    // 対応するエラーコード AppHTTPException に設定してスローする。
    if (result.isErr()) {
      const error = result.error
      match(error)
        .with({ type: 'TODO_FETCH_ERROR' }, () => {
          throw new AppHTTPException(ERROR_CODES.GET_TODOS.FETCH_ERROR.code)
        })
        .exhaustive()
      return
    }

    // レスポンスデータを作成する。
    const responseData = {
      todos: result.value,
    }
    
    // レスポンスデータをバリデーションする。
    const validatedResponse = responseSchema.parse(responseData)

    // レスポンスを生成する。
    return c.json(validatedResponse)
  },
)
