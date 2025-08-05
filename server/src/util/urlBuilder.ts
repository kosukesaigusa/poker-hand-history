/**
 * URL を構築するためのユーティリティ関数群。
 */

/**
 * ベース URL を構築する。
 * @param params - パラメータオブジェクト。
 * @param params.protocol - プロトコル (例: "https:")。
 * @param params.host - ホスト名 (例: "example.com")。
 * @param params.path - パス (例: "api/poker")。
 * @returns 構築されたベース URL.
 */
const buildBaseUrl = ({
  protocol,
  host,
  path,
}: { protocol: string; host: string; path: string }): string => {
  return `${protocol}//${host}/${path}`
}

/**
 * 基本的な API URL を構築する。
 * @param params - パラメータオブジェクト。
 * @param params.protocol - プロトコル。
 * @param params.host - ホスト名。
 * @param params.path - パス。
 * @returns API URL.
 */
export const buildApiUrl = ({
  protocol,
  host,
  path,
}: {
  protocol: string
  host: string
  path: string
}): string => {
  return buildBaseUrl({
    protocol,
    host,
    path: `api/${path}`,
  })
}
