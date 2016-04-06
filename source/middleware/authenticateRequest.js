// @flow

import config from 'config'
import statusCodes from '../util/statusCodes';

export default function (req: any, res: any, next: any) {
  const authHeader: string = req.headers['authorization']
  if (!authHeader) {
    res.status(401).send(statusCodes.authHeaderMiss)
    return
  }
  const encodedPassword: ?Array<string> = authHeader.match(/^Basic:\s([^\s]+$)/)
  if (!encodedPassword) {
    res.status(401).send(statusCodes.authHeaderInv)
    return
  }
  const password: string = new Buffer(encodedPassword[1], 'base64').toString()
  if (password !== config.adminPassword) {
    res.status(401).send(statusCodes.passwordInv)
    return
  }
  next()
}
