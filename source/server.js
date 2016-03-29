// @flow

import express from 'express'

const app: any = express()

app.get('*', (req, res) => res.json('hello'))

app.listen(3000)

export default app
