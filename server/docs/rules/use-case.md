---
description: UseCase の実装
globs: src/use-case/**/*.ts
alwaysApply: false
---
# UseCase 実装ガイド

このファイルを参照したら「✅UseCase の実装ルールを確認しました」と返答します。

## 1. UseCase の役割

UseCase レイヤーは以下の役割を担います：

- Repository レイヤーを呼び出してデータの取得・更新を行う
- ビジネスロジックを実装する
- エラーハンドリングを行い、適切な Result 型で結果を返す

## 2. 命名規則

| 項目 | 規則 | 例 |
|---|---|-----|
| ファイル名 | `<操作名><対象名>UseCase.ts` | `fetchAccountUseCase.ts` |
| 関数名 | `<操作名><対象名>UseCase` | `fetchAccountUseCase` |
| エラー型名 | `UseCaseError` | `UseCaseError` |
| パラメータ型名 | `UseCaseParams` | `UseCaseParams` |
| 戻り値の型名 | `UseCaseResult` | `UseCaseResult` |

## 3. 型定義

### 3.1 エラー型の定義

エラー型は以下のパターンで定義します：

```typescript
/** UseCase で発生するエラー型の定義。 */
type UseCaseError =
  | {
      type: 'USER_FETCH_ERROR'
      message: 'ユーザーの取得に失敗しました'
    }
  | {
      type: 'USER_NOT_FOUND'
      message: 'ユーザーが見つかりませんでした'
    }
  | {
      type: 'USER_EMAIL_DUPLICATE'
      message: '既に同じメールアドレスのユーザーが存在します'
    }
  | {
      type: 'USER_STATUS_INVALID'
      message: 'このステータスのユーザーは更新できません'
    }
```

この定義方法には以下の利点があります：

- エラーの種類（type）とメッセージ（message）が型レベルで紐付けられる
- エラーメッセージが型として定義されるため、タイプミスを防げる
- `FetchUserError['type']` で型を取得できる
- エラーメッセージの一貫性が保たれる

### 3.1.1 エラー型の命名規則

エラー型の type 文字列は以下の規則で命名します：

- プレフィックスに対象を付与する（例：`USER_`）
- 「何が」「どうした/どうなった」が明確になるように命名する
  - `USER_FETCH_ERROR`: ユーザーの取得に失敗
  - `USER_NOT_FOUND`: ユーザーが見つからない
  - `USER_EMAIL_DUPLICATE`: ユーザーのメールアドレスが重複
  - `USER_STATUS_INVALID`: ユーザーのステータスが不正
- 実装の詳細（レイヤーなど）は含めず、事象を表現する
  - 良い例：`USER_FETCH_ERROR`
  - 悪い例：`USER_REPOSITORY_ERROR`

### 3.2 パラメータ型の定義

```typescript
/** UseCase のパラメータ型の定義。 */
type UseCaseParams = {
  userId: string
}
```

### 3.3 戻り値の型定義

戻り値の型は必ず `Result<T, Error>` を使用します：

```typescript
Promise<Result<void, FetchUserError>>
// または
Promise<Result<FetchUserResult, FetchUserError>>
```

## 4. エラーハンドリング

### 4.1 基本方針

- エラーは throw ではなく `Result` 型で返す
- エラーは discriminated union として定義する
- エラーメッセージは具体的に記述する
- エラーの種類は `ErrorType` として定義する
- エラーメッセージは日本語で記述する

### 4.2 エラーを返す実装例

```typescript
// Repository からのエラーをハンドリングする。
if (userResult.isErr()) {
  return err({
    type: 'USER_FETCH_ERROR' as const,
    message: 'ユーザーの取得に失敗しました' as const,
  })
}

// 存在チェックを行う。
const user = userResult.value
if (!user) {
  return err({
    type: 'USER_NOT_FOUND' as const,
    message: 'ユーザーが見つかりませんでした' as const,
  })
}
```

## 5. 実装パターン

### 5.1 基本的な実装パターン（void を返す場合）

