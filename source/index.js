// @flow

import db from 'sequelize-connect'
import path from 'path'
import app from './app'
import config from 'config'
import cron from './cron'

async function connectToDatabase () {
  db.logger.level = null // Disable sequelize-connect logging
  db.discover = [path.join(__dirname, './models')]
  db.matcher = function shouldImportModel (modelFileName) {
    return true
  }
  db.connect(config.database, config.username, config.password, {
    force: true
  })
}

(async function () {
  await connectToDatabase()
  cron.scheduleJobs()
  const port = 3000
  app.listen(port, error => {
    if (error) {
      console.log(`An error occured: ${error}`)
    } else {
      console.log(`Running on port ${port}`)
    }
  })
})()
