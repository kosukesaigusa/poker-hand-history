---
description: Util の実装
globs: src/util/**/*.ts
---
# Util の実装

このファイルを参照したら「✅ Util の実装ルールを確認しました」と返答します。

## 1. 基本方針

Util ファイルでは、アプリケーション全体で使用される定数、型、エニューム、ユーティリティ関数を管理する。
一貫性のある実装パターンに従い、型安全性とメンテナンス性を重視する。

## 2. 定数・エニューム・型の実装パターン

### 2.1 基本構造

定数定義とそれに関連する型・ユーティリティは以下の順序で実装する：

1. **定数オブジェクト**（`as const` assertion を使用）
2. **型定義**（定数オブジェクトから派生）
3. **Zod 用タプル**（バリデーション用）
4. **ユーティリティ関数**（必要に応じて）

### 2.2 実装例

```typescript
/** 〇〇の一覧。 */
export const EXAMPLE_CONSTANTS = {
  /** 値1の説明。 */
  VALUE1: 'value1',
  
  /** 値2の説明。 */
  VALUE2: 'value2',
} as const

/** 〇〇を表す型。 */
export type ExampleType = (typeof EXAMPLE_CONSTANTS)[keyof typeof EXAMPLE_CONSTANTS]

/** zod の enum で使用するためのタプル。 */
export const EXAMPLE_TUPLE = [
  EXAMPLE_CONSTANTS.VALUE1,
  EXAMPLE_CONSTANTS.VALUE2,
] as const
```

### 2.3 必須要素

- **as const assertion**: TypeScript の厳密な型推論のため必須
- **JSDoc コメント**: 定数オブジェクト、各プロパティ、型、タプルすべてに記述
- **型安全な型定義**: keyof と型演算子を使用した派生型
- **Zod 用タプル**: バリデーションスキーマで使用するため必須

## 3. ファイル分割基準

### 3.1 単一責任の原則

1つのファイルは1つの概念（ドメイン）に関する定数・型のみを管理する。

例：

- `familyMemberRole.ts`: 家族メンバーの権限のみ
- `mediaContentType.ts`: メディアファイルの形式のみ
- `mediaActivityType.ts`: メディアアクティビティの種類のみ

### 3.2 関連する複数の概念がある場合

同一ファイル内で複数の概念を扱う場合は、明確に分離する。

例（`mediaContentType.ts`）：

- 画像形式用の定数・型
- 動画形式用の定数・型
- 統合されたメディア形式用の定数・型

## 4. 特別なケース

### 4.1 Content-Type のような複雑な型

外部文字列から型への変換が必要な場合は、`neverthrow` を使用したユーティリティ関数を提供する。

```typescript
/**
 * 文字列から ExampleType を取得する。
 * @param value 型に変換する文字列。
 * @returns ExampleType を含む Result。
 */
export const getExampleTypeFromString = (
  value: string,
): Result<ExampleType, Error> => {
  // 実装
}
```

### 4.2 Drizzle ORM 用のタプル

データベーススキーマで使用する場合は、`TUPLE` suffix を使用する。

```typescript
/** Drizzle の enum で使用するためのタプル。 */
export const EXAMPLE_CONTENT_TYPE_TUPLE = [
  // 値のリスト
] as const
```

## 5. コメント規約

### 5.1 JSDoc の記述

- **定数オブジェクト**: 「〇〇の一覧。」形式
- **個別定数**: 「〇〇。」形式（簡潔に）
- **型定義**: 「〇〇を表す型。」形式
- **タプル**: 「zod の enum で使用するためのタプル。」（固定文言）
- **関数**: Google TypeScript Style Guide に従う

### 5.2 名前付け規約

- **定数オブジェクト**: `UPPER_SNAKE_CASE`
- **型**: `PascalCase`
- **タプル**: `UPPER_SNAKE_CASE_TUPLE`
- **関数**: `camelCase`

## 6. 実装チェックリスト

- [ ] `as const` assertion を使用している
- [ ] 適切な JSDoc コメントが記述されている
- [ ] 型定義が keyof 演算子を使用している
- [ ] Zod 用のタプルが export されている
- [ ] ファイルが単一責任の原則に従っている
- [ ] 必要に応じてユーティリティ関数が提供されている
