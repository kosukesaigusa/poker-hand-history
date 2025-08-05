/**
 * アプリケーションのエントリポイント。
 * 各種ルートの定義とミドルウェアの適用を行う。
 *
 * 参考：https://github.com/yusukebe/testing-d1-app-with-types/
 */

import { createApp } from './util/factory'
import 'zod-openapi/extend'
import { Scalar } from '@scalar/hono-api-reference'
import { openAPISpecs } from 'hono-openapi'
import { createTodoHandlers } from './endpoint/handler/todos/createTodoHandler'
import { getTodosHandlers } from './endpoint/handler/todos/getTodosHandler'
import { updateTodoStatusHandlers } from './endpoint/handler/todos/updateTodoStatusHandler'

const app = createApp()

const routes = app
  // ファビコンのリクエストに対しては 204 を返す。
  .get('/favicon.ico', () => new Response(null, { status: 204 }))
  // アプリケーションの疎通確認用のハンドラを設定する。
  .get('/', (c) => {
    return c.text('Poker Hand History Server is running!')
  })

  // 開発環境向け：OpenAPI の仕様を生成する。
  .get(
    '/development/spec',
    openAPISpecs(app, {
      documentation: {
        info: {
          title: 'Poker Hand History API',
          version: '1.0.0',
          description: 'Server-side API for poker-hand-history',
        },
        servers: [
          { url: 'http://localhost:8787', description: 'Local Server' },
        ],
        // グローバルなセキュリティ要件を定義する。
        security: [{ bearerAuth: [] }],
        components: {
          securitySchemes: {
            bearerAuth: {
              type: 'http',
              scheme: 'bearer',
              bearerFormat: 'JWT',
              description: 'Firebase Auth IdToken を入力してください',
            },
          },
        },
      },
    }),
  )
  // 開発環境向け：API リファレンスを生成する。
  .get(
    '/development/docs',
    Scalar({ theme: 'saturn', url: '/development/spec' }),
  )

  // Todo関連のAPI
  .get('/api/todos', ...getTodosHandlers)
  .post('/api/todos', ...createTodoHandlers)
  .patch('/api/todos/:todoId/status', ...updateTodoStatusHandlers)

export default routes
