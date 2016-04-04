// @flow

import youtubeUrl from 'youtube-url'

export default function(req: any, res: any, next: any) {
  if (Object.keys(req.body).length === 0) {
    res.status(400).send('Request body is missing')
    return
  }
  if (!youtubeUrl.valid(req.body.url)) {
    res.status(400).send('Url is invalid')
    return
  }
  next()
}
