import { describe, expect, it } from 'vitest'
import { ERROR_CODES } from '../../errorCode'
import { DEFAULT_USER_IDS } from '../../../util/seed/data/userIds'
import { mockSetUserAuthMiddleware } from '../../../util/test-util/mockSetUserAuthMiddleware'
import { getTestClient } from '../../../util/test-util/testClient'
import type { ZodValidationErrorResponse } from '../../../util/test-util/zodValidationErrorResponse'

describe('Test for GET /api/todos', () => {
  // 前提：認証済みユーザーがTodo一覧を取得する。
  // 期待値：ステータスコード 200 とTodo一覧が返される。
  it('Successfully request GET /api/todos', async () => {
    // ユーザー情報をセットする。
    mockSetUserAuthMiddleware({ userId: DEFAULT_USER_IDS.USER_1 })

    // テスト用の API クライアントを作成する。
    const client = await getTestClient()

    // リクエストを送信する。
    const res = await client.api.todos.$get()

    // ステータスコードを検証する。
    expect(res.status).toBe(200)

    // レスポンスデータを検証する。
    const data = await res.json()
    expect(data).toStrictEqual({
      todos: [
        {
          todoId: expect.any(String),
          userId: DEFAULT_USER_IDS.USER_1,
          title: expect.any(String),
          description: expect.any(String),
          isCompleted: expect.any(Boolean),
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
        },
        {
          todoId: expect.any(String),
          userId: DEFAULT_USER_IDS.USER_1,
          title: expect.any(String),
          description: expect.any(String),
          isCompleted: expect.any(Boolean),
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
        },
        {
          todoId: expect.any(String),
          userId: DEFAULT_USER_IDS.USER_1,
          title: expect.any(String),
          description: expect.any(String),
          isCompleted: expect.any(Boolean),
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
        },
      ],
    })
  })

  // 前提：認証済みユーザーが存在しないTodoを取得する。
  // 期待値：ステータスコード 200 と空のTodo一覧が返される。
  it('Successfully request GET /api/todos when user has no todos', async () => {
    // ユーザー情報をセットする。
    mockSetUserAuthMiddleware({ userId: DEFAULT_USER_IDS.DELETED_USER })

    // テスト用の API クライアントを作成する。
    const client = await getTestClient()

    // リクエストを送信する。
    const res = await client.api.todos.$get()

    // ステータスコードを検証する。
    expect(res.status).toBe(200)

    // レスポンスデータを検証する。
    const data = await res.json()
    expect(data).toStrictEqual({
      todos: [
        {
          todoId: expect.any(String),
          userId: DEFAULT_USER_IDS.DELETED_USER,
          title: expect.any(String),
          description: expect.any(String),
          isCompleted: expect.any(Boolean),
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
        },
      ],
    })
  })

  // 前提：未認証ユーザーがTodo一覧を取得する。
  // 期待値：ステータスコード 400 とエラーコード middleware.auth.1 が返される。
  it('Returns 400 with error code middleware.auth.1 when user authentication fails', async () => {
    // ユーザー情報をセットする。
    mockSetUserAuthMiddleware({ userId: undefined })

    // テスト用の API クライアントを作成する。
    const client = await getTestClient()

    // リクエストを送信する。
    const res = await client.api.todos.$get()

    // ステータスコードを検証する。
    expect(res.status).toBe(400)

    // エラーレスポンスを検証する。
    const error = await res.json()
    expect(error).toEqual({
      error: {
        code: 'middleware.auth.1',
      },
    })
  })

  // 前提：認証に失敗したユーザーがTodo一覧を取得する。
  // 期待値：ステータスコード 400 とエラーコード middleware.auth.1 が返される。
  it('Returns 400 with error code middleware.auth.1 when firebase auth fails', async () => {
    // ユーザー情報をセットする。
    mockSetUserAuthMiddleware({ shouldFailAuth: true })

    // テスト用の API クライアントを作成する。
    const client = await getTestClient()

    // リクエストを送信する。
    const res = await client.api.todos.$get()

    // ステータスコードを検証する。
    expect(res.status).toBe(400)

    // エラーレスポンスを検証する。
    const error = await res.json()
    expect(error).toEqual({
      error: {
        code: 'middleware.auth.1',
      },
    })
  })

  // 前提：IDトークンの取得に失敗したユーザーがTodo一覧を取得する。
  // 期待値：ステータスコード 400 とエラーコード middleware.auth.1 が返される。
  it('Returns 400 with error code middleware.auth.1 when id token retrieval fails', async () => {
    // ユーザー情報をセットする。
    mockSetUserAuthMiddleware({ shouldFailIdToken: true })

    // テスト用の API クライアントを作成する。
    const client = await getTestClient()

    // リクエストを送信する。
    const res = await client.api.todos.$get()

    // ステータスコードを検証する。
    expect(res.status).toBe(400)

    // エラーレスポンスを検証する。
    const error = await res.json()
    expect(error).toEqual({
      error: {
        code: 'middleware.auth.1',
      },
    })
  })
})