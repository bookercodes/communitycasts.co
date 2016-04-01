// @flow

import config from 'config'

export default function (req: any, res: any, next: any) {
  const authHeader: string = req.headers['authorization']
  if (!authHeader) {
    res.sendStatus(401)
    return
  }
  const encodedPassword: ?Array<string> = authHeader.match(/^Basic:\s([^\s]+$)/)
  if (!encodedPassword) {
    res.sendStatus(401)
    return
  }
  const password: string = new Buffer(encodedPassword[1], 'base64').toString()
  if (password !== config.adminPassword) {
    res.sendStatus(401)
    return
  }
  next()
}

