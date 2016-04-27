'use strict';

import superagent from 'superagent';
import charset from 'superagent-charset';
import cheerio from 'cheerio';
import escaper from 'true-html-escape';
import trimBody from 'trim-body';

export function *get(next) {
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
          //获取matchID
          let idAttr = $(this).attr('id');
          let matchID = idAttr.split('_')[2];
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
          singleMatch.match_id = matchID;
          results.push(singleMatch);
        });
        resolve(results);
      });
  });
}

export function *getOdds(id) {
  var url = 'http://www.okooo.com/soccer/match/' + id + '/odds/ajax/?page=0&companytype=BaijiaBooks';
  charset(superagent);
  console.log('_____' + id + '______')
  return new Promise(function(resolve, reject) {
    superagent
      .get(url)
      .end(function(err, res) {
        if (err) {
          reject(err);
        }
        var $ = cheerio.load(res.text, {decodeEntities: false});
        var trList = $('.fTrObj');
        //99家赔率
        var oddAll = [];
        var companies = ['99家平均', '威廉.希尔', '立博', 'Bet365', 'bwin', '澳门彩票', '伟德国际', '沙巴(IBCBET)'];
        var titles = ['company_name', 'initial_victory', 'initial_even', 'initial_lose', 'now_victory', 'now_even', 'now_lose'];
        trList.each(function(index, element) {
          var company_name = $(this).find('td').eq(1).text().trim()
          if (companies.indexOf(company_name) !== -1 ) {
            let tempArr = [];
            let company_odds = {};
            $(this).find('td').slice(1,8).each(function(index, element) {
              let trimmed = $(this).text().trim();
              company_odds[titles[index]] = trimmed;
            });

            oddAll.push(company_odds);
          }
        })
        resolve(oddAll);
      })
  })
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
