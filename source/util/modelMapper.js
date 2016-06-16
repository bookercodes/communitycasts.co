// @flow

import commaSplit from 'comma-split'

function removeSpaces( string ) {
	return string.replace(/\s{2,}/g, ' ')
}

function capitalize( stirng ) {
	return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase()
}

export function mapTags (tags: string): Object[] {
  return commaSplit( removeSpaces(tags) ).map(tag => ({
    id: capitalize( tag.trim() )
  }))
}
