import { ulid } from 'ulidx'

/** ULID を生成する。 */
export const getULID = () => {
  return ulid()
}