```typescript
import { type Result, err, ok } from 'neverthrow'
import { deleteUser } from '../../repository/mutation/userMutationRepository'

/** UseCase で発生するエラー型の定義。 */
type UseCaseError =
  | {
      type: 'USER_FETCH_ERROR'
      message: 'ユーザーの取得に失敗しました'
    }
  | {
      type: 'USER_NOT_FOUND'
      message: 'ユーザーが見つかりませんでした'
    }
  | {
      type: 'USER_DELETE_ERROR'
      message: 'ユーザーの削除に失敗しました'
    }

/** UseCase のパラメータ型の定義。 */
type UseCaseParams = {
  userId: string
}

/**
 * ユーザーを削除する。
 * @param params - パラメータ。
 * @returns 削除結果。
 */
export const deleteUserUseCase = async (
  params: DeleteUserParams,
): Promise<Result<void, DeleteUserError>> => {
  // ユーザーを取得する。
  const userResult = await getUserById(params.userId)
  if (userResult.isErr()) {
    return err({
      type: 'USER_FETCH_ERROR' as const,
      message: 'ユーザーの取得に失敗しました' as const,
    })
  }

  // 存在チェックを行う。
  const user = userResult.value
  if (!user) {
    return err({
      type: 'USER_NOT_FOUND' as const,
      message: 'ユーザーが見つかりませんでした' as const,
    })
  }

  // ユーザーを削除する。
  const deleteResult = await deleteUser(params.userId)
  if (deleteResult.isErr()) {
    return err({
      type: 'USER_DELETE_ERROR' as const,
      message: 'ユーザーの削除に失敗しました' as const,
    })
  }

  return ok(undefined)
}
```

### 5.2 戻り値がある実装パターン

```typescript
import { type Result, err, ok } from 'neverthrow'
import { getUserById } from '../../repository/query/userQueryRepository'

/** UseCase で発生するエラー型の定義。 */
type UseCaseError =
  | {
      type: 'USER_FETCH_ERROR'
      message: 'ユーザーの取得に失敗しました'
    }
  | {
      type: 'USER_NOT_FOUND'
      message: 'ユーザーが見つかりませんでした'
    }

/** UseCase のパラメータ型の定義。 */
type UseCaseParams = {
  userId: string
}

/** UseCase の戻り値の型の定義。 */
type UseCaseResult = {
  id: string
  name: string
  email: string
  createdAt: Date
}

/**
 * ユーザーを取得する。
 * @param params - パラメータ。
 * @returns 取得結果。
 */
export const fetchUserUseCase = async (
  params: FetchUserParams,
): Promise<Result<FetchUserResult, FetchUserError>> => {
  // ユーザーを取得する。
  const result = await getUserById(params.userId)
  if (result.isErr()) {
    return err({
      type: 'USER_FETCH_ERROR' as const,
      message: 'ユーザーの取得に失敗しました' as const,
    })
  }

  // 存在チェックを行う。
  const user = result.value
  if (!user) {
    return err({
      type: 'USER_NOT_FOUND' as const,
      message: 'ユーザーが見つかりませんでした' as const,
    })
  }

  return ok({
    id: user.id,
    name: user.name,
    email: user.email,
    createdAt: user.createdAt,
  })
}
```

### 5.3 複数の Repository 呼び出しを含む実装パターン

```typescript
import { type Result, err, ok } from 'neverthrow'
import { createMediaComment } from '../../repository/mutation/mediaCommentMutationRepository'
import { getFamilyMemberByUserId } from '../../repository/query/familyMemberQueryRepository'

/** UseCase で発生するエラー型の定義。 */
type UseCaseError =
  | {
      type: 'FAMILY_MEMBER_FETCH_ERROR'
      message: '家族メンバーの取得に失敗しました'
    }
  | {
      type: 'FAMILY_MEMBER_NOT_FOUND'
      message: '家族メンバーが見つかりませんでした'
    }
  | {
      type: 'MEDIA_COMMENT_CREATE_ERROR'
      message: 'メディアコメントの作成に失敗しました'
    }

/** UseCase のパラメータ型の定義。 */
type UseCaseParams = {
  familyId: string
  folderId: string
  mediaId: string
  userId: string
  comment: string
}

/** UseCase の戻り値の型の定義。 */
type UseCaseResult = {
  commentId: string
  userId: string
  name: string
  comment: string
  createdAt: Date
  updatedAt: Date
}

/**
 * メディアにコメントを追加する。
 * @param params - パラメータ。
 * @returns コメントの作成結果。
 */
export const postMediaCommentUseCase = async (
  params: PostMediaCommentParams,
): Promise<Result<PostMediaCommentResult, PostMediaCommentError>> => {
  // 家族メンバーを取得する。
  const familyMemberResult = await getFamilyMemberByUserId({
    familyId: params.familyId,
    userId: params.userId,
  })

  // 家族メンバーの取得に失敗した場合はエラーを返す。
  if (familyMemberResult.isErr()) {
    return err({
      type: 'FAMILY_MEMBER_FETCH_ERROR' as const,
      message: '家族メンバーの取得に失敗しました' as const,
    })
  }

  // 家族メンバーが存在しない場合はエラーを返す。
  if (!familyMemberResult.value) {
    return err({
      type: 'FAMILY_MEMBER_NOT_FOUND' as const,
      message: '家族メンバーが見つかりませんでした' as const,
    })
  }

  // メディアコメントを作成する。
  const result = await createMediaComment({
    familyId: params.familyId,
    folderId: params.folderId,
    mediaId: params.mediaId,
    userId: params.userId,
    name: familyMemberResult.value.name,
    comment: params.comment,
  })

  if (result.isErr()) {
    return err({
      type: 'MEDIA_COMMENT_CREATE_ERROR' as const,
      message: 'メディアコメントの作成に失敗しました' as const,
    })
  }

  return ok({
    commentId: result.value.commentId,
    userId: result.value.userId,
    name: result.value.name,
    comment: result.value.comment,
    createdAt: result.value.createdAt,
    updatedAt: result.value.updatedAt,
  })
}
```

