/**
 * ユーザー ID 関連のデータ定義。
 * Firebase Auth との連携に使用するユーザー ID とマッピングを定義する。
 */
import type * as schema from '../../../schema'

/**
 * デフォルトユーザー ID。
 * 環境固有の設定がない場合に使用される ID。
 */
export const DEFAULT_USER_IDS = {
  // アクティブユーザー
  USER_1: 'user-1',
  USER_2: 'user-2',
  USER_3: 'user-3',
  
  // 削除されたユーザー
  DELETED_USER: 'deleted-user-1',
}

/**
 * Firebase Auth ユーザー ID。
 * 未設定（undefined）の場合はデフォルト値が使用される。
 */
export const FIREBASE_AUTH_USER_IDS = {
  /** ユーザー 1 - アクティブなユーザー。 */
  USER_1_ID: 'CuPXWts7R3UR80sCRztkcNRmDUI3',

  /** ユーザー 2 - アクティブなユーザー。 */
  USER_2_ID: 'jERI4y8OOoMYjQ50lahNZyfKdT13',

  /** ユーザー 3 - アクティブなユーザー。 */
  USER_3_ID: 'u5C9dVUVajdJWcBs6ZYliIG7rFT2',

  /** 削除されたユーザー - テスト用。 */
  DELETED_USER_ID: 'e9CUQrX4ccVnSsB3bkWpVEZGbVg2',
}

/**
 * ユーザー ID のマッピング。
 * シードデータ内で使用されるユーザー ID と実際の Firebase Auth ユーザー ID の対応関係。
 */
export const USER_ID_MAP: Record<string, string | undefined> = {
  [DEFAULT_USER_IDS.USER_1]: FIREBASE_AUTH_USER_IDS.USER_1_ID,
  [DEFAULT_USER_IDS.USER_2]: FIREBASE_AUTH_USER_IDS.USER_2_ID,
  [DEFAULT_USER_IDS.USER_3]: FIREBASE_AUTH_USER_IDS.USER_3_ID,
  [DEFAULT_USER_IDS.DELETED_USER]: FIREBASE_AUTH_USER_IDS.DELETED_USER_ID,
}

/**
 * ユーザー ID を取得するためのパラメータ。
 */
type GetUserIdParam = {
  defaultId: string
  overrideUserId: boolean
}

/**
 * 実際に使用するユーザー ID を取得する。
 *
 * @param param デフォルトのユーザー ID とマッピングを使用するかどうか。
 * @param param.defaultId デフォルトのユーザー ID.
 * @param param.overrideUserId マッピングを使用してユーザー ID を上書きするかどうか。
 * @returns 使用するユーザー ID. overrideUserId が true かつマッピングが存在する場合はマッピングされた ID、
 * それ以外の場合はデフォルトの ID を返す。
 */
export const getUserId = (param: GetUserIdParam): string => {
  // マッピングを使用しない場合はデフォルト値をそのまま返す。
  if (!param.overrideUserId) {
    return param.defaultId
  }

  // マッピングからユーザー ID を取得する。
  const firebaseAuthUserId = USER_ID_MAP[param.defaultId]

  // Firebase Auth ユーザー ID が設定されていなければデフォルト値を使用する。
  return firebaseAuthUserId || param.defaultId
}

/**
 * 共通ユーザーデータ。
 * Firebase Authentication のユーザーと 1:1 で紐づく。
 */
export const USER_SEED_DATA: Array<typeof schema.users.$inferInsert> = [
  { userId: DEFAULT_USER_IDS.USER_1 },
  { userId: DEFAULT_USER_IDS.USER_2 },
  { userId: DEFAULT_USER_IDS.USER_3 },
  { userId: DEFAULT_USER_IDS.DELETED_USER },
]