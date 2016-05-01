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
            if (titleArr[i] === 'analysis') {
              singleMatch.euro = '欧';
              singleMatch.analysis = '析';
            }
            if (titleArr[i] === 'odds') {
              let odd = tempArr[i];
              if (tempArr.length > 8) {
                let oddArr = odd.split('.');
                let first = oddArr[1];
                let second = oddArr[2];
                let win = oddArr[0] + '.' + first.substr(0, 2);
                let even = first.substr(2, 1) + '.' + second.substr(0, 2);
                let lose = second.substr(2, 1) + '.' + oddArr[3];
                singleMatch.win = win;
                singleMatch.even = even;
                singleMatch.lose = lose;
              } else {
                singleMatch.win = '暂无';
              }
            }
          }
          singleMatch.match_id = matchID;
          results.push(singleMatch);
        });
        resolve(results);
      });
  });
}

export function *getOdds(id) {
  //主流欧洲盘口
  var url = 'http://www.okooo.com/soccer/match/' + id + '/odds/ajax/?page=0&companytype=BaijiaBooks';
  //球队最近战绩
  var history = 'http://www.okooo.com/soccer/match/' + id + '/history/';
  var matchInfo = {};
  charset(superagent);
  return new Promise(function(resolve, reject) {
    superagent
      .get(url)
      .end(function(err, res) {
        if (err) {
          reject(err);
        }
        let $ = cheerio.load(res.text, {decodeEntities: false});
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
              if (index > 1) {
                trimmed = parseFloat(trimmed).toFixed(2);
              }
              company_odds[titles[index]] = trimmed;
            });
            oddAll.push(company_odds);
          }
        })
        //主客队最近十场战绩
        superagent
          .get(history)
          .charset('gbk')
          .end(function(err, res) {
            if (err) {
              reject(err);
            }
            let $ = cheerio.load(res.text, {decodeEntities: false});
            //主队最近十场比赛
            let homeTr = $('.homecomp').find('tr');
            let homeRecentMatch = getRecentTenMatches($, homeTr);
            //客队最近十场比赛
            let awayTr = $('.awaycomp').find('tr');
            let awayRecentMatch = getRecentTenMatches($, awayTr);
            //主客队名称
            let homeName = $('.qpai_zi').html();
            let awayName = $('.qpai_zi_1').html();
            matchInfo.home_recent = homeRecentMatch;
            matchInfo.away_recent = awayRecentMatch;
            matchInfo.odds = oddAll;
            resolve(matchInfo);

          })


      })
  });
}
function getRecentTenMatches($, trArr) {
  let titles = ['league', 'time', 'home', 'score', 'away', 'half_time', 'final'];
  let recentMatch = [];
  trArr.slice(3).each(function(index, el) {
    let singleMatch = {};
    $(this).find('td').each(function(index, el) {
      let trimmed = $(this).text().trim();
      if (trimmed === '球会友谊') {
        return false;
      }
      if (index < 6) {
        singleMatch[titles[index]] = trimmed;
      }
      if (index === 3) {
        let scoreArr = trimmed.split('-');
        let homeScore = parseInt(scoreArr[0]);
        let awayScore = parseInt(scoreArr[1]);
        if (homeScore > awayScore) {
          singleMatch.final = '胜';
        } else if (homeScore === awayScore) {
          singleMatch.final = '平';
        } else {
          singleMatch.final = '负';
        }
      }
    });
    if (singleMatch.league && recentMatch.length < 10) {
      recentMatch.push(singleMatch);
    }
  });
  return recentMatch;
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
