const express = require('express');
const app = express();
const dotenv = require('dotenv');
const axios = require('axios');
const schedule = require('node-schedule');
const LineAPI = require('line-api');
dotenv.config();

const notify = new LineAPI.Notify({
  token: process.env.NOTIFY_TOKEN //Line Notify權杖: https://notify-bot.line.me/my/
})


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

app.listen(8002, () => {
  console.log(`Server running at http://localhost:8002`);
})

let rule = new schedule.RecurrenceRule();
rule.dayOfWeek = [0, new schedule.Range(0, 6)];
rule.hour = 1;
rule.minute = 18;
rule.second = 00;

schedule.scheduleJob(rule, () => {
  console.log(new Date().toLocaleString());
  notify.send({
    message: '測試訊息',
    sticker: 'smile', // shorthand
    // sticker : { packageId: 1, id: 2 } // exact ids
    // image: 'test.jpg' // local file
    // image: { fullsize: 'http://example.com/1024x1024.jpg', thumbnail: 'http://example.com/240x240.jpg' } // remote url
  }).then(console.log('發送成功!'))
});
