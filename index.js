'use strict'
/**************************************************
Nodejs8.9-Apigateway
***************************************************/
const axios = require('axios');


const MongoClient = require('mongodb').MongoClient;


const url = process.env.url
const dbName = process.env.dbName;
const client = new MongoClient(url, { useUnifiedTopology: true });


exports.main_handler = async (event, context, callback) => {
  console.log('start main handler')

  const result = await axios({
    method: "get",
    url: "https://map.baidu.com/?newmap=1&reqflag=pcmap&biz=1&from=webmap&da_par=baidu&pcevaname=pc4.1&qt=nav&c=17&sn=1$$$$12610942.36,2614923.52$$%E5%B9%BF%E4%B8%9C%E7%9C%81%E5%B9%BF%E5%B7%9E%E5%B8%82%E7%95%AA%E7%A6%BA%E5%8C%BA%E5%8D%97%E7%AB%99%E5%8D%97%E8%B7%AF$$0$$$$&en=0$$005861080d6607a446e27468$$12096723.05,2797127.39$$%E5%AE%9C%E5%B7%9E%E5%B8%82%E4%BA%BA%E6%B0%91%E5%8C%BB%E9%99%A2$$0$$$$&sc=17&ec=17&pn=0&rn=5&mrs=1&version=4&route_traffic=1&sy=0&da_src=&da_src=pcmappg.searchBox.button&extinfo=63&tn=B_NORMAL_MAP&nn=0&auth=4fcQv7IPv1FVQXI0H84YLD3PKNFHKWx9uxHNTxHNzzTtgz%402VJtyBxwi04vy77uy1uVtyeGuxtE20w5V198P8J9v7u1cv3uxNt6ssmsJ0IPWv3GuzTt7dPD%3DCUvhgMZSguxzBEHLNRTVtcEWe1GD8zv7u%40ZPuVteuVtegvcguxHNTxHNxHBtquTTG3Ft%40%40YwzV&u_loc=12687311,2562978&ie=utf-8&l=10&b=(12212532.344999999,2609398.875;12489268.344999999,2826230.875)&t=1579157248346",
  }).then(res => {
    return res.data.content.routes;
  });

  const time = new Date().getTime();
  let insertValue = result.map(route => {
    return {
      duration: route.legs[0].duration,
      time,
      name: route.main_roads
    };
  })
  insertValue = insertValue.filter(route => route.name.includes('梧柳高速'))
  // console.log(result);
  await insertMany(insertValue);


  return {
    isBase64: false,
    statusCode: 200,
    headers: { 'Content-Type': 'text', 'Access-Control-Allow-Origin': '*' },
    body: result
  }
}

function insertMany(value) {
  return new Promise((resolve, reject) => {
    client.connect(function (err) {
      if (err) {
        reject(err);
      }
      console.log("Connected successfully to server");

      const db = client.db(dbName);

      db.collection('crawler-home').insertMany(value)

      client.close();
      resolve();
    })
  })
}