import { sql } from 'drizzle-orm'
import { index, integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'

/**
 * システムテーブル一覧。
 */
export const SYSTEM_TABLES = ['__drizzle_migrations', 'd1_migrations'] as const

/**
 * テーブル削除順序の明示的な定義。
 *
 * 外部キー制約を考慮し、子テーブル（外部キーを持つ）から親テーブル（参照される）の順で削除する。
 *
 * 新しいテーブルを追加する際は、外部キー関係を考慮してこの配列に適切な位置で追加すること。
 */
export const TABLE_DELETE_ORDER = ['todos', 'users'] as const

/**
 * テーブル名の型定義。
 */
export type TableName = (typeof TABLE_DELETE_ORDER)[number]

/**
 * ユーザーテーブル。
 * Firebase Authentication のユーザーと 1:1 で紐づく。
 *
 * @property {string} userId - Firebase Authentication の UID. 主キー。
 * @property {string} createdAt - レコード作成日時。
 * @property {string} updatedAt - レコード更新日時。
 */
export const users = sqliteTable('users', {
  userId: text('user_id').primaryKey(),
  createdAt: text('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at').notNull().default(sql`CURRENT_TIMESTAMP`),
})

/**
 * Todoテーブル。
 * ユーザーが作成したTodoアイテムを管理する。
 *
 * @property {string} todoId - Todo の一意識別子。ULID 形式。主キー。
 * @property {string} userId - Todo を作成したユーザーの ID。外部キー。
 * @property {string} title - Todo のタイトル。
 * @property {string} description - Todo の詳細説明。NULL可。
 * @property {number} isCompleted - 完了状態。0: 未完了, 1: 完了。
 * @property {string} createdAt - レコード作成日時。
 * @property {string} updatedAt - レコード更新日時。
 */
export const todos = sqliteTable(
  'todos',
  {
    todoId: text('todo_id').primaryKey(),
    userId: text('user_id')
      .notNull()
      .references(() => users.userId),
    title: text('title').notNull(),
    description: text('description'),
    isCompleted: integer('is_completed', { mode: 'boolean' })
      .notNull()
      .default(false),
    createdAt: text('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text('updated_at').notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => ({
    userIdIndex: index('idx_todos_user_id').on(table.userId),
    createdAtIndex: index('idx_todos_created_at').on(table.createdAt),
  }),
)
