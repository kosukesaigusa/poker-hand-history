/** 各エンドポイントの開発状況。 */
export const ENDPOINT_DEVELOPMENT_STATUS = {
  /** 実装済み。 */
  IMPLEMENTED: {
    value: 'implemented',
    displayText: '✅ 実装済み',
  },

  /** 未実装。 */
  DRAFT: {
    value: 'draft',
    displayText: '❌ 実装中 or 未実装',
  },
} as const

/** 各エンドポイントの開発状況の値を表す型。 */
export type EndpointDevelopmentStatusValue =
  (typeof ENDPOINT_DEVELOPMENT_STATUS)[keyof typeof ENDPOINT_DEVELOPMENT_STATUS]['value']

/** 各エンドポイントの開発状況オブジェクトを表す型。 */
export type EndpointDevelopmentStatus =
  (typeof ENDPOINT_DEVELOPMENT_STATUS)[keyof typeof ENDPOINT_DEVELOPMENT_STATUS]['value']