import db from 'sequelize-connect'
import path from 'path'
import app from './app'
import config from 'config'

async function connectToDatabase () {
  db.logger.level = null // Disable sequelize-connect logging
  db.discover = [path.join(__dirname, '../models')]
  db.matcher = function shouldImportModel (modelFileName) {
    return true
  }
  db.connect(config.database, config.username, config.password)
}

(async function () {
  await connectToDatabase()
  app.listen(3000)
})()
