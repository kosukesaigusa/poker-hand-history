/** ミドルウェアのエラーコード。 */
const MIDDLEWARE_ERROR_CODES = {
  /** 開発環境向けのエラーコード。 */
  DEVELOPMENT: {
    /** 開発環境向けのエラーコード。 */
    DEVELOPMENT_ONLY: {
      code: 'middleware.development.1',
      descriptionForOpenAPISpec:
        'このエンドポイントは開発環境でのみ使用できます。',
    },
  },
  /** 認証ミドルウェアのエラーコード。 */
  AUTH: {
    /** ユーザー認証（ID トークンの取得・検証）に失敗した場合のエラーコード。 */
    USER_AUTH_ERROR: {
      code: 'middleware.auth.1',
      descriptionForOpenAPISpec: 'ユーザー認証に失敗しました。',
    },
  },
  /** ミドルウェアが要求するパラメータが設定されていない場合のエラーコード。 */
  PARAMETER: {
    /** パラメータが設定されていない場合のエラーコード。 */
    MIDDLEWARE: {
      code: 'middleware.parameter.1',
      descriptionForOpenAPISpec:
        'ミドルウェアが要求するパラメータが設定されていません。',
    },
  },
} as const

/** エンドポイントのエラーコード。 */
const ENDPOINT_ERROR_CODES = {
  /** サインアップのエラーコード。 */
  SIGN_UP: {
    /** サインアップに失敗した場合のエラーコード。 */
    ERROR: {
      code: 'signup.1',
      descriptionForOpenAPISpec: 'サインアップに失敗しました。',
    },
  },
  /** Todo一覧取得のエラーコード。 */
  GET_TODOS: {
    /** Todo一覧取得に失敗した場合のエラーコード。 */
    FETCH_ERROR: {
      code: 'todos.get.1',
      descriptionForOpenAPISpec: 'Todo一覧の取得に失敗しました。',
    },
  },
  /** Todo作成のエラーコード。 */
  POST_TODO: {
    /** Todo作成に失敗した場合のエラーコード。 */
    CREATE_ERROR: {
      code: 'todos.post.1',
      descriptionForOpenAPISpec: 'Todoの作成に失敗しました。',
    },
    /** バリデーションエラー。 */
    VALIDATION_ERROR: {
      code: 'todos.post.2',
      descriptionForOpenAPISpec: 'リクエストデータが不正です。',
    },
  },
  /** Todo完了状態更新のエラーコード。 */
  PATCH_TODO_STATUS: {
    /** Todo完了状態更新に失敗した場合のエラーコード。 */
    UPDATE_ERROR: {
      code: 'todos.patch.1',
      descriptionForOpenAPISpec: 'Todo完了状態の更新に失敗しました。',
    },
    /** Todoが見つからない場合のエラーコード。 */
    NOT_FOUND: {
      code: 'todos.patch.2',
      descriptionForOpenAPISpec: '指定されたTodoが見つかりません。',
    },
  },
} as const

/** システム全体のエラーコード定義。 */
export const ERROR_CODES = {
  ...MIDDLEWARE_ERROR_CODES,
  ...ENDPOINT_ERROR_CODES,
} as const

/** エラーコードの型を生成。 */
type ErrorCodes = typeof ERROR_CODES

/** 各ハンドラーで使用するエラーコードの型を取得するユーティリティ型。 */
export type HandlerErrorCodes<T extends keyof ErrorCodes> = ErrorCodes[T]
