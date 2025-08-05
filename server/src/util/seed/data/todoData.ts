/**
 * Todo データの定義。
 */
import type * as schema from '../../../schema'
import { DEFAULT_USER_IDS } from './userIds'

/**
 * 共通 Todo データ。
 * 各ユーザーに紐づく Todo を定義する。
 */
export const TODO_SEED_DATA: Array<typeof schema.todos.$inferInsert> = [
  // USER_1 の Todo
  {
    todoId: '01HF2K3M4N5P6Q7R8S9T0U1V2W',
    userId: DEFAULT_USER_IDS.USER_1,
    title: '買い物リストを作成する',
    description: '今週の食材を購入するためのリストを作成',
    isCompleted: false,
    createdAt: '2024-01-01T09:00:00.000Z',
    updatedAt: '2024-01-01T09:00:00.000Z',
  },
  {
    todoId: '01HF2K3M4N5P6Q7R8S9T0U1V2X',
    userId: DEFAULT_USER_IDS.USER_1,
    title: 'プロジェクトの資料を準備する',
    description: 'プレゼン用の資料とスライドを準備',
    isCompleted: true,
    createdAt: '2024-01-02T10:00:00.000Z',
    updatedAt: '2024-01-03T15:30:00.000Z',
  },
  {
    todoId: '01HF2K3M4N5P6Q7R8S9T0U1V2Y',
    userId: DEFAULT_USER_IDS.USER_1,
    title: '運動する',
    description: 'ジョギング30分',
    isCompleted: false,
    createdAt: '2024-01-03T08:00:00.000Z',
    updatedAt: '2024-01-03T08:00:00.000Z',
  },

  // USER_2 の Todo
  {
    todoId: '01HF2K3M4N5P6Q7R8S9T0U1V2Z',
    userId: DEFAULT_USER_IDS.USER_2,
    title: '本を読む',
    description: 'プログラミング関連の技術書を1章読む',
    isCompleted: false,
    createdAt: '2024-01-01T18:00:00.000Z',
    updatedAt: '2024-01-01T18:00:00.000Z',
  },
  {
    todoId: '01HF2K3M4N5P6Q7R8S9T0U1V30',
    userId: DEFAULT_USER_IDS.USER_2,
    title: 'メールの返信',
    description: null,
    isCompleted: true,
    createdAt: '2024-01-02T09:00:00.000Z',
    updatedAt: '2024-01-02T11:00:00.000Z',
  },
  {
    todoId: '01HF2K3M4N5P6Q7R8S9T0U1V31',
    userId: DEFAULT_USER_IDS.USER_2,
    title: '部屋の掃除',
    description: 'リビングと寝室を掃除する',
    isCompleted: false,
    createdAt: '2024-01-03T14:00:00.000Z',
    updatedAt: '2024-01-03T14:00:00.000Z',
  },

  // USER_3 の Todo
  {
    todoId: '01HF2K3M4N5P6Q7R8S9T0U1V32',
    userId: DEFAULT_USER_IDS.USER_3,
    title: '歯医者の予約',
    description: '定期検診の予約を取る',
    isCompleted: true,
    createdAt: '2024-01-01T11:00:00.000Z',
    updatedAt: '2024-01-01T11:30:00.000Z',
  },
  {
    todoId: '01HF2K3M4N5P6Q7R8S9T0U1V33',
    userId: DEFAULT_USER_IDS.USER_3,
    title: 'ミーティングの準備',
    description: '明日のチームミーティングのアジェンダを作成',
    isCompleted: false,
    createdAt: '2024-01-02T16:00:00.000Z',
    updatedAt: '2024-01-02T16:00:00.000Z',
  },

  // DELETED_USER の Todo (削除されたユーザーのテスト用)
  {
    todoId: '01HF2K3M4N5P6Q7R8S9T0U1V34',
    userId: DEFAULT_USER_IDS.DELETED_USER,
    title: '削除されたユーザーのTodo',
    description: 'このユーザーは削除されています',
    isCompleted: false,
    createdAt: '2024-01-01T12:00:00.000Z',
    updatedAt: '2024-01-01T12:00:00.000Z',
  },
]