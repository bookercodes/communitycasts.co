// @flow

import commaSplit from 'comma-split'

export function mapTags (tags: string): Object[] {
  return commaSplit(tags).map(tag => ({
    id: tag
  }))
}
