// @flow

import config from 'config'

const authenticateRequest = function (req: Request, res: Response, next: NextFunction) {
  const authHeader: string = req.headers['authorization']
  if (!authHeader) {
    res.status(401).json({
      errors: [{ message: 'Authorization header missing' }]
    })
    return
  }

  const encodedPassword: ?Array<string> = authHeader.match(/^Basic:\s([^\s]+$)/)
  if (!encodedPassword) {
    res.status(401).json({
      errors: [{ message: 'Authorization header format is invalid' }]
    })
    return
  }

  const password: string = new Buffer(encodedPassword[1], 'base64').toString()
  if (password !== config.adminPassword) {
    res.status(401).json({
      errors: [{ message: 'Invalid password' }]
    })
    return
  }
  next()
}

export default authenticateRequest
