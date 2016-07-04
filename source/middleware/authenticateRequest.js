// @flow

import config from 'config'

export function authenticateRequest (req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization']
  if (!authHeader) {
    res
      .status(401)
      .json({
        errors: [{ message: 'Authorization header missing' }]
      })
    return
  }

  const encodedPassword: ?Array<string> = authHeader.match(/^Basic:\s([^\s]+$)/)
  if (!encodedPassword) {
    res
      .status(401)
      .json({
        errors: [{ message: 'Authorization header format is invalid. Correct format is `Basic: <base64-encoded password>`' }]
      })
    return
  }

  const password: string = new Buffer(encodedPassword[1], 'base64').toString()
  if (password !== config.adminPassword) {
    res
      .status(401)
      .json({
        errors: [{ message: 'Invalid password' }]
      })
    return
  }
  next()
}
