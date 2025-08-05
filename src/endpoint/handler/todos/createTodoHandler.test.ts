import { describe, expect, it } from 'vitest'
import { seedAllData } from '../../../seed'
import { createApp } from '../../../util/factory'
import { getMiniflareBindings } from '../../../util/test-util/getMiniflareBindings'

describe('POST /api/todos', () => {
  it('認証済みユーザーが新しいTodoを作成できる', async () => {
    const app = createApp()
    const env = getMiniflareBindings()

    // シードデータを投入
    await seedAllData(env.DB)

    const todoData = {
      title: '新しいタスク',
      description: 'テスト用のタスクです',
    }

    const response = await app.request(
      '/api/todos',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer test-firebase-token',
        },
        body: JSON.stringify(todoData),
      },
      env,
    )

    expect(response.status).toBe(201)
    const data = await response.json()
    expect(data).toHaveProperty('todo')
    expect(data.todo.title).toBe(todoData.title)
    expect(data.todo.description).toBe(todoData.description)
    expect(data.todo.isCompleted).toBe(false)
  })

  it('タイトルが空の場合、400エラーになる', async () => {
    const app = createApp()
    const env = getMiniflareBindings()

    const todoData = {
      title: '',
      description: 'タイトルが空のテスト',
    }

    const response = await app.request(
      '/api/todos',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer test-firebase-token',
        },
        body: JSON.stringify(todoData),
      },
      env,
    )

    expect(response.status).toBe(400)
  })

  it('認証なしでアクセスすると401エラーになる', async () => {
    const app = createApp()
    const env = getMiniflareBindings()

    const todoData = {
      title: '新しいタスク',
      description: 'テスト用のタスクです',
    }

    const response = await app.request(
      '/api/todos',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(todoData),
      },
      env,
    )

    expect(response.status).toBe(401)
  })
})
