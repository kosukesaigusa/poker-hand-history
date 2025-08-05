---
description: repository の実装
globs: src/repository/**/*.ts
alwaysApply: false
---
# Repository 実装ガイド

このファイルを参照したら「✅Repository の実装ルールを確認しました」と返答します。

## 1. Repository の役割

Repository レイヤーはデータベースアクセスを担当し、以下の責務を持ちます：

- データベースからのデータ取得
- データベースへのデータ保存・更新・削除
- データベース操作のエラーハンドリング
- 取得結果を適切な形式に変換
- **セキュリティ境界の役割**: 権限制御に必要なパラメータを受け取り、不正アクセスを防ぐ

## 2. ディレクトリ構成

Repository は用途に応じて以下のディレクトリに配置します：

- **取得系**: `src/repository/query/` ディレクトリ
- **更新系**: `src/repository/mutation/` ディレクトリ

## 3. 命名規則

| 操作 | 接頭辞 | 例 |
|------|--------|-----|
| 取得（単一） | `get` | `getUserById` |
| 取得（複数） | `list` | `listUsersByGroupId` |
| 作成 | `create` | `createUser` |
| 更新 | `update` | `updateUserProfile` |
| 削除 | `delete` | `deleteUser` |
| 存在確認 | `exists` | `existsUserByEmail` |

## 4. セキュリティ設計原則

### 4.1 基本方針

Repository層は **多層防御の最後の砦** として機能し、以下の原則に従って実装する：

- **Repository単体でのセキュリティ**: 呼び出し元に依存せず、Repository単体で不正アクセスを防ぐ
- **権限境界パラメータの必須化**: アクセス制御に必要なIDを必須パラメータとして受け取る
- **WHERE句での権限制御**: SQLのWHERE句で権限境界を明示的に定義する

### 4.2 権限境界パラメータの設計

権限制御が必要なRepositoryでは、以下のパラメータを必須とする：

```typescript
// ❌ 悪い例：権限制御パラメータが不足
type BadRepositoryParams = {
  childId: string
  order: number
}

// ✅ 良い例：familyIdで権限境界を明確化
type GoodRepositoryParams = {
  familyId: string  // 権限境界パラメータ
  childId: string
  order: number
}
```

### 4.3 WHERE句での権限制御

SQLのWHERE句で権限境界を必ず含める：

```typescript
// ❌ 悪い例：権限制御が不十分
const result = await db
  .select(...)
  .from(childAiReferenceImages)
  .where(
    and(
      eq(childAiReferenceImages.childId, params.childId),
      eq(childAiReferenceImages.order, params.order),
    ),
  )

// ✅ 良い例：familyIdで権限制御を追加
const result = await db
  .select(...)
  .from(childAiReferenceImages)
  .where(
    and(
      eq(childAiReferenceImages.familyId, params.familyId),  // 権限制御
      eq(childAiReferenceImages.childId, params.childId),
      eq(childAiReferenceImages.order, params.order),
    ),
  )
```

### 4.4 設計判断の基準

Repository設計時は以下の質問で権限制御の必要性を判断する：

1. **「このRepositoryが他のUseCaseから呼ばれても安全か？」**
2. **「呼び出し元の権限チェックが失敗しても、このRepositoryは不正アクセスを防げるか？」**
3. **「権限境界となるIDパラメータは適切に含まれているか？」**

### 4.5 実装例

#### 権限制御が必要な場合

```typescript
/** 家族の子どものAI参照画像を取得する。 */
type RepositoryParams = {
  familyId: string    // 権限境界：この家族のメンバーのみアクセス可能
  childId: string
  order: number
}

export const getChildAiReferenceImageByOrder = async (
  params: RepositoryParams,
): Promise<Result<RepositoryResult, Error>> => {
  // WHERE句で familyId を必ず含めることで権限制御を実現
  const result = await db
    .select(...)
    .from(childAiReferenceImages)
    .where(
      and(
        eq(childAiReferenceImages.familyId, params.familyId),  // 必須
        eq(childAiReferenceImages.childId, params.childId),
        eq(childAiReferenceImages.order, params.order),
      ),
    )
}
```

#### 権限制御が不要な場合

```typescript
/** 公開情報の取得（権限制御不要）。 */
type RepositoryParams = {
  userId: string
}

export const getPublicUserProfile = async (
  params: RepositoryParams,
): Promise<Result<RepositoryResult, Error>> => {
  // 公開情報のため権限制御は不要
  const result = await db
    .select({
      name: users.name,
      avatar: users.avatar,
    })
    .from(users)
    .where(eq(users.id, params.userId))
}
```

## 5. 戻り値の型

