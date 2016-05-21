import Connection from 'sequelize-connect'
import path from 'path'
import app from './app'
import config from 'config'

async function connectToDatabase () {
  const discover = [path.join(__dirname, './models')]
  const matcher = function shouldImportModel (modelFileName) {
    return true
  }
  await new Connection(config.database, config.username, config.password, {}, discover, matcher)
}

(async function () {
  try {
    await connectToDatabase()
  } catch (e) {
    console.log(e)
    return
  }
  const port = 3000
  app.listen(port, error => {
    if (error) {
      console.log(`An error occured: ${error}`)
    } else {
      console.log(`Running on port ${port}`)
    }
  })
})()
