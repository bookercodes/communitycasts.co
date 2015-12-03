'use strict';
import {CronJob} from 'cron';

function onTick() {
  console.log('You will see this message every second');
}

export default {
  start() {
    new CronJob('* * * * * *', onTick, null, true, 'Europe/London');
  }
};