- すべての Repository 関数は `Promise<Result<T, Error>>` 型を返す
- 成功時は `ok(データ)` を返す
- 失敗時は `err(エラー)` を返す

## 6. 実装パターン

### 6.1 取得系 Repository

```typescript
import { eq } from 'drizzle-orm'
import { asc } from 'drizzle-orm'
import { getContext } from 'hono/context-storage'
import { type Result, err, ok } from 'neverthrow'
import type { EnvironmentVariables } from '../../env'
import { users } from '../../schema'

/** ユーザーを取得する際のパラメータ。 */
type RepositoryParams = {
  userId: string
}

/** ユーザーの取得結果。 */
type RepositoryResult = {
  id: string
  name: string
  email: string
  createdAt: Date
}

/**
 * 指定した ID のユーザーを取得する。
 * @param params - パラメータ。
 * @returns ユーザー情報。
 */
export const getUserById = async (
  params: RepositoryParams,
): Promise<Result<RepositoryResult, Error>> => {
  const c = getContext<EnvironmentVariables>()
  const db = c.var.db
  const logger = c.get('logger')

  try {
    // ユーザーを取得する。
    const result = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(eq(users.id, params.userId))
      .get()

    // 結果がない場合は失敗を返す。
    if (!result) {
      return err(new Error(`ユーザーの取得に失敗しました: ${params.userId}`))
    }

    // 日付型に変換して返す。
    return ok({
      ...result,
      createdAt: new Date(result.createdAt),
    })
  } catch (e) {
    if (e instanceof Error) {
      logger.error(`Repository Error: ${e}`, e)
      return err(e)
    }
    return err(new Error('ユーザーの取得に失敗しました'))
  }
}

/** ユーザー一覧を取得する際のパラメータ。 */
type RepositoryParams = {
  groupId: string
}

/** ユーザー一覧の取得結果。 */
type RepositoryResult = {
  id: string
  name: string
  email: string
  createdAt: Date
}[]

/**
 * 指定したグループに属するユーザー一覧を取得する。
 * @param params - パラメータ。
 * @returns ユーザー一覧。
 */
export const listUsersByGroupId = async (
  params: RepositoryParams,
): Promise<Result<RepositoryResult, Error>> => {
  const c = getContext<EnvironmentVariables>()
  const db = c.var.db
  const logger = c.get('logger')

  try {
    // ユーザー一覧を取得する。
    const result = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        createdAt: users.createdAt,
      })
      .from(users)
      .innerJoin(userGroups, eq(users.id, userGroups.userId))
      .where(eq(userGroups.groupId, params.groupId))
      .orderBy(asc(users.createdAt))

    // 日付型に変換して返す。
    return ok(
      result.map((r) => ({
        ...r,
        createdAt: new Date(r.createdAt),
      })),
    )
  } catch (e) {
    if (e instanceof Error) {
      logger.error(`Repository Error: ${e}`, e)
      return err(e)
    }
    return err(new Error('ユーザー一覧の取得に失敗しました'))
  }
}
```

### 6.2 更新系 Repository

```typescript
import { getContext } from 'hono/context-storage'
import { type Result, err, ok } from 'neverthrow'
import { ulid } from 'ulidx'
import type { EnvironmentVariables } from '../../env'
import { users } from '../../schema'

/** ユーザーを作成する際のパラメータ。 */
type RepositoryParams = {
  name: string
  email: string
  password: string
}

/** ユーザーを作成した結果。 */
type RepositoryResult = {
  id: string
  name: string
  email: string
  createdAt: Date
}

/**
 * ユーザーを作成する。
 * @param params - パラメータ。
 * @returns 作成したユーザー情報。
 */
export const createUser = async (
  params: RepositoryParams,
): Promise<Result<RepositoryResult, Error>> => {
  const c = getContext<EnvironmentVariables>()
  const db = c.var.db
  const logger = c.get('logger')

  try {
    // ユーザー ID を生成する。
    const userId = ulid()
    const now = new Date()
    
    // ユーザーを作成する。
    await db.insert(users).values({
      id: userId,
      name: params.name,
      email: params.email,
      password: params.password,
      createdAt: now,
      updatedAt: now,
    })

    // 作成したユーザー情報を返す。
    return ok({
      id: userId,
      name: params.name,
      email: params.email,
      createdAt: now,
    })
  } catch (e) {
    if (e instanceof Error) {
      logger.error(`Repository Error: ${e}`, e)
      return err(e)
    }
    return err(new Error('ユーザーの作成に失敗しました'))
  }
}

/** ユーザーを更新する際のパラメータ。 */
type RepositoryParams = {
  userId: string
  name?: string
  email?: string
}

/** ユーザーを更新した結果。 */
type RepositoryResult = {
  id: string
  name: string
  email: string
  updatedAt: Date
}

/**
 * ユーザー情報を更新する。
 * @param params - 更新パラメータ。
 * @returns 更新したユーザー情報。
 */
export const updateUser = async (
  params: RepositoryParams,
): Promise<Result<RepositoryResult, Error>> => {
  const c = getContext<EnvironmentVariables>()
  const db = c.var.db
  const logger = c.get('logger')

  try {
    // 更新データを準備する。
    const now = new Date()
    const updateData: Record<string, unknown> = {
      updatedAt: now,
    }
    
    if (params.name !== undefined) {
      updateData.name = params.name
    }
    
    if (params.email !== undefined) {
      updateData.email = params.email
    }
    
    // ユーザーを更新する。
    await db
      .update(users)
      .set(updateData)
      .where(eq(users.id, params.userId))

    // 更新後のユーザー情報を取得する。
    const updatedUser = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
      })
      .from(users)
      .where(eq(users.id, params.userId))
      .get()

    // 結果がない場合はエラーを返す。
    if (!updatedUser) {
      return err(new Error(`ユーザーの更新に失敗しました: ${params.userId}`))
    }

    // 更新したユーザー情報を返す。
    return ok({
      ...updatedUser,
      updatedAt: now,
    })
  } catch (e) {
    if (e instanceof Error) {
      logger.error(`Repository Error: ${e}`, e)
      return err(e)
    }
    return err(new Error('ユーザーの更新に失敗しました'))
  }
}
```