### 5.4 配列を返す実装パターン

```typescript
import { type Result, err, ok } from 'neverthrow'
import { getFamilyMembersByFamilyId } from '../../repository/query/familyQueryRepository'
import type { FamilyMemberRole } from '../../util/familyMemberRole'

/** UseCase で発生するエラー型の定義。 */
type UseCaseError = {
  type: 'FAMILY_MEMBER_FETCH_ERROR'
  message: 'メンバー一覧の取得に失敗しました'
}

/** UseCase のパラメータ型の定義。 */
type UseCaseParams = {
  familyId: string
}

/** UseCase の戻り値の型の定義。 */
type UseCaseResult = {
  familyMemberId: string
  name: string
  role: FamilyMemberRole
  imageUrl: string | undefined
  createdAt: Date
  updatedAt: Date
}[]

/**
 * 指定した家族のメンバー一覧を取得する。
 * @param params - パラメータ。
 * @returns メンバー一覧。
 */
export const fetchMembersByFamilyIdUseCase = async (
  params: FetchMembersByFamilyIdParams,
): Promise<Result<FetchMembersByFamilyIdResult, FetchMembersByFamilyIdError>> => {
  // メンバー一覧を取得する。
  const result = await getFamilyMembersByFamilyId({ familyId: params.familyId })

  if (result.isErr()) {
    return err({
      type: 'FAMILY_MEMBER_FETCH_ERROR' as const,
      message: 'メンバー一覧の取得に失敗しました' as const,
    })
  }

  return ok(
    result.value.map((member) => ({
      familyMemberId: member.familyMemberId,
      name: member.name,
      role: member.role,
      imageUrl: member.imageUrl,
      createdAt: member.createdAt,
      updatedAt: member.updatedAt,
    })),
  )
}
```

### 5.5 void を返す実装パターン

```typescript
import { type Result, err, ok } from 'neverthrow'
import { deleteMediaFavorite } from '../../repository/mutation/mediaFavoriteMutationRepository'

/** UseCase で発生するエラー型の定義。 */
type UseCaseError = {
  type: 'MEDIA_FAVORITE_DELETE_ERROR'
  message: 'メディアのお気に入り解除に失敗しました'
}

/** UseCase のパラメータ型の定義。 */
type UseCaseParams = {
  familyId: string
  folderId: string
  mediaId: string
  userId: string
}

/**
 * メディアのお気に入りを解除する。
 * @param params - パラメータ。
 * @returns メディアのお気に入りを解除した結果。
 */
export const deleteMediaFavoriteUseCase = async (
  params: DeleteMediaFavoriteParams,
): Promise<Result<void, DeleteMediaFavoriteError>> => {
  // メディアのお気に入りを解除する。
  const result = await deleteMediaFavorite({
    familyId: params.familyId,
    folderId: params.folderId,
    mediaId: params.mediaId,
    userId: params.userId,
  })

  if (result.isErr()) {
    return err({
      type: 'MEDIA_FAVORITE_DELETE_ERROR' as const,
      message: 'メディアのお気に入り解除に失敗しました' as const,
    })
  }

  return ok(undefined)
}
```

## 6. コメント規則

### 6.1 基本ルール

- エラークラスには JSDoc でエラーの説明を記述する
- UseCase 関数には JSDoc で処理の説明、パラメータ、戻り値の説明を記述する
- 処理の各ステップにはインラインコメントで説明を記述する
- インラインコメントは処理の前の行に記述する
- コメントは「。」で、または、半角英数字で終わる場合は「.」で終わる完全な文章で記述する
- コメントは「だ・である」調で統一する

### 6.2 JSDoc コメント

#### エラー型

```typescript
/** UseCase で発生するエラー型の定義。 */
type UseCaseError =
  | {
      type: 'USER_FETCH_ERROR'
      message: 'ユーザーの取得に失敗しました'
    }
  | {
      type: 'USER_NOT_FOUND'
      message: 'ユーザーが見つかりませんでした'
    }
```
