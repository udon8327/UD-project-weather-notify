const express = require('express');
const app = express();
const path = require('path');
const dotenv = require('dotenv');
const axios = require('axios');
const schedule = require('node-schedule');

dotenv.config({ path: path.resolve(__dirname, `./config/${ process.env.NODE_ENV }.env`) });

app.get('/', (req, resp) => {
  axios.get(`https://opendata.cwb.gov.tw/api/v1/rest/datastore/F-D0047-061`, {
    params: {
      Authorization: process.env.AUTH_CODE,
      locationName: '中正區',
      elementName: 'WeatherDescription'
    }
  })
    .then(res => resp.send(res.data.records));
})

let rule = new schedule.RecurrenceRule();
rule.dayOfWeek = [0, 1, 2, 3, 4, 5, 6];
rule.hour = [9, 12, 15, 18, 21, 0];
rule.minute = 3;
rule.second = 0;

schedule.scheduleJob(rule, () => {
  axios.get(`https://opendata.cwb.gov.tw/api/v1/rest/datastore/F-D0047-061`, {
    params: {
      Authorization: process.env.AUTH_CODE,
      locationName: '中正區',
      elementName: 'WeatherDescription'
    }
  }).then(res => {
    let startTime = res.data.records.locations[0].location[0].weatherElement[0].time[0].startTime;
    let endTime = res.data.records.locations[0].location[0].weatherElement[0].time[0].endTime;
    let description = res.data.records.locations[0].location[0].weatherElement[0].time[0].elementValue[0].value;
    let msg = `台北市中正區\n${ startTime } ~ ${ endTime }：\n${ description }`;
    sendNotify(msg);
  }).catch(err => {
    sendNotify('取得天氣預報失敗...');
  })
});

//Line Notify權杖申請: https://notify-bot.line.me/my/
let sendNotify = msg => {
  axios.post('https://notify-api.line.me/api/notify', null, {
    headers: {
      Authorization: `Bearer ${process.env.NOTIFY_TOKEN}`
    },
    params: {
      message: msg
    }
  })
}

app.listen(8002, () => {
  console.log(`Server running at http://localhost:8002`);
})