## 7. エラーハンドリング

- すべてのデータベース操作は try-catch でエラーをキャッチする
- エラーは適切にログ出力する
- エラーは `Result` 型の `err` で返す
- 特定のエラー条件（存在しないレコードなど）は明示的にチェックする

## 8. コメント規則

### 8.1 基本ルール

- 関数には JSDoc でその目的、パラメータ、戻り値を記述する
- 型定義には必要に応じてコメントを付ける
- 処理の各ステップにはインラインコメントで説明を記述する
- コメントは「。」で、または、半角英数字で終わる場合は「.」で終わる完全な文章で記述する
- コメントは「だ・である」調で統一する
- インラインコメントは処理の前の行に記述する

### 8.2 JSDoc コメント

#### 関数の JSDoc

```typescript
/**
 * 指定した ID のユーザーを取得する。
 * @param params - パラメータ。
 * @returns ユーザー情報。
 */
```

#### 型定義の JSDoc

```typescript
/** ユーザーを取得する際のパラメータ。 */
type RepositoryParams = {
  userId: string
}
```

```typescript
/** ユーザーの取得結果。 */
type RepositoryResult = {
  id: string
  name: string
  email: string
  createdAt: Date
}
```

### 8.3 インラインコメント

#### データベース操作の説明

```typescript
// ユーザーを取得する。
const result = await db.select(...)
```

#### データ加工の説明

```typescript
// 日付型に変換して返す。
return ok({...})
```

#### 条件分岐の説明

```typescript
// 結果がない場合は失敗を返す。
if (!result) {
  return err(new Error(...))
}
```

### 8.4 コメント規則の適用例

コメント規則の適用例については、「6.1 取得系 Repository」と「6.2 更新系 Repository」の実装パターンを参照してください。これらの例では、適切な JSDoc コメントとインラインコメントが記述されています。

## 9. 実装チェックリスト

Repository 実装時は以下の点を確認してください：

### 9.1 セキュリティチェック

- [ ] **権限制御が必要か検討したか**
- [ ] **権限境界となるIDパラメータが含まれているか**
- [ ] **WHERE句で権限制御が適切に実装されているか**
- [ ] **Repository単体で不正アクセスを防げるか**
- [ ] **他のUseCaseから呼ばれても安全か**

### 9.2 基本実装チェック

- [ ] 命名規則に従っているか
- [ ] 適切なディレクトリに配置されているか
- [ ] 戻り値の型が `Result<T, Error>` になっているか
- [ ] try-catch でエラーをキャッチしているか
- [ ] エラーログが適切に出力されているか
- [ ] 特定のエラー条件が明示的にチェックされているか

### 9.3 ドキュメンテーションチェック

- [ ] JSDoc コメントが適切に記述されているか
- [ ] 各処理ステップにインラインコメントが記述されているか
- [ ] コメントが「だ・である」調で統一されているか
- [ ] コメントが「。」で、または、半角英数字で終わる場合は「.」で終わる完全な文章になっているか
- [ ] パラメータ型と戻り値型が関数の直前に定義されているか
- [ ] 型定義に JSDoc コメントが記述されているか
