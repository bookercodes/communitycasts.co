// @flow

import youtubeUrl from 'youtube-url'

function urlValidator(url) {
  if (!url) {
    return 'url is missing'
  }
  if (!youtubeUrl.valid(url)) {
    return 'url is not a valid YouTube url'
  }
}

function tagsValidator(tags) {
  if (!tags) {
    return 'tags is missing'
  }
}

export default function(req: any, res:any, next:any): any {

  const urlError = urlValidator(req.body.url)
  const tagError = tagsValidator(req.body.tags)
  const errors = []

  if (urlError) {
    errors.push({
      field: 'url',
      message: urlError
    })
  }

  if (tagError) {
    errors.push({
      field: 'tags',
      message: tagError
    })
  }

  if (errors.length !== 0) {
    res.status(400).json({errors})
  } else {
    next()
  }
}
