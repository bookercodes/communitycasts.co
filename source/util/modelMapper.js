import commaSplit from 'comma-split'
export default {
  mapTags (tags) {
    return commaSplit(tags).map(tag => {
      return { id: tag }
    })
  }
}
