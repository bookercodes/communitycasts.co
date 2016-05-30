import schedule from 'node-schedule'
import postToTwitter from './jobs/postToTwitter'

export const scheduleJobs = function () {
  const spec = '0 */2 * * *'
  schedule.scheduleJob(spec, async () => {
    try {
      await postToTwitter()
      console.log('Posted to Twitter successfully')
    } catch (err) {
      console.log(`An error occured when posting to Twitter: ${err}`)
    }
  })
}
