'use strict';

import superagent from 'superagent';
import charset from 'superagent-charset';
import cheerio from 'cheerio';
import escaper from 'true-html-escape';
import trimBody from 'trim-body';

export function get(next) {
  var url = 'http://www.okooo.com/livecenter/football/?date=';
  var requestURL = url + getNowFormatDate();
  console.log('++++++' + requestURL + '++++++++');
  charset(superagent);
  return new Promise(function(resolve, reject) {
    superagent
      .get(requestURL)
      .charset('gbk')
      .end(function(err, res) {
        if (err) {
          reject(err);
        }
        var $ = cheerio.load(res.text, {decodeEntities: false});
        //用于存放比赛数据的数组
        var results = [];
        var trList = $('.each_match');
        var titleArr = ['league', 'date', 'isFinished', 'home', 'score', 'away', 'halftime', 'odds', 'analysis'];
        trList.each(function() {
          //获取每个tr里面的td
          let tempArr = [];
          //格式化每个字符串
          $(this).find('td').each(function(index, element) {
            let trimmed = $(this).text().trim();
            let _str = trimmed.replace(/[ |\n|\r|\t|\&nbsp\;]/gim, '');
            if (_str.length > 0 || !_str.indexOf('nbsp')) {
              tempArr.push(_str);
            }
          });
          let singleMatch = {};
          for (let i = 0; i < tempArr.length; i++) {
            singleMatch[titleArr[i]] = tempArr[i];
          }
          results.push(singleMatch);
        });
        resolve(results);
      });
  });
}

function getNowFormatDate() {
  var date = new Date();
  var seperator1 = '-';
  var seperator2 = '-';
  var year = date.getFullYear();
  var month = date.getMonth() + 1;
  var strDate = date.getDate();
  if (month >= 1 && month <= 9) {
    month = '0' + month;
  }
  if (strDate >= 0 && strDate <= 9) {
        strDate = '0' + strDate;
    }
  var currentdate = year + seperator1 + month + seperator1 + strDate;
  return currentdate;

}
