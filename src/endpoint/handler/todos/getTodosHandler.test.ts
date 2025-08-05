import { describe, expect, it } from 'vitest'
import { seedAllData } from '../../../seed'
import { createApp } from '../../../util/factory'
import { getMiniflareBindings } from '../../../util/test-util/getMiniflareBindings'

describe('GET /api/todos', () => {
  it('認証済みユーザーのTodo一覧を取得できる', async () => {
    const app = createApp()
    const env = getMiniflareBindings()

    // シードデータを投入
    await seedAllData(env.DB)

    const response = await app.request(
      '/api/todos',
      {
        headers: {
          Authorization: 'Bearer test-firebase-token',
        },
      },
      env,
    )

    expect(response.status).toBe(200)
    const data = await response.json()
    expect(data).toHaveProperty('todos')
    expect(Array.isArray(data.todos)).toBe(true)
  })

  it('認証なしでアクセスすると401エラーになる', async () => {
    const app = createApp()
    const env = getMiniflareBindings()

    const response = await app.request('/api/todos', {}, env)

    expect(response.status).toBe(401)
  })
})
